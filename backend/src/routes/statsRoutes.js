const express = require('express');
const router = express.Router();
const { getStats, getUsers } = require('../controllers/statsController');
const { auth, admin, authority } = require('../middleware/auth');

router.get('/stats', auth, admin, getStats);
router.get('/users', auth, admin, getUsers);

module.exports = router;