const express = require('express');
const router = express.Router();
const { monitorUser } = require('../controllers/monitorController');

router.get('/status', monitorUser);

module.exports = router; 