'use strict';

module.exports = function (req, res, next){
  if (req.isAuthenticated()) { return next(); }
  req.flash('error', "You are not authenticated to access user's profile page!");
  res.redirect('/');
};