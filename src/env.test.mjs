import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("dotenv", () => ({ config: () => ({ parsed: {} }) }));
vi.mock("dotenv-expand", () => ({ expand: (config) => config }));

const originalEnv = { ...process.env };

const resetProcessEnv = () => {
    for (const key of Object.keys(process.env)) {
        delete process.env[key];
    }
    Object.assign(process.env, originalEnv);
};

describe("env module", () => {
    beforeEach(() => {
        resetProcessEnv();
        vi.resetModules();
    });

    afterEach(() => {
        resetProcessEnv();
        vi.restoreAllMocks();
    });

    it("exits when required production variables are missing", async () => {
        process.env.NODE_ENV = "production";
        process.env.LOG_LEVEL = "info";

        const exitSpy = vi.spyOn(process, "exit").mockImplementation((code) => {
            throw new Error(`process.exit:${code}`);
        });

        const importPath = new URL(
            `./env.mjs?test=${Date.now()}`,
            import.meta.url,
        ).href;

        await expect(import(importPath)).rejects.toThrow("process.exit:1");
        expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it("loads production env successfully when all required values are present", async () => {
        process.env.NODE_ENV = "production";
        process.env.LOG_LEVEL = "info";
        process.env.CORS_ORIGIN = "*";
        process.env.DB_URL = "mongodb://127.0.0.1:27017/";
        process.env.DB_NAME = "productiondb";
        process.env.PORT = "3000";
        process.env.DB_READ_PREF = "secondaryPreferred";

        const importPath = new URL(
            `./env.mjs?test=${Date.now()}`,
            import.meta.url,
        ).href;

        const module = await import(importPath);

        expect(module.default.NODE_ENV).toBe("production");
        expect(module.default.DB_NAME).toBe("productiondb");
        expect(module.default.CORS_ORIGIN).toBe("*");
    });
});
