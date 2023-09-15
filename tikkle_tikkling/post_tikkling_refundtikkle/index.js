const { queryDatabase, queryDatabase_multi } = require("db.js");

/**
 * get_tikkle_data
 *
 * @param {number} tikkle_id
 * @returns {object} tikkle_data
 */

const get_tikkle_data = async (tikkle_id) => {
  const [tikkle_data] = await queryDatabase(
    `SELECT sending_tikkle.*, tikkling.state_id
    FROM sending_tikkle 
    inner join tikkling on sending_tikkle.tikkling_id = tikkling.id
    WHERE sending_tikkle id = ?;`,
    [tikkle_id]
  );
  return tikkle_data;
};

/**
 * Checks if the user is the owner of the tikkle.
 *
 * @param {object} tikkle_data
 * @param {number} user_id
 * @returns {boolean} True if the user is the owner, otherwise false.
 */

const check_tikkle_own = async (tikkle_data, user_id) => {
  if (tikkle_data.user_id == user_id) {
    return true;
  } else {
    return false;
  }
};

/**
 * Checks if the tikkle is used.
 *
 * @param {number} tikkle_id
 * @returns {boolean} True if the tikkle is used, otherwise false.
 */
const check_tikkle_not_used = async (tikkle_data) => {
  //미사용된 티클인지 확인
  if (tikkle_data.state_id == 1) {
    return true;
  } else {
    return false;
  }
};

exports.post_tikkling_refundtikkle = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;
  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    //해당 보낸 티클이 현재 유저의 보낸 티클내역이 맞는지 확인
    const tikkle_data = await get_tikkle_data(body.tikkle_id);
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
    const is_tikkle_own = check_tikkle_own(tikkle_data, id);
    // 해당 티클이 이미 사용되었는지 확인
    const is_tikkle_not_used = check_tikkle_not_used(tikkle_data);
    if (!is_tikkle_own) {
      console.log("bad request: 자신의 티클내역이 아님에도 삭제를 요청");
      const return_body = {
        success: false,
        detail_code: "01",
        message: "비정상적인 요청, 해당 티클의 소유자가 아닙니다.",
        returnToken: null,
      };
      return res.status(403).send(return_body);
    } else if (!is_tikkle_not_used) {
      console.log("bad request: 이미 사용된 티클에 대한 삭제를 요청");
      const return_body = {
        success: false,
        detail_code: "02",
        message: "비정상적인 요청, 이미 사용된 티클입니다.",
        returnToken: null,
      };
      return res.status(403).send(return_body);
    }

    //티클링 티클을 모두 받아 종료된 상태라면 해당 티클링의 상태를 다시 티클을 받을 수 있는 상태로 변경
    //티클 환불 절차 진행
    //줄 수 있는 상태인지 확인
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
