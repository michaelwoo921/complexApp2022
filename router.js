const express = require('express');
const userController = require('./controllers/usersController');
const postsController = require('./controllers/postsController');

const router = express.Router();

router.get('/', userController.home);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get('/profile/:username', function (req, res) {
  res.render('profile');
});

router.get('/create-post', postsController.viewCreateScreen);
router.post('/create-post', postsController.create);
router.get('/post/:id', postsController.viewSingle);

module.exports = router;
