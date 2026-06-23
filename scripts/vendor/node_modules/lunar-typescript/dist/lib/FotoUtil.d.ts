import { FotoFestival } from './FotoFestival';
export declare class FotoUtil {
    static DAY_ZHAI_GUAN_YIN: string[];
    static XIU_27: string[];
    private static XIU_OFFSET;
    static _DJ: string;
    static _JS: string;
    static _SS: string;
    static _XL: string;
    static _JW: string;
    static _Y: FotoFestival;
    static _T: FotoFestival;
    static _D: FotoFestival;
    static _S: FotoFestival;
    static _W: FotoFestival;
    static _H: FotoFestival;
    static _L: FotoFestival;
    static _J: FotoFestival;
    static _R: FotoFestival;
    static _M: FotoFestival;
    static _HH: FotoFestival;
    static FESTIVAL: Record<string, FotoFestival[]>;
    static OTHER_FESTIVAL: Record<string, string[]>;
    static getXiu(month: number, day: number): string;
}
