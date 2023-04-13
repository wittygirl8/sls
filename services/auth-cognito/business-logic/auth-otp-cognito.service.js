import { AuthOTPRepo } from '../../../libs/repo';

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
var { sendEmail } = process.env.IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');

var AWS = require('aws-sdk');

const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);

const authOTPRepo = new AuthOTPRepo(db);
const { Op } = db.Sequelize;

export class AuthOtpCognitoService {
    async getById(id) {
        return await authOTPRepo.findOne({
            where: {
                id: id
            }
        });
    }

    async findLatestNoOtpIssued(email) {
        return await authOTPRepo.findFirst({
            where: {
                issueTime: { [Op.eq]: null },
                email: email
            }
        });
    }

    async deleteUnused(email) {
        return await authOTPRepo.findFirst({
            where: {
                issueTime: { [Op.eq]: null },
                email: email
            }
        });
    }

    //Housekeeping
    async deleteAllUnused(email) {
        const ttl = 12 * 60 * 60 * 1000; //12 hours in miliseconds
        const minimumDate = Date.now() - ttl;
        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            await authOTPRepo.deleteAllByQuery(
                {
                    where: {
                        email: email,
                        created_at: { [Op.lte]: new Date(minimumDate) }
                    }
                },
                transaction
            );
            await transaction.commit();
        } catch (error) {
            console.error(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async updateWithOtp(id, data) {
        let transaction;

        try {
            transaction = await db.sequelize.transaction();

            const details = await this.getById(id);

            if (!details) {
                return null;
            }

            const otpDto = {
                hash: data.hash,
                issueTime: data.issueTime
            };

            await authOTPRepo.update(details, otpDto, transaction);

            await transaction.commit();
        } catch (error) {
            console.log(error);
            if (transaction) {
                await transaction.rollback();
            }
            throw error;
        }
    }

    async sendEmailMsg(email, givenName, code, portalUrl) {
        const senderEmail = portalUrl?.includes('datmancrm')
            ? process.env.SENDER_DATMAN_EMAIL
            : process.env.SENDER_OMNIPAY_EMAIL;
        await sendEmail({
            from: senderEmail,
            subject: 'OTP Login',
            template: this.emailMessage(givenName, code),
            to: email
        });
    }

    async sendSms(phoneNumber, code) {
        const msg = this.smsMessage(code);
        const params = {
            Message: msg,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    DataType: 'String',
                    StringValue: 'Datman'
                }
            }
        };
        // Create promise and SNS service object
        const publishTextPromise = new AWS.SNS({ apiVersion: '2010-03-31' }).publish(params).promise();
        console.log('before publishTextPromise', publishTextPromise);
        const result = await publishTextPromise.then().catch((error) => {
            console.log('error', error);
        });
        console.log('after publishTextPromise', publishTextPromise, 'result', result);
    }

    emailMessage(givenName, code) {
        let emailMessage = `
            <div style="color:#44435E;">
                <p >
                    Hi ${givenName ? givenName : ''},<br><br>
                    You request to login without password. Below is your 6 digit
                    verification code and is valid 5 minutes.<br><br>
                    <div style="font-size:30px; text-align: center;">
                    <b>${code}</b> <br><br>
                    </div>
                    Best Regards<br>
                </p>
            </div>
        `;

        return emailMessage;
    }

    smsMessage(code) {
        let smsMessage = `Your verification code - ${code} and is valid for 5 minutes`;

        return smsMessage;
    }
}
