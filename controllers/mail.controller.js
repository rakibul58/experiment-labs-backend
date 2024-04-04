const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const nodemailer = require('nodemailer');
const { SESClient, SendEmailCommand, CreateTemplateCommand, UpdateTemplateCommand, SendTemplatedEmailCommand, SendBulkTemplatedEmailCommand } = require('@aws-sdk/client-ses');
const orgCollection = client.db('experiment-labs').collection('organizations');
const emailTemplateCollection = client.db('experiment-labs').collection('emailTemplate');
const crypto = require('crypto');
const userCollection = client.db("experiment-labs").collection("users");

const secretKey = process.env.SECRET_KEY;
const algorithm = 'aes-256-cbc';

// Decrypt function
const decrypt = (text) => {
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), Buffer.from(text.iv, 'hex'));
    let decrypted = decipher.update(Buffer.from(text.encryptedData, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

const transporter = nodemailer.createTransport({
    host: process.env.smtp_server,
    port: process.env.smtp_port,
    auth: {
        user: process.env.smtp_login,
        pass: process.env.smtp_key,
    },
});

function transformString(input) {
    // Check if the string contains only alphanumeric characters (and spaces, for initial check)
    const isAlphanumeric = /^[a-z0-9 ]+$/i.test(input);

    if (!isAlphanumeric) {
        // If the string contains non-alphanumeric characters, return a message or handle as needed
        return 'Input contains non-alphanumeric characters.';
    }

    // Replace spaces with underscores
    const transformedString = input.replace(/ /g, '_');

    return transformedString;
}

const createSendEmailCommand = (toAddress, fromAddress, subject, message, htmlPart) => {
    return new SendEmailCommand({
        Destination: {
            /* required */
            CcAddresses: [
                /* more items */
            ],
            ToAddresses: [
                toAddress,
                /* more To-email addresses */
            ],
        },
        Message: {
            /* required */
            Body: {
                /* required */
                Html: {
                    Charset: "UTF-8",
                    Data: htmlPart,
                },
                Text: {
                    Charset: "UTF-8",
                    Data: message,
                },
            },
            Subject: {
                Charset: "UTF-8",
                Data: subject,
            },
        },
        Source: fromAddress,
        ReplyToAddresses: [
            /* more items */
        ],
    });
};


const createCreateTemplateCommand = (
    name,
    subject,
    textPart,
    htmlPart) => {
    return new CreateTemplateCommand({
        /**
         * The template feature in Amazon SES is based on the Handlebars template system.
         */
        Template: {
            /**
             * The name of an existing template in Amazon SES.
             */
            TemplateName: name,
            HtmlPart: htmlPart,
            TextPart: textPart,
            SubjectPart: subject,
        },
    });
};

const createUpdateTemplateCommand = (
    name,
    subject,
    textPart,
    htmlPart
) => {
    return new UpdateTemplateCommand({
        Template: {
            TemplateName: name,
            HtmlPart: htmlPart,
            SubjectPart: subject,
            TextPart: textPart,
        },
    });
};


const createReminderEmailCommand = (toAddress, fromAddress, templateName, learner_name, course_name, site_name, site_email, task_name, start_time, end_time, meeting_link, user_name, site_url, meeting_date, learner_email) => {
    return new SendTemplatedEmailCommand({
        /**
         * Here's an example of how a template would be replaced with user data:
         * Template: <h1>Hello {{contact.firstName}},</h1><p>Don't forget about the party gifts!</p>
         * Destination: <h1>Hello Bilbo,</h1><p>Don't forget about the party gifts!</p>
         */
        Destination: { ToAddresses: [toAddress] },
        TemplateData: JSON.stringify({ learner_name: learner_name, course_name: course_name, site_name: site_name, site_email: site_email, task_name: task_name, start_time: start_time, end_time: end_time, meeting_link: meeting_link, user_name: user_name, site_url: site_url, meeting_date: meeting_date, learner_email:learner_email }),
        Source: fromAddress,
        Template: templateName,
    });
};

const createBulkReminderEmailCommand = (users, fromAddress, templateName) => {
    return new SendBulkTemplatedEmailCommand({
        /**
         * Each 'Destination' uses a corresponding set of replacement data. We can map each user
         * to a 'Destination' and provide user specific replacement data to create personalized emails.
         *
         * Here's an example of how a template would be replaced with user data:
         * Template: <h1>Hello {{name}},</h1><p>Don't forget about the party gifts!</p>
         * Destination 1: <h1>Hello Bilbo,</h1><p>Don't forget about the party gifts!</p>
         * Destination 2: <h1>Hello Frodo,</h1><p>Don't forget about the party gifts!</p>
         */
        Destinations: users.map((user) => ({
            Destination: { ToAddresses: [user.email] },
            ReplacementTemplateData: JSON.stringify({ learner_name: user.name }),
        })),
        DefaultTemplateData: JSON.stringify({ learner_name: "Shireling" }),
        Source: fromAddress,
        Template: templateName,
    });
};


module.exports.sendAnEmail = async (req, res) => {
    try {
        const organizationId = req.body.organizationId;
        const result = await orgCollection.findOne({ _id: new ObjectId(organizationId) });
        const {
            accessKeyId,
            secretAccessKey,
            region,
            sendFrom,
            email
        } = result.emailIntegration;

        const decryptedAccessKeyId = decrypt(accessKeyId);
        const decryptedSecretAccessKey = decrypt(secretAccessKey);
        const decryptedRegion = decrypt(region);
        const { to, templateType } = req.body;
        // console.log("Api clicked ==============>",{ to, templateType });
        if (sendFrom === "ses") {
            const SES_CONFIG = {
                credentials: {
                    accessKeyId: decryptedAccessKeyId,
                    secretAccessKey: decryptedSecretAccessKey
                },
                region: decryptedRegion
            };

            const sesClient = new SESClient(SES_CONFIG);
            let templateName;

            if (templateType === "default")
                templateName = result?.emailIntegration?.templateName;
            else
                templateName = req.body.templateName;

            console.log(templateName);

            // if (req.body.isBulk === true) {
            //     const courseId = req.body.courseId;
            //     const users = await userCollection.find({"courses.courseId": courseId}).toArray();
            //     const sendBulkTemplateEmailCommand = createBulkReminderEmailCommand(
            //         users,
            //         email,
            //         templateName,
            //       );

            //     const data = await sesClient.send(sendBulkTemplateEmailCommand);
            //     return res.send({
            //         success: true,
            //         data,
            //         message: "Email Sent Successfully"
            //     });
            // }

            const sendReminderEmailCommand = createReminderEmailCommand(
                to,
                email,
                templateName,
                req.body.learner_name || "learner_name",
                req.body.course_name || "course_name",
                req.body.site_name || "site_name",
                req.body.site_email || "site_email",
                req.body.task_name || "task_name",
                req.body.start_time || "start_time",
                req.body.end_time || "end_time",
                req.body.meeting_link || "meeting_link",
                req.body.user_name || "user_name",
                req.body.site_url || "site_url",
                req.body.meeting_date || "meeting_date",
                req.body.learner_email || "learner_email",
            );
            const data = await sesClient.send(sendReminderEmailCommand);
            res.send({
                success: true,
                data,
                message: "Email Sent Successfully"
            });

        }
        else {
            const mailOptions = {
                from: "naman.j@experimentlabs.in",
                to: to,
                subject: subject,
                text: message
            };

            const isSent = await transporter.sendMail(mailOptions);
            console.log(isSent);

            if (isSent)
                res.send({ success: true, message: "Email Sent Successfully" });
        }


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to Send Mail' });
    }
};


module.exports.createSESEmailTemplate = async (req, res) => {
    try {
        const orgId = req.params.organizationId;
        const {
            name,
            subject,
            textPart,
            htmlPart,
            email,
            templateType
        } = req.body;
        const result = await orgCollection.findOne({ _id: new ObjectId(orgId) });
        const {
            accessKeyId,
            secretAccessKey,
            region,
        } = result.emailIntegration;

        const decryptedAccessKeyId = decrypt(accessKeyId);
        const decryptedSecretAccessKey = decrypt(secretAccessKey);
        const decryptedRegion = decrypt(region);

        const SES_CONFIG = {
            credentials: {
                accessKeyId: decryptedAccessKeyId,
                secretAccessKey: decryptedSecretAccessKey
            },
            region: decryptedRegion
        };

        const sesClient = new SESClient(SES_CONFIG);
        const templateName = transformString(name);
        const createTemplateCommand = createCreateTemplateCommand(
            templateName,
            subject,
            textPart,
            htmlPart
        );
        const data = await sesClient.send(createTemplateCommand);
        const dbData = await emailTemplateCollection.insertOne({
            templateName,
            subject,
            textPart,
            htmlPart,
            email,
            templateType,
            organizationId: orgId,
            createdAt: new Date()
        })
        res.send({
            success: true,
            data,
            dbData,
            message: "Email Template Created Successfully"
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to Send Mail' });
    }
}


module.exports.getEmailActionTemplateByOrganizationId = async (req, res) => {
    const email = req.query.email;
    const organizationId = req.params.organizationId;
    const result = await emailTemplateCollection.find({ organizationId: organizationId, email, templateType: "emailAction" }).toArray();

    res.send(result);
}


module.exports.updateEmailActionTemplate = async (req, res) => {
    const templateId = req.params.templateId;
    const {
        action,
        ...updateData
    } = req.body;

    try {
        // Assuming 'emailTemplateCollection' is your MongoDB collection.
        // $set operator is used to update only the specified fields in the document.
        if (action === "create") {

            const result = await orgCollection.findOne({ _id: new ObjectId(updateData?.organizationId) });
            const {
                accessKeyId,
                secretAccessKey,
                region,
            } = result.emailIntegration;

            const decryptedAccessKeyId = decrypt(accessKeyId);
            const decryptedSecretAccessKey = decrypt(secretAccessKey);
            const decryptedRegion = decrypt(region);

            const SES_CONFIG = {
                credentials: {
                    accessKeyId: decryptedAccessKeyId,
                    secretAccessKey: decryptedSecretAccessKey
                },
                region: decryptedRegion
            };

            const sesClient = new SESClient(SES_CONFIG);
            const templateName = transformString(updateData?.templateName);
            const createTemplateCommand = createCreateTemplateCommand(
                templateName,
                updateData?.subject,
                "textPart",
                updateData?.htmlPart
            );
            const data = await sesClient.send(createTemplateCommand);

            const emailResult = await emailTemplateCollection.updateOne(
                { _id: new ObjectId(templateId) },
                { $set: updateData }
            );

            if (result.modifiedCount === 0) {
                // No document found with the given organizationId and templateId, or no update made.
                return res.status(404).send({ message: "Template not found or no update needed." });
            }

            res.send({ success: true, emailResult, data, message: "Template Created Successfully" });

        }
        else if (action === "update") {
            const result = await orgCollection.findOne({ _id: new ObjectId(updateData?.organizationId) });
            const {
                accessKeyId,
                secretAccessKey,
                region,
            } = result.emailIntegration;

            const decryptedAccessKeyId = decrypt(accessKeyId);
            const decryptedSecretAccessKey = decrypt(secretAccessKey);
            const decryptedRegion = decrypt(region);

            const SES_CONFIG = {
                credentials: {
                    accessKeyId: decryptedAccessKeyId,
                    secretAccessKey: decryptedSecretAccessKey
                },
                region: decryptedRegion
            };

            const sesClient = new SESClient(SES_CONFIG);
            const templateName = transformString(updateData?.templateName);
            const updateTemplateCommand = createUpdateTemplateCommand(templateName,
                updateData?.subject,
                "textPart",
                updateData?.htmlPart);
            const data = await sesClient.send(updateTemplateCommand);

            const emailResult = await emailTemplateCollection.updateOne(
                { _id: new ObjectId(templateId) },
                { $set: updateData }
            );

            if (result.modifiedCount === 0) {
                // No document found with the given organizationId and templateId, or no update made.
                return res.status(404).send({ message: "Template not found or no update needed." });
            }

            res.send({ success: true, emailResult, data, message: "Template Updated Successfully" });
        }


        else {
            const result = await emailTemplateCollection.updateOne(
                { _id: new ObjectId(templateId) },
                { $set: updateData }
            );

            if (result.modifiedCount === 0) {
                // No document found with the given organizationId and templateId, or no update made.
                return res.status(404).send({ message: "Template not found or no update needed." });
            }

            res.send(result);
        }

    } catch (error) {
        console.error("Error updating email action template:", error);
        res.status(500).send({ message: "Failed to update template due to an internal error." });
    }
};











// const nodemailer = require('nodemailer');
// const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: process.env.MAIL_USERNAME,
//         pass: process.env.MAIL_PASSWORD,
//         clientId: process.env.OAUTH_CLIENTID,
//         clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         refreshToken: process.env.OAUTH_REFRESH_TOKEN
//     }
// });

// module.exports.sendEmail = async (req, res, next) => {

//     const data = req.body;
//     console.log(transporter);
//     const mailOptions = {
//         from: data?.from,
//         to: data?.to,
//         subject: data?.subject + ` sent by ${data?.from}`,
//         text: data?.message
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//         if (error) {
//             res.send({ "Success": false });
//         } else {
//             res.send({ "Success": true });
//         }
//     });

// };