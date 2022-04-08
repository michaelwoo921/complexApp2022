const express = require('express');
const userController = require('./controllers/usersController');
const postsController = require('./controllers/postsController');
const followsController = require('./controllers/followsController');

const router = express.Router();

router.get('/', userController.home);
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/logout', userController.logout);

router.get(
  '/profile/:username',
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.profilePostsScreen
);

router.get(
  '/profile/:username/followers',
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.profileFollowersScreen
);

router.get(
  '/profile/:username/following',
  userController.ifUserExists,
  userController.sharedProfileData,
  userController.profileFollowingScreen
);

router.get('/create-post', postsController.viewCreateScreen);
router.post('/create-post', postsController.create);
router.get('/post/:id', postsController.viewSingle);

router.post(
  '/addFollow/:username',
  userController.mustBeLoggedIn,
  followsController.addFollow
);

router.post(
  '/removeFollow/:username',
  userController.mustBeLoggedIn,
  followsController.removeFollow
);

module.exports = router;
