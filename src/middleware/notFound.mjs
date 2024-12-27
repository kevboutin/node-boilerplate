import { NOT_FOUND } from "../httpStatusCodes.mjs";
import { NOT_FOUND as NOT_FOUND_MESSAGE } from "../httpStatusPhrases.mjs";

/**
 * Not Found middleware.
 *
 * @param {Context} c The context.
 * @returns {Response} The response.
 */
export const notFound = (c) => {
    return c.json(
        {
            message: `${NOT_FOUND_MESSAGE} - ${c.req.path}`,
            statusCode: NOT_FOUND,
        },
        NOT_FOUND,
    );
};
