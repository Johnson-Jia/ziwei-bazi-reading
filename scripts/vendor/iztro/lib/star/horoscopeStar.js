"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHoroscopeStar = void 0;
var _1 = require(".");
var i18n_1 = require("../i18n");
var FunctionalStar_1 = __importDefault(require("./FunctionalStar"));
var location_1 = require("./location");
/**
 * 获取流耀
 *
 * 魁钺昌曲禄羊陀马鸾喜
 *
 * @param heavenlyStem 天干
 * @param earthlyBranch 地支
 */
var getHoroscopeStar = function (heavenlyStem, earthlyBranch, scope) {
    var _a = (0, location_1.getKuiYueIndex)(heavenlyStem), kuiIndex = _a.kuiIndex, yueIndex = _a.yueIndex;
    var _b = (0, location_1.getChangQuIndexByHeavenlyStem)(heavenlyStem), changIndex = _b.changIndex, quIndex = _b.quIndex;
    var _c = (0, location_1.getLuYangTuoMaIndex)(heavenlyStem, earthlyBranch), luIndex = _c.luIndex, yangIndex = _c.yangIndex, tuoIndex = _c.tuoIndex, maIndex = _c.maIndex;
    var _d = (0, location_1.getLuanXiIndex)(earthlyBranch), hongluanIndex = _d.hongluanIndex, tianxiIndex = _d.tianxiIndex;
    var stars = (0, _1.initStars)();
    var trans = {
        origin: {
            tiankui: (0, i18n_1.t)('tiankuiMin'),
            tianyue: (0, i18n_1.t)('tianyueMin'),
            wenchang: (0, i18n_1.t)('wenchangMin'),
            wenqu: (0, i18n_1.t)('wenquMin'),
            lucun: (0, i18n_1.t)('lucunMin'),
            qingyang: (0, i18n_1.t)('qingyangMin'),
            tuoluo: (0, i18n_1.t)('tuoluoMin'),
            tianma: (0, i18n_1.t)('tianmaMin'),
            hongluan: (0, i18n_1.t)('hongluanMin'),
            tianxi: (0, i18n_1.t)('tianxi'),
        },
        decadal: {
            tiankui: (0, i18n_1.t)('yunkui'),
            tianyue: (0, i18n_1.t)('yunyue'),
            wenchang: (0, i18n_1.t)('yunchang'),
            wenqu: (0, i18n_1.t)('yunqu'),
            lucun: (0, i18n_1.t)('yunlu'),
            qingyang: (0, i18n_1.t)('yunyang'),
            tuoluo: (0, i18n_1.t)('yuntuo'),
            tianma: (0, i18n_1.t)('yunma'),
            hongluan: (0, i18n_1.t)('yunluan'),
            tianxi: (0, i18n_1.t)('yunxi'),
        },
        yearly: {
            tiankui: (0, i18n_1.t)('liukui'),
            tianyue: (0, i18n_1.t)('liuyue'),
            wenchang: (0, i18n_1.t)('liuchang'),
            wenqu: (0, i18n_1.t)('liuqu'),
            lucun: (0, i18n_1.t)('liulu'),
            qingyang: (0, i18n_1.t)('liuyang'),
            tuoluo: (0, i18n_1.t)('liutuo'),
            tianma: (0, i18n_1.t)('liuma'),
            hongluan: (0, i18n_1.t)('liuluan'),
            tianxi: (0, i18n_1.t)('liuxi'),
        },
        monthly: {
            tiankui: (0, i18n_1.t)('yuekui'),
            tianyue: (0, i18n_1.t)('yueyue'),
            wenchang: (0, i18n_1.t)('yuechang'),
            wenqu: (0, i18n_1.t)('yuequ'),
            lucun: (0, i18n_1.t)('yuelu'),
            qingyang: (0, i18n_1.t)('yueyang'),
            tuoluo: (0, i18n_1.t)('yuetuo'),
            tianma: (0, i18n_1.t)('yuema'),
            hongluan: (0, i18n_1.t)('yueluan'),
            tianxi: (0, i18n_1.t)('yuexi'),
        },
        daily: {
            tiankui: (0, i18n_1.t)('rikui'),
            tianyue: (0, i18n_1.t)('riyue'),
            wenchang: (0, i18n_1.t)('richang'),
            wenqu: (0, i18n_1.t)('riqu'),
            lucun: (0, i18n_1.t)('rilu'),
            qingyang: (0, i18n_1.t)('riyang'),
            tuoluo: (0, i18n_1.t)('rituo'),
            tianma: (0, i18n_1.t)('rima'),
            hongluan: (0, i18n_1.t)('riluan'),
            tianxi: (0, i18n_1.t)('rixi'),
        },
        hourly: {
            tiankui: (0, i18n_1.t)('shikui'),
            tianyue: (0, i18n_1.t)('shiyue'),
            wenchang: (0, i18n_1.t)('shichang'),
            wenqu: (0, i18n_1.t)('shiqu'),
            lucun: (0, i18n_1.t)('shilu'),
            qingyang: (0, i18n_1.t)('shiyang'),
            tuoluo: (0, i18n_1.t)('shituo'),
            tianma: (0, i18n_1.t)('shima'),
            hongluan: (0, i18n_1.t)('shiluan'),
            tianxi: (0, i18n_1.t)('shixi'),
        },
    };
    if (scope === 'yearly') {
        var nianjieIndex = (0, location_1.getNianjieIndex)(earthlyBranch);
        stars[nianjieIndex].push(new FunctionalStar_1.default({ name: (0, i18n_1.t)('nianjie'), type: 'helper', scope: 'yearly' }));
    }
    stars[kuiIndex].push(new FunctionalStar_1.default({ name: trans[scope].tiankui, type: 'soft', scope: scope }));
    stars[yueIndex].push(new FunctionalStar_1.default({ name: trans[scope].tianyue, type: 'soft', scope: scope }));
    stars[changIndex].push(new FunctionalStar_1.default({ name: trans[scope].wenchang, type: 'soft', scope: scope }));
    stars[quIndex].push(new FunctionalStar_1.default({ name: trans[scope].wenqu, type: 'soft', scope: scope }));
    stars[luIndex].push(new FunctionalStar_1.default({ name: trans[scope].lucun, type: 'lucun', scope: scope }));
    stars[yangIndex].push(new FunctionalStar_1.default({ name: trans[scope].qingyang, type: 'tough', scope: scope }));
    stars[tuoIndex].push(new FunctionalStar_1.default({ name: trans[scope].tuoluo, type: 'tough', scope: scope }));
    stars[maIndex].push(new FunctionalStar_1.default({ name: trans[scope].tianma, type: 'tianma', scope: scope }));
    stars[hongluanIndex].push(new FunctionalStar_1.default({ name: trans[scope].hongluan, type: 'flower', scope: scope }));
    stars[tianxiIndex].push(new FunctionalStar_1.default({ name: trans[scope].tianxi, type: 'flower', scope: scope }));
    return stars;
};
exports.getHoroscopeStar = getHoroscopeStar;
