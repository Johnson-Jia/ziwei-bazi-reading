export declare class FotoFestival {
    private readonly _name;
    private readonly _result;
    private readonly _everyMonth;
    private readonly _remark;
    constructor(name: string, result?: string, everyMonth?: boolean, remark?: string);
    getName(): string;
    getResult(): string;
    isEveryMonth(): boolean;
    getRemark(): string;
    toString(): string;
    toFullString(): string;
}
