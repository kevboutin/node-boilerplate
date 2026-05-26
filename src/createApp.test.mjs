import { describe, it, expect } from "vitest";
import { testClient } from "hono/testing";
import { Hono } from "hono";
import createApp, { createTestApp } from "./createApp.mjs";

describe("createApp configuration", () => {
    it("returns a not found response for unknown routes and includes response time", async () => {
        const client = testClient(createApp());

        const response = await client["not-a-route"].$get();
        const payload = await response.json();

        expect(response.status).toBe(404);
        expect(payload.statusCode).toBe(404);
        expect(response.headers.get("Response-Time")).toMatch(/^[0-9]+ms$/);
    });

    it("uses the error middleware to return a JSON error response", async () => {
        const router = new Hono().get("/", () => {
            throw new Error("boom");
        });
        const client = testClient(createTestApp(router));

        const response = await client.$get();
        const payload = await response.json();

        expect(response.status).toBe(500);
        expect(payload.message).toBe("boom");
        expect(payload.stack).toBeDefined();
    });

    it("returns 429 when the rate limiter threshold is exceeded", async () => {
        const client = testClient(createApp());
        const maxRequests = 101;
        let response;

        for (let i = 0; i < maxRequests; i += 1) {
            response = await client.$get();
        }

        expect(response.status).toBe(429);
        const payload = await response.json();
        expect(payload.statusCode).toBe(429);
    });
});
