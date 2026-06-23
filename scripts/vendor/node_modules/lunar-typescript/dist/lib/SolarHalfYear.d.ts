import { SolarMonth } from './SolarMonth';
export declare class SolarHalfYear {
    private readonly _year;
    private readonly _month;
    static fromYm(year: number, month: number): SolarHalfYear;
    static fromDate(date: Date): SolarHalfYear;
    constructor(year: number, month: number);
    getYear(): number;
    getMonth(): number;
    getIndex(): number;
    next(halfYears: number): SolarHalfYear;
    getMonths(): SolarMonth[];
    toString(): string;
    toFullString(): string;
}
