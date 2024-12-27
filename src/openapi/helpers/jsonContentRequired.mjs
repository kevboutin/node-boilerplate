import jsonContent from "./jsonContent.mjs";

const jsonContentRequired = (schema, description) => {
    return {
        ...jsonContent(schema, description),
        required: true,
    };
};

export default jsonContentRequired;
