/**
 * 十天干信息
 * 其中包含：
 * 1. 阴阳（yinYang）
 * 2. 五行（fiveElements）
 * 3. 天干相冲（crash）
 *    - 甲庚相冲
 *    - 乙辛相冲
 *    - 壬丙相冲
 *    - 癸丁相冲
 *    - 戊己土居中央，故无冲。
 * 4. 紫微斗数十天干四化(mutagen)
 *
 *    顺序为【禄，权，科，忌】
 *    - 甲:【廉，破，武，阳】
 *    - 乙:【机，梁，紫，月】
 *    - 丙:【同，机，昌，廉】
 *    - 丁:【阴，同，机，巨】
 *    - 戊:【贪，月，弼，机】
 *    - 己:【武，贪，梁，曲】
 *    - 庚:【阳，武，阴，同】
 *    - 辛:【巨，日，曲，昌】
 *    - 壬:【梁，紫，左，武】
 *    - 癸:【破，巨，阴，贪】
 */
export declare const heavenlyStems: {
    readonly jiaHeavenly: {
        readonly yinYang: "阳";
        readonly fiveElements: "木";
        readonly crash: "gengHeavenly";
        readonly mutagen: readonly ["lianzhenMaj", "pojunMaj", "wuquMaj", "taiyangMaj"];
    };
    readonly yiHeavenly: {
        readonly yinYang: "阴";
        readonly fiveElements: "木";
        readonly crash: "xinHeavenly";
        readonly mutagen: readonly ["tianjiMaj", "tianliangMaj", "ziweiMaj", "taiyinMaj"];
    };
    readonly bingHeavenly: {
        readonly yinYang: "阳";
        readonly fiveElements: "火";
        readonly crash: "renHeavenly";
        readonly mutagen: readonly ["tiantongMaj", "tianjiMaj", "wenchangMin", "lianzhenMaj"];
    };
    readonly dingHeavenly: {
        readonly yinYang: "阴";
        readonly fiveElements: "火";
        readonly crash: "guiHeavenly";
        readonly mutagen: readonly ["taiyinMaj", "tiantongMaj", "tianjiMaj", "jumenMaj"];
    };
    readonly wuHeavenly: {
        readonly yinYang: "阳";
        readonly fiveElements: "土";
        readonly mutagen: readonly ["tanlangMaj", "taiyinMaj", "youbiMin", "tianjiMaj"];
    };
    readonly jiHeavenly: {
        readonly yinYang: "阴";
        readonly fiveElements: "土";
        readonly mutagen: readonly ["wuquMaj", "tanlangMaj", "tianliangMaj", "wenquMin"];
    };
    readonly gengHeavenly: {
        readonly yinYang: "阳";
        readonly fiveElements: "金";
        readonly crash: "jiaHeavenly";
        readonly mutagen: readonly ["taiyangMaj", "wuquMaj", "taiyinMaj", "tiantongMaj"];
    };
    readonly xinHeavenly: {
        readonly yinYang: "阴";
        readonly fiveElements: "金";
        readonly crash: "yiHeavenly";
        readonly mutagen: readonly ["jumenMaj", "taiyangMaj", "wenquMin", "wenchangMin"];
    };
    readonly renHeavenly: {
        readonly yinYang: "阳";
        readonly fiveElements: "水";
        readonly crash: "bingHeavenly";
        readonly mutagen: readonly ["tianliangMaj", "ziweiMaj", "zuofuMin", "wuquMaj"];
    };
    readonly guiHeavenly: {
        readonly yinYang: "阴";
        readonly fiveElements: "水";
        readonly crash: "dingHeavenly";
        readonly mutagen: readonly ["pojunMaj", "jumenMaj", "taiyinMaj", "tanlangMaj"];
    };
};
