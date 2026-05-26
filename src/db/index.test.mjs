import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import mongoose from "mongoose";
import DatabaseService from "./index.mjs";

describe("DatabaseService", () => {
    let dbService;
    const mockDbUri = "mongodb://localhost:27017/";
    const mockDbName = "testdb";
    const mockOptions = { bufferCommands: true };
    const originalMongooseConnection = mongoose.connection;
    const originalMongooseConnections = mongoose.connections;

    beforeEach(() => {
        dbService = new DatabaseService({
            dbUri: mockDbUri,
            dbName: mockDbName,
            databaseOpts: mockOptions,
        });
    });

    afterEach(async () => {
        await dbService.closeConnection();
        process.env.NODE_ENV = "test";
        mongoose.connection = originalMongooseConnection;
        mongoose.connections = originalMongooseConnections;
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    describe("constructor", () => {
        it("should initialize with correct properties", () => {
            expect(dbService.dbUri).toBe(mockDbUri);
            expect(dbService.dbName).toBe(mockDbName);
            expect(dbService.databaseOpts).toEqual(
                expect.objectContaining(mockOptions),
            );
            expect(dbService.connection).toBeNull();
        });
    });

    describe("getDatabaseName", () => {
        it("should return the database name", () => {
            expect(dbService.getDatabaseName()).toBe(mockDbName);
        });
    });

    describe("setDatabaseName", () => {
        it("should update database name", () => {
            const newDbName = "newTestDb";
            dbService.setDatabaseName(newDbName);
            expect(dbService.dbName).toBe(newDbName);
        });

        it("should update connection when it exists", async () => {
            const useDbMock = vi.fn();
            dbService.connection = { useDb: useDbMock };

            const newDbName = "newTestDb";
            dbService.setDatabaseName(newDbName);

            expect(useDbMock).toHaveBeenCalledWith(newDbName, {
                useCache: true,
            });
        });
    });

    describe("toString", () => {
        it("should return masked connection string", () => {
            dbService.dbUri = "mongodb://user:pass@localhost:27017/";
            const result = dbService.toString();
            expect(result).toContain("***:***@");
            expect(result).not.toContain("user:pass");
        });
    });

    describe("createConnection", () => {
        it("should create test connection when NODE_ENV is test", async () => {
            process.env.NODE_ENV = "test";
            const connection = await dbService.createConnection();
            expect(connection).toBeDefined();
            expect(mongoose.connections.length).toBeGreaterThan(0);
        });

        it("should create production connection when no cached connection exists", async () => {
            process.env.NODE_ENV = "production";
            const connectSpy = vi
                .spyOn(mongoose, "connect")
                .mockResolvedValue();
            const connectionMock = {
                host: "production-host",
                readyState: 1,
                close: vi.fn(),
            };
            mongoose.connection = connectionMock;
            mongoose.connections = [connectionMock];

            dbService.connection = null;
            const connection = await dbService.createConnection();

            expect(connectSpy).toHaveBeenCalledWith(
                `${mockDbUri}${mockDbName}`,
                expect.any(Object),
            );
            expect(connection).toBe(connectionMock);
        });

        it("should reuse cached production connection when connection is alive", async () => {
            process.env.NODE_ENV = "production";
            const connectSpy = vi
                .spyOn(mongoose, "connect")
                .mockResolvedValue();
            const cachedConnection = {
                host: "cached-host",
                readyState: 1,
                close: vi.fn(),
            };
            dbService.connection = cachedConnection;
            mongoose.connections = [cachedConnection];
            mongoose.connection = cachedConnection;

            const connection = await dbService.createConnection();

            expect(connectSpy).not.toHaveBeenCalled();
            expect(connection).toBe(cachedConnection);
        });

        it("should recreate production connection when cached connection is not alive", async () => {
            process.env.NODE_ENV = "production";
            const connectSpy = vi
                .spyOn(mongoose, "connect")
                .mockResolvedValue();
            const staleConnection = { readyState: 0 };
            const newConnection = {
                host: "reconnected-host",
                readyState: 1,
                close: vi.fn(),
            };
            dbService.connection = staleConnection;
            mongoose.connection = newConnection;
            mongoose.connections = [newConnection];

            const connection = await dbService.createConnection();

            expect(newConnection.close).toHaveBeenCalled();
            expect(connectSpy).toHaveBeenCalledWith(
                `${mockDbUri}${mockDbName}`,
                expect.any(Object),
            );
            expect(connection).toBe(newConnection);
        });
    });

    describe("isConnectionAlive", () => {
        it("should return false for null connection", () => {
            expect(dbService.isConnectionAlive(null)).toBe(false);
        });

        it("should return true for active connection", () => {
            const mockConn = { readyState: 1 };
            expect(dbService.isConnectionAlive(mockConn)).toBe(true);
        });

        it("should return true for connecting state", () => {
            const mockConn = { readyState: 2 };
            expect(dbService.isConnectionAlive(mockConn)).toBe(true);
        });
    });

    describe("getConnection", () => {
        it("should return connection when no function is provided", async () => {
            const connection = await dbService.getConnection();
            expect(connection).toBeDefined();
        });

        it("should execute function with connection when provided", async () => {
            const mockFn = vi.fn();
            await dbService.getConnection(mockFn);
            expect(mockFn).toHaveBeenCalled();
        });
    });
});
