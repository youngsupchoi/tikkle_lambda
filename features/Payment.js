const { queryDatabase, queryDatabase_multi } = require("db.js");
const { getSSMParameter } = require("ssm.js");
const axios = require("axios");
const { ExpectedError } = require("./ExpectedError.js");

//TODO: 매일 밤 12시에 결제 되지 않았고 12시간이 지났으면 해당 결제 실패 처리
class PaymentInfo {
	constructor({ user_name, user_phone_number, amount, merchant_uid }) {
		this.pg = getSSMParameter("pg");
		this.pay_method = "trans";
		this.merchant_uid = merchant_uid;
		this.name = "티클";
		this.buyer_name = user_name;
		this.buyer_tel = user_phone_number;
		//TODO: redirect url 필요한 파라미터인지 다시 체크
		this.m_redirect_url = "https://www.naver.com/";
		this.app_scheme = "example";
		this.amount = amount;
	}
}

class Payment {
	constructor({
		merchant_uid,
		user_id,
		amount,
		state = "PAYMENT_PENDING",
		created_at = null,
	}) {
		this.merchant_uid = merchant_uid || this.generateMerchantUid();
		this.user_id = user_id || null;
		this.amount = amount || null;
		this.state = state;
		this.created_at = created_at;
	}
	updateFromDatabaseResult(dbResult) {
		Object.keys(this).forEach((key) => {
			if (dbResult.hasOwnProperty(key)) {
				this[key] = dbResult[key];
			}
		});
	}
	/**
	 * Asynchronously saves the payment info including merchant_uid, user_id, amount, and state to the database.
	 * @returns {Promise<Object>} - A promise that resolves with the results of the query, including affectedRows, insertId, and warningStatus.
	 * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
	 * @memberof Payment
	 * @instance
	 * @async
	 * @example
	 * const payment = new Payment({ user_id: 1, amount: 10000 });
	 * await payment.savePayment();
	 * // => { affectedRows: 1, insertId: 1, warningStatus: 0 }
	 * // => payment.id = 1
	 * // => payment.created_at = 2020-01-01 00:00:00
	 * // => payment.state = 'PAYMENT_PENDING'
	 */
	async savePayment() {
		try {
			return await queryDatabase(
				`INSERT INTO payment (merchant_uid, userd_id, amount, state) VALUES (?, ?, ?, ?)`,
				[this.merchant_uid, this.user_id, this.amount, this.state]
			);
		} catch (err) {
			console.error(`🚨error -> ⚡️getUserById : 🐞${err}`);
			throw new ExpectedError({
				status: "500",
				message: `서버에러`,
				detail_code: "00",
			});
		}
	}

	/**
	 * Asynchronously updates the payment state to 'PAYMENT_FAILED' in the database.
	 * @returns {Promise<Object>} - A promise that resolves with the results of the query, including affectedRows, insertId, and warningStatus.
	 * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
	 * @memberof Payment
	 * @instance
	 * @async
	 * @example
	 * const payment = new Payment({ user_id: 1, amount: 10000 });
	 * await payment.updatePaymentToFail();
	 * // => { affectedRows: 1, insertId: 1, warningStatus: 0 }
	 * // => payment.state = 'PAYMENT_FAILED'
	 */
	async updatePaymentToFail() {
		try {
			const result = await queryDatabase(
				`UPDATE payment SET state = 'PAYMENT_FAILED' WHERE merchant_uid = ?`,
				[this.merchant_uid]
			);
			if (result.affectedRows == 0) {
				throw new ExpectedError({
					status: "500",
					message: `서버에러`,
					detail_code: "00",
				});
			} else {
				this.state = "PAYMENT_FAILED";
			}
		} catch (err) {
			console.error(`🚨 error -> ⚡️ updatePaymentToFail : 🐞 ${err}`);
			throw new ExpectedError({
				status: "500",
				message: `서버에러`,
				detail_code: "00",
			});
		}
	}

	async finlizePayment() {
		try {
			const result = await queryDatabase(
				`UPDATE payment SET state = 'PAYMENT_COMPLETED' WHERE merchant_uid = ?`,
				[this.merchant_uid]
			);
			if (result.affectedRows == 0) {
				throw new ExpectedError({
					status: "500",
					message: `서버에러`,
					detail_code: "00",
				});
			} else {
				this.state = "PAYMENT_COMPLETED";
			}
		} catch (err) {
			console.error(`🚨 error -> ⚡️ getUserById : 🐞 ${err}`);
			throw new ExpectedError({
				status: "500",
				message: `서버에러`,
				detail_code: "00",
			});
		}
	}

	static async getPaymentByMerchantUid({ merchant_uid }) {
		try {
			const rows = await queryDatabase(
				`SELECT * FROM payment WHERE merchant_uid = ?`,
				[merchant_uid]
			);
			if (!this.checkRowExists(rows)) {
				throw new ExpectedError({
					status: "403",
					message: `비정상적 접근`,
					detail_code: "00",
				});
			}
			return rows[0];
		} catch (err) {
			console.error(`🚨 error -> ⚡️ getPaymentByMerchantUid : 🐞 ${err}`);
			throw new ExpectedError({
				status: "500",
				message: `서버에러`,
				detail_code: "00",
			});
		}
	}

	static checkRowExists(rows) {
		if (rows.length == 0) {
			console.error(
				`🚨 error -> ⚡️ checkRowExists : 🐞 쿼리의 결과가 존재하지 않음`
			);
			return false;
		}
		return true;
	}
	/**
	 * generate merchant_uid
	 * @returns {string} - merchant_uid
	 * @memberof Payment
	 * @instance
	 * @example
	 * const payment = new Payment({ user_id: 1, amount: 10000 });
	 * payment.generateMerchantUid();
	 * // => 'tikkling_1581234567890'
	 */
	generateMerchantUid() {
		return (
			"tikkling_" + new Date().getTime() + Math.floor(Math.random() * 1000000)
		);
	}

	/**
	 * create payment info
	 * @param {string} user_name
	 * @param {string} user_phone_number
	 * @returns {PaymentInfo}
	 * @memberof Payment
	 * @instance
	 * @example
	 * const payment = new Payment({ user_id: 1, amount: 10000 });
	 * payment.createPaymentInfo('홍길동', '01012345678');
	 */
	createPaymentInfo({ user_name, user_phone_number }) {
		const amount = this.amount;
		const merchant_uid = this.merchant_uid;
		return new PaymentInfo({
			user_name,
			user_phone_number,
			amount,
			merchant_uid,
		});
	}

	/**
	 * Compare stored payment info and request payment info.
	 * @param {string} user_id - The merchant UID to compare.
	 * @param {string} amount - The amount to compare.
	 *
	 * @returns {void}
	 * @throws {ExpectedError} Throws an ExpectedError with status 401 if the request is invalid.
	 * @memberof Payment
	 * @instance
	 * @example
	 * const payment = new Payment({ user_id: 1, amount: 10000 });
	 * payment.compareStoredPaymentInfo({merchant_uid, amount});
	 * // => throw ExpectedError with status 401 if the request is invalid.
	 */
	compareStoredPaymentInfo({ amount, user_id }) {
		if (this.amount !== amount) {
			console.error(
				`🚨error -> ⚡️ compareStoredPaymentInfo : 🐞거래 금액이 일치하지 않습니다.`
			);
			throw new ExpectedError({
				status: "401",
				message: `비정상적 접근`,
				detail_code: "00",
			});
		}
		if (this.user_id !== user_id) {
			console.error(
				`🚨error -> ⚡️ compareStoredPaymentInfo : 🐞사용자가 일치하지 않습니다.`
			);
			throw new ExpectedError({
				status: "401",
				message: `비정상적 접근`,
				detail_code: "00",
			});
		}
	}

	// /**
	//  * Asynchronously gets the payment api token from iamport.
	//  * @returns {Promise<string>} - A promise that resolves with the access_token.
	//  * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
	//  * @memberof Payment
	//  * @instance
	//  * @async
	//  * @example
	//  * const token = await Payment.getPaymentApiToken();
	//  */
	// static async getPaymentApiToken() {
	// 	const imp_key = await getSSMParameter("imp_key");
	// 	const imp_secret = await getSSMParameter("imp_secret");
	// 	try {
	// 		const response = await axios({
	// 			url: "https://api.iamport.kr/users/getToken",
	// 			method: "post",
	// 			headers: { "Content-Type": "application/json" },
	// 			data: {
	// 				imp_key: imp_key,
	// 				imp_secret: imp_secret,
	// 			},
	// 		});

	// 		// if (response.data === 0) {
	// 		// 	console.error(
	// 		// 		`🚨error -> ⚡️ getPaymentApiToken : 🐞import token get error`
	// 		// 	);
	// 		// 	throw new ExpectedError({
	// 		// 		status: "500",
	// 		// 		message: `서버에러`,
	// 		// 		detail_code: "00",
	// 		// 	});
	// 		// }

	// 		console.log("RES : ", response);

	// 		return response;
	// 	} catch (error) {
	// 		// Handle errors here
	// 		console.error("Error:", error);
	// 		return 0;
	// 	}
	// }
	/**
	 * Asynchronously gets the payment api token from iamport.
	 * @returns {Promise<string>} - A promise that resolves with the access_token.
	 * @throws {ExpectedError} Throws an ExpectedError with status 500 if the database query fails.
	 * @memberof Payment
	 * @instance
	 * @async
	 * @example
	 * const token = await Payment.getPaymentApiToken();
	 */
	static async getPaymentApiToken() {
		try {
			const response = await getToken();

			return response.response.access_token;
		} catch (error) {
			// Handle errors here
			console.error("Error:", error);
			return 0;
		}
	}

	//port one의 특정 결제 취소 api를 호출
	static async callPortOneCancelPaymentAPI({ merchant_uid, amount }) {
		try {
			const response = await axios({
				url: "https://api.iamport.kr/payments/cancel",
				method: "post",
				headers: { "Content-Type": "application/json" },
				data: {
					merchant_uid,
					checksum,
					reason,
				},
			});
			if (response.data === 0) {
				console.error(
					`🚨error -> ⚡️ callPortOneCancelPaymentAPI : 🐞import token get error`
				);
				throw new ExpectedError({
					status: "500",
					message: `서버에러`,
					detail_code: "00",
				});
			}
		} catch (err) {
			console.error(`🚨 error -> ⚡️ callPortOneCancelPaymentAPI : 🐞 ${err}`);
			throw new ExpectedError({
				status: "500",
				message: `서버에러`,
				detail_code: "00",
			});
		}
	}
}

module.exports = { Payment };

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
