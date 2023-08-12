/// <reference types="node" />
import { MkcertBaseOptions } from "./mkcert";
export { BaseSource, type SourceInfo } from "./mkcert/source";
export type MkcertOptions = MkcertBaseOptions & {
    /**
     * The hosts that needs to generate the certificate.
     */
    hosts?: string[];
};
export declare function provideCertificate(options?: MkcertOptions): Promise<{
    key: "" | Buffer | undefined;
    cert: "" | Buffer | undefined;
}>;
//# sourceMappingURL=index.d.ts.map