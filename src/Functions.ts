import chalk from "chalk";
import moment from "moment";

export const log = (content, type = "log") => {
    const timestamp = `[${moment().format("YYYY-MM-DD HH:mm:ss")}]:`;
    switch (type) {
        case "log": {
            return console.log(`${timestamp} ${chalk.bgBlue(type.toUpperCase())} ${content} `);
        }
        case "warn": {
            return console.log(`${timestamp} ${chalk.black.bgYellow(type.toUpperCase())} ${content} `);
        }
        case "error": {
            return console.log(`${timestamp} ${chalk.bgRed(type.toUpperCase())} ${content} `);
        }
        case "debug": {
            return console.log(`${timestamp} ${chalk.green(type.toUpperCase())} ${content} `);
        }
        case "cmd": {
            return console.log(`${timestamp} ${chalk.black.bgWhite(type.toUpperCase())} ${content}`);
        }
        case "ready": {
            return console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
        }
        case "success": {
            return console.log(`${timestamp} ${chalk.black.bgGreen(type.toUpperCase())} ${content}`);
        }
        case "complete": {
            return console.log(`${timestamp} ${chalk.black.bgCyan(type.toUpperCase())} ${content}`);
        }
        default:
            throw new TypeError("Logger type must be either warn, debug, log, ready, cmd or error.");
    }
};

export const error = (...args) => this.log(...args, "error");

export const warn = (...args) => this.log(...args, "warn");

export const debug = (...args) => this.log(...args, "debug");

export const cmd = (...args) => this.log(...args, "cmd");
