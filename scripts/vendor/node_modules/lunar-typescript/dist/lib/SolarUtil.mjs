import { Solar } from "./Solar.mjs";
const _SolarUtil = class {
  static isLeapYear(year) {
    if (year < 1600) {
      return year % 4 === 0;
    }
    return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
  }
  static getDaysOfMonth(year, month) {
    if (1582 === year && 10 === month) {
      return 21;
    }
    const m = month - 1;
    let d = _SolarUtil.DAYS_OF_MONTH[m];
    if (m === 1 && _SolarUtil.isLeapYear(year)) {
      d++;
    }
    return d;
  }
  static getDaysOfYear(year) {
    if (1582 === year) {
      return 355;
    }
    return _SolarUtil.isLeapYear(year) ? 366 : 365;
  }
  static getDaysInYear(year, month, day) {
    let days = 0;
    for (let i = 1; i < month; i++) {
      days += _SolarUtil.getDaysOfMonth(year, i);
    }
    let d = day;
    if (1582 === year && 10 === month && day >= 15) {
      if (day >= 15) {
        d -= 10;
      } else if (day > 4) {
        throw new Error(`wrong solar year ${year} month ${month} day ${day}`);
      }
    }
    days += d;
    return days;
  }
  static getWeeksOfMonth(year, month, start) {
    return Math.ceil((_SolarUtil.getDaysOfMonth(year, month) + Solar.fromYmd(year, month, 1).getWeek() - start) / 7);
  }
  static getDaysBetween(ay, am, ad, by, bm, bd) {
    if (ay == by) {
      return _SolarUtil.getDaysInYear(by, bm, bd) - _SolarUtil.getDaysInYear(ay, am, ad);
    } else if (ay > by) {
      let days = _SolarUtil.getDaysOfYear(by) - _SolarUtil.getDaysInYear(by, bm, bd);
      for (let i = by + 1; i < ay; i++) {
        days += _SolarUtil.getDaysOfYear(i);
      }
      days += _SolarUtil.getDaysInYear(ay, am, ad);
      return -days;
    } else {
      let days = _SolarUtil.getDaysOfYear(ay) - _SolarUtil.getDaysInYear(ay, am, ad);
      for (let i = ay + 1; i < by; i++) {
        days += _SolarUtil.getDaysOfYear(i);
      }
      days += _SolarUtil.getDaysInYear(by, bm, bd);
      return days;
    }
  }
};
export let SolarUtil = _SolarUtil;
SolarUtil.WEEK = ["{w.sun}", "{w.mon}", "{w.tues}", "{w.wed}", "{w.thur}", "{w.fri}", "{w.sat}"];
SolarUtil.DAYS_OF_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
SolarUtil.XINGZUO = ["{xz.aries}", "{xz.taurus}", "{xz.gemini}", "{xz.cancer}", "{xz.leo}", "{xz.virgo}", "{xz.libra}", "{xz.scorpio}", "{xz.sagittarius}", "{xz.capricornus}", "{xz.aquarius}", "{xz.pisces}"];
SolarUtil.FESTIVAL = {
  "1-1": "{jr.yuanDan}",
  "2-14": "{jr.qingRen}",
  "3-8": "{jr.fuNv}",
  "3-12": "{jr.zhiShu}",
  "3-15": "{jr.xiaoFei}",
  "4-1": "{jr.yuRen}",
  "5-1": "{jr.wuYi}",
  "5-4": "{jr.qingNian}",
  "6-1": "{jr.erTong}",
  "7-1": "{jr.jianDang}",
  "8-1": "{jr.jianJun}",
  "9-10": "{jr.jiaoShi}",
  "10-1": "{jr.guoQing}",
  "10-31": "{jr.wanShengYe}",
  "11-1": "{jr.wanSheng}",
  "12-24": "{jr.pingAn}",
  "12-25": "{jr.shengDan}"
};
SolarUtil.OTHER_FESTIVAL = {
  "1-8": ["\u5468\u6069\u6765\u901D\u4E16\u7EAA\u5FF5\u65E5"],
  "1-10": ["\u4E2D\u56FD\u4EBA\u6C11\u8B66\u5BDF\u8282"],
  "1-14": ["\u65E5\u8BB0\u60C5\u4EBA\u8282"],
  "1-21": ["\u5217\u5B81\u901D\u4E16\u7EAA\u5FF5\u65E5"],
  "1-26": ["\u56FD\u9645\u6D77\u5173\u65E5"],
  "1-27": ["\u56FD\u9645\u5927\u5C60\u6740\u7EAA\u5FF5\u65E5"],
  "2-2": ["\u4E16\u754C\u6E7F\u5730\u65E5"],
  "2-4": ["\u4E16\u754C\u6297\u764C\u65E5"],
  "2-7": ["\u4EAC\u6C49\u94C1\u8DEF\u7F62\u5DE5\u7EAA\u5FF5\u65E5"],
  "2-10": ["\u56FD\u9645\u6C14\u8C61\u8282"],
  "2-19": ["\u9093\u5C0F\u5E73\u901D\u4E16\u7EAA\u5FF5\u65E5"],
  "2-20": ["\u4E16\u754C\u793E\u4F1A\u516C\u6B63\u65E5"],
  "2-21": ["\u56FD\u9645\u6BCD\u8BED\u65E5"],
  "2-24": ["\u7B2C\u4E09\u4E16\u754C\u9752\u5E74\u65E5"],
  "3-1": ["\u56FD\u9645\u6D77\u8C79\u65E5"],
  "3-3": ["\u4E16\u754C\u91CE\u751F\u52A8\u690D\u7269\u65E5", "\u5168\u56FD\u7231\u8033\u65E5"],
  "3-5": ["\u5468\u6069\u6765\u8BDE\u8FB0\u7EAA\u5FF5\u65E5", "\u4E2D\u56FD\u9752\u5E74\u5FD7\u613F\u8005\u670D\u52A1\u65E5"],
  "3-6": ["\u4E16\u754C\u9752\u5149\u773C\u65E5"],
  "3-7": ["\u5973\u751F\u8282"],
  "3-12": ["\u5B59\u4E2D\u5C71\u901D\u4E16\u7EAA\u5FF5\u65E5"],
  "3-14": ["\u9A6C\u514B\u601D\u901D\u4E16\u7EAA\u5FF5\u65E5", "\u767D\u8272\u60C5\u4EBA\u8282"],
  "3-17": ["\u56FD\u9645\u822A\u6D77\u65E5"],
  "3-18": ["\u5168\u56FD\u79D1\u6280\u4EBA\u624D\u6D3B\u52A8\u65E5", "\u5168\u56FD\u7231\u809D\u65E5"],
  "3-20": ["\u56FD\u9645\u5E78\u798F\u65E5"],
  "3-21": ["\u4E16\u754C\u68EE\u6797\u65E5", "\u4E16\u754C\u7761\u7720\u65E5", "\u56FD\u9645\u6D88\u9664\u79CD\u65CF\u6B67\u89C6\u65E5"],
  "3-22": ["\u4E16\u754C\u6C34\u65E5"],
  "3-23": ["\u4E16\u754C\u6C14\u8C61\u65E5"],
  "3-24": ["\u4E16\u754C\u9632\u6CBB\u7ED3\u6838\u75C5\u65E5"],
  "3-29": ["\u4E2D\u56FD\u9EC4\u82B1\u5C97\u4E03\u5341\u4E8C\u70C8\u58EB\u6B89\u96BE\u7EAA\u5FF5\u65E5"],
  "4-2": ["\u56FD\u9645\u513F\u7AE5\u56FE\u4E66\u65E5", "\u4E16\u754C\u81EA\u95ED\u75C7\u65E5"],
  "4-4": ["\u56FD\u9645\u5730\u96F7\u884C\u52A8\u65E5"],
  "4-7": ["\u4E16\u754C\u536B\u751F\u65E5"],
  "4-8": ["\u56FD\u9645\u73CD\u7A00\u52A8\u7269\u4FDD\u62A4\u65E5"],
  "4-12": ["\u4E16\u754C\u822A\u5929\u65E5"],
  "4-14": ["\u9ED1\u8272\u60C5\u4EBA\u8282"],
  "4-15": ["\u5168\u6C11\u56FD\u5BB6\u5B89\u5168\u6559\u80B2\u65E5"],
  "4-22": ["\u4E16\u754C\u5730\u7403\u65E5", "\u5217\u5B81\u8BDE\u8FB0\u7EAA\u5FF5\u65E5"],
  "4-23": ["\u4E16\u754C\u8BFB\u4E66\u65E5"],
  "4-24": ["\u4E2D\u56FD\u822A\u5929\u65E5"],
  "4-25": ["\u513F\u7AE5\u9884\u9632\u63A5\u79CD\u5BA3\u4F20\u65E5"],
  "4-26": ["\u4E16\u754C\u77E5\u8BC6\u4EA7\u6743\u65E5", "\u5168\u56FD\u759F\u75BE\u65E5"],
  "4-28": ["\u4E16\u754C\u5B89\u5168\u751F\u4EA7\u4E0E\u5065\u5EB7\u65E5"],
  "4-30": ["\u5168\u56FD\u4EA4\u901A\u5B89\u5168\u53CD\u601D\u65E5"],
  "5-2": ["\u4E16\u754C\u91D1\u67AA\u9C7C\u65E5"],
  "5-3": ["\u4E16\u754C\u65B0\u95FB\u81EA\u7531\u65E5"],
  "5-5": ["\u9A6C\u514B\u601D\u8BDE\u8FB0\u7EAA\u5FF5\u65E5"],
  "5-8": ["\u4E16\u754C\u7EA2\u5341\u5B57\u65E5"],
  "5-11": ["\u4E16\u754C\u80A5\u80D6\u65E5"],
  "5-12": ["\u5168\u56FD\u9632\u707E\u51CF\u707E\u65E5", "\u62A4\u58EB\u8282"],
  "5-14": ["\u73AB\u7470\u60C5\u4EBA\u8282"],
  "5-15": ["\u56FD\u9645\u5BB6\u5EAD\u65E5"],
  "5-19": ["\u4E2D\u56FD\u65C5\u6E38\u65E5"],
  "5-20": ["\u7F51\u7EDC\u60C5\u4EBA\u8282"],
  "5-22": ["\u56FD\u9645\u751F\u7269\u591A\u6837\u6027\u65E5"],
  "5-25": ["525\u5FC3\u7406\u5065\u5EB7\u8282"],
  "5-27": ["\u4E0A\u6D77\u89E3\u653E\u65E5"],
  "5-29": ["\u56FD\u9645\u7EF4\u548C\u4EBA\u5458\u65E5"],
  "5-30": ["\u4E2D\u56FD\u4E94\u5345\u8FD0\u52A8\u7EAA\u5FF5\u65E5"],
  "5-31": ["\u4E16\u754C\u65E0\u70DF\u65E5"],
  "6-3": ["\u4E16\u754C\u81EA\u884C\u8F66\u65E5"],
  "6-5": ["\u4E16\u754C\u73AF\u5883\u65E5"],
  "6-6": ["\u5168\u56FD\u7231\u773C\u65E5"],
  "6-8": ["\u4E16\u754C\u6D77\u6D0B\u65E5"],
  "6-11": ["\u4E2D\u56FD\u4EBA\u53E3\u65E5"],
  "6-14": ["\u4E16\u754C\u732E\u8840\u65E5", "\u4EB2\u4EB2\u60C5\u4EBA\u8282"],
  "6-17": ["\u4E16\u754C\u9632\u6CBB\u8352\u6F20\u5316\u4E0E\u5E72\u65F1\u65E5"],
  "6-20": ["\u4E16\u754C\u96BE\u6C11\u65E5"],
  "6-21": ["\u56FD\u9645\u745C\u4F3D\u65E5"],
  "6-25": ["\u5168\u56FD\u571F\u5730\u65E5"],
  "6-26": ["\u56FD\u9645\u7981\u6BD2\u65E5", "\u8054\u5408\u56FD\u5BAA\u7AE0\u65E5"],
  "7-1": ["\u9999\u6E2F\u56DE\u5F52\u7EAA\u5FF5\u65E5"],
  "7-6": ["\u56FD\u9645\u63A5\u543B\u65E5", "\u6731\u5FB7\u901D\u4E16\u7EAA\u5FF5\u65E5"],
  "7-7": ["\u4E03\u4E03\u4E8B\u53D8\u7EAA\u5FF5\u65E5"],
  "7-11": ["\u4E16\u754C\u4EBA\u53E3\u65E5", "\u4E2D\u56FD\u822A\u6D77\u65E5"],
  "7-14": ["\u94F6\u8272\u60C5\u4EBA\u8282"],
  "7-18": ["\u66FC\u5FB7\u62C9\u56FD\u9645\u65E5"],
  "7-30": ["\u56FD\u9645\u53CB\u8C0A\u65E5"],
  "8-3": ["\u7537\u4EBA\u8282"],
  "8-5": ["\u6069\u683C\u65AF\u901D\u4E16\u7EAA\u5FF5\u65E5"],
  "8-6": ["\u56FD\u9645\u7535\u5F71\u8282"],
  "8-8": ["\u5168\u6C11\u5065\u8EAB\u65E5"],
  "8-9": ["\u56FD\u9645\u571F\u8457\u4EBA\u65E5"],
  "8-12": ["\u56FD\u9645\u9752\u5E74\u8282"],
  "8-14": ["\u7EFF\u8272\u60C5\u4EBA\u8282"],
  "8-19": ["\u4E16\u754C\u4EBA\u9053\u4E3B\u4E49\u65E5", "\u4E2D\u56FD\u533B\u5E08\u8282"],
  "8-22": ["\u9093\u5C0F\u5E73\u8BDE\u8FB0\u7EAA\u5FF5\u65E5"],
  "8-29": ["\u5168\u56FD\u6D4B\u7ED8\u6CD5\u5BA3\u4F20\u65E5"],
  "9-3": ["\u4E2D\u56FD\u6297\u65E5\u6218\u4E89\u80DC\u5229\u7EAA\u5FF5\u65E5"],
  "9-5": ["\u4E2D\u534E\u6148\u5584\u65E5"],
  "9-8": ["\u4E16\u754C\u626B\u76F2\u65E5"],
  "9-9": ["\u6BDB\u6CFD\u4E1C\u901D\u4E16\u7EAA\u5FF5\u65E5", "\u5168\u56FD\u62D2\u7EDD\u9152\u9A7E\u65E5"],
  "9-14": ["\u4E16\u754C\u6E05\u6D01\u5730\u7403\u65E5", "\u76F8\u7247\u60C5\u4EBA\u8282"],
  "9-15": ["\u56FD\u9645\u6C11\u4E3B\u65E5"],
  "9-16": ["\u56FD\u9645\u81ED\u6C27\u5C42\u4FDD\u62A4\u65E5"],
  "9-17": ["\u4E16\u754C\u9A91\u884C\u65E5"],
  "9-18": ["\u4E5D\u4E00\u516B\u4E8B\u53D8\u7EAA\u5FF5\u65E5"],
  "9-20": ["\u5168\u56FD\u7231\u7259\u65E5"],
  "9-21": ["\u56FD\u9645\u548C\u5E73\u65E5"],
  "9-27": ["\u4E16\u754C\u65C5\u6E38\u65E5"],
  "9-30": ["\u4E2D\u56FD\u70C8\u58EB\u7EAA\u5FF5\u65E5"],
  "10-1": ["\u56FD\u9645\u8001\u5E74\u4EBA\u65E5"],
  "10-2": ["\u56FD\u9645\u975E\u66B4\u529B\u65E5"],
  "10-4": ["\u4E16\u754C\u52A8\u7269\u65E5"],
  "10-11": ["\u56FD\u9645\u5973\u7AE5\u65E5"],
  "10-10": ["\u8F9B\u4EA5\u9769\u547D\u7EAA\u5FF5\u65E5"],
  "10-13": ["\u56FD\u9645\u51CF\u8F7B\u81EA\u7136\u707E\u5BB3\u65E5", "\u4E2D\u56FD\u5C11\u5E74\u5148\u950B\u961F\u8BDE\u8FB0\u65E5"],
  "10-14": ["\u8461\u8404\u9152\u60C5\u4EBA\u8282"],
  "10-16": ["\u4E16\u754C\u7CAE\u98DF\u65E5"],
  "10-17": ["\u5168\u56FD\u6276\u8D2B\u65E5"],
  "10-20": ["\u4E16\u754C\u7EDF\u8BA1\u65E5"],
  "10-24": ["\u4E16\u754C\u53D1\u5C55\u4FE1\u606F\u65E5", "\u7A0B\u5E8F\u5458\u8282"],
  "10-25": ["\u6297\u7F8E\u63F4\u671D\u7EAA\u5FF5\u65E5"],
  "11-5": ["\u4E16\u754C\u6D77\u5578\u65E5"],
  "11-8": ["\u8BB0\u8005\u8282"],
  "11-9": ["\u5168\u56FD\u6D88\u9632\u65E5"],
  "11-11": ["\u5149\u68CD\u8282"],
  "11-12": ["\u5B59\u4E2D\u5C71\u8BDE\u8FB0\u7EAA\u5FF5\u65E5"],
  "11-14": ["\u7535\u5F71\u60C5\u4EBA\u8282"],
  "11-16": ["\u56FD\u9645\u5BBD\u5BB9\u65E5"],
  "11-17": ["\u56FD\u9645\u5927\u5B66\u751F\u8282"],
  "11-19": ["\u4E16\u754C\u5395\u6240\u65E5"],
  "11-28": ["\u6069\u683C\u65AF\u8BDE\u8FB0\u7EAA\u5FF5\u65E5"],
  "11-29": ["\u56FD\u9645\u58F0\u63F4\u5DF4\u52D2\u65AF\u5766\u4EBA\u6C11\u65E5"],
  "12-1": ["\u4E16\u754C\u827E\u6ECB\u75C5\u65E5"],
  "12-2": ["\u5168\u56FD\u4EA4\u901A\u5B89\u5168\u65E5"],
  "12-3": ["\u4E16\u754C\u6B8B\u75BE\u4EBA\u65E5"],
  "12-4": ["\u5168\u56FD\u6CD5\u5236\u5BA3\u4F20\u65E5"],
  "12-5": ["\u4E16\u754C\u5F31\u80FD\u4EBA\u58EB\u65E5", "\u56FD\u9645\u5FD7\u613F\u4EBA\u5458\u65E5"],
  "12-7": ["\u56FD\u9645\u6C11\u822A\u65E5"],
  "12-9": ["\u4E16\u754C\u8DB3\u7403\u65E5", "\u56FD\u9645\u53CD\u8150\u8D25\u65E5"],
  "12-10": ["\u4E16\u754C\u4EBA\u6743\u65E5"],
  "12-11": ["\u56FD\u9645\u5C71\u5CB3\u65E5"],
  "12-12": ["\u897F\u5B89\u4E8B\u53D8\u7EAA\u5FF5\u65E5"],
  "12-13": ["\u56FD\u5BB6\u516C\u796D\u65E5"],
  "12-14": ["\u62E5\u62B1\u60C5\u4EBA\u8282"],
  "12-18": ["\u56FD\u9645\u79FB\u5F99\u8005\u65E5"],
  "12-26": ["\u6BDB\u6CFD\u4E1C\u8BDE\u8FB0\u7EAA\u5FF5\u65E5"]
};
SolarUtil.WEEK_FESTIVAL = {
  "3-0-1": "\u5168\u56FD\u4E2D\u5C0F\u5B66\u751F\u5B89\u5168\u6559\u80B2\u65E5",
  "5-2-0": "\u6BCD\u4EB2\u8282",
  "5-3-0": "\u5168\u56FD\u52A9\u6B8B\u65E5",
  "6-3-0": "\u7236\u4EB2\u8282",
  "9-3-6": "\u5168\u6C11\u56FD\u9632\u6559\u80B2\u65E5",
  "10-1-1": "\u4E16\u754C\u4F4F\u623F\u65E5",
  "11-4-4": "\u611F\u6069\u8282"
};
