const { queryDatabase } = require("db.js");

exports.get_tikkling_friendinfo = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//main logic------------------------------------------------------------------------------------------------------------------//

	try {
		const rows = await queryDatabase(
			"SELECT * FROM active_tikkling_view INNER JOIN (SELECT * FROM users WHERE id IN (SELECT friend_user_id FROM friends_relation WHERE central_user_id = 2 and relation_state_id = 1)) AS users ON active_tikkling_view.user_id = users.id;",
			[id]
		);

		const return_body = {
			success: true,
			data: rows,
			message: "친구의 티클링 정보 조회 성공",
			returnToken,
		};
		return res.status(200).send(return_body);
	} catch (err) {
		console.error("Failed to connect or execute query:", err);
		const return_body = {
			success: false,
			message: "서버 에러",
		};
		console.log("get_tikkling_friendinfo에서 문제가 발생했습니다.");
		return res.status(500).send(return_body);
	}
};
