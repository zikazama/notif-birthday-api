const InvariantError = require("./InvariantError");
const AuthenticationError = require("./AuthenticationError");

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {};

module.exports = DomainErrorTranslator;
