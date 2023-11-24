const { Tikkling } = require("../../features/Tikkling");
const { Response } = require("../../features/Response");
const { User } = require("../../features/User");
const { ExpectedError } = require("../../features/ExpectedError");
const { DBManager } = require("../../db");
const { Product, Brand } = require("../../features/Product");

exports.post_product_id = async (req, res) => {
  const id = req.id;
  const returnToken = req.returnToken;
  const { p_name } = req.body;

  //main logic------------------------------------------------------------------------------------------------------------------//
  //-------- check DB --------------------------------------------------------------------------------------//

  let sqlResult;

  try {
    const rows = await queryDatabase(
      // 고시정보 데이터 추가하기(인덱스)
      ` SELECT p.id
  			FROM products p
  			WHERE p.name = ? ;
  	`,
      [p_name]
    );
    sqlResult = rows;
    //console.log("SQL result : ", sqlResult);
  } catch (err) {
    console.log("post_product_id 에서 에러가 발생했습니다.", err);
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
    console.log(" post_product_id 에서 에러가 발생했습니다.");
    const return_body = {
      success: false,
      detail_code: "00",
      message: "SQL error",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }

  return sqlResult[0];
};
