var express = require('express');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var flash = require('connect-flash');
var sslRedirect = require('heroku-ssl-redirect'); // SSL Redirect, must have heroku
var expressSanitizer = require("express-sanitizer");
var middleware = require('./middleware');
var sm = require('sitemap');
var app = express();

var adsRoutes = require('./routes/ads');
var indexRoutes = require('./routes/index');
var userRoutes = require('./routes/users');

var User = require('./models/user');
var PORT = process.env.PORT || 5000;

app.locals.moment = require('moment');

mongoose.connect('mongodb://tmajoros:Tmsmajoros1977@ds343985.mlab.com:43985/nogradapro-01', {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.set('view engine', 'ejs');
app.use(flash());


// SITEMAP GENERATOR (ADD sitemap.xml to google console)
var sitemap = sm.createSitemap({
    hostname: 'https://nogradapro.com',
    cacheTime: 600000,        // 600 sec - cache purge period
    urls: [
      { url: '/ads/', changefreq: 'daily', priority: 0.3 }
    ]
  });

app.get('/sitemap.xml', function (req, res) {
  sitemap.toXML(function (err, xml) {
    if (err) {
      return res.status(500).end();
    }
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  });
});

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
app.use(sslRedirect()); // Redirect Heroku SSl. MUST HAVE to HEROKU!!
app.use(expressSanitizer());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.pageUrl = 'https://' + req.get('host') + req.originalUrl; // SHOW actual page's URL
  next();
});

// ROUTES CONFIG
app.use('/', indexRoutes);
app.use('/ads', adsRoutes);
app.use('/user', userRoutes);

// OTHERS PAGE - Footer's links, Comment policy, Help
app.get('/cookies', function(req, res) {
  res.render('others/cooky');
});

app.get('/gdpr', function(req, res) {
  res.render('others/gdpr');
});

app.get('/impressum', function(req, res) {
  res.render('others/impressum');
});

app.get('/commentpolicy', function(req, res) {
  res.render('others/commentpolicy');
});

app.get('/help', function(req, res) {
  res.render('others/help');
});

app.get('/admin', middleware.checkAdmin, middleware.checkAllAds, middleware.checkAllUser, function (req, res) {
  res.render('others/admin');
});

// 404 ERROR PAGE
app.get('*', function (req, res) {
  res.render('404');
});


// START SERVER SCRIPT
app.listen(PORT, function () {
  console.log("======================================================");
  console.log(`YOUR LIFE WILL BE CHANGE.. SERVER STARTED ON PORT ${PORT}`);
  console.log("======================================================");
});