import { Solar } from "./Solar.mjs";
import { SolarUtil } from "./SolarUtil.mjs";
import { LunarUtil } from "./LunarUtil.mjs";
import { JieQi } from "./JieQi.mjs";
import { EightChar } from "./EightChar.mjs";
import { NineStar } from "./NineStar.mjs";
import { ShuJiu } from "./ShuJiu.mjs";
import { Fu } from "./Fu.mjs";
import { LunarYear } from "./LunarYear.mjs";
import { LunarTime } from "./LunarTime.mjs";
import { Foto } from "./Foto.mjs";
import { Tao } from "./Tao.mjs";
import { I18n } from "./I18n.mjs";
export class Lunar {
  static fromYmd(lunarYear, lunarMonth, lunarDay) {
    return Lunar.fromYmdHms(lunarYear, lunarMonth, lunarDay, 0, 0, 0);
  }
  static fromYmdHms(lunarYear, lunarMonth, lunarDay, hour, minute, second) {
    let y = LunarYear.fromYear(lunarYear);
    const m = y.getMonth(lunarMonth);
    if (null == m) {
      throw new Error(`wrong lunar year ${lunarYear} month ${lunarMonth}`);
    }
    if (lunarDay < 1) {
      throw new Error("lunar day must bigger than 0");
    }
    const days = m.getDayCount();
    if (lunarDay > days) {
      throw new Error(`only ${days} days in lunar year ${lunarYear} month ${lunarMonth}`);
    }
    const noon = Solar.fromJulianDay(m.getFirstJulianDay() + lunarDay - 1);
    const solar = Solar.fromYmdHms(noon.getYear(), noon.getMonth(), noon.getDay(), hour, minute, second);
    if (noon.getYear() !== lunarYear) {
      y = LunarYear.fromYear(noon.getYear());
    }
    return new Lunar(lunarYear, lunarMonth, lunarDay, hour, minute, second, solar, y);
  }
  static fromSolar(solar) {
    let lunarYear = 0;
    let lunarMonth = 0;
    let lunarDay = 0;
    const ly = LunarYear.fromYear(solar.getYear());
    const lms = ly.getMonths();
    for (let i = 0, j = lms.length; i < j; i++) {
      const m = lms[i];
      const days = solar.subtract(Solar.fromJulianDay(m.getFirstJulianDay()));
      if (days < m.getDayCount()) {
        lunarYear = m.getYear();
        lunarMonth = m.getMonth();
        lunarDay = days + 1;
        break;
      }
    }
    return new Lunar(lunarYear, lunarMonth, lunarDay, solar.getHour(), solar.getMinute(), solar.getSecond(), solar, ly);
  }
  static fromDate(date) {
    return Lunar.fromSolar(Solar.fromDate(date));
  }
  static _computeJieQi(o, ly) {
    const julianDays = ly.getJieQiJulianDays();
    for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i++) {
      const key = LunarUtil.JIE_QI_IN_USE[i];
      o.jieQiList.push(key);
      o.jieQi[key] = Solar.fromJulianDay(julianDays[i]);
    }
  }
  static _computeYear(o, solar, year) {
    const offset = year - 4;
    let yearGanIndex = offset % 10;
    let yearZhiIndex = offset % 12;
    if (yearGanIndex < 0) {
      yearGanIndex += 10;
    }
    if (yearZhiIndex < 0) {
      yearZhiIndex += 12;
    }
    let g = yearGanIndex;
    let z = yearZhiIndex;
    let gExact = yearGanIndex;
    let zExact = yearZhiIndex;
    const solarYear = solar.getYear();
    const solarYmd = solar.toYmd();
    const solarYmdHms = solar.toYmdHms();
    let liChun = o.jieQi[I18n.getMessage("jq.liChun")];
    if (liChun.getYear() != solarYear) {
      liChun = o.jieQi["LI_CHUN"];
    }
    const liChunYmd = liChun.toYmd();
    const liChunYmdHms = liChun.toYmdHms();
    if (year === solarYear) {
      if (solarYmd < liChunYmd) {
        g--;
        z--;
      }
      if (solarYmdHms < liChunYmdHms) {
        gExact--;
        zExact--;
      }
    } else if (year < solarYear) {
      if (solarYmd >= liChunYmd) {
        g++;
        z++;
      }
      if (solarYmdHms >= liChunYmdHms) {
        gExact++;
        zExact++;
      }
    }
    o.yearGanIndex = yearGanIndex;
    o.yearZhiIndex = yearZhiIndex;
    o.yearGanIndexByLiChun = (g < 0 ? g + 10 : g) % 10;
    o.yearZhiIndexByLiChun = (z < 0 ? z + 12 : z) % 12;
    o.yearGanIndexExact = (gExact < 0 ? gExact + 10 : gExact) % 10;
    o.yearZhiIndexExact = (zExact < 0 ? zExact + 12 : zExact) % 12;
  }
  static _computeMonth(o, solar) {
    let start = null;
    let end = null;
    const ymd = solar.toYmd();
    const time = solar.toYmdHms();
    const size = LunarUtil.JIE_QI_IN_USE.length;
    let index = -3;
    for (let i = 0; i < size; i += 2) {
      end = o.jieQi[LunarUtil.JIE_QI_IN_USE[i]];
      const symd = null == start ? ymd : start.toYmd();
      if (ymd >= symd && ymd < end.toYmd()) {
        break;
      }
      start = end;
      index++;
    }
    let offset = ((o.yearGanIndexByLiChun + (index < 0 ? 1 : 0)) % 5 + 1) * 2 % 10;
    o.monthGanIndex = ((index < 0 ? index + 10 : index) + offset) % 10;
    o.monthZhiIndex = ((index < 0 ? index + 12 : index) + LunarUtil.BASE_MONTH_ZHI_INDEX) % 12;
    start = null;
    index = -3;
    for (let i = 0; i < size; i += 2) {
      end = o.jieQi[LunarUtil.JIE_QI_IN_USE[i]];
      const stime = null == start ? time : start.toYmdHms();
      if (time >= stime && time < end.toYmdHms()) {
        break;
      }
      start = end;
      index++;
    }
    offset = ((o.yearGanIndexExact + (index < 0 ? 1 : 0)) % 5 + 1) * 2 % 10;
    o.monthGanIndexExact = ((index < 0 ? index + 10 : index) + offset) % 10;
    o.monthZhiIndexExact = ((index < 0 ? index + 12 : index) + LunarUtil.BASE_MONTH_ZHI_INDEX) % 12;
  }
  static _computeDay(o, solar, hour, minute) {
    const noon = Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), 12, 0, 0);
    const offset = Math.floor(noon.getJulianDay()) - 11;
    const dayGanIndex = offset % 10;
    const dayZhiIndex = offset % 12;
    o.dayGanIndex = dayGanIndex;
    o.dayZhiIndex = dayZhiIndex;
    let dayGanExact = dayGanIndex;
    let dayZhiExact = dayZhiIndex;
    o.dayGanIndexExact2 = dayGanExact;
    o.dayZhiIndexExact2 = dayZhiExact;
    const hm = (hour < 10 ? "0" : "") + hour + ":" + (minute < 10 ? "0" : "") + minute;
    if (hm >= "23:00" && hm <= "23:59") {
      dayGanExact++;
      if (dayGanExact >= 10) {
        dayGanExact -= 10;
      }
      dayZhiExact++;
      if (dayZhiExact >= 12) {
        dayZhiExact -= 12;
      }
    }
    o.dayGanIndexExact = dayGanExact;
    o.dayZhiIndexExact = dayZhiExact;
  }
  static _computeTime(o, hour, minute) {
    const timeZhiIndex = LunarUtil.getTimeZhiIndex((hour < 10 ? "0" : "") + hour + ":" + (minute < 10 ? "0" : "") + minute);
    o.timeZhiIndex = timeZhiIndex;
    o.timeGanIndex = (o.dayGanIndexExact % 5 * 2 + timeZhiIndex) % 10;
  }
  static _computeWeek(o, solar) {
    o.weekIndex = solar.getWeek();
  }
  static _compute(year, hour, minute, solar, ly) {
    const o = {
      timeGanIndex: 0,
      timeZhiIndex: 0,
      dayGanIndex: 0,
      dayZhiIndex: 0,
      dayGanIndexExact: 0,
      dayZhiIndexExact: 0,
      dayGanIndexExact2: 0,
      dayZhiIndexExact2: 0,
      monthGanIndex: 0,
      monthZhiIndex: 0,
      monthGanIndexExact: 0,
      monthZhiIndexExact: 0,
      yearGanIndex: 0,
      yearZhiIndex: 0,
      yearGanIndexByLiChun: 0,
      yearZhiIndexByLiChun: 0,
      yearGanIndexExact: 0,
      yearZhiIndexExact: 0,
      weekIndex: 0,
      jieQi: {},
      jieQiList: []
    };
    Lunar._computeJieQi(o, ly);
    Lunar._computeYear(o, solar, year);
    Lunar._computeMonth(o, solar);
    Lunar._computeDay(o, solar, hour, minute);
    Lunar._computeTime(o, hour, minute);
    Lunar._computeWeek(o, solar);
    return o;
  }
  constructor(year, month, day, hour, minute, second, solar, ly) {
    const info = Lunar._compute(year, hour, minute, solar, ly);
    this._year = year;
    this._month = month;
    this._day = day;
    this._hour = hour;
    this._minute = minute;
    this._second = second;
    this._timeGanIndex = info.timeGanIndex;
    this._timeZhiIndex = info.timeZhiIndex;
    this._dayGanIndex = info.dayGanIndex;
    this._dayZhiIndex = info.dayZhiIndex;
    this._dayGanIndexExact = info.dayGanIndexExact;
    this._dayZhiIndexExact = info.dayZhiIndexExact;
    this._dayGanIndexExact2 = info.dayGanIndexExact2;
    this._dayZhiIndexExact2 = info.dayZhiIndexExact2;
    this._monthGanIndex = info.monthGanIndex;
    this._monthZhiIndex = info.monthZhiIndex;
    this._monthGanIndexExact = info.monthGanIndexExact;
    this._monthZhiIndexExact = info.monthZhiIndexExact;
    this._yearGanIndex = info.yearGanIndex;
    this._yearZhiIndex = info.yearZhiIndex;
    this._yearGanIndexByLiChun = info.yearGanIndexByLiChun;
    this._yearZhiIndexByLiChun = info.yearZhiIndexByLiChun;
    this._yearGanIndexExact = info.yearGanIndexExact;
    this._yearZhiIndexExact = info.yearZhiIndexExact;
    this._weekIndex = info.weekIndex;
    this._jieQi = info.jieQi;
    this._jieQiList = info.jieQiList;
    this._solar = solar;
    this._eightChar = new EightChar(this);
    this._lang = I18n.getLanguage();
  }
  getYear() {
    return this._year;
  }
  getMonth() {
    return this._month;
  }
  getDay() {
    return this._day;
  }
  getHour() {
    return this._hour;
  }
  getMinute() {
    return this._minute;
  }
  getSecond() {
    return this._second;
  }
  getTimeGanIndex() {
    return this._timeGanIndex;
  }
  getTimeZhiIndex() {
    return this._timeZhiIndex;
  }
  getDayGanIndex() {
    return this._dayGanIndex;
  }
  getDayZhiIndex() {
    return this._dayZhiIndex;
  }
  getMonthGanIndex() {
    return this._monthGanIndex;
  }
  getMonthZhiIndex() {
    return this._monthZhiIndex;
  }
  getYearGanIndex() {
    return this._yearGanIndex;
  }
  getYearZhiIndex() {
    return this._yearZhiIndex;
  }
  getYearGanIndexByLiChun() {
    return this._yearGanIndexByLiChun;
  }
  getYearZhiIndexByLiChun() {
    return this._yearZhiIndexByLiChun;
  }
  getDayGanIndexExact() {
    return this._dayGanIndexExact;
  }
  getDayZhiIndexExact() {
    return this._dayZhiIndexExact;
  }
  getDayGanIndexExact2() {
    return this._dayGanIndexExact2;
  }
  getDayZhiIndexExact2() {
    return this._dayZhiIndexExact2;
  }
  getMonthGanIndexExact() {
    return this._monthGanIndexExact;
  }
  getMonthZhiIndexExact() {
    return this._monthZhiIndexExact;
  }
  getYearGanIndexExact() {
    return this._yearGanIndexExact;
  }
  getYearZhiIndexExact() {
    return this._yearZhiIndexExact;
  }
  getGan() {
    return this.getYearGan();
  }
  getZhi() {
    return this.getYearZhi();
  }
  getYearGan() {
    return LunarUtil.GAN[this._yearGanIndex + 1];
  }
  getYearGanByLiChun() {
    return LunarUtil.GAN[this._yearGanIndexByLiChun + 1];
  }
  getYearGanExact() {
    return LunarUtil.GAN[this._yearGanIndexExact + 1];
  }
  getYearZhi() {
    return LunarUtil.ZHI[this._yearZhiIndex + 1];
  }
  getYearZhiByLiChun() {
    return LunarUtil.ZHI[this._yearZhiIndexByLiChun + 1];
  }
  getYearZhiExact() {
    return LunarUtil.ZHI[this._yearZhiIndexExact + 1];
  }
  getYearInGanZhi() {
    return this.getYearGan() + this.getYearZhi();
  }
  getYearInGanZhiByLiChun() {
    return this.getYearGanByLiChun() + this.getYearZhiByLiChun();
  }
  getYearInGanZhiExact() {
    return this.getYearGanExact() + this.getYearZhiExact();
  }
  getMonthGan() {
    return LunarUtil.GAN[this._monthGanIndex + 1];
  }
  getMonthGanExact() {
    return LunarUtil.GAN[this._monthGanIndexExact + 1];
  }
  getMonthZhi() {
    return LunarUtil.ZHI[this._monthZhiIndex + 1];
  }
  getMonthZhiExact() {
    return LunarUtil.ZHI[this._monthZhiIndexExact + 1];
  }
  getMonthInGanZhi() {
    return this.getMonthGan() + this.getMonthZhi();
  }
  getMonthInGanZhiExact() {
    return this.getMonthGanExact() + this.getMonthZhiExact();
  }
  getDayGan() {
    return LunarUtil.GAN[this._dayGanIndex + 1];
  }
  getDayGanExact() {
    return LunarUtil.GAN[this._dayGanIndexExact + 1];
  }
  getDayGanExact2() {
    return LunarUtil.GAN[this._dayGanIndexExact2 + 1];
  }
  getDayZhi() {
    return LunarUtil.ZHI[this._dayZhiIndex + 1];
  }
  getDayZhiExact() {
    return LunarUtil.ZHI[this._dayZhiIndexExact + 1];
  }
  getDayZhiExact2() {
    return LunarUtil.ZHI[this._dayZhiIndexExact2 + 1];
  }
  getDayInGanZhi() {
    return this.getDayGan() + this.getDayZhi();
  }
  getDayInGanZhiExact() {
    return this.getDayGanExact() + this.getDayZhiExact();
  }
  getDayInGanZhiExact2() {
    return this.getDayGanExact2() + this.getDayZhiExact2();
  }
  getTimeGan() {
    return LunarUtil.GAN[this._timeGanIndex + 1];
  }
  getTimeZhi() {
    return LunarUtil.ZHI[this._timeZhiIndex + 1];
  }
  getTimeInGanZhi() {
    return this.getTimeGan() + this.getTimeZhi();
  }
  getShengxiao() {
    return this.getYearShengXiao();
  }
  getYearShengXiao() {
    return LunarUtil.SHENGXIAO[this._yearZhiIndex + 1];
  }
  getYearShengXiaoByLiChun() {
    return LunarUtil.SHENGXIAO[this._yearZhiIndexByLiChun + 1];
  }
  getYearShengXiaoExact() {
    return LunarUtil.SHENGXIAO[this._yearZhiIndexExact + 1];
  }
  getMonthShengXiao() {
    return LunarUtil.SHENGXIAO[this._monthZhiIndex + 1];
  }
  getMonthShengXiaoExact() {
    return LunarUtil.SHENGXIAO[this._monthZhiIndexExact + 1];
  }
  getDayShengXiao() {
    return LunarUtil.SHENGXIAO[this._dayZhiIndex + 1];
  }
  getTimeShengXiao() {
    return LunarUtil.SHENGXIAO[this._timeZhiIndex + 1];
  }
  getYearInChinese() {
    const y = this._year + "";
    let s = "";
    const zero = "0".charCodeAt(0);
    for (let i = 0, j = y.length; i < j; i++) {
      const n = y.charCodeAt(i);
      s += LunarUtil.NUMBER[n - zero];
    }
    return s;
  }
  getMonthInChinese() {
    return (this._month < 0 ? "\u95F0" : "") + LunarUtil.MONTH[Math.abs(this._month)];
  }
  getDayInChinese() {
    return LunarUtil.DAY[this._day];
  }
  getPengZuGan() {
    return LunarUtil.PENGZU_GAN[this._dayGanIndex + 1];
  }
  getPengZuZhi() {
    return LunarUtil.PENGZU_ZHI[this._dayZhiIndex + 1];
  }
  getPositionXi() {
    return this.getDayPositionXi();
  }
  getPositionXiDesc() {
    return this.getDayPositionXiDesc();
  }
  getPositionYangGui() {
    return this.getDayPositionYangGui();
  }
  getPositionYangGuiDesc() {
    return this.getDayPositionYangGuiDesc();
  }
  getPositionYinGui() {
    return this.getDayPositionYinGui();
  }
  getPositionYinGuiDesc() {
    return this.getDayPositionYinGuiDesc();
  }
  getPositionFu() {
    return this.getDayPositionFu();
  }
  getPositionFuDesc() {
    return this.getDayPositionFuDesc();
  }
  getPositionCai() {
    return this.getDayPositionCai();
  }
  getPositionCaiDesc() {
    return this.getDayPositionCaiDesc();
  }
  getDayPositionXi() {
    return LunarUtil.POSITION_XI[this._dayGanIndex + 1];
  }
  getDayPositionXiDesc() {
    const v = LunarUtil.POSITION_DESC[this.getDayPositionXi()];
    return v ? v : "";
  }
  getDayPositionYangGui() {
    return LunarUtil.POSITION_YANG_GUI[this._dayGanIndex + 1];
  }
  getDayPositionYangGuiDesc() {
    const v = LunarUtil.POSITION_DESC[this.getDayPositionYangGui()];
    return v ? v : "";
  }
  getDayPositionYinGui() {
    return LunarUtil.POSITION_YIN_GUI[this._dayGanIndex + 1];
  }
  getDayPositionYinGuiDesc() {
    const v = LunarUtil.POSITION_DESC[this.getDayPositionYinGui()];
    return v ? v : "";
  }
  getDayPositionFu(sect = 2) {
    return (1 === sect ? LunarUtil.POSITION_FU : LunarUtil.POSITION_FU_2)[this._dayGanIndex + 1];
  }
  getDayPositionFuDesc(sect = 2) {
    const v = LunarUtil.POSITION_DESC[this.getDayPositionFu(sect)];
    return v ? v : "";
  }
  getDayPositionCai() {
    return LunarUtil.POSITION_CAI[this._dayGanIndex + 1];
  }
  getDayPositionCaiDesc() {
    const v = LunarUtil.POSITION_DESC[this.getDayPositionCai()];
    return v ? v : "";
  }
  getTimePositionXi() {
    return LunarUtil.POSITION_XI[this._timeGanIndex + 1];
  }
  getTimePositionXiDesc() {
    const v = LunarUtil.POSITION_DESC[this.getTimePositionXi()];
    return v ? v : "";
  }
  getTimePositionYangGui() {
    return LunarUtil.POSITION_YANG_GUI[this._timeGanIndex + 1];
  }
  getTimePositionYangGuiDesc() {
    const v = LunarUtil.POSITION_DESC[this.getTimePositionYangGui()];
    return v ? v : "";
  }
  getTimePositionYinGui() {
    return LunarUtil.POSITION_YIN_GUI[this._timeGanIndex + 1];
  }
  getTimePositionYinGuiDesc() {
    const v = LunarUtil.POSITION_DESC[this.getTimePositionYinGui()];
    return v ? v : "";
  }
  getTimePositionFu(sect = 2) {
    return (1 === sect ? LunarUtil.POSITION_FU : LunarUtil.POSITION_FU_2)[this._timeGanIndex + 1];
  }
  getTimePositionFuDesc(sect = 2) {
    const v = LunarUtil.POSITION_DESC[this.getTimePositionFu(sect)];
    return v ? v : "";
  }
  getTimePositionCai() {
    return LunarUtil.POSITION_CAI[this._timeGanIndex + 1];
  }
  getTimePositionCaiDesc() {
    const v = LunarUtil.POSITION_DESC[this.getTimePositionCai()];
    return v ? v : "";
  }
  getYearPositionTaiSui(sect = 2) {
    let yearZhiIndex = this._yearZhiIndexByLiChun;
    switch (sect) {
      case 1:
        yearZhiIndex = this._yearZhiIndex;
        break;
      case 3:
        yearZhiIndex = this._yearZhiIndexExact;
        break;
    }
    return LunarUtil.POSITION_TAI_SUI_YEAR[yearZhiIndex];
  }
  getYearPositionTaiSuiDesc(sect = 2) {
    return LunarUtil.POSITION_DESC[this.getYearPositionTaiSui(sect)];
  }
  getMonthPositionTaiSui(sect = 2) {
    let monthZhiIndex = this._monthZhiIndex;
    let monthGanIndex = this._monthGanIndex;
    if (3 === sect) {
      monthZhiIndex = this._monthZhiIndexExact;
      monthGanIndex = this._monthGanIndexExact;
    }
    let m = monthZhiIndex - LunarUtil.BASE_MONTH_ZHI_INDEX;
    if (m < 0) {
      m += 12;
    }
    return [I18n.getMessage("bg.gen"), LunarUtil.POSITION_GAN[monthGanIndex], I18n.getMessage("bg.kun"), I18n.getMessage("bg.xun")][m % 4];
  }
  getMonthPositionTaiSuiDesc(sect = 2) {
    return LunarUtil.POSITION_DESC[this.getMonthPositionTaiSui(sect)];
  }
  getDayPositionTaiSui(sect = 2) {
    let dayInGanZhi = this.getDayInGanZhiExact2();
    let yearZhiIndex = this._yearZhiIndexByLiChun;
    switch (sect) {
      case 1:
        dayInGanZhi = this.getDayInGanZhi();
        yearZhiIndex = this._yearZhiIndex;
        break;
      case 3:
        dayInGanZhi = this.getDayInGanZhi();
        yearZhiIndex = this._yearZhiIndexExact;
        break;
    }
    if ([I18n.getMessage("jz.jiaZi"), I18n.getMessage("jz.yiChou"), I18n.getMessage("jz.bingYin"), I18n.getMessage("jz.dingMao"), I18n.getMessage("jz.wuChen"), I18n.getMessage("jz.jiSi")].join(",").indexOf(dayInGanZhi) > -1) {
      return I18n.getMessage("bg.zhen");
    } else if ([I18n.getMessage("jz.bingZi"), I18n.getMessage("jz.dingChou"), I18n.getMessage("jz.wuYin"), I18n.getMessage("jz.jiMao"), I18n.getMessage("jz.gengChen"), I18n.getMessage("jz.xinSi")].join(",").indexOf(dayInGanZhi) > -1) {
      return I18n.getMessage("bg.li");
    } else if ([I18n.getMessage("jz.wuZi"), I18n.getMessage("jz.jiChou"), I18n.getMessage("jz.gengYin"), I18n.getMessage("jz.xinMao"), I18n.getMessage("jz.renChen"), I18n.getMessage("jz.guiSi")].join(",").indexOf(dayInGanZhi) > -1) {
      return I18n.getMessage("ps.center");
    } else if ([I18n.getMessage("jz.gengZi"), I18n.getMessage("jz.xinChou"), I18n.getMessage("jz.renYin"), I18n.getMessage("jz.guiMao"), I18n.getMessage("jz.jiaChen"), I18n.getMessage("jz.yiSi")].join(",").indexOf(dayInGanZhi) > -1) {
      return I18n.getMessage("bg.dui");
    } else if ([I18n.getMessage("jz.renZi"), I18n.getMessage("jz.guiChou"), I18n.getMessage("jz.jiaYin"), I18n.getMessage("jz.yiMao"), I18n.getMessage("jz.bingChen"), I18n.getMessage("jz.dingSi")].join(",").indexOf(dayInGanZhi) > -1) {
      return I18n.getMessage("bg.kan");
    }
    return LunarUtil.POSITION_TAI_SUI_YEAR[yearZhiIndex];
  }
  getDayPositionTaiSuiDesc(sect = 2) {
    return LunarUtil.POSITION_DESC[this.getDayPositionTaiSui(sect)];
  }
  getChong() {
    return this.getDayChong();
  }
  getChongGan() {
    return this.getDayChongGan();
  }
  getChongGanTie() {
    return this.getDayChongGanTie();
  }
  getChongShengXiao() {
    return this.getDayChongShengXiao();
  }
  getChongDesc() {
    return this.getDayChongDesc();
  }
  getSha() {
    return this.getDaySha();
  }
  getDayChong() {
    return LunarUtil.CHONG[this._dayZhiIndex];
  }
  getDayChongGan() {
    return LunarUtil.CHONG_GAN[this._dayGanIndex];
  }
  getDayChongGanTie() {
    return LunarUtil.CHONG_GAN_TIE[this._dayGanIndex];
  }
  getDayChongShengXiao() {
    const chong = this.getChong();
    for (let i = 0, j = LunarUtil.ZHI.length; i < j; i++) {
      if (LunarUtil.ZHI[i] === chong) {
        return LunarUtil.SHENGXIAO[i];
      }
    }
    return "";
  }
  getDayChongDesc() {
    return "(" + this.getDayChongGan() + this.getDayChong() + ")" + this.getDayChongShengXiao();
  }
  getDaySha() {
    const v = LunarUtil.SHA[this.getDayZhi()];
    return v ? v : "";
  }
  getTimeChong() {
    return LunarUtil.CHONG[this._timeZhiIndex];
  }
  getTimeChongGan() {
    return LunarUtil.CHONG_GAN[this._timeGanIndex];
  }
  getTimeChongGanTie() {
    return LunarUtil.CHONG_GAN_TIE[this._timeGanIndex];
  }
  getTimeChongShengXiao() {
    const chong = this.getTimeChong();
    for (let i = 0, j = LunarUtil.ZHI.length; i < j; i++) {
      if (LunarUtil.ZHI[i] === chong) {
        return LunarUtil.SHENGXIAO[i];
      }
    }
    return "";
  }
  getTimeChongDesc() {
    return "(" + this.getTimeChongGan() + this.getTimeChong() + ")" + this.getTimeChongShengXiao();
  }
  getTimeSha() {
    const v = LunarUtil.SHA[this.getTimeZhi()];
    return v ? v : "";
  }
  getYearNaYin() {
    const v = LunarUtil.NAYIN[this.getYearInGanZhi()];
    return v ? v : "";
  }
  getMonthNaYin() {
    const v = LunarUtil.NAYIN[this.getMonthInGanZhi()];
    return v ? v : "";
  }
  getDayNaYin() {
    const v = LunarUtil.NAYIN[this.getDayInGanZhi()];
    return v ? v : "";
  }
  getTimeNaYin() {
    const v = LunarUtil.NAYIN[this.getTimeInGanZhi()];
    return v ? v : "";
  }
  getSeason() {
    return LunarUtil.SEASON[Math.abs(this._month)];
  }
  static _convertJieQi(name) {
    let jq = name;
    if ("DONG_ZHI" === jq) {
      jq = I18n.getMessage("jq.dongZhi");
    } else if ("DA_HAN" === jq) {
      jq = I18n.getMessage("jq.daHan");
    } else if ("XIAO_HAN" === jq) {
      jq = I18n.getMessage("jq.xiaoHan");
    } else if ("LI_CHUN" === jq) {
      jq = I18n.getMessage("jq.liChun");
    } else if ("DA_XUE" === jq) {
      jq = I18n.getMessage("jq.daXue");
    } else if ("YU_SHUI" === jq) {
      jq = I18n.getMessage("jq.yuShui");
    } else if ("JING_ZHE" === jq) {
      jq = I18n.getMessage("jq.jingZhe");
    }
    return jq;
  }
  checkLang() {
    const lang = I18n.getLanguage();
    if (this._lang != lang) {
      for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i++) {
        const newKey = LunarUtil.JIE_QI_IN_USE[i];
        const oldKey = this._jieQiList[i];
        const value = this._jieQi[oldKey];
        this._jieQiList[i] = newKey;
        this._jieQi[newKey] = value;
      }
      this._lang = lang;
    }
  }
  getJie() {
    for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i += 2) {
      const key = LunarUtil.JIE_QI_IN_USE[i];
      const d = this.getJieQiSolar(key);
      if (d && d.getYear() === this._solar.getYear() && d.getMonth() === this._solar.getMonth() && d.getDay() === this._solar.getDay()) {
        return Lunar._convertJieQi(key);
      }
    }
    return "";
  }
  getQi() {
    for (let i = 1, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i += 2) {
      const key = LunarUtil.JIE_QI_IN_USE[i];
      const d = this.getJieQiSolar(key);
      if (d && d.getYear() === this._solar.getYear() && d.getMonth() === this._solar.getMonth() && d.getDay() === this._solar.getDay()) {
        return Lunar._convertJieQi(key);
      }
    }
    return "";
  }
  getJieQi() {
    let name = "";
    const keys = Object.keys(this._jieQi);
    for (let i = 0, j = keys.length; i < j; i++) {
      const k = keys[i];
      const d = this._jieQi[k];
      if (d.getYear() == this._solar.getYear() && d.getMonth() == this._solar.getMonth() && d.getDay() == this._solar.getDay()) {
        name = k;
        break;
      }
    }
    return Lunar._convertJieQi(name);
  }
  getWeek() {
    return this._weekIndex;
  }
  getWeekInChinese() {
    return SolarUtil.WEEK[this.getWeek()];
  }
  getXiu() {
    const v = LunarUtil.XIU[this.getDayZhi() + this.getWeek()];
    return v ? v : "";
  }
  getXiuLuck() {
    const v = LunarUtil.XIU_LUCK[this.getXiu()];
    return v ? v : "";
  }
  getXiuSong() {
    const v = LunarUtil.XIU_SONG[this.getXiu()];
    return v ? v : "";
  }
  getZheng() {
    const v = LunarUtil.ZHENG[this.getXiu()];
    return v ? v : "";
  }
  getAnimal() {
    const v = LunarUtil.ANIMAL[this.getXiu()];
    return v ? v : "";
  }
  getGong() {
    const v = LunarUtil.GONG[this.getXiu()];
    return v ? v : "";
  }
  getShou() {
    const v = LunarUtil.SHOU[this.getGong()];
    return v ? v : "";
  }
  getFestivals() {
    const l = [];
    const f = LunarUtil.FESTIVAL[this._month + "-" + this._day];
    if (f) {
      l.push(f);
    }
    if (Math.abs(this._month) == 12 && this._day >= 29 && this._year != this.next(1).getYear()) {
      l.push(I18n.getMessage("jr.chuXi"));
    }
    return l;
  }
  getOtherFestivals() {
    const l = [];
    const fs = LunarUtil.OTHER_FESTIVAL[this._month + "-" + this._day];
    if (fs) {
      fs.forEach((f) => {
        l.push(f);
      });
    }
    let jq = this.getJieQiSolar(I18n.getMessage("jq.qingMing"));
    const solarYmd = this._solar.toYmd();
    if (solarYmd === jq.next(-1).toYmd()) {
      l.push("\u5BD2\u98DF\u8282");
    }
    jq = this.getJieQiSolar(I18n.getMessage("jq.liChun"));
    let offset = 4 - jq.getLunar().getDayGanIndex();
    if (offset < 0) {
      offset += 10;
    }
    if (solarYmd === jq.next(offset + 40).toYmd()) {
      l.push("\u6625\u793E");
    }
    jq = this.getJieQiSolar(I18n.getMessage("jq.liQiu"));
    offset = 4 - jq.getLunar().getDayGanIndex();
    if (offset < 0) {
      offset += 10;
    }
    if (solarYmd === jq.next(offset + 40).toYmd()) {
      l.push("\u79CB\u793E");
    }
    return l;
  }
  getBaZi() {
    const bz = this.getEightChar();
    const l = [];
    l.push(bz.getYear());
    l.push(bz.getMonth());
    l.push(bz.getDay());
    l.push(bz.getTime());
    return l;
  }
  getBaZiWuXing() {
    const bz = this.getEightChar();
    const l = [];
    l.push(bz.getYearWuXing());
    l.push(bz.getMonthWuXing());
    l.push(bz.getDayWuXing());
    l.push(bz.getTimeWuXing());
    return l;
  }
  getBaZiNaYin() {
    const bz = this.getEightChar();
    const l = [];
    l.push(bz.getYearNaYin());
    l.push(bz.getMonthNaYin());
    l.push(bz.getDayNaYin());
    l.push(bz.getTimeNaYin());
    return l;
  }
  getBaZiShiShenGan() {
    const bz = this.getEightChar();
    const l = [];
    l.push(bz.getYearShiShenGan());
    l.push(bz.getMonthShiShenGan());
    l.push(bz.getDayShiShenGan());
    l.push(bz.getTimeShiShenGan());
    return l;
  }
  getBaZiShiShenZhi() {
    const bz = this.getEightChar();
    const l = [];
    l.push(bz.getYearShiShenZhi()[0]);
    l.push(bz.getMonthShiShenZhi()[0]);
    l.push(bz.getDayShiShenZhi()[0]);
    l.push(bz.getTimeShiShenZhi()[0]);
    return l;
  }
  getBaZiShiShenYearZhi() {
    return this.getEightChar().getYearShiShenZhi();
  }
  getBaZiShiShenMonthZhi() {
    return this.getEightChar().getMonthShiShenZhi();
  }
  getBaZiShiShenDayZhi() {
    return this.getEightChar().getDayShiShenZhi();
  }
  getBaZiShiShenTimeZhi() {
    return this.getEightChar().getTimeShiShenZhi();
  }
  getZhiXing() {
    let offset = this._dayZhiIndex - this._monthZhiIndex;
    if (offset < 0) {
      offset += 12;
    }
    return LunarUtil.ZHI_XING[offset + 1];
  }
  getDayTianShen() {
    const monthZhi = this.getMonthZhi();
    const offset = LunarUtil.ZHI_TIAN_SHEN_OFFSET[monthZhi];
    if (offset == void 0) {
      return "";
    }
    return LunarUtil.TIAN_SHEN[(this._dayZhiIndex + offset) % 12 + 1];
  }
  getTimeTianShen() {
    const dayZhi = this.getDayZhiExact();
    const offset = LunarUtil.ZHI_TIAN_SHEN_OFFSET[dayZhi];
    if (offset == void 0) {
      return "";
    }
    return LunarUtil.TIAN_SHEN[(this._timeZhiIndex + offset) % 12 + 1];
  }
  getDayTianShenType() {
    const v = LunarUtil.TIAN_SHEN_TYPE[this.getDayTianShen()];
    return v ? v : "";
  }
  getTimeTianShenType() {
    const v = LunarUtil.TIAN_SHEN_TYPE[this.getTimeTianShen()];
    return v ? v : "";
  }
  getDayTianShenLuck() {
    const v = LunarUtil.TIAN_SHEN_TYPE_LUCK[this.getDayTianShenType()];
    return v ? v : "";
  }
  getTimeTianShenLuck() {
    const v = LunarUtil.TIAN_SHEN_TYPE_LUCK[this.getTimeTianShenType()];
    return v ? v : "";
  }
  getDayPositionTai() {
    return LunarUtil.POSITION_TAI_DAY[LunarUtil.getJiaZiIndex(this.getDayInGanZhi())];
  }
  getMonthPositionTai() {
    const m = this._month;
    if (m < 0) {
      return "";
    }
    return LunarUtil.POSITION_TAI_MONTH[m - 1];
  }
  getDayYi(sect = 1) {
    return LunarUtil.getDayYi(2 == sect ? this.getMonthInGanZhiExact() : this.getMonthInGanZhi(), this.getDayInGanZhi());
  }
  getDayJi(sect = 1) {
    return LunarUtil.getDayJi(2 == sect ? this.getMonthInGanZhiExact() : this.getMonthInGanZhi(), this.getDayInGanZhi());
  }
  getDayJiShen() {
    return LunarUtil.getDayJiShen(this.getMonthZhiIndex(), this.getDayInGanZhi());
  }
  getDayXiongSha() {
    return LunarUtil.getDayXiongSha(this.getMonthZhiIndex(), this.getDayInGanZhi());
  }
  getTimeYi() {
    return LunarUtil.getTimeYi(this.getDayInGanZhiExact(), this.getTimeInGanZhi());
  }
  getTimeJi() {
    return LunarUtil.getTimeJi(this.getDayInGanZhiExact(), this.getTimeInGanZhi());
  }
  getYueXiang() {
    return LunarUtil.YUE_XIANG[this._day];
  }
  _getYearNineStar(yearInGanZhi) {
    const indexExact = LunarUtil.getJiaZiIndex(yearInGanZhi) + 1;
    const index = LunarUtil.getJiaZiIndex(this.getYearInGanZhi()) + 1;
    let yearOffset = indexExact - index;
    if (yearOffset > 1) {
      yearOffset -= 60;
    } else if (yearOffset < -1) {
      yearOffset += 60;
    }
    const yuan = Math.floor((this._year + yearOffset + 2696) / 60) % 3;
    let offset = (62 + yuan * 3 - indexExact) % 9;
    if (0 === offset) {
      offset = 9;
    }
    return NineStar.fromIndex(offset - 1);
  }
  getYearNineStar(sect = 2) {
    switch (sect) {
      case 1:
        return this._getYearNineStar(this.getYearInGanZhi());
      case 3:
        return this._getYearNineStar(this.getYearInGanZhiExact());
    }
    return this._getYearNineStar(this.getYearInGanZhiByLiChun());
  }
  getMonthNineStar(sect = 2) {
    let yearZhiIndex = this._yearZhiIndexByLiChun;
    let monthZhiIndex = this._monthZhiIndex;
    switch (sect) {
      case 1:
        yearZhiIndex = this._yearZhiIndex;
        monthZhiIndex = this._monthZhiIndex;
        break;
      case 3:
        yearZhiIndex = this._yearZhiIndexExact;
        monthZhiIndex = this._monthZhiIndexExact;
        break;
    }
    let n = 27 - yearZhiIndex % 3 * 3;
    if (monthZhiIndex < LunarUtil.BASE_MONTH_ZHI_INDEX) {
      n -= 3;
    }
    return NineStar.fromIndex((n - monthZhiIndex) % 9);
  }
  getJieQiSolar(name) {
    this.checkLang();
    return this._jieQi[name];
  }
  getDayNineStar() {
    const solarYmd = this._solar.toYmd();
    const dongZhi = this.getJieQiSolar(I18n.getMessage("jq.dongZhi"));
    const dongZhi2 = this.getJieQiSolar("DONG_ZHI");
    const xiaZhi = this.getJieQiSolar(I18n.getMessage("jq.xiaZhi"));
    const dongZhiIndex = LunarUtil.getJiaZiIndex(dongZhi.getLunar().getDayInGanZhi());
    const dongZhiIndex2 = LunarUtil.getJiaZiIndex(dongZhi2.getLunar().getDayInGanZhi());
    const xiaZhiIndex = LunarUtil.getJiaZiIndex(xiaZhi.getLunar().getDayInGanZhi());
    const solarShunBai = dongZhi.next(dongZhiIndex > 29 ? 60 - dongZhiIndex : -dongZhiIndex);
    const solarShunBai2 = dongZhi2.next(dongZhiIndex2 > 29 ? 60 - dongZhiIndex2 : -dongZhiIndex2);
    const solarNiZi = xiaZhi.next(xiaZhiIndex > 29 ? 60 - xiaZhiIndex : -xiaZhiIndex);
    const solarShunBaiYmd = solarShunBai.toYmd();
    const solarShunBaiYmd2 = solarShunBai2.toYmd();
    const solarNiZiYmd = solarNiZi.toYmd();
    let offset = 0;
    if (solarYmd >= solarShunBaiYmd && solarYmd < solarNiZiYmd) {
      offset = this._solar.subtract(solarShunBai) % 9;
    } else if (solarYmd >= solarNiZiYmd && solarYmd < solarShunBaiYmd2) {
      offset = 8 - this._solar.subtract(solarNiZi) % 9;
    } else if (solarYmd >= solarShunBaiYmd2) {
      offset = this._solar.subtract(solarShunBai2) % 9;
    } else if (solarYmd < solarShunBaiYmd) {
      offset = (8 + solarShunBai.subtract(this._solar)) % 9;
    }
    return NineStar.fromIndex(offset);
  }
  getTimeNineStar() {
    const solarYmd = this._solar.toYmd();
    let asc = false;
    if (solarYmd >= this.getJieQiSolar(I18n.getMessage("jq.dongZhi")).toYmd() && solarYmd < this.getJieQiSolar(I18n.getMessage("jq.xiaZhi")).toYmd()) {
      asc = true;
    } else if (solarYmd >= this.getJieQiSolar("DONG_ZHI").toYmd()) {
      asc = true;
    }
    const offset = asc ? [0, 3, 6] : [8, 5, 2];
    const start = offset[this.getDayZhiIndex() % 3];
    const index = asc ? start + this._timeZhiIndex : start + 9 - this._timeZhiIndex;
    return NineStar.fromIndex(index % 9);
  }
  getSolar() {
    return this._solar;
  }
  getJieQiTable() {
    this.checkLang();
    return this._jieQi;
  }
  getJieQiList() {
    return this._jieQiList;
  }
  getNextJie(wholeDay = false) {
    const conditions = [];
    for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length / 2; i < j; i++) {
      conditions.push(LunarUtil.JIE_QI_IN_USE[i * 2]);
    }
    return this.getNearJieQi(true, conditions, wholeDay);
  }
  getPrevJie(wholeDay = false) {
    const conditions = [];
    for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length / 2; i < j; i++) {
      conditions.push(LunarUtil.JIE_QI_IN_USE[i * 2]);
    }
    return this.getNearJieQi(false, conditions, wholeDay);
  }
  getNextQi(wholeDay = false) {
    const conditions = [];
    for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length / 2; i < j; i++) {
      conditions.push(LunarUtil.JIE_QI_IN_USE[i * 2 + 1]);
    }
    return this.getNearJieQi(true, conditions, wholeDay);
  }
  getPrevQi(wholeDay = false) {
    const conditions = [];
    for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length / 2; i < j; i++) {
      conditions.push(LunarUtil.JIE_QI_IN_USE[i * 2 + 1]);
    }
    return this.getNearJieQi(false, conditions, wholeDay);
  }
  getNextJieQi(wholeDay = false) {
    return this.getNearJieQi(true, [], wholeDay);
  }
  getPrevJieQi(wholeDay = false) {
    return this.getNearJieQi(false, [], wholeDay);
  }
  getNearJieQi(forward, conditions, wholeDay) {
    let name = "";
    let near = null;
    const filters = {};
    let filter = false;
    if (conditions) {
      for (let i = 0, j = conditions.length; i < j; i++) {
        filters[conditions[i]] = true;
        filter = true;
      }
    }
    const today = wholeDay ? this._solar.toYmd() : this._solar.toYmdHms();
    const keys = Object.keys(this._jieQi);
    for (let i = 0, j = keys.length; i < j; i++) {
      const key = keys[i];
      const solar = this._jieQi[key];
      const jq = Lunar._convertJieQi(key);
      if (filter) {
        if (!filters[jq]) {
          continue;
        }
      }
      const day = wholeDay ? solar.toYmd() : solar.toYmdHms();
      if (forward) {
        if (day <= today) {
          continue;
        }
        if (null == near) {
          name = jq;
          near = solar;
        } else {
          const nearDay = wholeDay ? near.toYmd() : near.toYmdHms();
          if (day < nearDay) {
            name = jq;
            near = solar;
          }
        }
      } else {
        if (day > today) {
          continue;
        }
        if (null == near) {
          name = jq;
          near = solar;
        } else {
          const nearDay = wholeDay ? near.toYmd() : near.toYmdHms();
          if (day > nearDay) {
            name = jq;
            near = solar;
          }
        }
      }
    }
    return new JieQi(name, near);
  }
  getCurrentJieQi() {
    const keys = Object.keys(this._jieQi);
    for (let i = 0, j = keys.length; i < j; i++) {
      const k = keys[i];
      const d = this._jieQi[k];
      if (d.getYear() == this._solar.getYear() && d.getMonth() == this._solar.getMonth() && d.getDay() == this._solar.getDay()) {
        return new JieQi(Lunar._convertJieQi(k), d);
      }
    }
    return null;
  }
  getCurrentJie() {
    for (let i = 0, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i += 2) {
      const key = LunarUtil.JIE_QI_IN_USE[i];
      const d = this.getJieQiSolar(key);
      if (d && d.getYear() === this._solar.getYear() && d.getMonth() === this._solar.getMonth() && d.getDay() === this._solar.getDay()) {
        return new JieQi(Lunar._convertJieQi(key), d);
      }
    }
    return null;
  }
  getCurrentQi() {
    for (let i = 1, j = LunarUtil.JIE_QI_IN_USE.length; i < j; i += 2) {
      const key = LunarUtil.JIE_QI_IN_USE[i];
      const d = this.getJieQiSolar(key);
      if (d && d.getYear() === this._solar.getYear() && d.getMonth() === this._solar.getMonth() && d.getDay() === this._solar.getDay()) {
        return new JieQi(Lunar._convertJieQi(key), d);
      }
    }
    return null;
  }
  getEightChar() {
    return this._eightChar;
  }
  next(days) {
    return this._solar.next(days).getLunar();
  }
  getYearXun() {
    return LunarUtil.getXun(this.getYearInGanZhi());
  }
  getMonthXun() {
    return LunarUtil.getXun(this.getMonthInGanZhi());
  }
  getDayXun() {
    return LunarUtil.getXun(this.getDayInGanZhi());
  }
  getTimeXun() {
    return LunarUtil.getXun(this.getTimeInGanZhi());
  }
  getYearXunByLiChun() {
    return LunarUtil.getXun(this.getYearInGanZhiByLiChun());
  }
  getYearXunExact() {
    return LunarUtil.getXun(this.getYearInGanZhiExact());
  }
  getMonthXunExact() {
    return LunarUtil.getXun(this.getMonthInGanZhiExact());
  }
  getDayXunExact() {
    return LunarUtil.getXun(this.getDayInGanZhiExact());
  }
  getDayXunExact2() {
    return LunarUtil.getXun(this.getDayInGanZhiExact2());
  }
  getYearXunKong() {
    return LunarUtil.getXunKong(this.getYearInGanZhi());
  }
  getMonthXunKong() {
    return LunarUtil.getXunKong(this.getMonthInGanZhi());
  }
  getDayXunKong() {
    return LunarUtil.getXunKong(this.getDayInGanZhi());
  }
  getTimeXunKong() {
    return LunarUtil.getXunKong(this.getTimeInGanZhi());
  }
  getYearXunKongByLiChun() {
    return LunarUtil.getXunKong(this.getYearInGanZhiByLiChun());
  }
  getYearXunKongExact() {
    return LunarUtil.getXunKong(this.getYearInGanZhiExact());
  }
  getMonthXunKongExact() {
    return LunarUtil.getXunKong(this.getMonthInGanZhiExact());
  }
  getDayXunKongExact() {
    return LunarUtil.getXunKong(this.getDayInGanZhiExact());
  }
  getDayXunKongExact2() {
    return LunarUtil.getXunKong(this.getDayInGanZhiExact2());
  }
  toString() {
    return this.getYearInChinese() + "\u5E74" + this.getMonthInChinese() + "\u6708" + this.getDayInChinese();
  }
  toFullString() {
    let s = this.toString();
    s += " " + this.getYearInGanZhi() + "(" + this.getYearShengXiao() + ")\u5E74";
    s += " " + this.getMonthInGanZhi() + "(" + this.getMonthShengXiao() + ")\u6708";
    s += " " + this.getDayInGanZhi() + "(" + this.getDayShengXiao() + ")\u65E5";
    s += " " + this.getTimeZhi() + "(" + this.getTimeShengXiao() + ")\u65F6";
    s += " \u7EB3\u97F3[" + this.getYearNaYin() + " " + this.getMonthNaYin() + " " + this.getDayNaYin() + " " + this.getTimeNaYin() + "]";
    s += " \u661F\u671F" + this.getWeekInChinese();
    this.getFestivals().forEach((f) => {
      s += " (" + f + ")";
    });
    this.getOtherFestivals().forEach((f) => {
      s += " (" + f + ")";
    });
    const jq = this.getJieQi();
    if (jq.length > 0) {
      s += " [" + jq + "]";
    }
    s += " " + this.getGong() + "\u65B9" + this.getShou();
    s += " \u661F\u5BBF[" + this.getXiu() + this.getZheng() + this.getAnimal() + "](" + this.getXiuLuck() + ")";
    s += " \u5F6D\u7956\u767E\u5FCC[" + this.getPengZuGan() + " " + this.getPengZuZhi() + "]";
    s += " \u559C\u795E\u65B9\u4F4D[" + this.getDayPositionXi() + "](" + this.getDayPositionXiDesc() + ")";
    s += " \u9633\u8D35\u795E\u65B9\u4F4D[" + this.getDayPositionYangGui() + "](" + this.getDayPositionYangGuiDesc() + ")";
    s += " \u9634\u8D35\u795E\u65B9\u4F4D[" + this.getDayPositionYinGui() + "](" + this.getDayPositionYinGuiDesc() + ")";
    s += " \u798F\u795E\u65B9\u4F4D[" + this.getDayPositionFu() + "](" + this.getDayPositionFuDesc() + ")";
    s += " \u8D22\u795E\u65B9\u4F4D[" + this.getDayPositionCai() + "](" + this.getDayPositionCaiDesc() + ")";
    s += " \u51B2[" + this.getDayChongDesc() + "]";
    s += " \u715E[" + this.getDaySha() + "]";
    return s;
  }
  getShuJiu() {
    const currentDay = Solar.fromYmd(this._solar.getYear(), this._solar.getMonth(), this._solar.getDay());
    let start = this.getJieQiSolar("DONG_ZHI");
    let startDay = Solar.fromYmd(start.getYear(), start.getMonth(), start.getDay());
    if (currentDay.isBefore(startDay)) {
      start = this.getJieQiSolar(I18n.getMessage("jq.dongZhi"));
      startDay = Solar.fromYmd(start.getYear(), start.getMonth(), start.getDay());
    }
    const endDay = Solar.fromYmd(start.getYear(), start.getMonth(), start.getDay()).next(81);
    if (currentDay.isBefore(startDay) || !currentDay.isBefore(endDay)) {
      return null;
    }
    const days = currentDay.subtract(startDay);
    return new ShuJiu(LunarUtil.NUMBER[Math.floor(days / 9) + 1] + "\u4E5D", days % 9 + 1);
  }
  getFu() {
    const currentDay = Solar.fromYmd(this._solar.getYear(), this._solar.getMonth(), this._solar.getDay());
    const xiaZhi = this.getJieQiSolar(I18n.getMessage("jq.xiaZhi"));
    const liQiu = this.getJieQiSolar(I18n.getMessage("jq.liQiu"));
    let startDay = Solar.fromYmd(xiaZhi.getYear(), xiaZhi.getMonth(), xiaZhi.getDay());
    let add = 6 - xiaZhi.getLunar().getDayGanIndex();
    if (add < 0) {
      add += 10;
    }
    add += 20;
    startDay = startDay.next(add);
    if (currentDay.isBefore(startDay)) {
      return null;
    }
    let days = currentDay.subtract(startDay);
    if (days < 10) {
      return new Fu("\u521D\u4F0F", days + 1);
    }
    startDay = startDay.next(10);
    days = currentDay.subtract(startDay);
    if (days < 10) {
      return new Fu("\u4E2D\u4F0F", days + 1);
    }
    startDay = startDay.next(10);
    const liQiuDay = Solar.fromYmd(liQiu.getYear(), liQiu.getMonth(), liQiu.getDay());
    days = currentDay.subtract(startDay);
    if (liQiuDay.isAfter(startDay)) {
      if (days < 10) {
        return new Fu("\u4E2D\u4F0F", days + 11);
      }
      startDay = startDay.next(10);
      days = currentDay.subtract(startDay);
    }
    if (days < 10) {
      return new Fu("\u672B\u4F0F", days + 1);
    }
    return null;
  }
  getLiuYao() {
    return LunarUtil.LIU_YAO[(Math.abs(this._month) + this._day - 2) % 6];
  }
  getWuHou() {
    const jieQi = this.getPrevJieQi(true);
    const jq = LunarUtil.find(jieQi.getName(), LunarUtil.JIE_QI);
    let index = Math.floor(this._solar.subtract(jieQi.getSolar()) / 5);
    if (index > 2) {
      index = 2;
    }
    return LunarUtil.WU_HOU[(jq.index * 3 + index) % LunarUtil.WU_HOU.length];
  }
  getHou() {
    const jieQi = this.getPrevJieQi(true);
    const days = this._solar.subtract(jieQi.getSolar());
    const max = LunarUtil.HOU.length - 1;
    let offset = Math.floor(days / 5);
    if (offset > max) {
      offset = max;
    }
    return jieQi.getName() + " " + LunarUtil.HOU[offset];
  }
  getDayLu() {
    const gan = LunarUtil.LU[this.getDayGan()];
    const zhi = LunarUtil.LU[this.getDayZhi()];
    let lu = gan + "\u547D\u4E92\u7984";
    if (zhi) {
      lu += " " + zhi + "\u547D\u8FDB\u7984";
    }
    return lu;
  }
  getTime() {
    return LunarTime.fromYmdHms(this._year, this._month, this._day, this._hour, this._minute, this._second);
  }
  getTimes() {
    const l = [];
    l.push(LunarTime.fromYmdHms(this._year, this._month, this._day, 0, 0, 0));
    for (let i = 0; i < 12; i++) {
      l.push(LunarTime.fromYmdHms(this._year, this._month, this._day, (i + 1) * 2 - 1, 0, 0));
    }
    return l;
  }
  getFoto() {
    return Foto.fromLunar(this);
  }
  getTao() {
    return Tao.fromLunar(this);
  }
}
