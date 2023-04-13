jest.mock('../libs/umzug-migrations');
const { migrationsDown } = require('../functions/migrations-down-handler');

const { umzug } = require('../libs/umzug-migrations');

test('Migrations down succes', async () => {
    umzug.down.mockResolvedValue([{ file: '202020_create_user.js' }, { file: '202021_create_role.js' }]);

    const expectedStatusCode = 200;
    const result = await migrationsDown({});

    expect(result.statusCode).toBe(expectedStatusCode);
    expect(result).toHaveProperty('body');
    const obj = JSON.parse(result.body);
    expect(obj.applied[0]).toBe('202020_create_user.js');
    expect(obj.applied.length).toBe(2);
});

test('Migrations down no migrations succes', async () => {
    umzug.down.mockResolvedValue([]);

    const expectedStatusCode = 200;
    const result = await migrationsDown({});
    expect(result.statusCode).toBe(expectedStatusCode);
    expect(result).toHaveProperty('body');
    expect(result.body).toBe('Nothing to downgrade');
});

test('Migrations down error', async () => {
    umzug.down.mockImplementation(() => {
        throw new Error('Could not connect to the database');
    });

    await migrationsDown({}).catch((e) => {
        expect(e.message).toBe('Could not connect to the database');
    });
});
