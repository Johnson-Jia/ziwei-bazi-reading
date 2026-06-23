"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var i18n_1 = require("../i18n");
/**
 * 星耀类。
 *
 * 文档地址：https://docs.iztro.com/posts/star.html
 */
var FunctionalStar = /** @class */ (function () {
    function FunctionalStar(data) {
        var _this = this;
        this.oppositePalace = function () {
            if (!_this._palace || !_this._astrolabe) {
                return undefined;
            }
            return _this._astrolabe.surroundedPalaces(_this._palace.name).opposite;
        };
        this.setPalace = function (p) {
            _this._palace = p;
        };
        this.setAstrolabe = function (a) {
            _this._astrolabe = a;
        };
        this.palace = function () { return _this._palace; };
        this.surroundedPalaces = function () {
            var _a;
            if (!_this._palace) {
                return undefined;
            }
            return (_a = _this._astrolabe) === null || _a === void 0 ? void 0 : _a.surroundedPalaces(_this._palace.name);
        };
        this.withMutagen = function (mutagen) {
            if (Array.isArray(mutagen)) {
                return mutagen.some(function (mtg) { return _this.mutagen && (0, i18n_1.kot)(mtg) === (0, i18n_1.kot)(_this.mutagen); });
            }
            return !!_this.mutagen && (0, i18n_1.kot)(mutagen) === (0, i18n_1.kot)(_this.mutagen);
        };
        this.withBrightness = function (brightness) {
            if (Array.isArray(brightness)) {
                return brightness.some(function (brit) { return _this.brightness != undefined && (0, i18n_1.kot)(brit) === (0, i18n_1.kot)(_this.brightness); });
            }
            return !!_this.brightness && (0, i18n_1.kot)(brightness) === (0, i18n_1.kot)(_this.brightness);
        };
        this.name = data.name;
        this.type = data.type;
        this.scope = data.scope;
        this.brightness = data.brightness;
        this.mutagen = data.mutagen;
        return this;
    }
    return FunctionalStar;
}());
exports.default = FunctionalStar;
