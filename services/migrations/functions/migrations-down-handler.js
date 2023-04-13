'use strict';

const { umzug } = require('../libs/umzug-migrations');

module.exports.migrationsDown = async () => {
    const migrations = await umzug.down();
    const executed = migrations.map((migr) => migr.file);

    const response = {
        statusCode: 200,
        body: executed && executed.length > 0 ? JSON.stringify({ applied: executed }) : 'Nothing to downgrade',
    };

    return response;
};
