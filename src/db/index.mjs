import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import env from "../env.mjs";

/** @type {boolean} */
const DB_BUFFER_COMMANDS = String(env.DB_BUFFER_COMMANDS) === "true";

/**
 * Database options.
 * @typedef {Object<string, boolean|number|string>} DatabaseOptions
 */

/**
 * Default database options.
 * @type {Object<string, boolean|number|string>}
 */
const defaultMongoOpts = {
    /*
    bufferCommands should be true and bufferMaxEntries should be -1 or non zero to
    make autoReconnect behave correctly. Currently there is a bug when setting bufferCommands true
    thus commenting it for now https://github.com/Automattic/mongoose/issues/9218
    */
    bufferCommands: DB_BUFFER_COMMANDS,
    readPreference: env.DB_READ_PREF || "secondaryPreferred",
    minPoolSize: parseInt(env.DB_MIN_POOL_SIZE, 10) || 2,
    maxPoolSize: parseInt(env.DB_MAX_POOL_SIZE, 10) || 6,
    // The connectTimeoutMS sets the number of milliseconds a socket will stay inactive before closing
    // during the connection phase of the driver
    connectTimeoutMS: parseInt(env.DB_CONNECT_TIMEOUT, 10) || 2000,
    // The socketTimeoutMS sets the number of milliseconds a socket will stay inactive after the driver
    // has successfully connected before closing.
    socketTimeoutMS: parseInt(env.DB_SOCKET_TIMEOUT, 10) || 120000,
    // The maximum number of milliseconds that a connection can remain idle in the pool before being removed and closed.
    maxIdleTimeMS: parseInt(env.DB_MAX_IDLE_TIME, 10) || 750000,
};

/**
 * @class DatabaseService
 */
class DatabaseService {
    /**
     * Creates a DatabaseService.
     *
     * @constructor
     * @param {Object} params The parameters.
     * @param {string} params.dbUri The database URI.
     * @param {DatabaseOptions} params.databaseOpts The DatabaseOptions.
     * @param {string} params.dbName The database name.
     */
    constructor({ dbUri, databaseOpts, dbName }) {
        this.dbUri = dbUri;
        this.dbName = dbName;
        this.databaseOpts = { ...defaultMongoOpts, ...databaseOpts };
        this.connection = null;
    }

    /**
     * Get the database name.
     *
     * @return {string} The database name.
     */
    getDatabaseName() {
        return this.dbName;
    }

    /**
     * Set the database name. This will force a connection object change.
     *
     * @param {string} dbName The database name.
     */
    setDatabaseName(dbName) {
        this.dbName = dbName;
        // The useDb() function will update the connection object.
        if (this.connection)
            this.connection = this.connection.useDb(dbName, { useCache: true });
    }

    /**
     * Convert this object to a string.
     *
     * @returns {string} A stringified representation of the object.
     */
    toString() {
        let secureUri;
        if (this.dbUri) {
            secureUri = this.dbUri.replace(/\/\/.*@/, "//***:***@");
        }
        const obj = {
            dbUri: secureUri,
            dbName: this.dbName,
            options: this.databaseOpts,
        };
        return JSON.stringify(obj);
    }

    /**
     * Returns a promise that returns a new connection. If a connection was already created, it will return a
     * cached connection.
     *
     * @throws {Error} Throws an error if connection fails to open.
     * @return {Promise<Connection>} The connection.
     */
    async createConnection() {
        if (process.env.NODE_ENV === "test") {
            // Use the MongoDB memory server for testing.
            const mongoServer = await MongoMemoryServer.create();
            this.dbUri = mongoServer.getUri();
            console.log(
                `createConnection: Creating test connection with uri=${this.dbUri}`,
            );
            await mongoose.connect(this.dbUri, this.databaseOpts);
            this.connection = mongoose.connection;
            return this.connection;
        }
        if (!this.dbUri) {
            console.error(
                `createConnection: Service is missing data: ${this.toString()}`,
            );
        }
        // Only use this for logging since the URI can have sensitive credentials within.
        const secureUri = this.dbUri.replace(/\/\/.*@/, "//***:***@");
        if (this.connection === null) {
            // There is no cached connection so create one.
            console.log(
                `createConnection: Creating new connection and caching it to ${secureUri}.`,
            );
            await mongoose.connect(
                `${this.dbUri}${this.dbName}`,
                this.databaseOpts,
            );
            this.connection = mongoose.connection;
            console.log(
                `createConnection: Connection was created. Total of ${mongoose.connections.length} connections to host ${this.connection?.host}.`,
            );
            return this.connection;
        }
        if (!this.isConnectionAlive(this.connection)) {
            // Connection is no longer alive so close it and create a new one.
            await this.closeConnection(this.connection);
            console.log(
                `createConnection: Connection is not alive, creating new connection and caching it to ${secureUri}.`,
            );
            await mongoose.connect(
                `${this.dbUri}${this.dbName}`,
                this.databaseOpts,
            );
            this.connection = mongoose.connection;
            console.log(
                `createConnection: Connection was created. Total of ${mongoose.connections.length} connections to host ${this.connection?.host}.`,
            );
            return this.connection;
        }
        // Connection is cached in memory so use it.
        console.log(
            `Using cached connection. Total of ${mongoose.connections.length} connections to host ${this.connection?.host}.`,
        );
        return this.connection;
    }

    /**
     * Determines if the database connection is alive/active.
     *
     * @param {Object} conn The database connection.
     * @return {boolean} True if the connection is still considered active.
     */
    isConnectionAlive(conn) {
        if (!conn) return false;
        console.log(`Database connection readyState:`, conn.readyState);
        // return true if connected or connecting
        return conn.readyState === 1 || conn.readyState === 2;
    }

    /**
     * Returns a DB connection by calling createConnection. If a function is passed, it will pass the connection
     * to the function and run the function.
     *
     * @param {function} [fn] Function worker that accepts a connection. This is optional.
     * @return {Promise<Object>} The result of the fn or the connection itself.
     */
    async getConnection(fn) {
        // If function is not passed, return the promise
        if (!fn) {
            return await this.createConnection();
        }
        // If function is passed, call the function by passing the connection to it
        return await this.createConnection().then((conn) => fn(conn));
    }

    /**
     * Close the cached connection.
     *
     * @return {null}
     */
    async closeConnection() {
        mongoose.connection.close();
        return null;
    }
}

export default DatabaseService;
