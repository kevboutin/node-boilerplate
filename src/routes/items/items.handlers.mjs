import * as HttpStatusCodes from "../../httpStatusCodes.mjs";
import * as HttpStatusPhrases from "../../httpStatusPhrases.mjs";
import DatabaseService from "../../db/index.mjs";
import env from "../../env.mjs";
import ItemRepository from "../../db/repositories/itemRepository.mjs";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../constants.mjs";

const db = new DatabaseService({
    dbUri: env.DB_URL,
    dbName: env.DB_NAME,
});
const connection = db.createConnection();
const itemRepository = new ItemRepository(connection);

export const list = async (c) => {
    try {
        const { count, rows } = await itemRepository.findAndCountAll({});
        console.log(`list: Found ${count} items.`);
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
    const item = c.req.valid("json");
    try {
        const inserted = await itemRepository.create(item, {});
        console.log(`create: Created item with name=${item.name}.`);
        return c.json(inserted, HttpStatusCodes.CREATED);
    } catch (error) {
        console.error(`create: Unable to create item.`, error);
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
        const item = await itemRepository.findById(id);
        if (!item) {
            console.log(`getOne: Could not find item with identifier=${id}.`);
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        console.log(`getOne: Found item with identifier=${id}.`);
        return c.json(item, HttpStatusCodes.OK);
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
        const item = await itemRepository.update(id, updates, {});
        if (!item) {
            console.log(`patch: Could not find item with identifier=${id}.`);
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        console.log(`patch: Updated item with identifier=${id}.`);
        return c.json(item, HttpStatusCodes.OK);
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
        const item = await itemRepository.findById(id);
        if (!item) {
            console.log(`remove: Could not find item with identifier=${id}.`);
            return c.json(
                {
                    message: HttpStatusPhrases.NOT_FOUND,
                    statusCode: HttpStatusCodes.NOT_FOUND,
                },
                HttpStatusCodes.NOT_FOUND,
            );
        }
        console.log(`remove: Removed item with identifier=${id}.`);
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
