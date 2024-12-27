import { UNPROCESSABLE_ENTITY } from "../httpStatusCodes.mjs";

/**
 *
 * @param {*} result
 * @param {*} c
 * @returns
 */
const defaultHook = (result, c) => {
    if (!result.success) {
        return c.json(
            {
                success: result.success,
                error: result.error,
            },
            UNPROCESSABLE_ENTITY,
        );
    }
};

export default defaultHook;
