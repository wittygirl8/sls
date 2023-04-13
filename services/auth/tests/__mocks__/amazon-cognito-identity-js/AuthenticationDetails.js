function AuthenticationDetails(data) {
    const { Username, Password } = data;
    this.Username = Username;
    this.Password = Password;
}

module.exports = AuthenticationDetails;
