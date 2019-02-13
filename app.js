var express = require('express');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();

var PORT = process.env.PORT || 3000;

app.locals.moment = require('moment');
mongoose.connect('mongodb://localhost:27017/ads_project_02', {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

// SCHEMA SETUP
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
      console.log(allAds);
      res.render('ads/index', {
        ads: allAds
      });
    }
  })
});

// NEW ADS PAGE
app.get('/ads/new', function (req, res) {
  res.render('ads/new');
});

// CREATE NEW ADS
app.post('/ads', function (req, res) {
  var newAds = req.body.ads;
  Ads.create(newAds, function (err, createdAds) {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/ads');
    }
  })
});

// SHOW PAGE
app.get('/ads/:id', function (req, res) {
  Ads.findById(req.params.id, function(err, foundAd) {
    if (err) {
      console.log(err);
    } else {
      res.render('ads/show', {
        ad: foundAd
      });
    }
  })
});




app.get('/login', function (req, res) {
  res.render('login');
})

app.get('/register', function (req, res) {
  res.render('register');
})

// 404 ERROR PAGE
app.get('*', function (req, res) {
  res.render('404');
});

app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
})