const { queryDatabase } = require("db.js");

exports.put_tikkling_end = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;
  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    //도착한 티클링 조각이 있는지 확인
    const tikkle = await queryDatabase(
      "SELECT * FROM sending_tikkle WHERE tikkling_id = ?",
      [req.body.tikkling_id]
    );
    const next_tikkle_state = tikkle.length == 0 ? 2 : 3;

    //티클링 종료
    const rows = await queryDatabase(
      "UPDATE tikkling SET state_id = ?, terminated_at = now() WHERE id = ?;",
      [next_tikkle_state, req.body.tikkling_id]
    );
    const end_state =
      next_tikkle_state == 2 ? "시작 전 종료" : "완료되기 전 종료";
    const return_body = {
      success: true,
      message: `티클링을 성공적으로 종료하였습니다.${end_state}`,
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
