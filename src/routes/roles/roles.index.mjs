import { createRouter } from "../../createApp.mjs";

import * as handlers from "./roles.handlers.mjs";
import * as routes from "./roles.routes.mjs";

const router = createRouter()
    .openapi(routes.list, handlers.list)
    .openapi(routes.create, handlers.create)
    .openapi(routes.getOne, handlers.getOne)
    .openapi(routes.patch, handlers.patch)
    .openapi(routes.remove, handlers.remove);

export default router;
