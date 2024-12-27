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
import { notFoundSchema } from "../../constants.mjs";

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
        [HttpStatusCodes.OK]: jsonContent(
            selectRolesSchema,
            "The created role",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(insertRoleSchema),
            "The validation error(s)",
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
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            notFoundSchema,
            "Role not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdParamsSchema),
            "Invalid identifier error",
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
        [HttpStatusCodes.OK]: jsonContent(
            selectRolesSchema,
            "The updated role",
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
        [HttpStatusCodes.NOT_FOUND]: jsonContent(
            notFoundSchema,
            "Role not found",
        ),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
            createErrorSchema(IdParamsSchema),
            "Invalid identifier error",
        ),
    },
});
