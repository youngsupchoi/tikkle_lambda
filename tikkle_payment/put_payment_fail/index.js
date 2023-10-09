const { Payment } = require("../../features/payment");
const { User } = require("../../features/User");
const { Response } = require("../../features/Response");

exports.put_payment_fail = async (req, res) => {
  const { body, id, returnToken } = req;
  const { merchant_uid, amount } = body;
  //main logic------------------------------------------------------------------------------------------------------------------//
  try {
    //payment를 생성
    const paymnet_info = await Payment.getPaymentByMerchantUid({merchant_uid});
    //payment 객체 생성
    const payment = new Payment(paymnet_info);
    //DB상의 결제정보와 비교
    payment.compareStoredPaymentInfo({amount, user_id :id});
    //결제 실패 처리
    await payment.updatePaymentToFail()
    return res.status(200).send(Response.create(true, "00", "결제 실패 처리 완료", null, returnToken));
  } catch (err) {
    if (err.status) {
      return res.status(err.status).send(Response.create(false, err.detail_code, err.message));
    };
    console.error(`🚨 error -> ⚡️ getUserById : 🐞 ${err}`);
    return res.status(500).send(Response.create(false, "00", "서버 에러"));
  }
};
