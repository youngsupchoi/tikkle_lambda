const { queryDatabase } = require("db.js");

exports.post_user_wishlist = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	const productId = body.productId;

	//-------- get product data & check --------------------------------------------------------------------------------------//

	let sqlResult;

	const insertQuery = `
	INSERT INTO user_wish_list (user_id, product_id) 
	SELECT ?, p.id
	FROM products p 
	WHERE p.id = ? AND p.is_deleted = 0`;

	const values = [id, productId];

	try {
		const rows = await queryDatabase(insertQuery, values);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult.insertId);
	} catch (err) {
		console.log(" post_user_wishlist 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	console.log("result : ", sqlResult);
	const retData = sqlResult;

	if (sqlResult.affectedRows === 0) {
		console.log(" post_user_wishlist 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "deleted product or already exist in wishlist",
		};
		return res.status(502).send(return_body);
	}

	//-------- add wishlist_count  --------------------------------------------------------------------------------------//

	// 재고 데이터 줄이기
	try {
		const rows = await queryDatabase(
			"UPDATE products SET wishlist_count = wishlist_count + ? WHERE id = ?",
			[1, productId]
		);

		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(" post_user_wishlist 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: retData,
		message_title: null,
		message_detail: null,
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
