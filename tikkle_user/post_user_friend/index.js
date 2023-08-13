const { queryDatabase } = require("db.js");

exports.post_user_friend = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	const friendId = body.friendId;

	//-------- get friend data & check,   post friend data to DB if there is no friend data --------------------------------------------------------------------------------------//

	const insertQuery = `INSERT INTO friends_relation (central_user_id, friend_user_id, relation_state_id)
	SELECT ?, ?, ?
	WHERE NOT EXISTS (
		SELECT 1
		FROM friends_relation
		WHERE central_user_id = ? AND friend_user_id = ?
	);`;

	const values1 = [id, friendId, 1, id, friendId];
	const values2 = [friendId, id, 2, friendId, id];

	let ret1 = null;
	let ret2 = null;

	try {
		//데이터 없으면 추가
		ret1 = await queryDatabase(insertQuery, values1);

		//데이터 없으면 추가
		ret2 = await queryDatabase(insertQuery, values2);
	} catch (err) {
		console.log(" post_user_friend 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	//-------- return result --------------------------------------------------------------------------------------//
	let message = "success";

	// console.log("ret1 : ", ret1);
	// console.log("ret2 : ", ret2);

	if (ret1.affectedRows !== 1) {
		message = "already friend";
	}

	const return_body = {
		success: true,
		data: null,
		message: message,
		returnToken,
	};
	return res.status(200).send(return_body);
};
