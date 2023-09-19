const { queryDatabase, queryDatabase_multi } = require("db.js");
const { DeliveryService } = require("../../features/delivery");
// const { DeliveryService } = require("delivery.js");
exports.post_seller_startdelivery = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    const target_delivery = DeliveryService.getById(id);
    //delivery의 상태를 확인
    if (!DeliveryService.checkDeliveryCanStart(target_delivery)){
      return res.status(400).send({
        success: false,
        detail_code: "01",
        message: "이미 시작이 이루어진 배송입니다.",
        returnToken: null,
      });
    }

    //delilvery를 시작 -> state_id = 2, start_delivery_date = now(), expected_delivery_date = now() + 3days,invoice_number = body.invoice_number, courier_company_code = body.courier_company_code


    const return_body = {
      success: true,
      data: rows,
      detail_code: "00",
      message: "친구의 티클링 정보 조회 성공",
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (err) {
    console.error("error: ", err);
    console.log("get_tikkling_friendinfo에서 문제가 발생했습니다.");
    const return_body = {
      success: false,
      detail_code: "00",
      message: "서버 에러",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }
};
