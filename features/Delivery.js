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
