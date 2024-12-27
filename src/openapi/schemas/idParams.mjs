import { z } from "@hono/zod-openapi";

const IdParamsSchema = z.object({
    id: z.string().openapi({
        param: {
            name: "id",
            in: "path",
            required: true,
        },
        required: ["id"],
        example: "507f191e810c19729de860ea",
    }),
});

export default IdParamsSchema;
