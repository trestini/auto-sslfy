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
Object.defineProperty(exports, "__esModule", { value: true });
class Record {
    constructor(options) {
        this.config = options.config;
    }
    getHosts() {
        var _a;
        return (_a = this.config.getRecord()) === null || _a === void 0 ? void 0 : _a.hosts;
    }
    getHash() {
        var _a;
        return (_a = this.config.getRecord()) === null || _a === void 0 ? void 0 : _a.hash;
    }
    contains(hosts) {
        const oldHosts = this.getHosts();
        if (!oldHosts) {
            return false;
        }
        // require hosts is subset of oldHosts
        for (const host of hosts) {
            if (!oldHosts.includes(host)) {
                return false;
            }
        }
        return true;
    }
    // whether the files has been tampered with
    equal(hash) {
        const oldHash = this.getHash();
        if (!oldHash) {
            return false;
        }
        return oldHash.key === hash.key && oldHash.cert === hash.cert;
    }
    update(record) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.config.merge({ record });
        });
    }
}
exports.default = Record;
