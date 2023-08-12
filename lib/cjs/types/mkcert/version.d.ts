import Config from "./config";
export type VersionMangerProps = {
    config: Config;
};
declare class VersionManger {
    private config;
    constructor(props: VersionMangerProps);
    update(version: string): Promise<void>;
    compare(version: string): {
        currentVersion: string | undefined;
        nextVersion: string;
        breakingChange: boolean;
        shouldUpdate: boolean;
    };
}
export default VersionManger;
//# sourceMappingURL=version.d.ts.map