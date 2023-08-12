import Config, { RecordHash, RecordMate } from './config';
export type RecordProps = {
    config: Config;
};
declare class Record {
    private config;
    constructor(options: RecordProps);
    getHosts(): string[] | undefined;
    getHash(): RecordHash | undefined;
    contains(hosts: string[]): boolean;
    equal(hash: RecordHash): boolean;
    update(record: RecordMate): Promise<void>;
}
export default Record;
//# sourceMappingURL=record.d.ts.map