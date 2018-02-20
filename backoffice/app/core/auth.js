'use strict';
var sendmail = require('sendmail')();

module.exports = function(app, connection, cfg){
	const jwt    = require('jsonwebtoken'),
		dateTime = require('../helpers/common');
	
	class Auth {

		/**
         * Getting authentication for user
         *
         * @static
         * @method getAuth
         * @author Sudhir kumar
         * @for    Events
         * @param  {String}  email
         * @param  {String}  password
         * @return {Promise} Resolves to a list
         */
		static getAuth(email, password) {
			
			return new Promise ((resolve, reject) => {
				connection.query("SELECT * from users where status = 1 and email_id = ? limit 1", [email], (err, row) => {
			        if (err) throw err;

			        if (row.length == 0) {
						return reject({"msg" : "Login fail - invalid email"});

			        } else if (row[0]) {
			            if (row[0].password != password) {
							return reject({"msg" : "Login fail - invalid password"});

			            } else {
			                var token = jwt.sign(row[0], cfg.web.jwt.secrect, {
			                  expiresIn: 1440111
			                });

			                delete row[0].password;
			                return resolve({'token' : token, 'user' : row[0]});
			            }
			        }
			    });
			});
		}

		/**
         * Updating last login after login
         *
         * @static
         * @method updateLastLogin
         * @author Sudhir kumar
         * @for    Events
         * @param  {string}  authData
         * @return {Promise} Resolves to a list
         */
		static updateLastLogin (authData) {
			return new Promise ((resolve, reject) => {
				connection.query("UPDATE users set last_login =  ? where userid = ?", [dateTime.newStr1(), authData.user.userid], (err, row) => {
					if (err) throw err;
					return resolve(authData)
				});
			});
		}

		/**
         * Updating last login after login
         *
         * @static
         * @method getUserByEmailId
         * @author Sudhir kumar
         * @for    Events
         * @param  {string}  authData
         * @return {Promise} Resolves to a list
         */
		static getUserByEmailId (email) {
			return new Promise ((resolve, reject) => {
				connection.query("SELECT count(*) as t FROM users where email_id = ?", [email], (err, row) => {
					if (err) throw err;
					return resolve(row[0]);
				});
			});
		}

		/**
         * Sign up user
         *
         * @static
         * @method signUp
         * @author Sudhir kumar
         * @for    Events
         * @param  {obj}  req
         * @return {Promise} Resolves to a list
         */
		static signUp (req) {

			var data = {
				'email_id' 		: req.body.email_id,
				'password' 		: req.body.password,
				'role' 			: req.body.role,
				'status' 		: 0,
				'created' 		: dateTime.newStr1()
			};
			
			return new Promise ((resolve, reject) => {
				connection.query("INSERT INTO users SET ? ",data , (err, row) => {
					if (err) throw err;
					return resolve({'inserted_id' : row.insertId});
				});
			});
		}

		/**
         * Sign up user
         *
         * @static
         * @method signUp
         * @author Sudhir kumar
         * @for    Events
         * @param  {obj}  req
         * @return {Promise} Resolves to a list
         */
		static changePassword (body) {
			var data = {
				'password' : body.password,
				'updated'  : dateTime.newStr1()
			};
			
			let query = "UPDATE users SET ? where email_id = ? ";
			return new Promise ((resolve, reject) => {
				connection.query(query, [data, body.email_id] , (err, row) => {
					if (err) throw err;
					return resolve({'affectedRows' : row.affectedRows, 'insertId' : row.insertId});
				});
			});
		}

		/**
         * Getting list of users.
         *return resolve({'affectedRows' : row.affectedRows, 'insertId' : row.insertId});
         * @static
         * @method getUserList
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static getUserList () {
			return new Promise ((resolve, reject) => {
				connection.query("SELECT * FROM users", (err, rows) => {
					if (err) throw err;
					return resolve(rows);
				});
			});
		}

		/**
         * Getting list of users.
         *return resolve({'affectedRows' : row.affectedRows, 'insertId' : row.insertId});
         * @static
         * @method changePasswordConfirmation
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static changePasswordConfirmation (email) {
			sendmail({
				from: 'no-reply@impelsys.com',
				to: email,
				subject: 'Reset Password',
				html: 'Mail of test sendmail ',
			}, function(err, reply) {
			    console.log(err);
			});
			console.log(email);
			return resolve({'affectedRows' : row.affectedRows, 'insertId' : row.insertId});
		}
	}

	return Auth;
}
//generaters.  reducers