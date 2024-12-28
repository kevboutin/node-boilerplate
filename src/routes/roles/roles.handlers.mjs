import * as HttpStatusCodes from "../../httpStatusCodes.mjs";
import * as HttpStatusPhrases from "../../httpStatusPhrases.mjs";
import DatabaseService from "../../db/index.mjs";
import env from "../../env.mjs";
import { Role } from "../../db/models/index.mjs";
import RoleRepository from "../../db/repositories/roleRepository.mjs";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../constants.mjs";

const db = new DatabaseService({
    dbUri: env.DB_URL,
    dbName: env.DB_NAME,
});
const _ = await db.createConnection();
const roleRepository = new RoleRepository(Role);

export const list = async (c) => {
    try {
        const result = await Promise.resolve(
            roleRepository.findAndCountAll({}),
        );
        const { count, rows } = result;
        console.log(`list: Found ${count} role(s).`);
        return c.json({ count, rows });
    } catch (error) {
        console.error(`list: Unable to query successfully.`, error);
        return c.json(
            {
                message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            },
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
    }
};

export const create = async (c) => {
    const role = c.req.valid("json");
    try {
        const inserted = await roleRepository.create(role, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        console.log(`create: Created role with name=${role.name}.`);
        return c.json(inserted, HttpStatusCodes.CREATED);
    } catch (error) {
        console.error(`create: Unable to create role.`, error);
        return c.json(
            {
                message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            },
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
    }
};

export const getOne = async (c) => {
    const { id } = c.req.valid("param");
    if (id.length !== 24) {
        console.log(`getOne: Identifier ${id} is not a valid value.`);
        return c.json(
            {
                message: HttpStatusPhrases.BAD_REQUEST,
                statusCode: HttpStatusCodes.BAD_REQUEST,
            },
            HttpStatusCodes.BAD_REQUEST,
        );
    }
    try {
        const role = await roleRepository.findById(id);
        if (!role) {
            console.log(`getOne: Could not find role with identifier=${id}.`);
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        console.log(`getOne: Found role with identifier=${id}.`);
        return c.json(role, HttpStatusCodes.OK);
    } catch (error) {
        console.error(`getOne: Unable to query successfully.`, error);
        return c.json(
            {
                message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            },
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
    }
};

export const patch = async (c) => {
    const { id } = c.req.valid("param");
    if (id.length !== 24) {
        console.log(`patch: Identifier ${id} is not a valid value.`);
        return c.json(
            {
                message: HttpStatusPhrases.BAD_REQUEST,
                statusCode: HttpStatusCodes.BAD_REQUEST,
            },
            HttpStatusCodes.BAD_REQUEST,
        );
    }
    const updates = c.req.valid("json");
    if (Object.keys(updates).length === 0) {
        return c.json(
            {
                success: false,
                error: {
                    issues: [
                        {
                            code: ZOD_ERROR_CODES.INVALID_UPDATES,
                            path: [],
                            message: ZOD_ERROR_MESSAGES.NO_UPDATES,
                        },
                    ],
                    name: "ZodError",
                },
                statusCode: HttpStatusCodes.UNPROCESSABLE_ENTITY,
            },
            HttpStatusCodes.UNPROCESSABLE_ENTITY,
        );
    }
    try {
        const role = await roleRepository.update(id, updates, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        if (!role) {
            console.log(`patch: Could not find role with identifier=${id}.`);
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        console.log(`patch: Updated role with identifier=${id}.`);
        return c.json(role, HttpStatusCodes.OK);
    } catch (error) {
        console.error(`patch: Unable to update successfully.`, error);
        return c.json(
            {
                message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            },
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
    }
};

export const remove = async (c) => {
    const { id } = c.req.valid("param");
    if (id.length !== 24) {
        console.log(`remove: Identifier ${id} is not a valid value.`);
        return c.json(
            {
                message: HttpStatusPhrases.BAD_REQUEST,
                statusCode: HttpStatusCodes.BAD_REQUEST,
            },
            HttpStatusCodes.BAD_REQUEST,
        );
    }
    try {
        const role = await roleRepository.findById(id);
        if (!role) {
            console.log(`remove: Could not find role with identifier=${id}.`);
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        await roleRepository.destroy(id, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        console.log(`remove: Removed role with identifier=${id}.`);
        return c.body(null, HttpStatusCodes.NO_CONTENT);
    } catch (error) {
        console.error(`remove: Unable to remove successfully.`, error);
        return c.json(
            {
                message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            },
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
    }
};
