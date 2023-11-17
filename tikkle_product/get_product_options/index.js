const { queryDatabase } = require("db.js");

exports.get_product_options = async (req, res) => {
  const id = req.id;
  const returnToken = req.returnToken;

  const product_id = req.params.product_id;

  //-------- check DB --------------------------------------------------------------------------------------//

  let sqlResult;

  try {
    const rows = await queryDatabase(`select * from product_option where product_id = ?`, [product_id]);

    const transformedData = rows.reduce((acc, { category, option, additional_amount, quantity, is_deleted }) => {
      const newItem = { option, additional_amount, quantity, is_deleted: Boolean(is_deleted) };

      acc[category] = acc[category] ? [...acc[category], newItem] : [newItem];

      return acc;
    }, {});
    sqlResult = transformedData;
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

  //-------- return result --------------------------------------------------------------------------------------//

  const return_body = {
    success: true,
    data: sqlResult,
    detail_code: "00",
    message: "success get product info",
    returnToken: returnToken,
  };
  return res.status(200).send(return_body);
};
