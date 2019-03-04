var express = require('express');
var router = express.Router();
var Ads = require('../models/ad');
var middleware = require('../middleware');

var multer = require('multer');
var storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error('Csak képfile-t lehet feltölteni!'), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
})

var cloudinary = require('cloudinary');
cloudinary.config({
  cloud_name: 'maja0426',
  api_key: '831789779817282',
  api_secret: 'A8gM9XzEuhRuLSds9Fru_l7lTz0'
});

// INDEX PAGE, LIST ALL ADS
router.get('/', function (req, res) {
   var perPage = 16;
   var pageQuery = parseInt(req.query.page);
   var pageNumber = pageQuery ? pageQuery : 1;
   var noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Ads.find({title: regex}).sort({createdAt:-1}).skip((perPage*pageNumber)-perPage).limit(perPage).exec(function (err, allAds) {
      Ads.countDocuments({title: regex}).exec(function(err, count) {
        if (err) {
          console.log(err);
          res.redirect('back');
        } else {
          if (allAds.length < 1) {
            noMatch = "Nem találtam egyező hirdetést, próbáld meg másképp.";
          }
          res.render('ads/index', {
            ads: allAds,
            current: pageNumber,
            pages: Math.ceil(count / perPage),
            noMatch: noMatch,
            search: req.query.search
          });
          }
      })
    })
  } else {
    Ads.find({}).sort({createdAt:-1}).skip((perPage*pageNumber)-perPage).limit(perPage).exec(function (err, allAds) {
      Ads.countDocuments().exec(function(err, count) {
        if (err) {
          console.log(err);
          } else {
            res.render('ads/index', {
              ads: allAds,
              current: pageNumber,
              pages: Math.ceil(count / perPage),
              noMatch: noMatch,
              search: false
            });
          }
      })
      
    })
  }
});

// BADGES - MAINCATEGORY (BUY OR SELL)
router.get('/mainCategory/:id', function(req, res) {
  var perPage = 16;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  var noMatch = null;
  Ads.find({mainCategory: req.params.id}).sort({createdAt:-1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allAds) {
    Ads.countDocuments({mainCategory: req.params.id}).exec(function (err, count) {
      if (err) {
        console.log(err);
      } else {
        res.render('ads/indexbadges', {
          ads: allAds,
          current: pageNumber,
          category: req.params.id,
          findRoute: 'mainCategory',
          pages: Math.ceil(count / perPage),
          noMatch: noMatch,
          search: false
        });
      }
    })

  })
})

// BADGES - CATEGORY (TYPE)
router.get('/category/:id', function (req, res) {
  var perPage = 16;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  var noMatch = null;
  Ads.find({
    category: req.params.id
  }).sort({createdAt:-1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allAds) {
    Ads.countDocuments({category: req.params.id}).exec(function (err, count) {
      if (err) {
        console.log(err);
      } else {
        res.render('ads/indexbadges', {
          ads: allAds,
          current: pageNumber,
          category: req.params.id,
          findRoute: 'category',
          pages: Math.ceil(count / perPage),
          noMatch: noMatch,
          search: false
        });
      }
    })

  })
})

// BADGES - CITIES 
router.get('/city/:id', function (req, res) {
  var perPage = 16;
  var pageQuery = parseInt(req.query.page);
  var pageNumber = pageQuery ? pageQuery : 1;
  var noMatch = null;
  Ads.find({
    city: req.params.id
  }).sort({createdAt:-1}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function (err, allAds) {
    Ads.countDocuments({city: req.params.id}).exec(function (err, count) {
      if (err) {
        console.log(err);
      } else {
        res.render('ads/indexbadges', {
          ads: allAds,
          current: pageNumber,
          category: req.params.id,
          findRoute: 'city',
          pages: Math.ceil(count / perPage),
          noMatch: noMatch,
          search: false
        });
      }
    })

  })
})

// NEW ADS PAGE - ADDED NEW AD
router.get('/new', middleware.isLoggedIn, function (req, res) {
  res.render('ads/new');
});

// CREATE NEW ADS
router.post('/', middleware.isLoggedIn, upload.single('image'), function (req, res) {
  req.body.ads.description = req.sanitize(req.body.ads.description);
  req.body.ads.author = {
    id: req.user._id,
    username: req.user.username
  };
  if (req.file)  {
  cloudinary.uploader.upload(req.file.path, function (result) {
    // add cloudinary url for the image to the ads object under image property
    req.body.ads.image = result.secure_url;
    Ads.create(req.body.ads, function (err, createdAds) {
      if (err) {
        req.flash('error', 'Valami hiba történt. Próbálja újra.');
        res.redirect('ads');
      } else {
        req.flash('success', 'Az Ön új hirdetése kész!');
        res.redirect('/ads/' + createdAds.id);
      }
    })
  });
  } else {
    req.body.ads.image = 'https://res.cloudinary.com/maja0426/image/upload/v1550587836/Aprohirdetes/NoImageFound.png';
    Ads.create(req.body.ads, function (err, createdAds) {
      if (err) {
        req.flash('error', 'Valami hiba történt. Próbálja újra.');
        res.redirect('ads');
      } else {
        req.flash('success', 'Az Ön új hirdetése kész!');
        res.redirect('/ads/' + createdAds.id);
      }
    })
  }
});

// SHOW PAGE - SHOW THE SELECTED AD
router.get('/:id', function (req, res) {
  Ads.findById(req.params.id, function (err, foundAd) {
    if (err || !foundAd) {
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
    res.render('ads/edit', {
      ad: foundAd
    });
  });
});

// UPDATE PAGE
router.put('/:id', middleware.checkUser, upload.single('image'), function (req, res) {
  req.body.ads.description = req.sanitize(req.body.ads.description);
  req.body.ads.lastModifiedAt = Date.now();
  req.body.ads.author = {
    id: req.user._id,
    username: req.user.username
  };
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, function (result) {
      // add cloudinary url for the image to the ads object under image property
      req.body.ads.image = result.secure_url;
      Ads.findByIdAndUpdate(req.params.id, req.body.ads, function (err, updatedAd) {
        if (err) {
          req.flash('error', 'Valami hiba történt. Próbálja újra.');
          res.redirect('ads');
        } else {
          req.flash('success', 'Az Ön új hirdetése kész!');
          res.redirect('/ads/' + updatedAd.id);
        }
      })
    });
  } else {
    // req.body.ads.image = 'https://res.cloudinary.com/maja0426/image/upload/v1550587836/Aprohirdetes/NoImageFound.png';
  Ads.findByIdAndUpdate(req.params.id, req.body.ads, function (err, updateAd) {
    if (err) {
      req.flash('error', 'Valami hiba történt. Próbálja újra.');
      res.redirect('/ads');
    } else {
      req.flash('success', 'Hirdetés módosítva!');
      res.redirect('/ads/' + updateAd.id);
    }
  })
}
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
