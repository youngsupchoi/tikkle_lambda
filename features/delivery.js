const { queryDatabase, queryDatabase_multi } = require("db.js");
//=========================================Model=======================================================
class Delivery {
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
class DeliveryRepository {
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
class DeliveryService {
  constructor() {
    this.repository = new DeliveryRepository();
  }
  /**
   * create delivery by id
   * @param {number} id
   * @returns {Delivery}
   */
  async createDeliveryById(id) {
    const deliveryData = await this.repository.getById(id);
    if (!deliveryData) {
      throw new Error(`Delivery not found for id: ${id}`);
    }
    return new Delivery(deliveryData);
  }
  /**
   * check delivery can start
   * @param {Delivery} delivery
   * @returns {boolean}
   */
  checkDeliveryCanStart(delivery) {
    if (delivery.state_id != 1) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * start delivery
   * @param {Delivery} delivery
   * @returns {Promise}
   * @throws {Error}
    */
  async startDelivery(delivery) {
    const result = await this.repository.updateDeliveryToStart(
      delivery.id,
      delivery.invoice_number,
      delivery.courier_company_code,
      delivery.delivery_period
    );
    if (result.affectedRows === 0) {
      throw new Error(`Delivery not found for id: ${delivery.id}`);
    }
    return;
  }


}

module.exports = { DeliveryService };
