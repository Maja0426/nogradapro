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
      req.flash('success', 'Üdvözlet a bgyapro-n ' + regUser.username + '.');
      res.redirect('/ads');
    });
  }
  });
});

// router.get('/auth/facebook', passport.authenticate('facebook', {
//   scope: ['email']
// }));

// router.get('/auth/facebook/callback',
//   passport.authenticate('facebook', {
//     successRedirect: '/ads',
//     failureRedirect: '/'
//   }));


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