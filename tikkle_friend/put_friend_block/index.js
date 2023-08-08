const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.put_friend_block = async (req, res) => {
	//재설정하고자 하는 친구의 user_id
	const target_friend_id = req.body.friend_id;

	const headers = req.headers;
	const body = req.body;
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

	//-------- check DB --------------------------------------------------------------------------------------//

	try {
		//이미 차단한 친구라면 차단을 해제, 아니라면 차단
		await queryDatabase(
			`UPDATE friends_relation 
       SET relation_state_id = CASE WHEN relation_state_id = 3 THEN 1 ELSE 3 END 
       WHERE central_user_id = ? and friend_user_id = ?`,
			[id, target_friend_id]
		);

		const return_body = {
			success: true,
			returnToken,
		};
		return {
			statusCode: 200,
			body: JSON.stringify(return_body),
		};
	} catch (err) {
		console.error("Failed to connect or execute query:", err);
		console.log("put_friend_block에서 문제가 발생했습니다.");
		const return_body = {
			success: false,
			message: "서버 에러",
		};
		return {
			statusCode: 500,
			body: JSON.stringify(return_body),
		};
	}
};
