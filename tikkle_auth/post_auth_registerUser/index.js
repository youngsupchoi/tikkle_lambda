const { queryDatabase } = require("db.js");

exports.post_auth_registerUser = async (req, res) => {
	const body = req.body;

	const name = body.name;
	const birthday = body.birthday;
	const nick = body.nick;
	const phone = body.phone;
	const gender = body.gender;

	console.log("body : ", body);

	//-------- check data format --------------------------------------------------------------------------------------//

	//check name
	if (!name || typeof name !== "string" || name.length > 30) {
		//return invalid
		console.log("ERROR : name value is null or invalid");
		const return_body = {
			success: false,
			detail_code: "01",
			message: "input name again",
			returnToken: null,
		};
		return res.status(400).send(return_body);
	}

	//check birthday
	const parsedDate = new Date(birthday);
	if (
		isNaN(parsedDate) ||
		Object.prototype.toString.call(parsedDate) !== "[object Date]"
	) {
		//return invalid
		console.log(" post_auth_registerUser 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			detail_code: "02",
			message: "birthday value is null or invalid : input birthday again",
			returnToken: null,
		};
		return res.status(400).send(return_body);
	}

	if (!isUserAgeValid(birthday)) {
		console.log("post_auth_registerUser 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			detail_code: "03",
			message: "if your age is under 14 you cannot use this servise!",
			returnToken: null,
		};
		return res.status(400).send(return_body);
	}

	//check nick
	if (!nick || typeof nick !== "string" || nick.length > 30) {
		//return invalid
		console.log("post_auth_registerUser 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			detail_code: "04",
			message: "nick value is null or invalid : input nick again",
			returnToken: null,
		};
		return res.status(400).send(return_body);
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
		console.log(" post_auth_registerUser 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			detail_code: "05",
			message: "phone value is null or invalid : input phone again",
			returnToken: null,
		};
		return res.status(400).send(return_body);
	}

	//check gender
	if (
		!gender ||
		typeof gender !== "string" ||
		!(gender === "male" || gender === "female" || gender === "others")
	) {
		//return invalid
		console.log("post_auth_registerUser 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			detail_code: "06",
			message: "gender value is null or invalid : input gender again",
			returnToken: null,
		};
		return res.status(400).send(return_body);
	}

	//-------- add user data to DB --------------------------------------------------------------------------------------//

	let sqlResult;

	const insertQuery = `
		INSERT INTO users 
		(name, birthday, nick, phone, gender, image, address, detail_address, is_tikkling, tikkling_ticket)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
		2,
	];

	try {
		const rows = await queryDatabase(insertQuery, values);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult.insertId);
	} catch (err) {
		console.log(" post_auth_registerUser 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			detail_code: "00",
			message: "Database post error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
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

	const return_body = {
		success: true,
		data: sqlResult.insertId,
		detail_code: "00",
		message: "sign up success!",
		returnToken: null,
	};
	return res.status(200).send(return_body);
};

function isUserAgeValid(dateOfBirth) {
	// Convert dateOfBirth string to a Date object
	const dob = new Date(dateOfBirth);

	// Calculate current date
	const currentDate = new Date();

	// Calculate age
	let age = currentDate.getFullYear() - dob.getFullYear();

	// Check if birthday hasn't occurred yet this year
	if (
		currentDate.getMonth() < dob.getMonth() ||
		(currentDate.getMonth() === dob.getMonth() &&
			currentDate.getDate() < dob.getDate())
	) {
		age--;
	}

	// Compare age with minimum age requirement (14)
	return age >= 14;
}
