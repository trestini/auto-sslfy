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
const path_1 = __importDefault(require("path"));
const util_1 = require("../lib/util");
const CONFIG_FILE_NAME = "config.json";
class Config {
    constructor({ savePath }) {
        this.configFilePath = path_1.default.resolve(savePath, CONFIG_FILE_NAME);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const str = yield (0, util_1.readFile)(this.configFilePath);
            const options = str ? JSON.parse(str) : undefined;
            if (options) {
                this.version = options.version;
                this.record = options.record;
            }
        });
    }
    serialize() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, util_1.writeFile)(this.configFilePath, (0, util_1.prettyLog)(this));
        });
    }
    // deep merge
    merge(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            const currentStr = (0, util_1.prettyLog)(this);
            (0, util_1.deepMerge)(this, obj);
            const nextStr = (0, util_1.prettyLog)(this);
            console.debug(`Receive parameter\n ${(0, util_1.prettyLog)(obj)}\nUpdate config from\n ${currentStr} \nto\n ${nextStr}`);
            yield this.serialize();
        });
    }
    getRecord() {
        return this.record;
    }
    getVersion() {
        return this.version;
    }
}
exports.default = Config;
