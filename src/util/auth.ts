import { credentials } from "grpc";
import { AuthClient } from "../protobuf-gen/auth_grpc_pb";
import { Token, TokenPayload } from "../protobuf-gen/auth_pb";
import { APIError, wrapAPI } from "./api";

const { AUTH_VERIFICATION_SERVICE_URL } = process.env
const client = new AuthClient(AUTH_VERIFICATION_SERVICE_URL!, credentials.createInsecure())

const verifyRPC = (request: Token) =>
    new Promise<TokenPayload>((resolve, reject) =>
        client.verify(request, (error, response) => {
            if (error) reject(error)
            else resolve(response)
        })
    )

export default wrapAPI(async (req, res) => {
    const headers = req.headers
    const authHeader = headers["authorization"]
    if (!authHeader) throw new APIError("Token is not present", 401)
    const [bearer, token] = authHeader.split(" ")
    if (bearer.toLowerCase() != "bearer") throw new APIError("Token expected to be of bearer type")
    const request = new Token()
    request.setToken(token)
    try {
        const payload = await verifyRPC(request)
        return payload.getId()
    } catch (e) { throw new APIError(e.message, 401) }
})
