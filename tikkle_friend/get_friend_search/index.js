const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.get_friend_search = async (req, res) => {
  const headers = req.headers;
  const body = req.body;
  const authorization = headers.authorization;
  const [accessToken, refreshToken] = authorization.split(",");

  //-------- check token & get user id --------------------------------------------------------------------------------------//

  let tokenCheck;
  let returnBody;
  let id;

  try {
    tokenCheck = await checkToken(accessToken, refreshToken);
    returnBody = JSON.parse(tokenCheck.body);
    id = returnBody.tokenData.id;
  } catch (error) {
    //return invalid when token is invalid
    console.log("ERROR : the token value is null or invalid");
    return res.status(410).send({ success: false, message: "login again" });
  }

  //return invalid when token is invalid
  if (tokenCheck.statusCode !== 200) {
    console.log("ERROR : the token value is null or invalid");
    return res.status(410).send({ success: false, message: "login again" });
  }

  const returnToken = returnBody.accessToken;
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
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (error) {
    console.log("에러 : ", error);
    if (
      error.message === "입력 오류: nick은 문자열이어야 합니다." ||
      error.message === "입력 오류: nick은 빈 문자열이면 안 됩니다."
    ) {
      const return_body = {
        success: false,
        message: "잘못된 요청: " + error.message,
      };
      return res.status(400).send(return_body);
    } else {
      console.log("get_friend_search에서 에러가 발생했습니다.");
      const return_body = {
        success: false,
        message: "내부 서버 오류",
      };
      return res.status(500).send(return_body);
    }
  }
};
