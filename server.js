// server.js

// modules ====================================
var express         = require('express');
var morgan          = require('morgan');
var mongoose          = require('mongoose');
var app             = express();
var bodyParser      = require('body-parser');
var methodOverride  = require('method-override');

// configuration ==============================

// config files
var db = require('./config/db');

//set port
var port = process.env.PORT || 8080;

// connect to mongoDB database
// (uncomment after you enter your own credentials in config/db.js)
mongoose.Promise = global.Promise;
mongoose.connect(db.url);

// get all of the data for body parameters
// parse application/json
app.use(bodyParser.json());

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json'}));

// parse application/x-www-urlencoded
app.use(bodyParser.urlencoded({extended: true}));

//override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override'));

// set the static files location /public/img will be img for users
var myPath = __dirname;
app.use(express.static(__dirname + '/public'));
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.use(bodyParser.text());
app.use(methodOverride());
// routes ====================================
require('./app/routes')(app); // configure routes

//start app ==================================
app.listen(port);

console.log('App listening on port' + port);

// expose app
exports = module.exports = app;
