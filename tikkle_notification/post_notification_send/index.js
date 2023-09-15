const { queryDatabase } = require("db.js");

exports.post_notification_send = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	let receive_user_id = body.receive_user_id;
	const notification_type_id = body.notification_type_id;

	//-------- get user data from DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where id = ?", [id]);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("post_notification_send 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			detail_code: "02",
			message: "SQL error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
	}

	// check data is one
	if (sqlResult.length !== 1) {
		console.log("post_notification_send 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			detail_code: "02",
			message: "SQL error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
	}

	const name = sqlResult[0].name;
	const profile = sqlResult[0].image;
	//console.log("name : ", name);

	//-------- check notification_type_id and make message --------------------------------------------------------------------------------------//
	const meta_data = profile;

	let message;
	let deep_link;
	let link;
	let source_user_id;

	if (notification_type_id === 1) {
		message = name + "님이 가입했어요.";
		deep_link = "deeplink_for_1";
		link = "link_for_1";
		source_user_id = id;
	} else if (notification_type_id === 3) {
		message = name + "님의 티클링이 시작되었어요.";
		deep_link = "deeplink_for_3";
		link = "link_for_3";
		source_user_id = id;
	} else if (notification_type_id === 5) {
		message = name + "님이 보낸 티클을 확인해보세요.";
		deep_link = "deeplink_for_5";
		link = "link_for_5";
		source_user_id = id;

		//receive_user_id 대신 tikkling id 가오는 상황이라 쿼리로 바꿔줌
		let sqlResult_tikkling;

		try {
			const rows = await queryDatabase(
				"select user_id from tikkling where id = ?",
				[receive_user_id]
			);
			sqlResult_tikkling = rows;
			//console.log("SQL result : ", sqlResult_tikkling);
		} catch (err) {
			console.log("post_notification_send 에서 에러가 발생했습니다.", err);
			const return_body = {
				success: false,
				detail_code: "02",
				message: "SQL error",
				returnToken: null,
			};
			return res.status(500).send(return_body);
		}

		receive_user_id = sqlResult_tikkling[0].user_id;
	} else if (notification_type_id === 6) {
		message = "티끌링이 완료되어 배송이 시작되었어요.";
		deep_link = "deeplink_for_6";
		link = "link_for_6";
		source_user_id = id;
		receive_user_id = id;
	} else if (notification_type_id === 8) {
		message = name + "님이 티클을 환불했어요.";
		deep_link = "deeplink_for_8";
		link = "link_for_8";
		source_user_id = id;

		//receive_user_id 대신 tikkling id 가오는 상황이라 쿼리로 바꿔줌
		let sqlResult_tikkling;

		try {
			const rows = await queryDatabase(
				"select user_id from tikkling where id = ?",
				[receive_user_id]
			);
			sqlResult_tikkling = rows;
			//console.log("SQL result : ", sqlResult_tikkling);
		} catch (err) {
			console.log("post_notification_send 에서 에러가 발생했습니다.", err);
			const return_body = {
				success: false,
				detail_code: "02",
				message: "SQL error",
				returnToken: null,
			};
			return res.status(500).send(return_body);
		}

		receive_user_id = sqlResult_tikkling[0].user_id;
	} else {
	}

	//-------- get friend ID from DB or set receive user ID --------------------------------------------------------------------------------------//
	let receiver;

	if (notification_type_id === 1 || notification_type_id === 3) {
		try {
			const rows = await queryDatabase(
				`
			SELECT friend_user_id  
			FROM friends_relation 
			WHERE central_user_id = ? 
				AND relation_state_id <> 3
			`,
				[id]
			);
			receiver = rows;
			// console.log("SQL result : ", receiver);
		} catch (err) {
			console.log("post_notification_send 에서 에러가 발생했습니다.", err);
			const return_body = {
				success: false,
				detail_code: "02",
				message: "SQL error",
				returnToken: null,
			};
			return res.status(500).send(return_body);
		}
	} else if (
		notification_type_id === 5 ||
		notification_type_id === 6 ||
		notification_type_id === 8
	) {
		receiver = [];
		const a = { friend_user_id: receive_user_id };
		receiver.push(a);
	}

	//console.log("reciver : ", receiver);

	//-------- add notification data to DB --------------------------------------------------------------------------------------//

	if (receiver.length > 0) {
		let notificationValues = "";
		for (let i = 0; i < receiver.length; i++) {
			notificationValues += "(";
			notificationValues += `${receiver[i].friend_user_id},`;
			notificationValues += `'${message}', `;
			notificationValues += `0, `;
			notificationValues += `0, `;
			notificationValues += `${notification_type_id}, `;
			notificationValues += `'${deep_link}', `;
			notificationValues += `'${link}', `;
			notificationValues += `${meta_data}, `;
			notificationValues += `${source_user_id} `;
			notificationValues += ")";
			if (i < receiver.length - 1) notificationValues += ", ";
		}

		//console.log("notification : ", notificationValues);d

		await queryDatabase(
			`INSERT INTO notification
			(user_id, message, is_deleted, is_read, notification_type_id, deep_link, link, meta_data, source_user_id) 
			VALUES ${notificationValues}`
		);
	}

	//-------- send notification by SNS --------------------------------------------------------------------------------------//

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		detail_code: "00",
		message: "send notification success!",
		returnToken: returnToken,
	};
	return res.status(200).send(return_body);
};
