jest.mock('../libs/umzug-migrations');
const { migrationsUp } = require('../functions/migrations-up-handler');

const { umzug } = require('../libs/umzug-migrations');

test('Migrations up succes', async () => {
    umzug.up.mockResolvedValue([{ file: '202020_create_user.js' }, { file: '202021_create_role.js' }]);

    const expectedStatusCode = 200;

    const result = await migrationsUp({});

    expect(result.statusCode).toBe(expectedStatusCode);
    expect(result).toHaveProperty('body');
    const obj = JSON.parse(result.body);
    expect(obj.applied[0]).toBe('202020_create_user.js');
    expect(obj.applied.length).toBe(2);
});

test('Migrations up no migrations succes', async () => {
    umzug.up.mockResolvedValue([]);

    const expectedStatusCode = 200;
    const result = await migrationsUp({});

    expect(result.statusCode).toBe(expectedStatusCode);
    expect(result).toHaveProperty('body');
    expect(result.body).toBe('Already up to date');
});

test('Migrations up error', async () => {
    umzug.up.mockImplementation(() => {
        throw new Error('Could not connect to the database');
    });

    await migrationsUp({}).catch((e) => {
        expect(e.message).toBe('Could not connect to the database');
    });
});
