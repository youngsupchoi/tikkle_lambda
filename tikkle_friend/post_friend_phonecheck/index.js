const { queryDatabase } = require("db.js");

exports.post_friend_phonecheck = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//main logic------------------------------------------------------------------------------------------------------------------//
	try {
		// phone_list가 문자열 배열인지 확인
		const phone_list = body.phone_list;

		if (
			!Array.isArray(phone_list) ||
			!phone_list.every((phone) => typeof phone === "string")
		) {
			throw new Error("입력 오류: phone_list는 문자열의 배열이어야 합니다.");
		}

		// 배열이 비어 있는지 확인
		if (phone_list.length === 0) {
			throw new Error("입력 오류: phone_list는 빈 배열이면 안 됩니다.");
		}
		// phone_list에 있는 전화번호들을 DB에서 조회
		let phoneListStr = phone_list.map((phone) => `'${phone}'`).join(",");
		const query = `SELECT * FROM phones WHERE phone IN (${phoneListStr})`;
		const rows = await queryDatabase(query);

		const return_body = {
			success: true,
			data: rows,
			message_title: null,
			message_detail: null,
			message: "전화번호 조회 성공",
			returnToken,
		};
		return res.status(200).send(return_body);
	} catch (error) {
		console.log("에러 : ", error);
		if (
			error.message === "입력 오류: phone_list는 문자열의 배열이어야 합니다." ||
			error.message === "입력 오류: phone_list는 빈 배열이면 안 됩니다."
		) {
			const return_body = {
				success: false,
				message_title: null,
				message_detail: null,
				message: "잘못된 요청: " + error.message,
			};
			return res.status(400).send(return_body);
		} else {
			const return_body = {
				success: false,
				message_title: null,
				message_detail: null,
				message: "서버 오류",
			};
			console.log("post_friend_phonecheck에서 문제가 발생했습니다.");
			return res.status(500).send(return_body);
		}
	}
};
