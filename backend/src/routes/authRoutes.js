const express = require('express');
const router = express.Router();
const { registerUser, loginUser, forgotPassword, updateUser, changePassword, deleteAccount } = require('../controllers/authController');

// Kullanıcı kayıt endpoint'i
router.post('/register', registerUser);

// Kullanıcı giriş endpoint'i
router.post('/login', loginUser);

// Şifremi unuttum endpoint'i
router.post('/forgot-password', forgotPassword);

// Kullanıcı güncelleme endpoint'i
router.put('/update', updateUser);

// Şifre değiştirme endpoint'i
router.put('/change-password', changePassword);

// Hesap silme endpoint'i
router.delete('/delete-account', deleteAccount);

module.exports = router;
