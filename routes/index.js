var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');

router.get('/', function (req, res) {
  res.redirect('/ads');
});


// AUTHORIZATION

// Login
router.get('/login', function (req, res) {
  res.render('login');
});

// login logic
router.post('/login', passport.authenticate('local', {
  successRedirect: '/ads',
  failureRedirect: '/login',
  failureFlash: true,
  successFlash: 'Sikeres bejelentkezés!'
}), function (req, res) {});


// Register
router.get('/register', function (req, res) {
  res.render('register');
});

// handling sign up form
router.post('/register', function (req, res) {
  if (req.body.password === req.body.samePassword) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email
  });
  User.register(newUser, req.body.password, function (err, regUser) {
    if (err) {
      req.flash('error', err.message);
      console.log(err.message);
      res.redirect('/register');
    } else {
    passport.authenticate('local')(req, res, function () {
      req.flash('success', 'Üdvözlet a Nógrád Aprón ' + regUser.username + '.');
      res.redirect('/ads');
    });
  }
  });
} else {
  req.flash('error', 'A két jelszó nem egyezik!');
  res.redirect('/register');
}
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