const { queryDatabase } = require("db.js");

exports.put_tikkling_end = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;
  //main logic------------------------------------------------------------------------------------------------------------------//
  //TODO: 조금 더 하나의 트랜잭션으로 처리해야할 필요성이 있음
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
      const return_body = {
        success: false,
        message: "잘못된 요청, 티클링을 찾을 수 없습니다.",
      };
      return res.status(404).send(return_body);
    }
    //티클링이 종료된 경우
    else if (check_tikkling[0].terminated_at != null) {
      const return_body = {
        success: false,
        message: "이미 종료된 티클링입니다.",
        returnToken,
      };
      return res.status(400).send(return_body);
    }

    //도착한 티클링 조각이 있는지 확인
    if (check_tikkling[0].sending_tikkle_count == 0) {
      const return_body = {
        success: false,
        message:
          "잘못된 요청, 도착한 티클이 없다면 해당 api를 요청할 수 없습니다.",
      };
      return res.status(403).send(return_body);
    }
    //TODO: 사이에 선물 수령 및 환급 로직 추가
    //기간만료이전 혹은 완료 이전 종료
    if (check_tikkling[0].state_id == 1) {
      const rows = await queryDatabase(
        "UPDATE tikkling SET state_id = 3, terminated_at = now() WHERE id = ?;",
        [req.body.tikkling_id]
      );
    }
    //조각을 모두 모은 후 종료
    else if (check_tikkling[0].state_id == 4) {
      const rows = await queryDatabase(
        "UPDATE tikkling SET terminated_at = now() WHERE id = ?;",
        [req.body.tikkling_id]
      );
    }
    //펀딩 기한이 지난 후 종료
    else if (check_tikkling[0].state_id == 5) {
      const rows = await queryDatabase(
        "UPDATE tikkling SET terminated_at = now() WHERE id = ?;",
        [req.body.tikkling_id]
      );
    }

    //티클링 종료

    const return_body = {
      success: true,
      message: `티클링을 성공적으로 종료하였습니다.`,
      returnToken,
    };
    return res.status(200).send(return_body);
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
