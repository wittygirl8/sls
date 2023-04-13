beforeEach(() => {
    jest.resetModules();
});

test('[onboardingGet] step is incorrect -> returns 400', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {};
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '10',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(400);
});

test('[onboardingGet] error is thrown -> returns 500', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetNameAndAddress: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '1',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(500);
});

test('[onboardingGet] merchant does not exist for step 1 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetNameAndAddress: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '1',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingGet] merchant exists for step 1 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetNameAndAddress: jest.fn().mockImplementation(() => {
                        return {
                            legalName: 'Merchant'
                        };
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '1',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingGet] merchant does not exist for step 2 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetBusinessDetail: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '2',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingGet] merchant exists for step 2 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetBusinessDetail: jest.fn().mockImplementation(() => {
                        return {
                            businessDetailId: '885411414225'
                        };
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '2',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingGet] merchant does not exist for step 3 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetTradingAndAddress: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '3',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingGet] merchant exists for step 3 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetTradingAndAddress: jest.fn().mockImplementation(() => {
                        return {
                            tradingAddressId: '885411414225'
                        };
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '3',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingGet] merchant does not exist for step 4 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetOwnerDetailsAndAddress: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '4',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingGet] merchant exists for step 4 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetOwnerDetailsAndAddress: jest.fn().mockImplementation(() => {
                        return {
                            primaryOwnerId: '885411414225'
                        };
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '4',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingGet] business profile exists for step 5 -> 200 is returned', async () => {
    //Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetBusinessProfile: jest.fn().mockImplementation(() => {
                        return {
                            startedBusinessAt: new Date(),
                            isBusinessMakingProducts: false,
                            stockLocation: 'Home',
                            isStockSufficient: true
                        };
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    //Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '5',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    //Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingGet] business profile does not exist for step 5 -> 404 is returned', async () => {
    //Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetBusinessProfile: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    //Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '5',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    //Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingGet] merchant does not exist for step 6 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetTransactionProfile: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '6',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingGet] merchant exists for step 6 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetTransactionProfile: jest.fn().mockImplementation(() => {
                        return {
                            price_range_min: 10,
                            price_range_max: 18,
                            price_range_avg: 19,
                            is_moto_payment: 50
                        };
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '6',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingGet] merchant does not exist for step 7 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetProductsRequired: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '7',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingGet] merchant exists for step 7 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    GetProductsRequired: jest.fn().mockImplementation(() => {
                        return {
                            name: 'Virtual Terminal',
                            description: 'desc 2'
                        };
                    })
                };
            })
        };
    });

    const onboardingGet = require('../functions/onboarding/get-handler').onboardingGet;

    // Act
    const result = await onboardingGet({
        pathParameters: {
            onboardingStep: '7',
            merchantId: '124'
        },
        headers: {
            Authorization: `Bearer eyJraWQiOiJTeFdsYldKOHh6N0V5UjBES3J1N1dmRUx4Q1BHejlJWlZEWVwvb1hjZ0F1VT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJiNjZlYTMzOS00MzJjLTQ0OWEtODE4YS00ZjZiMjFiYTRjZjEiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMS5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTFfNFFRbmwyQWdUIiwiY29nbml0bzp1c2VybmFtZSI6ImI2NmVhMzM5LTQzMmMtNDQ5YS04MThhLTRmNmIyMWJhNGNmMSIsImdpdmVuX25hbWUiOiJzYWkiLCJteVBheVVzZXJJZCI6IjExNCIsImF1ZCI6IjU5MWtzNG90ZTA4OGQ0bXI1cW0zMW01bTVxIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE2MTcxNzcxNDYsImhvc3QiOiJ3d3cuZHVtbXktZ2ZzYXNkLndlYi5jb20iLCJzY29wZXMiOiJBZG1pbiIsIm1lcmNoYW50cyI6IlsxNTEsMTUyXSIsImV4cCI6MTYxNzIxNjY3OCwiY3VzdG9tOnJlc2VsbGVyVXJsIjoicG9ydGFsLm15cGF5LmNvLnVrIiwiaWF0IjoxNjE3MjEzMDc4LCJmYW1pbHlfbmFtZSI6ImtyaXNobmEiLCJlbWFpbCI6InNhaUBkYXRtYW4uamUifQ.EKVdy-P0aJ2Mk69ah5_B9zoYktVgSOKO9PEcU5GT6gcrdZ2KItp2TTkY_m778YgCRFgc7Y5yM5ACh7nGwICIK7gkrehn2d8a2fxsBttSac-h2hATZK9bOiqHKYEQ8IdvNrwLjdjxqNIIdTqw7HP9VYbOsKKYWV9m7vD-QSkHk9eI_USCB4TO7XPUfC0pI-xfuecUeIpIwMafFeH0TtlFwwXFaJ5zKqDiMxsMHYkS4Ws40kyWRhykhiV1jSjx8kTkLrFlyXrm4ynQG6h-GfMWqcI7-WTTnBB8-9_UXaYVYl6Nw77BXRD0lrm6KZ7VtRhEpgzJMAh_Ru8Ju82SRS2cnw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});
