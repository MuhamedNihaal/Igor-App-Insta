const express = require('express');
const router = express.Router();
const { Comment, commentValidation } = require('../models/comments');
const { IgApiClient } = require('instagram-private-api');
const ig = new IgApiClient();
require('dotenv').config();

// Instagram API credentials
const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
const INSTAGRAM_VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN;

// Enhanced middleware to validate webhook requests
const validateWebhookRequest = (req, res, next) => {
    // For GET requests (webhook verification)
    if (req.method === 'GET') {
        const mode = req.query['hub.mode'];
        const token = req.query['hub.verify_token'];
        const challenge = req.query['hub.challenge'];

        if (!mode || !token || !challenge) {
            return res.status(400).json({ 
                error: 'Missing required verification parameters',
                required: ['hub.mode', 'hub.verify_token', 'hub.challenge']
            });
        }
        return next();
    }

    // For POST requests (webhook events)
    if (req.method === 'POST') {
        // Check basic request structure
        if (!req.body || typeof req.body !== 'object') {
            return res.status(400).json({ 
                error: 'Invalid request body',
                details: 'Request body must be a valid JSON object'
            });
        }

        // Validate entry array exists and is not empty
        if (!req.body.entry || !Array.isArray(req.body.entry) || req.body.entry.length === 0) {
            return res.status(400).json({ 
                error: 'Invalid webhook payload',
                details: 'Request must contain a non-empty entry array'
            });
        }

        // Validate entry structure
        const invalidEntries = req.body.entry.filter(entry => {
            return !entry.changes || !Array.isArray(entry.changes) || entry.changes.length === 0;
        });

        if (invalidEntries.length > 0) {
            return res.status(400).json({ 
                error: 'Invalid entry structure',
                details: 'Each entry must contain a non-empty changes array'
            });
        }

        // Additional validation for change objects
        const validChangeTypes = ['comments']; // Add other valid types if needed
        const invalidChanges = req.body.entry.some(entry => 
            entry.changes.some(change => 
                !change.value || !change.value.comment_id || !validChangeTypes.includes(change.field)
            )
        );

        if (invalidChanges) {
            return res.status(400).json({ 
                error: 'Invalid change object',
                details: 'Each change must contain a valid value object with comment_id and valid field type'
            });
        }

        return next();
    }

    // For any other HTTP methods
    return res.status(405).json({ 
        error: 'Method not allowed',
        details: 'Only GET and POST methods are supported'
    });
};

// Apply validation middleware to webhook route
router.use('/webhook', validateWebhookRequest);

// Verify webhook subscription
router.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === INSTAGRAM_VERIFY_TOKEN) {
            console.log('Webhook verified');
            res.status(200).send(challenge);
        } else {
            res.status(403).json({ error: 'Invalid verification token' });
        }
    } else {
        res.status(400).json({ error: 'Missing required parameters' });
    }
});

// Handle incoming webhook events
router.post('/webhook', validateWebhookRequest, async (req, res) => {
    try {
        const { entry } = req.body;
        const processedComments = [];
        const errors = [];

        for (const e of entry) {
            if (e.changes) {
                for (const change of e.changes) {
                    if (change.value.comment_id) {
                        try {
                            // Fetch complete comment data using Instagram API
                            const commentData = await fetchCommentData(change.value.comment_id);
                            
                            // Prepare comment data according to our schema
                            const commentPayload = {
                                instagramUsername: extractInstagramUsername(commentData.username),
                                comment: commentData.text,
                                mediaId: change.value.media_id,
                                fullName: commentData.from?.full_name || commentData.username,
                                receivedDate: new Date(commentData.timestamp),
                                status: 'pending',
                                postUrl: `https://www.instagram.com/p/${change.value.media_id}`,
                            };

                            // Validate comment data
                            await commentValidation.create.validateAsync(commentPayload);

                            // Create and save new comment
                            const newComment = new Comment(commentPayload);
                            const savedComment = await newComment.save();
                            processedComments.push(savedComment);

                        } catch (error) {
                            console.error('Error processing comment:', error);
                            errors.push({
                                commentId: change.value.comment_id,
                                error: error.message
                            });
                        }
                    }
                }
            }
        }

        // Send response based on processing results
        if (errors.length > 0) {
            // If some comments failed but others succeeded
            if (processedComments.length > 0) {
                res.status(207).json({
                    success: processedComments,
                    errors: errors
                });
            } else {
                // If all comments failed
                res.status(422).json({ errors });
            }
        } else {
            // If all comments processed successfully
            res.status(200).json({
                message: 'All comments processed successfully',
                count: processedComments.length
            });
        }

    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Helper function to fetch complete comment data
async function fetchCommentData(commentId) {
    try {
        // Configure Instagram API client
        ig.state.generateDevice(process.env.INSTAGRAM_USERNAME);
        await ig.account.login(process.env.INSTAGRAM_USERNAME, process.env.INSTAGRAM_PASSWORD);
        
        const comment = await ig.media.comment(commentId);
        return comment;
    } catch (error) {
        console.error('Error fetching comment data:', error);
        throw new Error(`Failed to fetch comment data: ${error.message}`);
    }
}

// Helper function to extract and validate Instagram username
function extractInstagramUsername(username) {
    // Remove @ if present and any whitespace
    const cleanUsername = username.replace('@', '').trim();
    
    // Basic validation for Instagram username
    if (!/^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername)) {
        throw new Error('Invalid Instagram username format');
    }
    
    return cleanUsername;
}

module.exports = router;