/**
 * 返回农历年闰月是哪个月；若没有闰月 则返回0
 * @param year 农历年份
 * @return Number (0-12)
 * @example
 * leapMonth = getLeapMonth(1987) ; // leapMonth=6
 */
export declare const getLeapMonth: (year: number) => number;
/**
 * 返回农历年闰月的天数 若该年没有闰月则返回0
 * @param year 农历年份
 * @return Number (0、29、30)
 * @example
 * leapMonthDay = getLeapDays(1987) ; //leapMonthDay=29
 */
export declare const getLeapDays: (year: number) => 0 | 30 | 29;
