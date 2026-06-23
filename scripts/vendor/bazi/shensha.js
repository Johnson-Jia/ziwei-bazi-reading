"use strict";
/**
 * 命局神煞层 —— 补 tyme4ts 缺口
 * 数据源：china-testing/bazi/datas.py（实证照搬，非臆测）
 * 查法：year_shens(年支) / month_shens(月支) / day_shens(日支) / g_shens(日干)
 * 入命：查出的神煞干支出现在四柱(年月日时)干支中即为入命，记录所在柱位
 *
 * 注：将星/华盖/驿马等 datas.py 按日支查（day_shens）；古法亦有按年支查者，此处忠实于源。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeShensha = analyzeShensha;
exports.getShenshaSelfCheck = getShenshaSelfCheck;
exports.liunianShensha = liunianShensha;
// ============ 数据（照搬 datas.py L383-442）============
/** 按年支查 datas.py: year_shens */
const YEAR_SHENS = {
    '孤辰': { 子: '寅', 丑: '寅', 寅: '巳', 卯: '巳', 辰: '巳', 巳: '申', 午: '申', 未: '申', 申: '亥', 酉: '亥', 戌: '亥', 亥: '寅' },
    '寡宿': { 子: '戌', 丑: '戌', 寅: '丑', 卯: '丑', 辰: '丑', 巳: '辰', 午: '辰', 未: '辰', 申: '未', 酉: '未', 戌: '未', 亥: '戌' },
    '大耗': { 子: '巳未', 丑: '午申', 寅: '未酉', 卯: '申戌', 辰: '酉亥', 巳: '戌子', 午: '亥丑', 未: '子寅', 申: '丑卯', 酉: '寅辰', 戌: '卯巳', 亥: '辰午' },
    '红鸾': { 子: '卯', 丑: '寅', 寅: '丑', 卯: '子', 辰: '亥', 巳: '戌', 午: '酉', 未: '申', 申: '未', 酉: '午', 戌: '巳', 亥: '辰' },
    '天喜': { 子: '酉', 丑: '申', 寅: '未', 卯: '午', 辰: '巳', 巳: '辰', 午: '卯', 未: '寅', 申: '丑', 酉: '子', 戌: '亥', 亥: '戌' },
    '丧门': { 子: '寅', 丑: '卯', 寅: '辰', 卯: '巳', 辰: '午', 巳: '未', 午: '申', 未: '酉', 申: '戌', 酉: '亥', 戌: '子', 亥: '丑' },
    '吊客': { 子: '戌', 丑: '亥', 寅: '子', 卯: '丑', 辰: '寅', 巳: '卯', 午: '辰', 未: '巳', 申: '午', 酉: '未', 戌: '申', 亥: '酉' },
    '披麻': { 子: '酉', 丑: '戌', 寅: '亥', 卯: '子', 辰: '丑', 巳: '寅', 午: '卯', 未: '辰', 申: '巳', 酉: '午', 戌: '未', 亥: '申' },
};
/** 按月支查 datas.py: month_shens（值可能为地支或天干，如丑→庚）*/
const MONTH_SHENS = {
    '天德': { 子: '巳', 丑: '庚', 寅: '丁', 卯: '申', 辰: '壬', 巳: '辛', 午: '亥', 未: '甲', 申: '癸', 酉: '寅', 戌: '丙', 亥: '乙' },
    '月德': { 子: '壬', 丑: '庚', 寅: '丙', 卯: '甲', 辰: '壬', 巳: '庚', 午: '丙', 未: '甲', 申: '壬', 酉: '庚', 戌: '丙', 亥: '甲' },
    '天医': { 子: '亥', 丑: '子', 寅: '丑', 卯: '寅', 辰: '卯', 巳: '辰', 午: '巳', 未: '午', 申: '未', 酉: '申', 戌: '酉', 亥: '戌' },
    '血刃': { 子: '午', 丑: '子', 寅: '丑', 卯: '未', 辰: '寅', 巳: '申', 午: '卯', 未: '酉', 申: '辰', 酉: '戌', 戌: '巳', 亥: '亥' },
    '天德合': { 子: '申', 丑: '乙', 寅: '壬', 卯: '巳', 辰: '丁', 巳: '丙', 午: '寅', 未: '己', 申: '戊', 酉: '亥', 戌: '辛', 亥: '庚' },
    '月德合': { 子: '丁', 丑: '乙', 寅: '辛', 卯: '己', 辰: '丁', 巳: '乙', 午: '辛', 未: '己', 申: '丁', 酉: '乙', 戌: '辛', 亥: '己' },
    '德秀': { 子: '壬癸戊己丙辛甲己', 丑: '庚辛乙庚', 寅: '丙丁戊癸', 卯: '甲乙丁壬', 辰: '壬癸戊己丙辛甲己', 巳: '庚辛乙庚', 午: '丙丁戊癸', 未: '甲乙丁壬', 申: '壬癸戊己丙辛甲己', 酉: '庚辛乙庚', 戌: '丙丁戊癸', 亥: '甲乙丁壬' },
};
/** 按日支查 datas.py: day_shens */
const DAY_SHENS = {
    '将星': { 子: '子', 丑: '酉', 寅: '午', 卯: '卯', 辰: '子', 巳: '酉', 午: '午', 未: '卯', 申: '子', 酉: '酉', 戌: '午', 亥: '卯' },
    '华盖': { 子: '辰', 丑: '丑', 寅: '戌', 卯: '未', 辰: '辰', 巳: '丑', 午: '戌', 未: '未', 申: '辰', 酉: '丑', 戌: '戌', 亥: '未' },
    '驿马': { 子: '寅', 丑: '亥', 寅: '申', 卯: '巳', 辰: '寅', 巳: '亥', 午: '申', 未: '巳', 申: '寅', 酉: '亥', 戌: '申', 亥: '巳' },
    '劫煞': { 子: '巳', 丑: '寅', 寅: '亥', 卯: '申', 辰: '巳', 巳: '寅', 午: '亥', 未: '申', 申: '巳', 酉: '寅', 戌: '亥', 亥: '申' },
    '亡神': { 子: '亥', 丑: '申', 寅: '巳', 卯: '寅', 辰: '亥', 巳: '申', 午: '巳', 未: '寅', 申: '亥', 酉: '申', 戌: '巳', 亥: '寅' },
    '桃花': { 子: '酉', 丑: '午', 寅: '卯', 卯: '子', 辰: '酉', 巳: '午', 午: '卯', 未: '子', 申: '酉', 酉: '午', 戌: '卯', 亥: '子' },
};
/** 按日干查 (问真bundle权威查法,已校正通说错误) */
const GAN_SHENS = {
    '天乙': { 甲: '未丑', 乙: '申子', 丙: '酉亥', 丁: '酉亥', 戊: '未丑', 己: '申子', 庚: '未丑', 辛: '寅午', 壬: '卯巳', 癸: '卯巳' },
    '文昌': { 甲: '巳', 乙: '午', 丙: '申', 丁: '酉', 戊: '申', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯' },
    '羊刃': { 甲: '卯', 乙: '寅', 丙: '午', 丁: '巳', 戊: '午', 己: '巳', 庚: '酉', 辛: '申', 壬: '子', 癸: '亥' },
    '红艳': { 甲: '午', 乙: '午', 丙: '寅', 丁: '未', 戊: '辰', 己: '辰', 庚: '戌', 辛: '酉', 壬: '子', 癸: '申' },
    '国印': { 甲: '戌', 乙: '亥', 丙: '丑', 丁: '寅', 戊: '丑', 己: '寅', 庚: '辰', 辛: '巳', 壬: '未', 癸: '申' },
    '飞刃': { 甲: '酉', 乙: '申', 丙: '子', 丁: '亥', 戊: '子', 己: '亥', 庚: '卯', 辛: '寅', 壬: '午', 癸: '巳' },
    '太极': { 甲: '子午', 乙: '子午', 丙: '卯酉', 丁: '卯酉', 戊: '辰戌丑未', 己: '辰戌丑未', 庚: '寅亥', 辛: '寅亥', 壬: '巳申', 癸: '巳申' },
    '天厨': { 甲: '巳', 乙: '午', 丙: '巳', 丁: '午', 戊: '申', 己: '酉', 庚: '亥', 辛: '子', 壬: '寅', 癸: '卯' },
    '流霞': { 甲: '酉', 乙: '戌', 丙: '未', 丁: '申', 戊: '巳', 己: '午', 庚: '辰', 辛: '卯', 壬: '亥', 癸: '寅' },
    '禄神': { 甲: '寅', 乙: '卯', 丙: '巳', 丁: '午', 戊: '巳', 己: '午', 庚: '申', 辛: '酉', 壬: '亥', 癸: '子' },
    '金舆': { 甲: '辰', 乙: '巳', 丙: '未', 丁: '申', 戊: '未', 己: '申', 庚: '戌', 辛: '亥', 壬: '丑', 癸: '寅' },
};
/** 断语 datas.py: shens_infos（精简）*/
const SHENS_INFOS = {
    '孤辰': '孤僻晚婚，月支易不合群',
    '寡宿': '同柱有天月德无碍；男怕孤，女怕寡',
    '大耗': '意外破损；与桃花/驿马同柱则险',
    '天德': '先天有福，忌冲克不怕合',
    '月德': '先天有福，忌冲克不怕合',
    '将星': '有理想气度，从容不迫',
    '华盖': '有艺术天赋，与命格相关',
    '驿马': '多迁移，与命格相关',
    '劫煞': '与贵人同柱无碍；会三刑不佳',
    '亡神': '与贵人同柱无碍；会三刑不佳',
    '桃花': '凶居多；女正官坐桃花吉',
    '天乙': '后天解难；女命不宜多',
    '文昌': '诗书佳，未必有福',
    '羊刃': '刚强好胜，主血光刑伤',
    '红艳': '爱得执著，不顾地位差异',
    '国印': '诚实守信，有掌印之权',
    '飞刃': '刚烈主血光（羊刃之冲）',
    '太极': '近贵，喜神秘玄学',
    '红鸾': '婚恋桃花，感情之事',
    '天厨': '衣食丰足，食禄之福',
    '流霞': '血光之煞，男忌酒色',
    '天医': '掌医药之星，有医缘',
    '禄神': '衣食俸禄，财源根基',
    '金舆': '金车之贵，有福荫',
    '血刃': '主血光，逢冲防伤',
    '天德合': '逢凶化吉，贵人暗助',
    '月德合': '逢凶化吉，贵人暗助',
    '德秀': '禀天地德秀，聪颖仁厚',
    '天喜': '喜庆吉利，婚孕之事',
    '勾绞煞': '牵连羁绊，婚姻不顺，易惹纠纷',
    '元辰': '大耗，相会不吉，防破财损耗',
    '丧门': '多主丧事伤病，难聚财',
    '吊客': '多主丧事伤病，主孝服',
    '披麻': '多主丧事伤病，主孝服',
    '三奇贵人': '禀三奇之气，聪颖异常，逢凶化吉',
    '学堂': '主聪颖好学，有文采',
    '词馆': '主学问渊博，文才出众',
    '天罗': '男主凶，防意外',
    '地网': '女主凶，防意外',
};
const ZHI_ORDER = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
/** 勾绞煞(test.js权威): 阳男阴女命前三辰为勾后三辰为绞; 阴男阳女反. 返回{gou勾位,jiao绞位} */
function gouJiao(yearGan, yearZhi, gender) {
    const ganYang = '甲丙戊庚壬'.includes(yearGan);
    const group1 = (ganYang && gender === '男') || (!ganYang && gender === '女'); // 阳男阴女
    const idx = ZHI_ORDER.indexOf(yearZhi);
    const front3 = ZHI_ORDER[(idx + 3) % 12]; // 命前三辰
    const back3 = ZHI_ORDER[(idx + 9) % 12]; // 命后三辰
    return group1 ? { gou: front3, jiao: back3 } : { gou: back3, jiao: front3 };
}
/** 元辰(大耗,test.js权威): 阳男阴女/阴男阳女两组,年支查 → 元辰位 */
const YUANCHEN = {
    yang: { 子: '未', 丑: '申', 寅: '酉', 卯: '戌', 辰: '亥', 巳: '子', 午: '丑', 未: '寅', 申: '卯', 酉: '辰', 戌: '巳', 亥: '午' }, // 阳男阴女
    yin: { 子: '巳', 丑: '午', 寅: '未', 卯: '申', 辰: '酉', 巳: '戌', 午: '亥', 未: '子', 申: '丑', 酉: '寅', 戌: '卯', 亥: '辰' }, // 阴男阳女
};
function yuanChen(yearGan, yearZhi, gender) {
    const ganYang = '甲丙戊庚壬'.includes(yearGan);
    const group1 = (ganYang && gender === '男') || (!ganYang && gender === '女'); // 阳男阴女
    return (group1 ? YUANCHEN.yang : YUANCHEN.yin)[yearZhi];
}
/** 三奇贵人(test.js): 天上甲戊庚/地下乙丙丁/人中壬癸辛,年月日或月日时连续顺排 */
const SANQI = [
    ['天上三奇', ['甲', '戊', '庚']],
    ['地下三奇', ['乙', '丙', '丁']],
    ['人中三奇', ['壬', '癸', '辛']],
];
/** 纳音五行(名末字)→长生位(学堂)/临官位(词馆) */
const NAYIN_WX = (n) => n.slice(-1);
const CHANGSHENG = { 金: '巳', 木: '亥', 水: '申', 火: '寅', 土: '寅' };
const LINGUAN = { 金: '申', 木: '寅', 水: '亥', 火: '巳', 土: '巳' };
const SELF_CHECK = {
    year_shens: Object.keys(YEAR_SHENS).length, // 应=8(孤辰/寡宿/大耗/红鸾/天喜/丧门/吊客/披麻)
    month_shens: Object.keys(MONTH_SHENS).length, // 应=7(天德/月德/天医/血刃/天德合/月德合/德秀)
    day_shens: Object.keys(DAY_SHENS).length, // 应=6
    gan_shens: Object.keys(GAN_SHENS).length, // 应=11(天乙/文昌/羊刃/红艳/国印/飞刃/太极/天厨/流霞/禄神/金舆)
    断语: Object.keys(SHENS_INFOS).length, // 应=29
};
/**
 * 命局神煞入命判断
 * @param pillar 四柱 [{pos:'年',gan:'乙',zhi:'丑'}, ...]
 */
function analyzeShensha(pillar, gender, yearNayin) {
    const res = [];
    const yearZhi = pillar[0].zhi, monthZhi = pillar[1].zhi, dayZhi = pillar[2].zhi, dayGan = pillar[2].gan;
    const allGan = pillar.map(p => p.gan);
    const allZhi = pillar.map(p => p.zhi);
    // target 可能多字（未丑/巳未），逐字判断是否入四柱干支，命中即记（同柱去重）
    const hit = (name, source, target) => {
        if (!target)
            return;
        const seen = new Set();
        for (const ch of target) {
            const zi = allZhi.indexOf(ch);
            if (zi >= 0) {
                const pos = `${pillar[zi].pos}支${ch}`;
                if (!seen.has(pos)) {
                    seen.add(pos);
                    res.push({ name, source, position: pos, info: SHENS_INFOS[name] || '' });
                }
                continue;
            }
            const gi = allGan.indexOf(ch);
            if (gi >= 0) {
                const pos = `${pillar[gi].pos}干${ch}`;
                if (!seen.has(pos)) {
                    seen.add(pos);
                    res.push({ name, source, position: pos, info: SHENS_INFOS[name] || '' });
                }
            }
        }
    };
    for (const [name, tbl] of Object.entries(YEAR_SHENS))
        hit(name, `年支${yearZhi}`, tbl[yearZhi]);
    for (const [name, tbl] of Object.entries(MONTH_SHENS))
        hit(name, `月支${monthZhi}`, tbl[monthZhi]);
    for (const [name, tbl] of Object.entries(DAY_SHENS))
        hit(name, `日支${dayZhi}`, tbl[dayZhi]);
    for (const [name, tbl] of Object.entries(GAN_SHENS))
        hit(name, `日干${dayGan}`, tbl[dayGan]);
    // 勾绞煞(性别+年支查,命局四支=勾/绞位→入命)
    if (gender) {
        const { gou, jiao } = gouJiao(pillar[0].gan, yearZhi, gender);
        const allZhi = pillar.map(p => p.zhi);
        [['勾', gou], ['绞', jiao]].forEach(([nm, tg]) => {
            const zi = allZhi.indexOf(tg);
            if (zi >= 0)
                res.push({ name: '勾绞·' + nm, source: `${pillar[0].gan}${yearZhi}${gender}·命${nm === '勾' ? '前' : '后'}三辰`, position: `${pillar[zi].pos}支${tg}`, info: SHENS_INFOS['勾绞煞'] || '牵连羁绊，易纠纷' });
        });
        // 元辰(性别+年支查)
        const yc = yuanChen(pillar[0].gan, yearZhi, gender);
        const zi = allZhi.indexOf(yc);
        if (zi >= 0)
            res.push({ name: '元辰', source: `${pillar[0].gan}${yearZhi}${gender}·元辰`, position: `${pillar[zi].pos}支${yc}`, info: SHENS_INFOS['元辰'] || '相会之事，倾家产' });
    }
    // 三奇贵人(年月日 或 月日时 连续顺排)
    const gans = pillar.map(p => p.gan);
    for (let i = 0; i <= 1; i++) {
        for (const [nm, q] of SANQI) {
            if (gans[i] === q[0] && gans[i + 1] === q[1] && gans[i + 2] === q[2]) {
                res.push({ name: nm, source: `${pillar[i].pos}${pillar[i + 1].pos}${pillar[i + 2].pos}干顺`, position: `${pillar[i].pos}-${pillar[i + 2].pos}柱`, info: SHENS_INFOS['三奇贵人'] || '禀三奇之气，聪颖异常' });
            }
        }
    }
    // 学堂/词馆/天罗地网(年柱纳音五行查)
    if (yearNayin) {
        const wx = NAYIN_WX(yearNayin);
        const allZ = pillar.map(p => p.zhi);
        [['学堂', CHANGSHENG[wx]], ['词馆', LINGUAN[wx]]].forEach(([nm, tg]) => {
            if (!tg)
                return;
            const zi = allZ.indexOf(tg);
            if (zi >= 0)
                res.push({ name: nm, source: `年柱${yearNayin}·纳音${wx}之${nm === '学堂' ? '长生' : '临官'}`, position: `${pillar[zi].pos}支${tg}`, info: SHENS_INFOS[nm] || '' });
        });
        const tl = wx === '火' ? ['戌', '亥'] : (wx === '水' || wx === '土') ? ['辰', '巳'] : [];
        tl.forEach(z => { const zi = allZ.indexOf(z); if (zi >= 0)
            res.push({ name: wx === '火' ? '天罗' : '地网', source: `年柱${yearNayin}·纳音${wx}命`, position: `${pillar[zi].pos}支${z}`, info: SHENS_INFOS[wx === '火' ? '天罗' : '地网'] || '防意外' }); });
    }
    return res;
}
function getShenshaSelfCheck() { return SELF_CHECK; }
/**
 * 流年神煞(基础版)：以命主年干/年支/月支/日干/日支为基准查各表，
 * 流年支 = 神煞位 → 该流年有此神煞(多基准:年干+日干查gan_shens,年支+日支查day_shens)。
 *
 * 对照问真 getliunianshensha5 的多基准模型(如将星=年支酉→酉 + 日支戌→午,流年支午/酉→将星)。
 * 局限:仅覆盖现有22神煞查法表;问真另有禄神/丧门/吊客/披麻/元辰/勾绞/天喜/天罗地网/灾煞/血刃/
 * 词馆/学堂/金舆/福星/天德合/月德合等20+神煞,其查法表待补(需逐个考据)。
 */
function liunianShensha(pillar, liunianGan, liunianZhi, gender, yearNayin) {
    const yearGan = pillar[0].gan, yearZhi = pillar[0].zhi, monthZhi = pillar[1].zhi, dayGan = pillar[2].gan, dayZhi = pillar[2].zhi;
    const res = [];
    const seen = new Set();
    const hit = (name, source, target) => {
        if (!target || seen.has(name))
            return;
        if (target.includes(liunianZhi)) {
            seen.add(name);
            res.push({ name, source, position: `流年支${liunianZhi}`, info: SHENS_INFOS[name] || '' });
        }
        else if (target.includes(liunianGan)) {
            seen.add(name);
            res.push({ name, source, position: `流年干${liunianGan}`, info: SHENS_INFOS[name] || '' });
        }
    };
    // 天干神煞: 日干 + 年干 双基准
    for (const [name, tbl] of Object.entries(GAN_SHENS)) {
        hit(name, `日干${dayGan}`, tbl[dayGan]);
        if (yearGan !== dayGan)
            hit(name, `年干${yearGan}`, tbl[yearGan]);
    }
    // 日支神煞: 日支 + 年支 双基准
    for (const [name, tbl] of Object.entries(DAY_SHENS)) {
        hit(name, `日支${dayZhi}`, tbl[dayZhi]);
        hit(name, `年支${yearZhi}`, tbl[yearZhi]);
    }
    // 年支神煞
    for (const [name, tbl] of Object.entries(YEAR_SHENS)) {
        hit(name, `年支${yearZhi}`, tbl[yearZhi]);
    }
    // 月支神煞
    for (const [name, tbl] of Object.entries(MONTH_SHENS)) {
        hit(name, `月支${monthZhi}`, tbl[monthZhi]);
    }
    // 勾绞煞流年(流年支=勾/绞位→犯勾绞)
    if (gender) {
        const { gou, jiao } = gouJiao(pillar[0].gan, pillar[0].zhi, gender);
        if (liunianZhi === gou)
            res.push({ name: '勾', source: `${pillar[0].gan}${pillar[0].zhi}${gender}·勾位`, position: `流年支${liunianZhi}`, info: '牵连羁绊，易纠纷' });
        if (liunianZhi === jiao)
            res.push({ name: '绞', source: `${pillar[0].gan}${pillar[0].zhi}${gender}·绞位`, position: `流年支${liunianZhi}`, info: '牵连羁绊，易纠纷' });
        // 元辰流年
        const yc = yuanChen(pillar[0].gan, pillar[0].zhi, gender);
        if (liunianZhi === yc)
            res.push({ name: '元辰', source: `${pillar[0].gan}${pillar[0].zhi}${gender}·元辰位`, position: `流年支${liunianZhi}`, info: '相会之事，防破耗' });
    }
    // 学堂/词馆流年(年柱纳音查,流年支=长生/临官位)
    if (yearNayin) {
        const wx = NAYIN_WX(yearNayin);
        if (liunianZhi === CHANGSHENG[wx])
            res.push({ name: '学堂', source: `年柱${yearNayin}·学堂位`, position: `流年支${liunianZhi}`, info: '学业聪颖' });
        if (liunianZhi === LINGUAN[wx])
            res.push({ name: '词馆', source: `年柱${yearNayin}·词馆位`, position: `流年支${liunianZhi}`, info: '文才学问' });
    }
    return res;
}
