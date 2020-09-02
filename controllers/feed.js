const { validationResult } = require('express-validator');

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
        return res.status(402).json({
            message: 'Validation failed - Entered data is incorrect',
            errors: errors.array()
        })
    }
    const { title, content } = req.body;
    // TODO: create post in db here
    res.status(201).json({
        message: 'Post created successefully',
        post: {
            _id: new Date().toISOString(),
            title,
            content,
            creator: {
                name: 'Some name'
            },
            createdAt: new Date()
        }
    });
}