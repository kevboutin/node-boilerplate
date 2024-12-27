import createApp from "./createApp.mjs";
import index from "./routes/index.route.mjs";
import items from "./routes/items/items.index.mjs";

const app = createApp();

const routes = [index, items];

routes.forEach((route) => {
    app.route("/", route);
});

export default app;
