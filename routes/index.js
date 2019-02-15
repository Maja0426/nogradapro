var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get('/', function (req, res) {
  res.redirect('/ads');
});


// AUTHORIZATION
router.get('/login', function (req, res) {
  res.render('login');
});

// login logic
router.post('/login', passport.authenticate('local', {
  successRedirect: '/ads',
  failureRedirect: '/login'
}), function (req, res) {});

router.get('/register', function (req, res) {
  res.render('register');
});

// handling sign up form
router.post('/register', function (req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email
  });
  User.register(newUser, req.body.password, function (err, regUser) {
    if (err) {
      console.log(err);
      return res.render('register');
    }
    passport.authenticate('local')(req, res, function () {
      res.redirect('/ads');
    });
  });
});

router.get('/logout', function (req, res) {
  req.logout();
  req.flash('success', 'Sikeresen kijelentkezett!');
  res.redirect('/ads');
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = router;