const { getSSMParameter } = require("ssm.js");
const crypto = require("crypto");
const { ExpectedError } = require("./ExpectedError.js");

class Refund {
  constructor({ id, tikkling_id, bank_code, account, created_at, state_id, expected_refund_amount, actual_refund_amount, refund_date, db }) {
    this.id = id || null;
    this.tikkling_id = tikkling_id || null;
    this.bank_code = bank_code || null;
    this.account = account || null;
    this.created_at = created_at || null;
    this.state_id = state_id || null;
    this.expected_refund_amount = expected_refund_amount || null;
    this.actual_refund_amount = actual_refund_amount || null;
    this.refund_date = refund_date || null;
    this.db = db || null;
  }

  async saveRefund() {
    try {
      const result = await this.db.executeQuery(`INSERT INTO refund (tikkling_id, bank_code, account, expected_refund_amount) VALUES (?, ?, ?, ?)`, [
        this.tikkling_id,
        this.bank_code,
        this.account,
        this.expected_refund_amount,
      ]);
      this.id = result.insertId;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = { Refund };
