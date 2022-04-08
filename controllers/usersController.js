const User = require('../models/User');
const Post = require('../models/Post');
exports.register = function (req, res) {
  const user = new User(req.body);
  user
    .register()
    .then(() => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id,
      };
      req.session.save(() => res.redirect('/'));
    })
    .catch((regErrors) => {
      regErrors.forEach(function (message) {
        req.flash('regErrors', message);
      });
      req.session.save(() => res.redirect('/'));
    });
};

exports.login = function (req, res) {
  const user = new User(req.body);
  user
    .login()
    .then((result) => {
      req.session.user = {
        username: user.data.username,
        avatar: user.avatar,
        _id: user.data._id,
      };
      req.session.save(() => res.redirect('/'));
    })
    .catch((errors) => {
      req.flash('errors', errors);
      req.session.save(() => res.redirect('/'));
    });
};

exports.logout = function (req, res) {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

exports.home = function (req, res) {
  if (req.session.user) {
    res.render('home-dashboard');
  } else {
    res.render('home-guest', { regErrors: req.flash('regErrors') });
  }
};

exports.ifUserExists = function (req, res, next) {
  User.findByUsername(req.params.username)
    .then((userDoc) => {
      req.profileUser = userDoc;
      console.log(userDoc);
      next();
    })
    .catch(() => res.render('404'));
};

exports.profilePostsScreen = function (req, res) {
  Post.findByAuthorId(req.profileUser._id)
    .then((posts) => {
      console.log(posts);
      res.render('profile', {
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        posts: posts,
      });
    })
    .catch(() => res.render('404'));
};
