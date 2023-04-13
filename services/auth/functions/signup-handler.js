const signUpFunction = require('../libs/signup');

export const signUp = async (event) => {
    const signupResponse = signUpFunction.signUp(event);
    return signupResponse;
};
