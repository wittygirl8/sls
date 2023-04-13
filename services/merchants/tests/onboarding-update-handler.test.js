beforeEach(() => {
    jest.resetModules();
});

test('[onboardingUpdate] step is incorrect -> returns 400', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {};
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '10',
            merchantId: '3'
        },
        body: JSON.stringify({
            legalName: 'Merchant'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    console.log(result);
});

test('[onboardingUpdate] error is thrown -> returns 500', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateNameAndAddress: jest.fn().mockImplementation(() => {
                        throw 'Error';
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '1',
            merchantId: '3'
        },
        body: JSON.stringify({
            legalName: 'Merchant'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(500);
});

test('[onboardingUpdate] merchant does not exist for step 1 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateNameAndAddress: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '1',
            merchantId: '3'
        },
        body: JSON.stringify({
            legalName: 'Merchant'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant exists for step 1 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateNameAndAddress: jest.fn().mockImplementation(() => {
                        return {
                            legalName: 'Merchant'
                        };
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '1',
            merchantId: '3'
        },
        body: JSON.stringify({
            legalName: 'Merchant'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingUpdate] merchant does not exist for step 2 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateBusinessDetail: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '2',
            merchantId: '3'
        },
        body: JSON.stringify({
            vatNumber: '7777'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant exists for step 2 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateBusinessDetail: jest.fn().mockImplementation(() => {
                        return {
                            vatNumber: '7777'
                        };
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '2',
            merchantId: '3'
        },
        body: JSON.stringify({
            vatNumber: '7777'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingUpdate] merchant does not exist for step 3 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateTradingAddress: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '3',
            merchantId: '3'
        },
        body: JSON.stringify({
            city: 'London'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant exists for step 3 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateTradingAddress: jest.fn().mockImplementation(() => {
                        return {
                            city: 'London'
                        };
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '3',
            merchantId: '3'
        },
        body: JSON.stringify({
            city: 'London'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingUpdate] merchant does not exist for step 4 -> 404 is returned - invalid subStepNumber', async () => {
    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '4',
            merchantId: '3'
        },
        body: JSON.stringify({
            ownersDetails: {
                fullName: 'Bogdan Schevchenko'
            },
            subStepNumber: 3
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant does not exist for step 4.1 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateOwnerDetails: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '4',
            merchantId: '3'
        },
        body: JSON.stringify({
            ownersDetails: {
                fullName: 'Bogdan Schevchenko'
            },
            subStepNumber: 1
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant exists for step 4.1 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateOwnerDetails: jest.fn().mockImplementation(() => {
                        return {
                            ownersDetails: {
                                fullName: 'Bogdan Schevchenko'
                            }
                        };
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '4',
            merchantId: '3'
        },
        body: JSON.stringify({
            ownersDetails: {
                fullName: 'Bogdan Schevchenko'
            },
            subStepNumber: 1
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingUpdate] merchant does not exist for step 4.2 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateOwnerAddress: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '4',
            merchantId: '3'
        },
        body: JSON.stringify({
            ownersDetails: {
                fullName: 'Bogdan Schevchenko'
            },
            subStepNumber: 2
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant exists for step 4.2 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateOwnerAddress: jest.fn().mockImplementation(() => {
                        return {
                            ownersDetails: {
                                fullName: 'Bogdan Schevchenko'
                            }
                        };
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '4',
            merchantId: '3'
        },
        body: JSON.stringify({
            ownersDetails: {
                fullName: 'Bogdan Schevchenko'
            },
            subStepNumber: 2
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingUpdate] business profile exist for step 5 -> 200 is returned', async () => {
    //Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateBusinessProfile: jest.fn().mockImplementation(() => {
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

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    //Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '5',
            merchantId: '3'
        },
        body: JSON.stringify({
            businessProfile: {
                startedBusinessAt: new Date(),
                isBusinessMakingProducts: false,
                stockLocation: 'Home',
                isStockSufficient: true
            }
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    //Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingUpdate] business profile does not exist for step 5 -> 404 is returned', async () => {
    //Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateBusinessProfile: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    //Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '5',
            merchantId: '3'
        },
        body: JSON.stringify({
            businessProfile: {
                startedBusinessAt: new Date(),
                isBusinessMakingProducts: false,
                stockLocation: 'Home',
                isStockSufficient: true
            }
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    //Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant does not exist for step 6 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateTransactionProfile: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '6',
            merchantId: '3'
        },
        body: JSON.stringify({
            price_range_min: 7,
            price_range_max: 8,
            price_range_avg: 9,
            is_moto_payment: 20
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant exists for step 6 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    UpdateTransactionProfile: jest.fn().mockImplementation(() => {
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

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '6',
            merchantId: '3'
        },
        body: JSON.stringify({
            price_range_min: 7,
            price_range_max: 8,
            price_range_avg: 9,
            is_moto_payment: 20
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});

test('[onboardingUpdate] merchant does not exist for step 7 -> 404 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    AddProductsRequired: jest.fn().mockImplementation(() => {
                        return undefined;
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '7',
            merchantId: '3'
        },
        body: JSON.stringify({
            name: 'Virtual Terminal',
            description: 'desc 2'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(404);
});

test('[onboardingUpdate] merchant exists for step 7 -> 200 is returned', async () => {
    // Arrange
    jest.mock('../business-logic/onboarding.service', () => {
        return {
            OnboardingService: jest.fn().mockImplementation(() => {
                return {
                    AddProductsRequired: jest.fn().mockImplementation(() => {
                        return {
                            name: 'Virtual Terminal',
                            description: 'desc 2'
                        };
                    })
                };
            })
        };
    });

    const onboardingUpdate = require('../functions/onboarding/update-handler').onboardingUpdate;

    // Act
    const result = await onboardingUpdate({
        pathParameters: {
            onboardingStep: '7',
            merchantId: '3'
        },
        body: JSON.stringify({
            name: 'Virtual Terminal',
            description: 'desc 2'
        }),
        headers: {
            Authorization: `Bearer eyJraWQiOiJQaCtcL3NlQ3pwSVViRDJQTVBweExSMWlscU9CaXliZXZvZGlsNU1SVURoMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJlNDRlMzlhNi1kZTEyLTQ3OTUtOGI3MC1mOTM1ODljMjEwZWMiLCJjdXN0b206YWxpYXMiOiJkZXYiLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5ldS13ZXN0LTEuYW1hem9uYXdzLmNvbVwvZXUtd2VzdC0xX0s0cVdLMFpJeSIsInBob25lX251bWJlcl92ZXJpZmllZCI6dHJ1ZSwiY29nbml0bzp1c2VybmFtZSI6ImU0NGUzOWE2LWRlMTItNDc5NS04YjcwLWY5MzU4OWMyMTBlYyIsImdpdmVuX25hbWUiOiJOeWFuIiwibXlQYXlVc2VySWQiOiIxNTAiLCJvcmlnaW5fanRpIjoiNzEwYjg5MWQtZWI5MS00ZWMwLWEwZDktN2Y4NGE4ZjJhOGQxIiwiYXVkIjoiNnZuaXE5ZWo3djI4MHA3Zzc2c3VlbWI5ZWsiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY0Mzc4NzQ2MiwiaG9zdCI6Ind3dy5kdW1teS1nZnNhc2Qud2ViLmNvbSIsInBob25lX251bWJlciI6IisxOTk4MDY2ODAwOCIsInNjb3BlcyI6Ik1lcmNoYW50IiwibWVyY2hhbnRzIjoiWzNdIiwiZXhwIjoxNjQzNzkxMDc5LCJjdXN0b206cmVzZWxsZXJVcmwiOiJkZXYuZGF0bWFuY3JtLmNvbSIsImlhdCI6MTY0Mzc4NzQ3OSwiZmFtaWx5X25hbWUiOiJ0ZXN0IiwianRpIjoiNTkzZTJiNGQtZjQ5Ni00ZTk0LTk3MWEtY2Y5MjJmYTZhZjM2IiwiZW1haWwiOiJuYXlhbiszMTExQG15cGF5LmNvLnVrIn0.Kb7Ve1OBFnivx3mhMSl5bCkCidA16EtjPbjXivv4NZetvsARwcyLsGRISmjUtxeM__NSUEfsvTJa4zKzcE04_DsROjAihSRVE9rtbf1hkfLdKRFiSO-p4zhKr4M3DJH59p_8CXertjaINIVqcTLIFqQBxvfgtU83isKedBGni_APqLDNXm6ALVazQww2XjJE1e5383Dhac6PoMZcJW9llAhXtVMCRDYzZwlIgukp1y-MXkzCWHNlvvXeU2LzYRPZ4mML-TeAlN5RStVwLCML1KuQCtbN-I4bcgCvK6VmDXDhNWarqHY1TYJHBM1JvVGFe4uFTpgNZiZ-GFbAk_5_Tw`
        }
    });

    // Assert
    expect(result.statusCode).toBe(200);
});
