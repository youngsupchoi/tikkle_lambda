const { queryDatabase } = require("db.js");
const { checkToken } = require("token.js");

exports.get_tikkling_info = async (req) => {
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

	const returnToken = returnBody.accessToken;

	//main login -----------------------------------------------------------------------------------------------//

	try {
		// 쿼리 스트링 파라미터에서 tikkling_id를 추출, 숫자인지 확인
		const tikkling_id = req.queryStringParameters
			? req.queryStringParameters.tikkling_id
			: null;

		if (!tikkling_id) {
			throw new Error("입력 오류: tikkling_id 파라미터가 필요합니다.");
		}

		const parsedId = parseInt(tikkling_id, 10);

		if (isNaN(parsedId)) {
			throw new Error("입력 오류: tikkling_id는 숫자여야 합니다.");
		}

		// tikkling_id와 일치하는 tikkling의 정보를 DB에서 조회
		const query = `SELECT * FROM tikkling WHERE id = ?`;
		const rows = await queryDatabase(query, [parsedId]);

		const return_body = {
			success: true,
			data: rows,
		};
		const response = {
			statusCode: 200,
			body: JSON.stringify(return_body),
		};
		return response;
	} catch (error) {
		console.log("에러 : ", error);
		if (
			error.message === "입력 오류: tikkling_id 파라미터가 필요합니다." ||
			error.message === "입력 오류: tikkling_id는 숫자여야 합니다."
		) {
			return {
				statusCode: 400,
				body: JSON.stringify({
					success: false,
					message: "잘못된 요청: " + error.message,
				}),
			};
		} else {
			return {
				statusCode: 500,
				body: JSON.stringify({
					success: false,
					message: "내부 서버 오류",
				}),
			};
		}
	}
};
