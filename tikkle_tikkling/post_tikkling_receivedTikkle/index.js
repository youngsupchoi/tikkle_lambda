const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.post_tikkling_receivedTikkle = async (req, res) => {
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
    const rows = await queryDatabase(
      "SELECT * FROM sending_tikkle WHERE tikkling_id = ?;",
      [body.tikkling_id]
    );

    const return_body = {
      success: true,
      data: rows,
      message: "티클링 정보 조회 성공",
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
