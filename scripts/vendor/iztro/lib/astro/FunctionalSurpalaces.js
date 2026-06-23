"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FunctionalSurpalaces = void 0;
var analyzer_1 = require("./analyzer");
var FunctionalSurpalaces = /** @class */ (function () {
    function FunctionalSurpalaces(_a) {
        var target = _a.target, opposite = _a.opposite, wealth = _a.wealth, career = _a.career;
        var _this = this;
        this.have = function (stars) { return (0, analyzer_1.isSurroundedByStars)(_this, stars); };
        this.notHave = function (stars) { return (0, analyzer_1.notSurroundedByStars)(_this, stars); };
        this.haveOneOf = function (stars) { return (0, analyzer_1.isSurroundedByOneOfStars)(_this, stars); };
        this.haveMutagen = function (mutagen) {
            return _this.target.hasMutagen(mutagen) ||
                _this.opposite.hasMutagen(mutagen) ||
                _this.wealth.hasMutagen(mutagen) ||
                _this.career.hasMutagen(mutagen);
        };
        this.notHaveMutagen = function (mutagen) { return !_this.haveMutagen(mutagen); };
        this.target = target;
        this.opposite = opposite;
        this.wealth = wealth;
        this.career = career;
    }
    return FunctionalSurpalaces;
}());
exports.FunctionalSurpalaces = FunctionalSurpalaces;
