//*********************Connecting mysql server************ /
module.exports = (cfg) => {
	var mysql 	   = require('mysql');
	var db 		   = cfg.db.mysql;

	return mysql.createConnection({
		host     : db.host,
		user     : db.user,
		password : db.password,
		database : db.database,
	});

};
