'use strict';

module.exports = function(app, connection, cfg) {
	const dateTime = require('../helpers/common');
	
	class Status {

		/**
         * Getting list of Status.
         *
         * @static
         * @method getStatusList
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static getStatusList (site_id) {
			return new Promise ((resolve, reject) => {
				let query = "SELECT st.id, st.pub_id, st.site_id ,st.status_description, u.email_id, pu.organization_name, s.name, st.created"; 
				query += " FROM status as st INNER JOIN customers as pu on(st.pub_id = pu.pub_id)";
				query += " INNER JOIN sites as s on (st.site_id = s.site_id) INNER JOIN users as u on(st.added_by = u.userid)";
				let where = '';

				if (site_id) {
					where = " where st.id = ? ";
				}

				query += where;

				connection.query(query, [site_id] ,(err, rows) => {
					if (err) throw err;
					return resolve(rows);
				});
			});
		}

		/**
         * Getting list of Status.
         *
         * @static
         * @method deleteStatus
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static deleteStatus (site_id) {
			return new Promise ((resolve, reject) => {
				let query = "DELETE FROM status where id = ?";
				connection.query(query, [site_id], (err, row) => {
					if (err) throw err;
					
					return resolve({'affected_rows' : row.affectedRows});
				});
			});
		}

		/**
         * Getting list of Status.
         *
         * @static
         * @method addStatus
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static addStatus (req) {
			let data = {
				'site_id'  : req.body.site_id,
				'pub_id'   : req.body.pub_id,
				'added_by' : req.decoded.userid,
				'status_description' : req.body.status_description,
				'created'  : dateTime.newStr1(),
				'modified' : dateTime.newStr1()
			};
			
			let id = req.body.id;		
			let query = (id) ? "UPDATE status SET ? where id = ? " : "INSERT INTO status SET ? ";

			return new Promise ((resolve, reject) => {
				connection.query(query, [data, id] , (err, row) => {
					if (err) throw err;
					return resolve({'affectedRows' : row.affectedRows, 'insertId' : row.insertId});
				});
			});
		}
	}

	return Status;
}
//generaters.  reducers