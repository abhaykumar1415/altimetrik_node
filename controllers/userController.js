const express = require('express');
const userService = require('../services/ userService');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Public routes
router.post('/signup', userService.signup);
router.post('/login', userService.login);

// Protected routes
router.get('/', authMiddleware, userService.getAllUsers);
router.put('/:id', authMiddleware, userService.updateUser);

module.exports = router;
