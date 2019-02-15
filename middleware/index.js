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
      if (err) {
        req.flash('error', 'HIba történt. Nem található a hirdetés.');
        res.redirect('back');
      } else {
        if (foundAd.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash('error', 'Ehhez a művelethez Önnek nincs jogosultsága.');
          res.redirect('back');
        }
      }
    });
  } else {
    req.flash('error', 'Ehhez a művelethez előbb be kell jelentkezni.');
    res.redirect('back');
  }
};

module.exports = middlewareObj;