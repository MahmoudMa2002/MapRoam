const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');
const { storeReturnTo } = require('../middleware');
const users = require('../controllers/users');

router.get('/register', users.renderRegister);

// Handle user registration, async errors caught
router.post('/register', catchAsync(users.register));

router.get('/login', users.renderLogin);

// Handle login with Passport's local strategy, save returnTo URL in session for redirect after login
router.post('/login',
    storeReturnTo,
    passport.authenticate('local', {
        failureFlash: true,
        failureRedirect: '/login'
    }),
    users.login
);

// Handle logout
router.get('/logout', users.logout);

module.exports = router;
