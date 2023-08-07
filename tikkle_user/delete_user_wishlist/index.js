const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.delete_user_wishlist = async (event) => {
	const headers = event.headers;
	const body = event.body;

	const productId = body.productId;
	const accessToken = headers.Authorization.accessToken;
	const refreshToken = headers.Authorization.refreshToken;

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

	//-------- delete data from DB --------------------------------------------------------------------------------------//

	const deleteQuery = `
    	DELETE FROM user_wish_list 
    	WHERE user_id = ? AND product_id = ?
		`;

	const values = [id, productId];

	try {
		const rows = await queryDatabase(deleteQuery, values);
		sqlResult = rows;
	} catch (err) {
		console.log("Database post error: ", err);
		return {
			statusCode: 501,
			body: err,
		};
	}

	console.log("result : ", sqlResult);

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
