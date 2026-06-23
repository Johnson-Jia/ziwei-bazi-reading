import { LunarUtil } from "./LunarUtil.mjs";
import { LiuNian } from "./LiuNian.mjs";
import { XiaoYun } from "./XiaoYun.mjs";
export class DaYun {
  constructor(yun, index) {
    const lunar = yun.getLunar();
    const birthYear = lunar.getSolar().getYear();
    const year = yun.getStartSolar().getYear();
    let startYear = birthYear;
    let startAge = 1;
    let endYear = year - 1;
    let endAge = year - birthYear;
    if (index >= 1) {
      startYear = year + (index - 1) * 10;
      startAge = startYear - birthYear + 1;
      endYear = startYear + 9;
      endAge = startAge + 9;
    }
    this._startYear = startYear;
    this._endYear = endYear;
    this._startAge = startAge;
    this._endAge = endAge;
    this._index = index;
    this._yun = yun;
    this._lunar = lunar;
  }
  getStartYear() {
    return this._startYear;
  }
  getEndYear() {
    return this._endYear;
  }
  getStartAge() {
    return this._startAge;
  }
  getEndAge() {
    return this._endAge;
  }
  getIndex() {
    return this._index;
  }
  getLunar() {
    return this._lunar;
  }
  getGanZhi() {
    if (this._index < 1) {
      return "";
    }
    let offset = LunarUtil.getJiaZiIndex(this._lunar.getMonthInGanZhiExact());
    offset += this._yun.isForward() ? this._index : -this._index;
    const size = LunarUtil.JIA_ZI.length;
    if (offset >= size) {
      offset -= size;
    }
    if (offset < 0) {
      offset += size;
    }
    return LunarUtil.JIA_ZI[offset];
  }
  getXun() {
    return LunarUtil.getXun(this.getGanZhi());
  }
  getXunKong() {
    return LunarUtil.getXunKong(this.getGanZhi());
  }
  getLiuNian(n = 10) {
    if (this._index < 1) {
      n = this._endYear - this._startYear + 1;
    }
    const l = [];
    for (let i = 0; i < n; i++) {
      l.push(new LiuNian(this, i));
    }
    return l;
  }
  getXiaoYun(n = 10) {
    if (this._index < 1) {
      n = this._endYear - this._startYear + 1;
    }
    const l = [];
    for (let i = 0; i < n; i++) {
      l.push(new XiaoYun(this, i, this._yun.isForward()));
    }
    return l;
  }
}
