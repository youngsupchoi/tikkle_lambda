const { queryDatabase, queryDatabase_multi } = require("db.js");
const { getSSMParameter } = require("ssm.js");
const { ExpectedError} = require("./ExpectedError.js");

class Tikkling {
  constructor({ id, user_id, funding_limit, created_at = null, tikkle_quantity, product_id, terminated_at, state_id, type, resolution_type}) {
    this.id = id;
    this.user_id = user_id;
    this.funding_limit = funding_limit;
    this.created_at = created_at;
    this.tikkle_quantity = tikkle_quantity;
    this.product_id = product_id;
    this.terminated_at = terminated_at;
    this.state_id = state_id;
    this.type = type;
    this.resolution_type = resolution_type;
  }
  
  /**
   * Asynchronously saves the payment info including merchant_uid, user_id, amount, and state to the database.
   * @returns {Promise<Object>} - A promise that resolves with the results of the query, including affectedRows, insertId, and warningStatus.
   * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
   * @memberof Payment
   * @instance
   * @async
   * @example
   * const payment = new Payment({ user_id: 1, amount: 10000 });
   * await payment.savePayment();
   * // => { affectedRows: 1, insertId: 1, warningStatus: 0 }
   * // => payment.id = 1
   * // => payment.created_at = 2020-01-01 00:00:00
   * // => payment.state = 'PAYMENT_PENDING'
   */
  async savePayment() {
    try {
      return await queryDatabase(
        `INSERT INTO payment (merchant_uid, user_id, amount, state) VALUES (?, ?, ?, ?)`,
        [this.merchant_uid, this.user_id, this.amount, this.state]
      );
    } catch (err) {
      console.error(`🚨error -> ⚡️getUserById : 🐞${err}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  /**
   * generate merchant_uid
   * @returns {string} - merchant_uid
   * @memberof Payment
   * @instance
   * @example
   * const payment = new Payment({ user_id: 1, amount: 10000 });
   * payment.generateMerchantUid();
   * // => 'tikkling_1581234567890'
   */
  generateMerchantUid() {
    return (
      "tikkling_" + new Date().getTime() + Math.floor(Math.random() * 1000000)
    );
  }

  /**
   * create payment info
   * @param {string} user_name
   * @param {string} user_phone_number
   * @returns {PaymentInfo}
   * @memberof Payment
   * @instance
   * @example
   * const payment = new Payment({ user_id: 1, amount: 10000 });
   * payment.createPaymentInfo('홍길동', '01012345678');
  */
  createPaymentInfo({user_name, user_phone_number}) {
    const amount = this.amount;
    const merchant_uid = this.merchant_uid;
    return new PaymentInfo({ user_name, user_phone_number, amount, merchant_uid });
  }

}



module.exports = { Tikkling };
