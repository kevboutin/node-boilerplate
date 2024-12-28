import { z } from "@hono/zod-openapi";

const createMessageObjectSchema = (
    exampleMessage = "Hello World",
    exampleStatus = 500,
) => {
    return z
        .object({
            message: z.string(),
            statusCode: z.number(),
        })
        .openapi({
            example: {
                message: exampleMessage,
                statusCode: exampleStatus,
            },
        });
};

export default createMessageObjectSchema;
