const { validationResult } = require('express-validator');

const Post = require('../models/post');

exports.getPosts = (req, res, next) => {
    // TODO: get db posts here
    res.status(200).json({
        posts: [{
            _id: '32132123',
            title: 'First post',
             content: 'Something something',
              imageUrl: 'images/screenshot.png',
              creator: {
                  name: 'Tom'
              },
              createdAt: new Date()
        }]
    })
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed - Entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    const { title, content } = req.body;
    const post = new Post({
        title,
        content,
        imageUrl: 'images/screenshot.png',
        creator: {
            name: 'Some name'
        }
    })
    post.save().then(result => {
        console.log(result);
        res.status(201).json({
            message: 'Post created successefully',
            post: result
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}