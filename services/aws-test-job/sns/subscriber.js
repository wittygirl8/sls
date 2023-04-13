export const main = async (event) => {
    console.log('consume data', event.Records[0].Sns);

    return {};
};
