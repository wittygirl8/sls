var { response, flakeGenerateDecimal, getUserId, getAuthorizedMerchantIds } = process.env.IS_OFFLINE
    ? require('../../../layers/helper_lib/src')
    : require('mypay-helpers');
var { connectDB } = process.env.IS_OFFLINE ? require('../../../layers/models_lib/src') : require('models');
const db = connectDB(
    process.env.DB_RESOURCE_ARN,
    process.env.INFRA_STAGE + '_database',
    '',
    process.env.SECRET_ARN,
    process.env.IS_OFFLINE
);
const { Op } = db.Sequelize;

const _ = require('underscore');
const moment = require('moment');

export const getStats = async (event) => {
    const { sequelize } = db;
    const requestId = 'reqid_' + flakeGenerateDecimal();
    try {
        const userId = await getUserId(event);

        //get list of merchants associated with this user
        let merchant_ids = await getAuthorizedMerchantIds(
            {
                user_id: userId
            },
            {
                sequelize,
                Relationship: db.Relationship
            }
        );

        const year = moment().year(); //current year
        const currency_code = 826; //hardcoding UK for now, but ideally it should be coming as a payload or through headers

        const allStats = await db.stats.findAll({
            attributes: [
                'sale_amount',
                'refund_amount',
                [sequelize.fn('day', sequelize.col('created_at')), 'day'],
                [sequelize.fn('month', sequelize.col('created_at')), 'month'],
                [sequelize.fn('year', sequelize.col('created_at')), 'year'],
                [sequelize.fn('week', sequelize.col('created_at')), 'week']
            ],
            where: [
                sequelize.where(sequelize.fn('year', sequelize.col('created_at')), year),
                {
                    merchant_id: {
                        [Op.in]: merchant_ids
                    },
                    currency_code
                }
            ],
            raw: true
        });

        const aggregateMonthlyData = getAggregateMonthlyData(allStats);
        const aggregateWeeklyData = getAggregateWeeklyData(allStats);
        const aggregateDailyData = getAggregateDailyData(allStats);

        return response({
            request_id: requestId,
            data: {
                month: aggregateMonthlyData,
                week: aggregateWeeklyData,
                day: aggregateDailyData
            }
        });
    } catch (err) {
        return response(err.message, 500);
    }
};

let getAggregateDailyData = (data) => {
    var boiler = boilerPlate();
    for (let item of data) {
        let month = item.month;
        let day = item.day;
        let year = item.year;
        let sale_amount = item.sale_amount;
        let refund_amount = item.refund_amount;

        if (boiler[month - 1][day - 1] === undefined) {
            boiler[month - 1][day - 1] = {};
        }
        if (moment().year() === year) {
            boiler[month - 1][day - 1]['sale_amount'] += sale_amount;
            boiler[month - 1][day - 1]['refund_amount'] += refund_amount;
        }
    }
    return boiler;
};

let getAggregateWeeklyData = (allStats) => {
    const weekData = [];
    let groupByWeek = _.groupBy(allStats, (item) => {
        const getWeek = moment(`${item.day}/${item.month}/${item.year}`, 'DD/MM/YYYY');
        if (moment().year() === item.year) {
            return getWeek.weeks();
        }
        return [];
    });

    for (let i = 0; i < 12; i++) {
        weekData.push(groupByWeek[i]);
    }

    return _.map(weekData, (item, week) => {
        return {
            week: ++week,
            sale_amount: _.reduce(
                item,
                (a, b) => {
                    return a + b.sale_amount;
                },
                0
            ),
            refund_amount: _.reduce(
                item,
                (a, b) => {
                    return a + b.refund_amount;
                },
                0
            )
        };
    });
};

let getAggregateMonthlyData = (allStats) => {
    const monthData = [];
    let groupByMonth = _.groupBy(allStats, (item) => {
        const getMonth = moment(`${item.day}/${item.month}/${item.year}`, 'DD/MM/YYYY');
        if (moment().year() === item.year) {
            return getMonth.month();
        }
        return [];
    });

    for (let i = 0; i < 12; i++) {
        monthData.push(groupByMonth[i]);
    }

    return _.map(monthData, (item) => {
        return {
            sale_amount: _.reduce(
                item,
                (a, b) => {
                    return a + b.sale_amount;
                },
                0
            ),
            refund_amount: _.reduce(
                item,
                (a, b) => {
                    return a + b.refund_amount;
                },
                0
            )
        };
    });
};

let boilerPlate = () => {
    let temp = [
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ],
        [
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 },
            { sale_amount: 0, refund_amount: 0 }
        ]
    ];

    return temp;
};
