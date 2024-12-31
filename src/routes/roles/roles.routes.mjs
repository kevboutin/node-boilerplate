import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "../../httpStatusCodes.mjs";
import {
    insertRoleSchema,
    selectRoleSchema,
    patchRoleSchema,
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
    tooManyRequestsSchema,
    unauthorizedSchema,
} from "../../constants.mjs";

const tags = ["roles"];

export const list = createRoute({
    path: "/roles",
    method: "get",
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            z.object({ count: z.number(), rows: z.array(selectRoleSchema) }),
            "The list of roles",
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            unauthorizedSchema,
            "The request is not authorized",
        ),
        [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
            tooManyRequestsSchema,
            "Too many requests",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});

export const create = createRoute({
    path: "/roles",
    method: "post",
    request: {
        body: jsonContentRequired(insertRoleSchema, "The item to create"),
    },
    tags,
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(
            selectRoleSchema,
            "The created role",
        ),
        [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
            unauthorizedSchema,
            "The request is not authorized",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertRoleSchema),
            "The validation error(s)",
        ),
        [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
            tooManyRequestsSchema,
            "Too many requests",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});

export const getOne = createRoute({
    path: "/roles/{id}",
    method: "get",
    request: {
        params: IdParamsSchema,
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(
            selectRoleSchema,
            "The requested role",
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
            "Role not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdParamsSchema),
            "Invalid identifier error",
        ),
        [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
            tooManyRequestsSchema,
            "Too many requests",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});

export const patch = createRoute({
    path: "/roles/{id}",
    method: "patch",
    request: {
        params: IdParamsSchema,
        body: jsonContentRequired(patchRoleSchema, "The role updates"),
    },
    tags,
    responses: {
        [HttpStatusCodes.OK]: jsonContent(selectRoleSchema, "The updated role"),
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
            "Role not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(patchRoleSchema).or(
                createErrorSchema(IdParamsSchema),
            ),
            "The validation error(s)",
        ),
        [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
            tooManyRequestsSchema,
            "Too many requests",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});

export const remove = createRoute({
    path: "/roles/{id}",
    method: "delete",
    request: {
        params: IdParamsSchema,
    },
    tags,
    responses: {
        [HttpStatusCodes.NO_CONTENT]: {
            description: "Role deleted",
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
            "Role not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdParamsSchema),
            "Invalid identifier error",
        ),
        [HttpStatusCodes.TOO_MANY_REQUESTS]: jsonContent(
            tooManyRequestsSchema,
            "Too many requests",
        ),
        [HttpStatusCodes.GATEWAY_TIMEOUT]: jsonContent(
            timeoutErrorSchema,
            "The request timed out",
        ),
    },
});
