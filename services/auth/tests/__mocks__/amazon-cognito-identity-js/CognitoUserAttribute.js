function CognitoUserAttribute(data) {
    const { Name, Value } = data;
    this.Name = Name;
    this.Value = Value;
}

module.exports = CognitoUserAttribute;
