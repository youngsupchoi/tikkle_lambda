const { Tikkling } = require("../../features/Tikkling");
const { Tikkle } = require("../../features/Tikkle");
const { Response } = require("../../features/Response");
const { ExpectedError } = require("../../features/ExpectedError");
const { DBManager } = require("../../db");
const { queryDatabase } = require("db.js");

exports.post_payment_finalize = async (req, res) => {
  const { body, id, returnToken, params } = req;
  const { tikkleAction } = params;
  const { merchant_uid, imp_uid, status } = body;
  //main logic------------------------------------------------------------------------------------------------------------------//
  const db = new DBManager();
  await db.openTransaction();
  try {
    //티클 객체 생성
    const tikkle_info = await Tikkle.getTikkleByMerchantUid({ merchant_uid, db });

    const tikkle = new Tikkle({ ...tikkle_info, db });

    //결제 이전인지 확인
    tikkle.assertTikkleIsNotPaid();

    //티클링 객체 생성
    const tikkling = new Tikkling({ id: tikkle.tikkling_id, db });

    //해당 티클링 락
    await tikkling.lockTikklingForInsertTikkle();

    //티클링 정보 가져오기
    await tikkling.loadActiveTikklingViewByTikklingId();

    //티클링이 티클을 받을 수 있는 상태인지 검사
    if (tikkleAction == "sendtikkle") {
      await tikkling.validateSendTikkleRequest({ tikkle_quantity: tikkle.quantity });
      await tikkling.checkAndUpdateTikklingStateToEnd({ tikkle_quantity: tikkle.quantity });
    } else if (tikkleAction == "buymytikkle") {
      tikkling.validateBuyMyTikkleRequest({ user_id: tikkle.user_id, tikkle_quantity: tikkle.quantity });
    }

    //DB상 결제 완료 처리
    await tikkle.completeTikklePayment();

    //트랜잭션 종료
    await db.commitTransaction();

    //-------- send notification --------------------------------------------------------------------------------------//
    try {
      //보낸 사람 이름 가져오기
      try {
        const rows = await queryDatabase("select * from users where id = ?", [id]);
        sqlResult = rows;
        //console.log("SQL result : ", sqlResult);
      } catch (err) {
        console.log("🚨 error ->알림을 위한 회원정보 조회 에서 에러가 발생했습니다.", err);
      }

      // check data is one
      if (sqlResult.length !== 1) {
        console.log("🚨 error ->알림을 위한 회원정보 조회 에서 에러가 발생했습니다.");
      }

      const name = sqlResult[0].name;
      const profile = sqlResult[0].image;

      const message = name + "님이 보낸 티클을 확인해보세요.";
      const title = "티클 도착 🎁";
      const link = "link_for_5";
      const deep_link = "tikkle://tikklingDetail/" + tikkling.id.toString();
      const source_user_id = tikkle.user_id;
      const receive_user_id = tikkling.user_id;
      const meta_data = profile;

      //DB 알림 보내기
      await queryDatabase(
        `INSERT INTO notification
        (user_id, message, is_deleted, is_read, notification_type_id, deep_link, link, meta_data, source_user_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [receive_user_id, message, 0, 0, 5, deep_link, link, meta_data, source_user_id]
      );
    } catch (err) {
      console.log("🚨 error -> @@@ 알림을 보내는데에서 에러가 발생했습니다.", err);
    }

    return res.status(200).send(Response.create(true, "00", "결제 데이터 저장 완료"));
  } catch (err) {
    //티클 정보 가져오기
    const tikkle_info = await Tikkle.getTikkleByMerchantUid({ merchant_uid, db });

    //티클 객체 생성
    const tikkle = new Tikkle({ ...tikkle_info, db });

    //확실한 결제 직후의 상태
    if (tikkle.state_id == 5) {
      //포트원 토큰 가져오기
      const port_one_token = await Tikkle.getPortOneApiToken();

      //포트원 환불 api 호출
      await tikkle.callPortOneCancelPaymentAPI({ reason: "buymytikkle 처리중 에러", port_one_token });
    }

    //트랜잭션 롤백
    await db.rollbackTransaction();

    console.error(`🚨error -> ⚡️ post_payment_finalize/${tikkleAction} : 🐞${err}`);
    if (err.status) {
      return res.status(err.status).send(Response.create(false, err.detail_code, err.message));
    }
    return res.status(500).send(Response.create(false, "00", "서버 에러"));
  }
};
