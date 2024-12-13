const express = require('express');
const router = express.Router();
const { getUserDetails, lookupUser } = require('../controllers/userController');
const verifyTurnstile = require('../middleware/recaptcha');
const apiLimiter = require('../middleware/rateLimit');

// Web interface routes (with captcha)
router.get('/web/:userid', verifyTurnstile, getUserDetails);
router.get('/web/lookup/:userid', verifyTurnstile, lookupUser);

// API routes (with rate limit)
router.get('/api/:userid', apiLimiter, getUserDetails);
router.get('/api/lookup/:userid', apiLimiter, lookupUser);

module.exports = router; 