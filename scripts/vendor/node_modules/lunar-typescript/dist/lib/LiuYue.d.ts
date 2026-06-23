import { LiuNian } from './LiuNian';
export declare class LiuYue {
    private readonly _index;
    private _liuNian;
    constructor(liuNian: LiuNian, index: number);
    getIndex(): number;
    getMonthInChinese(): string;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
}
