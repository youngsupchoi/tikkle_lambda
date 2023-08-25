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

		console.log(" post_auth_phoneCheck 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "phone number value is null or invalid : input data again",
		};
		return res.status(401).send(return_body);
	}

	//---- check DB there is number or not ----//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where phone = ?", [
			phone,
		]);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(" post_auth_phoneCheck 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "Database connection error",
		};
		return res.status(501).send(return_body);
	}

	//---- return result ----//

	if (sqlResult.length === 1) {
		//already sign in
		const return_body = {
			success: true,
			message_title: null,
			message_detail: null,
			message: "login",
			userId: sqlResult[0].id,
		};
		return res.status(200).send(return_body);
	} else if (sqlResult.length === 0) {
		//not sign in

		const return_body = {
			success: true,
			message_title: null,
			message_detail: null,
			message: "sign up",
		};
		return res.status(201).send(return_body);
	} else {
		console.log(" post_auth_phoneCheck 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "many same number",
		};
		return res.status(502).send(return_body);
	}
};
