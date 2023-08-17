const { queryDatabase } = require("db.js");

exports.get_user_paymentHistory = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		const rows = await queryDatabase(
			`	SELECT st.id AS sending_id, st.created_at AS send_at, st.message, st.quantity AS send_quantity,
								st.tikkling_id, t.funding_limit, t.created_at AS tikkling_created_at , t.tikkle_quantity, t.terminated_at AS tikkling_terminated_at,
								t.state_id, ts.name AS state_name,
								t.product_id, p.name AS product_name, p.price AS product_price, p.thumbnail_image AS product_image,
								st.user_id AS receiver_id, u.name AS user_name, u.nick AS user_nick, u.image AS user_image
				FROM sending_tikkle as st
				INNER JOIN tikkling as t ON st.tikkling_id = t.id
				INNER JOIN tikkling_state as ts ON t.state_id = ts.id
				INNER JOIN products as p ON t.product_id = p.id
				INNER JOIN users as u ON st.user_id = u.id
				WHERE st.user_id = ?
				ORDER BY st.created_at DESC
			`,
			[id]
		);
		sqlResult = rows;
		//console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(" get_user_paymentHistory 에서 에러가 발생했습니다.", err);
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
