// Create web server
// npm install express
// npm install body-parser
// npm install mongoose
// npm install mongoose-unique-validator
// npm install cors
// npm install dotenv
// npm install morgan
// npm install nodemon
// npm install jsonwebtoken
// npm install bcrypt
// npm install express-async-handler

// Import the express module
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const asyncHandler = require('express-async-handler');

// Import the model
const Comment = require('./models/comment');

// Load environment variables
dotenv.config();

// Create the express application
const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the database
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// Check if the connection is successful
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Successfully connected to the database');
});

// Middleware to verify the token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        return res.status(401).send('Invalid token');
    }
    return next();
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post('/api/comments', verifyToken, asyncHandler(async (req, res) => {
    const comment = new Comment({
        text: req.body.text,
        user: req.user.id
    });
    const savedComment = await comment.save();
    res.json(savedComment);
}));

app.get('/api/comments', verifyToken