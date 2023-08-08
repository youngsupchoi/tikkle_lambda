const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.get_friend_search = async (event) => {
  const headers = event.headers;
  const body = event.body;
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
    return {
      statusCode: 410,
      body: "login again",
    };
  }

  //return invalid when token is invalid
  if (tokenCheck.statusCode !== 200) {
    console.log("ERROR : the token value is null or invalid");
    return {
      statusCode: 410,
      body: "login again",
    };
  }

  const returnToken = returnBody.accessToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    // body에서 nick을 추출하고 문자열인지 확인
    const nick = event.queryStrignParameters.nick;

    if (typeof nick !== "string") {
      throw new Error("입력 오류: nick은 문자열이어야 합니다.");
    }

    // nick이 빈 문자열인지 확인
    if (nick.trim().length === 0) {
      throw new Error("입력 오류: nick은 빈 문자열이면 안 됩니다.");
    }

    // nick이 일치하는 사용자를 DB에서 조회
    const query = `SELECT * FROM users WHERE nick = ?`;
    const rows = await queryDatabase(query, [nick]);

    const return_body = {
      success: true,
      data: rows,
      returnToken,
    };
    const response = {
      statusCode: 200,
      body: JSON.stringify(return_body),
    };
    return response;
  } catch (error) {
    console.log("에러 : ", error);
    if (
      error.message === "입력 오류: nick은 문자열이어야 합니다." ||
      error.message === "입력 오류: nick은 빈 문자열이면 안 됩니다."
    ) {
      const return_body = {
        success: false,
        message: "잘못된 요청: " + error.message,
        returnToken,
      };
      return {
        statusCode: 400,
        body: return_body,
      };
    } else {
      const return_body = {
        success: false,
        message: "내부 서버 오류",
        returnToken,
      };
      return {
        statusCode: 500,
        body: return_body,
      };
    }
  }
};
