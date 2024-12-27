import * as HttpStatusPhrases from "./httpStatusPhrases.mjs";
import createMessageObjectSchema from "./openapi/schemas/createMessageObject.mjs";

export const ZOD_ERROR_MESSAGES = {
    REQUIRED: "Required",
    EXPECTED_ID: "Expected a properly formatted identifier",
    EXPECTED_NUMBER: "Expected number, received NaN",
    NO_UPDATES: "No updates provided",
};

export const ZOD_ERROR_CODES = {
    INVALID_UPDATES: "invalid_updates",
};

export const notFoundSchema = createMessageObjectSchema(
    HttpStatusPhrases.NOT_FOUND,
);
