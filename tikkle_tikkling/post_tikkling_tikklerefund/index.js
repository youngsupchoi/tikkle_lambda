const { queryDatabase, queryDatabase_multi } = require("db.js");


const check_tikkle_own = async (tikkle_data, user_id) => {
  if (tikkle_data.user_id == user_id) {
    return true;
  } else {
    return false;
  }
};

const check_tikkle_not_used = async (tikkle_data) => {
  //미사용된 티클인지 확인
  if (tikkle_data.state_id == 1) {
    return true;
  } else {
    return false;
  }
};


const reactive_tikkling = async (tikkle_data) => {
  try{
    const result = await queryDatabase(`UPDATE tikkling SET state_id = 1 WHERE id = ?;`, [
      tikkle_data.tikkling_id,
    ]);
  }
  
  
};

exports.post_tikkling_tikklerefund = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;
  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    //해당 보낸 티클이 현재 유저의 보낸 티클내역이 맞는지 확인
    const [tikkle_data] = await queryDatabase(
      `SELECT sending_tikkle.*, tikkling.state_id
      FROM sending_tikkle 
      inner join tikkling on sending_tikkle.tikkling_id = tikkling.id
      WHERE sending_tikkle id = ?;`,
      [tikkle_id]
    );
    if (tikkle_data.length == 0) {
      console.log("bad request: 존재하지 않는 티클에 대한 삭제를 요청");
      const return_body = {
        success: false,
        detail_code: "00",
        message: "비정상적인 요청, 해당 티클이 존재하지 않습니다.",
        returnToken: null,
      };
      return res.status(404).send(return_body);
    }

    //해당 티클이 현재 유저의 보낸 티클내역이 맞는지 확인
    // 해당 티클이 이미 사용되었는지 확인
    if (tikkle_data.user_id != user_id) {
      console.log("bad request: 자신의 티클내역이 아님에도 삭제를 요청");
      const return_body = {
        success: false,
        detail_code: "01",
        message: "비정상적인 요청, 해당 티클의 소유자가 아닙니다.",
        returnToken: null,
      };
      return res.status(403).send(return_body);
    } else if (tikkle_data.state_id != 1) {
      console.log("bad request: 이미 사용된 티클에 대한 삭제를 요청");
      const return_body = {
        success: false,
        detail_code: "02",
        message: "비정상적인 요청, 이미 사용된 티클입니다.",
        returnToken: null,
      };
      return res.status(403).send(return_body);
    }

    //티클 환불 절차 진행
    const result = await queryDatabase(
      `UPDATE sending_tikkle SET state_id = 3 WHERE id = ?;`,
      [tikkle_id]
    );
    if (result.affectedRows == 0) {
      console.log("server error: post_tikkling_refundtikkle");
      const return_body = {
        success: false,
        detail_code: "00",
        message: "서버 에러",
        returnToken: null,
      };
      return res.status(500).send(return_body);
    }

  } catch (err) {
    console.error(err);
    console.log("server error: post_tikkling_refundtikkle");
    const return_body = {
      success: false,
      detail_code: "00",
      message: "서버 에러",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }
};
