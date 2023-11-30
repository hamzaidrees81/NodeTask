const DeelException = require('../errors/DeelException');

class MissingParamException extends DeelException
{
    constructor(message) {
        super(message);
        this.name = 'MissingParamException';
        this.code = 400;
      }
}

module.exports = MissingParamException;