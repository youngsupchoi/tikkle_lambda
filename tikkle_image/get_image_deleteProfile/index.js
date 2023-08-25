const { queryDatabase } = require("db.js");

const { getSSMParameter } = require("ssm.js");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();

exports.get_image_deleteProfile = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

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
		console.log(" get_image_deleteProfile 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			detail_code: "01",
			message: "SQL error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
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
		console.log("get_image_deleteProfile 에서 에러가 발생했습니다.", error);
		const return_body = {
			success: false,
			detail_code: "02",
			message: "Error deleting src object in s3",
			returnToken: null,
		};
		return res.status(500).send(return_body);
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
			console.log("get_image_deleteProfile 에서 에러가 발생했습니다.", error);
			const return_body = {
				success: false,
				detail_code: "03",
				message: "Error deleting object in s3 : " + imageSize[i],
				returnToken: null,
			};
			return res.status(500).send(return_body);
		}
	}
	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: sqlResult,
		detail_code: "10",
		message: "success to delete profile image",
		returnToken: returnToken,
	};
	return res.status(200).send(return_body);
};
