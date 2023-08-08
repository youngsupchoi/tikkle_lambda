const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.post_user_wishlist = async (req, res) => {
	const headers = req.headers;
	const body = req.body;

	const productId = body.productId;
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

	//-------- get product data & check --------------------------------------------------------------------------------------//

	let sqlResult;

	const insertQuery = `
	INSERT INTO user_wish_list (user_id, product_id) 
	SELECT ?, p.id
	FROM products p 
	WHERE p.id = ? AND p.is_deleted = 0`;

	const values = [id, productId];

	try {
		const rows = await queryDatabase(insertQuery, values);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult.insertId);
	} catch (err) {
		console.log("Database post error: ", err);
		return {
			statusCode: 501,
			body: err,
		};
	}

	console.log("result : ", sqlResult);
	const retData = sqlResult;

	if (sqlResult.affectedRows === 0) {
		console.log("deleted product or already exist in wishlist");
		return {
			statusCode: 502,
			body: "deleted product or already exist in wishlist",
		};
	}

	//-------- add wishlist_count  --------------------------------------------------------------------------------------//

	// 재고 데이터 줄이기
	try {
		const rows = await queryDatabase(
			"UPDATE products SET wishlist_count = wishlist_count + ? WHERE id = ?",
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
			data: retData,
		}),
	};
};
