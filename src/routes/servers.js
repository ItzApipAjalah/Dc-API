const express = require('express');
const router = express.Router();
const { getServers, getServerDetails, getServerMembers } = require('../controllers/serverController');

router.get('/', getServers);
router.get('/:id/detail', getServerDetails);
router.get('/:id/members', getServerMembers);

module.exports = router; 