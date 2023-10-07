const { queryDatabase } = require("db.js");

exports.put_tikkling_cancel = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;
  //main logic------------------------------------------------------------------------------------------------------------------//
  //FIXME: 티클링취소 직전 티클링 조각이 도착한 경우가 생길 수 있음 조금 더 하나의 트랜잭션으로 처리해야할 필요성이 있음
  try {
    //티클링이 상태가 이미 변화했는지 확인
    const check_tikkling = await queryDatabase(
      `select tikkling.*, count(sending_tikkle.id) as sending_tikkle_count 
      from tikkling left join sending_tikkle on tikkling.id = sending_tikkle.tikkling_id 
      where tikkling.id = ? group by tikkling.id;`,
      [req.body.tikkling_id]
    );
    //티클링이 없는 경우
    if (check_tikkling.length == 0) {
      console.log(
        "비정상적 요청-put_tikkling_cancel: 티클링을 찾을 수 없습니다."
      );
      const return_body = {
        success: false,
        detail_code: "00",
        message: "비정상적 요청, 티클링을 찾을 수 없습니다.",
        returnToken: null,
      };
      return res.status(404).send(return_body);
    }
    //티클링이 종료된 경우
    else if (check_tikkling[0].terminated_at != null) {
      const return_body = {
        success: false,
        detail_code: "00",
        message: "이미 종료된 티클링입니다.",
        returnToken,
      };
      return res.status(400).send(return_body);
    }
    if (check_tikkling[0].sending_tikkle_count == 0) {
    }

    //도착한 티클링 조각이 있는지 확인
    if (check_tikkling[0].sending_tikkle_count != 0) {
      console.log(
        "비정상적 요청-put_tikkling_cancel: 티클이 도착한 상태에서 티클링 취소를 요청"
      );
      const return_body = {
        success: false,
        detail_code: "00",
        message:
          "비정상적 요청, 티클이 도착한 상태에서는 티클링을 취소할 수 없습니다.",
        returnToken: null,
      };
      return res.status(401).send(return_body);
    } else {
      //FIXME: 하나의 연결로 쿼리를 전달하도록 수정
      //티클링 취소, 티클링 티켓 환급, 상품 수량 복구
      await Promise.all([
        queryDatabase(
          `UPDATE tikkling SET state_id = 2, terminated_at = now(), resolution_type = 'cancel' WHERE id = ?;`,
          [req.body.tikkling_id]
        ),
        queryDatabase(
          `UPDATE users SET tikkling_ticket = tikkling_ticket + 1 WHERE id = ?;`,
          [id]
        ),
        queryDatabase(
          `UPDATE products SET quantity = quantity + 1 WHERE id = (SELECT product_id FROM tikkling WHERE id = ?);`,
          [req.body.tikkling_id]
        ),
      ]);

      const return_body = {
        success: true,
        detail_code: "00",
        message: `티클링을 성공적으로 취소하였습니다.`,
        returnToken,
      };
      return res.status(200).send(return_body);
    }
  } catch (err) {
    console.error(`🚨error -> ⚡️put_tikkling_end에서 : 🐞${err}`);
    const return_body = {
      success: false,
      detail_code: "00",
      message: "서버 에러",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }
};
