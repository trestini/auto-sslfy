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
const parseVersion = (version) => {
    const str = version.trim().replace(/v/i, "");
    return str.split(".");
};
class VersionManger {
    constructor(props) {
        this.config = props.config;
    }
    update(version) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.config.merge({ version });
            }
            catch (err) {
                console.debug("Failed to record mkcert version info: %o", err);
            }
        });
    }
    compare(version) {
        const currentVersion = this.config.getVersion();
        if (!currentVersion) {
            return {
                currentVersion,
                nextVersion: version,
                breakingChange: false,
                shouldUpdate: true,
            };
        }
        let breakingChange = false;
        let shouldUpdate = false;
        const newVersion = parseVersion(version);
        const oldVersion = parseVersion(currentVersion);
        for (let i = 0; i < newVersion.length; i++) {
            if (newVersion[i] > oldVersion[i]) {
                shouldUpdate = true;
                breakingChange = i === 0;
                break;
            }
        }
        return {
            breakingChange,
            shouldUpdate,
            currentVersion,
            nextVersion: version,
        };
    }
}
exports.default = VersionManger;
