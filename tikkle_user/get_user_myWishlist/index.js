const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.get_user_myWishlist = async (req, res) => {
	const headers = req.headers;
	//const body = req.body;
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
		const rows = await queryDatabase(
			"SELECT * FROM user_wish_list " +
				"INNER JOIN products ON user_wish_list.product_id = products.id " +
				"WHERE user_wish_list.user_id = ?",
			[id]
		);
		sqlResult = rows;
		console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("SQL error: ", err);
		return {
			statusCode: 501,
			body: "SQL error: ",
		};
	}

	const retData = sqlResult;

	//-------- return result --------------------------------------------------------------------------------------//

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
			data: retData,
		}),
	};
};
