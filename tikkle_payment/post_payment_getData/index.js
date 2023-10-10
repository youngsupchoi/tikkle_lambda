const { Payment } = require("../../features/Payment");
const { User } = require("../../features/User");
const { Response } = require("../../features/Response");
const axios = require("axios");

exports.post_payment_getData = async (req, res) => {
	const { body, id, returnToken } = req;
	const { merchant_uid } = body;
	try {
		//-------- get portone token --------------------------------------------------------------------------------------//

		const token = await Payment.getPaymentApiToken();
		const Authorization = "Bearer " + token;

		//-------- call port one AI for data --------------------------------------------------------------------------------------//
		let result = null;

		try {
			const axios_result = await axios({
				url: "https://api.iamport.kr/payments/" + merchant_uid,
				method: "get",
				headers: {
					"Content-Type": "application/json",
					Authorization: Authorization,
				},
			});

			// console.log("RES : ", axios_result.data);
			result = axios_result.data.response;
		} catch (error) {
			// Handle errors here
			console.error("Error:", error);
			throw new ExpectedError({
				status: "500",
				message: `서버에러`,
				detail_code: "00",
			});
		}

		//-------- return result --------------------------------------------------------------------------------------//

		const return_body = {
			success: true,
			data: result,
			detail_code: "00",
			message: "success get product info",
			returnToken: returnToken,
		};
		return res.status(200).send(return_body);

		///
	} catch (err) {
		console.error(`🚨error -> ⚡️ post_payment_getData : 🐞${err}`);
		if (err.status) {
			return res
				.status(err.status)
				.send(createResponseBody(false, err.detail_code, err.message));
		}

		return res.status(500).send(createResponseBody(false, "00", "서버 에러"));
	}
};
