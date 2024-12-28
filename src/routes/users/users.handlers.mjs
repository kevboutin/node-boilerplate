import * as HttpStatusCodes from "../../httpStatusCodes.mjs";
import * as HttpStatusPhrases from "../../httpStatusPhrases.mjs";
import DatabaseService from "../../db/index.mjs";
import env from "../../env.mjs";
import { User } from "../../db/models/index.mjs";
import UserRepository from "../../db/repositories/userRepository.mjs";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../constants.mjs";

const db = new DatabaseService({
    dbUri: env.DB_URL,
    dbName: env.DB_NAME,
});
const _ = await db.createConnection();
const userRepository = new UserRepository(User);

export const list = async (c) => {
    try {
        const { count, rows } = await Promise.resolve(
            userRepository.findAndCountAll({}),
        );
        c.var.logger.info(`list: Found ${count} users.`);
        return c.json({ count, rows });
    } catch (error) {
        c.var.logger.error(`list: Unable to query successfully.`, error);
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
    const user = c.req.valid("json");
    try {
        const inserted = await userRepository.create(user, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        c.var.logger.info(
            `create: Created user with username=${user.username}.`,
        );
        return c.json(inserted, HttpStatusCodes.CREATED);
    } catch (error) {
        console.error(`create: Unable to create user.`, error);
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
        c.var.logger.info(`getOne: Identifier ${id} is not a valid value.`);
        return c.json(
            {
                message: HttpStatusPhrases.BAD_REQUEST,
                statusCode: HttpStatusCodes.BAD_REQUEST,
            },
            HttpStatusCodes.BAD_REQUEST,
        );
    }
    try {
        const user = await userRepository.findById(id);
        if (!user) {
            c.var.logger.info(
                `getOne: Could not find user with identifier=${id}.`,
            );
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        c.var.logger.info(`getOne: Found user with identifier=${id}.`);
        return c.json(user, HttpStatusCodes.OK);
    } catch (error) {
        c.var.logger.error(`getOne: Unable to query successfully.`, error);
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
        c.var.logger.info(`patch: Identifier ${id} is not a valid value.`);
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
        const user = await userRepository.update(id, updates, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        if (!user) {
            c.var.logger.info(
                `patch: Could not find user with identifier=${id}.`,
            );
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        c.var.logger.info(`patch: Updated user with identifier=${id}.`);
        return c.json(user, HttpStatusCodes.OK);
    } catch (error) {
        c.var.logger.error(`patch: Unable to update successfully.`, error);
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
        c.var.logger.info(`remove: Identifier ${id} is not a valid value.`);
        return c.json(
            {
                message: HttpStatusPhrases.BAD_REQUEST,
                statusCode: HttpStatusCodes.BAD_REQUEST,
            },
            HttpStatusCodes.BAD_REQUEST,
        );
    }
    try {
        const user = await userRepository.findById(id);
        if (!user) {
            c.var.logger.info(
                `remove: Could not find user with identifier=${id}.`,
            );
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        await userRepository.destroy(id, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        c.var.logger.info(`remove: Removed user with identifier=${id}.`);
        return c.body(null, HttpStatusCodes.NO_CONTENT);
    } catch (error) {
        c.var.logger.error(`remove: Unable to remove successfully.`, error);
        return c.json(
            {
                message: HttpStatusPhrases.INTERNAL_SERVER_ERROR,
                statusCode: HttpStatusCodes.INTERNAL_SERVER_ERROR,
            },
            HttpStatusCodes.INTERNAL_SERVER_ERROR,
        );
    }
};
