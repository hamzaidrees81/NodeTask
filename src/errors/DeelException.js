class DeelException extends Error{
    constructor(message) {
        super(message);
        this.name = 'DeelException';
      }
}



module.exports = DeelException;