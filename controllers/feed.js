const fs = require('fs');
const path = require('path');
const io = require('../socket');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const { page } = req.query || 1;
    const perPage = 2;
    try {
        const totalItems = await Post.find().countDocuments();
        const posts = await Post.find().sort({ createdAt: -1 }).populate('creator').skip((page - 1) * perPage).limit(perPage);

        return res.status(200).json({
            message: 'Posts fetched successefully',
            posts,
            totalItems
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.createPost = async (req, res, next) => {
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

    const post = new Post({
        title,
        content,
        imageUrl,
        creator: req.userId
    });

    try {
        await post.save();

        const user = await User.findById(req.userId);
        user.posts.push(post);
        await user.save();

        // emit sends it to all clients
        // broadcast sends it to all except the client that called it
        io.getIO().emit('posts', {
            action: 'create',
            post: {
                ...post._doc,
                creator: {
                    _id: req.userId,
                    name: user.name
                }
            }
        });

        return res.status(201).json({
            message: 'Post created successefully',
            post,
            creator: {
                _id: user._id,
                name: user.name
            }
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.getPost = async (req, res, next) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId);
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }

        post.imageUrl = post.imageUrl.replace(/\\/g, "/");

        return res.status(200).json({
            message: 'Post fetched',
            post
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.putEditPost = async (req, res, next) => {
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

    try {
        const post = await Post.findById(postId).populate('creator');
        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error;
        }

        if (post.creator._id.toString() !== req.userId) {
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
        const updatedPost = await post.save();

        io.getIO().emit('posts', {
            action: 'update',
            post: updatedPost
        })

        return res.status(200).json({
            message: 'Post updated successefully',
            post: updatedPost
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

exports.deletePost = async (req, res, next) => {
    const { postId } = req.params;
    try {
        const post = await Post.findById(postId);
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
        await Post.findByIdAndRemove(postId);
        const user = await User.findById(req.userId);
        user.posts.pull(postId);
        await user.save();

        return res.json({
            message: 'Post deleted successefully'
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };
};

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};