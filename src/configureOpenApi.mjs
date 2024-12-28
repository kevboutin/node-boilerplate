import { apiReference } from "@scalar/hono-api-reference";

import packageJSON from "../package.json" with { type: "json" };

export default function configureOpenAPI(app) {
    app.doc("/doc", {
        openapi: "3.0.0",
        info: {
            version: packageJSON.version,
            title: "Items API",
        },
    });

    app.get(
        "/reference",
        apiReference({
            theme: "kepler",
            layout: "classic",
            defaultHttpClient: {
                targetKey: "javascript",
                clientKey: "fetch",
            },
            spec: {
                url: "/doc",
            },
        }),
    );
}
