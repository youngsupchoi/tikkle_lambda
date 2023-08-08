const { queryDatabase } = require("db.js");

exports.post_auth_phoneCheck = async (req, res) => {
	const body = req.body;
	const phone = body.phone;

	//---- check number format ----//

	const numericPattern = /^\d+$/;

	// Check if the string matches the numeric pattern and its length is between 9 and 12
	if (
		!phone ||
		typeof phone !== "string" ||
		phone.length < 9 ||
		phone.length > 11 ||
		!numericPattern.test(phone)
	) {
		//return invalid
		console.log("ERROR : phone number value is null or invalid");
		return {
			statusCode: 401,
			body: "input data again",
		};
	}

	//---- check DB there is number or not ----//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			"select * from users where phone = ?",
			[phone]
		);
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

	if (sqlResult.length === 1) {
		//already sign in
		return {
			statusCode: 200,
			body: "login",
		};
	} else if (sqlResult.length === 0) {
		//not sign in
		return {
			statusCode: 201,
			body: "sign up",
		};
	} else {
		console.log("ERROR : many same number");
		return {
			statusCode: 502,
			body: " many same number",
		};
	}
};
