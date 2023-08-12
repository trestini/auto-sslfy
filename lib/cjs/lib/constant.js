"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SSLFY_DATA_DIR = exports.PKG_NAME = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
exports.PKG_NAME = "auto-sslfy";
exports.SSLFY_DATA_DIR = path_1.default.join(os_1.default.homedir(), `.${exports.PKG_NAME}`);
