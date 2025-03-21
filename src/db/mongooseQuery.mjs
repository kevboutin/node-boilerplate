import mongoose from "mongoose";

/**
 * @class MongooseQuery
 */
class MongooseQuery {
    /**
     * Constructor.
     *
     * @param {number} limit The database limit on results.
     * @param {number} skip The number of results to skip.
     * @param {string} orderBy The sort expression.
     * @param {boolean} [isOr] When true and multiple criteria are used, use an $or expression; otherwise, use an $and
     *     expression. Defaults to false.
     */
    constructor(limit, skip, orderBy, isOr = false) {
        this._criteria = [];
        this.limit = (limit && Number(limit)) ?? undefined;
        this.skip = (skip && Number(skip)) ?? undefined;
        this.sort = this._buildSort(orderBy);
        this.isOr = isOr;
    }

    /**
     * Creates an instance for querying a group of documents as a result.
     *
     * @param {Object} param
     * @param {number} [param.limit] The database limit on results.
     * @param {number} [param.offset] The number of results to skip.
     * @param {number} [param.orderBy] The sort expression.
     * @returns {MongooseQuery} A new instance.
     */
    static forList({ limit = null, offset = null, orderBy = null }) {
        return new MongooseQuery(limit, offset, orderBy, false);
    }

    /**
     * Creates an instance for querying a group of documents as a result for autocompletion.
     *
     * @param {Object} param
     * @param {number} [param.limit] The database limit on results.
     * @param {number} [param.offset] The number of results to skip.
     * @param {number} [param.orderBy] The sort expression.
     * @returns {MongooseQuery} A new instance.
     */
    static forAutocomplete({ limit = null, offset = null, orderBy = null }) {
        return new MongooseQuery(limit, offset, orderBy, true);
    }

    /**
     * Appends an $eq statement to the query.
     *
     * @param {string} property The property name.
     * @param {string|number|boolean} value The value.
     */
    appendEqual(property, value) {
        this._criteria.push({
            [property]: value,
        });
    }

    /**
     * Appends an $ne statement to the query.
     *
     * @param {string} property The property name.
     * @param {string|number|boolean} value The value.
     */
    appendNotEqual(property, value) {
        this._criteria.push({
            [property]: { $ne: value },
        });
    }

    /**
     * Appends an $eq statement to the query with a null value.
     *
     * @param {string} property The property name.
     */
    appendEqualNull(property) {
        this._criteria.push({
            [property]: { $eq: null },
        });
    }

    /**
     * Appends an $ne statement to the query with a null value.
     *
     * @param {string} property The property name.
     */
    appendNotEqualNull(property) {
        this._criteria.push({
            [property]: { $ne: null },
        });
    }

    /**
     * Appends a correctly formatted identifier to the query.
     *
     * @param {string} property The property name.
     * @param {string} value The value.
     */
    appendId(property, value) {
        let id = value;

        // If the identifier is not valid, MongoDB throws an error.
        // The prevention is to set the ObjectId to something random if the ObjectId is not valid.
        if (!mongoose.Types.ObjectId.isValid(id)) {
            id = mongoose.Types.ObjectId.createFromTime(+new Date());
        } else {
            id = mongoose.Types.ObjectId.createFromHexString(value);
        }

        this._criteria.push({
            [property]: id,
        });
    }

    /**
     * Appends an $in statement to the query.
     *
     * @param {string} property The property name.
     * @param {Array<string|number|boolean>} values The values.
     */
    appendIn(property, values) {
        this._criteria.push({
            [property]: { $in: values },
        });
    }

    /**
     * Appends a regular expression statement to the query.
     *
     * @param {string} property The property name.
     * @param {string} value The property value.
     */
    appendILike(property, value) {
        this._criteria.push({
            [property]: new RegExp(value, "i"),
        });
    }

    /**
     * Append a range clause to the query.
     *
     * @param {string} column The property name.
     * @param {Object} values The property values.
     * @param {number|string|Date} [values.start] The start of the range.
     * @param {number|string|Date} [values.end] The end of the range.
     * @param {boolean} [usingDates] True if the values are Date objects. Defaults to false.
     */
    appendRange(column, value, usingDates = false) {
        const { start, end } = value;

        if (usingDates) {
            if (start) {
                this._criteria.push({
                    [column]: {
                        $gte: new Date(start),
                    },
                });
            }

            if (end) {
                this._criteria.push({
                    [column]: {
                        $lte: new Date(end),
                    },
                });
            }
        } else {
            if (start) {
                this._criteria.push({
                    [column]: {
                        $gte: start,
                    },
                });
            }

            if (end) {
                this._criteria.push({
                    [column]: {
                        $lte: end,
                    },
                });
            }
        }
    }

    /**
     * Appends a regular expression statement to the query.
     *
     * @param {string} arrayProperty The property name of the Array of subdocuments.
     * @param {string} property The property name.
     * @param {string|number|boolean} value The value.
     */
    appendElemMatch(arrayProperty, property, value) {
        this._criteria.push({
            [arrayProperty]: { $elemMatch: { [property]: value } },
        });
    }

    /**
     * Reset the query.
     */
    reset() {
        this._criteria = [];
    }

    /**
     * Build a properly formatted sort for a query.
     *
     * @param {string} orderBy The sort expression.
     * @returns {string|undefined} The formatted sort expression.
     */
    _buildSort(orderBy) {
        if (!orderBy) {
            return undefined;
        }

        // If there are underscores, we cannot split like we want.
        if (orderBy.startsWith("_")) orderBy = orderBy.substring(1);

        let [property, order] = orderBy.split("_");

        if (property === "id") {
            property = "_id";
        }

        return {
            [property]: order === "ASC" ? 1 : -1,
        };
    }

    /**
     * Get the query criteria.
     */
    get criteria() {
        if (!this._criteria.length) {
            return undefined;
        }

        if (!this.isOr) {
            return {
                $and: this._criteria,
            };
        }

        return {
            $or: this._criteria,
        };
    }
}

export default MongooseQuery;
