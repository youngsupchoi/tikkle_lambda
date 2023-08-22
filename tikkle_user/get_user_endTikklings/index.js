const { queryDatabase } = require("db.js");

exports.get_user_endTikklings = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			`SELECT tikkling.user_id, tikkling.type AS tikkling_type, tikkling.funding_limit, tikkling.created_at, tikkling.tikkle_quantity, tikkling.terminated_at, tikkling.product_id, tikkling.terminated_at,
			tikkling.state_id, tikkling_state.name AS state_name,
			products.name AS product_name, products.price, products.description, products.sales_volume, products.quantity, products.views,
			products.is_deleted, products.wishlist_count, products.thumbnail_image, brands.brand_name
			FROM tikkling 
			INNER JOIN tikkling_state ON tikkling.state_id = tikkling_state.id
			INNER JOIN products ON tikkling.product_id = products.id
			INNER JOIN brands ON products.brand_id = brands.id
			WHERE user_id = ? and terminated_at IS NOT NULL`,
			[id]
		);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log("get_user_endTikklings 에서 에러가 발생했습니다.", err);
		const return_body = {
			success: false,
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
		message: "success",
		returnToken,
	};
	return res.status(200).send(return_body);
};
