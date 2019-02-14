var express = require('express');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var app = express();

var Ads = require('./models/ad');
var User = require('./models/user');
var PORT = process.env.PORT || 3000;

app.locals.moment = require('moment');

mongoose.connect('mongodb://tmajoros:Tmsmajoros1977@ds135335.mlab.com:35335/bgyapro-02', {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.set('view engine', 'ejs');

// PASSPORT CONFIG
app.use(require('express-session')({
  secret: 'I would like a new job for me',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static(__dirname + '/public'));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});


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
app.get('/ads/new', isLoggedIn, function (req, res) {
  res.render('ads/new');
});

// CREATE NEW ADS
app.post('/ads', function (req, res) {
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
app.get('/ads/:id/edit', isLoggedIn, function (req, res) {
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


// AUTHORIZATION
app.get('/login', function (req, res) {
  res.render('login');
});

// login logic
app.post('/login', passport.authenticate('local', {
  successRedirect: '/ads',
  failureRedirect: '/login'
}), function(req, res) {
});

app.get('/register', function (req, res) {
  res.render('register');
});

// handling sign up form
app.post('/register', function(req, res) {
  var newUser = new User({
    username: req.body.username,
    email: req.body.email
  });
  User.register(newUser, req.body.password, function(err, regUser) {
    if (err) {
      console.log(err);
      return res.render('register');
    } 
      passport.authenticate('local')(req, res, function() {
        res.redirect('/ads');
      });
  });
});

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/ads');
});

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

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
}
res.redirect('/login');
}

// LAUNCH
app.listen(PORT, function () {
  console.log(`Server started on port ${PORT}`);
})