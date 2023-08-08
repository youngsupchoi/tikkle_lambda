const AWS = require("aws-sdk");
const { checkToken } = require("token.js");
const { getSSMParameter } = require("ssm.js");

exports.get_image_profileSaveUrl = async (req) => {
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

	//-------- get url --------------------------------------------------------------------------------------//

	// Instantiate the S3 SDK client
	const s3 = new AWS.S3();
	const bucketname = await getSSMParameter("tikkleprofileS3");
	const filename = "tikkle-profile-" + id.toString() + ".JPG";

	//console.log("filename: ", filename);

	// Set the parameters for the pre-signed URL
	const params = {
		Bucket: bucketname,
		Key: filename,
		Expires: 360, // URL expiration time in seconds (e.g., 0.1 hour)
	};

	let url = null;

	try {
		url = await s3.getSignedUrl("putObject", params);
	} catch (error) {
		console.log(error);
		return {
			statusCode: 500,
			body: "url making fail : ",
		};
	}

	//-------- return data --------------------------------------------------------------------------------------//

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
			url: url,
		}),
	};
};
