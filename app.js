var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('cookie-session');
var flash = require('connect-flash');
/*MySQL*/
var mysql = require('mysql');
var settings = require('./app/config/database');
var connection = mysql.createConnection(settings);
connection.connect();
/*Encrypt*/
var crypt = require('crypto');
var encrypt = require('./app/config/encrypt');
var salt = encrypt.salt;


var routes = require('./app/routes/index');
var users = require('./app/routes/users');
var profile = require('./app/routes/profile');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser('secretString'));
app.use(session({keys: ['secret'], cookie: { maxAge: 60000 }}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));


/* Passport Authentication */
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());


var LocalStrategy = require('passport-local').Strategy;


app.post('/users/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/',
                                   failureFlash: true,
                                   successFlash: 'Welcome!' }
));




passport.use(new LocalStrategy(
  {
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true // allows us to pass back the entire request to the callback
  },
  function(req, username, password, done) { // callback with user and password from our form
      connection.query("SELECT * FROM `users` WHERE `username` = '" + username + "'", function(err,rows){
          if (err)
              return done(err);
           if (!rows.length) {
              return done(null, false, {message: 'Incorrect login'});
          } 

          // if the user is found but the password is wrong
          var newhash = crypt.createHmac('sha1', salt)
                          .update(password)
                          .digest('hex');
          if (!( rows[0].password == newhash))
              return done(null, false, {message: 'Incorrect password'});

          // all is well, return successful user
          return done(null, rows[0]);         

      });

  }
));



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    connection.query("SELECT * FROM users WHERE id = " + id, function(err, rows) {    
        done(err, rows[0]);
    });
});





/* ROUTES */
app.use('/', routes);
app.use('/users', users);
app.use('/profile', profile);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
