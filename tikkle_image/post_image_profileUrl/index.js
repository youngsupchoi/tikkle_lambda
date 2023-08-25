const { queryDatabase } = require("db.js");

exports.post_image_profileUrl = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	const imageSize = body.imageSize.toString();
	const userId = body.userId;

	//-------- check body data --------------------------------------------------------------------------------------//

	if (
		!imageSize ||
		(imageSize !== "36" &&
			imageSize !== "48" &&
			imageSize !== "64" &&
			imageSize !== "128" &&
			imageSize !== "0")
	) {
		console.log("ERROR : size value is null or invalid");
		return {
			statusCode: 401,
			message_title: null,
			message_detail: null,
			body: "input image size again",
		};
	}

	//-------- get profile urls --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where id = ?", [
			userId,
		]);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(" post_image_profileUrl 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	// check data is one
	if (sqlResult.length !== 1) {
		console.log(" post_image_profileUrl 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	const retData = JSON.parse(sqlResult[0].image);
	const url = retData[imageSize];

	//-------- return data --------------------------------------------------------------------------------------//

	if (imageSize === "0") {
		const return_body = {
			success: true,
			data: JSON.stringify(retData),
			message_title: null,
			message_detail: null,
			message: "success",
			returnToken,
		};
		return res.status(201).send(return_body);
	}

	const return_body = {
		success: true,
		data: url,
		message_title: null,
		message_detail: null,
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
