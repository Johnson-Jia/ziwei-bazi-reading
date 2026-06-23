/**
 * 十二地支信息
 * 其中包含：
 * 1. 阴阳（yinYang）
 * 2. 五行（fiveElements）
 * 3. 六冲（crash）
 *    - 子午相冲
 *    - 丑未相冲
 *    - 寅申相冲
 *    - 卯酉相冲
 *    - 辰戌相冲
 *    - 巳亥相冲
 * 4. 紫微斗数命主（soul）
 *    - 命主以命宫所在宫位地支定之
 * 5. 紫微斗数身主（body）
 *    - 身主以生年年支定之
 * 6. 身体部位【内】（inside）
 * 7. 身体部位【外】（outside）
 * 8. 健康提示（healthTip）
 */
export declare const earthlyBranches: {
    readonly ziEarthly: {
        readonly yinYang: "阳";
        readonly fiveElements: "水";
        readonly crash: "wuEarthly";
        readonly soul: "tanlangMaj";
        readonly body: "huoxingMin";
        readonly inside: "胆";
        readonly outside: "下体";
        readonly healthTip: "生殖系统、膀胱、尿道之疾病，听觉障碍";
    };
    readonly chouEarthly: {
        readonly yinYang: "阴";
        readonly fiveElements: "土";
        readonly crash: "weiEarthly";
        readonly soul: "jumenMaj";
        readonly body: "tianxiangMaj";
        readonly inside: "肝";
        readonly outside: "小腿、脚（右）";
        readonly healthTip: "胸部、肋膜炎、胃病、脚部";
    };
    readonly yinEarthly: {
        readonly yinYang: "阳";
        readonly fiveElements: "木";
        readonly crash: "shenEarthly";
        readonly soul: "lucunMin";
        readonly body: "tianliangMaj";
        readonly inside: "肺";
        readonly outside: "大腿（右）";
        readonly healthTip: "胆囊、关节、胫部、神经痛、风湿";
    };
    readonly maoEarthly: {
        readonly yinYang: "阴";
        readonly fiveElements: "木";
        readonly crash: "youEarthly";
        readonly soul: "wenquMin";
        readonly body: "tiantongMaj";
        readonly inside: "大肠";
        readonly outside: "腰（右）、背";
        readonly healthTip: "肝病、颜面神经、失眠、神经衰弱";
    };
    readonly chenEarthly: {
        readonly yinYang: "阳";
        readonly fiveElements: "土";
        readonly crash: "xuEarthly";
        readonly soul: "lianzhenMaj";
        readonly body: "wenchangMin";
        readonly inside: "胃";
        readonly outside: "胸、胳膊（右）";
        readonly healthTip: "消化系统、脊椎、皮肤疾病";
    };
    readonly siEarthly: {
        readonly yinYang: "阴";
        readonly fiveElements: "火";
        readonly crash: "haiEarthly";
        readonly soul: "wuquMaj";
        readonly body: "tianjiMaj";
        readonly inside: "脾";
        readonly outside: "左肩";
        readonly healthTip: "喉头、牙病、感冒";
    };
    readonly wuEarthly: {
        readonly yinYang: "阳";
        readonly fiveElements: "火";
        readonly crash: "ziEarthly";
        readonly soul: "pojunMaj";
        readonly body: "huoxingMin";
        readonly inside: "心";
        readonly outside: "头";
        readonly healthTip: "心脏、视觉、味觉障碍、火难";
    };
    readonly weiEarthly: {
        readonly yinYang: "阴";
        readonly fiveElements: "土";
        readonly crash: "chouEarthly";
        readonly soul: "wuquMaj";
        readonly body: "tianxiangMaj";
        readonly inside: "小肠";
        readonly outside: "脸";
        readonly healthTip: "消化系统、胰脏、健忘症、疲倦、手腕、嘴唇";
    };
    readonly shenEarthly: {
        readonly yinYang: "阳";
        readonly fiveElements: "金";
        readonly crash: "yinEarthly";
        readonly soul: "lianzhenMaj";
        readonly body: "tianliangMaj";
        readonly inside: "膀胱";
        readonly outside: "胸、胳膊（左）";
        readonly healthTip: "呼吸系统、肺部、消化系统、大肠";
    };
    readonly youEarthly: {
        readonly yinYang: "阴";
        readonly fiveElements: "金";
        readonly crash: "maoEarthly";
        readonly soul: "wenquMin";
        readonly body: "tiantongMaj";
        readonly inside: "肾";
        readonly outside: "腰（左）、腹";
        readonly healthTip: "吐血、痢血、小肠之疾、脑出血、头腕部";
    };
    readonly xuEarthly: {
        readonly yinYang: "阳";
        readonly fiveElements: "土";
        readonly crash: "chenEarthly";
        readonly soul: "lucunMin";
        readonly body: "wenchangMin";
        readonly inside: "心包";
        readonly outside: "大腿（左）";
        readonly healthTip: "下半身之疾、子宫、痔疮、脚部";
    };
    readonly haiEarthly: {
        readonly yinYang: "阴";
        readonly fiveElements: "水";
        readonly crash: "siEarthly";
        readonly soul: "jumenMaj";
        readonly body: "tianjiMaj";
        readonly inside: "三焦";
        readonly outside: "小腿、脚（左）";
        readonly healthTip: "排泄机能障碍、肾脏、尿道、偏头痛";
    };
};
