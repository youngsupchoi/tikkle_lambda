const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.put_product_viewIncrease = async (event) => {
	const headers = event.headers;
	const body = event.body;

	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

	const productId = body.productId;

	//-------- check input --------------------------------------------------------------------------------------//

	//check productId
	if (
		!productId ||
		typeof productId !== "number" ||
		!Number.isInteger(productId)
	) {
		console.log("ERROR : productId value is null or invalid");
		return {
			statusCode: 401,
			body: "productId data error",
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

	//-------- increase view  --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			"UPDATE products SET  views =  views + ? WHERE id = ?",
			[1, productId]
		);

		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("SQL error: ", err);
		return {
			statusCode: 501,
			body: "SQL error: ",
		};
	}

	//-------- return result --------------------------------------------------------------------------------------//

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
			data: sqlResult,
		}),
	};
};
