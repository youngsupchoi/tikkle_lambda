const { queryDatabase } = require("db.js");

exports.get_user_checkTikkling = async (req, res) => {
	const body = req.body;

	const id = req.id;
	const returnToken = req.returnToken;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			"SELECT * FROM tikkling WHERE user_id = ? AND state_id = 1;",
			[id]
		);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("get_user_checkTikkling에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	//-------- if tikkling --------------------------------------------------------------------------------------//
	if (sqlResult.length === 1) {
		const return_body = {
			success: true,
			data: sqlResult[0].id,
			message: "Tikkling",
			returnToken,
		};
		return res.status(201).send(return_body);
	}

	//-------- return --------------------------------------------------------------------------------------//
	const return_body = {
		success: true,
		data: 0,
		message: "Not Tikkling",
		returnToken,
	};
	return res.status(200).send(return_body);
};
