'use strict';

module.exports = function(app, connection, cfg) {
	const dateTime = require('../helpers/common');
	
	class Publisher {

		/**
         * Getting list of publisher.
         *
         * @static
         * @method getPublisherList
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static getPublisherList (pub_id) {
			return new Promise ((resolve, reject) => {
				let query = "SELECT * FROM customers";
				let where = '';

				if (pub_id) {
					where = " where pub_id = ? ";
				}

				query += where;

				connection.query(query, [pub_id] ,(err, rows) => {
					if (err) throw err;
					return resolve(rows);
				});
			});
		}

		/**
         * Getting list of publisher.
         *
         * @static
         * @method deletePublisher
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static deletePublisher (pub_id) {
			return new Promise ((resolve, reject) => {
				let query = "DELETE FROM customers where pub_id = ?";
				connection.query(query, [pub_id], (err, row) => {
					if (err) throw err;
					
					return resolve({'affected_rows' : row.affectedRows});
				});
			});
		}

		/**
         * Getting list of publisher.
         *
         * @static
         * @method addPublisher
         * @author Sudhir kumar
         * @return {Promise} Resolves to a list
         */
		static addPublisher (req) {
			let data = {
				'organization_name' : req.body.organization_name,
				'org_description' 	: req.body.org_description,
				'contact' 			: req.body.contact,
				'contract_details' 	: req.body.contract_details,
				'contract_doc_path' : req.body.contract_doc_path,
				'created_by' 		: req.decoded.userid,
				'created' 			: dateTime.newStr1(),
				'modified' 			: dateTime.newStr1()
			};
			
			let pub_id = req.body.pub_id;		
			let query = (pub_id) ? "UPDATE customers SET ? where pub_id = ? " : "INSERT INTO customers SET ? ";
			
			return new Promise ((resolve, reject) => {
				connection.query(query, [data, pub_id] , (err, row) => {
					if (err) throw err;
					return resolve({'affectedRows' : row.affectedRows, 'insertId' : row.insertId});
				});
			});
		}
	}

	return Publisher;
}
//generaters.  reducers