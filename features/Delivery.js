const { ExpectedError } = require("./ExpectedError.js");
//=========================================Model=======================================================
class Delivery {
  constructor({
    id,
    invoice_number,
    courier_company_code,
    tikkling_id,
    state_id,
    zonecode,
    address,
    detail_address,
    created_at,
    start_delivery_date,
    expected_delivery_date,
    actual_delivery_date,
    db,
  }) {
    this.id = id || null;
    this.invoice_number = invoice_number || null;
    this.courier_company_code = courier_company_code || null;
    this.tikkling_id = tikkling_id || null;
    this.state_id = state_id || null;
    this.zonecode = zonecode || null;
    this.address = address || null;
    this.detail_address = detail_address || null;
    this.created_at = created_at || null;
    this.start_delivery_date = start_delivery_date || null;
    this.expected_delivery_date = expected_delivery_date || null;
    this.actual_delivery_date = actual_delivery_date || null;
    this.db = db || null;
  }

  updateDelivery(row_of_delivery) {
    try {
      this.id = row_of_delivery.id;
      this.invoice_number = row_of_delivery.invoice_number;
      this.courier_company_code = row_of_delivery.courier_company_code;
      this.tikkling_id = row_of_delivery.tikkling_id;
      this.state_id = row_of_delivery.state_id;
      this.zonecode = row_of_delivery.zonecode;
      this.address = row_of_delivery.address;
      this.detail_address = row_of_delivery.detail_address;
      this.created_at = row_of_delivery.created_at;
      this.start_delivery_date = row_of_delivery.start_delivery_date;
      this.expected_delivery_date = row_of_delivery.expected_delivery_date;
      this.actual_delivery_date = row_of_delivery.actual_delivery_date;
    } catch (error) {
      console.error(`🚨error -> ⚡️updateDelivery : 🐞객체의 모든 값이 전달되지 않았습니다.`);
      throw ExpectedError({
        status: 500,
        detail_code: "00",
        message: "서버에러",
      });
    }
  }

  /**
   * 유저아이디를 받고 해당 유저의 가장 최근 티클링에 대한 배송정보를 가져옴
   * @param {number} user_id
   * @returns {void}
   * @async
   *
   */
  async getRecentDeliveryInfoOfUser(user_id) {
    try {
      const rows = await this.db.executeQuery(
        `
      SELECT delivery_info.* 
      FROM delivery_info as delivery_info 
      INNER JOIN (SELECT * FROM tikkling WHERE user_id = ?) AS user_tikkling ON delivery_info.tikkling_id = user_tikkling.id 
      ORDER BY delivery_info.created_at DESC LIMIT 1`,
        [user_id]
      );
      if (rows.length === 0) {
        throw ExpectedError({
          status: 404,
          etail_code: "00",
          message: "해당 유저의 배송 기록이 없습니다.",
        });
      }
      this.updateDelivery(rows[0]);
      return;
    } catch (error) {
      console.log(`🚨error -> ⚡️ getRecentDeliveryInfoOfUser : 🐞${error}`);
      throw error;
    }
  }

  /**
   * @description 주어진 티클링 아이디에 해당하는 배송정보를 가져오는 함수
   * @param {number} tikkling_id
   * @returns
   */

  async getDeliveryInfoByTikklingId(tikkling_id) {
    try {
      const rows = await this.db.executeQuery(`SELECT * FROM delivery_info WHERE tikkling_id = ?`, [tikkling_id]);
      if (rows.length === 0) {
        throw ExpectedError({
          status: 404,
          etail_code: "01",
          message: "해당 티클링의 배송 기록이 없습니다.",
        });
      }
      this.updateDelivery(rows[0]);
      return;
    } catch (error) {
      console.log(`🚨error -> ⚡️ getDeliveryInfoByTikklingId : 🐞${error}`);
      throw error;
    }
  }

  async saveDeliveryData() {
    try {
      const result = await this.db.executeQuery(`INSERT INTO delivery_info (tikkling_id, state_id, zonecode, address, detail_address) VALUES (?, ?, ?, ?, ?)`, [
        this.tikkling_id,
        this.state_id,
        this.zonecode,
        this.address,
        this.detail_address,
      ]);
      if (result.affectedRows === 0) {
        throw ExpectedError({
          status: 500,
          detail_code: "00",
          message: "배송 정보 저장 실패",
        });
      }
      this.id = result.insertId;
    } catch (error) {
      console.error(`🚨error -> ⚡️saveDeleveryData : 🐞${error}`);
      throw error;
    }
  }
}

//=========================================Repository=======================================================

module.exports = { Delivery };
