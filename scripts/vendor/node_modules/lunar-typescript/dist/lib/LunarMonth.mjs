import { LunarUtil } from "./LunarUtil.mjs";
import { LunarYear } from "./LunarYear.mjs";
import { Solar } from "./Solar.mjs";
import { NineStar } from "./NineStar.mjs";
export class LunarMonth {
  static fromYm(lunarYear, lunarMonth) {
    return LunarYear.fromYear(lunarYear).getMonth(lunarMonth);
  }
  constructor(lunarYear, lunarMonth, dayCount, firstJulianDay, index) {
    this._year = lunarYear;
    this._month = lunarMonth;
    this._dayCount = dayCount;
    this._firstJulianDay = firstJulianDay;
    this._index = index;
    this._zhiIndex = (Math.abs(lunarMonth) - 1 + LunarUtil.BASE_MONTH_ZHI_INDEX) % 12;
  }
  getYear() {
    return this._year;
  }
  getMonth() {
    return this._month;
  }
  getIndex() {
    return this._index;
  }
  getGanIndex() {
    const offset = (LunarYear.fromYear(this._year).getGanIndex() + 1) % 5 * 2;
    return (Math.abs(this._month) - 1 + offset) % 10;
  }
  getZhiIndex() {
    return this._zhiIndex;
  }
  getGan() {
    return LunarUtil.GAN[this.getGanIndex() + 1];
  }
  getZhi() {
    return LunarUtil.ZHI[this._zhiIndex + 1];
  }
  getGanZhi() {
    return this.getGan() + this.getZhi();
  }
  isLeap() {
    return this._month < 0;
  }
  getDayCount() {
    return this._dayCount;
  }
  getFirstJulianDay() {
    return this._firstJulianDay;
  }
  getPositionXi() {
    return LunarUtil.POSITION_XI[this.getGanIndex() + 1];
  }
  getPositionXiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionXi()];
  }
  getPositionYangGui() {
    return LunarUtil.POSITION_YANG_GUI[this.getGanIndex() + 1];
  }
  getPositionYangGuiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionYangGui()];
  }
  getPositionYinGui() {
    return LunarUtil.POSITION_YIN_GUI[this.getGanIndex() + 1];
  }
  getPositionYinGuiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionYinGui()];
  }
  getPositionFu(sect = 2) {
    return (1 == sect ? LunarUtil.POSITION_FU : LunarUtil.POSITION_FU_2)[this.getGanIndex() + 1];
  }
  getPositionFuDesc(sect = 2) {
    return LunarUtil.POSITION_DESC[this.getPositionFu(sect)];
  }
  getPositionCai() {
    return LunarUtil.POSITION_CAI[this.getGanIndex() + 1];
  }
  getPositionCaiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionCai()];
  }
  getPositionTaiSui() {
    const m = Math.abs(this._month);
    switch (m) {
      case 1:
      case 5:
      case 9:
        return "\u826E";
      case 3:
      case 7:
      case 11:
        return "\u5764";
      case 4:
      case 8:
      case 12:
        return "\u5DFD";
    }
    return LunarUtil.POSITION_GAN[Solar.fromJulianDay(this.getFirstJulianDay()).getLunar().getMonthGanIndex()];
  }
  getPositionTaiSuiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionTaiSui()];
  }
  getNineStar() {
    const index = LunarYear.fromYear(this._year).getZhiIndex() % 3;
    const m = Math.abs(this._month);
    const monthZhiIndex = (13 + m) % 12;
    let n = 27 - index * 3;
    if (monthZhiIndex < LunarUtil.BASE_MONTH_ZHI_INDEX) {
      n -= 3;
    }
    const offset = (n - monthZhiIndex) % 9;
    return NineStar.fromIndex(offset);
  }
  toString() {
    return `${this.getYear()}\u5E74${this.isLeap() ? "\u95F0" : ""}${LunarUtil.MONTH[Math.abs(this.getMonth())]}\u6708(${this.getDayCount()})\u5929`;
  }
  next(n) {
    if (0 == n) {
      return LunarMonth.fromYm(this._year, this._month);
    } else {
      let rest = Math.abs(n);
      let ny = this._year;
      let iy = ny;
      let im = this._month;
      let index = 0;
      let months = LunarYear.fromYear(ny).getMonths();
      if (n > 0) {
        while (true) {
          const size = months.length;
          for (let i = 0; i < size; i++) {
            const m = months[i];
            if (m.getYear() === iy && m.getMonth() === im) {
              index = i;
              break;
            }
          }
          const more = size - index - 1;
          if (rest < more) {
            break;
          }
          rest -= more;
          const lastMonth = months[size - 1];
          iy = lastMonth.getYear();
          im = lastMonth.getMonth();
          ny++;
          months = LunarYear.fromYear(ny).getMonths();
        }
        return months[index + rest];
      } else {
        while (true) {
          const size = months.length;
          for (let i = 0; i < size; i++) {
            const m = months[i];
            if (m.getYear() === iy && m.getMonth() === im) {
              index = i;
              break;
            }
          }
          if (rest <= index) {
            break;
          }
          rest -= index;
          const firstMonth = months[0];
          iy = firstMonth.getYear();
          im = firstMonth.getMonth();
          ny--;
          months = LunarYear.fromYear(ny).getMonths();
        }
        return months[index - rest];
      }
    }
  }
}
