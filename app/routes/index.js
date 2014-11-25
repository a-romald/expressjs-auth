var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  var username = req.user ? req.user.username : ''; 
  res.render('index/index', { title: 'Express', error_messages: req.flash('error'), success_messages: req.flash('success'), username: username});
});




module.exports = router;
