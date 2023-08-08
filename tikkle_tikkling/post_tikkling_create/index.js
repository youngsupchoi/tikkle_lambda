const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.post_tikkling_create = async (req, res) => {
  const headers = req.headers;
  const body = req.body;
  const authorization = headers.authorization;
  const [accessToken, refreshToken] = authorization.split(",");

  //-------- check token & get user id --------------------------------------------------------------------------------------//

  let tokenCheck;
  let returnBody;
  let id;

  try {
    tokenCheck = await checkToken(accessToken, refreshToken);
    returnBody = JSON.parse(tokenCheck.body);
    id = returnBody.tokenData.id;
  } catch (error) {
    //return invalid when token is invalid
    console.log("ERROR : the token value is null or invalid");
    return res.status(410).send({ success: false, message: "login again" });
  }

  //return invalid when token is invalid
  if (tokenCheck.statusCode !== 200) {
    console.log("ERROR : the token value is null or invalid");
    return res.status(410).send({ success: false, message: "login again" });
  }

  const returnToken = returnBody.accessToken;
  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    const [is_tikkling, product_stock] = await Promise.all([
      queryDatabase("select is_tikkling from users where id = ?", [id]),
      queryDatabase("select quantity from products where id = ?", [
        req.body.product_id,
      ]),
    ]);

    //티클링중이면 에러
    if (is_tikkling[0].is_tikkling === 1) {
      const return_body = {
        success: false,
        message: "잘못된 요청, 이미 티클링중인 유저입니다.",
      };
      return res.status(403).send(return_body);
    }
    if (product_stock.length === 0) {
      const return_body = {
        success: false,
        message: "잘못된 요청, 존재하지 않는 상품입니다.",
      };
      return res.status(404).send(return_body);
    }
    //해당상품 재고가 남아있는지 확인 - 해당 이벤트 동시 발생시 에러 가능성 있음
    if (product_stock[0].quantity == 0) {
      const return_body = {
        success: false,
        message: "잘못된 요청, 해당 상품의 재고가 남아있지 않습니다.",
      };
      return res.status(403).send(return_body);
    }

    //티클링 생성
    const rows = await queryDatabase(
      "INSERT INTO `tikkling` (`user_id`, `funding_limit`, `tikkle_quantity`, `product_id`) VALUES (?, ?, ?, ?);",
      [
        id,
        req.body.funding_limit,
        req.body.tikkle_quantity,
        req.body.product_id,
      ]
    );
    //재고를 하나 줄임
    await queryDatabase(
      "UPDATE `products` SET `quantity` = quantity-1 WHERE (`id` = ?);",
      [req.body.product_id]
    );

    const return_body = {
      success: true,
      message: "티클링 생성을 성공하였습니다.",
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (err) {
    console.log(err);
    console.log("post_tikkling_create에서 문제가 발생했습니다.");

    const return_body = {
      success: false,
      message: "서버 에러",
    };
    return res.status(500).send(return_body);
  }
};
