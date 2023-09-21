const { DeliveryService } = require("../../features/delivery");

const deliveryService = new DeliveryService();

const createResponseBody = (success, code, message, token = null) => ({
  success,
  detail_code: code,
  message,
  returnToken: token,
});

exports.post_seller_startdelivery = async (req, res) => {
  const { body, id, returnToken } = req;

  //main logic------------------------------------------------------------------------------------------------------------------//
  try {
    //delivery id로 delivery의 정보를 가져옴

    const target_delivery = await deliveryService.createDeliveryById(body.delivery_id);
    //delivery의 상태를 확인
    await deliveryService.checkDeliveryCanStart(target_delivery);
    //delivery를 시작
    await deliveryService.startDelivery(body.delivery_id, body.invoice_number, body.courier_company_code, body.delivery_period);
    return res.status(200).send(createResponseBody(true, "00", "배송 시작 성공", returnToken));

  } catch (err) {
    if (err.status) {
      return res.status(err.status).send(createResponseBody(false, err.detail_code, err.message));
    };
    console.error("error-post_seller_startdelivery: ", err);
    return res.status(500).send(createResponseBody(false, "00", "서버 에러"));
  }
};
