const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.get_user_checkTikkling = async (req, res) => {
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

	//console.log("id : ", id);

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where id = ?", [
			id,
		]);
		sqlResult = rows;
		console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("SQL error: ", err);
		return {
			statusCode: 501,
			body: "SQL error: ",
		};
	}

	// check data is one
	if (sqlResult.length !== 1) {
		console.log("SQL error: ", err);
		return {
			statusCode: 501,
			body: "SQL error: ",
		};
	}

	const is_tikkling = sqlResult[0].is_tikkling;
	// console.log('is tikkling : ',is_tikkling);

	//-------- return result --------------------------------------------------------------------------------------//
	if (is_tikkling === 1) {
		return {
			statusCode: 201,
			body: JSON.stringify({
				accessToken: returnToken,
				is_tikkling: is_tikkling,
			}),
		};
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
			is_tikkling: is_tikkling,
		}),
	};
};
