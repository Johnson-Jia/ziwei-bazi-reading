import { LunarUtil } from "./LunarUtil.mjs";
import { LiuYue } from "./LiuYue.mjs";
import { I18n } from "./I18n.mjs";
export class LiuNian {
  constructor(daYun, index) {
    this._year = daYun.getStartYear() + index;
    this._age = daYun.getStartAge() + index;
    this._index = index;
    this._daYun = daYun;
    this._lunar = daYun.getLunar();
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
  getLunar() {
    return this._lunar;
  }
  getGanZhi() {
    let offset = LunarUtil.getJiaZiIndex(this._lunar.getJieQiTable()[I18n.getMessage("jq.liChun")].getLunar().getYearInGanZhiExact()) + this._index;
    if (this._daYun.getIndex() > 0) {
      offset += this._daYun.getStartAge() - 1;
    }
    offset %= LunarUtil.JIA_ZI.length;
    return LunarUtil.JIA_ZI[offset];
  }
  getXun() {
    return LunarUtil.getXun(this.getGanZhi());
  }
  getXunKong() {
    return LunarUtil.getXunKong(this.getGanZhi());
  }
  getLiuYue() {
    const l = [];
    for (let i = 0; i < 12; i++) {
      l.push(new LiuYue(this, i));
    }
    return l;
  }
}
