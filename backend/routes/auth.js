const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { logActivity } = require('../middleware/logger');

router.post('/login', authController.login);
router.get('/me', auth, authController.getCurrentUser);
router.post('/logout', auth, logActivity('logout', 'auth'), authController.logout);

module.exports = router;
