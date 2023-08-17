const { queryDatabase } = require("db.js");

exports.put_user_nick = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	const nick = body.nick;

	//-------- check nick --------------------------------------------------------------------------------------//

	//check nick
	if (!nick || typeof nick !== "string" || nick.length > 12) {
		console.log("put_user_nick의 입력 데이터에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "nick value is null or invalid",
		};
		return res.status(401).send(return_body);
	}

	//--------  update nick  --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			`	UPDATE users
				SET	nick = ?
				WHERE	id = ?
			`,
			[nick, id]
		);

		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("put_user_nick의 query에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: nick,
		message: "success to update nick",
		returnToken,
	};
	return res.status(200).send(return_body);
};
