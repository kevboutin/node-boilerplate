import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { timeout } from "hono/timeout";
import { notFound } from "./middleware/notFound.mjs";
import { onError } from "./middleware/onError.mjs";
import { pinoLogger } from "./middleware/pinoLogger.mjs";
import env from "./env.mjs";
import defaultHook from "./openapi/defaultHook.mjs";

export function createRouter() {
    return new OpenAPIHono({ strict: false, defaultHook });
}

export default function createApp() {
    const app = createRouter();
    app.use("*", timeout(5000));
    app.use(compress());
    app.use(secureHeaders());
    app.use("*", async (c, next) => {
        const corsMiddleware = cors({
            origin: env.CORS_ORIGIN,
            allowMethods: ["GET", "OPTIONS", "PATCH", "POST", "PUT", "DELETE"],
        });
        return await corsMiddleware(c, next);
    });
    app.use("*", async (c, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        c.header("Response-Time", `${ms}ms`);
    });
    app.use(pinoLogger());
    app.onError(onError);
    app.notFound(notFound);
    return app;
}

export function createTestApp(router) {
    return createApp().route("/", router);
}
