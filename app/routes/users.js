var express = require('express');
var router = express.Router();

/* Errors */
var errors = require('../config/errors');
var user_username_error = errors.user.username;
var user_password_error = errors.user.password;
var user_email_error = errors.user.email;
var user_username_unique_error = errors.user.username_unique;
var user_email_unique_error = errors.user.email_unique;

/* Validator */
var isEmptyObject = require('../lib/empty');
var validator = require('validator');


/* Models */
var users = require('../models/users');


/* GET users listing. */
router.get('/', function(req, res) {
  res.send('respond with a resource');
});



router.get('/register', function(req, res) {
  var username = req.user ? req.user.username : '';
  res.render('users/register', { title: "User's Registration", username: username });
});



router.post('/register', function(req, res) {
    
    if (req.body.hasOwnProperty('submit')) {
  		//Errors
  		var errors = new Array();
  		if ( validator.isLength(req.body.username, 3, 100) !== true ) {
  			errors.push(user_username_error);
  		}
  		if ( validator.isLength(req.body.password, 4, 100) !== true ) {
  			errors.push(user_password_error);
  		}
      if ( validator.isEmail(req.body.email) !== true ) {
        errors.push(user_email_error);
      }
      
      //Uniquiness errors
      users.checkUsername(req.body.username, '', function(err, result) {
        var count = parseInt(result[0].count);
        if (count > 0) {
          errors.push(user_username_unique_error);
          var username = req.user ? req.user.username : '';
          res.render('users/register', { title: "User's Registration", errors: errors, username: username });
        }
        else {
          users.checkEmail(req.body.email, '', function(err, result2) {
            var count2 = result2[0].count;
            if (count2 > 0) {
              errors.push(user_email_unique_error);
              var username = req.user ? req.user.username : '';
              res.render('users/register', { title: "User's Registration", errors: errors, username: username });
            }
            else {
              //Send POST data
              if (isEmptyObject(errors)) {
                users.add(req.body.username, req.body.password, req.body.email, function() {
                   req.flash('success', 'User registered!');
                   res.redirect('/');
                });
              }
              else {
                var username = req.user ? req.user.username : '';
                res.render('users/register', { title: "User's Registration", errors: errors, username: username });
              }
            }
        
          });
      
        }

      });
    }
})





router.get('/login', function(req, res) {
  var username = req.user ? req.user.username : '';
  res.render('users/login', { title: "User's Log In", username: username });
});




router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});



module.exports = router;
