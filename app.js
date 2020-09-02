require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const feedRoutes = require('./routes/feed');
const path = require('path');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygqkk.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`

const app = express();

app.use(bodyParser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/feed', feedRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const statusCode = error.statusCode || 500;
    const message = error.message;
    return res.status(statusCode).json({ message });
})

mongoose.connect(MONGODB_URI).then(result => {
    app.listen('8080');
}).catch(err => console.log('ATLAS CONNECTION ERROR: ', err));