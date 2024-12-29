import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "../../httpStatusCodes.mjs";
import {
    insertItemSchema,
    selectItemSchema,
    patchItemSchema,
} from "../../db/schema.mjs";
import {
    jsonContent,
    jsonContentRequired,
} from "../../openapi/helpers/index.mjs";
import {
    createErrorSchema,
    IdParamsSchema,
} from "../../openapi/schemas/index.mjs";
import {
    notFoundSchema,
    badRequestSchema,
    timeoutErrorSchema,
    unauthorizedSchema,
} from "../../constants.mjs";

const tags = ["items"];

export const list = createRoute({
    path: "/items",
    method: "get",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({ count: z.number(), rows: z.array(selectItemSchema) }),
            "The list of items",
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            unauthorizedSchema,
            "The request is not authorized",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});

export const create = createRoute({
    path: "/items",
    method: "post",
    request: {
        body: jsonContentRequired(insertItemSchema, "The item to create"),
    },
    tags,
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(
            selectItemSchema,
            "The created item",
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            unauthorizedSchema,
            "The request is not authorized",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertItemSchema),
            "The validation error(s)",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});

export const getOne = createRoute({
    path: "/items/{id}",
    method: "get",
    request: {
        params: IdParamsSchema,
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            selectItemSchema,
            "The requested item",
        ),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            badRequestSchema,
            "The request is not valid",
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            unauthorizedSchema,
            "The request is not authorized",
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            notFoundSchema,
            "Item not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdParamsSchema),
            "Invalid identifier error",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});

export const patch = createRoute({
    path: "/items/{id}",
    method: "patch",
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(patchItemSchema, "The item updates"),
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(selectItemSchema, "The updated item"),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            badRequestSchema,
            "The request is not valid",
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            unauthorizedSchema,
            "The request is not authorized",
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            notFoundSchema,
            "Item not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(patchItemSchema).or(
                createErrorSchema(IdParamsSchema),
            ),
            "The validation error(s)",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});

export const remove = createRoute({
    path: "/items/{id}",
    method: "delete",
    request: {
        params: IdParamsSchema,
    },
    tags,
    responses: {
        [HttpStatusCodes.NO_CONTENT]: {
            description: "Item deleted",
        },
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(
            badRequestSchema,
            "The request is not valid",
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            unauthorizedSchema,
            "The request is not authorized",
        ),
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            notFoundSchema,
            "Item not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdParamsSchema),
            "Invalid identifier error",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});
