import { createRoute } from "@hono/zod-openapi";
import * as HttpStatusCodes from "../httpStatusCodes.mjs";
import jsonContent from "../openapi/helpers/jsonContent.mjs";
import createMessageObjectSchema from "../openapi/schemas/createMessageObject.mjs";

import { createRouter } from "../createApp.mjs";

const router = createRouter().openapi(
    createRoute({
        tags: ["index"],
        method: "get",
        path: "/",
        responses: {
            [HttpStatusCodes.OK]: jsonContent(
                createMessageObjectSchema("Items API"),
                "Items API index",
            ),
        },
    }),
    (c) => {
        return c.json(
            {
                message: "Items API",
            },
            HttpStatusCodes.OK,
        );
    },
);

export default router;
