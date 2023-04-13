const FlakeId = require('flake-idgen');
const flakeIdGen = new FlakeId();
const intformat = require('biguint-format');

const flakeGenerateDecimal = () => {
  return intformat(flakeIdGen.next(), 'dec');
};

module.exports = { flakeGenerateDecimal };