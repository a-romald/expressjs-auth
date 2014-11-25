var mysql = require('mysql');
var settings = require('../config/database');
var crypt = require('crypto');
var encrypt = require('../config/encrypt');
var salt = encrypt.salt;


var connection = mysql.createConnection(settings);

connection.connect();

var Users = {

	add: function(username, password, email, callback) {
		var now = new Date();
		var hash = this.createHash(password);
        connection.query("INSERT INTO users SET ?", [{username: username, password: hash, email: email, created: now}], callback);
    },
    

    findOne: function(id, callback) {
        connection.query("SELECT * FROM users WHERE ? LIMIT 1", {id: id}, callback);
    },


    createHash: function(password) {
    	var c = crypt.createHmac('sha1', salt);
    	c = c.update(password);
    	return c.digest('hex');
    },


    checkUsername: function(username, self_username, callback) {
        connection.query("SELECT COUNT(*) AS count FROM `users` WHERE `username` = '" + username + "' AND `username` != '" + self_username + "'" , callback);
    },


    checkEmail: function(email, self_email, callback) {
        connection.query("SELECT COUNT(*) AS count FROM `users` WHERE `email` = '" + email + "' AND `email` != '" + self_email + "'", callback);
    },


    update: function(id, username, email, callback) {
        connection.query('UPDATE users SET ?, ? WHERE ?', [{username: username}, {email: email}, {id: id}], callback);
    
    },


    checkPassword: function(id, callback) {
        connection.query("SELECT password FROM `users` WHERE `id` = " + id + " LIMIT 1" , callback);
    },


    updatePassword: function(id, password, callback) {
        connection.query('UPDATE users SET ? WHERE ?', [{password: password}, {id: id}], callback);
    }


};


module.exports = Users;