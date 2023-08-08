const jwt = require("jsonwebtoken");
const { queryDatabase } = require("db.js");
const { getSSMParameter } = require("ssm.js");

exports.post_auth_tokenGenerate = async (req) => {
	const body = req.body;
	const userId = body.id;

	//---- check user id ----//

	//check input value
	if (typeof userId !== "number" || isNaN(userId)) {
		console.log("ERROR : id value is null or invalid");
		return {
			statusCode: 401,
			body: "invalid id",
		};
	} else {
		const idString = userId.toString();
		if (idString.length > 11) {
			console.log("ERROR : id value is null or invalid");
			return {
				statusCode: 401,
				body: "invalid id",
			};
		}
	}

	//---- check database ----//

	let sqlResult;

	try {
		const rows = await queryDatabase("SELECT * FROM users WHERE id = ?", [
			userId,
		]);
		sqlResult = rows;

		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("Database connection error: ", err);
		return {
			statusCode: 501,
			body: err,
		};
	}

	// no data
	if (sqlResult.length !== 1) {
		console.log("There is no user of input id");
		return {
			statusCode: 402,
			body: "no user of input id",
		};
	}

	// deleted user
	// console.log("type: ", typeof sqlResult);
	// console.log("data: ", sqlResult[0].is_deleted);

	if (sqlResult[0].is_deleted === 1) {
		console.log("Deleted user");
		return {
			statusCode: 403,
			body: "Deleted user",
		};
	}

	//---- generate tokken ----//

	let accessToken = null;
	let refreshToken = null;

	// generate token
	try {
		accessToken = await generateAccessToken(userId);
		refreshToken = await generateRefreshToken(userId);
	} catch (error) {
		console.log("ERROR : cannot make token");
		return {
			statusCode: 500,
			body: error,
		};
	}

	//---- return success ----//

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: accessToken,
			refreshToken: refreshToken,
		}),
	};
};

const generateAccessToken = async (id) => {
	const issuer = await getSSMParameter("issuer");
	const accessTokenSecret = await getSSMParameter("accessTokenSecret");

	const accessTokenPayload = {
		id,
		iat: Math.floor(Date.now() / 1000), // Issued At timestamp in seconds
		exp: Math.floor(Date.now() / 1000) + 15 * 60, // Expiration time in seconds (15 minutes)
		iss: issuer, // Use the environment variable directly
		// Add any additional claims as needed
	};

	// Generate the access token
	const accessToken = jwt.sign(accessTokenPayload, accessTokenSecret);

	return accessToken;
};

// Helper function to generate a refresh token
const generateRefreshToken = async (id) => {
	const issuer = await getSSMParameter("issuer");
	const refreshTokenSecret = await getSSMParameter("refreshTokenSecret");

	const refreshTokenPayload = {
		id,
		iat: Math.floor(Date.now() / 1000), // Issued At timestamp in seconds
		exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // Expiration time in seconds (30 days)
		iss: issuer,
	};

	// Generate the refresh token
	const refreshToken = jwt.sign(refreshTokenPayload, refreshTokenSecret);

	return refreshToken;
};
