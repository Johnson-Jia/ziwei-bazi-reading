import { DaYun } from './DaYun';
export declare class XiaoYun {
    private readonly _year;
    private readonly _age;
    private readonly _index;
    private _daYun;
    private _lunar;
    private readonly _forward;
    constructor(daYun: DaYun, index: number, forward: boolean);
    getYear(): number;
    getAge(): number;
    getIndex(): number;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
}
