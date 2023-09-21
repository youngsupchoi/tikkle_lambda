const { queryDatabase } = require("db.js");

exports.get_tikkling_info = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    // 쿼리 스트링 파라미터에서 tikkling_id를 추출, 숫자인지 확인
    const tikkling_id = req.params ? req.params.tikkling_id : null;

    if (tikkling_id == 0) {
      //tikkling_id 파라미터가 없을 경우 자신의 tikkling 정보를 DB에서 조회
      const query = `SELECT 
      u.id AS user_id, 
      u.name AS user_name, 
      a.tikkling_id, 
      a.funding_limit, 
      a.tikkle_quantity, 
      a.tikkle_count, 
      a.state_id,
      a.thumbnail_image, 
      a.brand_name, 
      a.product_name, 
      a.category_id, 
      a.type, 
      pc.name AS category_name 
      FROM active_tikkling_view a 
      JOIN users u ON a.user_id = u.id 
      JOIN product_category pc ON a.category_id = pc.id 
      WHERE u.id = ?;`;
      const rows = await queryDatabase(query, [id]);
      if (rows.length == 0) {
        return res.status(404).send({
          success: false,
          detail_code: "00",
          message: "티클링 정보가 없습니다.",
          returnToken: null,
        });
      }
      const return_body = {
        success: true,
        data: rows,
        detail_code: "01",
        message: "나의 티클링 정보 조회 성공",
        returnToken,
      };
      return res.status(200).send(return_body);
    } else {
      const parsedId = parseInt(tikkling_id, 10);

      if (isNaN(parsedId)) {
        throw new Error("입력 오류: tikkling_id는 숫자여야 합니다.");
      }

      // tikkling_id와 일치하는 tikkling의 정보를 DB에서 조회(내가 아닌 유저, state_id = 1만 조회 가능)
      const query = `SELECT 
      u.id AS user_id, 
      u.name AS user_name, 
      a.tikkling_id, 
      a.funding_limit, 
      a.tikkle_quantity, 
      a.tikkle_count, 
      a.thumbnail_image, 
      a.brand_name, 
      a.product_name, 
      a.category_id, 
      a.type, 
      pc.name AS category_name 
      FROM active_tikkling_view a 
      JOIN users u ON a.user_id = u.id 
      JOIN product_category pc ON a.category_id = pc.id 
      WHERE a.id = ? AND a.state_id = 1;
      `;
      const rows = await queryDatabase(query, [parsedId]);
      if (rows.length == 0) {
        return res.status(404).send({
          success: false,
          detail_code: "00",
          message: "티클링 정보가 없습니다.",
          returnToken: null,
        });
      }
      const return_body = {
        success: true,
        data: rows,
        detail_code: "02",
        message: `tikkling_id = ${tikkling_id}의 티클링 정보 조회 성공`,
        returnToken,
      };
      return res.status(200).send(return_body);
    }
  } catch (error) {
    console.log("에러 : ", error);
    if (error.message === "입력 오류: tikkling_id는 숫자여야 합니다.") {
      const return_body = {
        success: false,
        detail_code: "00",
        message: "tikkling_id는 숫자여야 합니다.",
        returnToken,
      };
      return res.status(400).send(return_body);
    } else {
      console.log("get_tikkling_info에서 문제가 발생했습니다.");
      const return_body = {
        success: false,
        detail_code: "00",
        message: "서버 오류",
        returnToken,
      };
      return res.status(500).send(return_body);
    }
  }
};
