/**
 * Applies JSON content.
 *
 * @param {Object} schema The schema.
 * @param {string} description The description.
 * @returns
 */
const jsonContent = (schema, description) => {
    return {
        content: {
            "application/json": {
                schema,
            },
        },
        description,
    };
};

export default jsonContent;
