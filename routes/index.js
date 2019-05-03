var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../models/user');
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

router.get('/', function (req, res) {
  res.render('landing');
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
}), function (req, res) {
});


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
  if (req.body.username === 'Admin') {
    newUser.isAdmin = true;
  };
  User.register(newUser, req.body.password, function (err, regUser) {
    if (err) {
      req.flash('error', err.message);
      console.log(err.message);
      res.redirect('/register');
    } else {
      // var smtpTransport = nodemailer.createTransport({
      //   host: "mail.nethely.hu",
      //   port: 465,
      //   secure: true,
      //   auth: {
      //     user: "nogradapro@smartbeeweb.hu",
      //     pass: "Zsombor2104"
      //   },
      //   tls: {
      //     rejectUnauthorized: false
      //   }
      // });
      // // send mail with defined transport object
      // var mailOptions = {
      //   to: 'develop.tmsmajoros@google.com',
      //   from: smtpTransport.host,
      //   subject: 'Új regisztráció a Nógrád Aprón!',
      //   text: 'Az oldalon új regisztráció történt.\n\n' + 'Felhasználónév: ' + regUser.username + '\n\n' +
      //     'Email cím: ' + regUser.email + '.'
      // };
      // smtpTransport.sendMail(mailOptions, function(err) {
      //   if (err) {
      //     return console.log(error);
      //   }
      //   console.log('Újabb regisztráció!');
      // });
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

// FORGOT PASSWORD

router.get("/forgot", function(req, res){
  res.render("forgot");
});

router.post('/forgot', function (req, res, next) {
  async.waterfall([
    function (done) {
      crypto.randomBytes(20, function (err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({
        email: req.body.email
      }, function (err, user) {
        if (!user) {
          req.flash('error', 'Ehhez az email címhez nem tartozik felhasználó.');
          return res.redirect('/forgot');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        user.save(function (err) {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: "mail.nethely.hu",
          port: 465,
          secure: true,
          auth: {
            user: "nogradapro@smartbeeweb.hu",
            pass: "Zsombor2104"
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'nogradapro@smartbeeweb.hu',
        subject: 'Nógrád Apró jelszóvisszaállítás',
        text: 'Azért kaptad ezt a levelet mert a Nógrád Apró oldalon jelezted, hogy elfelejtetted a felhasználói jelszavad.\n\n' +
          'Lentebb látható a megadott emailcímhez tartozó jelszócsere link. Az alábbi linkre kattintva egy órán belül látogasd meg az oldalt és add meg az új jelszavad:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'Amennyiben jelszavad nem kívánod megváltoztatni, akkor hagyd figyelmen kívül ezt a levelet, és a jelszó változatlan marad.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        console.log('levél elküldve');
        req.flash('success', 'Email került elküldésre a(z) ' + user.email + ' címre, a szükséges utasításokkal.');
        done(err, 'done');
      });
    }
  ], function (err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

router.get('/reset/:token', function (req, res) {
  User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: {
      $gt: Date.now()
    }
  }, function (err, user) {
    if (!user) {
      req.flash('error', 'A jelszóvisszaállító kulcs nem érvényes vagy lejárt.');
      return res.redirect('/forgot');
    }
    res.render('reset', {
      token: req.params.token
    });
  });
});

router.post('/reset/:token', function (req, res) {
  async.waterfall([
    function (done) {
      User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {
          $gt: Date.now()
        }
      }, function (err, user) {
        if (!user) {
          req.flash('error', 'A jelszóvisszaállító kulcs nem érvényes vagy lejárt.');
          return res.redirect('back');
        }
        if (req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function (err) {
              req.logIn(user, function (err) {
                done(err, user);
              });
            });
          })
        } else {
          req.flash("error", "A jelszó nem egyezik.");
          return res.redirect('back');
        }
      });
    },
    function (user, done) {
      var smtpTransport = nodemailer.createTransport({
        host: "mail.nethely.hu",
          port: 465,
          secure: true,
          auth: {
            user: "nogradapro@smartbeeweb.hu",
            pass: "Zsombor2104"
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'nogradapro@smartbeeweb.hu',
        subject: 'Nógrád Apró jelszóváltoztatás',
        text: 'Szia,\n\n' +
          'Ez egy megerősítő levél arról, hogy a(z) ' + user.email + ' emailcímhez tartozó jelszavad megváltoztatásra került.\n'
      };
      smtpTransport.sendMail(mailOptions, function (err) {
        req.flash('success', 'Rendben! A jelszó megváltoztatása sikeres volt.');
        done(err);
      });
    }
  ], function (err) {
    res.redirect("/ads");
  });
});

module.exports = router;
