const { queryDatabase } = require("db.js");

exports.get_user_isNotice = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			`	SELECT *
				FROM notification
				WHERE user_id = ? AND is_read = 0
				ORDER BY created_at DESC;`,
			[id]
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

	const retlen = sqlResult.length;

	//-------- return result --------------------------------------------------------------------------------------//

	if (retlen === 0) {
		const return_body = {
			success: true,
			message_title: null,
			message_detail: null,
			message: "No notification!",
			data: { is_notification: false },
			returnToken,
		};
		return res.status(200).send(return_body);
	} else {
		const return_body = {
			success: true,
			message_title: null,
			message_detail: null,
			message: "There is notification you should read!",
			data: { is_notification: true },
			returnToken,
		};
		return res.status(201).send(return_body);
	}
};
