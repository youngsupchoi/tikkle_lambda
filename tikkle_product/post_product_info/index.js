const { queryDatabase } = require("db.js");

exports.post_product_info = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	const productId = body.productId;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase("select * from products where id = ?", [
			productId,
		]);
		sqlResult = rows;
		console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(" post_product_info 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	// check data is one
	if (sqlResult.length !== 1) {
		console.log(" post_product_info 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	const retData = sqlResult[0];

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: retData,
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
