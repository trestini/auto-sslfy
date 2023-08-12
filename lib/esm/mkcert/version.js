const parseVersion = (version) => {
    const str = version.trim().replace(/v/i, "");
    return str.split(".");
};
class VersionManger {
    config;
    constructor(props) {
        this.config = props.config;
    }
    async update(version) {
        try {
            await this.config.merge({ version });
        }
        catch (err) {
            console.debug("Failed to record mkcert version info: %o", err);
        }
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
export default VersionManger;
