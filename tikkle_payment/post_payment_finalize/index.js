const { Payment } = require("../../features/Payment");
const { User } = require("../../features/User");
const { Response } = require("../../features/Response");

exports.post_payment_finalize = async (req, res) => {
  const { body, id, returnToken } = req;
  const { amount } = body;
  //main logic------------------------------------------------------------------------------------------------------------------//
  try {
    console.log(body);
    
    return res.status(200).send(Response.create(true, "00", "test", body, returnToken));

  } catch (err) {
    console.error(`🚨error -> ⚡️ post_payment_init : 🐞${err}`);
    if (err.status) {
      return res.status(err.status).send(Response.create(false, err.detail_code, err.message));
    };
    
    return res.status(500).send(Response.create(false, "00", "서버 에러"));
  }
};
