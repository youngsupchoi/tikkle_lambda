const { Payment } = require("../../features/Payment");
const { User } = require("../../features/User");
const { Response } = require("../../features/Response");
const { Notice } = require("../../features/Notice");

exports.put_payment_refund = async (req, res) => {
	const { body, id, returnToken } = req;
	const { merchant_uid, reason } = body;

	//main logic------------------------------------------------------------------------------------------------------------------//
	try {
		//payment를 생성
		const paymnet_info = await Payment.getPaymentByMerchantUid({
			merchant_uid,
		});

		//payment 객체 생성
		const payment = new Payment(paymnet_info);

		//DB상의 결제정보와 비교
		payment.compareStoredPaymentInfo({ user_id: id });

		//완료된 결제인지 확인
		await payment.checkComplete();

		//아직 사용하지 않은 티클인지 확인
		await payment.checkUnusedTikkle();

		//포트원 토큰 가져오기
		const port_one_token = await Payment.getPaymentApiToken();

		//결제 환불 처리 in Tikkle DB (sendingTikkle state = 3, payment state = PAYMENT_CANCELLED)
		await payment.updatePaymentToCancle();

		//아이엠 포트 결제 취소
		await payment.callPortOneCancelPaymentAPI({
			port_one_token: port_one_token,
			reason: reason,
		});

		const notice = new Notice({
			type_id: 9,
			receive_user_id: id,
			send_user_id: id,
		});

		await notice.sendPayCancleNoti(merchant_uid);

		return res
			.status(200)
			.send(
				Response.create(true, "00", "결제 환불 처리 완료", null, returnToken)
			);
	} catch (err) {
		//TODO: 에러시 DB 롤백
		console.error(`🚨 error -> ⚡️ put_payment_refund : 🐞 ${err}`);
		if (err.status) {
			return res
				.status(err.status)
				.send(Response.create(false, err.detail_code, err.message));
		}
		return res
			.status(500)
			.send(Response.create(false, "00", "서버 : 결제 환불 처리 실패"));
	}
};
