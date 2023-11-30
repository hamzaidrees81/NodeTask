const DeelException = require('../errors/DeelException');

class InvalidParamException extends DeelException
{
    constructor(message) {
        super(message);
        this.name = 'InvalidParamException';
        this.code = 400;
    }
}

module.exports = InvalidParamException;