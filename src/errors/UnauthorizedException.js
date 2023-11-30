const DeelException = require('../errors/DeelException');

class UnauthorizedException extends DeelException
{
    constructor(message) {
        super(message);
        this.name = 'UnauthorizedException';
        this.code = 401;
    }
}



module.exports = UnauthorizedException;