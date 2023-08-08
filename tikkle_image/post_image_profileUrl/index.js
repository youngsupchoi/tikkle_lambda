const { checkToken } = require("token.js");
const { queryDatabase } = require("db.js");

exports.post_image_profileUrl = async (req) => {
	const headers = req.headers;
	const body = req.body;
	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

	const imageSize = body.imageSize.toString();
	const userId = body.userId;

	//-------- check body data --------------------------------------------------------------------------------------//

	if (
		!imageSize ||
		(imageSize !== "36" &&
			imageSize !== "48" &&
			imageSize !== "64" &&
			imageSize !== "128" &&
			imageSize !== "0")
	) {
		console.log("ERROR : size value is null or invalid");
		return {
			statusCode: 401,
			body: "input image size again",
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

	//-------- get profile urls --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where id = ?", [
			userId,
		]);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
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

	const retData = JSON.parse(sqlResult[0].image);
	const url = retData[imageSize];

	//-------- return data --------------------------------------------------------------------------------------//

	if (imageSize === "0") {
		return {
			statusCode: 201,
			body: JSON.stringify({
				accessToken: returnToken,
				url: JSON.stringify(retData),
			}),
		};
	}
	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
			url: url,
		}),
	};
};
