const router = require('express').Router();
const { IgApiClient } = require('instagram-private-api');
const ig = new IgApiClient();
require('dotenv').config();

// Store Instagram credentials in .env file
const IG_USERNAME = process.env.IG_USERNAME;
const IG_PASSWORD = process.env.IG_PASSWORD;

// Initialize Instagram client
let igClient = null;
async function initializeInstagram() {
    try {
        await ig.state.generateDevice(IG_USERNAME);
        await ig.account.login(IG_USERNAME, IG_PASSWORD);
        igClient = ig;
        console.log('Instagram client initialized');
    } catch (error) {
        console.error('Error initializing Instagram client:', error);
    }
}

initializeInstagram();

// Get all comments
router.get('/', async (req, res) => {
    try {
        // Fetch comments from your database
        const comments = await Comment.find().sort({ receivedDate: -1 });
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Get single comment
router.get('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comment' });
    }
});

module.exports = router;