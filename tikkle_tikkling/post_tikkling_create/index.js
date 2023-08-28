const { queryDatabase } = require("db.js");

exports.post_tikkling_create = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//
  //TODO: funding_limit에 대한 validation 추가
  //TODO: tikkle_quantity에 대한 validation 추가
  try {
    const [is_tikkling, product_stock] = await Promise.all([
      queryDatabase(
        "select is_tikkling, tikkling_ticket from users where id = ?",
        [id]
      ),
      queryDatabase("select quantity from products where id = ?", [
        req.body.product_id,
      ]),
    ]);

    //티클링중이면 에러
    if (is_tikkling[0].is_tikkling === 1) {
      const return_body = {
        detail_code: "01",
        success: false,
        message: "잘못된 요청, 이미 티클링중인 유저입니다.",
        returnToken,
      };
      return res.status(403).send(return_body);
    }
    if (product_stock.length === 0) {
      const return_body = {
        detail_code: "00",
        success: false,
        message: "잘못된 요청, 존재하지 않는 상품입니다.",
        returnToken: null,
      };
      return res.status(404).send(return_body);
    }
    //해당상품 재고가 남아있는지 확인 - 해당 이벤트 동시 발생시 에러 가능성 있음
    if (product_stock[0].quantity == 0) {
      const return_body = {
        detail_code: "02",
        success: false,
        message: "잘못된 요청, 해당 상품의 재고가 남아있지 않습니다.",
        returnToken: null,
      };
      return res.status(403).send(return_body);
    }
    if (is_tikkling[0].tikkling_ticket == 0) {
      const return_body = {
        detail_code: "03",
        success: false,
        message: "잘못된 요청, 티클링 티켓이 없습니다.",
        returnToken: null,
      };
      return res.status(403).send(return_body);
    }

    //티클링 생성
    const rows = await queryDatabase(
      "INSERT INTO `tikkling` (`user_id`, `funding_limit`, `tikkle_quantity`, `product_id`, `type`) VALUES (?, ?, ?, ?, ?);",
      [
        id,
        req.body.funding_limit,
        req.body.tikkle_quantity,
        req.body.product_id,
        req.body.type,
      ]
    );
    //상품의 재고와 티켓을 하나 줄임
    //FIXME: 하나의 connect로 쿼리 전송
    await queryDatabase_multi(
      `
    UPDATE products SET quantity = quantity-1 WHERE (id = ?);
    UPDATE users SET tikkling_ticket = tikkling_ticket-1 WHERE (id = ?);`,
      [req.body.product_id, id]
    );

    const return_body = {
      success: true,
      detail_code: "00",
      message: "티클링 생성을 성공하였습니다.",
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (err) {
    console.log(err);
    console.log("post_tikkling_create에서 문제가 발생했습니다.");

    const return_body = {
      success: false,
      detail_code: "00",
      message: "서버 에러",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }
};
