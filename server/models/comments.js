const mongoose = require('mongoose');
const Joi = require('joi');

// Mongoose Schema
const commentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    receivedDate: {
        type: Date,
        default: Date.now
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other']
    },
    preferredLocation: {
        type: String,
        trim: true
    },
    sizeOfPlot: {
        type: String,
        trim: true
    },
    instagramUsername: {
        type: String,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
    mediaId: {
        type: String,
        required: true,
        trim: true
    },
    postUrl: {
        type: String,
        trim: true
    },
    reply: {
        type: String,
        trim: true
    },
    repliedAt: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pending', 'replied', 'archived'],
        default: 'pending'
    }
});

// Joi validation schema
const commentValidation = {
    create: Joi.object({
        fullName: Joi.string()
            .required()
            .min(2)
            .max(100)
            .messages({
                'string.empty': 'Full name is required',
                'string.min': 'Full name must be at least 2 characters long',
                'string.max': 'Full name cannot exceed 100 characters'
            }),
        
        phoneNumber: Joi.string()
            .pattern(/^[0-9+\-\s()]*$/)
            .allow('')
            .messages({
                'string.pattern.base': 'Please provide a valid phone number'
            }),
        
        receivedDate: Joi.date()
            .default(Date.now),
        
        gender: Joi.string()
            .valid('Male', 'Female', 'Other')
            .allow('')
            .messages({
                'any.only': 'Gender must be either Male, Female, or Other'
            }),
        
        preferredLocation: Joi.string()
            .max(200)
            .allow('')
            .messages({
                'string.max': 'Preferred location cannot exceed 200 characters'
            }),
        
        sizeOfPlot: Joi.string()
            .max(100)
            .allow('')
            .messages({
                'string.max': 'Size of plot cannot exceed 100 characters'
            }),
        
        instagramUsername: Joi.string()
            .required()
            .pattern(/^[a-zA-Z0-9._]{1,30}$/)
            .messages({
                'string.empty': 'Instagram username is required',
                'string.pattern.base': 'Please provide a valid Instagram username'
            }),
        
        comment: Joi.string()
            .required()
            .min(1)
            .max(1000)
            .messages({
                'string.empty': 'Comment is required',
                'string.min': 'Comment cannot be empty',
                'string.max': 'Comment cannot exceed 1000 characters'
            }),
        
        mediaId: Joi.string()
            .required()
            .messages({
                'string.empty': 'Media ID is required'
            }),
        
        postUrl: Joi.string()
            .uri()
            .allow('')
            .messages({
                'string.uri': 'Please provide a valid URL'
            }),
        
        reply: Joi.string()
            .allow('')
            .max(1000)
            .messages({
                'string.max': 'Reply cannot exceed 1000 characters'
            }),
        
        repliedAt: Joi.date()
            .allow(null),
        
        status: Joi.string()
            .valid('pending', 'replied', 'archived')
            .default('pending')
            .messages({
                'any.only': 'Status must be either pending, replied, or archived'
            })
    }),

    update: Joi.object({
        fullName: Joi.string()
            .min(2)
            .max(100),
        phoneNumber: Joi.string()
            .pattern(/^[0-9+\-\s()]*$/)
            .allow(''),
        gender: Joi.string()
            .valid('Male', 'Female', 'Other')
            .allow(''),
        preferredLocation: Joi.string()
            .max(200)
            .allow(''),
        sizeOfPlot: Joi.string()
            .max(100)
            .allow(''),
        instagramUsername: Joi.string()
            .pattern(/^[a-zA-Z0-9._]{1,30}$/),
        comment: Joi.string()
            .min(1)
            .max(1000),
        postUrl: Joi.string()
            .uri()
            .allow(''),
        reply: Joi.string()
            .allow('')
            .max(1000),
        repliedAt: Joi.date()
            .allow(null),
        status: Joi.string()
            .valid('pending', 'replied', 'archived')
    })
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = {
    Comment,
    commentValidation
};