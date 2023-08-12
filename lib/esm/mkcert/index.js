import path from "path";
import process from "process";
import { SSLFY_DATA_DIR } from "../lib/constant";
import { copyDir, ensureDirExist, escape, exec, exists, getHash, prettyLog, readDir, readFile, } from "../lib/util";
import Config from "./config";
import Downloader from "./downloader";
import Record from "./record";
import { GithubSource, CodingSource } from "./source";
import VersionManger from "./version";
class Mkcert {
    force;
    autoUpgrade;
    sourceType;
    savePath;
    source;
    localMkcert;
    savedMkcert;
    keyFilePath;
    certFilePath;
    config;
    static create(options) {
        return new Mkcert(options);
    }
    constructor(options) {
        const { force, autoUpgrade, source, mkcertPath, savePath = SSLFY_DATA_DIR, keyFileName = "dev.pem", certFileName = "cert.pem", } = options;
        this.force = force;
        this.autoUpgrade = autoUpgrade;
        this.localMkcert = mkcertPath;
        this.savePath = path.resolve(savePath);
        this.keyFilePath = path.resolve(savePath, keyFileName);
        this.certFilePath = path.resolve(savePath, certFileName);
        this.sourceType = source || "github";
        if (this.sourceType === "github") {
            this.source = GithubSource.create();
        }
        else if (this.sourceType === "coding") {
            this.source = CodingSource.create();
        }
        else {
            this.source = this.sourceType;
        }
        this.savedMkcert = path.resolve(savePath, process.platform === "win32" ? "mkcert.exe" : "mkcert");
        this.config = new Config({ savePath: this.savePath });
    }
    async getMkcertBinary() {
        let binary;
        if (this.localMkcert) {
            if (await exists(this.localMkcert)) {
                binary = this.localMkcert;
            }
            else {
                console.error(`${this.localMkcert} does not exist, please check the mkcertPath parameter`);
            }
        }
        else if (await exists(this.savedMkcert)) {
            binary = this.savedMkcert;
        }
        return binary ? escape(binary) : undefined;
    }
    async checkCAExists() {
        const files = await readDir(this.savePath);
        return files.some((file) => file.includes("rootCA"));
    }
    async retainExistedCA() {
        if (await this.checkCAExists()) {
            return;
        }
        const mkcertBinnary = await this.getMkcertBinary();
        const commandStatement = `${mkcertBinnary} -CAROOT`;
        console.debug(`Exec ${commandStatement}`);
        const commandResult = await exec(commandStatement);
        const caDirPath = path.resolve(commandResult.stdout.toString().replace(/\n/g, ""));
        if (caDirPath === this.savePath) {
            return;
        }
        const caDirExists = await exists(caDirPath);
        if (!caDirExists) {
            return;
        }
        await copyDir(caDirPath, this.savePath);
    }
    async getCertificate() {
        const key = await readFile(this.keyFilePath);
        const cert = await readFile(this.certFilePath);
        return {
            key,
            cert,
        };
    }
    async createCertificate(hosts) {
        const names = hosts.join(" ");
        const mkcertBinnary = await this.getMkcertBinary();
        if (!mkcertBinnary) {
            console.debug(`Mkcert does not exist, unable to generate certificate for ${names}`);
        }
        await ensureDirExist(this.savePath);
        await this.retainExistedCA();
        const cmd = `${mkcertBinnary} -install -key-file ${escape(this.keyFilePath)} -cert-file ${escape(this.certFilePath)} ${names}`;
        await exec(cmd, {
            env: {
                ...process.env,
                CAROOT: this.savePath,
                JAVA_HOME: undefined,
            },
        });
        console.info(`The list of generated files:\n${this.keyFilePath}\n${this.certFilePath}`);
    }
    getLatestHash = async () => {
        return {
            key: await getHash(this.keyFilePath),
            cert: await getHash(this.certFilePath),
        };
    };
    async regenerate(record, hosts) {
        await this.createCertificate(hosts);
        const hash = await this.getLatestHash();
        record.update({ hosts, hash });
    }
    async init() {
        await ensureDirExist(this.savePath);
        await this.config.init();
        const mkcertBinnary = await this.getMkcertBinary();
        if (!mkcertBinnary) {
            await this.initMkcert();
        }
        else if (this.autoUpgrade) {
            await this.upgradeMkcert();
        }
    }
    async getSourceInfo() {
        const sourceInfo = await this.source.getSourceInfo();
        if (!sourceInfo) {
            const message = typeof this.sourceType === "string"
                ? `Unsupported platform. Unable to find a binary file for ${process.platform} platform with ${process.arch} arch on ${this.sourceType === "github"
                    ? "https://github.com/FiloSottile/mkcert/releases"
                    : "https://liuweigl.coding.net/p/github/artifacts?hash=8d4dd8949af543159c1b5ac71ff1ff72"}`
                : 'Please check your custom "source", it seems to return invalid result';
            throw new Error(message);
        }
        return sourceInfo;
    }
    async initMkcert() {
        const sourceInfo = await this.getSourceInfo();
        console.debug("The mkcert does not exist, download it now");
        await this.downloadMkcert(sourceInfo.downloadUrl, this.savedMkcert);
    }
    async upgradeMkcert() {
        const versionManger = new VersionManger({ config: this.config });
        const sourceInfo = await this.getSourceInfo();
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
        await this.downloadMkcert(sourceInfo.downloadUrl, this.savedMkcert);
        versionManger.update(versionInfo.nextVersion);
    }
    async downloadMkcert(sourceUrl, distPath) {
        const downloader = Downloader.create();
        await downloader.download(sourceUrl, distPath);
    }
    async renew(hosts) {
        const record = new Record({ config: this.config });
        if (this.force) {
            console.debug(`Certificate is forced to regenerate`);
            await this.regenerate(record, hosts);
        }
        if (!record.contains(hosts)) {
            console.debug(`The hosts changed from [${record.getHosts()}] to [${hosts}], start regenerate certificate`);
            await this.regenerate(record, hosts);
            return;
        }
        const hash = await this.getLatestHash();
        if (!record.equal(hash)) {
            console.debug(`The hash changed from ${prettyLog(record.getHash())} to ${prettyLog(hash)}, start regenerate certificate`);
            await this.regenerate(record, hosts);
            return;
        }
        console.debug("Neither hosts nor hash has changed, skip regenerate certificate");
    }
    /**
     * Get certificates
     *
     * @param hosts host collection
     * @returns cretificates
     */
    async install(hosts) {
        if (hosts.length) {
            await this.renew(hosts);
        }
        return await this.getCertificate();
    }
}
export default Mkcert;
