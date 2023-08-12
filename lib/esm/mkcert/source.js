import { Octokit } from '@octokit/rest';
import request from '../lib/request';
export class BaseSource {
    getPlatformIdentifier() {
        const arch = process.arch === 'x64' ? 'amd64' : process.arch;
        return process.platform === 'win32'
            ? `windows-${arch}.exe`
            : `${process.platform}-${arch}`;
    }
}
/**
 * Download mkcert from github.com
 */
export class GithubSource extends BaseSource {
    static create() {
        return new GithubSource();
    }
    constructor() {
        super();
    }
    async getSourceInfo() {
        const octokit = new Octokit();
        const { data } = await octokit.repos.getLatestRelease({
            owner: 'FiloSottile',
            repo: 'mkcert'
        });
        const platformIdentifier = this.getPlatformIdentifier();
        const version = data.tag_name;
        const downloadUrl = data.assets.find(item => item.name.includes(platformIdentifier))?.browser_download_url;
        if (!(version && downloadUrl)) {
            return undefined;
        }
        return {
            downloadUrl,
            version
        };
    }
}
/**
 * Download mkcert from coding.net
 *
 * @see https://help.coding.net/openapi
 */
export class CodingSource extends BaseSource {
    static CODING_API = 'https://e.coding.net/open-api';
    static CODING_AUTHORIZATION = 'token 000f7831ec425079439b0f55f55c729c9280d66e';
    static CODING_PROJECT_ID = 8524617;
    static REPOSITORY = 'mkcert';
    static create() {
        return new CodingSource();
    }
    constructor() {
        super();
    }
    async request(data) {
        return request({
            data,
            method: 'POST',
            url: CodingSource.CODING_API,
            headers: {
                Authorization: CodingSource.CODING_AUTHORIZATION
            }
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
    async getSourceInfo() {
        /**
         * @see https://help.coding.net/openapi#e2106ec64e75af66f188463b1bb7e165
         */
        const { data: VersionData } = await this.request({
            Action: 'DescribeArtifactVersionList',
            ProjectId: CodingSource.CODING_PROJECT_ID,
            Repository: CodingSource.REPOSITORY,
            Package: this.getPackageName(),
            PageSize: 1
        });
        const version = VersionData.Response.Data?.InstanceSet[0]?.Version;
        if (!version) {
            return undefined;
        }
        /**
         * @see https://help.coding.net/openapi#63ad6bc7469373cef575e92bb92be71e
         */
        const { data: FileData } = await this.request({
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
    }
}
