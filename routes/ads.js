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
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    Ads.find({
      title: regex
    }, function (err, allAds) {
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

// List by Categories

// Sell
router.get('/buy', function (req, res) {
  Ads.find({
    mainCategory: 'Keres'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// Buy
router.get('/sell', function (req, res) {
  Ads.find({
    mainCategory: 'Kínál'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// Categories - Jobs
router.get('/jobs', function (req, res) {
  Ads.find({
    category: 'Állás'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// Categories - Real estate
router.get('/estate', function (req, res) {
  Ads.find({
    category: 'Ingatlan'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// Categories - Service
router.get('/service', function (req, res) {
  Ads.find({
    category: 'Szolgáltatás'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// Categories - Technical
router.get('/technical', function (req, res) {
  Ads.find({
    category: 'Műszaki'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// Categories - Education
router.get('/education', function (req, res) {
  Ads.find({
    category: 'Oktatás'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// Categories - Vehicles
router.get('/vehicles', function (req, res) {
  Ads.find({
    category: 'Jármű'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// Categories - Others
router.get('/other', function (req, res) {
  Ads.find({
    category: 'Egyéb'
  }, function (err, foundAds) {
    if (err) {
      req.flash("error", "Valami gond akadt. Próbáld meg mégegyszer.");
      return res.redirect("/");
    } else {
      res.render('ads/index', {
        ads: foundAds
      })
    }
  });
});

// NEW ADS PAGE - ADDED NEW AD
router.get('/new', middleware.isLoggedIn, function (req, res) {
  res.render('ads/new');
});

// CREATE NEW ADS
router.post('/', middleware.isLoggedIn, upload.single('image'), function (req, res) {
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
    res.render('ads/edit', {
      ad: foundAd
    });
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
      res.redirect('/ads/' + updateAd.id);
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