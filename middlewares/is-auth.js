require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');

    const error = new Error('Unauthorized');
    error.statusCode = 401;

    if (!authHeader) {
        throw error;
    }

    const token = req.get('Authorization').split(' ')[1];
    let decodedToken;

    try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if (!decodedToken) {
        throw error;
    }

    req.userId = decodedToken.userId;
    next();
};