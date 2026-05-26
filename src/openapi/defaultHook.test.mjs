import { describe, it, expect } from "vitest";
import defaultHook from "./defaultHook.mjs";
import { UNPROCESSABLE_ENTITY } from "../httpStatusCodes.mjs";

describe("OpenAPI defaultHook", () => {
    it("returns a 422 error payload when validation fails", () => {
        const ctx = {
            json: (payload, status) => ({ payload, status }),
        };
        const result = defaultHook(
            { success: false, error: { message: "invalid input" } },
            ctx,
        );

        expect(result).toEqual({
            payload: { success: false, error: { message: "invalid input" } },
            status: UNPROCESSABLE_ENTITY,
        });
    });

    it("returns undefined when validation succeeds", () => {
        const ctx = {
            json: () => ({}),
        };

        expect(defaultHook({ success: true }, ctx)).toBeUndefined();
    });
});
