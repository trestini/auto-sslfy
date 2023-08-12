import path from "path";
import { readFile, writeFile, prettyLog, deepMerge } from "../lib/util";
const CONFIG_FILE_NAME = "config.json";
class Config {
    /**
     * The mkcert version
     */
    version;
    record;
    configFilePath;
    constructor({ savePath }) {
        this.configFilePath = path.resolve(savePath, CONFIG_FILE_NAME);
    }
    async init() {
        const str = await readFile(this.configFilePath);
        const options = str ? JSON.parse(str) : undefined;
        if (options) {
            this.version = options.version;
            this.record = options.record;
        }
    }
    async serialize() {
        await writeFile(this.configFilePath, prettyLog(this));
    }
    // deep merge
    async merge(obj) {
        const currentStr = prettyLog(this);
        deepMerge(this, obj);
        const nextStr = prettyLog(this);
        console.debug(`Receive parameter\n ${prettyLog(obj)}\nUpdate config from\n ${currentStr} \nto\n ${nextStr}`);
        await this.serialize();
    }
    getRecord() {
        return this.record;
    }
    getVersion() {
        return this.version;
    }
}
export default Config;
