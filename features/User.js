const { queryDatabase, queryDatabase_multi } = require("db.js");
const { getSSMParameter } = require("ssm.js");
const { ExpectedError} = require("./ExpectedError.js");

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
  }

  createById = async (id) => {
    try{
      const query = `INSERT INTO users (id) VALUES (?);`;
      const [user] = await queryDatabase(query, [id]);
      return new User(user);

    }catch(error){
      console.error("error -> getUserById ");
      throw new ExpectedError({
        status: "500",
        message: `서버에러`,
        detail_code: "00",
      });
    }
  }
}
