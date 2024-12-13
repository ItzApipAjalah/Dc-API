const express = require('express');
const router = express.Router();
const path = require('path');
const helpers = require('../utils/helpers');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
});

// Add route to serve helper functions
router.get('/utils/helpers.js', (req, res) => {
    res.type('application/javascript').send(`
        window.getStatusIcon = ${helpers.getStatusIcon.toString()};
        window.getActivityTypeIcon = ${helpers.getActivityTypeIcon.toString()};
    `);
});

// Add this route
router.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/docs.html'));
});

// Add this route
router.get('/server', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public/server.html'));
});

module.exports = router; 