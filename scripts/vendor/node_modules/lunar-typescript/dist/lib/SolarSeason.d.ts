import { SolarMonth } from './SolarMonth';
export declare class SolarSeason {
    private readonly _year;
    private readonly _month;
    static fromYm(year: number, month: number): SolarSeason;
    static fromDate(date: Date): SolarSeason;
    constructor(year: number, month: number);
    getYear(): number;
    getMonth(): number;
    getIndex(): number;
    next(seasons: number): SolarSeason;
    getMonths(): SolarMonth[];
    toString(): string;
    toFullString(): string;
}
