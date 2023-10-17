const { queryDatabase, queryDatabase_multi } = require("db.js");

exports.post_tikkling_create = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;

  //main logic------------------------------------------------------------------------------------------------------------------//

  try {
    //body의 funding_limit와 오늘날짜를 비교해서 7일 이내인지 확인
    //비교 단위를 변수로 설정
    const diffUnit = 8;
    const today = new Date();
    const funding_limit = new Date(req.body.funding_limit);
    const diff = funding_limit.getTime() - today.getTime();
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
    if (diffDays > diffUnit || diffDays < 0) {
      const return_body = {
        detail_code: "04",
        success: false,
        message: `잘못된 요청, 티클링 마감일은 ${diffUnit}일 이내여야 합니다. 이를 수정하고 싶다면 diffUnit의 변경을 요청해주세요`,
        returnToken: null,
      };
      return res.status(403).send(return_body);
    }

    const [user_info, product_info, friends] = await queryDatabase_multi(
      `select name, image, is_tikkling, tikkling_ticket from users where id = ?;
      select quantity, price from products where id = ?;
      SELECT friend_user_id from friends_relation where central_user_id = ? and relation_state_id in (1, 2);`,
      [id, req.body.product_id, id]
    );
    //body의 tikkle_quantity와 price를 비교해서 올바른지 확인
    const correct_tikkle_quantity = product_info[0].price / 5000;
    if (correct_tikkle_quantity !== req.body.tikkle_quantity) {
      const return_body = {
        detail_code: "05",
        success: false,
        message: `잘못된 요청, 티클링 티클 개수가 올바르지 않습니다. 티클 개수는 ${correct_tikkle_quantity}개여야 합니다.`,
        returnToken: null,
      };
      return res.status(403).send(return_body);
    }
    //티클링중이면 에러
    if (user_info[0].is_tikkling === 1) {
      const return_body = {
        detail_code: "01",
        success: false,
        message: "잘못된 요청, 이미 티클링중인 유저입니다.",
        returnToken,
      };
      return res.status(403).send(return_body);
    }
    if (product_info.length === 0) {
      const return_body = {
        detail_code: "00",
        success: false,
        message: "잘못된 요청, 존재하지 않는 상품입니다.",
        returnToken: null,
      };
      return res.status(404).send(return_body);
    }
    //해당상품 재고가 남아있는지 확인 - 해당 이벤트 동시 발생시 에러 가능성 있음
    if (product_info[0].quantity == 0) {
      const return_body = {
        detail_code: "02",
        success: false,
        message: "잘못된 요청, 해당 상품의 재고가 남아있지 않습니다.",
        returnToken: null,
      };
      return res.status(403).send(return_body);
    }
    //티켓이 있는지 확인
    if (user_info[0].tikkling_ticket == 0) {
      const return_body = {
        detail_code: "03",
        success: false,
        message: "잘못된 요청, 티클링 티켓이 없습니다.",
        returnToken: null,
      };
      return res.status(403).send(return_body);
    }

    //티클링 생성
    const results = await queryDatabase_multi(
      `CALL create_tikkling(?, ?, ?, ?, ?, @success);
      select @success as success;`,
      [id, req.body.funding_limit, req.body.tikkle_quantity, req.body.product_id, req.body.type]
    );

    if (results[1][0].success == 0) {
      console.log("post_tikkling_create에서 동시발생 이벤트로 로직이 작동하지 않았습니다.");
      const return_body = {
        success: false,
        detail_code: "00",
        message: "누군가 먼저 해당 상품을 티클링을 시작해서 티클링 생성을 실패하였습니다. 다시 시도해주세요",
        returnToken: null,
      };
      return res.status(400).send(return_body);
    } else if (results[1][0].success == 1) {
      const return_body = {
        success: true,
        detail_code: "00",
        message: "티클링 생성을 성공하였습니다.",
        returnToken,
      };

      /* 알림은 send notification 에서 */
      // //친구가 존재한다면
      // if (friends.length > 0) {
      //   //각 친구들에게 전달할 values를 리스트로 생성
      //   let notifications = friends.map((friend) => [
      //     friend.friend_user_id,
      //     `${user_info[0].name}님이 티클링을 시작하였습니다.`,
      //     1,
      //     `{
      //       "source_user_profile: ${user_info[0].image},
      //     }`,
      //     id,
      //   ]);
      //   //생성된 list를 values로 묶어서 한번에 insert
      //   let notificationValues = notifications
      //     .map(
      //       (notification) =>
      //         `(${notification
      //           .map(
      //             (value) => (typeof value === "number" ? value : `'${value}'`) // 문자열이 아닌 경우에는 따옴표를 추가하지 않습니다
      //           )
      //           .join(",")})`
      //     )
      //     .join(",");

      //   await queryDatabase(
      //     `INSERT INTO notification (user_id, message, notification_type_id, meta_data, source_user_id) VALUES ${notificationValues}`
      //   );
      // }

      return res.status(200).send(return_body);
    }
  } catch (err) {
    console.error(`🚨error -> ⚡️post_tikkling_create : 🐞${err}`);
    const return_body = {
      success: false,
      detail_code: "00",
      message: "서버 에러",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }
};
