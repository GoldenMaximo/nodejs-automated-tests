const express = require('express');
const router = express.Router();

const feedControler = require('../controllers/feed');

router.get('/posts', feedControler.getPosts);

module.exports = router;