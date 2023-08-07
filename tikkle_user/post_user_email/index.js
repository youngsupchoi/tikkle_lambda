const { getSSMParameter } = require("ssm.js");
const { checkToken } = require("token.js");
const nodemailer = require("nodemailer");

async function sendEmail(title, content) {
	try {
		const lifoli_email = await getSSMParameter("lifoli_email");
		const lifoli_email_password = await getSSMParameter(
			"lifoli_email_password"
		);

		const transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: lifoli_email,
				pass: lifoli_email_password,
			},
		});

		const mailOptions = {
			from: lifoli_email,
			to: lifoli_email,
			subject: title,
			text: content,
		};

		const info = await transporter.sendMail(mailOptions);
		return info.response;
	} catch (error) {
		return -1;
	}
}

function getCurrentDateTime() {
	const options = {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		timeZone: "Asia/Seoul", // Using Seoul timezone
	};
	const currentDateTime = new Date().toLocaleString("en-US", options);
	return currentDateTime.replace(",", "");
}

exports.post_user_email = async (event) => {
	const headers = event.headers;
	const body = event.body;
	const authorization = headers.authorization;
	const [accessToken, refreshToken] = authorization.split(",");

	const title = body.title;
	const content = body.content;

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

	//console.log("id : ", id);

	//-------- right email --------------------------------------------------------------------------------------//

	const currentDateTime = getCurrentDateTime();

	const emailRet = await sendEmail(
		"inquire form [user_id: " + id + "] : " + title,
		"<< inquire from [user_id: " +
			id +
			"] >>\n" +
			content +
			"\n\n" +
			currentDateTime
	);

	console.log("retEmail : ", emailRet);

	//-------- return result --------------------------------------------------------------------------------------//
	if (emailRet === -1) {
		return {
			statusCode: 401,
			body: JSON.stringify({
				accessToken: returnToken,
				data: "fail to send inquire",
			}),
		};
	}

	return {
		statusCode: 200,
		body: JSON.stringify({
			accessToken: returnToken,
			data: "inquire send success",
		}),
	};
};
