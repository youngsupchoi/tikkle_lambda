
class Response {
    static create = (success, detail_code, message, data = null, token = null) => {
        return{success, detail_code, message, data, token};
    }
}

module.exports = { Response };