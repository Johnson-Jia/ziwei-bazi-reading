import { Holiday } from './Holiday';
export declare class HolidayUtil {
    static NAMES: string[];
    static DATA: string;
    private static _SIZE;
    private static _ZERO;
    private static _TAG_REMOVE;
    private static _NAMES_IN_USE;
    private static _DATA_IN_USE;
    private static _padding;
    private static _findForward;
    private static _findBackward;
    private static _buildHolidayForward;
    private static _buildHolidayBackward;
    private static _findHolidaysForward;
    private static _findHolidaysBackward;
    static getHoliday(yearOrYmd: number | string, month?: number, day?: number): Holiday | null;
    static getHolidays(yearOrYmd: number | string, month?: number): Holiday[];
    static getHolidaysByTarget(yearOrYmd: number | string, month?: number): Holiday[];
    private static _fixNames;
    private static _fixData;
    static fix(a: string | string[], b?: string): void;
}
