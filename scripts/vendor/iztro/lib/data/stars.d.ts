/** 紫微斗数四化 */
export declare const MUTAGEN: readonly ["sihuaLu", "sihuaQuan", "sihuaKe", "sihuaJi"];
/**
 * 星耀信息
 * 其中包含：
 * 1. 亮度（bright）, 按照宫位地支排序（从寅开始）
 * 2. 五行（fiveElements）
 * 3. 阴阳（yinYang）
 */
export declare const STARS_INFO: {
    readonly ziweiMaj: {
        readonly brightness: readonly ["wang", "wang", "de", "wang", "miao", "miao", "wang", "wang", "de", "wang", "ping", "miao"];
        readonly fiveElements: "土";
        readonly yinYang: "阴";
    };
    readonly tianjiMaj: {
        readonly brightness: readonly ["de", "wang", "li", "ping", "miao", "xian", "de", "wang", "li", "ping", "miao", "xian"];
        readonly fiveElements: "木";
        readonly yinYang: "阴";
    };
    readonly taiyangMaj: {
        readonly brightness: readonly ["wang", "miao", "wang", "wang", "wang", "de", "de", "xian", "bu", "xian", "xian", "bu"];
        readonly fiveElements: "";
        readonly yinYang: "";
    };
    readonly wuquMaj: {
        readonly brightness: readonly ["de", "li", "miao", "ping", "wang", "miao", "de", "li", "miao", "ping", "wang", "miao"];
        readonly fiveElements: "金";
        readonly yinYang: "阴";
    };
    readonly tiantongMaj: {
        readonly brightness: readonly ["li", "ping", "ping", "miao", "xian", "bu", "wang", "ping", "ping", "miao", "wang", "bu"];
        readonly fiveElements: "水";
        readonly yinYang: "阳";
    };
    readonly lianzhenMaj: {
        readonly brightness: readonly ["miao", "ping", "li", "xian", "ping", "li", "miao", "ping", "li", "xian", "ping", "li"];
        readonly fiveElements: "火";
        readonly yinYang: "阴";
    };
    readonly tianfuMaj: {
        readonly brightness: readonly ["miao", "de", "miao", "de", "wang", "miao", "de", "wang", "miao", "de", "miao", "miao"];
        readonly fiveElements: "土";
        readonly yinYang: "阳";
    };
    readonly taiyinMaj: {
        readonly brightness: readonly ["wang", "xian", "xian", "xian", "bu", "bu", "li", "bu", "wang", "miao", "miao", "miao"];
        readonly fiveElements: "水";
        readonly yinYang: "阴";
    };
    readonly tanlangMaj: {
        readonly brightness: readonly ["ping", "li", "miao", "xian", "wang", "miao", "ping", "li", "miao", "xian", "wang", "miao"];
        readonly fiveElements: "水";
        readonly yinYang: "";
    };
    readonly jumenMaj: {
        readonly brightness: readonly ["miao", "miao", "xian", "wang", "wang", "bu", "miao", "miao", "xian", "wang", "wang", "bu"];
        readonly fiveElements: "土";
        readonly yinYang: "阴";
    };
    readonly tianxiangMaj: {
        readonly brightness: readonly ["miao", "xian", "de", "de", "miao", "de", "miao", "xian", "de", "de", "miao", "miao"];
        readonly fiveElements: "水";
        readonly yinYang: "";
    };
    readonly tianliangMaj: {
        readonly brightness: readonly ["miao", "miao", "miao", "xian", "miao", "wang", "xian", "de", "miao", "xian", "miao", "wang"];
        readonly fiveElements: "土";
        readonly yinYang: "";
    };
    readonly qishaMaj: {
        readonly brightness: readonly ["miao", "wang", "miao", "ping", "wang", "miao", "miao", "miao", "miao", "ping", "wang", "miao"];
        readonly fiveElements: "";
        readonly yinYang: "";
    };
    readonly pojunMaj: {
        readonly brightness: readonly ["de", "xian", "wang", "ping", "miao", "wang", "de", "xian", "wang", "ping", "miao", "wang"];
        readonly fiveElements: "水";
        readonly yinYang: "";
    };
    readonly wenchangMin: {
        readonly brightness: readonly ["xian", "li", "de", "miao", "xian", "li", "de", "miao", "xian", "li", "de", "miao"];
    };
    readonly wenquMin: {
        readonly brightness: readonly ["ping", "wang", "de", "miao", "xian", "wang", "de", "miao", "xian", "wang", "de", "miao"];
    };
    readonly huoxingMin: {
        readonly brightness: readonly ["miao", "li", "xian", "de", "miao", "li", "xian", "de", "miao", "li", "xian", "de"];
    };
    readonly lingxingMin: {
        readonly brightness: readonly ["miao", "li", "xian", "de", "miao", "li", "xian", "de", "miao", "li", "xian", "de"];
    };
    readonly qingyangMin: {
        readonly brightness: readonly ["", "xian", "miao", "", "xian", "miao", "", "xian", "miao", "", "xian", "miao"];
    };
    readonly tuoluoMin: {
        readonly brightness: readonly ["xian", "", "miao", "xian", "", "miao", "xian", "", "miao", "xian", "", "miao"];
    };
};
