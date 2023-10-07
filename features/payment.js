const { queryDatabase, queryDatabase_multi } = require("db.js");

class ExpectedError extends Error {
  constructor({ status, message, detail_code }) {
    super(message);
    this.status = status;
    this.detail_code = detail_code;
  }
}
//=========================================Model=======================================================
class Payment {
  constructor(delivery_info) {
    this.id = delivery_info.id;
    this.invoice_number = delivery_info.invoice_number;
    this.courier_company_code = delivery_info.courier_company_code;
    this.tikkling_id = delivery_info.tikkling_id;
    this.state_id = delivery_info.state_id;
    this.address = delivery_info.address;
    this.detail_address = delivery_info.detail_address;
    this.created_at = delivery_info.created_at;
    this.start_delivery_date = delivery_info.start_delivery_date;
    this.expected_delivery_date = delivery_info.expected_delivery_date;
    this.actual_delivery_date = delivery_info.actual_delivery_date;
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

module.exports = { DeliveryService };
