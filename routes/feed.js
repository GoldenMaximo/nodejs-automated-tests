const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const feedControler = require('../controllers/feed');

router.get('/posts', feedControler.getPosts);

router.post('/post', [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
], feedControler.createPost);

module.exports = router;