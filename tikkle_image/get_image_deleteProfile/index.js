const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
const { getSSMParameter } = require("ssm.js");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.get_image_deleteProfile = async (event) => {
	const headers = event.headers;
	const body = event.body;

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

	//-------- delete user image data  --------------------------------------------------------------------------------------//
	let sqlResult;
	// 재고 데이터 줄이기
	try {
		const rows = await queryDatabase(
			"UPDATE users SET image = ? WHERE id = ?",
			[null, id]
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

	//-------- delete user image s3 file  --------------------------------------------------------------------------------------//

	const src_filename = "tikkle-profile-" + id.toString() + ".JPG";
	const bucket_src = await getSSMParameter("tikkleprofileS3");

	// Delete src image
	try {
		const deleteParams = {
			Bucket: bucket_src,
			Key: src_filename,
		};

		await s3.deleteObject(deleteParams).promise();

		console.log("Src Object deleted successfully");
	} catch (error) {
		console.error("Error deleting src object in s3:", error);
		return {
			statusCode: 502,
			body: JSON.stringify("Error deletingsrc  object in s3"),
		};
	}

	const bucket_online = await getSSMParameter("s3_image_buket");
	const online_filename = id.toString() + ".JPG";

	const imageSize = [36, 48, 64, 128];

	for (let i = 0; i < imageSize.length; i++) {
		const bucket = bucket_online + "/profile/" + imageSize[i];

		// Delete the object
		try {
			const deleteParams = {
				Bucket: bucket,
				Key: online_filename,
			};

			await s3.deleteObject(deleteParams).promise();

			console.log("Object deleted successfully", imageSize[i]);
		} catch (error) {
			console.error(
				"Error deleting object in s3 : ",
				imageSize[i],
				"\n",
				error
			);
			return {
				statusCode: 502,
				body: "Error deleting object in s3 : " + imageSize[i] + "\n",
			};
		}
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
