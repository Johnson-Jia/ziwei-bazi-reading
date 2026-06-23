import { Solar } from './Solar';
import { SolarWeek } from './SolarWeek';
export declare class SolarMonth {
    private readonly _year;
    private readonly _month;
    static fromYm(year: number, month: number): SolarMonth;
    static fromDate(date: Date): SolarMonth;
    constructor(year: number, month: number);
    getYear(): number;
    getMonth(): number;
    next(months: number): SolarMonth;
    getDays(): Solar[];
    getWeeks(start: number): SolarWeek[];
    toString(): string;
    toFullString(): string;
}
