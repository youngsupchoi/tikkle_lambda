const { queryDatabase } = require("db.js");
const { queryDatabase_multi } = require("db_query.js");
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
    //FIXME: 본인의 티클링은 티클을 수령하지 않음
    //FIXME: 하나의 티클링에 대해서는 몇번의 티클을 보내든 티클링 티켓은 하나를 받음
    const results = await queryDatabase_multi(
      `CALL insert_sending_tikkle(?, ?, ?, ?, @success);
      select @success as success;`,
      [req.body.tikkling_id, id, req.body.tikkle_quantity, req.body.message]
    );

    const success = results[1][0].success;
    if (success === 1) {
      const return_body = {
        success: true,
        message: `티클 ${req.body.tikkle_quantity}개를 성공적으로 보냈습니다.`,
        returnToken,
      };
      return res.status(200).send(return_body);
    } else {
      const return_body = {
        success: false,
        message:
          "티클전송중 타인이 먼저 티클전송을 하였습니다. 티클을 보낼 수 없습니다. (줄 수 있는 티클링 조각 수 초과 or 티클을 줄 수 있는 상태가 아닙니다.)",
        returnToken,
      };
      return res.status(406).send(return_body);
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
