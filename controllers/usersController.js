const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
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
      next();
    })
    .catch(() => res.render('404'));
};

exports.profilePostsScreen = function (req, res) {
  Post.findByAuthorId(req.profileUser._id, req.visitorId)
    .then((posts) => {
      console.log(posts);
      res.render('profile', {
        profileUsername: req.profileUser.username,
        profileAvatar: req.profileUser.avatar,
        posts: posts,
        isFollowing: req.isFollowing,
        isVisitorsProfile: req.isVisitorsProfile,
        counts: {
          followersCount: req.followersCount,
          followingCount: req.followingCount,
          postCount: req.postCount,
        },
      });
    })
    .catch(() => res.render('404'));
};
exports.profileFollowersScreen = async function (req, res) {
  try {
    let followers = await Follow.getFollowersById(req.profileUser._id);

    res.render('profile-followers', {
      followers,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        followersCount: req.followersCount,
        followingCount: req.followingCount,
        postCount: req.postCount,
      },
    });
  } catch {
    res.render('404');
  }
};

exports.profileFollowingScreen = async function (req, res) {
  try {
    let following = await Follow.getFollowingById(req.profileUser._id);

    res.render('profile-following', {
      following,
      profileUsername: req.profileUser.username,
      profileAvatar: req.profileUser.avatar,
      isFollowing: req.isFollowing,
      isVisitorsProfile: req.isVisitorsProfile,
      counts: {
        followersCount: req.followersCount,
        followingCount: req.followingCount,
        postCount: req.postCount,
      },
    });
  } catch {
    res.render('404');
  }
};

exports.mustBeLoggedIn = function (req, res, next) {
  if (req.session.user) {
    next();
  } else {
    req.flash('errors', 'You must be logged in to perform that action');
    req.session.save(() => res.redirect('/'));
  }
};

exports.sharedProfileData = async function (req, res, next) {
  let isFollowing = false;
  let isVisitorsProfile = false;
  if (req.session.user) {
    console.log(req.profileUser);
    isFollowing = await Follow.isVisitorFollowing(
      req.profileUser._id,
      req.visitorId
    );
    isVisitorsProfile = req.profileUser._id.equals(req.session.user._id);
  }

  req.isVisitorsProfile = isVisitorsProfile;
  req.isFollowing = isFollowing;
  let postCount = await Post.countPostByAuthor(req.profileUser._id);
  let followersCount = await Follow.countFollowersById(req.profileUser._id);
  let followingCount = await Follow.countFollowingById(req.profileUser._id);
  req.postCount = postCount;
  req.followersCount = followersCount;
  req.followingCount = followingCount;

  next();
};
