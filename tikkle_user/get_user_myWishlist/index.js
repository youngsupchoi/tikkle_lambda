const { queryDatabase } = require("db.js");

exports.get_user_myWishlist = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			`SELECT user_wish_list.product_id, user_wish_list.created_at, 
			products.name, products.price, products.description, products.sales_volume, products.quantity, products.category_id, products.created_at, products.views,
			products.is_deleted, products.wishlist_count, products.thumbnail_image, brands.brand_name
				FROM user_wish_list
				INNER JOIN products ON user_wish_list.product_id = products.id
				INNER JOIN brands ON products.brand_id = brands.id
				WHERE user_wish_list.user_id = ?
				ORDER BY user_wish_list.created_at DESC`,
			[id]
		);
		sqlResult = rows;
		console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(" get_user_myWishlist 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
			message_title: null,
			message_detail: null,
			data: null,
			message: "SQL error",
		};
		return res.status(501).send(return_body);
	}

	const retData = sqlResult;

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
