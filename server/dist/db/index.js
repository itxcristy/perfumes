"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.pool = exports.getClient = exports.query = void 0;
var connection_1 = require("./connection");
Object.defineProperty(exports, "query", { enumerable: true, get: function () { return connection_1.query; } });
Object.defineProperty(exports, "getClient", { enumerable: true, get: function () { return connection_1.getClient; } });
Object.defineProperty(exports, "pool", { enumerable: true, get: function () { return connection_1.pool; } });
var connection_2 = require("./connection");
Object.defineProperty(exports, "initializeDatabase", { enumerable: true, get: function () { return connection_2.initializeDatabase; } });
//# sourceMappingURL=index.js.map