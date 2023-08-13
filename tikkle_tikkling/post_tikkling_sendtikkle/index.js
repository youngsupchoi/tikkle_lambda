const { queryDatabase } = require("db.js");

exports.post_tikkling_sendtikkle = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;
  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    //줄 수 있는 상태인지 확인
    const check_tikkling = await queryDatabase(
      "SELECT t.id AS tikkling_id, t.tikkle_quantity AS total_tikkle_quantity, IFNULL((SELECT SUM(s.quantity) FROM sending_tikkle s WHERE s.tikkling_id = ?), 0) AS received_tikkle_quantity, t.state_id FROM tikkling t WHERE t.id = ?; ",
      [req.body.tikkling_id, req.body.tikkling_id]
    );

    if (check_tikkling.length == 0) {
      const return_body = {
        success: false,
        message: "잘못된 요청, 티클링을 찾을 수 없습니다.",
      };
      return res.status(404).send(return_body);
    } else if (check_tikkling[0].state_id != 1) {
      const return_body = {
        success: false,
        message:
          "티클을 보낼 수 없습니다. (티클을 줄 수 있는 상태가 아닙니다.)",
        returnToken,
      };
      return res.status(403).send(return_body);
    } else if (
      check_tikkling[0].total_tikkle_quantity <
      check_tikkling[0].received_tikkle_quantity + req.body.quantity
    ) {
      const return_body = {
        success: false,
        message: "티클을 보낼 수 없습니다. (줄 수 있는 티클링 조각 수 초과)",
        returnToken,
      };
      return res.status(400).send(return_body);
    }
    //줄 수 있는 상태라면 티클 전송
    const result = await queryDatabase(
      "INSERT INTO sending_tikkle (tikkling_id, user_id, quantity, message) SELECT ? AS tikkling_id, ? AS user_id, ? AS quantity, ? AS message FROM tikkling WHERE id = ? AND ? + COALESCE((SELECT SUM(quantity) FROM sending_tikkle WHERE tikkling_id = ?), 0) <= tikkle_quantity;",
      [
        req.body.tikkling_id,
        id,
        req.body.tikkle_quantity,
        req.body.message,
        req.body.tikkling_id,
        req.body.tikkle_quantity,
        req.body.tikkling_id,
      ]
    );
    if (result.affectedRows === 1) {
      const return_body = {
        success: true,
        message: `티클 ${req.body.tikkle_quantity}개를 성공적으로 보냈습니다.`,
        returnToken,
      };
      return res.status(200).send(return_body);
    } else if (result.affectedRows === 0) {
      const return_body = {
        success: false,
        message: "티클을 보낼 수 없습니다. (줄 수 있는 티클링 조각 수 초과)",
        returnToken,
      };
      return res.status(400).send(return_body);
    }
  } catch (err) {
    console.error("Failed to connect or execute query:", err);
    console.log("put_tikkling_end에서 에러가 발생했습니다.");
    const return_body = {
      success: false,
      message: "서버 에러",
    };
    return res.status(500).send(return_body);
  }
};
