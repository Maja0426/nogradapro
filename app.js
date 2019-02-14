var express = require('express');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 3000;

app.locals.moment = require('moment');
mongoose.connect('mongodb://tmajoros:Tmsmajoros1977@ds135255.mlab.com:35255/bgyapro-01', {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({
  extended: true
}));

// SCHEMA SETUP - ADS DB SCHEMA
var adsSchema = new mongoose.Schema({
  title: String,
  image: String,
  mainCategory: String,
  category: String,
  price: String,
  city: String,
  phone: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

var Ads = mongoose.model('Ads', adsSchema);

app.get('/', function (req, res) {
  res.redirect('/ads');
});

// INDEX PAGE, LIST ALL ADS
app.get('/ads', function (req, res) {
  Ads.find({}, function (err, allAds) {
    if (err) {
      console.log(err);
    } else {
      res.render('ads/index', {
        ads: allAds
      });
    }
  })
});

// NEW ADS PAGE - ADDED NEW AD
app.get('/ads/new', function (req, res) {
  res.render('ads/new');
});

// CREATE NEW ADS
app.post('/ads', function (req, res) {
  var newAds = req.body.ads;
  Ads.create(newAds, function (err, createdAds) {
    if (err) {
      res.redirect('ads');
      console.log(err);
    } else {
      res.redirect('/ads');
    }
  })
});

// SHOW PAGE - SHOW THE SELECTED AD
app.get('/ads/:id', function (req, res) {
  Ads.findById(req.params.id, function(err, foundAd) {
    if (err) {
      res.redirect('/ads');
      console.log(err);
    } else {
      res.render('ads/show', {
        ad: foundAd
      });
    }
  })
});

// EDIT PAGE - EDIT THE SELECTED AD
app.get('/ads/:id/edit', function(req, res) {
  Ads.findById(req.params.id, function(err, foundAd) {
    if (err) {
      rres.redirect('/ads');
      console.log(err);
    } else {
      res.render('ads/edit', {ad: foundAd});
    }
  })
});

// UPDATE PAGE
app.put('/ads/:id', function(req, res){
  Ads.findByIdAndUpdate(req.params.id, req.body.ads, function (err, updateAd) {
    if (err) {
      res.redirect('/ads');
      console.log(err);
    } else {
      res.redirect('/ads/'+req.params.id);
    }
  })
});

// DELETE PAGE
app.delete('/ads/:id', function(req, res) {
  Ads.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      res.redirect('/ads');
      console.log(err);
    } else {
      res.redirect('/ads');
    }
  })
});


// AUTHENTICATION
app.get('/login', function (req, res) {
  res.render('login');
})

app.get('/register', function (req, res) {
  res.render('register');
})

// OTHERS PAGE
app.get('/cookies', function(req, res) {
  res.render('others/cooky');
});

app.get('/gdpr', function(req, res) {
  res.render('others/gdpr');
});

app.get('/impressum', function(req, res) {
  res.render('others/impressum');
});

// 404 ERROR PAGE
app.get('*', function (req, res) {
  res.render('404');
});


// LAUNCH
app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
})