const express = require('express');
const router = express.Router();
const { getUserDetails, lookupUser, searchByUsername } = require('../controllers/userController');
const verifyTurnstile = require('../middleware/recaptcha');
const apiLimiter = require('../middleware/rateLimit');

// Web interface routes (with captcha)
router.get('/web/:userid', verifyTurnstile, getUserDetails);
router.get('/web/lookup/:userid', verifyTurnstile, lookupUser);
router.get('/web/search/:username', verifyTurnstile, searchByUsername);

// API routes (with rate limit)
router.get('/api/:userid', apiLimiter, getUserDetails);
router.get('/api/lookup/:userid', apiLimiter, lookupUser);
router.get('/api/search/:username', apiLimiter, searchByUsername);

module.exports = router; 