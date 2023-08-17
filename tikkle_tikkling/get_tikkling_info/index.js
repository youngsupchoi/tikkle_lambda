const { queryDatabase } = require("db.js");

exports.get_tikkling_info = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    // 쿼리 스트링 파라미터에서 tikkling_id를 추출, 숫자인지 확인
    const tikkling_id = req.params ? req.params.tikkling_id : null;

    if (tikkling_id === 0) {
      //tikkling_id 파라미터가 없을 경우 자신의 tikkling 정보를 DB에서 조회
      const query = `SELECT tikkling_info.*, product_category.name as category_name FROM (SELECT users.id as user_id, users.name as user_name, view.id as tikkling_id, view.funding_limit, view.tikkle_quantity, view.tikkle_count, view.thumbnail_image, view.brand_name, view.product_name, view.category_id, view.type FROM active_tikkling_view as view inner join users on view.user_id = users.id WHERE users.id = ?) AS tikkling_info, product_category where tikkling_info.category_id = product_category.id`;
      const rows = await queryDatabase(query, [id]);
      if (rows.length === 0) {
        return res
          .status(404)
          .send({ success: false, message: "티클링 정보가 없습니다." });
      }
      const return_body = {
        success: true,
        data: rows,
        message: "나의 티클링 정보 조회 성공",
      };
      return res.status(200).send(return_body);
    } else {
      const parsedId = parseInt(tikkling_id, 10);

      if (isNaN(parsedId)) {
        throw new Error("입력 오류: tikkling_id는 숫자여야 합니다.");
      }

      // tikkling_id와 일치하는 tikkling의 정보를 DB에서 조회(내가 아닌 유저)
      const query = `SELECT tikkling_info.*, product_category.name as category_name FROM (SELECT users.id as user_id, users.name as user_name, view.id as tikkling_id, view.funding_limit, view.tikkle_quantity, view.tikkle_count, view.thumbnail_image, view.brand_name, view.product_name, view.category_id, view.type FROM active_tikkling_view as view inner join users on view.user_id = users.id WHERE view.id = ?) AS tikkling_info, product_category where tikkling_info.category_id = product_category.id`;
      const rows = await queryDatabase(query, [parsedId]);
      if (rows.length === 0) {
        return res
          .status(404)
          .send({ success: false, message: "티클링 정보가 없습니다." });
      }
      const return_body = {
        success: true,
        data: rows,
        message: `tikkling_id = ${tikkling_id}의 티클링 정보 조회 성공`,
        returnToken,
      };
      return res.status(200).send(return_body);
    }
  } catch (error) {
    console.log("에러 : ", error);
    if (error.message === "입력 오류: tikkling_id는 숫자여야 합니다.") {
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
