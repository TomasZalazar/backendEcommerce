

export default class CustomError extends Error {
    constructor({ code, status, message }, logMessage = '') {
        super(message);
        this.code = code;
        this.status = status;
        this.message = message;
        this.logMessage = logMessage;
    }
}

