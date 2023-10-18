const { queryDatabase } = require("db.js");

exports.post_user_getTikklingDetail = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  const tikkling_id = body.tikkling_id;

  //-------- check DB --------------------------------------------------------------------------------------//

  let sqlResult;

  try {
    const rows = await queryDatabase(
      `SELECT tikkling.id AS tikkling_id, tikkling.user_id, tikkling.resolution_type AS resolution_type, tikkling.type AS tikkling_type, tikkling.funding_limit, tikkling.created_at, tikkling.tikkle_quantity, tikkling.terminated_at, tikkling.product_id, tikkling.terminated_at,
			tikkling.state_id, tikkling_state.name AS state_name, 
			products.name AS product_name, products.price, products.description, products.sales_volume, products.quantity, products.views,
			products.is_deleted, products.wishlist_count, products.thumbnail_image, brands.brand_name
			FROM tikkling 
			INNER JOIN tikkling_state ON tikkling.state_id = tikkling_state.id
			INNER JOIN products ON tikkling.product_id = products.id
			INNER JOIN brands ON products.brand_id = brands.id
			WHERE tikkling.id = ?
			ORDER BY tikkling.created_at DESC`,
      [tikkling_id]
    );
    sqlResult = rows;
    //console.log("SQL result : ", sqlResult);
  } catch (err) {
    console.log("post_user_getTikklingDetail 에서 에러가 발생했습니다.", err);
    const return_body = {
      success: false,
      detail_code: "00",
      message: "SQL error",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }

  if (sqlResult.length != 1) {
    console.log("post_user_getTikklingDetail 에서 에러가 발생했습니다.", err);
    const return_body = {
      success: false,
      detail_code: "00",
      message: "SQL error",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }

  const retData_temp = sqlResult[0];

  let is_mine;
  if (retData_temp.user_id == id) {
    is_mine = true;
  } else {
    is_mine = false;
  }

  const retData = { ...retData_temp, is_mine };

  //-------- return result --------------------------------------------------------------------------------------//

  const return_body = {
    success: true,
    data: retData,
    detail_code: "00",
    message: "success get Tiikkling detail",
    returnToken: returnToken,
  };
  return res.status(200).send(return_body);
};
