var express = require('express');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var PORT = process.env.PORT || 3000;

app.get('/', function(req, res) {
  res.redirect('home');
});

app.get('/home', function(req, res) {
  res.render('index');
});

app.get('/login', function(req, res) {
  res.render('login');
})

app.get('/register', function(req, res) {
  res.render('register');
})

app.listen(PORT, function() {
  console.log(`Server started on port ${PORT}`);
})