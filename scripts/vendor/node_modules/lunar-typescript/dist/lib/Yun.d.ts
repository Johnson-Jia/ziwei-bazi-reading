import { Lunar } from './Lunar';
import { Solar } from './Solar';
import { DaYun } from './DaYun';
export declare class Yun {
    private readonly _gender;
    private readonly _startYear;
    private readonly _startMonth;
    private readonly _startDay;
    private readonly _startHour;
    private readonly _forward;
    private readonly _lunar;
    constructor(lunar: Lunar, gender: number, sect?: number);
    getGender(): number;
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartHour(): number;
    isForward(): boolean;
    getLunar(): Lunar;
    getStartSolar(): Solar;
    getDaYun(n?: number): DaYun[];
}
