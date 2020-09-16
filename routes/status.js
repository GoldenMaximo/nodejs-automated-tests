const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const isAuth = require('../middlewares/is-auth');

const statusControler = require('../controllers/status');

router.get('/status', isAuth, statusControler.getStatus);

router.put('/status', isAuth, [
    body('status')
        .trim()
        .isLength({
            min: 1,
            max: 20
        })
        .withMessage('The status must contain between 1 and 20 characters')
], statusControler.putStatus);

module.exports = router;
