
class Response {
    constructor({success, detail_code, message, data = null, token = null}) {
        this.success = success;
        this.detail_code = detail_code;
        this.message = message;
        this.data = data;
        this.returnToken = token;
    }
}

module.exports = { Response };