const { checkToken } = require("token.js");

exports.get_auth_checkToken = async (req, res) => {
	const headers = req.headers;
	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

	// console.log("headers : ", headers);
	// console.log("accessToken : ", accessToken);
	// console.log("refreshToken : ", refreshToken);

	//---- check token is exist ----//

	const maxLength = 500;

	//check input value
	if (
		!accessToken ||
		!refreshToken ||
		typeof accessToken !== "string" ||
		typeof refreshToken !== "string" ||
		accessToken.length > maxLength ||
		refreshToken.length > maxLength
	) {
		//return invalid
		console.log("ERROR : the token value is null or invalid");
		return {
			statusCode: 401,
			body: "Log in again",
		};
	}

	//---- check token is valid & refresh Access token ----//

	const tokenCheck = await checkToken(accessToken, refreshToken);

	//return invalid when token is invalid
	if (tokenCheck.statusCode !== 200) {
		console.log("ERROR : the token value is null or invalid");
		return {
			statusCode: 401,
			body: "Log in again",
		};
	}

	const returnBody = JSON.parse(tokenCheck.body);
	// console.log("tokenCheck : ", typeof returnBody);

	//---- return success ----//

	const returnToken = returnBody.accessToken;
	//console.log(returnToken);
	if (!refreshToken) {
		return {
			statusCode: 200,
			body: null,
		};
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
		}),
	};
};
