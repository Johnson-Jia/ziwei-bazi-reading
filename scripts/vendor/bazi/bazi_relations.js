"use strict";
/**
 * 八字关系层 —— 补 tyme4ts 缺口
 * 数据源：china-testing/bazi/ganzhi.py（实证照搬，非臆测）
 * 涵盖：三合 / 三会 / 半三合 / 六合 / 六冲 / 三刑 / 相刑 / 自刑 / 六害 / 相破 / 天干五合化气 / 天干冲
 *
 * tyme4ts 的 EarthBranch 仅有 getCombine()（六合），本模块补齐其余地支关系。
 * 用法：传入带柱位标记的四柱干支，返回所有命中关系。
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeZhiRelations = analyzeZhiRelations;
exports.analyzeGanRelations = analyzeGanRelations;
exports.getSelfCheck = getSelfCheck;
// ==================== 地支关系数据（照搬 ganzhi.py）====================
/** 三合局（3支→化气）ganzhi.py: zhi_hes */
const SAN_HE = [
    ['申', '子', '辰', '水'],
    ['巳', '酉', '丑', '金'],
    ['寅', '午', '戌', '火'],
    ['亥', '卯', '未', '木'],
];
/** 三会局（3支→化气）ganzhi.py: zhi_huis */
const SAN_HUI = [
    ['亥', '子', '丑', '水'],
    ['寅', '卯', '辰', '木'],
    ['巳', '午', '未', '火'],
    ['申', '酉', '戌', '金'],
];
/** 半三合（2支→化气）ganzhi.py: zhi_half_3hes（去掉"马在X"附加，只留化气）*/
const BAN_SAN_HE = {
    '申子': '水', '子辰': '水', '申辰': '水',
    '巳酉': '金', '酉丑': '金', '巳丑': '金',
    '寅午': '火', '午戌': '火', '寅戌': '火',
    '亥卯': '木', '卯未': '木', '亥未': '木',
};
/** 六合（2支→化气）ganzhi.py: zhi_6hes */
const LIU_HE = {
    '子丑': '土', '寅亥': '木', '卯戌': '火', '辰酉': '金', '巳申': '水', '午未': '土',
};
/** 六冲 ganzhi.py: zhi_chongs（双向）*/
const CHONG = new Set(['子午', '丑未', '寅申', '卯酉', '辰戌', '巳亥']);
/** 三刑全集（3支→刑名）ganzhi.py: zhi_xings 的三字组合 */
const SAN_XING_FULL = [
    ['寅', '巳', '申', '无恩之刑'],
    ['丑', '戌', '未', '恃势之刑'],
];
/** 两两相刑（双向）ganzhi.py: zhi_xings */
const XING_PAIR = new Set([
    '寅巳', '巳寅', '巳申', '申巳', '申寅', '寅申', // 无恩之刑两两
    '丑戌', '戌丑', '戌未', '未戌', '未丑', '丑未', // 恃势之刑两两
    '子卯', '卯子', // 无礼之刑
]);
/** 自刑 ganzhi.py: zhi_zixings */
const ZI_XING = new Set(['辰', '午', '酉', '亥']);
/** 六害（双向）ganzhi.py: zhi_haies */
const HAI = new Set([
    '子未', '未子', '丑午', '午丑', '寅巳', '巳寅',
    '卯辰', '辰卯', '申亥', '亥申', '酉戌', '戌酉',
]);
/** 相破（双向）ganzhi.py: zhi_poes */
const PO = new Set([
    '子酉', '酉子', '午卯', '卯午', '辰丑', '丑辰', '戌未', '未戌',
]);
// ==================== 天干关系数据（照搬 ganzhi.py）====================
/** 天干五合化气 ganzhi.py: gan_hes */
const GAN_HE = {
    '甲己': '土', '乙庚': '金', '丙辛': '水', '丁壬': '木', '戊癸': '火',
};
/** 天干合名 ganzhi.py: gan_hes */
const GAN_HE_NAME = {
    '甲己': '中正之合', '乙庚': '仁义之合', '丙辛': '威制之合', '丁壬': '淫慝之合', '戊癸': '无情之合',
};
/** 天干冲（戊己土居中不冲）ganzhi.py: gan_chongs */
const GAN_CHONG = new Set([
    '甲庚', '庚甲', '乙辛', '辛乙', '丙壬', '壬丙', '丁癸', '癸丁',
]);
// ==================== 自检（数据完整性，对照 ganzhi.py 数量）====================
const SELF_CHECK = {
    三合: SAN_HE.length, // 应=4
    三会: SAN_HUI.length, // 应=4
    半三合: Object.keys(BAN_SAN_HE).length, // 应=12
    六合: Object.keys(LIU_HE).length, // 应=6
    六冲: CHONG.size, // 应=6
    三刑全集: SAN_XING_FULL.length, // 应=2
    自刑: ZI_XING.size, // 应=4
    六害: HAI.size / 2, // 应=6（双向存）
    相破: PO.size / 2, // 应=4（双向存）
};
/** 排序后的集合 key（用于3字匹配，与顺序无关）*/
function setKey(items) {
    return [...items].sort().join('');
}
/** 拱合：三合{生旺墓}命局有2支(第3支不在)→拱第3支。如午戌→拱寅(合火局) */
function gongHe(a, b, allZhi) {
    for (const [x, y, z, qi] of SAN_HE) {
        const trip = [x, y, z];
        if (a !== b && trip.includes(a) && trip.includes(b)) {
            const miss = trip.find(c => c !== a && c !== b);
            if (!allZhi.has(miss))
                return { gong: miss, qi };
        }
    }
    return null;
}
/** 拱会：三会{孟仲季}首尾(孟+季)在命局、仲不在→拱仲。如申戌→拱酉(会金局)。相邻(申酉/酉戌)不拱 */
function gongHui(a, b, allZhi) {
    for (const [x, y, z, qi] of SAN_HUI) { // x=孟 y=仲 z=季
        if (((a === x && b === z) || (a === z && b === x)) && !allZhi.has(y)) {
            return { gong: y, qi };
        }
    }
    return null;
}
/**
 * 分析地支关系
 * @param zhiWithPos [['年','丑'],['月','戌'],['日','亥'],['时','未']]
 */
function analyzeZhiRelations(zhiWithPos) {
    const res = [];
    const n = zhiWithPos.length;
    const P = (i) => zhiWithPos[i][0];
    const Z = (i) => zhiWithPos[i][1];
    // 三字关系：三合 / 三会 / 三刑（C(n,3) 组合）
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++)
            for (let k = j + 1; k < n; k++) {
                const tri = [Z(i), Z(j), Z(k)];
                const sk = setKey(tri);
                const pos3 = [`${P(i)}支${Z(i)}`, `${P(j)}支${Z(j)}`, `${P(k)}支${Z(k)}`];
                for (const [a, b, c, qi] of SAN_HE)
                    if (setKey([a, b, c]) === sk)
                        res.push({ type: '三合', positions: pos3, detail: `合${qi}局` });
                for (const [a, b, c, qi] of SAN_HUI)
                    if (setKey([a, b, c]) === sk)
                        res.push({ type: '三会', positions: pos3, detail: `会${qi}局` });
                for (const [a, b, c, name] of SAN_XING_FULL)
                    if (setKey([a, b, c]) === sk)
                        res.push({ type: '三刑', positions: pos3, detail: name });
            }
    // 两两关系：半三合/拱合/拱会/六合/六冲/相刑/六害/相破（C(n,2) 组合）
    const allZhi = new Set(zhiWithPos.map(([p, z]) => z));
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
            const a = Z(i), b = Z(j);
            const pair = [`${P(i)}支${a}`, `${P(j)}支${b}`];
            const k = a + b, kr = b + a;
            if (BAN_SAN_HE[k])
                res.push({ type: '半三合', positions: pair, detail: `化${BAN_SAN_HE[k]}` });
            else if (BAN_SAN_HE[kr])
                res.push({ type: '半三合', positions: pair, detail: `化${BAN_SAN_HE[kr]}` });
            const gongH = gongHe(a, b, allZhi);
            if (gongH)
                res.push({ type: '拱合', positions: pair, detail: `拱${gongH.gong}(合${gongH.qi}局)` });
            const gongHu = gongHui(a, b, allZhi);
            if (gongHu)
                res.push({ type: '拱会', positions: pair, detail: `拱${gongHu.gong}(会${gongHu.qi}局)` });
            if (LIU_HE[k])
                res.push({ type: '六合', positions: pair, detail: `合${LIU_HE[k]}` });
            else if (LIU_HE[kr])
                res.push({ type: '六合', positions: pair, detail: `合${LIU_HE[kr]}` });
            if (CHONG.has(k) || CHONG.has(kr))
                res.push({ type: '六冲', positions: pair, detail: `${a}${b}冲` });
            if (XING_PAIR.has(k))
                res.push({ type: '相刑', positions: pair, detail: `${a}刑${b}` });
            if (HAI.has(k))
                res.push({ type: '六害', positions: pair, detail: `${a}害${b}` });
            if (PO.has(k))
                res.push({ type: '相破', positions: pair, detail: `${a}破${b}` });
        }
    // 自刑：同地支出现≥2次且属自刑地支
    const cnt = {};
    zhiWithPos.forEach(([p, z]) => { if (ZI_XING.has(z))
        (cnt[z] = cnt[z] || []).push(`${p}支${z}`); });
    for (const z of Object.keys(cnt))
        if (cnt[z].length >= 2)
            res.push({ type: '自刑', positions: cnt[z], detail: `${z}${z}自刑` });
    return res;
}
/**
 * 分析天干关系
 * @param ganWithPos [['年','乙'],['月','丙'],['日','丁'],['时','丁']]
 */
function analyzeGanRelations(ganWithPos) {
    const res = [];
    const n = ganWithPos.length;
    for (let i = 0; i < n; i++)
        for (let j = i + 1; j < n; j++) {
            const a = ganWithPos[i][1], b = ganWithPos[j][1];
            const pair = [`${ganWithPos[i][0]}干${a}`, `${ganWithPos[j][0]}干${b}`];
            const k = a + b, kr = b + a;
            if (GAN_HE[k])
                res.push({ type: '天干合', positions: pair, detail: `${GAN_HE_NAME[k]} 化${GAN_HE[k]}` });
            else if (GAN_HE[kr])
                res.push({ type: '天干合', positions: pair, detail: `${GAN_HE_NAME[kr]} 化${GAN_HE[kr]}` });
            if (GAN_CHONG.has(k) || GAN_CHONG.has(kr))
                res.push({ type: '天干冲', positions: pair, detail: `${a}${b}冲` });
        }
    return res;
}
function getSelfCheck() { return SELF_CHECK; }
