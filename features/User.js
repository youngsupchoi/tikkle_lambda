const { getSSMParameter } = require("ssm.js");
const { ExpectedError } = require("./ExpectedError.js");

class User {
  constructor({
    id,
    name,
    birthday,
    nick,
    phone,
    is_deleted = false,
    gender,
    image = null,
    zonecode = null,
    address = null,
    detail_address = null,
    created_at = null,
    is_tikkling = false,
    device_token = null,
    tikkling_ticket = 2,
    account = null,
    bank_code = null,
    last_present_amount = null,
    db,
  }) {
    this.id = id;
    this.name = name;
    this.birthday = birthday;
    this.nick = nick;
    this.phone = phone;
    this.is_deleted = is_deleted;
    this.gender = gender;
    this.image = image;
    this.zonecode = zonecode;
    this.address = address;
    this.detail_address = detail_address;
    this.created_at = created_at;
    this.is_tikkling = is_tikkling;
    this.device_token = device_token;
    this.tikkling_ticket = tikkling_ticket;
    this.account = account;
    this.bank_code = bank_code;
    this.db = db;
    this.last_present_amount = last_present_amount;
  }

  /**
   * Asynchronously creates a new user with the given ID.
   * @param {number} id - User ID
   * @returns {Promise<User>} - A promise that resolves with a new User instance.
   * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
   * @memberof User
   * @static
   * @async
   * @example
   * const user = await User.createById(1);
   * // => User { id: 1, name: '홍길동', ... }
   */
  static createById = async ({ id, db }) => {
    try {
      const query = `SELECT * FROM users WHERE id = ?`;
      const [user] = await db.executeQuery(query, [id]);
      return new User({ ...user, db });
    } catch (error) {
      console.error(`🚨 error -> createById : 🐞${error}`);
      throw error;
    }
  };

  async updateLastPresentAmount(last_present_amount) {
    try {
      const result = await this.db.executeQuery(`UPDATE users SET last_present_amount = ? WHERE id = ?`, [last_present_amount, this.id]);
      if (result.affectedRows !== 1) {
        throw new ExpectedError({
          status: 500,
          detail_code: "00",
          message: "last_present_amount 수정 실패",
        });
      }
      this.last_present_amount = last_present_amount;
      return;
      
    }
    catch (error) {
      console.error(`🚨 error -> updateLastPresentAmount : 🐞${error}`);
      throw error;
    }
  }

  async validatteUserForStartTikkling() {
    try {
      // 현재 티클링이 진행중인지 확인
      if (this.is_tikkling) {
        throw new ExpectedError({
          status: "403",
          message: `비정상적 요청, 이미 티클링중인 유저입니다.`,
          detail_code: "01",
        });
      }
      // 티클링 티켓이 남아있는지 확인
      if (this.tikkling_ticket == 0) {
        throw new ExpectedError({
          status: "403",
          message: `비정상적 요청, 티클링 티켓이 없습니다.`,
          detail_code: "02",
        });
      }
    } catch (error) {
      console.error(`🚨 error -> ⚡️ validatteUser : 🐞 ${error}`);
      throw error;
    }
  }
  async decreaseTikkleTicket() {
    try {
      if (this.tikkling_ticket) {
        this.tikkling_ticket -= 1;
      }
      const query = `UPDATE users SET tikkling_ticket = tikkling_ticket - 1 WHERE id = ?`;
      await this.db.executeQuery(query, [this.id]);
    } catch (error) {
      console.error(`🚨 error -> decreaseTikkleTicket : 🐞${error}`);
      throw error;
    }
  }

  async increaseTikkleTicket() {
    try {
      if (this.tikkling_ticket) {
        this.tikkling_ticket += 1;
      }
      const query = `UPDATE users SET tikkling_ticket = tikkling_ticket + 1 WHERE id = ?`;
      await this.db.executeQuery(query, [this.id]);
    } catch (error) {
      console.error(`🚨 error -> decreaseTikkleTicket : 🐞${error}`);
      throw error;
    }
  }

  async deleteWishlist(product_id) {
    try {
      const query = `DELETE FROM user_wish_list WHERE user_id = ? AND product_id = ?`;
      await this.db.executeQuery(query, [this.id, product_id]);
    } catch (error) {
      console.error(`🚨 error -> deleteWishlist : 🐞${error}`);
      throw error;
    }
  }

  validateAddress() {
    try {
      if (
        !this.zonecode ||
        !this.address ||
        !this.detail_address ||
        typeof this.zonecode !== "string" ||
        typeof this.address !== "string" ||
        typeof this.detail_address !== "string" ||
        this.zonecode.length !== 5 ||
        this.address.length > 250 ||
        this.detail_address.length > 250
      ) {
        throw new ExpectedError({
          status: "400",
          message: `비정상적 요청, 주소 데이터가 올바르지 않습니다.`,
          detail_code: "05",
        });
      }
    } catch (error) {
      console.error(`🚨 error -> validateAddress : 🐞${error}`);
      throw error;
    }
  }
}

module.exports = { User };
