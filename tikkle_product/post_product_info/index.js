const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.post_product_info = async (req) => {
	const headers = req.headers;
	const body = req.body;
	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

	const productId = body.productId;

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
			"select * from products where id = ?",
			[productId]
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

	// check data is one
	if (sqlResult.length !== 1) {
		console.log("SQL error: ");
		return {
			statusCode: 501,
			body: "SQL error: ",
		};
	}

	const retData = sqlResult[0];

	//-------- return result --------------------------------------------------------------------------------------//

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
			data: retData,
		}),
	};
};
