const { queryDatabase } = require("db.js");

exports.get_friend_searchPhone = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    // body에서 nick을 추출하고 문자열인지 확인
    const phone = req.params.phone;

    if (typeof phone !== "string") {
      throw new Error("입력 오류: phone은 문자열이어야 합니다.");
    }
    // phone이 빈 문자열인지 확인
    if (phone.trim().length === 0) {
      throw new Error("입력 오류: phone은 빈 문자열이면 안 됩니다.");
    }

    // nick이 일치하는 사용자를 DB에서 조회
    const query = `
      SELECT users.id, users.name, users.nick, users.image, friends_relation.relation_state_id 
      FROM users 
      LEFT JOIN friends_relation on central_user_id = ? 
        AND users.id = friends_relation.friend_user_id 
      WHERE phone = ?`;
    const rows = await queryDatabase(query, [id, phone]);

    const return_body = {
      success: true,
      data: { ...rows, central_user_id: id },
      detail_code: "00",
      message: "성공적으로 친구를 찾았습니다.",
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (error) {
    console.log("에러 : ", error);
    if (error.message === "입력 오류: phone은 빈 문자열이면 안 됩니다.") {
      const return_body = {
        success: false,
        detail_code: "01",
        message: "검색할 전화번호가 입력되지 않았어요.",
        returnToken: null,
      };
      return res.status(400).send(return_body);
    } else if (error.message === "입력 오류: phone은 문자열이어야 합니다.") {
      const return_body = {
        success: false,
        detail_code: "02",
        message: "입력값에 오류가 있습니다.",
        returnToken: null,
      };
      return res.status(400).send(return_body);
    } else {
      console.error(`🚨 error -> ⚡️ get_friend_searchPhone : 🐞${err}`);
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
