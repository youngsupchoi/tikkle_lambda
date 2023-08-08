const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.put_friend_block = async (req, res) => {
  //재설정하고자 하는 친구의 user_id
  const target_friend_id = req.body.friend_id;

  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    //이미 차단한 친구라면 차단을 해제, 아니라면 차단
    await queryDatabase(
      `UPDATE friends_relation 
       SET relation_state_id = CASE WHEN relation_state_id = 3 THEN 1 ELSE 3 END 
       WHERE central_user_id = ? and friend_user_id = ?`,
      [id, target_friend_id]
    );

    const return_body = {
      success: true,
      message: "친구 차단 혹은 해제 성공",
      returnToken,
    };
    return res.status(200).send(return_body);
  } catch (err) {
    console.error("Failed to connect or execute query:", err);
    console.log("put_friend_block에서 문제가 발생했습니다.");
    const return_body = {
      success: false,
      message: "서버 에러",
    };
    return res.status(500).send(return_body);
  }
};
