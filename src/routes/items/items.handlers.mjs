import * as HttpStatusCodes from "../../httpStatusCodes.mjs";
import * as HttpStatusPhrases from "../../httpStatusPhrases.mjs";
import DatabaseService from "../../db/index.mjs";
import env from "../../env.mjs";
import { Item } from "../../db/models/index.mjs";
import ItemRepository from "../../db/repositories/itemRepository.mjs";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../constants.mjs";

const db = new DatabaseService({
    dbUri: env.DB_URL,
    dbName: env.DB_NAME,
});
const _ = await db.createConnection();
const itemRepository = new ItemRepository(Item);

export const list = async (c) => {
    try {
        const result = await Promise.resolve(itemRepository.findAndCountAll());
        const { count, rows } = result;
        c.var.logger.info(`list: Found ${count} item(s).`);
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
    const item = c.req.valid("json");
    try {
        const inserted = await itemRepository.create(item, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        c.var.logger.info(`create: Created item with name=${item.name}.`);
        return c.json(inserted, HttpStatusCodes.CREATED);
    } catch (error) {
        c.var.logger.error(`create: Unable to create item.`, error);
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
        const item = await itemRepository.findById(id);
        if (!item) {
            c.var.logger.info(
                `getOne: Could not find item with identifier=${id}.`,
            );
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        c.var.logger.info(`getOne: Found item with identifier=${id}.`);
        return c.json(item, HttpStatusCodes.OK);
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
        const item = await itemRepository.update(id, updates, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        if (!item) {
            c.var.logger.info(
                `patch: Could not find item with identifier=${id}.`,
            );
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        c.var.logger.info(`patch: Updated item with identifier=${id}.`);
        return c.json(item, HttpStatusCodes.OK);
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
        const item = await itemRepository.findById(id);
        if (!item) {
            c.var.logger.info(
                `remove: Could not find item with identifier=${id}.`,
            );
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        await itemRepository.destroy(id, {
            createdById: "dummy",
            createdByEmail: "dummy@gmail.com",
        });
        c.var.logger.info(`remove: Removed item with identifier=${id}.`);
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
