const { queryDatabase } = require("db.js");

//남은 티클 개수만 충족되면 티클 줄 수 있음

exports.post_tikkling_buymytikkle = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;
  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    //줄 수 있는 상태인지 확인
    const check_tikkling = await queryDatabase(
      `SELECT t.id AS tikkling_id, t.user_id AS user_id, t.tikkle_quantity AS total_tikkle_quantity, IFNULL((SELECT SUM(s.quantity) FROM sending_tikkle s WHERE s.tikkling_id = ?), 0) AS received_tikkle_quantity, t.state_id 
      FROM tikkling t 
      WHERE t.id = ?;`,
      [body.tikkling_id, body.tikkling_id]
    );
    if (check_tikkling.length == 0) {
      const return_body = {
        success: false,
        detail_code: "00",
        message: "잘못된 요청, 티클링을 찾을 수 없습니다.",
        returnToken: null,
      };
      return res.status(404).send(return_body);
    } else if (check_tikkling[0].user_id != id) {
      const return_body = {
        success: false,
        detail_code: "00",
        message: "비정상적인 요청, 해당 티클링의 소유자가 아닙니다.",
        returnToken: null,
      };
      return res.status(401).send(return_body);
    } else if (check_tikkling[0].terminated_at != null) {
      const return_body = {
        success: false,
        detail_code: "00",
        message:
          "비정상적 요청, 이미 완전히 종료되어 더 이상 처리될 수 없는 티클링입니다.",
      };
      return res.status(400).send(return_body);
    } else if (
      check_tikkling[0].total_tikkle_quantity ==
      check_tikkling[0].received_tikkle_quantity
    ) {
      const return_body = {
        success: false,
        detail_code: "01",
        message: "이미 모든 티클을 수집한 티클링입니다.",
        returnToken,
      };
      return res.status(403).send(return_body);
    } else if (
      check_tikkling[0].state_id != 3 &&
      check_tikkling[0].state_id != 5
    ) {
      const return_body = {
        success: false,
        detail_code: "02",
        message:
          "비정상적 요청, 아직 티클링이 종료되지 않았거나 이미 종료되었습니다.",
        returnToken,
      };
      return res.status(403).send(return_body);
    }

    //줄 수 있는 상태라면 티클 전송
    const results = await queryDatabase(
      `INSERT INTO sending_tikkle (tikkling_id, user_id, quantity) VALUES (?, ?, ?); `,
      [
        body.tikkling_id,
        id,
        check_tikkling[0].total_tikkle_quantity -
          check_tikkling[0].received_tikkle_quantity,
      ]
    );

    if (results.affectedRows == 1) {
      const return_body = {
        success: true,
        detail_code: "00",
        message: `티클을 성공적으로 구매했습니다.`,
        data: {
          buy_tikkle_quantity:
            check_tikkling[0].total_tikkle_quantity -
            check_tikkling[0].received_tikkle_quantity,
        },
        returnToken,
      };
      return res.status(200).send(return_body);
    }
  } catch (err) {
    console.error(`🚨error -> ⚡️post_tikkling_buymytikkle : 🐞${err}`);
    const return_body = {
      success: false,
      detail_code: "00",
      message: "서버 에러",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }
};
