const { queryDatabase } = require("db.js");

exports.post_product_info = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	const productId = body.productId;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			` SELECT p.*, b.brand_name, pc.name AS cat_name, uwl.product_id AS wishlisted
				FROM products p
				INNER JOIN brands b ON p.brand_id = b.id
				INNER JOIN product_category pc ON p.category_id = pc.id
				LEFT JOIN user_wish_list uwl ON p.id = uwl.product_id
				WHERE p.id = ? AND uwl.user_id = ?;
		`,
			[productId, id]
		);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("post_product_info 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			detail_code: "00",
			message: "SQL error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
	}

	// check data is one
	if (sqlResult.length !== 1) {
		console.log(" post_product_info 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			detail_code: "00",
			message: "SQL error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
	}

	const retData = sqlResult[0];

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: retData,
		detail_code: "00",
		message: "success get product info",
		returnToken: returnToken,
	};
	return res.status(200).send(return_body);
};
