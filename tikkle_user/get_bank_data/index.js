const { queryDatabase } = require("db.js");

exports.get_bank_data = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//-------- get bank data --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from bank", []);
		sqlResult = rows;
		console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("get_bank_data 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			detail_code: "01",
			message: "SQL error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
	}

	// check data is one
	if (sqlResult.length === 0) {
		console.log("get_bank_data 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			detail_code: "01",
			message: "SQL error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
	}

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: sqlResult,
		detail_code: "00",
		message: "success get bank info",
		returnToken: returnToken,
	};
	return res.status(200).send(return_body);
};
