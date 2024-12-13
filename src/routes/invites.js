const express = require('express');
const router = express.Router();
const { getInviteInfo } = require('../controllers/inviteController');
const apiLimiter = require('../middleware/rateLimit');

// API endpoint (rate limited)
router.get('/api/:code', apiLimiter, getInviteInfo);

// Web endpoint (captcha protected)
router.get('/web/:code', getInviteInfo);

module.exports = router; 