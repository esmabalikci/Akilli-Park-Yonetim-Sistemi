const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, updateUser, changePassword, deleteAccount } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);

router.put('/update', authenticate, updateUser);
router.put('/change-password', authenticate, changePassword);
router.delete('/delete-account', authenticate, deleteAccount);

module.exports = router;
