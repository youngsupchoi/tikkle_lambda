const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.get_user_checkTikkling = async (req, res) => {
	const body = req.body;

	const id = req.id;
	const returnToken = req.returnToken;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where id = ?", [
			id,
		]);
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

	// check data is one
	if (sqlResult.length !== 1) {
		console.log("get_user_checkTikkling에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	const is_tikkling = sqlResult[0].is_tikkling;
	// console.log('is tikkling : ',is_tikkling);

	//-------- return result --------------------------------------------------------------------------------------//
	if (is_tikkling === 1) {
		const return_body = {
			success: true,
			data: is_tikkling,
			message: "success",
			returnToken,
		};
		return res.status(201).send(return_body);
	}

	const return_body = {
		success: true,
		data: is_tikkling,
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
