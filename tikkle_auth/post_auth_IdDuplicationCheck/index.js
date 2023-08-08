const { queryDatabase } = require("db.js");

exports.post_auth_IdDuplicationCheck = async (req) => {
	const body = req.body;
	const inputId = body.inputId;

	//---- check id format ----//

	if (!inputId || typeof inputId !== "string" || inputId.length > 30) {
		//return invalid
		console.log("ERROR : inputId value is null or invalid");
		return {
			statusCode: 401,
			body: "input data again",
		};
	}

	//---- check DB there is nick or not ----//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where nick = ?", [
			inputId,
		]);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("Database connection error: ", err);
		return {
			statusCode: 501,
			body: err,
		};
	}

	//---- return result ----//

	if (sqlResult.length === 0) {
		//no duplication
		return {
			statusCode: 200,
			body: inputId,
		};
	} else {
		//duplication
		return {
			statusCode: 201,
			body: "Duplicate ID",
		};
	}
};
