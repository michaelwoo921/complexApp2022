const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.static('public'));
app.set('views', 'views');
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('home-guest');

  // res.render('home-dashboard');
  // res.render('404');
});

app.get('/create-post', function (req, res) {
  res.render('create-post');
});

app.get('/profile/:username', function (req, res) {
  res.render('profile');
});
app.get('/test', function (req, res) {
  // res.render('404');
  // res.render('create-post');
  // res.render('home-dashboard');
  // res.render('home-guest');
  // res.render('profile');
  res.render('single-post-screen');
});

const port = process.env.PORT || 3000;
app.listen(port);
