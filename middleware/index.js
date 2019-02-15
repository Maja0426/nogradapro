var Ads = require('../models/ad');

var middlewareObj = {};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

middlewareObj.checkUser = function (req, res, next) {
  if (req.isAuthenticated()) {
    Ads.findById(req.params.id, function (err, foundAd) {
      if (err) {
        res.redirect('back');
        console.log(err);
      } else {
        if (foundAd.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect('back');
        }
      }
    });
  } else {
    res.redirect('back');
  }
};

module.exports = middlewareObj;