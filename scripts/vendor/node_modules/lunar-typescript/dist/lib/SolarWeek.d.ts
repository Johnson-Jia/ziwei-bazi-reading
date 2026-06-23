import { Solar } from './Solar';
export declare class SolarWeek {
    private readonly _year;
    private readonly _month;
    private readonly _day;
    private readonly _start;
    static fromYmd(year: number, month: number, day: number, start: number): SolarWeek;
    static fromDate(date: Date, start: number): SolarWeek;
    constructor(year: number, month: number, day: number, start: number);
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getStart(): number;
    getIndex(): number;
    getIndexInYear(): number;
    next(weeks: number, separateMonth: boolean): SolarWeek;
    getFirstDay(): Solar;
    getFirstDayInMonth(): Solar;
    getDays(): Solar[];
    getDaysInMonth(): Solar[];
    toString(): string;
    toFullString(): string;
}
