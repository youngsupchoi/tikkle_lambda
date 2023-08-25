const AWS = require("aws-sdk");

const { getSSMParameter } = require("ssm.js");

exports.get_image_profileSaveUrl = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

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
		console.log(" get_image_profileSaveUrl 에서 에러가 발생했습니다.", error);
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "url making fail",
		};
		return res.status(500).send(return_body);
	}

	//-------- return data --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: url,
		message_title: null,
		message_detail: null,
		detail_code: null,
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
