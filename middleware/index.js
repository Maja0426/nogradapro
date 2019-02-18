var Ads = require('../models/ad');

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
        if (foundAd.author.id.equals(req.user._id)) {
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
  Content.find({}, function (err, allAds) {
    if (err || !allAds) {
      req.flash("error", "Nem találhatók hirdetések!");
      res.redirect("/ads");
    } else {
      allAd = allAds;
    }
    next();
  });
}

module.exports = middlewareObj;