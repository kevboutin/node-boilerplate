import { OpenAPIHono } from "@hono/zod-openapi";
import { notFound } from "./middleware/notFound.mjs";
import { onError } from "./middleware/onError.mjs";
import { pinoLogger } from "./middleware/pinoLogger.mjs";
import defaultHook from "./openapi/defaultHook.mjs";

export function createRouter() {
    return new OpenAPIHono({ strict: false, defaultHook });
}

export default function createApp() {
    const app = createRouter();
    app.use(pinoLogger());
    app.onError(onError);
    app.notFound(notFound);
    return app;
}

export function createTestApp(router) {
    return createApp().route("/", router);
}
