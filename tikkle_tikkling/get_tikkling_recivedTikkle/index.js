const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.get_tikkling_recivedTikkle = async (event) => {
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

	//main logic---------------------------------------------------------------
	const returnToken = returnBody.accessToken;

	try {
		//티클링 종료
		const rows = await queryDatabase(
			"SELECT * FROM sending_tikkle WHERE tikkling_id = ?;",
			[event.body.tikkling_id]
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
