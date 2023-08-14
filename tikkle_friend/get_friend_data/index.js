const { queryDatabase } = require("db.js");

exports.get_friend_data = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    //차단된 친구 목록
    let rows;
    if (req.params.mode === "block") {
      rows = await queryDatabase(
        "SELECT u.id, u.name, u.image, u.nick, fr.relation_state_id FROM users u INNER JOIN friends_relation fr ON u.id = fr.friend_user_id WHERE fr.relation_state_id = 3 AND fr.central_user_id = ?",
        [id]
      );
      //차단되지 않은 친구 목록
    } else if (req.params.mode === "unblock") {
      rows = await queryDatabase(
        "SELECT u.id, u.name, u.image, u.nick, fr.relation_state_id FROM users u INNER JOIN friends_relation fr ON u.id = fr.friend_user_id WHERE fr.relation_state_id != 3 AND fr.central_user_id = ?",
        [id]
      );

      //확인한 친구에 대해 모두 친구로 전환
      await queryDatabase(
        "UPDATE friends_relation SET relation_state_id = 1 WHERE relation_state_id = 2 AND central_user_id = ?",
        [id]
      );
    } else {
      // parameter잘못된 mode를 전송
      const return_body = {
        success: false,
        message: "잘못된 mode",
      };
      console.log("잘못된 mode");
      return res.status(400).send(return_body);
    }

    const return_body = {
      success: true,
      message: "친구 목록 조회 성공",
      data: rows,
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
