const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
});

module.exports.sendEmail = async (req, res, next) => {

    const data = req.body;
    console.log(transporter);
    const mailOptions = {
        from: data?.from,
        to: data?.to,
        subject: data?.subject + ` sent by ${data?.from}`,
        text: data?.message
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.send({ "Success": false });
        } else {
            res.send({ "Success": true });
        }
    });

};