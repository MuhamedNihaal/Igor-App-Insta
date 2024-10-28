require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./database/db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const instagramWebhook = require('./middleware/instagram')
const app = express();


// middlewares
app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000", // assuming your React app runs on port 3000
    credentials: true,
}));

// routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/instagram', instagramWebhook);


// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


const port = process.env.PORT || 8080;

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server Listening on Port: ${port}...`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();