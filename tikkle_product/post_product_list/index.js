const { queryDatabase } = require("db.js");

exports.post_product_list = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	const category_id = body.category_id;
	let priceMin = body.priceMin;
	let priceMax = body.priceMax;
	const sortAttribute = body.sortAttribute;
	const sortWay = body.sortWay;
	let search = body.search;
	const getNum = body.getNum;

	//-------- check input --------------------------------------------------------------------------------------//

	//check category_id
	if (
		!category_id ||
		typeof category_id !== "number" ||
		!Number.isInteger(category_id) ||
		category_id > 20
	) {
		console.log(" post_product_list 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "category_id value is null or invalid",
		};
		return res.status(401).send(return_body);
	}

	//check priceMin, priceMax
	if (!priceMin) {
		priceMin = 0;
	}
	if (!priceMax) {
		priceMax = 9999999999;
	}

	if (
		typeof priceMin !== "number" ||
		typeof priceMax !== "number" ||
		!Number.isInteger(priceMin) ||
		!Number.isInteger(priceMax) ||
		priceMin < 0 ||
		priceMax < priceMin ||
		priceMax > 9999999999 ||
		priceMax < 0
	) {
		console.log(" post_product_list 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "priceMin or priceMax value is null or invalid",
		};
		return res.status(402).send(return_body);
	}

	//check sortAttribute
	if (
		!sortAttribute ||
		typeof sortAttribute !== "string" ||
		sortAttribute.length > 30
	) {
		//return invalid
		console.log(" post_product_list 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "sortAttribute value is null or invalid",
		};
		return res.status(403).send(return_body);
	}
	if (
		sortAttribute != "sales_volume" &&
		sortAttribute != "price" &&
		sortAttribute != "views" &&
		sortAttribute != "wishlist_count"
	) {
		//return invalid
		console.log(" post_product_list 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "sortAttribute value is null or invalid",
		};
		return res.status(403).send(return_body);
	}

	//check sortWay
	if (
		!sortWay ||
		typeof sortWay !== "string" ||
		(sortWay !== "ASC" && sortWay !== "DESC")
	) {
		//return invalid
		console.log(" post_product_list 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "sortWay value is null or invalid",
		};
		return res.status(405).send(return_body);
	}

	//check search
	if (search && (typeof search !== "string" || search.length > 100)) {
		//return invalid
		console.log(" post_product_list 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "search value is invalid",
		};
		return res.status(406).send(return_body);
	}

	//check getNum
	if (
		!getNum ||
		typeof getNum !== "number" ||
		!Number.isInteger(getNum) ||
		getNum < 0
	) {
		console.log(" post_product_list 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			data: null,
			message: "getNum value is null or invalid",
		};
		return res.status(407).send(return_body);
	}

	//-------- check DB --------------------------------------------------------------------------------------//

	let sqlResult;

	try {
		let rows;
		if (!search) {
			rows = await queryDatabase(
				`	SELECT p.*, b.brand_name, pc.name AS cat_name
					FROM products p
					INNER JOIN brands b ON p.brand_id = b.id
					INNER JOIN product_category pc ON p.category_id = pc.id
					WHERE p.category_id = ?
						AND p.price BETWEEN ? AND ?
						AND p.is_deleted = 0
					ORDER BY ${sortAttribute} ${sortWay}
					LIMIT 20 OFFSET ?;
				`,
				[category_id, priceMin, priceMax, (getNum - 1) * 20]
			);
		} else {
			rows = await queryDatabase(
				` SELECT p.*, b.brand_name, pc.name AS cat_name
					FROM products p
					INNER JOIN brands b ON p.brand_id = b.id
					INNER JOIN product_category pc ON p.category_id = pc.id
					WHERE p.category_id = ?
						AND p.price BETWEEN ? AND ?
						AND p.is_deleted = 0
						AND (p.name  LIKE '%${search}%' OR description LIKE '%${search}%')
					ORDER BY ${sortAttribute} ${sortWay}
					LIMIT 20 OFFSET ?;
				`,
				[category_id, priceMin, priceMax, (getNum - 1) * 20]
			);
		}

		sqlResult = rows;
		console.log("SQL result : ", sqlResult);
	} catch (err) {
		console.log(err);
		console.log(" post_product_list 에서 에러가 발생했습니다.\n", err);
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
