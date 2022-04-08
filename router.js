const express = require('express');
const usersController = require('./controllers/usersController');
const postsController = require('./controllers/postsController');
const followsController = require('./controllers/followsController');

const router = express.Router();

router.get('/', usersController.home);
router.post('/register', usersController.register);
router.post('/login', usersController.login);
router.post('/logout', usersController.logout);

router.get(
  '/profile/:username',
  usersController.ifUserExists,
  usersController.sharedProfileData,
  usersController.profilePostsScreen
);

router.get(
  '/profile/:username/followers',
  usersController.ifUserExists,
  usersController.sharedProfileData,
  usersController.profileFollowersScreen
);

router.get(
  '/profile/:username/following',
  usersController.ifUserExists,
  usersController.sharedProfileData,
  usersController.profileFollowingScreen
);

router.get(
  '/create-post',
  usersController.mustBeLoggedIn,
  postsController.viewCreateScreen
);
router.post(
  '/create-post',
  usersController.mustBeLoggedIn,
  postsController.create
);
router.get('/post/:id', postsController.viewSingle);

router.get(
  '/post/:id/edit',
  usersController.mustBeLoggedIn,
  postsController.viewEditScreen
);

router.post(
  '/post/:id/edit',
  usersController.mustBeLoggedIn,
  postsController.edit
);
router.post(
  '/post/:id/delete',
  usersController.mustBeLoggedIn,
  postsController.delete
);

router.post(
  '/addFollow/:username',
  usersController.mustBeLoggedIn,
  followsController.addFollow
);

router.post(
  '/removeFollow/:username',
  usersController.mustBeLoggedIn,
  followsController.removeFollow
);

module.exports = router;
