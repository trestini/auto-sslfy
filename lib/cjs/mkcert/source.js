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
exports.CodingSource = exports.GithubSource = exports.BaseSource = void 0;
const rest_1 = require("@octokit/rest");
const request_1 = __importDefault(require("../lib/request"));
class BaseSource {
    getPlatformIdentifier() {
        const arch = process.arch === 'x64' ? 'amd64' : process.arch;
        return process.platform === 'win32'
            ? `windows-${arch}.exe`
            : `${process.platform}-${arch}`;
    }
}
exports.BaseSource = BaseSource;
/**
 * Download mkcert from github.com
 */
class GithubSource extends BaseSource {
    static create() {
        return new GithubSource();
    }
    constructor() {
        super();
    }
    getSourceInfo() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const octokit = new rest_1.Octokit();
            const { data } = yield octokit.repos.getLatestRelease({
                owner: 'FiloSottile',
                repo: 'mkcert'
            });
            const platformIdentifier = this.getPlatformIdentifier();
            const version = data.tag_name;
            const downloadUrl = (_a = data.assets.find(item => item.name.includes(platformIdentifier))) === null || _a === void 0 ? void 0 : _a.browser_download_url;
            if (!(version && downloadUrl)) {
                return undefined;
            }
            return {
                downloadUrl,
                version
            };
        });
    }
}
exports.GithubSource = GithubSource;
/**
 * Download mkcert from coding.net
 *
 * @see https://help.coding.net/openapi
 */
class CodingSource extends BaseSource {
    static create() {
        return new CodingSource();
    }
    constructor() {
        super();
    }
    request(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, request_1.default)({
                data,
                method: 'POST',
                url: CodingSource.CODING_API,
                headers: {
                    Authorization: CodingSource.CODING_AUTHORIZATION
                }
            });
        });
    }
    /**
     * Get filename of Coding.net artifacts
     *
     * @see https://liuweigl.coding.net/p/github/artifacts/885241/generic/packages
     *
     * @returns name
     */
    getPackageName() {
        return `mkcert-${this.getPlatformIdentifier()}`;
    }
    getSourceInfo() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * @see https://help.coding.net/openapi#e2106ec64e75af66f188463b1bb7e165
             */
            const { data: VersionData } = yield this.request({
                Action: 'DescribeArtifactVersionList',
                ProjectId: CodingSource.CODING_PROJECT_ID,
                Repository: CodingSource.REPOSITORY,
                Package: this.getPackageName(),
                PageSize: 1
            });
            const version = (_b = (_a = VersionData.Response.Data) === null || _a === void 0 ? void 0 : _a.InstanceSet[0]) === null || _b === void 0 ? void 0 : _b.Version;
            if (!version) {
                return undefined;
            }
            /**
             * @see https://help.coding.net/openapi#63ad6bc7469373cef575e92bb92be71e
             */
            const { data: FileData } = yield this.request({
                Action: 'DescribeArtifactFileDownloadUrl',
                ProjectId: CodingSource.CODING_PROJECT_ID,
                Repository: CodingSource.REPOSITORY,
                Package: this.getPackageName(),
                PackageVersion: version
            });
            const downloadUrl = FileData.Response.Url;
            if (!downloadUrl) {
                return undefined;
            }
            return {
                downloadUrl,
                version
            };
        });
    }
}
exports.CodingSource = CodingSource;
CodingSource.CODING_API = 'https://e.coding.net/open-api';
CodingSource.CODING_AUTHORIZATION = 'token 000f7831ec425079439b0f55f55c729c9280d66e';
CodingSource.CODING_PROJECT_ID = 8524617;
CodingSource.REPOSITORY = 'mkcert';
