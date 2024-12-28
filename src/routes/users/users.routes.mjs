import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "../../httpStatusCodes.mjs";
import {
    insertUserSchema,
    selectUserSchema,
    patchUserSchema,
} from "../../db/schema.mjs";
import {
    jsonContent,
    jsonContentRequired,
} from "../../openapi/helpers/index.mjs";
import {
    createErrorSchema,
    IdParamsSchema,
} from "../../openapi/schemas/index.mjs";
import { notFoundSchema } from "../../constants.mjs";

const tags = ["users"];

export const list = createRoute({
    path: "/users",
    method: "get",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({ count: z.number(), rows: z.array(selectUserSchema) }),
            "The list of users",
        ),
    },
});

export const create = createRoute({
    path: "/users",
    method: "post",
    request: {
        body: jsonContentRequired(insertUserSchema, "The user to create"),
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The created user"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertUserSchema),
            "The validation error(s)",
        ),
    },
});

export const getOne = createRoute({
    path: "/users/{id}",
    method: "get",
    request: {
        params: IdParamsSchema,
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            selectUserSchema,
            "The requested user",
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            notFoundSchema,
            "User not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdParamsSchema),
            "Invalid identifier error",
        ),
    },
});

export const patch = createRoute({
    path: "/users/{id}",
    method: "patch",
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(patchUserSchema, "The user updates"),
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(selectUserSchema, "The updated user"),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            notFoundSchema,
            "User not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(patchUserSchema).or(
                createErrorSchema(IdParamsSchema),
            ),
            "The validation error(s)",
        ),
    },
});

export const remove = createRoute({
    path: "/users/{id}",
    method: "delete",
    request: {
        params: IdParamsSchema,
    },
    tags,
    responses: {
        [HttpStatusCodes.NO_CONTENT]: {
            description: "User deleted",
        },
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            notFoundSchema,
            "User not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdParamsSchema),
            "Invalid identifier error",
        ),
    },
});
