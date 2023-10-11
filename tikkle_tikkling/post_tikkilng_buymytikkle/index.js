const { queryDatabase } = require("db.js");
const { Tikkling } = require("../../features/Tikkling");
const { Payment } = require("../../features/Payment");
const { Response } = require("../../features/Response");
const { ExpectedError } = require("../../features/ExpectedError");
const { DBManager } = require("../../db");
//남은 티클 개수만 충족되면 티클 줄 수 있음
//TODO: 결제 실패 api
exports.post_tikkling_buymytikkle = async (req, res) => {
	const { body, id, returnToken } = req;
	const { merchant_uid, imp_uid, status } = body;
	//main logic------------------------------------------------------------------------------------------------------------------//

	const db = new DBManager();
	await db.openTransaction();

	try {
		//결제정보 가져오기
		const paymnet_info = await Payment.getPaymentByMerchantUid({
			merchant_uid,
			db
		});
		//payment 객체 생성
		const payment = new Payment(paymnet_info);
		//DB상의 결제정보와 비교
		payment.compareStoredPaymentData({ user_id: id });
		//줄 수 있는 상태인지 확인
		const tikkling = new Tikkling({ user_id: id });
		//티클링 정보 가져오기
		await tikkling.loadActiveTikklingViewByUserId();
		//요청 정보 유효성 검사
		tikkling.validateBuyMyTikkleRequest();
		//나의 남은 티클 구매
		await tikkling.buyMyTikkle({ merchant_uid });
		//결제 완료 처리
		await payment.finlizePayment();
		const buy_tikkle_quantity =
			tikkling.tikkle_quantity - tikkling.tikkle_count;
		await db.commitTransaction();
		return res
			.status(200)
			.send(
				Response.create(
					true,
					"00",
					"나의 모든 티클 구매 성공",
					{ buy_tikkle_quantity },
					returnToken
				)
			);
	} catch (err) {
		await db.rollbackTransaction();
			const payment_info = await Payment.getPaymentByMerchantUid({merchant_uid, db});
			const payment = new Payment(payment_info);
			const port_one_token = await Payment.getPaymentApiToken();
			//포트원 환불 api 호출
			await payment.callPortOneCancelPaymentAPI({reason: "buymytikkle 처리중 에러", port_one_token});
			//결제 처리 롤백
			await payment.updatePaymentToCancle();

	
		console.error(`🚨 error -> ⚡️ post_tikkling_buymytikkle : 🐞 ${err}`);
		if (err instanceof ExpectedError) {
			return res
				.status(err.status)
				.send(Response.create(false, err.detail_code, err.message));
		}
		const return_body = {
			success: false,
			detail_code: "00",
			message: "서버 에러",
			returnToken: null,
		};
		return res.status(500).send(return_body);
	}
	};

