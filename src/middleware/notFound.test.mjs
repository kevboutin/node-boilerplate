import { describe, it, expect } from "vitest";
import { notFound } from "./notFound.mjs";
import { NOT_FOUND } from "../httpStatusCodes.mjs";
import { NOT_FOUND as NOT_FOUND_MESSAGE } from "../httpStatusPhrases.mjs";

describe("notFound middleware", () => {
    it("returns a 404 error with the requested path", () => {
        const ctx = {
            req: { path: "/missing" },
            json: (payload, status) => ({ payload, status }),
        };

        const result = notFound(ctx);

        expect(result.status).toBe(NOT_FOUND);
        expect(result.payload.statusCode).toBe(NOT_FOUND);
        expect(result.payload.message).toContain(NOT_FOUND_MESSAGE);
        expect(result.payload.message).toContain("/missing");
    });
});
