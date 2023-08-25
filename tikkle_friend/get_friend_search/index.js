const { queryDatabase } = require("db.js");

exports.get_friend_search = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    // body에서 nick을 추출하고 문자열인지 확인
    const nick = req.params.nick;

    if (typeof nick !== "string") {
      throw new Error("입력 오류: nick은 문자열이어야 합니다.");
    }
    console.log(nick);
    // nick이 빈 문자열인지 확인
    if (nick.trim().length === 0) {
      throw new Error("입력 오류: nick은 빈 문자열이면 안 됩니다.");
    }

    // nick이 일치하는 사용자를 DB에서 조회
    const query = `SELECT users.id, users.name, users.nick, users.image, friends_relation.relation_state_id FROM users LEFT JOIN friends_relation on central_user_id = ? AND users.id = friends_relation.friend_user_id WHERE nick = ?`;
    const rows = await queryDatabase(query, [id, nick]);

    const return_body = {
      success: true,
      data: rows,
      detail_code: "00",
      message: "성공적으로 친구를 찾았습니다.",
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (error) {
    console.log("에러 : ", error);
    if (error.message === "입력 오류: nick은 빈 문자열이면 안 됩니다.") {
      const return_body = {
        success: false,
        detail_code: "01",
        message: "비정상적 요청, nick은 빈 문자열이면 안 됩니다.",
        returnToken: null,
      };
      return res.status(400).send(return_body);
    } else if (error.message === "입력 오류: nick은 문자열이어야 합니다.") {
      const return_body = {
        success: false,
        detail_code: "02",
        message: "비정상적 요청, nick은 문자열이어야 합니다.",
        returnToken: null,
      };
      return res.status(400).send(return_body);
    } else {
      console.log("error:", error);
      console.log("서버 에러-get_friend_search");
      const return_body = {
        success: false,
        detail_code: "00",
        message: "서버 에러",
        returnToken: null,
      };
      return res.status(500).send(return_body);
    }
  }
};
