const DeelException = require('../errors/DeelException');

class ContentNotFoundException extends DeelException
{
    constructor(message) {
        super(message);
        this.name = 'ContentNotFoundException';
        this.code = 404;
    }
}

module.exports = ContentNotFoundException;