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
    const { count, rows } = await userRepository.findAndCountAll({});
    console.log(`list: Found ${count} users.`);
    return c.json({ count, rows });
};

export const create = async (c) => {
    const user = c.req.valid("json");
    const inserted = await userRepository.create(user, {
        createdById: "dummy",
        createdByEmail: "dummy@gmail.com",
    });
    console.log(`create: Created user with username=${user.username}.`);
    return c.json(inserted, HttpStatusCodes.CREATED);
};

export const getOne = async (c) => {
    const { id } = c.req.valid("param");
    const user = await userRepository.findById(id);
    if (!user) {
        console.log(`getOne: Could not find user with identifier=${id}.`);
        return c.json(
            {
                message: HttpStatusPhrases.NOT_FOUND,
                statusCode: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }
    console.log(`getOne: Found user with identifier=${id}.`);
    return c.json(user, HttpStatusCodes.OK);
};

export const patch = async (c) => {
    const { id } = c.req.valid("param");
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
    const user = await userRepository.update(updates, {
        createdById: "dummy",
        createdByEmail: "dummy@gmail.com",
    });
    if (!user) {
        console.log(`patch: Could not find user with identifier=${id}.`);
        return c.json(
            {
                message: HttpStatusPhrases.NOT_FOUND,
                statusCode: HttpStatusCodes.NOT_FOUND,
            },
            HttpStatusCodes.NOT_FOUND,
        );
    }
    console.log(`patch: Updated user with identifier=${id}.`);
    return c.json(user, HttpStatusCodes.OK);
};

export const remove = async (c) => {
    const { id } = c.req.valid("param");
    const user = await userRepository.findById(id);
    if (!user) {
        console.log(`remove: Could not find user with identifier=${id}.`);
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
    console.log(`remove: Removed user with identifier=${id}.`);
    return c.body(null, HttpStatusCodes.NO_CONTENT);
};
