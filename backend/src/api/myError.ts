import { cli } from "winston/lib/winston/config";

export default class myError extends Error {
    messageEnglish: string;
    statusCode: Number;
    clientCode: Number;
    clientMessage: string;
    title: string;

    constructor(
        messageEnglish ?: string, 
        statusCode?: Number, 
        clientCode?: Number, 
        clientMessage?: string, 
        title?: string
        ) {
        super(messageEnglish);
        this.messageEnglish = messageEnglish;
        this.statusCode = statusCode;
        this.clientCode = clientCode;
        this.clientMessage = clientMessage;
        this.title = title;
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    }
}
