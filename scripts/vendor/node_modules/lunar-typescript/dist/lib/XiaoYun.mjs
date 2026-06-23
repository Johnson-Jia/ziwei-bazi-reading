import { LunarUtil } from "./LunarUtil.mjs";
export class XiaoYun {
  constructor(daYun, index, forward) {
    this._year = daYun.getStartYear() + index;
    this._age = daYun.getStartAge() + index;
    this._index = index;
    this._daYun = daYun;
    this._lunar = daYun.getLunar();
    this._forward = forward;
  }
  getYear() {
    return this._year;
  }
  getAge() {
    return this._age;
  }
  getIndex() {
    return this._index;
  }
  getGanZhi() {
    let offset = LunarUtil.getJiaZiIndex(this._lunar.getTimeInGanZhi());
    let add = this._index + 1;
    if (this._daYun.getIndex() > 0) {
      add += this._daYun.getStartAge() - 1;
    }
    offset += this._forward ? add : -add;
    const size = LunarUtil.JIA_ZI.length;
    while (offset < 0) {
      offset += size;
    }
    offset %= size;
    return LunarUtil.JIA_ZI[offset];
  }
  getXun() {
    return LunarUtil.getXun(this.getGanZhi());
  }
  getXunKong() {
    return LunarUtil.getXunKong(this.getGanZhi());
  }
}
