"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const moment_1 = __importDefault(require("moment"));
exports.log = (content, type = "log") => {
    const timestamp = `[${moment_1.default().format("YYYY-MM-DD HH:mm:ss")}]:`;
    switch (type) {
        case "log": {
            return console.log(`${timestamp} ${chalk_1.default.bgBlue(type.toUpperCase())} ${content} `);
        }
        case "warn": {
            return console.log(`${timestamp} ${chalk_1.default.black.bgYellow(type.toUpperCase())} ${content} `);
        }
        case "error": {
            return console.log(`${timestamp} ${chalk_1.default.bgRed(type.toUpperCase())} ${content} `);
        }
        case "debug": {
            return console.log(`${timestamp} ${chalk_1.default.green(type.toUpperCase())} ${content} `);
        }
        case "cmd": {
            return console.log(`${timestamp} ${chalk_1.default.black.bgWhite(type.toUpperCase())} ${content}`);
        }
        case "ready": {
            return console.log(`${timestamp} ${chalk_1.default.black.bgGreen(type.toUpperCase())} ${content}`);
        }
        case "success": {
            return console.log(`${timestamp} ${chalk_1.default.black.bgGreen(type.toUpperCase())} ${content}`);
        }
        case "complete": {
            return console.log(`${timestamp} ${chalk_1.default.black.bgCyan(type.toUpperCase())} ${content}`);
        }
        default:
            throw new TypeError("Logger type must be either warn, debug, log, ready, cmd or error.");
    }
};
exports.error = (...args) => this.log(...args, "error");
exports.warn = (...args) => this.log(...args, "warn");
exports.debug = (...args) => this.log(...args, "debug");
exports.cmd = (...args) => this.log(...args, "cmd");
//# sourceMappingURL=Functions.js.map