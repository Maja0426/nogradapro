var express = require('express');
var router = express.Router();
var Ads = require('../models/ad');
var User = require('../models/user');

// SHOW USERS ROUTE
router.get("/:id", function (req, res) {
  User.findById(req.params.id, function (err, foundUser) {
    if (err || !foundUser) {
      req.flash("error", "Nem található vagy törölt felhasználó");
      return res.redirect("/ads");
    }
    Ads.find().where("author.id").equals(foundUser._id).exec(function (err, ads) {
      if (err) {
        req.flash("error", "Nem található felhasználó");
        return res.redirect("/ads");
      }
      res.render("ads/showuser", {
        user: foundUser,
        ads: ads
      });
    });
  })
});

module.exports = router;
