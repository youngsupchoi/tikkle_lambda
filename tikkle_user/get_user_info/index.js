const { queryDatabase } = require("db.js");

exports.get_user_info = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from users where id = ?", [id]);
		sqlResult = rows;
		console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(" get_user_info 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	// check data is one
	if (sqlResult.length !== 1) {
		console.log(" get_user_info 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	//-------- return result --------------------------------------------------------------------------------------//

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: sqlResult[0],
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
