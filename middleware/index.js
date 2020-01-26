var Ads = require('../models/ad');
var User = require('../models/user');

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'Ehhez a művelethez előbb be kell jelentkezni.');
  res.redirect('/login');
};

middlewareObj.checkUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    Ads.findById(req.params.id, function (err, foundAd) {
      if (err || !foundAd) {
        req.flash('error', 'Hiba történt. Nem található a hirdetés.');
        res.redirect('/ads');
      } else {
        if (foundAd.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash('error', 'Ehhez a művelethez Önnek nincs jogosultsága.');
          res.redirect('/ads');
        }
      }
    });
  } else {
    req.flash('error', 'Ehhez a művelethez előbb be kell jelentkezni.');
    res.redirect('/ads');
  }
};

middlewareObj.checkAllAds = function (req, res, next) {
  Ads.find({}, function (err, allAds) {
    if (err || !allAds) {
      req.flash("error", "Nem találhatók hirdetések!");
      res.redirect("/ads");
    } else {
      ads = allAds;
    }
    next();
  });
}

middlewareObj.checkAllUser = function (req, res, next) {
  User.find({}, function (err, allUsers) {
    if (err || !allUsers) {
      req.flash("error", "Nem találhatók felhasználók!");
      res.redirect("/ads");
    } else {
      users = allUsers;
    }
    next();
  });
}

middlewareObj.checkAdmin = function (req, res, next) {
  if (req.isAuthenticated() && req.user.username === 'Admin') {
    return next();
  }
  req.flash("error", "Ehhez a művelethez nincs jogosultságod!");
  res.redirect("/ads");
}

middlewareObj.checkProfile = function (req, res, next) {
  if (req.isAuthenticated() || isAdmin) {
    User.findById(req.params.id, function (err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "Felhasználó nem található!");
        res.redirect("back");
      } else {
        if (foundUser._id.equals(req.user._id) || req.user.username === "Admin") {
          next();
        } else {
          req.flash("error", "Nem rendelkezel engedéllyel ehhez a művelethez!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Kérlek előbb lépj be!");
    res.redirect("back");
  }
}

module.exports = middlewareObj;