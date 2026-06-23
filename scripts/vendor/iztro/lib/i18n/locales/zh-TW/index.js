"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var common_json_1 = __importDefault(require("./common.json"));
var brightness_1 = __importDefault(require("./brightness"));
var earthlyBranch_1 = __importDefault(require("./earthlyBranch"));
var fiveElementsClass_1 = __importDefault(require("./fiveElementsClass"));
var gender_1 = __importDefault(require("./gender"));
var heavenlyStem_1 = __importDefault(require("./heavenlyStem"));
var mutagen_1 = __importDefault(require("./mutagen"));
var palace_1 = __importDefault(require("./palace"));
var star_1 = __importDefault(require("./star"));
exports.default = __assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign(__assign({}, common_json_1.default), fiveElementsClass_1.default), heavenlyStem_1.default), earthlyBranch_1.default), brightness_1.default), mutagen_1.default), star_1.default), palace_1.default), gender_1.default);
