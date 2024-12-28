import configureOpenAPI from "./configureOpenApi.mjs";
import createApp from "./createApp.mjs";
import index from "./routes/index.route.mjs";
import items from "./routes/items/items.index.mjs";
import roles from "./routes/roles/roles.index.mjs";
import users from "./routes/users/users.index.mjs";

const app = createApp();

configureOpenAPI(app);

const routes = [index, items, roles, users];

routes.forEach((route) => {
    app.route("/", route);
});

export default app;
