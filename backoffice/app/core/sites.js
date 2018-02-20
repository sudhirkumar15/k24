'use strict';

module.exports = function(app, connection, cfg) {
	const dateTime = require('../helpers/common');
	
	class Sites {

		/**
         * Getting list of Sites.
         *
         * @static
         * @method getSitesList
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static getSitesList (site_id) {
			return new Promise ((resolve, reject) => {
				let query = "SELECT * FROM sites";
				let where = '';

				if (site_id) {
					where = " where site_id = ? ";
				}

				query += where;

				connection.query(query, [site_id] ,(err, rows) => {
					if (err) throw err;
					return resolve(rows);
				});
			});
		}

		/**
         * Getting list of Sites.
         *
         * @static
         * @method deleteSites
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static deleteSites (site_id) {
			return new Promise ((resolve, reject) => {
				let query = "DELETE FROM sites where site_id = ?";
				connection.query(query, [site_id], (err, row) => {
					if (err) throw err;
					
					return resolve({'affected_rows' : row.affectedRows});
				});
			});
		}

		/**
         * Getting list of Sites.
         *
         * @static
         * @method addSites
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static addSites (req) {
			let data = {
				'name' 			    : req.body.name,
				'pub_id' 			: req.body.pub_id,
				'description' 		: req.body.description,
				'urls' 				: req.body.urls,
				'contact' 			: req.body.contact,
				'contract_details'  : req.body.contract_details,
				'contract_doc_path' : req.body.contract_doc_path,
				'created_by' 		: req.decoded.userid,
				'created' 			: dateTime.newStr1(),
				'modified' 			: dateTime.newStr1()
			};
			
			let site_id = req.body.site_id;		
			let query = (site_id) ? "UPDATE sites SET ? where site_id = ? " : "INSERT INTO sites SET ? ";
			
			return new Promise ((resolve, reject) => {
				connection.query(query, [data, site_id] , (err, row) => {
					if (err) throw err;
					return resolve({'affectedRows' : row.affectedRows, 'insertId' : row.insertId});
				});
			});
		}
	}

	return Sites;
}
//generaters.  reducers