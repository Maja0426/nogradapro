var express = require('express');
var methodOverride = require('method-override');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var flash = require('connect-flash');
var app = express();

var adsRoutes = require('./routes/ads');
var indexRoutes = require('./routes/index');
var userRoutes = require('./routes/users');

var User = require('./models/user');
var PORT = process.env.PORT || 3000;

app.locals.moment = require('moment');

mongoose.connect('mongodb://tmajoros:Tmsmajoros1977@ds135335.mlab.com:35335/bgyapro-02', {
  useNewUrlParser: true
});
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

app.set('view engine', 'ejs');
app.use(flash());

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
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use('/', indexRoutes);
app.use('/ads', adsRoutes);
app.use('/user', userRoutes);

// OTHERS PAGE - FOOTER
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