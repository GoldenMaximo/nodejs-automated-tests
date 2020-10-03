require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Post = require('../models/post');
const e = require('express');
const validator = require('validator').default;

module.exports = {
    createUser: async function ({ userInput }, req) {
        // stuff comes in as "args", e.g.:
        // const email = args.userInput.email;
        const errors = [];
        if (!validator.isEmail(userInput.email)) {
            errors.push({ message: 'E-mail is invalid' });
        }

        if (validator.isEmpty(userInput.password) ||
            !validator.isLength(userInput.password, { min: 5 })) {
            errors.push({ message: 'Password needs to be at least 5 characters long' });
        }

        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const existingUser = await User.findOne({ email: userInput.email });

        if (existingUser) {
            const error = new Error('User already exists!');
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12);

        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPassword
        });

        const createdUser = await user.save();

        return {
            ...createdUser._doc,
            _id: createdUser._id.toString()
        }
    },

    login: async function ({ email, password }, req) {
        const user = await User.findOne({ email });

        if (!user) {
            const error = new Error('User not found');
            error.code = 404;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);

        if (!isEqual) {
            const error = new Error('Password is incorrect');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign(
            {
                userId: user._id.toString(),
                email: user.email
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        return {
            token,
            userId: user._id.toString()
        }
    },

    createPost: async function ({ postInput: { title, content, imageUrl } }, req) {
        if (!req.isAuth) {
            const error = new Error('User is not authenticated');
            error.code = 401;
            throw error;
        }

        const errors = [];

        if (validator.isEmpty(title) ||
            !validator.isLength(title, { min: 2 })) {
            errors.push({ message: 'Title needs to be at least 2 characters long.' });
        };

        if (validator.isEmpty(content) ||
            !validator.isLength(content, { min: 2 })) {
            errors.push({ message: 'Title needs to be at least 2 characters long.' });
        };

        if (errors.length > 0) {
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);

        if (!user) {
            const error = new Error('Invalid user');
            error.code = 422;
            throw error;
        }

        const post = new Post({
            title,
            content,
            imageUrl,
            creator: user
        });


        const createdPost = await post.save();

        user.posts.push(createdPost);
        await user.save();

        return {
            ...createdPost._doc,
            _id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString(),
            creator: user
        };
    },

    posts: async function (args, req) {
        if (!req.isAuth) {
            const error = new Error('User is not authenticated');
            error.code = 401;
            throw error;
        }

        const totalPosts = await Post.find().countDocuments();

        const posts = await Post.find().sort({
            createdAt: -1
        }).populate('creator');

        return {
            posts: posts.map(e => {
                return {
                    ...e._doc,
                    id: e._id.toString(),
                    createdAt: e.createdAt.toISOString(),
                    updatedAt: e.updatedAt.toISOString()
                }
            }),
            totalPosts
        }
    }
};