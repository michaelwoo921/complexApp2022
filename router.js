const express = require('express');
const userController = require('./controllers/usersController');

const router = express.Router();

router.get('/create-post', function (req, res) {
  res.render('create-post');
});

router.get('/profile/:username', function (req, res) {
  res.render('profile');
});

router.get('/', userController.home);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

module.exports = router;
