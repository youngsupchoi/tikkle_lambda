const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.get_friend_data = async (event) => {
	const headers = event.headers;
	const body = event.body;
	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

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

	try {
		//차단된 친구 목록
		let rows;
		if (event.queryStrignParameters.mode === "block") {
			rows = await queryDatabase(
				"SELECT u.name, u.image, u.nick FROM users u INNER JOIN friends_relation fr ON u.id = fr.friend_user_id WHERE fr.relation_state_id = 3 AND fr.central_user_id = ?",
				[id]
			);
			//차단되지 않은 친구 목록
		} else if (event.queryStrignParameters.mode === "unblock") {
			rows = await queryDatabase(
				"SELECT u.name, u.image, u.nick FROM users u INNER JOIN friends_relation fr ON u.id = fr.friend_user_id WHERE fr.relation_state_id != 3 AND fr.central_user_id = ?",
				[id]
			);

			//확인한 친구에 대해 모두 친구로 전환
			await queryDatabase(
				"UPDATE friends_relation SET relation_state_id = 1 WHERE relation_state_id = 2 AND central_user_id = ?",
				[id]
			);
		} else {
			// parameter잘못된 mode를 전송
			const return_body = {
				success: false,
				data: "잘못된 mode",
			};
			console.log("잘못된 mode");
			return {
				statusCode: 400,
				body: JSON.stringify(return_body),
			};
		}

		const return_body = {
			success: true,
			data: rows,
			returnToken,
		};
		return {
			statusCode: 200,
			body: JSON.stringify(return_body),
		};
	} catch (err) {
		console.error("Failed to connect or execute query:", err);
		const return_body = {
			success: false,
			data: err,
		};
		return {
			statusCode: 500,
			body: JSON.stringify(return_body),
		};
	}
};
