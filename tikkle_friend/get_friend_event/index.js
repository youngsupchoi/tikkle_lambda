const { queryDatabase } = require("db.js");

exports.get_friend_event = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//main logic------------------------------------------------------------------------------------------------------------------//

	try {
		//유저의 차단되지 않은 친구중 다가오는 7일 이내에 생일이 있는 친구의 정보를 가져옴
		const rows = await queryDatabase(
			`SELECT 
      u.name, 
      u.birthday, 
      u.image, 
      u.is_tikkling
      FROM users u
      JOIN friends_relation fr ON u.id = fr.friend_user_id
      WHERE fr.central_user_id = ? 
      AND fr.relation_state_id <> 3  
      AND u.birthday BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY);`,
			[id]
		);
		let retrun_body;
		if (rows.length == 0) {
			return_body = {
				success: true,
				data: rows,
				message_title: null,
				message_detail: null,
				message: "생일인 친구가 없습니다.",
				returnToken,
			};
		} else {
			return_body = {
				success: true,
				data: rows,
				message_title: null,
				message_detail: null,
				message: "성공적으로 생일인 친구를 불러왔습니다.",
				returnToken,
			};
		}

		return res.status(200).send(return_body);
	} catch (err) {
		console.error(err);
		console.log("get_friend_event에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			message_title: null,
			message_detail: null,
			message: "서버에러",
		};
		return res.status(500).send(return_body);
	}
};
