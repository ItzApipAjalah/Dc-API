const express = require('express');
const router = express.Router();
const { getServers, getServerDetails, getServerMembers } = require('../controllers/serverController');
const apiLimiter = require('../middleware/rateLimit');

// All server endpoints with rate limit
router.get('/api', apiLimiter, getServers);
router.get('/api/:id/detail', apiLimiter, getServerDetails);
router.get('/api/:id/members', apiLimiter, getServerMembers);

module.exports = router; 