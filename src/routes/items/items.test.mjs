import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "../../httpStatusPhrases.mjs";
import {
    afterAll,
    beforeAll,
    describe,
    expect,
    expectTypeOf,
    it,
} from "vitest";
import { ZodIssueCode } from "zod";
import env from "../../env.mjs";
import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "../../constants.mjs";
import createApp from "../../createApp.mjs";
import router from "./items.index.mjs";

if (env.NODE_ENV !== "test") {
    throw new Error("NODE_ENV must be 'test'");
}

const client = testClient(createApp().route("/", router));

describe("items routes", () => {
    beforeAll(async () => {});

    afterAll(async () => {});

    it("post /items validates the body when creating", async () => {
        const response = await client.items.$post({
            json: {
                description: "some description",
            },
        });
        expect(response.status).toBe(422);
        if (response.status === 422) {
            const json = await response.json();
            expect(json.error.issues[0].path[0]).toBe("name");
            expect(json.error.issues[0].message).toBe(
                ZOD_ERROR_MESSAGES.REQUIRED,
            );
        }
    });

    const id = "507f191e810c19729de860ea";
    const name = "Learn vitest";

    it("post /items creates an item", async () => {
        const response = await client.items.$post({
            json: {
                name,
                description: "some description",
            },
        });
        expect(response.status).toBe(201);
        if (response.status === 201) {
            const json = await response.json();
            expect(json.name).toBe(name);
            expect(json.done).toBe(false);
        }
    });

    it("get /items lists all items", async () => {
        const response = await client.items.$get();
        expect(response.status).toBe(200);
        if (response.status === 200) {
            const json = await response.json();
            expectTypeOf(json).toBeArray();
            expect(json.length).toBe(1);
        }
    });

    it("get /items/{id} validates the id param", async () => {
        const response = await client.items[":id"].$get({
            param: {
                id: "wat",
            },
        });
        expect(response.status).toBe(400);
        if (response.status === 400) {
            const json = await response.json();
            expect(json.message).toBe(HttpStatusPhrases.BAD_REQUEST);
            //expect(json.error.issues[0].path[0]).toBe("id");
            //expect(json.error.issues[0].message).toBe(
            //    ZOD_ERROR_MESSAGES.EXPECTED_ID,
            //);
        }
    });

    it("get /items/{id} returns 404 when item not found", async () => {
        const response = await client.items[":id"].$get({
            param: {
                id: "999999999999999999999999",
            },
        });
        expect(response.status).toBe(404);
        if (response.status === 404) {
            const json = await response.json();
            expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
        }
    });

    it("get /items/{id} gets a single item", async () => {
        const response = await client.items[":id"].$get({
            param: {
                id,
            },
        });
        expect(response.status).toBe(200);
        if (response.status === 200) {
            const json = await response.json();
            expect(json.name).toBe(name);
            expect(json.done).toBe(false);
        }
    });

    it("patch /items/{id} validates the body when updating", async () => {
        const response = await client.items[":id"].$patch({
            param: {
                id,
            },
            json: {
                name: "",
            },
        });
        expect(response.status).toBe(422);
        if (response.status === 422) {
            const json = await response.json();
            expect(json.error.issues[0].path[0]).toBe("name");
            expect(json.error.issues[0].code).toBe(ZodIssueCode.too_small);
        }
    });

    it("patch /items/{id} validates the id param", async () => {
        const response = await client.items[":id"].$patch({
            param: {
                id: "wat",
            },
            json: {},
        });
        expect(response.status).toBe(400);
        if (response.status === 400) {
            const json = await response.json();
            expect(json.message).toBe(HttpStatusPhrases.BAD_REQUEST);
            // expect(json.error.issues[0].path[0]).toBe("id");
            // expect(json.error.issues[0].message).toBe(
            //     ZOD_ERROR_MESSAGES.EXPECTED_ID,
            // );
        }
    });

    it("patch /items/{id} validates empty body", async () => {
        const response = await client.items[":id"].$patch({
            param: {
                id,
            },
            json: {},
        });
        expect(response.status).toBe(422);
        if (response.status === 422) {
            const json = await response.json();
            expect(json.error.issues[0].code).toBe(
                ZOD_ERROR_CODES.INVALID_UPDATES,
            );
            expect(json.error.issues[0].message).toBe(
                ZOD_ERROR_MESSAGES.NO_UPDATES,
            );
        }
    });

    it("patch /items/{id} updates a single property of an item", async () => {
        const response = await client.items[":id"].$patch({
            param: {
                id,
            },
            json: {
                description: "updated description",
            },
        });
        expect(response.status).toBe(200);
        if (response.status === 200) {
            const json = await response.json();
            expect(json.description).toBe("updated description");
        }
    });

    it("delete /items/{id} validates the id when deleting", async () => {
        const response = await client.items[":id"].$delete({
            param: {
                id: "wat",
            },
        });
        expect(response.status).toBe(400);
        if (response.status === 400) {
            const json = await response.json();
            expect(json.message).toBe(HttpStatusPhrases.BAD_REQUEST);
            //expect(json.error.issues[0].path[0]).toBe("id");
            //expect(json.error.issues[0].message).toBe(
            //    ZOD_ERROR_MESSAGES.EXPECTED_ID,
            //);
        }
    });

    it("delete /items/{id} removes an item", async () => {
        const response = await client.items[":id"].$delete({
            param: {
                id,
            },
        });
        expect(response.status).toBe(204);
    });
});
