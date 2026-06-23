export declare class SolarUtil {
    static WEEK: string[];
    static DAYS_OF_MONTH: number[];
    static XINGZUO: string[];
    static FESTIVAL: Record<string, string>;
    static OTHER_FESTIVAL: Record<string, string[]>;
    static WEEK_FESTIVAL: Record<string, string>;
    static isLeapYear(year: number): boolean;
    static getDaysOfMonth(year: number, month: number): number;
    static getDaysOfYear(year: number): number;
    static getDaysInYear(year: number, month: number, day: number): number;
    static getWeeksOfMonth(year: number, month: number, start: number): number;
    static getDaysBetween(ay: number, am: number, ad: number, by: number, bm: number, bd: number): number;
}
