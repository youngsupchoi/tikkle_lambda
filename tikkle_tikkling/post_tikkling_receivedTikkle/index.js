const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.post_tikkling_receivedTikkle = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    const rows = await queryDatabase(
      "SELECT sending_tikkle.*, users.id, users.name, users.image FROM sending_tikkle inner join users on sending_tikkle.user_id = users.id WHERE sending_tikkle.tikkling_id = ?;",
      [body.tikkling_id]
    );

    const return_body = {
      success: true,
      data: rows,
      message: "티클링 정보 조회 성공",
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (err) {
    console.error("Failed to connect or execute query:", err);
    const return_body = {
      success: false,
      message: "서버 에러",
    };
    return res.status(500).send(return_body);
  }
};
