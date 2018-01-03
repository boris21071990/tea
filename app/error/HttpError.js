class HttpError extends Error {

    constructor(message, status){

        super(message);

        Error.captureStackTrace(this, this.constructor);

        // Set message
        this.message = message;

        // Set status
        this.status = status || 500;

        // Set name
        this.name = this.constructor.name;
    }

}

module.exports = HttpError;