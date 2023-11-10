const { Tikkling } = require("../../features/Tikkling");
const { Response } = require("../../features/Response");
const { User } = require("../../features/User");
const { ExpectedError } = require("../../features/ExpectedError");
const { DBManager } = require("../../db");
const { Product, Brand } = require("../../features/Product");

exports.post_product_enrollment = async (req, res) => {
  const id = req.id;
  const returnToken = req.returnToken;
  const { product_list } = req.body;

  //main logic------------------------------------------------------------------------------------------------------------------//
  const db = new DBManager();
  await db.openTransaction();
  try {
    await Product.enrollProductList(product_list, db);

    await db.commitTransaction();

    return res.status(200).send(Response.create(true, "00", "상품을 성공적으로 추가하였습니다.", null, returnToken));
  } catch (err) {
    await db.rollbackTransaction();
    console.error(`🚨error -> ⚡️ post_product_enrollment : 🐞${err}`);
    if (err.status) {
      return res.status(err.status).send(Response.create(false, err.detail_code, err.message));
    }
    return res.status(500).send(Response.create(false, "00", "서버 에러"));
  }
};
