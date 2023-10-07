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
}
