import { INTERNAL_SERVER_ERROR, OK } from "../httpStatusCodes.mjs";

/**
 * On Error middleware
 *
 * @param {Error} err The error.
 * @param {Context} c The context.
 * @returns {Response} The response.
 */
export const onError = (err, c) => {
    const currentStatus =
        "status" in err ? err.status : c.newResponse(null).status;
    const statusCode =
        currentStatus !== OK ? currentStatus : INTERNAL_SERVER_ERROR;
    const env = c.env?.NODE_ENV || process.env?.NODE_ENV;
    return c.json(
        {
            message: err.message,
            statusCode,
            stack: env === "production" ? undefined : err.stack,
        },
        statusCode,
    );
};
