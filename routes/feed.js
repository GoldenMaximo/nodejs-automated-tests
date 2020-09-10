const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const isAuth = require('../middlewares/is-auth');

const feedControler = require('../controllers/feed');

router.get('/posts', isAuth, feedControler.getPosts);

router.post('/post', isAuth, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
], feedControler.createPost);

router.get('/post/:postId', isAuth, feedControler.getPost);

router.put('/post/:postId', isAuth, [
    body('title').trim().isLength({ min: 5 }),
    body('content').trim().isLength({ min: 5 }),
], feedControler.putEditPost);

router.delete('/post/:postId', isAuth, feedControler.deletePost);

module.exports = router;