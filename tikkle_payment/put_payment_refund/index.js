const { Payment } = require("../../features/Payment");
const { User } = require("../../features/User");
const { Response } = require("../../features/Response");

exports.put_payment_refund = async (req, res) => {
	const { body, id, returnToken } = req;
	const { merchant_uid } = body;

	//main logic------------------------------------------------------------------------------------------------------------------//
	try {
		//payment를 생성
		const paymnet_info = await Payment.getPaymentByMerchantUid({
			merchant_uid,
		});

		//payment 객체 생성
		const payment = new Payment(paymnet_info);

		//결제 실패 처리
		await payment.updatePaymentToFail();

		return res
			.status(200)
			.send(
				Response.create(true, "00", "결제 실패 처리 완료", null, returnToken)
			);
	} catch (err) {
		console.error(`🚨 error -> ⚡️ put_payment_refund : 🐞 ${err}`);
		if (err.status) {
			return res
				.status(err.status)
				.send(Response.create(false, err.detail_code, err.message));
		}
		return res.status(500).send(Response.create(false, "00", "서버 에러"));
	}
};
