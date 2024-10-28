const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// require('dotenv').config();

const connectDB = async () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    
    try {
        console.log('Attempting database connection...');
        console.log('DB string value:', process.env.DB);
        
        if (!process.env.DB) {
            throw new Error('MongoDB connection string is not defined in environment variables');
        }
        
        await mongoose.connect(process.env.DB, connectionParams);
        console.log("Connected to Database Successfully");
    } catch (error) {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;