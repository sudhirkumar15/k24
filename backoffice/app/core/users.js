'use strict';

module.exports = function(app, connection, cfg) {
	const dateTime = require('../helpers/common');
	
	class Users {

		/**
         * Getting list of users.
         *
         * @static
         * @method getUserList
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static getUserList (userid) {
			return new Promise ((resolve, reject) => {
				let query = "SELECT * FROM users";
				let where = '';

				if (userid) {
					where = " where userid = ? ";
				}

				query += where;

				connection.query(query, [userid] ,(err, rows) => {
					if (err) throw err;
					return resolve(rows);
				});
			});
		}

		/**
         * Getting list of users.
         *
         * @static
         * @method getUserList
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static deleteUser (userid) {
			return new Promise ((resolve, reject) => {
				let query = "DELETE FROM users where userid = ?";
				connection.query(query, [userid], (err, row) => {
					if (err) throw err;
					
					return resolve({'affected_rows' : row.affectedRows});
				});
			});
		}

		/**
         * Getting list of users.
         *
         * @static
         * @method getUserList
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static editUser (req) {
			let data = {
				'department_id' : req.body.department_id,
				'email_id' 		: req.body.email_id,
				'password' 		: req.body.password,
				'role' 			: req.body.role,
				'status' 		: req.body.status,
				'updated' 		: dateTime.newStr1(),
				'group_id' 		: req.body.group_id
			};
			
			let userid = req.body.userid;

			return new Promise ((resolve, reject) => {
				connection.query("UPDATE users SET ? where userid = ? ",[data, userid] , (err, row) => {
					if (err) throw err;
					return resolve({'affectedRows' : row.affectedRows});
				});
			});
		}
	}

	return Users;
}
//generaters.  reducers