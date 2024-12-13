const express = require('express');
const router = express.Router();
const { getUserDetails, lookupUser } = require('../controllers/userController');
const verifyTurnstile = require('../middleware/recaptcha');

router.get('/:userid', verifyTurnstile, getUserDetails);
router.get('/lookup/:userid', verifyTurnstile, lookupUser);

module.exports = router; 