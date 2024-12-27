import { serve } from "@hono/node-server";
import app from "./app.mjs";
import env from "./env.mjs";

const port = env.PORT;
console.log(`Server is running on https://localhost:${port}`);

serve({
    fetch: app.fetch,
    port,
});
