const { queryDatabase } = require("db.js");

exports.delete_user_wishlist = async (req, res) => {
	const body = req.body;
	const productId = body.productid;

	const id = req.id;
	const returnToken = req.returnToken;

	//-------- delete data from DB --------------------------------------------------------------------------------------//
	let sqlResult = null;

	const deleteQuery = `
    	DELETE FROM user_wish_list 
    	WHERE user_id = ? AND product_id = ?
		`;

	const values = [id, productId];

	try {
		const rows = await queryDatabase(deleteQuery, values);
		sqlResult = rows;
	} catch (err) {
		console.log("delete_user_whishlist에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			data: null,
			message_title: null,
			message_detail: null,
			message: "Database post error",
		};
		return res.status(501).send(return_body);
	}

	console.log("result : ", sqlResult);

	const retData = sqlResult;

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: retData,
		message_title: null,
		message_detail: null,
		detail_code: null,
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
