import { getDefaultHosts } from "./lib/util";
import Mkcert, { MkcertBaseOptions } from "./mkcert";

export { BaseSource, type SourceInfo } from "./mkcert/source";

export type MkcertOptions = MkcertBaseOptions & {
  /**
   * The hosts that needs to generate the certificate.
   */
  hosts?: string[];
};

export async function provideCertificate(options: MkcertOptions = {}) {
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
