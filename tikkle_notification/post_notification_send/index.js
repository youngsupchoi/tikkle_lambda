const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.post_notification_send = async (event) => {
	const body = event.body;
	const headers = event.headers;

	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

	const receive_user_id = body.receive_user_id;
	const notification_type_id = body.notification_type_id;

	//-------- check data format --------------------------------------------------------------------------------------//

	if (
		!(
			typeof receive_user_id === "number" &&
			Number.isInteger(receive_user_id)
		)
	) {
		//return invalid
		console.log("ERROR : inputId userId is null or invalid");
		return {
			statusCode: 401,
			body: "input data again",
		};
	}

	//-------- check token & get user id --------------------------------------------------------------------------------------//

	let tokenCheck;
	let returnBody;
	let id;

	try {
		tokenCheck = await checkToken(accessToken, refreshToken);
		returnBody = JSON.parse(tokenCheck.body);
		id = returnBody.tokenData.id;
	} catch (error) {
		//return invalid when token is invalid
		console.log("ERROR : the token value is null or invalid");
		return {
			statusCode: 410,
			body: "login again",
		};
	}

	//return invalid when token is invalid
	if (tokenCheck.statusCode !== 200) {
		console.log("ERROR : the token value is null or invalid");
		return {
			statusCode: 410,
			body: "login again",
		};
	}

	const returnToken = returnBody.accessToken;

	//console.log("id : ", id);

	//-------- get user data from DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where id = ?", [
			receive_user_id,
		]);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("SQL error: ", err);
		return {
			statusCode: 501,
			body: "SQL error: ",
		};
	}

	// check data is one
	if (sqlResult.length !== 1) {
		console.log("SQL error: ");
		return {
			statusCode: 501,
			body: "SQL error: ",
		};
	}

	const name = sqlResult[0].name;
	console.log("name : ", name);

	//-------- check notification_type_id and make message --------------------------------------------------------------------------------------//

	let message;
	let deep_link;
	let link;

	if (notification_type_id === 1) {
		message = "새로운 친구, " + name + "님이 가입했어요!";
		deep_link = "deeplink_for_1";
		link = "link_for_1";
	} else if (notification_type_id === 3) {
		message =
			name +
			"님의 티클링이 시작되었습니다!\n어서 " +
			name +
			"님의 기념일을 축하해주세요";
		deep_link = "deeplink_for_3";
		link = "link_for_3";
	} else if (notification_type_id === 5) {
		message = name + "님으로부터 티클이 도착했어요~! \n어서 확인해보세요";
		deep_link = "deeplink_for_5";
		link = "link_for_5";
	} else if (notification_type_id === 6) {
		message = "티클이 모두 모였습니다! 어서 상품을 수령하세요~";
		deep_link = "deeplink_for_6";
		link = "link_for_6";
	} else if (notification_type_id === 8) {
		message = "아쉽게도 " + name + "님이 보낸 티클을 환불했습니다🥲";
		deep_link = "deeplink_for_8";
		link = "link_for_8";
	} else {
	}

	const meta_data = {};
	meta_data["receive_user_id"] = receive_user_id;
	meta_data["source_user_id"] = id;

	//-------- add notification data to DB --------------------------------------------------------------------------------------//

	const insertQuery = `
		INSERT INTO notification
		(user_id, message, is_deleted, is_read, notification_type_id, deep_link, link, meta_data)
		VALUES (?, ?, 0, 0, ?, ?, ?, ?)
	  `;

	const values = [
		receive_user_id,
		message,
		notification_type_id,
		deep_link,
		link,
		JSON.stringify(meta_data),
	];

	try {
		const rows = await queryDatabase(insertQuery, values);
		sqlResult = rows;
		console.log("SQL result : ", sqlResult.insertId);
	} catch (err) {
		console.log("Database post error: ", err);
		return {
			statusCode: 502,
			body: err,
		};
	}

	//-------- send notification by SNS --------------------------------------------------------------------------------------//

	//-------- return result --------------------------------------------------------------------------------------//

	return {
		statusCode: 200,
		body: JSON.stringify({
			returnToken: returnToken,
			message: "sign up success!",
		}),
	};
};
