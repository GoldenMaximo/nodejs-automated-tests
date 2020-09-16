const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getStatus = (req, res, next) => {
    User.findById(req.userId).then(user => {
        return res.status(200).json({
            message: 'Status fetched successefully',
            status: user.status
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.putStatus = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const { status } = req.body;
    User.findById(req.userId).then(user => {
        user.status = status;
        return user.save();
    }).then(() => {
        return res.status(200).json({
            message: 'Status changed successefully',
            status: status
        });
    });
};
