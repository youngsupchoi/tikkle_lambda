const { Payment } = require("../../features/Payment");
const { User } = require("../../features/User");
const { Response } = require("../../features/Response");
const { DBManager } = require("../../db");

const createResponseBody = (success, code, message, token = null) => ({
  success,
  detail_code: code,
  message,
  returnToken: token,
});

exports.post_payment_init = async (req, res) => {
  const { body, id, returnToken } = req;
  const { amount } = body;
  //main logic------------------------------------------------------------------------------------------------------------------//
  const db = new DBManager();
	await db.openTransaction();
  console.log("hihi:", test[0]);
  try {
    //user정보 가져옴
    const user = await User.createById({id, db});
    //payment를 생성
    const payment = new Payment({ user_id: id, amount: amount, db });
    //payment info를 생성
    const payment_info = payment.createPaymentParam({ user_name: user.name, user_phone: user.phone});
    //payment를 저장 
    await payment.savePayment();
    
    await db.commitTransaction();
    return res.status(200).send(Response.create(true, "00", "결제 데이터 저장 완료", payment_info, returnToken));

  } catch (err) {
    await db.rollbackTransaction();
    console.error(`🚨error -> ⚡️ post_payment_init : 🐞${err}`);
    if (err.status) {
      return res.status(err.status).send(createResponseBody(false, err.detail_code, err.message));
    };
    return res.status(500).send(createResponseBody(false, "00", "서버 에러"));
  }
};
