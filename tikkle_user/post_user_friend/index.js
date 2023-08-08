const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.post_user_friend = async (req) => {
	const headers = req.headers;
	const body = req.body;

	const friendId = body.friendId;
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

	//console.log("id : ", id);

	//-------- get friend data & check,   post friend data to DB if there is no friend data --------------------------------------------------------------------------------------//

	const insertQuery = `INSERT INTO friends_relation (central_user_id, friend_user_id, relation_state_id)
	SELECT ?, ?, ?
	WHERE NOT EXISTS (
		SELECT 1
		FROM friends_relation
		WHERE central_user_id = ? AND friend_user_id = ?
	);`;

	const values1 = [id, friendId, 1, id, friendId];
	const values2 = [friendId, id, 2, friendId, id];

	let ret1 = null;
	let ret2 = null;

	try {
		//데이터 없으면 추가
		ret1 = await queryDatabase(insertQuery, values1);

		//데이터 없으면 추가
		ret2 = await queryDatabase(insertQuery, values2);
	} catch (err) {
		console.log("Database post error: ", err);
		return {
			statusCode: 501,
			body: err,
		};
	}

	//-------- return result --------------------------------------------------------------------------------------//
	let message = "success";

	// console.log("ret1 : ", ret1);
	// console.log("ret2 : ", ret2);

	if (ret1.affectedRows !== 1) {
		message = "already friend";
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
			message: message,
		}),
	};
};
