class Record {
    config;
    constructor(options) {
        this.config = options.config;
    }
    getHosts() {
        return this.config.getRecord()?.hosts;
    }
    getHash() {
        return this.config.getRecord()?.hash;
    }
    contains(hosts) {
        const oldHosts = this.getHosts();
        if (!oldHosts) {
            return false;
        }
        // require hosts is subset of oldHosts
        for (const host of hosts) {
            if (!oldHosts.includes(host)) {
                return false;
            }
        }
        return true;
    }
    // whether the files has been tampered with
    equal(hash) {
        const oldHash = this.getHash();
        if (!oldHash) {
            return false;
        }
        return oldHash.key === hash.key && oldHash.cert === hash.cert;
    }
    async update(record) {
        await this.config.merge({ record });
    }
}
export default Record;
