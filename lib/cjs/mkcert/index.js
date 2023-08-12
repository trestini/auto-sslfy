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
const process_1 = __importDefault(require("process"));
const constant_1 = require("../lib/constant");
const util_1 = require("../lib/util");
const config_1 = __importDefault(require("./config"));
const downloader_1 = __importDefault(require("./downloader"));
const record_1 = __importDefault(require("./record"));
const source_1 = require("./source");
const version_1 = __importDefault(require("./version"));
class Mkcert {
    static create(options) {
        return new Mkcert(options);
    }
    constructor(options) {
        this.getLatestHash = () => __awaiter(this, void 0, void 0, function* () {
            return {
                key: yield (0, util_1.getHash)(this.keyFilePath),
                cert: yield (0, util_1.getHash)(this.certFilePath),
            };
        });
        const { force, autoUpgrade, source, mkcertPath, savePath = constant_1.SSLFY_DATA_DIR, keyFileName = "dev.pem", certFileName = "cert.pem", } = options;
        this.force = force;
        this.autoUpgrade = autoUpgrade;
        this.localMkcert = mkcertPath;
        this.savePath = path_1.default.resolve(savePath);
        this.keyFilePath = path_1.default.resolve(savePath, keyFileName);
        this.certFilePath = path_1.default.resolve(savePath, certFileName);
        this.sourceType = source || "github";
        if (this.sourceType === "github") {
            this.source = source_1.GithubSource.create();
        }
        else if (this.sourceType === "coding") {
            this.source = source_1.CodingSource.create();
        }
        else {
            this.source = this.sourceType;
        }
        this.savedMkcert = path_1.default.resolve(savePath, process_1.default.platform === "win32" ? "mkcert.exe" : "mkcert");
        this.config = new config_1.default({ savePath: this.savePath });
    }
    getMkcertBinary() {
        return __awaiter(this, void 0, void 0, function* () {
            let binary;
            if (this.localMkcert) {
                if (yield (0, util_1.exists)(this.localMkcert)) {
                    binary = this.localMkcert;
                }
                else {
                    console.error(`${this.localMkcert} does not exist, please check the mkcertPath parameter`);
                }
            }
            else if (yield (0, util_1.exists)(this.savedMkcert)) {
                binary = this.savedMkcert;
            }
            return binary ? (0, util_1.escape)(binary) : undefined;
        });
    }
    checkCAExists() {
        return __awaiter(this, void 0, void 0, function* () {
            const files = yield (0, util_1.readDir)(this.savePath);
            return files.some((file) => file.includes("rootCA"));
        });
    }
    retainExistedCA() {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.checkCAExists()) {
                return;
            }
            const mkcertBinnary = yield this.getMkcertBinary();
            const commandStatement = `${mkcertBinnary} -CAROOT`;
            console.debug(`Exec ${commandStatement}`);
            const commandResult = yield (0, util_1.exec)(commandStatement);
            const caDirPath = path_1.default.resolve(commandResult.stdout.toString().replace(/\n/g, ""));
            if (caDirPath === this.savePath) {
                return;
            }
            const caDirExists = yield (0, util_1.exists)(caDirPath);
            if (!caDirExists) {
                return;
            }
            yield (0, util_1.copyDir)(caDirPath, this.savePath);
        });
    }
    getCertificate() {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield (0, util_1.readFile)(this.keyFilePath);
            const cert = yield (0, util_1.readFile)(this.certFilePath);
            return {
                key,
                cert,
            };
        });
    }
    createCertificate(hosts) {
        return __awaiter(this, void 0, void 0, function* () {
            const names = hosts.join(" ");
            const mkcertBinnary = yield this.getMkcertBinary();
            if (!mkcertBinnary) {
                console.debug(`Mkcert does not exist, unable to generate certificate for ${names}`);
            }
            yield (0, util_1.ensureDirExist)(this.savePath);
            yield this.retainExistedCA();
            const cmd = `${mkcertBinnary} -install -key-file ${(0, util_1.escape)(this.keyFilePath)} -cert-file ${(0, util_1.escape)(this.certFilePath)} ${names}`;
            yield (0, util_1.exec)(cmd, {
                env: Object.assign(Object.assign({}, process_1.default.env), { CAROOT: this.savePath, JAVA_HOME: undefined }),
            });
            console.info(`The list of generated files:\n${this.keyFilePath}\n${this.certFilePath}`);
        });
    }
    regenerate(record, hosts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.createCertificate(hosts);
            const hash = yield this.getLatestHash();
            record.update({ hosts, hash });
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, util_1.ensureDirExist)(this.savePath);
            yield this.config.init();
            const mkcertBinnary = yield this.getMkcertBinary();
            if (!mkcertBinnary) {
                yield this.initMkcert();
            }
            else if (this.autoUpgrade) {
                yield this.upgradeMkcert();
            }
        });
    }
    getSourceInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceInfo = yield this.source.getSourceInfo();
            if (!sourceInfo) {
                const message = typeof this.sourceType === "string"
                    ? `Unsupported platform. Unable to find a binary file for ${process_1.default.platform} platform with ${process_1.default.arch} arch on ${this.sourceType === "github"
                        ? "https://github.com/FiloSottile/mkcert/releases"
                        : "https://liuweigl.coding.net/p/github/artifacts?hash=8d4dd8949af543159c1b5ac71ff1ff72"}`
                    : 'Please check your custom "source", it seems to return invalid result';
                throw new Error(message);
            }
            return sourceInfo;
        });
    }
    initMkcert() {
        return __awaiter(this, void 0, void 0, function* () {
            const sourceInfo = yield this.getSourceInfo();
            console.debug("The mkcert does not exist, download it now");
            yield this.downloadMkcert(sourceInfo.downloadUrl, this.savedMkcert);
        });
    }
    upgradeMkcert() {
        return __awaiter(this, void 0, void 0, function* () {
            const versionManger = new version_1.default({ config: this.config });
            const sourceInfo = yield this.getSourceInfo();
            if (!sourceInfo) {
                console.error("Can not obtain download information of mkcert, update skipped");
                return;
            }
            const versionInfo = versionManger.compare(sourceInfo.version);
            if (!versionInfo.shouldUpdate) {
                console.debug("Mkcert is kept latest version, update skipped");
                return;
            }
            if (versionInfo.breakingChange) {
                console.debug("The current version of mkcert is %s, and the latest version is %s, there may be some breaking changes, update skipped", versionInfo.currentVersion, versionInfo.nextVersion);
                return;
            }
            console.debug("The current version of mkcert is %s, and the latest version is %s, mkcert will be updated", versionInfo.currentVersion, versionInfo.nextVersion);
            yield this.downloadMkcert(sourceInfo.downloadUrl, this.savedMkcert);
            versionManger.update(versionInfo.nextVersion);
        });
    }
    downloadMkcert(sourceUrl, distPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const downloader = downloader_1.default.create();
            yield downloader.download(sourceUrl, distPath);
        });
    }
    renew(hosts) {
        return __awaiter(this, void 0, void 0, function* () {
            const record = new record_1.default({ config: this.config });
            if (this.force) {
                console.debug(`Certificate is forced to regenerate`);
                yield this.regenerate(record, hosts);
            }
            if (!record.contains(hosts)) {
                console.debug(`The hosts changed from [${record.getHosts()}] to [${hosts}], start regenerate certificate`);
                yield this.regenerate(record, hosts);
                return;
            }
            const hash = yield this.getLatestHash();
            if (!record.equal(hash)) {
                console.debug(`The hash changed from ${(0, util_1.prettyLog)(record.getHash())} to ${(0, util_1.prettyLog)(hash)}, start regenerate certificate`);
                yield this.regenerate(record, hosts);
                return;
            }
            console.debug("Neither hosts nor hash has changed, skip regenerate certificate");
        });
    }
    /**
     * Get certificates
     *
     * @param hosts host collection
     * @returns cretificates
     */
    install(hosts) {
        return __awaiter(this, void 0, void 0, function* () {
            if (hosts.length) {
                yield this.renew(hosts);
            }
            return yield this.getCertificate();
        });
    }
}
exports.default = Mkcert;
