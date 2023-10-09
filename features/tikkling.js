const { queryDatabase, queryDatabase_multi } = require("db.js");
const { getSSMParameter } = require("ssm.js");
const { ExpectedError} = require("./ExpectedError.js");

class Tikkling {
  constructor({ id, user_id, funding_limit, created_at = null, tikkle_quantity, product_id, terminated_at, state_id, type, resolution_type, tikkle_count}) {
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
      const rows = await queryDatabase(
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
  


  

  async buyMyTikkle({merchant_uid}){
    try{
      const results = await queryDatabase(
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
