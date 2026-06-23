"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.kot = exports.t = exports.setLanguage = void 0;
var i18next_1 = __importDefault(require("i18next"));
var zh_CN_1 = __importDefault(require("./locales/zh-CN"));
var zh_TW_1 = __importDefault(require("./locales/zh-TW"));
var ko_KR_1 = __importDefault(require("./locales/ko-KR"));
var ja_JP_1 = __importDefault(require("./locales/ja-JP"));
var en_US_1 = __importDefault(require("./locales/en-US"));
var vi_VN_1 = __importDefault(require("./locales/vi-VN"));
var resources = {
    'en-US': {
        translation: en_US_1.default,
    },
    'ja-JP': {
        translation: ja_JP_1.default,
    },
    'ko-KR': {
        translation: ko_KR_1.default,
    },
    'zh-CN': {
        translation: zh_CN_1.default,
    },
    'zh-TW': {
        translation: zh_TW_1.default,
    },
    'vi-VN': {
        translation: vi_VN_1.default,
    },
};
// 设置默认语言和加载翻译文件
i18next_1.default.init({ lng: 'zh-CN', resources: resources });
/**
 * 设置国际化语言。
 * 支持的语言见 type.ts -> Language
 *
 * @param language 需要设置的语言【默认为zh-CN】
 */
var setLanguage = function (language) {
    i18next_1.default.changeLanguage(language);
};
exports.setLanguage = setLanguage;
/**
 * 输出国际化文本。
 *
 * @param str 待翻译的字符串
 * @returns 翻译后的字符串
 */
var t = function (str) {
    if (!str) {
        return '';
    }
    return i18next_1.default.t(str);
};
exports.t = t;
/**
 * kot(Key of Translation).
 *
 * 通过翻译文本反查Key的值，用于各种计算。
 * 若没有找到则会返回Value本身。
 *
 * @param value 翻译后的字符串
 * @returns 翻译文本的Key值
 */
var kot = function (value, k) {
    var res = value;
    for (var _i = 0, _a = Object.entries(resources); _i < _a.length; _i++) {
        var _b = _a[_i], item = _b[1];
        for (var _c = 0, _d = Object.entries(item.translation); _c < _d.length; _c++) {
            var _e = _d[_c], transKey = _e[0], trans = _e[1];
            if (((k && transKey.includes(k)) || !k) && trans === value) {
                res = transKey;
                return res;
            }
        }
    }
    return res;
};
exports.kot = kot;
__exportStar(require("./types"), exports);
exports.default = i18next_1.default;
