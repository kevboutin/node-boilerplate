import { describe, it, expect } from "vitest";
import { onError } from "./onError.mjs";
import { INTERNAL_SERVER_ERROR } from "../httpStatusCodes.mjs";

const createContext = (env = "test") => ({
    env: { NODE_ENV: env },
    newResponse: () => ({ status: 200 }),
    json: (payload, status) => ({ payload, status }),
});

describe("onError middleware", () => {
    it("returns 500 when error has no status", () => {
        const error = new Error("unexpected failure");
        const ctx = createContext();

        const result = onError(error, ctx);

        expect(result.status).toBe(INTERNAL_SERVER_ERROR);
        expect(result.payload.message).toBe("unexpected failure");
        expect(result.payload.stack).toBeDefined();
    });

    it("respects error status when provided", () => {
        const error = new Error("forbidden");
        error.status = 403;
        const ctx = createContext();

        const result = onError(error, ctx);

        expect(result.status).toBe(403);
        expect(result.payload.statusCode).toBe(403);
        expect(result.payload.stack).toBeDefined();
    });

    it("hides stack traces in production", () => {
        const error = new Error("production failure");
        const ctx = createContext("production");

        const result = onError(error, ctx);

        expect(result.payload.stack).toBeUndefined();
        expect(result.payload.statusCode).toBe(INTERNAL_SERVER_ERROR);
    });
});
