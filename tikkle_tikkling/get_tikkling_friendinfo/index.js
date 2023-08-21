const { queryDatabase } = require("db.js");

exports.get_tikkling_friendinfo = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    const rows = await queryDatabase(
      `SELECT 
      atv.*, 
      u.id AS user_id, 
      u.name AS user_name, 
      u.birthday, 
      u.nick, 
      u.phone, 
      u.gender, 
      u.image AS friend_image, 
      u.address, 
      u.detail_address, 
      u.is_tikkling, 
      FROM active_tikkling_view atv
      JOIN users u ON atv.user_id = u.id
      WHERE u.id IN (
      SELECT fr.friend_user_id 
      FROM friends_relation fr 
      WHERE fr.central_user_id = ? AND fr.relation_state_id IN (1, 2));`,
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
