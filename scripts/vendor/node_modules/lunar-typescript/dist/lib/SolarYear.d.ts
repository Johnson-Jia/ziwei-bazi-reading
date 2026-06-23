import { SolarMonth } from './SolarMonth';
export declare class SolarYear {
    private readonly _year;
    static fromYear(year: number): SolarYear;
    static fromDate(date: Date): SolarYear;
    constructor(year: number);
    getYear(): number;
    next(years: number): SolarYear;
    getMonths(): SolarMonth[];
    toString(): string;
    toFullString(): string;
}
