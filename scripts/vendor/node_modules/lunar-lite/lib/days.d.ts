/**
 * 返回农历年一整年的总天数
 *
 * @param year 农历年份
 * @return number
 * @example
 * count = getTotalDaysOfLunarYear(1987) ;//count=387
 */
export declare const getTotalDaysOfLunarYear: (year: number) => number;
/**
 * 返回农历月（非闰月）的总天数，计算闰月时的天数请使用getLeapDays方法
 *
 * @param year 农历年份
 * @param month 农历月份，取值【1～12】
 * @return 29 | 30
 * @example
 * MonthDay = getTotalDaysOfLunarMonth(1987,9) ;//MonthDay=29
 */
export declare const getTotalDaysOfLunarMonth: (year: number, month: number) => 30 | 29;
/**
 * 返回公历月的天数
 *
 * @param year 公历年
 * @param month 公历月，取值【1～12】，若参数错误 返回-1
 * @return 28 | 29 | 30 | 31
 * @example
 * solarMonthDay = getTotalDaysOfSolarMonth(1987, 1) ; // solarMonthDay=30
 */
export declare const getTotalDaysOfSolarMonth: (year: number, month: number) => 31 | 28 | 30 | 29;
