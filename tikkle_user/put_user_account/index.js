const { queryDatabase } = require("db.js");

exports.put_user_account = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  const bank_name = body.bank_name;
  const account = body.account;

  //-------- check address --------------------------------------------------------------------------------------//

  //check productId
  if (
    !bank_name ||
    !account ||
    typeof bank_name !== "string" ||
    typeof account !== "string"
  ) {
    console.log("put_user_addressd의 입력 데이터에서 에러가 발생했습니다.");
    const return_body = {
      success: false,
      detail_code: "00",
      message: "input value is null or invalid",
      returnToken: null,
    };
    return res.status(400).send(return_body);
  }

  //--------  update address  --------------------------------------------------------------------------------------//

  let sqlResult;

  try {
    const rows = await queryDatabase(
      `	UPDATE users
				SET	bank_name = ?,	account = ?
				WHERE	id = ?
			`,
      [bank_name, account, id]
    );

    sqlResult = rows;
    //console.log("SQL result : ", sqlResult);
  } catch (err) {
    console.log("put_user_address의 query에서 에러가 발생했습니다.", err);
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
    detail_code: "00",
    message: "success to update account info",
    returnToken: returnToken,
  };
  return res.status(200).send(return_body);
};
