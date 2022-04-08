const Post = require('../models/Post');
exports.viewCreateScreen = function (req, res) {
  res.render('create-post');
};

exports.create = function (req, res) {
  const post = new Post(req.body, req.session.user._id);
  post
    .create()
    .then((postid) => {
      req.flash('success', 'Post successfully created');
      req.session.save(() => res.redirect(`/post/${postid}`));
    })
    .catch((errors) => {
      errors.forEach((error) => req.flash('errors', error));
      req.session.save(() => res.redirect('/create-post'));
    });
};

exports.viewSingle = async function (req, res) {
  try {
    let post = await Post.findSingleById(req.params.id, req.visitorId);
    res.render('single-post-screen', { post });
  } catch {
    res.render('404');
  }
};
