const { queryDatabase } = require("db.js");
const { getSSMParameter } = require("ssm.js");
const axios = require("axios");

async function getToken() {
	//
	const imp_key = await getSSMParameter("imp_key");
	const imp_secret = await getSSMParameter("imp_secret");

	try {
		const response = await axios({
			url: "https://api.iamport.kr/users/getToken",
			method: "post",
			headers: { "Content-Type": "application/json" },
			data: {
				imp_key: imp_key,
				imp_secret: imp_secret,
			},
		});

		return response.data;
	} catch (error) {
		// Handle errors here
		console.error("Error:", error);
		return 0;
	}
}

//
exports.get_payment_apiToken = async (req, res) => {
	const body = req.body;
	const id = req.id;
	const returnToken = req.returnToken;

	//-------- get token --------------------------------------------------------------------------------------//
	// console.log("#####################################");

	const response = await getToken();

	if (response === 0) {
		console.log("get_payment_apiToken 에서 에러가 발생했습니다.");
		const return_body = {
			success: false,
			detail_code: "00",
			message: "import token get error",
			returnToken: null,
		};
		return res.status(500).send(return_body);
	}

	const token = response.response.access_token;
	// console.log("RES : ", token);

	//-------- return result --------------------------------------------------------------------------------------//

	const return_body = {
		success: true,
		data: token,
		detail_code: "00",
		message: "success get token info",
		//returnToken: returnToken,
	};
	return res.status(200).send(return_body);
};
