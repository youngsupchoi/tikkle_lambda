const { queryDatabase, queryDatabase_multi } = require("db.js");
const { getSSMParameter } = require("ssm.js");
const { ExpectedError} = require("./ExpectedError.js");

class Tikkling {
  constructor({ id, user_id, funding_limit, created_at = null, tikkle_quantity, product_id, terminated_at, state_id, type, resolution_type, tikkle_count, db}) {
    this.id = id || null;
    this.user_id = user_id || null;
    this.funding_limit = funding_limit || null;
    this.created_at = created_at || null;
    this.tikkle_quantity = tikkle_quantity || null;
    this.product_id = product_id || null;
    this.terminated_at = terminated_at || null;
    this.state_id = state_id || null;
    this.type = type || null;
    this.resolution_type = resolution_type || null;
    this.tikkle_count = tikkle_count || null;
    this.db = db;
  }

  updateFromDatabaseResult(dbResult) {
    Object.keys(this).forEach((key) => {
      if (dbResult.hasOwnProperty(key)) {
        this[key] = dbResult[key];
      }
    });
  }
  /**
 * Asynchronously loads the active tikkling view info from the database by Tikkling ID.
 * @returns {Promise<Object>} - A promise that resolves with the results of the query, including affectedRows, insertId, and warningStatus.
 * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
 * @memberof Tikkling
 * @instance
 * @async
 * @example
 * const tikkling = new Tikkling({ id: 1 });
 * await tikkling.loadActiveTikklingViewByTikkling_id();
 */
  async loadActiveTikklingViewByUserId(){
    try{
      const rows = await this.db.executeQuery(
        `SELECT * FROM active_tikkling_view WHERE user_id = ?`,
        [this.user_id]
      );
      if(!Tikkling.checkRowExists(rows)) {
        throw new ExpectedError({
          status: "404",
          message: `비정상적 요청, 티클링이 존재하지 않습니다.`,
          detail_code: "00",
        });
      }
      let active_tikkling = rows[0];
      active_tikkling.id = active_tikkling.tikkling_id;
      this.updateFromDatabaseResult(active_tikkling);
    } catch(err){
      console.error(`🚨 error -> ⚡️ loadActiveTikklingViewByUserId : 🐞 ${err}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  async loadActiveTikklingViewByTikklingId(){
    try{
      const rows = await this.db.executeQuery(
        `SELECT * FROM active_tikkling_view WHERE tikkling_id = ?`,
        [this.id]
      );
      if(!Tikkling.checkRowExists(rows)) {
        throw new ExpectedError({
          status: "404",
          message: `비정상적 요청, 티클링이 존재하지 않습니다.`,
          detail_code: "00",
        });
      }
      let active_tikkling = rows[0];
      active_tikkling.id = active_tikkling.tikkling_id;
      this.updateFromDatabaseResult(active_tikkling);
    } catch(err){
      console.error(`🚨 error -> ⚡️ loadActiveTikklingViewByTikklingId : 🐞 ${err}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  static checkRowExists(rows) {
    if (rows.length == 0){
      console.error(`🚨 error -> ⚡️ checkRowExists : 🐞 쿼리의 결과가 존재하지 않음`);
      return false;
    }
    return true;
  }

  /**
   * check if the request is valid
   * @returns {void}
   * @throws {ExpectedError} Throws an ExpectedError with status 403 if the request is invalid.
   * @memberof Tikkling
   * @instance
   * @example
   * const tikkling = new Tikkling({ id: 1 });
   * await tikkling.loadActiveTikklingViewByTikkling_id();
   * tikkling.validateBuyMyTikkleRequest();
   * // => throw ExpectedError with status 403 if the request is invalid.
   */
  validateBuyMyTikkleRequest() {
    if (this.tikkle_quantity == this.tikkle_count){
      throw new ExpectedError({
        status: "403",
        message: `이미 모든 티클을 수집한 티클링입니다.`,
        detail_code: "01",
      });
    }
    else if (this.state_id !== 3 && this.state_id != 5){{
      throw new ExpectedError({
        status: "403",
        message: `비정상적 요청, 아직 티클링이 종료되지 않았거나 이미 종료되었습니다.`,
        detail_code: "02",
      });
    }}
    }
  

  async validateSendTikkleRequest({tikkle_quantity}){
    try{
      //티클링이 현재 진행중인지 확인
      if(this.state_id !== 1){
        throw new ExpectedError({
          status: "403",
          message: `티클링이 진행중이 아닙니다.`,
          detail_code: "01",
        });
      }
      //보내려는 티클 수량을 받을 수 있는지 확인
      if(this.tikkle_quantity < this.tikkle_count + tikkle_quantity){
        throw new ExpectedError({
          status: "403",
          message: `티클을 받을 수 있는 수량을 초과하였습니다.`,
          detail_code: "02",
        });
      }
    } catch(err){
      console.error(`🚨 error -> ⚡️ validateSendTikkleRequest : 🐞 ${err}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  /**
   * Asynchronously lock tikkling row for insert tikkle
  */
  async lockTikklingForInsertTikkle(){
    try{
      this.db.executeQuery(
        `SELECT * FROM tikkling WHERE id = ? FOR UPDATE;`,
        [this.id]
      );
    } catch(err){
      console.error(`🚨 error -> ⚡️ lockTikklingForInsertTikkle : 🐞 ${err}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  async buyMyTikkle({merchant_uid}){
    try{
      const results = await this.db.executeQuery(
        `INSERT INTO sending_tikkle (tikkling_id, user_id, quantity, merchant_uid) VALUES (?, ?, ?, ?); `,
        [
          this.id,
          this.user_id,
          this.tikkle_quantity -this.tikkle_count,
          merchant_uid
        ]
      );
      if (results.affectedRows == 0){
        console.error(`🚨 error -> ⚡️ buyMyTikkle : 🐞 티클의 구매가 이루어지지않음`);
        throw new ExpectedError({
          status: "500",
          message: `서버에러`,
          detail_code: "00",
        });
      }
    } catch(err){
      console.error(`🚨 error -> ⚡️ buyMyTikkle : 🐞 ${err}`);
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }

  

}

module.exports = { Tikkling };
