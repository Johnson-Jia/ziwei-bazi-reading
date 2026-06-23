import { Lunar } from "./Lunar.mjs";
import { LunarUtil } from "./LunarUtil.mjs";
import { FotoUtil } from "./FotoUtil.mjs";
import { LunarMonth } from "./LunarMonth.mjs";
const _Foto = class {
  constructor(lunar) {
    this._lunar = lunar;
  }
  static fromLunar(lunar) {
    return new _Foto(lunar);
  }
  static fromYmdHms(lunarYear, lunarMonth, lunarDay, hour, minute, second) {
    return _Foto.fromLunar(Lunar.fromYmdHms(lunarYear + _Foto.DEAD_YEAR - 1, lunarMonth, lunarDay, hour, minute, second));
  }
  static fromYmd(lunarYear, lunarMonth, lunarDay) {
    return _Foto.fromYmdHms(lunarYear, lunarMonth, lunarDay, 0, 0, 0);
  }
  getLunar() {
    return this._lunar;
  }
  getYear() {
    const sy = this._lunar.getSolar().getYear();
    let y = sy - _Foto.DEAD_YEAR;
    if (sy === this._lunar.getYear()) {
      y++;
    }
    return y;
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
    const l = FotoUtil.FESTIVAL[this.getMonth() + "-" + this.getDay()];
    return l ? l : [];
  }
  getOtherFestivals() {
    const l = [];
    const fs = FotoUtil.OTHER_FESTIVAL[this.getMonth() + "-" + this.getDay()];
    if (fs) {
      fs.forEach((f) => {
        l.push(f);
      });
    }
    return l;
  }
  isMonthZhai() {
    const m = this.getMonth();
    return 1 === m || 5 === m || 9 === m;
  }
  isDayYangGong() {
    const l = this.getFestivals();
    for (let i = 0, j = l.length; i < j; i++) {
      if ("\u6768\u516C\u5FCC" === l[i].getName()) {
        return true;
      }
    }
    return false;
  }
  isDayZhaiShuoWang() {
    const d = this.getDay();
    return 1 === d || 15 === d;
  }
  isDayZhaiSix() {
    const d = this.getDay();
    if (8 === d || 14 === d || 15 === d || 23 === d || 29 === d || 30 === d) {
      return true;
    } else if (28 === d) {
      const m = LunarMonth.fromYm(this._lunar.getYear(), this.getMonth());
      if (null != m && 30 !== m.getDayCount()) {
        return true;
      }
    }
    return false;
  }
  isDayZhaiTen() {
    const d = this.getDay();
    return 1 === d || 8 === d || 14 === d || 15 === d || 18 === d || 23 === d || 24 === d || 28 === d || 29 === d || 30 === d;
  }
  isDayZhaiGuanYin() {
    const k = this.getMonth() + "-" + this.getDay();
    for (let i = 0, j = FotoUtil.DAY_ZHAI_GUAN_YIN.length; i < j; i++) {
      if (k === FotoUtil.DAY_ZHAI_GUAN_YIN[i]) {
        return true;
      }
    }
    return false;
  }
  getXiu() {
    return FotoUtil.getXiu(this.getMonth(), this.getDay());
  }
  getXiuLuck() {
    return LunarUtil.XIU_LUCK[this.getXiu()];
  }
  getXiuSong() {
    return LunarUtil.XIU_SONG[this.getXiu()];
  }
  getZheng() {
    return LunarUtil.ZHENG[this.getXiu()];
  }
  getAnimal() {
    return LunarUtil.ANIMAL[this.getXiu()];
  }
  getGong() {
    return LunarUtil.GONG[this.getXiu()];
  }
  getShou() {
    return LunarUtil.SHOU[this.getGong()];
  }
  toString() {
    return this.getYearInChinese() + "\u5E74" + this.getMonthInChinese() + "\u6708" + this.getDayInChinese();
  }
  toFullString() {
    let s = this.toString();
    const festivals = this.getFestivals();
    for (let i = 0, j = festivals.length; i < j; i++) {
      s += " (" + festivals[i] + ")";
    }
    return s;
  }
};
export let Foto = _Foto;
Foto.DEAD_YEAR = -543;
