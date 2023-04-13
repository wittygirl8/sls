const axios = require('axios');
const moment = require('moment');
const {
    IS_OFFLINE,
    DATMAN_SES_HANDLER_API_KEY,
    GATEWAY_MESSAGING_ENDPOINT,
    DB_RESOURCE_ARN,
    INFRA_STAGE,
    SECRET_ARN
} = process.env;
var { connectDB } = IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { getUserDetails, models } = IS_OFFLINE ? require('../../../layers/helper_lib/src') : require('mypay-helpers');
const db = connectDB(DB_RESOURCE_ARN, INFRA_STAGE + '_database', '', SECRET_ARN, IS_OFFLINE);
const { Op } = db.Sequelize;
const { otpMethod, otpStatus } = require('../helpers/otpMethod');
const { GeneralOTPRepo, UserRepo, RelationshipRepo } = require('../../../libs/repo');
const generalOTPRepo = new GeneralOTPRepo(db);
const userRepo = new UserRepo(db);
const relationshipRepo = new RelationshipRepo(db);
const API_ENDPOINT_SEND_PAYMENT_VIA_SMS = GATEWAY_MESSAGING_ENDPOINT + '/sns/send-sms';
const OTP_THRESHOLD_LIMIT = 15;
const OTP_VALIDITY = 5;
const { UserType } = models;
export class GeneralOTPService {
    async getPhoneNumber(event) {
        const merchantId = event.pathParameters.merchantId;
        const useDetails = await getUserDetails(event);
        let user;
        if (useDetails.userType === UserType.ADMIN) {
            const relationsShip = await relationshipRepo.findOne({
                where: { merchantId: merchantId },
                order: [['created_at', 'ASC']]
            });
            user = await userRepo.findByPk(relationsShip.userId);
        } else {
            user = await userRepo.findByPk(useDetails.userId);
        }
        return user?.phoneNumber || '';
    }

    async createNewotpRecord(dto) {
        return await generalOTPRepo.save(dto);
    }
    async getOtpCount(merchantId, payload) {
        const { method, type, phoneNumber } = payload;
        const expiryTime = new Date(new moment().subtract(OTP_THRESHOLD_LIMIT, 'minutes'));
        const count = generalOTPRepo.count({
            where: {
                merchantId: merchantId,
                method: method,
                type: type,
                phoneNumber,
                created_at: { [Op.gt]: expiryTime }
            }
        });
        return count;
    }

    async sendMobileOtp(otp, phoneNumber, portalURL, type) {
        const reason = type.split('-').join(' ');
        const smsText = `${otp} is your One Time Password for ${reason}. Please do not share with anyone.`;
        const headersToSendToGatewayMessagingService = {
            api_key: DATMAN_SES_HANDLER_API_KEY
        };
        const payloadToSendToGatewayMessagingService = {
            message_text: smsText,
            phone_number: phoneNumber,
            SenderId: portalURL?.includes('datmancrm') ? 'Datman' : 'OmniPay'
        };
        await axios.post(API_ENDPOINT_SEND_PAYMENT_VIA_SMS, payloadToSendToGatewayMessagingService, {
            headers: headersToSendToGatewayMessagingService
        });
    }

    createDigitCode() {
        return ('' + Math.random()).substring(2, 8);
    }

    async matchPhoneOtp(dto) {
        let isMatch = 0,
            isExpired = 0,
            invalid = 0;
        const { method, type, phoneNumber, value, merchantId } = dto;
        const expiryTime = new moment().subtract(OTP_VALIDITY, 'minutes');

        const otpMatch = await generalOTPRepo.findFirst({
            where: {
                merchantId: merchantId,
                method: method,
                type: type,
                phoneNumber
            }
        });
        if (
            otpMatch &&
            otpMatch.value === value &&
            otpMatch.status === otpStatus.PENDING &&
            moment(otpMatch.created_at).isAfter(expiryTime)
        ) {
            await generalOTPRepo.update(otpMatch, { status: otpStatus.ACCEPTED });
            isMatch = 1;
        } else if (otpMatch && otpMatch.value === value && otpMatch.status === otpStatus.PENDING) {
            isExpired = 1;
        } else {
            invalid = 1;
        }
        return { isMatch, isExpired, invalid };
    }

    async updateStatus(dto, status) {
        const { method, type, phoneNumber, merchantId } = dto;
        const expiryTime = new Date(new moment().subtract(OTP_THRESHOLD_LIMIT, 'minutes'));
        const otpList = await generalOTPRepo.findAll({
            where: {
                merchantId: merchantId,
                method: method,
                type: type,
                phoneNumber,
                created_at: { [Op.gt]: expiryTime },
                status: otpStatus.PENDING
            }
        });
        for (let otp of otpList) {
            await generalOTPRepo.update(otp, { status });
        }
        return otpList;
    }

    async createOTP(merchantId, payload) {
        const { method, type, phoneNumber, portalURL } = payload;
        const count = await this.getOtpCount(merchantId, payload);
        if (count < 5) {
            const otpCode = this.createDigitCode();
            const newotp = await this.createNewotpRecord({
                method: method === otpMethod.EMAIL ? otpMethod.EMAIL : otpMethod.PHONE,
                type,
                phoneNumber,
                merchantId,
                value: otpCode
            });
            await this.sendMobileOtp(otpCode, phoneNumber, portalURL, type);
            return newotp;
        } else {
            return null;
        }
    }

    async resendOtp(merchantId, payload) {
        const { method, type, phoneNumber } = payload;
        await this.updateStatus({ method, type, phoneNumber, merchantId }, otpStatus.CANCELLED);
        const newOtp = await this.createOTP(merchantId, payload);
        if (newOtp) {
            return true;
        } else {
            return null;
        }
    }

    async verifyOtp(merchantId, payload) {
        const { method, type, phoneNumber, value } = payload;
        const verifyStatus = await this.matchPhoneOtp({ method, type, phoneNumber, value, merchantId });
        if (verifyStatus.isMatch) {
            await this.updateStatus({ method, type, phoneNumber, value, merchantId }, otpStatus.CANCELLED);
        }
        return verifyStatus;
    }
}
