/** 支持的语言 */
export declare const LANGUAGES: string[];
/** 十天干 */
export declare const HEAVENLY_STEMS: readonly ["jiaHeavenly", "yiHeavenly", "bingHeavenly", "dingHeavenly", "wuHeavenly", "jiHeavenly", "gengHeavenly", "xinHeavenly", "renHeavenly", "guiHeavenly"];
/** 十二地支 */
export declare const EARTHLY_BRANCHES: readonly ["ziEarthly", "chouEarthly", "yinEarthly", "maoEarthly", "chenEarthly", "siEarthly", "wuEarthly", "weiEarthly", "shenEarthly", "youEarthly", "xuEarthly", "haiEarthly"];
/** 十二生肖（按地支顺序） */
export declare const ZODIAC: readonly ["rat", "ox", "tiger", "rabbit", "dragon", "snake", "horse", "sheep", "monkey", "rooster", "dog", "pig"];
/** 紫微斗数十二宫名称 */
export declare const PALACES: readonly ["soulPalace", "parentsPalace", "spiritPalace", "propertyPalace", "careerPalace", "friendsPalace", "surfacePalace", "healthPalace", "wealthPalace", "childrenPalace", "spousePalace", "siblingsPalace"];
/** 性别对应阴阳，男为阳，女为阴 */
export declare const GENDER: {
    readonly male: "阳";
    readonly female: "阴";
};
/**
 * 五行局，用于定紫微星和算起运年龄
 * 几局就从几岁（虚岁）开始起运
 * 比如 木三局 就从3岁开始起运
 *
 * @enum
 *  - 2 水二局
 *  - 3 木三局
 *  - 4 金四局
 *  - 5 土五局
 *  - 6 火六局
 */
export declare enum FiveElementsClass {
    water2nd = 2,
    wood3rd = 3,
    metal4th = 4,
    earth5th = 5,
    fire6th = 6
}
/**
 * 时辰, 子时分早晚。
 * 其中 00:00-01:00 为早子时，23:00-00:00 为晚子时
 */
export declare const CHINESE_TIME: readonly ["earlyRatHour", "oxHour", "tigerHour", "rabbitHour", "dragonHour", "snakeHour", "horseHour", "goatHour", "monkeyHour", "roosterHour", "dogHour", "pigHour", "lateRatHour"];
/** 时辰序号所对应的时间段，与 `CHINESE_TIME` 一一对应 */
export declare const TIME_RANGE: readonly ["00:00~01:00", "01:00~03:00", "03:00~05:00", "05:00~07:00", "07:00~09:00", "09:00~11:00", "11:00~13:00", "13:00~15:00", "15:00~17:00", "17:00~19:00", "19:00~21:00", "21:00~23:00", "23:00~00:00"];
/**
 * 五虎遁 从年干算月干。
 *
 * “五虎遁元”年上起月法，简称 `五虎遁`。
 * 因为正月建寅，所以正月的地支为寅，寅属虎，所以叫五虎盾。
 *
 * - 甲己之年丙作首
 * - 乙庚之岁戊为头
 * - 丙辛必定寻庚起
 * - 丁壬壬位顺行流
 * - 若问戊癸何方发
 * - 甲寅之上好追求
 */
export declare const TIGER_RULE: {
    readonly jiaHeavenly: "bingHeavenly";
    readonly yiHeavenly: "wuHeavenly";
    readonly bingHeavenly: "gengHeavenly";
    readonly dingHeavenly: "renHeavenly";
    readonly wuHeavenly: "jiaHeavenly";
    readonly jiHeavenly: "bingHeavenly";
    readonly gengHeavenly: "wuHeavenly";
    readonly xinHeavenly: "gengHeavenly";
    readonly renHeavenly: "renHeavenly";
    readonly guiHeavenly: "jiaHeavenly";
};
/**
 * 五鼠遁 以日干算时干。
 *
 * “五鼠遁元”日上起时法，简称 `五鼠遁`。
 * 因为日支全部以“子”时打头来排列的，子为鼠，所以叫五鼠遁。
 *
 * - 甲己还加甲，乙庚丙作初。
 * - 丙辛从戊起，丁壬庚子居。
 * - 戊癸起壬子，周而复始求。
 */
export declare const RAT_RULE: {
    readonly jiaHeavenly: "jiaHeavenly";
    readonly yiHeavenly: "bingHeavenly";
    readonly bingHeavenly: "wuHeavenly";
    readonly dingHeavenly: "gengHeavenly";
    readonly wuHeavenly: "renHeavenly";
    readonly jiHeavenly: "jiaHeavenly";
    readonly gengHeavenly: "bingHeavenly";
    readonly xinHeavenly: "wuHeavenly";
    readonly renHeavenly: "gengHeavenly";
    readonly guiHeavenly: "renHeavenly";
};
