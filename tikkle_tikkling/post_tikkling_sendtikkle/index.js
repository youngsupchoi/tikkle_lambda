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
      `SELECT t.id AS tikkling_id, t.user_id AS user_id, t.tikkle_quantity AS total_tikkle_quantity, IFNULL((SELECT SUM(s.quantity) FROM sending_tikkle s WHERE s.tikkling_id = ?), 0) AS received_tikkle_quantity, t.state_id 
      FROM tikkling t 
      WHERE t.id = ?;`,
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
    const results = await queryDatabase_multi(
      `CALL insert_sending_tikkle(?, ?, ?, ?, @success);
      select @success as success;`,
      [req.body.tikkling_id, id, req.body.tikkle_quantity, req.body.message]
    );

    let ticket_message = "자신의 티클 보내기에서는 티켓을 받을 수 없습니다.";
    //보내는 사람과 받는 사람이 다를 때 티켓 지급 및 알림
    if (check_tikkling[0].user_id != id) {
      const [is_already_send, sender_info] = await queryDatabase_multi(
        `SELECT id FROM sending_tikkle WHERE tikkling_id = ? AND sender_id = ?;
        SELECT name, image FROM users WHERE id = ?;
        `,
        [req.body.tikkling_id, id, id]
      );
      ticket_message = "이미 티켓을 지급 받았습니다.";
      //티클을 처음 보낼때만 티켓을 1개 지급
      if (is_already_send.length == 0) {
        await queryDatabase(
          `UPDATE users SET ticket = ticket + 1 WHERE id = ?;`,
          [id]
        );
        ticket_message = "티클링 티켓 1개를 획득하였습니다.";
      }
      //티클을 보낼 때마다 알림을 보냄
      await queryDatabase(
        `INSERT INTO notifications (user_id, type, message, meta_data) VALUES (?, ?, ?, ?);`,
        [
          check_tikkling[0].user_id,
          5,
          `${sender_info[0].name}님이 보낸 티클을 확인해보세요.`,
          `{
            "source_user_id": ${id},
            "source_user_profile": "${sender_info[0].image}",
          }`,
        ]
      );
    }

    const success = results[1][0].success;
    if (success === 1) {
      const return_body = {
        success: true,
        message: `티클을 성공적으로 보냈습니다. ${ticket_message}}`,
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
    console.error(err);
    console.log("post_tikkling_sendtikkle에서 에러가 발생했습니다.");
    const return_body = {
      success: false,
      message: "서버 에러",
    };
    return res.status(500).send(return_body);
  }
};
