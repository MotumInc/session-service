import http, { ServerResponse } from "http";

export interface Headers {
    [key: string]: string | string[] | undefined
}

/**
 * Convinience function for responding with HTPP
 * @param res Resopnse object to be used for responding
 * @param msg Message to be sent (responded with)
 * @param statusCode optional. Status code to send HTTP response with
 * @author Yaroslav Petryk
 */
export function respond(res: ServerResponse, msg: any, statusCode?: number, headers?: Headers) {
    if (statusCode) res.statusCode = statusCode
    if (headers) Object.entries(headers).forEach(([header, value]) => {
        if (value) res.setHeader(header, value)
    })
    if (typeof msg === "object") res.end(JSON.stringify(msg));
    res.end(msg);
}

/**
 * An error class just to add status code field
 * @author Yaroslav Petryk
 */
export class APIError extends Error {
    statusCode: number
    headers?: Headers

    constructor(msg?: string, statusCode: number = 500, headers?: Headers) {
        super(msg)
        this.statusCode = statusCode
        this.headers = headers
    }
}

export type APIResponder<T> = (req: http.IncomingMessage, res: ServerResponse) => Promise<T>

/**
 * Function to wrap responder function in a convinience function. Boy do I love functions.
 * Makes possible for responders be written as a pure functions.
 * Any error thrown within responder will be captured.
 * If error thrown contains `statusCode` field, that status code will be set in http response
 * If error thrown contains `headers` field, those headers will be set in http response
 * @param responder Function that takes Express Request object and returns promise of value to reply with. Errors will be captured
 * @returns wrapper funtion in shape of (req, res) => void
 * @author Yaroslav Petryk
 */
export const wrapAPI = <T> (responder: APIResponder<T>) => 
    async (req: http.IncomingMessage) => {
        const res = new ServerResponse(req)
        try {
            return await responder(req, res)
        } catch (error) {
            respond(res, { error: error.message || error }, error.statusCode || 500, error.headers)
        }
        return undefined
    }