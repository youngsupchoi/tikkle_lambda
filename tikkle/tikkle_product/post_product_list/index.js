const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.post_product_list = async (event) => {
	const headers = event.headers;
	const body = event.body;
	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

	const category_id = body.category_id;
	let priceMin = body.priceMin;
	let priceMax = body.priceMax;
	const sortAttribute = body.sortAttribute;
	const sortWay = body.sortWay;
	let search = body.search;
	const getNum = body.getNum;

	//-------- check input --------------------------------------------------------------------------------------//

	//check category_id
	if (
		!category_id ||
		typeof category_id !== "number" ||
		!Number.isInteger(category_id) ||
		category_id > 20
	) {
		console.log("ERROR : category_id value is null or invalid");
		return {
			statusCode: 401,
			body: "category_id data error",
		};
	}

	//check priceMin, priceMax
	if (!priceMin) {
		priceMin = 0;
	}
	if (!priceMax) {
		priceMax = 9999999999;
	}

	if (
		typeof priceMin !== "number" ||
		typeof priceMax !== "number" ||
		!Number.isInteger(priceMin) ||
		!Number.isInteger(priceMax) ||
		priceMin < 0 ||
		priceMax < priceMin ||
		priceMax > 9999999999 ||
		priceMax < 0
	) {
		console.log("ERROR : priceMin or priceMax value is null or invalid");
		return {
			statusCode: 402,
			body: "price data error",
		};
	}

	//check sortAttribute
	if (
		!sortAttribute ||
		typeof sortAttribute !== "string" ||
		sortAttribute.length > 30
	) {
		//return invalid
		console.log("ERROR : sortAttribute value is null or invalid");
		return {
			statusCode: 403,
			body: "sortAttribute data error",
		};
	}
	if (
		sortAttribute != "sales_volume" &&
		sortAttribute != "price" &&
		sortAttribute != "views" &&
		sortAttribute != "wishlist_count"
	) {
		//return invalid
		console.log("ERROR : sortAttribute value is null or invalid");
		return {
			statusCode: 403,
			body: "sortAttribute data error",
		};
	}

	//check sortWay
	if (
		!sortWay ||
		typeof sortWay !== "string" ||
		(sortWay !== "ASC" && sortWay !== "DESC")
	) {
		//return invalid
		console.log("ERROR : sortWay value is null or invalid");
		return {
			statusCode: 405,
			body: "sortWay data error",
		};
	}

	//check search
	if (search && (typeof search !== "string" || search.length > 100)) {
		//return invalid
		console.log("ERROR : search value is invalid");
		return {
			statusCode: 406,
			body: "search data error",
		};
	}

	//check getNum
	if (
		!getNum ||
		typeof getNum !== "number" ||
		!Number.isInteger(getNum) ||
		getNum < 0 ||
		getNum > 100
	) {
		console.log("ERROR : getNum value is null or invalid");
		return {
			statusCode: 407,
			body: "getNum data error",
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

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		let rows;
		if (!search) {
			rows = await queryDatabase(
				`SELECT * 
				FROM products
				WHERE category_id = ?
				AND price BETWEEN ? AND ?
				AND is_deleted = 0
				ORDER BY ${sortAttribute} ${sortWay}
				LIMIT ? ;`,
				[category_id, priceMin, priceMax, getNum]
			);
		} else {
			rows = await queryDatabase(
				`SELECT * 
			FROM products
			WHERE category_id = ?
			AND price BETWEEN ? AND ?
			AND is_deleted = 0
			AND (name LIKE '%${search}%' OR description LIKE '%${search}%')
			ORDER BY ${sortAttribute} ${sortWay}
			LIMIT ? ;`,
				[category_id, priceMin, priceMax, getNum]
			);
		}

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
