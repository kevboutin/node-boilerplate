import MongooseQuery from "../mongooseQuery.mjs";
import AuditLogRepository from "./auditLogRepository.mjs";
import { AuditLog } from "../models/index.mjs";

/**
 * @class RoleRepository
 */
class RoleRepository {
    /**
     * Creates a role repository.
     *
     * @constructor
     * @param {Object} model The database model.
     */
    constructor(model) {
        this.model = model;
        this.auditLogRepository = new AuditLogRepository(AuditLog);
    }

    /**
     * Create a new role.
     *
     * @param {Object} data The document.
     * @param {Object} currentUser The current user.
     * @returns {Promise<Object>} The newly created document.
     */
    async create(data, currentUser) {
        await this.model.createCollection();
        const [record] = await this.model.create([
            {
                ...data,
            },
        ]);

        await this.auditLogRepository.log(
            {
                action: AuditLogRepository.CREATE,
                entityId: record._id,
                entityName: "role",
                values: data,
            },
            currentUser,
        );

        return await this.findById(record._id);
    }

    /**
     * Update the document matching the identifer.
     *
     * @param {string} id The identifier.
     * @param {Object} data The updated attributes with their values.
     * @param {Object} currentUser The current user.
     * @returns {Promise<Object>} The updated document.
     */
    async update(id, data, currentUser) {
        await this.model
            .updateOne(
                { _id: id },
                {
                    ...data,
                },
            )
            .exec();

        const record = await this.findById(id);
        await this.auditLogRepository.log(
            {
                action: AuditLogRepository.UPDATE,
                entityId: id,
                entityName: "role",
                values: data,
            },
            currentUser,
        );
        return record;
    }

    /**
     * Delete the document matching the identifier.
     *
     * @param {string} id The identifier.
     * @param {Object} currentUser The current user.
     */
    async destroy(id, currentUser) {
        await this.model.deleteOne({ _id: id }).exec();
        await this.auditLogRepository.log(
            {
                action: AuditLogRepository.DELETE,
                entityId: id,
                entityName: "role",
                values: null,
            },
            currentUser,
        );
    }

    /**
     * Count the documents matching the filter given.
     *
     * @param {Object} filter The filter to use in the query.
     * @returns {Promise<number>} A Promise to return the count.
     */
    async count(filter) {
        return await this.model.countDocuments(filter).exec();
    }

    /**
     * Find a specific document.
     *
     * @param {string} id The identifier.
     * @returns {Promise<Object>} A Promise to return a role document.
     */
    async findById(id) {
        return await this.model.findById(id);
    }

    /**
     * Find documents matching by name.
     *
     * @param {string} name The name.
     * @returns {Promise<Array<Object>>} A Promise to return an array of matching documents.
     */
    async findByName(name) {
        return await this.model.find({ name: name });
    }

    /**
     * Find documents matching by name and not by the identifier provided.
     *
     * @param {string} name The name.
     * @param {string} id The identifier.
     * @returns {Promise<Array<Object>>} A Promise to return an array of matching documents.
     */
    async findByNameAndNotId(name, id) {
        return await this.model.find({ name: name, _id: { $ne: id } });
    }

    /**
     * Get a list of role documents.
     *
     * @param {Object} param
     * @param {Object} [param.filter] The filter values.
     * @param {number} [param.limit] The limit of returned documents.
     * @param {number} [param.offset] The offset to begin returning documents.
     * @param {string} [param.orderBy] The sort expression.
     * @returns {Object<number, Array<Object>} The resulting count and documents.
     */
    async findAndCountAll(
        { filter, limit, offset, orderBy } = {
            filter: null,
            orderBy: null,
            limit: 0,
            offset: 0,
        },
    ) {
        const query = MongooseQuery.forList({
            limit,
            offset,
            orderBy: orderBy ?? "name",
        });

        if (filter) {
            if (filter.id) {
                query.appendId("_id", filter.id);
            }

            if (filter.name) {
                query.appendILike("name", filter.name);
            }

            if (filter.description) {
                query.appendILike("description", filter.description);
            }
        }

        const [rows, count] = await Promise.all([
            this.model
                .find(query.criteria)
                .skip(query.skip)
                .limit(query.limit)
                .collation({ locale: "en" })
                .sort(query.sort)
                .exec(),
            this.model.countDocuments(query.criteria).exec(),
        ]);

        return { count, rows };
    }

    /**
     * A role result for autocomplete.
     *
     * @typedef {Object} AutocompleteResult
     * @property {string} id The role identifier.
     * @property {string} name The role name.
     */

    /**
     * Find a list of documents based on the provided search term.
     *
     * @param {string} search The search term.
     * @param {number} limit The limit on the results.
     * @returns {Promise<Array<AutocompleteResult>>} A Promise to an array of AutocompleteResult.
     */
    async findAllAutocomplete(search, limit) {
        const query = MongooseQuery.forAutocomplete({
            limit,
            orderBy: "name_ASC",
        });

        if (search) {
            query.appendId("_id", search);
            query.appendILike("name", search);
            query.appendILike("description", search);
        }

        const records = await this.model
            .find(query.criteria)
            .limit(query.limit)
            .collation({ locale: "en" })
            .sort(query.sort)
            .exec();

        return records.map((record) => ({
            _id: record._id,
            name: record["name"],
        }));
    }
}

export default RoleRepository;
