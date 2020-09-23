const { validationResult } = require('express-validator');

const User = require('../models/user');

exports.getStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        return res.status(200).json({
            message: 'Status fetched successefully',
            status: user.status
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.putStatus = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    try {
        const { status } = req.body;
        const user = await User.findById(req.userId);
        user.status = status;
        await user.save();
        return res.status(200).json({
            message: 'Status changed successefully',
            status: status
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};
