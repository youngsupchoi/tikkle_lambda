const { queryDatabase, queryDatabase_multi } = require("db.js");
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
      console.error(`🚨error -> createById : 🐞${error}`);
      throw error;
    }
  };

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
      console.error(`🚨error -> decreaseTikkleTicket : 🐞${error}`);
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
      console.error(`🚨error -> decreaseTikkleTicket : 🐞${error}`);
      throw error;
    }
  }

  async deleteWishlist(product_id) {
    try {
      const query = `DELETE FROM user_wish_list WHERE user_id = ? AND product_id = ?`;
      await this.db.executeQuery(query, [this.id, product_id]);
    } catch (error) {
      console.error(`🚨error -> deleteWishlist : 🐞${error}`);
      throw error;
    }
  }
}

module.exports = { User };
