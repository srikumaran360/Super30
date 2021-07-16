const nodemailer = require("nodemailer");
const {google} = require("googleapis");
const OAuth2 = google.auth.OAuth2;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const REDIRECT_URI = process.env.REDIRECT_URI;
const EMAIL = process.env.EMAIL;

const createTransporter = async () => {
    const oauth2Client = new OAuth2(
		CLIENT_ID,
		CLIENT_SECRET,
		REDIRECT_URI
    );
  
    oauth2Client.setCredentials({
        refresh_token: REFRESH_TOKEN
  });
    
    const accessToken = await new Promise((resolve, reject) => {
		oauth2Client.getAccessToken((err, token) => {
			if (err) {
				console.log(err);
				reject();
			}
			resolve(token);
		});
    });
   

    const transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			type: "OAuth2",
			user: EMAIL,
			clientId: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			refreshToken: REFRESH_TOKEN,
            accessToken: accessToken
		},
		tls: {
			rejectUnauthorized: false
		}
    });
  
    return transporter;
};

module.exports.sendEmail = async (options) => {
	let emailTransporter;
	try{
		emailTransporter = await createTransporter();
	} catch (err) {
		console.log(err);
		throw Error("cannot create Transporter");
	}
    
    try{
        emailOptions = {
            subject: options.subject,
            to: options.to,
            html: options.html,
            from: 'SUPER 30<'+EMAIL+'>'
        }
    } catch {
        throw Error("Missing fields to send email")
    }
	console.log(emailOptions);

    const res = await emailTransporter.sendMail(emailOptions).catch(err => {
		console.log(err);
	});
    console.log(res);

    return true;
};