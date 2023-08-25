const { queryDatabase } = require("db.js");

exports.post_auth_IdDuplicationCheck = async (req, res) => {
	const body = req.body;
	const inputId = body.inputId;

	//---- check id format ----//

	if (!inputId || typeof inputId !== "string" || inputId.length > 12) {
		//return invalid
		console.log(" post_auth_IdDuplicationCheck 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			message_title: null,
			message_detail: null,
			message: "inputId value is null or invalid: input data again",
		};
		return res.status(401).send(return_body);
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
		console.log(
			" post_auth_IdDuplicationCheck 에서 에러가 발생했습니다 : ",
			err
		);
		const return_body = {
			success: false,
			message_title: null,
			message_detail: null,
			message: "Database connection error",
		};
		return res.status(501).send(return_body);
	}

	//---- return result ----//

	if (sqlResult.length === 0) {
		//no duplication
		const return_body = {
			success: true,
			data: inputId,
			message_title: null,
			message_detail: null,
			message: "no duplication",
		};
		return res.status(200).send(return_body);
	} else {
		//duplication
		const return_body = {
			success: true,
			message_title: null,
			message_detail: null,
			message: "Duplicate ID",
		};
		return res.status(201).send(return_body);
	}
};
