import child_process from "child_process";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import util from "util";
import { PKG_NAME } from "./constant";
/**
 * Check if file exists
 *
 * @param filePath file path
 * @returns does the file exist
 */
export const exists = async (filePath) => {
    try {
        await fs.promises.access(filePath);
        return true;
    }
    catch (error) {
        return false;
    }
};
export const mkdir = async (dirname) => {
    const isExist = await exists(dirname);
    if (!isExist) {
        await fs.promises.mkdir(dirname, { recursive: true });
    }
};
export const ensureDirExist = async (filePath, strip = false) => {
    const dirname = strip ? path.dirname(filePath) : filePath;
    await mkdir(dirname);
};
export const readFile = async (filePath) => {
    const isExist = await exists(filePath);
    return isExist
        ? (await fs.promises.readFile(filePath)).toString()
        : undefined;
};
export const writeFile = async (filePath, data) => {
    await ensureDirExist(filePath, true);
    await fs.promises.writeFile(filePath, data);
    await fs.promises.chmod(filePath, 0o777);
};
export const readDir = async (source) => {
    return fs.promises.readdir(source);
};
export const copyDir = async (source, dest) => {
    try {
        await fs.promises.cp(source, dest, {
            recursive: true,
        });
    }
    catch (error) {
        // Fails when nodejs version < 16.7.0, ignore?
        console.log(`${PKG_NAME}:`, error);
    }
};
export const exec = async (cmd, options) => {
    return util.promisify(child_process.exec)(cmd, options);
};
/**
 * http://nodejs.cn/api/os/os_networkinterfaces.html
 */
const isIPV4 = (family) => {
    return family === "IPv4" || family === 4;
};
export const getLocalV4Ips = () => {
    const interfaceDict = os.networkInterfaces();
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
export const getDefaultHosts = () => {
    return ["localhost", ...getLocalV4Ips()];
};
export const getHash = async (filePath) => {
    const content = await readFile(filePath);
    if (content) {
        const hash = crypto.createHash("sha256");
        hash.update(content);
        return hash.digest("hex");
    }
    return undefined;
};
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
export const deepMerge = (target, ...source) => {
    return source.reduce((a, b) => mergeObj(a, b), target);
};
export const prettyLog = (obj) => {
    return JSON.stringify(obj, null, 2);
};
export const escape = (path) => {
    return `"${path}"`;
};
