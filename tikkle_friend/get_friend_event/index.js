const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.get_friend_event = async (req, res) => {
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

	try {
		//유저의 차단되지 않은 친구중 다가오는 7일 이내에 생일이 있는 친구의 정보를 가져옴(이번달, 다음달을 구분하여 고려)
		const rows = await queryDatabase(
			"SELECT u.name, u.birthday, u.image, u.is_tikkling FROM users u INNER JOIN friends_relation fr ON u.id = fr.friend_user_id WHERE fr.central_user_id = ? AND fr.relation_state_id != 3 AND ((MONTH(u.birthday) = MONTH(CURDATE()) AND DAY(u.birthday) >= DAY(CURDATE())) OR (MONTH(u.birthday) = MONTH(DATE_ADD(CURDATE(), INTERVAL 7 DAY)) AND DAY(u.birthday) <= DAY(DATE_ADD(CURDATE(), INTERVAL 7 DAY))));",
			[id]
		);
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
