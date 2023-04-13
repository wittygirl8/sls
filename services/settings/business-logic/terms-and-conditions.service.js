var {
    TermsAndConditionsMapRepo,
    UserRepo,
    AcquirerAccountConfigurationRepo,
    TermsAndConditionsRepo,
    AcquirersRepo
} = require('../../../libs/repo');

var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const { EntityToColumn } = require('../helpers/TermsAndConditionsNameToColumn');
const { TermsAncConditionsStatus } = require('../helpers/TermsAndConditionsStatus');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;

const termsAndConditionsMapRepo = new TermsAndConditionsMapRepo(db);
const termsAndConditionsRepo = new TermsAndConditionsRepo(db);
const acquirerAccountConfigurationRepo = new AcquirerAccountConfigurationRepo(db);
const userRepo = new UserRepo(db);
const acquirerRepo = new AcquirersRepo(db);
import Axios from 'axios';
const DNA_URL = process.env.DNA_URL;

const moment = require('moment');

export class TermsAndConditionsService {
    async acceptTermsAndConditions(entityId, entity, selectedDocumentIds, sourceIP, userId, userAgentInfo, event) {
        let transaction = await db.sequelize.transaction();
        try {
            const entityColumn = EntityToColumn[entity];
            const user = await userRepo.findByPk(userId);
            const activatedDate = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');

            const termsAndConditions = await termsAndConditionsMapRepo.findAll({
                where: {
                    [entityColumn]: entityId,
                    tcId: { [Op.in]: selectedDocumentIds },
                    status: TermsAncConditionsStatus.PENDING
                }
            });

            const termsAndConditionMapDto = {
                status: TermsAncConditionsStatus.ACTIVE,
                signerIp: sourceIP,
                signedBy: user.id,
                activatedAt: activatedDate,
                userAgentInfo: userAgentInfo
            };

            const allTermsAndConditionsIds = [];
            const tcDocIds = [];

            for (let i = 0; i < termsAndConditions.length; i++) {
                allTermsAndConditionsIds.push(termsAndConditions[i].id);
                tcDocIds.push(termsAndConditions[i].tcId);
            }

            const where = {
                id: {
                    [Op.in]: allTermsAndConditionsIds // this will update all the records with an id from the list
                }
            };

            await termsAndConditionsMapRepo.updateAll(where, termsAndConditionMapDto, { transaction });

            const dnaMerchant = await acquirerAccountConfigurationRepo.findOne({
                where: {
                    acquirer: 'DNA',
                    applicationStatus: 'msa',
                    merchantId: entityId
                },
                attributes: ['merchantId', 'dnaApplicationId', 'applicationStatus']
            });
            const acquirerInfo = await acquirerRepo.findOne({
                where: {
                    name: 'DNA'
                }
            });
            const docUrlLink = await termsAndConditionsRepo.findOne({
                where: {
                    id: { [Op.in]: selectedDocumentIds },
                    creator: 'acquirer_agreement',
                    acquirerId: acquirerInfo.id
                },
                attributes: ['link']
            });

            const isDnaMSADoc = docUrlLink?.link.includes('dna_merchant_agreement');
            if (isDnaMSADoc) {
                const axios = Axios.create();
                const payLoad = {
                    merchantId: entityId,
                    docUrl: docUrlLink.link,
                    documentId: docUrlLink.id,
                    dnaApplicationId: dnaMerchant.dnaApplicationId
                };

                var config = {
                    method: 'post',
                    url: `${DNA_URL}/submit-merchant-agreement`,
                    data: JSON.stringify(payLoad),
                    headers: {
                        Authorization: event.headers['Authorization'],
                        'Content-Type': 'application/json'
                    }
                };

                await axios(config);
            }
            await transaction.commit();
            return { signedOn: activatedDate, tcDocIds: tcDocIds };
        } catch (error) {
            if (transaction) {
                await transaction.rollback();
            }
            console.error(error);
            throw error;
        }
    }
}
