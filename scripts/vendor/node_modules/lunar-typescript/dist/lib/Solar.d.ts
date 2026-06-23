import { SolarWeek } from './SolarWeek';
import { Lunar } from './Lunar';
export declare class Solar {
    static J2000: number;
    private readonly _year;
    private readonly _month;
    private readonly _day;
    private readonly _hour;
    private readonly _minute;
    private readonly _second;
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    static fromDate(date: Date): Solar;
    static fromJulianDay(julianDay: number): Solar;
    static fromBaZi(yearGanZhi: string, monthGanZhi: string, dayGanZhi: string, timeGanZhi: string, sect?: number, baseYear?: number): Solar[];
    constructor(year: number, month: number, day: number, hour: number, minute: number, second: number);
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getWeek(): number;
    getWeekInChinese(): string;
    getSolarWeek(start: number): SolarWeek;
    isLeapYear(): boolean;
    getFestivals(): string[];
    getOtherFestivals(): string[];
    getXingzuo(): string;
    getXingZuo(): string;
    /**
     * 获取薪资比例(感谢 https://gitee.com/smr1987)
     * @returns 1 | 2 | 3 薪资比例
     */
    getSalaryRate(): number;
    toYmd(): string;
    toYmdHms(): string;
    toString(): string;
    toFullString(): string;
    nextYear(years: number): Solar;
    nextMonth(months: number): Solar;
    nextDay(days: number): Solar;
    next(days: number, onlyWorkday?: boolean): Solar;
    nextHour(hours: number): Solar;
    getLunar(): Lunar;
    getJulianDay(): number;
    isBefore(solar: Solar): boolean;
    isAfter(solar: Solar): boolean;
    subtract(solar: Solar): number;
    subtractMinute(solar: Solar): number;
}
