const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const router = require('./router');
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
  res.locals.user = req.session.user;
  res.locals.errors = req.flash('errors');
  next();
});

app.use('/', router);

app.get('/test', function (req, res) {
  res.send('test');
});

module.exports = app;
