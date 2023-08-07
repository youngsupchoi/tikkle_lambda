const { queryDatabase } = require("db.js");

exports.post_auth_registerUser = async (event) => {
	const body = event.body;

	const name = body.name;
	const birthday = body.birthday;
	const nick = body.nick;
	const phone = body.phone;
	const gender = body.gender;

	//-------- check data format --------------------------------------------------------------------------------------//

	//check name
	if (!name || typeof name !== "string" || name.length > 30) {
		//return invalid
		console.log("ERROR : name value is null or invalid");
		return {
			statusCode: 401,
			body: "input name again",
		};
	}

	//check birthday
	const parsedDate = new Date(birthday);
	if (
		isNaN(parsedDate) ||
		Object.prototype.toString.call(parsedDate) !== "[object Date]"
	) {
		//return invalid
		console.log("ERROR : birthday value is null or invalid");
		return {
			statusCode: 401,
			body: "input birthday again",
		};
	}

	//check nick
	if (!nick || typeof nick !== "string" || nick.length > 30) {
		//return invalid
		console.log("ERROR : nick value is null or invalid");
		return {
			statusCode: 401,
			body: "input nick again",
		};
	}

	// Check if the string matches the numeric pattern and its length is between 9 and 12
	const numericPattern = /^\d+$/;
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

	//check gender
	if (
		!gender ||
		typeof gender !== "string" ||
		!(gender === "male" || gender === "female" || gender === "other")
	) {
		//return invalid
		console.log("ERROR : gender value is null or invalid");
		return {
			statusCode: 401,
			body: "input gender again",
		};
	}

	//-------- add user data to DB --------------------------------------------------------------------------------------//

	let sqlResult;

	const insertQuery = `
		INSERT INTO users 
		(name, birthday, nick, phone, gender, image, address, detail_address, is_tikkling)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	  `;

	const values = [
		name,
		birthday,
		nick,
		phone,
		gender,
		null,
		null,
		null,
		false,
	];

	try {
		const rows = await queryDatabase(insertQuery, values);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult.insertId);
	} catch (err) {
		console.log("Database post error: ", err);
		return {
			statusCode: 501,
			body: err,
		};
	}

	// //error when not 1 row is affected
	// if (sqlResult.affectedRows !== 1) {
	// 	console.log("Database post error: ", err);
	// 	return {
	// 		statusCode: 501,
	// 		body: err,
	// 	};
	// }

	//-------- return result --------------------------------------------------------------------------------------//

	return {
		statusCode: 200,
		body: JSON.stringify({
			id: sqlResult.insertId,
			message: "sign up success!",
		}),
	};
};
