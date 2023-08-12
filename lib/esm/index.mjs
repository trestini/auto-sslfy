import { getDefaultHosts } from "./lib/util";
import Mkcert from "./mkcert";
export { BaseSource } from "./mkcert/source";
export async function provideCertificate(options = {}) {
    const { hosts = [], ...mkcertOptions } = options;
    const mkcert = Mkcert.create(mkcertOptions);
    await mkcert.init();
    const allHosts = [...getDefaultHosts(), ...hosts];
    const uniqueHosts = Array.from(new Set(allHosts)).filter((item) => !!item);
    const certificate = await mkcert.install(uniqueHosts);
    return {
        key: certificate.key && Buffer.from(certificate.key),
        cert: certificate.cert && Buffer.from(certificate.cert),
    };
}
