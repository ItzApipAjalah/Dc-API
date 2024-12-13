const express = require('express');
const router = express.Router();
const { getInviteInfo } = require('../controllers/inviteController');
const apiLimiter = require('../middleware/rateLimit');

router.get('/api/:code', apiLimiter, getInviteInfo);

module.exports = router; 