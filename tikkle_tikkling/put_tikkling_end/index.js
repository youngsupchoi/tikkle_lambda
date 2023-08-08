const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");
exports.put_tikkling_end = async (req, res) => {
	const headers = req.headers;
	const body = req.body;
	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

	//-------- check token & get user id --------------------------------------------------------------------------------------//

	let tokenCheck;
	let returnBody;
	let id;

	try {
		tokenCheck = await checkToken(accessToken, refreshToken);
		returnBody = JSON.parse(tokenCheck.body);
		id = returnBody.tokenData.id;
	} catch (error) {
		//return invalid when token is invalid
		console.log("ERROR : the token value is null or invalid");
		return {
			statusCode: 410,
			body: "login again",
		};
	}

	//return invalid when token is invalid
	if (tokenCheck.statusCode !== 200) {
		console.log("ERROR : the token value is null or invalid");
		return {
			statusCode: 410,
			body: "login again",
		};
	}

	//main logic---------------------------------------------------------------
	const returnToken = returnBody.accessToken;

	try {
		//도착한 티클링 조각이 있는지 확인
		const tikkle = await queryDatabase(
			"SELECT * FROM sending_tikkle WHERE tikkling_id = ?",
			[req.body.tikkling_id]
		);
		const next_tikkle_state = tikkle.length == 0 ? 2 : 3;

		//티클링 종료
		const rows = await queryDatabase(
			"UPDATE tikkling SET state_id = ? WHERE id = ?;",
			[next_tikkle_state, req.body.tikkling_id]
		);
		const end_state =
			next_tikkle_state == 2 ? "시작 전 종료" : "완료되기 전 종료";
		const return_body = {
			success: true,
			message: `티클링을 성공적으로 종료하였습니다.${end_state}`,
			returnToken,
		};
		return {
			statusCode: 200,
			body: JSON.stringify(return_body),
		};
	} catch (err) {
		console.error("Failed to connect or execute query:", err);
		const return_body = {
			success: false,
			data: err,
		};
		return {
			statusCode: 500,
			body: JSON.stringify(return_body),
		};
	}
};
