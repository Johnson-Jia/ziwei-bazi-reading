import { Lunar } from "./Lunar.mjs";
import { LunarUtil } from "./LunarUtil.mjs";
import { TaoUtil } from "./TaoUtil.mjs";
import { TaoFestival } from "./TaoFestival.mjs";
import { I18n } from "./I18n.mjs";
const _Tao = class {
  constructor(lunar) {
    this._lunar = lunar;
  }
  static fromLunar(lunar) {
    return new _Tao(lunar);
  }
  static fromYmdHms(lunarYear, lunarMonth, lunarDay, hour, minute, second) {
    return _Tao.fromLunar(Lunar.fromYmdHms(lunarYear + _Tao.BIRTH_YEAR, lunarMonth, lunarDay, hour, minute, second));
  }
  static fromYmd(lunarYear, lunarMonth, lunarDay) {
    return _Tao.fromYmdHms(lunarYear, lunarMonth, lunarDay, 0, 0, 0);
  }
  getLunar() {
    return this._lunar;
  }
  getYear() {
    return this._lunar.getYear() - _Tao.BIRTH_YEAR;
  }
  getMonth() {
    return this._lunar.getMonth();
  }
  getDay() {
    return this._lunar.getDay();
  }
  getYearInChinese() {
    const y = this.getYear() + "";
    let s = "";
    const zero = "0".charCodeAt(0);
    for (let i = 0, j = y.length; i < j; i++) {
      s += LunarUtil.NUMBER[y.charCodeAt(i) - zero];
    }
    return s;
  }
  getMonthInChinese() {
    return this._lunar.getMonthInChinese();
  }
  getDayInChinese() {
    return this._lunar.getDayInChinese();
  }
  getFestivals() {
    const l = [];
    const fs = TaoUtil.FESTIVAL[this.getMonth() + "-" + this.getDay()];
    if (fs) {
      fs.forEach((f2) => {
        l.push(f2);
      });
    }
    const jq = this._lunar.getJieQi();
    if (I18n.getMessage("jq.dongZhi") === jq) {
      l.push(new TaoFestival("\u5143\u59CB\u5929\u5C0A\u5723\u8BDE"));
    } else if (I18n.getMessage("jq.xiaZhi") === jq) {
      l.push(new TaoFestival("\u7075\u5B9D\u5929\u5C0A\u5723\u8BDE"));
    }
    let f = TaoUtil.BA_JIE[jq];
    if (f) {
      l.push(new TaoFestival(f));
    }
    f = TaoUtil.BA_HUI[this._lunar.getDayInGanZhi()];
    if (f) {
      l.push(new TaoFestival(f));
    }
    return l;
  }
  _isDayIn(days) {
    const md = this.getMonth() + "-" + this.getDay();
    for (let i = 0, j = days.length; i < j; i++) {
      if (md === days[i]) {
        return true;
      }
    }
    return false;
  }
  isDaySanHui() {
    return this._isDayIn(TaoUtil.SAN_HUI);
  }
  isDaySanYuan() {
    return this._isDayIn(TaoUtil.SAN_YUAN);
  }
  isDayBaJie() {
    return !!TaoUtil.BA_JIE[this._lunar.getJieQi()];
  }
  isDayWuLa() {
    return this._isDayIn(TaoUtil.WU_LA);
  }
  isDayBaHui() {
    return !!TaoUtil.BA_HUI[this._lunar.getDayInGanZhi()];
  }
  isDayMingWu() {
    return I18n.getMessage("tg.wu") === this._lunar.getDayGan();
  }
  isDayAnWu() {
    return this._lunar.getDayZhi() === TaoUtil.AN_WU[Math.abs(this.getMonth()) - 1];
  }
  isDayWu() {
    return this.isDayMingWu() || this.isDayAnWu();
  }
  isDayTianShe() {
    let ret = false;
    const mz = this._lunar.getMonthZhi();
    const dgz = this._lunar.getDayInGanZhi();
    if ([I18n.getMessage("dz.yin"), I18n.getMessage("dz.mao"), I18n.getMessage("dz.chen")].join(",").indexOf(mz) > -1) {
      if (I18n.getMessage("jz.wuYin") === dgz) {
        ret = true;
      }
    } else if ([I18n.getMessage("dz.si"), I18n.getMessage("dz.wu"), I18n.getMessage("dz.wei")].join(",").indexOf(mz) > -1) {
      if (I18n.getMessage("jz.jiaWu") === dgz) {
        ret = true;
      }
    } else if ([I18n.getMessage("dz.shen"), I18n.getMessage("dz.you"), I18n.getMessage("dz.xu")].join(",").indexOf(mz) > -1) {
      if (I18n.getMessage("jz.wuShen") === dgz) {
        ret = true;
      }
    } else if ([I18n.getMessage("dz.hai"), I18n.getMessage("dz.zi"), I18n.getMessage("dz.chou")].join(",").indexOf(mz) > -1) {
      if (I18n.getMessage("jz.jiaZi") === dgz) {
        ret = true;
      }
    }
    return ret;
  }
  toString() {
    return this.getYearInChinese() + "\u5E74" + this.getMonthInChinese() + "\u6708" + this.getDayInChinese();
  }
  toFullString() {
    return "\u9053\u6B77" + this.getYearInChinese() + "\u5E74\uFF0C\u5929\u904B" + this._lunar.getYearInGanZhi() + "\u5E74\uFF0C" + this._lunar.getMonthInGanZhi() + "\u6708\uFF0C" + this._lunar.getDayInGanZhi() + "\u65E5\u3002" + this.getMonthInChinese() + "\u6708" + this.getDayInChinese() + "\u65E5\uFF0C" + this._lunar.getTimeZhi() + "\u6642\u3002";
  }
};
export let Tao = _Tao;
Tao.BIRTH_YEAR = -2697;
