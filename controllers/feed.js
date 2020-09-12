const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
    const { page } = req.query || 1;
    const perPage = 2;
    let totalItems = 0;
    Post.find().countDocuments().then(total => {
        totalItems = total;
        return Post.find().skip((page - 1) * perPage).limit(perPage);
    }).then(posts => {
        res.status(200).json({
            message: 'Posts fetched successefully',
            posts,
            totalItems
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed - Entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    const { title, content } = req.body;
    const imageUrl = req.file.path;

    let creator;

    const post = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId
    })
    post.save().then(result => {
        return User.findById(req.userId)
    }).then(user => {
        creator = user;
        user.posts.push(post);
        return user.save();
    }).then(result => {
        res.status(201).json({
            message: 'Post created successefully',
            post,
            creator: {
                _id: creator._id,
                name: creator.name
            }
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    });
}

exports.getPost = (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId).then(post => {
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }

        post.imageUrl = post.imageUrl.replace(/\\/g, "/");

        return res.status(200).json({
            message: 'Post fetched',
            post
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.putEditPost = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed - Entered data is incorrect');
        error.statusCode = 422;
        throw error;
    }

    const { postId } = req.params;
    const { title, content } = req.body;
    let { image } = req.body;

    if (req.file) {
        image = req.file.path;
    }

    if (!image) {
        const error = new Error('No file picked');
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId).then(post => {
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }

        if (image !== post.imageUrl) {
            clearImage(post.imageUrl);
        }

        post.title = title;
        post.imageUrl = image;
        post.content = content;
        return post.save();
    }).then(result => {
        res.status(200).json({
            message: 'Post updated successefully',
            post: result
        })
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
};

exports.deletePost = (req, res, next) => {
    const { postId } = req.params;
    Post.findById(postId).then(post => {
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not authorized');
            error.statusCode = 403;
            throw error;
        }
        clearImage(post.imageUrl);
        return Post.findByIdAndRemove(postId);
    }).then(() => {
        return User.findById(req.userId);
    }).then(user => {
        user.posts.pull(postId);
        return user.save();
    }).then(() => {
        res.json({
            message: 'Post deleted successefully'
        });
    }).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
}