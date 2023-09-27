const { queryDatabase, queryDatabase_multi } = require("db.js");

exports.put_tikkling_end = async (req, res) => {
  const body = req.body;
  const id = req.id;
  const returnToken = req.returnToken;
  const type = req.params.type;
  //main logic------------------------------------------------------------------------------------------------------------------//
  //TODO: 티클 환급 선택시 products 테이블에 quantity를 늘려줘야함
  //TODO: 티클 환급, 환불, 사용 선택시 sending_tikkle에서 해당 tikkle들 상태 변환
  //TODO: 조각이 모두 모인 후 티클의 환불이 일어날시에 해당 티클링의 상태를 다시 1로 변환해야함
  try {
    //티클링이 상태가 이미 변화했는지 확인
    const check_tikkling = await queryDatabase(
      `select tikkling.*, sum(sending_tikkle.quantity) as sending_tikkle_count 
    from tikkling left join sending_tikkle on tikkling.id = sending_tikkle.tikkling_id 
    where tikkling.id = ? group by tikkling.id;`,
      [req.body.tikkling_id]
    );

    //유효한 요청인지 검사-----------------------------------------------------------------------------------------------------------------//
    //티클링이 없는 경우
    if (check_tikkling.length == 0) {
      console.log("비정상적 요청-put_tikkling_end: 티클링을 찾을 수 없습니다.");
      const return_body = {
        success: false,
        detail_code: "00",
        message: "비정상적 요청, 티클링을 찾을 수 없습니다.",
        returnToken: null,
      };
      return res.status(404).send(return_body);
    } else if (check_tikkling[0].user_id != id) {
      console.log(
        "bad request-put_tikkling_end: 해당 티클링의 소유자가 아닙니다."
      );
      const return_body = {
        success: false,
        detail_code: "00",
        message: "비정상적인 요청, 해당 티클링의 소유자가 아닙니다.",
        returnToken: null,
      };
      return res.status(401).send(return_body);
    }
    //티클링이 종료된 경우
    else if (check_tikkling[0].terminated_at != null) {
      const return_body = {
        success: false,
        detail_code: "02",
        message: "이미 종료된 티클링입니다.",
        returnToken,
      };
      return res.status(400).send(return_body);
    } else if (check_tikkling[0].state_id == 1) {
      const return_body = {
        success: false,
        detail_code: "01",
        message:
          "비정상적 요청, 아직 진행중인 티클링입니다. 먼저 중단한 뒤 해당 api를 요청하세요",
        returnToken,
      };
      return res.status(403).send(return_body);
    }
    const [user_info] = await queryDatabase(
      `select bank_code, account, address, detail_address from users where id = ?;`,
      [id]
    );

    //환불------------------------------------------------------------------------------------------------------------------//

    if (type == "refund") {
      if (user_info.bank_name == null || user_info.account == null) {
        const return_body = {
          success: false,
          detail_code: "03",
          message: "유저의 환급 계좌 정보가 없습니다.",
          returnToken,
        };
        return res.status(400).send(return_body);
      } else {
        //tikkling을 종료시키고 환불 요청 목록에 추가
        await queryDatabase_multi(
          `START TRANSACTION;
          UPDATE tikkling SET terminated_at = now() WHERE id = ?;
          INSERT INTO refund (tikkling_id, bank_code, account, expected_refund_amount) VALUES (?, ?, ?, ?);
          COMMIT;
          `,
          [
            req.body.tikkling_id,
            req.body.tikkling_id,
            user_info.bank_name,
            user_info.account,
            check_tikkling[0].sending_tikkle_count * 5000 * 0.9,
          ]
        );
        const return_body = {
          success: true,
          detail_code: "01",
          message: `티클링에 대해 성공적으로 환급을 요청하였습니다.`,
          returnToken,
        };
        return res.status(200).send(return_body);
      }
    }
    //상품 수령--------------------------------------------------------------------------------------------------------------------------------//
    else if (type == "goods") {
      //input주소 데이터 검증
      if (
        !req.body.zonecode ||
        !req.body.address ||
        !req.body.detail_address ||
        typeof req.body.zonecode !== "string" ||
        typeof req.body.address !== "string" ||
        typeof req.body.detail_address !== "string" ||
        req.body.zonecode.length !== 5 ||
        req.body.address.length > 250 ||
        req.body.detail_address.length > 250
      ) {
        console.log(
          "put_tikkling_end의 주소 입력 데이터에서 에러가 발생했습니다."
        );
        const return_body = {
          success: false,
          detail_code: "05",
          message: "address value is null or invalid",
          returnToken: null,
        };
        return res.status(400).send(return_body);
      }

      if (
        check_tikkling[0].sending_tikkle_count !=
        check_tikkling[0].tikkle_quantity
      ) {
        const return_body = {
          success: false,
          detail_code: "01",
          message: "아직 모든 티클이 모이지 않았습니다.",
          returnToken,
        };
        return res.status(400).send(return_body);
      } else if (
        req.body.zonecode == null ||
        req.body.address == null ||
        req.body.detail_address == null
      ) {
        const return_body = {
          success: false,
          detail_code: "04",
          message: "유저의 주소 정보가 없습니다.",
          returnToken,
        };
        return res.status(400).send(return_body);
      }
      await queryDatabase_multi(
        `START TRANSACTION;
        UPDATE tikkling SET terminated_at = now(), resolution_type='goods' WHERE id = ?;
        INSERT INTO delivery_info (tikkling_id, zonecode, address, detail_address) VALUES (?, ?, ?, ?);
        COMMIT;`,
        [
          req.body.tikkling_id,
          req.body.tikkling_id,
          req.body.zonecode,
          req.body.address,
          req.body.detail_address,
        ]
      );
      //티클링 종료
      const return_body = {
        success: true,
        detail_code: "02",
        message: `티클링을 성공적으로 종료하였습니다. 배송요청을 완료하였습니다.`,
        returnToken,
      };
      return res.status(200).send(return_body);
    }
  } catch (err) {
    console.log("Failed to connect or execute query:", err);
    console.log("put_tikkling_end에서 에러가 발생했습니다.");
    const return_body = {
      success: false,
      detail_code: "00",
      message: "서버 에러",
      returnToken: null,
    };
    return res.status(500).send(return_body);
  }
};
