import MongooseQuery from "../mongooseQuery.mjs";

/**
 * @class AuditLogRepository
 */
class AuditLogRepository {
    /**
     * Creates the repository for auditLog.
     *
     * @param {Object} model The database model.
     */
    constructor(model) {
        this.model = model;
    }

    static get CREATE() {
        return "create";
    }

    static get UPDATE() {
        return "update";
    }

    static get DELETE() {
        return "delete";
    }

    /**
     * Create a new audit log entry.
     *
     * @param {Object} param
     * @param {string} param.entityName The entity name.
     * @param {string} param.entityId The entity identifier.
     * @param {string} param.action The action preformed on the entity.
     * @param {Object} param.values The updated document.
     * @param {Object} currentUser The user document of the user that requested the update.
     * @returns
     */
    async log({ entityName, entityId, action, values }, currentUser) {
        const [log] = await this.model.create([
            {
                entityName,
                entityId,
                action,
                values,
                timestamp: new Date(),
                createdById: currentUser ? currentUser._id : null,
                createdByEmail: currentUser ? currentUser.email : null,
            },
        ]);

        return log;
    }

    /**
     * Get a list of audit log documents.
     *
     * @param {Object} param
     * @param {Object} [param.filter] The filter values.
     * @param {number} [param.limit] The limit of returned documents.
     * @param {number} [param.offset] The offset to begin returning doucuments.
     * @param {string} [param.orderBy] The sort expression.
     * @returns {Object<number, Array<Object>} The count and the resulting documents.
     */
    async findAndCountAll({ filter, limit = 0, offset = 0, orderBy = null }) {
        const query = MongooseQuery.forList({
            limit,
            offset,
            orderBy: orderBy ?? "createdAt_DESC",
        });

        if (filter) {
            if (filter.timestampRange) {
                const { start, end } = filter.timestampRange;
                if (start || end) {
                    query.appendRange("timestamp", filter.timestampRange);
                }
            }
            if (filter.action) {
                query.appendEqual("action", filter.action);
            }
            if (filter.entityId) {
                query.appendEqual("entityId", filter.entityId);
            }
            if (filter.createdByEmail) {
                query.appendILike("createdByEmail", filter.createdByEmail);
            }
            if (filter?.entityNames?.length) {
                query.appendIn("entityName", filter.entityNames);
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
}

export default AuditLogRepository;
