const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.get_tikkling_friendinfo = async (req) => {
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

	//main logic---------------------------------------------------------------
	const returnToken = returnBody.accessToken;
	try {
		const rows = await queryDatabase(
			"SELECT * FROM active_tikkling_view INNER JOIN (SELECT * FROM users WHERE id IN (SELECT friend_user_id FROM friends_relation WHERE central_user_id = 2 and relation_state_id = 1)) AS users ON active_tikkling_view.user_id = users.id;",
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
