import request from "../lib/request";
import { writeFile } from "../lib/util";
class Downloader {
    static create() {
        return new Downloader();
    }
    constructor() { }
    async download(downloadUrl, savedPath) {
        console.debug("Downloading the mkcert executable from %s", downloadUrl);
        const { data } = await request.get(downloadUrl, {
            responseType: "arraybuffer",
        });
        await writeFile(savedPath, data);
        console.debug("The mkcert has been saved to %s", savedPath);
    }
}
export default Downloader;
