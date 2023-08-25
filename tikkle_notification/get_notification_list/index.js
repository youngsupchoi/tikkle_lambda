const { queryDatabase } = require("db.js");

exports.get_notification_list = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			`	SELECT n.*, nt.name AS notification_type_name
				FROM notification AS n
				INNER JOIN notification_type AS nt ON n.notification_type_id = nt.id
				WHERE n.user_id = ? AND n.is_deleted <> ?
				ORDER BY n.created_at DESC;`,
			[id, 1]
		);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(" get_notification_list 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	const retData = sqlResult;

	try {
		const rows = await queryDatabase(
			`	UPDATE notification
			SET is_read = 1
			WHERE user_id = ? AND is_deleted <> ?;`,
			[id, 1]
		);
	} catch (err) {
		console.log(" get_notification_list 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: retData,
		message_title: null,
		message_detail: null,
		detail_code: null,
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
