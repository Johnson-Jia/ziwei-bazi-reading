import { Lunar } from './Lunar';
import { Yun } from './Yun';
import { LiuNian } from './LiuNian';
import { XiaoYun } from './XiaoYun';
export declare class DaYun {
    private readonly _startYear;
    private readonly _endYear;
    private readonly _startAge;
    private readonly _endAge;
    private readonly _index;
    private _yun;
    private readonly _lunar;
    constructor(yun: Yun, index: number);
    getStartYear(): number;
    getEndYear(): number;
    getStartAge(): number;
    getEndAge(): number;
    getIndex(): number;
    getLunar(): Lunar;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
    getLiuNian(n?: number): LiuNian[];
    getXiaoYun(n?: number): XiaoYun[];
}
