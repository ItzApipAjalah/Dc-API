const express = require('express');
const router = express.Router();
const { getUserDetails, lookupUser } = require('../controllers/userController');

router.get('/:userid', getUserDetails);
router.get('/lookup/:userid', lookupUser);

module.exports = router; 