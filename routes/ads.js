var express = require('express');
var router = express.Router();
var Ads = require('../models/ad');
var middleware = require('../middleware');

// INDEX PAGE, LIST ALL ADS
router.get('/', function (req, res) {
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Ads.find({title: regex}, function (err, allAds) {
      if (err) {
        console.log(err);
      } else {
        res.render('ads/index', {
          ads: allAds
        });
      }
    })
  } else {
    Ads.find({}, function (err, allAds) {
      if (err) {
        console.log(err);
      } else {
        res.render('ads/index', {
          ads: allAds
        });
      }
    })
  }
});

// NEW ADS PAGE - ADDED NEW AD
router.get('/new', middleware.isLoggedIn, function (req, res) {
  res.render('ads/new');
});

// CREATE NEW ADS
router.post('/', middleware.isLoggedIn, function (req, res) {
  var phone = req.body.ads.phone;
  var image = req.body.ads.image;
  var title = req.body.ads.title;
  var mainCategory = req.body.ads.mainCategory;
  var category = req.body.ads.category;
  var price = req.body.ads.price;
  var description = req.body.ads.description;
  var city = req.body.ads.city;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newAd = {
    phone: phone,
    image: image,
    title: title,
    mainCategory: mainCategory,
    category: category,
    price: price,
    description: description,
    city: city,
    author: author
  }
  Ads.create(newAd, function (err, createdAds) {
    if (err) {
      req.flash('error', 'Valami hiba történt. Próbálja újra.');
      res.redirect('ads');
    } else {
      req.flash('success', 'Az Ön új hirdetése kész!');
      res.redirect('/ads');
    }
  })
});

// SHOW PAGE - SHOW THE SELECTED AD
router.get('/:id', function (req, res) {
  Ads.findById(req.params.id, function (err, foundAd) {
    if (err) {
      req.flash('error', 'Valami hiba történt. Próbálja újra.');
      res.redirect('/ads');
    } else {
      res.render('ads/show', {
        ad: foundAd
      });
    }
  })
});

// EDIT PAGE - EDIT THE SELECTED AD
router.get('/:id/edit', middleware.checkUser, function (req, res) {
  Ads.findById(req.params.id, function (err, foundAd) {
      res.render('ads/edit', {ad: foundAd});
  });
});

// UPDATE PAGE
router.put('/:id', middleware.checkUser, function (req, res) {
  Ads.findByIdAndUpdate(req.params.id, req.body.ads, function (err, updateAd) {
    if (err) {
      req.flash('error', 'Valami hiba történt. Próbálja újra.');
      res.redirect('/ads');
    } else {
      req.flash('success', 'Hirdetés módosítva!');
      res.redirect('/ads/' + req.params.id);
    }
  })
});

// DELETE PAGE
router.delete('/:id', middleware.checkUser, function (req, res) {
  Ads.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
      req.flash('error', 'Valami hiba történt. Próbálja újra.');
      res.redirect('/ads');
      console.log(err);
    } else {
      req.flash('success', 'Hirdetés törölve!');
      res.redirect('/ads');
    }
  })
});

// SEARCH REGEX
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


module.exports = router;