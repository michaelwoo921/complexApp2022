const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const router = require('./router');
const markdown = require('marked');
const sanitizeHTML = require('sanitize-html');
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('views', 'views');
app.set('view engine', 'ejs');

const sessionOptions = session({
  secret: 'nevergiveup',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    client: require('./db'),
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
  },
});

app.use(sessionOptions);
app.use(flash());
app.use(function (req, res, next) {
  res.locals.filterUserHTML = function (content) {
    return sanitizeHTML(markdown.Parser(content), {
      allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'p',
        'br',
        'ul',
        'ol',
        'li',
        'strong',
        'bold',
        'i',
        'em',
      ],
      allowedAttributes: {},
    });
  };
  res.locals.user = req.session.user;
  res.locals.errors = req.flash('errors');
  res.locals.success = req.flash('success');
  if (req.session.user) {
    req.visitorId = req.session.user._id;
  } else {
    req.visitorId = 0;
  }
  next();
});

app.use('/', router);

app.get('/test', function (req, res) {
  res.render('create-post');
});

module.exports = app;
