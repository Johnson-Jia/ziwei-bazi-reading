import { DaYun } from './DaYun';
import { Lunar } from './Lunar';
import { LiuYue } from './LiuYue';
export declare class LiuNian {
    private readonly _year;
    private readonly _age;
    private readonly _index;
    private _daYun;
    private readonly _lunar;
    constructor(daYun: DaYun, index: number);
    getYear(): number;
    getAge(): number;
    getIndex(): number;
    getLunar(): Lunar;
    getGanZhi(): string;
    getXun(): string;
    getXunKong(): string;
    getLiuYue(): LiuYue[];
}
