var express = require('express');
var router = express.Router();
var Ads = require('../models/ad');
var User = require('../models/user');
var middleware = require('../middleware');



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

// DELETE PAGE
router.delete('/:id', middleware.checkProfile, function (req, res) {
  User.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      req.flash('error', 'Valami hiba történt. Próbálja újra.');
      res.redirect('/ads');
      console.log(err);
    } else {
      req.flash('success', 'Felhasználó törölve!');
      res.redirect('/ads');
    }
  })
});

module.exports = router;
