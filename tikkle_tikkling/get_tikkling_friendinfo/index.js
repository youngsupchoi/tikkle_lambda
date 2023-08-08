const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.get_tikkling_friendinfo = async (req, res) => {
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
      "SELECT * FROM active_tikkling_view INNER JOIN (SELECT * FROM users WHERE id IN (SELECT friend_user_id FROM friends_relation WHERE central_user_id = 2 and relation_state_id = 1)) AS users ON active_tikkling_view.user_id = users.id;",
      [id]
    );

    const return_body = {
      success: true,
      data: rows,
      message: "친구의 티클링 정보 조회 성공",
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (err) {
    console.error("Failed to connect or execute query:", err);
    const return_body = {
      success: false,
      message: "서버 에러",
    };
    console.log("get_tikkling_friendinfo에서 문제가 발생했습니다.");
    return res.status(500).send(return_body);
  }
};
