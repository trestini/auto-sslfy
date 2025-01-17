"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.escape = exports.prettyLog = exports.deepMerge = exports.getHash = exports.getDefaultHosts = exports.getLocalV4Ips = exports.exec = exports.copyDir = exports.readDir = exports.writeFile = exports.readFile = exports.ensureDirExist = exports.mkdir = exports.exists = void 0;
const child_process_1 = __importDefault(require("child_process"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const constant_1 = require("./constant");
/**
 * Check if file exists
 *
 * @param filePath file path
 * @returns does the file exist
 */
const exists = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.default.promises.access(filePath);
        return true;
    }
    catch (error) {
        return false;
    }
});
exports.exists = exists;
const mkdir = (dirname) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield (0, exports.exists)(dirname);
    if (!isExist) {
        yield fs_1.default.promises.mkdir(dirname, { recursive: true });
    }
});
exports.mkdir = mkdir;
const ensureDirExist = (filePath, strip = false) => __awaiter(void 0, void 0, void 0, function* () {
    const dirname = strip ? path_1.default.dirname(filePath) : filePath;
    yield (0, exports.mkdir)(dirname);
});
exports.ensureDirExist = ensureDirExist;
const readFile = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield (0, exports.exists)(filePath);
    return isExist
        ? (yield fs_1.default.promises.readFile(filePath)).toString()
        : undefined;
});
exports.readFile = readFile;
const writeFile = (filePath, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, exports.ensureDirExist)(filePath, true);
    yield fs_1.default.promises.writeFile(filePath, data);
    yield fs_1.default.promises.chmod(filePath, 0o777);
});
exports.writeFile = writeFile;
const readDir = (source) => __awaiter(void 0, void 0, void 0, function* () {
    return fs_1.default.promises.readdir(source);
});
exports.readDir = readDir;
const copyDir = (source, dest) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.default.promises.cp(source, dest, {
            recursive: true,
        });
    }
    catch (error) {
        // Fails when nodejs version < 16.7.0, ignore?
        console.log(`${constant_1.PKG_NAME}:`, error);
    }
});
exports.copyDir = copyDir;
const exec = (cmd, options) => __awaiter(void 0, void 0, void 0, function* () {
    return util_1.default.promisify(child_process_1.default.exec)(cmd, options);
});
exports.exec = exec;
/**
 * http://nodejs.cn/api/os/os_networkinterfaces.html
 */
const isIPV4 = (family) => {
    return family === "IPv4" || family === 4;
};
const getLocalV4Ips = () => {
    const interfaceDict = os_1.default.networkInterfaces();
    const addresses = [];
    for (const key in interfaceDict) {
        const interfaces = interfaceDict[key];
        if (interfaces) {
            for (const item of interfaces) {
                if (isIPV4(item.family)) {
                    addresses.push(item.address);
                }
            }
        }
    }
    return addresses;
};
exports.getLocalV4Ips = getLocalV4Ips;
const getDefaultHosts = () => {
    return ["localhost", ...(0, exports.getLocalV4Ips)()];
};
exports.getDefaultHosts = getDefaultHosts;
const getHash = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const content = yield (0, exports.readFile)(filePath);
    if (content) {
        const hash = crypto_1.default.createHash("sha256");
        hash.update(content);
        return hash.digest("hex");
    }
    return undefined;
});
exports.getHash = getHash;
const isObj = (obj) => Object.prototype.toString.call(obj) === "[object Object]";
const mergeObj = (target, source) => {
    if (!(isObj(target) && isObj(source))) {
        return target;
    }
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            const targetValue = target[key];
            const sourceValue = source[key];
            if (isObj(targetValue) && isObj(sourceValue)) {
                mergeObj(targetValue, sourceValue);
            }
            else {
                target[key] = sourceValue;
            }
        }
    }
};
const deepMerge = (target, ...source) => {
    return source.reduce((a, b) => mergeObj(a, b), target);
};
exports.deepMerge = deepMerge;
const prettyLog = (obj) => {
    return JSON.stringify(obj, null, 2);
};
exports.prettyLog = prettyLog;
const escape = (path) => {
    return `"${path}"`;
};
exports.escape = escape;
