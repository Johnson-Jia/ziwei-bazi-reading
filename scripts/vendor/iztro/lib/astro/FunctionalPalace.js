"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var analyzer_1 = require("./analyzer");
/**
 * 宫位类。
 *
 * 文档地址：https://docs.iztro.com/posts/palace.html#functionalastrolabe
 */
var FunctionalPalace = /** @class */ (function () {
    function FunctionalPalace(data) {
        var _this = this;
        this.has = function (stars) { return (0, analyzer_1.hasStars)(_this, stars); };
        this.notHave = function (stars) { return (0, analyzer_1.notHaveStars)(_this, stars); };
        this.hasOneOf = function (stars) { return (0, analyzer_1.hasOneOfStars)(_this, stars); };
        this.hasMutagen = function (mutagen) { return (0, analyzer_1.hasMutagenInPlace)(_this, mutagen); };
        this.notHaveMutagen = function (mutagen) { return (0, analyzer_1.notHaveMutagenInPalce)(_this, mutagen); };
        this.isEmpty = function (excludeStars) {
            var _a;
            if ((_a = _this.majorStars) === null || _a === void 0 ? void 0 : _a.filter(function (star) { return star.type === 'major'; }).length) {
                return false;
            }
            if ((excludeStars === null || excludeStars === void 0 ? void 0 : excludeStars.length) && _this.hasOneOf(excludeStars)) {
                return false;
            }
            return true;
        };
        this.setAstrolabe = function (astro) { return (_this._astrolabe = astro); };
        this.astrolabe = function () { return _this._astrolabe; };
        this.fliesTo = function (to, withMutagens) {
            var _a;
            var toPalace = (_a = _this.astrolabe()) === null || _a === void 0 ? void 0 : _a.palace(to);
            if (!toPalace) {
                return false;
            }
            var heavenlyStem = _this.heavenlyStem;
            var stars = (0, analyzer_1.mutagensToStars)(heavenlyStem, withMutagens);
            if (!stars || !stars.length) {
                return false;
            }
            return toPalace.has(stars);
        };
        this.fliesOneOfTo = function (to, withMutagens) {
            var _a;
            var toPalace = (_a = _this.astrolabe()) === null || _a === void 0 ? void 0 : _a.palace(to);
            if (!toPalace) {
                return false;
            }
            var heavenlyStem = _this.heavenlyStem;
            var stars = (0, analyzer_1.mutagensToStars)(heavenlyStem, withMutagens);
            if (!stars || !stars.length) {
                return true;
            }
            return toPalace.hasOneOf(stars);
        };
        this.notFlyTo = function (to, withMutagens) {
            var _a;
            var toPalace = (_a = _this.astrolabe()) === null || _a === void 0 ? void 0 : _a.palace(to);
            if (!toPalace) {
                return false;
            }
            var heavenlyStem = _this.heavenlyStem;
            var stars = (0, analyzer_1.mutagensToStars)(heavenlyStem, withMutagens);
            if (!stars || !stars.length) {
                return true;
            }
            return toPalace.notHave(stars);
        };
        this.selfMutaged = function (withMutagens) {
            var heavenlyStem = _this.heavenlyStem;
            var stars = (0, analyzer_1.mutagensToStars)(heavenlyStem, withMutagens);
            return _this.has(stars);
        };
        this.selfMutagedOneOf = function (withMutagens) {
            var muts = [];
            if (!withMutagens || !withMutagens.length) {
                muts = ['禄', '权', '科', '忌'];
            }
            else {
                muts = withMutagens;
            }
            var heavenlyStem = _this.heavenlyStem;
            var stars = (0, analyzer_1.mutagensToStars)(heavenlyStem, muts);
            return _this.hasOneOf(stars);
        };
        this.notSelfMutaged = function (withMutagens) {
            var muts = [];
            if (!withMutagens || !withMutagens.length) {
                muts = ['禄', '权', '科', '忌'];
            }
            else {
                muts = withMutagens;
            }
            var heavenlyStem = _this.heavenlyStem;
            var stars = (0, analyzer_1.mutagensToStars)(heavenlyStem, muts);
            return _this.notHave(stars);
        };
        this.mutagedPlaces = function () {
            var heavenlyStem = _this.heavenlyStem;
            var astrolabe = _this.astrolabe();
            if (!astrolabe) {
                return [];
            }
            var stars = (0, analyzer_1.mutagensToStars)(heavenlyStem, ['禄', '权', '科', '忌']);
            return stars.map(function (star) { return astrolabe.star(star).palace(); });
        };
        this.index = data.index;
        this.name = data.name;
        this.isBodyPalace = data.isBodyPalace;
        this.isOriginalPalace = data.isOriginalPalace;
        this.heavenlyStem = data.heavenlyStem;
        this.earthlyBranch = data.earthlyBranch;
        this.majorStars = data.majorStars;
        this.minorStars = data.minorStars;
        this.adjectiveStars = data.adjectiveStars;
        this.changsheng12 = data.changsheng12;
        this.boshi12 = data.boshi12;
        this.jiangqian12 = data.jiangqian12;
        this.suiqian12 = data.suiqian12;
        this.decadal = data.decadal;
        this.ages = data.ages;
        return this;
    }
    return FunctionalPalace;
}());
exports.default = FunctionalPalace;
