var express = require('express');
var router = express.Router();

var Authenticate = require('../lib/authenticated');

/*Encrypt*/
var crypt = require('crypto');
var encrypt = require('../config/encrypt');
var salt = encrypt.salt;

/* Errors */
var errors = require('../config/errors');
var user_username_error = errors.user.username;
var user_password_error = errors.user.password;
var user_email_error = errors.user.email;
var user_username_unique_error = errors.user.username_unique;
var user_email_unique_error = errors.user.email_unique;
var new_passwords_error = errors.user.new_passwords;
var old_password_error = errors.user.old_password;

/* Validator */
var isEmptyObject = require('../lib/empty');
var validator = require('validator');

/* Models */
var users = require('../models/users');




/* GET home page. */
router.get('/', Authenticate, function(req, res) {
  var id_user = req.user ? req.user.id : null;
  users.findOne(id_user, function(err, result) {
  	var username = req.user ? req.user.username : ''; 
  	res.render('profile/index', { title: "User's Profile", error_messages: req.flash('error'), success_messages: req.flash('success'), username: username, user: result[0]});
  })
});







router.post('/', Authenticate, function(req, res) {
    
    if (req.body.hasOwnProperty('submit_profile')) {
  		//Errors
  		var errors = new Array();
  		if ( validator.isLength(req.body.username, 3, 100) !== true ) {
  			errors.push(user_username_error);
  		}
  		
	    if ( validator.isEmail(req.body.email) !== true ) {
	        errors.push(user_email_error);
	    }
      
      //Uniquiness errors
      users.checkUsername(req.body.username, req.user.username, function(err, result) {
        var count = parseInt(result[0].count);
        if (count > 0) {
          errors.push(user_username_unique_error);
          var username = req.user ? req.user.username : '';
          var id_user = req.user ? req.user.id : null;
    		  users.findOne(id_user, function(err, result) {
    		  	var username = req.user ? req.user.username : ''; 
    		  	res.render('profile/index', { title: "User's Profile", error_messages: req.flash('error'), success_messages: req.flash('success'), username: username, user: result[0], errors: errors});
    		  });
        }
        else {
          users.checkEmail(req.body.email, req.user.email, function(err, result2) {
            var count2 = result2[0].count;
            if (count2 > 0) {
              errors.push(user_email_unique_error);
              var username = req.user ? req.user.username : '';
              var id_user = req.user ? req.user.id : null;
      			  users.findOne(id_user, function(err, result) {
      			  	var username = req.user ? req.user.username : ''; 
      			  	res.render('profile/index', { title: "User's Profile", error_messages: req.flash('error'), success_messages: req.flash('success'), username: username, user: result[0], errors: errors});
      			  });
            }
            else {
              //Send POST data
              if (isEmptyObject(errors)) {
                users.update(req.user.id, req.body.username, req.body.email, function() {
                   req.flash('success', "User's profile updated!");
                   res.redirect('/profile');
                });
              }
              else {
                var username = req.user ? req.user.username : '';
                var id_user = req.user ? req.user.id : null;
      			  	users.findOne(id_user, function(err, result) {
      				  	var username = req.user ? req.user.username : ''; 
      				  	res.render('profile/index', { title: "User's Profile", error_messages: req.flash('error'), success_messages: req.flash('success'), username: username, user: result[0], errors: errors});
      			  	});
              }
            }
        
          });
      
        }

      });
    }
})







//Edit Password - POST data
router.post('/change_password', Authenticate, function(req, res) {
    
    if (req.body.hasOwnProperty('submit_password')) {
      //Errors
      var errors = new Array();
      if (req.body.new_password !== req.body.retype_new_password) {
          errors.push(new_passwords_error);
      }
      if ( validator.isLength(req.body.new_password, 4, 100) !== true ) {
          errors.push(user_password_error);
      }
      
      var old_password =  req.body.old_password;
      var oldhash = crypt.createHmac('sha1', salt)
                      .update(old_password)
                      .digest('hex');
      users.checkPassword(req.user.id, function(err, result) {
          if (oldhash !== result[0].password) {
            errors.push(old_password_error);
            var username = req.user ? req.user.username : '';
            var id_user = req.user ? req.user.id : null;
            users.findOne(id_user, function(err, result1) {
              res.render('profile/index', { title: "User's Profile", error_messages: req.flash('error'), success_messages: req.flash('success'), username: username, user: result1[0], errors_password: errors});
            });
          }
          else {
            //Send POST data
            if (isEmptyObject(errors)) {
                var new_password =  req.body.new_password;
                var newhash = crypt.createHmac('sha1', salt)
                                .update(new_password)
                                .digest('hex');
                users.updatePassword(req.user.id, newhash, function() {
                    req.flash('success', "User's password updated!");
                    res.redirect('/profile');
                });
            }
            else {
              var username = req.user ? req.user.username : '';
              var id_user = req.user ? req.user.id : null;
              users.findOne(id_user, function(err, result1) {
                res.render('profile/index', { title: "User's Profile", error_messages: req.flash('error'), success_messages: req.flash('success'), username: username, user: result1[0], errors_password: errors});
              });
            }
          }

      });
    
    }
    

});



module.exports = router;
