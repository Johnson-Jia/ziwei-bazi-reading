import { LunarUtil } from "./LunarUtil.mjs";
export class LiuYue {
  constructor(liuNian, index) {
    this._liuNian = liuNian;
    this._index = index;
  }
  getIndex() {
    return this._index;
  }
  getMonthInChinese() {
    return LunarUtil.MONTH[this._index + 1];
  }
  getGanZhi() {
    const yearGanIndex = LunarUtil.find(this._liuNian.getGanZhi(), LunarUtil.GAN).index - 1;
    const offset = [2, 4, 6, 8, 0][yearGanIndex % 5];
    const gan = LunarUtil.GAN[(this._index + offset) % 10 + 1];
    const zhi = LunarUtil.ZHI[(this._index + LunarUtil.BASE_MONTH_ZHI_INDEX) % 12 + 1];
    return gan + zhi;
  }
  getXun() {
    return LunarUtil.getXun(this.getGanZhi());
  }
  getXunKong() {
    return LunarUtil.getXunKong(this.getGanZhi());
  }
}
