const { umzug } = require('../libs/umzug-migrations');

module.exports.migrationsUp = async () => {
    const migrations = await umzug.up();
    const executed = migrations.map((migr) => migr.file);

    const response = {
        statusCode: 200,
        body: executed && executed.length > 0 ? JSON.stringify({ applied: executed }) : 'Already up to date',
    };

    return response;
};
