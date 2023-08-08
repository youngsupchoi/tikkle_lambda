const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.get_tikkling_info = async (req, res) => {
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
    // 쿼리 스트링 파라미터에서 tikkling_id를 추출, 숫자인지 확인
    const tikkling_id = req.params ? req.params.tikkling_id : null;

    if (!tikkling_id) {
      throw new Error("입력 오류: tikkling_id 파라미터가 필요합니다.");
    }

    const parsedId = parseInt(tikkling_id, 10);

    if (isNaN(parsedId)) {
      throw new Error("입력 오류: tikkling_id는 숫자여야 합니다.");
    }

    // tikkling_id와 일치하는 tikkling의 정보를 DB에서 조회
    const query = `SELECT * FROM tikkling WHERE id = ?`;
    const rows = await queryDatabase(query, [parsedId]);
    if (rows.length === 0) {
      return res
        .status(404)
        .send({ success: false, message: "티클링 정보가 없습니다." });
    }
    const return_body = {
      success: true,
      data: rows,
      message: "티클링 정보 조회 성공",
    };
    return res.status(200).send(return_body);
  } catch (error) {
    console.log("에러 : ", error);
    if (
      error.message === "입력 오류: tikkling_id 파라미터가 필요합니다." ||
      error.message === "입력 오류: tikkling_id는 숫자여야 합니다."
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "잘못된 요청: " + error.message,
        }),
      };
    } else {
      console.log("get_tikkling_info에서 문제가 발생했습니다.");
      return res.status(500).send({ success: false, message: "서버 오류" });
    }
  }
};
