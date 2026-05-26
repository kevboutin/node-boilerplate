import { describe, it, expect } from "vitest";
import * as Models from "./index.mjs";

describe("db/models index", () => {
    it("exports audit log, item, role, and user models", () => {
        expect(Models.AuditLog).toBeDefined();
        expect(Models.Item).toBeDefined();
        expect(Models.Role).toBeDefined();
        expect(Models.User).toBeDefined();
    });
});
