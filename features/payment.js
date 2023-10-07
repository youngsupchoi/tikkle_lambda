const { queryDatabase, queryDatabase_multi } = require("db.js");
const { getSSMParameter } = require("ssm.js");
const { ExpectedError} = require("./ExpectedError.js");

//=========================================Model=======================================================
class Payment {
  constructor({ user_id, amount, state = 'PAYMENT_PENDING', created_at = null }) {
    this.merchant_uid = this.generateMerchantUid();
    this.user_id = user_id;
    this.amount = amount;
    this.state = state;
    this.created_at = created_at;
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

class PaymentInfo {
  constructor({ user_name, user_phone_number, amount, merchant_uid }) {
    this.pg = getSSMParameter("pg");
    this.pay_method = "trans";
    this.merchant_uid = merchant_uid;
    this.name = "티클";
    this.buyer_name = user_name;
    this.buyer_tel = user_phone_number;
    //TODO: redirect url 필요한 파라미터인지 다시 체크
    this.m_redirect_url = "https://www.naver.com/";
    this.app_scheme = "example";
    this.amount = amount;
  }
}

//=========================================Repository=======================================================
class PaymentRepository {
  getById(id) {
    return queryDatabase(`SELECT * FROM delivery_info WHERE id = ?`, [id]);
  }
  getByTikklingId(tikkling_id) {
    return queryDatabase(`SELECT * FROM delivery_info WHERE tikkling_id = ?`, [
      tikkling_id,
    ]);
  }
  //delilvery를 시작 -> state_id = 2, start_delivery_date = now(), expected_delivery_date = now() + 3days,invoice_number = body.invoice_number, courier_company_code = body.courier_company_code

  /**
   * Updates delivery details when the delivery starts.
   *
   * @param {number} id - Delivery ID
   * @param {string} invoice_number - Invoice number for the delivery
   * @param {string} courier_company_code - Code for the courier company
   * @param {number} delivery_period - Expected period (in days) for the delivery
   * @returns {Promise} - A promise that resolves with the results of the query
   */
  updateDeliveryToStart(
    id,
    invoice_number,
    courier_company_code,
    delivery_period
  ) {
    const query = `UPDATE delivery_info 
      SET state_id = 2, 
      start_delivery_date = NOW(), 
      expected_delivery_date = DATE_ADD(NOW(), INTERVAL ? DAY), 
      invoice_number = ?, 
      courier_company_code = ? 
      WHERE id = ?`;
    const values = [delivery_period, invoice_number, courier_company_code, id];
    return queryDatabase(query, values);
  }
}
//=========================================Service=======================================================
class PaymentService {
  constructor() {
    this.repository = new DeliveryRepository();
  }
  /**
   * create delivery by id
   * @param {number} id
   * @returns {Delivery}
   */
  async createDeliveryById(id) {
    const [deliveryData] = await this.repository.getById(id);
    if (!deliveryData) {
      throw new ExpectedError({
        status: "404",
        message: `존재하지 않는 배송정보입니다.`,
        detail_code: "00",
      });
    }
    return new Delivery(deliveryData);
  }

  /**
   * check delivery can start
   * @param {Delivery} delivery - The delivery object to be checked.
   * @returns {void}
   */
  checkDeliveryCanStart(delivery) {
    if (delivery.state_id != 1) {
      throw new ExpectedError({
        status: "400",
        message: `이미 시작이 이루어진 배송입니다.`,
        detail_code: "00",
      });
    } else {
      return;
    }
  }

  /**
   * start delivery
   * @param {number} id
   * @param {string} invoice_number
   * @param {string} courier_company_code
   * @param {number} delivery_period
   * @returns {Promise}
   * @throws {Error}
   */
  async startDelivery(
    id,
    invoice_number,
    courier_company_code,
    delivery_period
  ) {
    const result = await this.repository.updateDeliveryToStart(
      id,
      invoice_number,
      courier_company_code,
      delivery_period
    );
    if (result.affectedRows === 0) {
      throw new ExpectedError({
        status: "404",
        message: `존재하지 않는 배송정보입니다.`,
        detail_code: "00",
      });
    }
    return;
  }
}

module.exports = { Payment };
