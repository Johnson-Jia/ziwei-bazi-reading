import { LunarUtil } from "./LunarUtil.mjs";
import { Yun } from "./Yun.mjs";
export class EightChar {
  constructor(lunar) {
    this._sect = 2;
    this._lunar = lunar;
  }
  static fromLunar(lunar) {
    return new EightChar(lunar);
  }
  getSect() {
    return this._sect;
  }
  setSect(sect) {
    this._sect = 1 == sect ? 1 : 2;
  }
  getDayGanIndex() {
    return 2 === this._sect ? this._lunar.getDayGanIndexExact2() : this._lunar.getDayGanIndexExact();
  }
  getDayZhiIndex() {
    return 2 === this._sect ? this._lunar.getDayZhiIndexExact2() : this._lunar.getDayZhiIndexExact();
  }
  getYear() {
    return this._lunar.getYearInGanZhiExact();
  }
  getYearGan() {
    return this._lunar.getYearGanExact();
  }
  getYearZhi() {
    return this._lunar.getYearZhiExact();
  }
  getYearHideGan() {
    const v = LunarUtil.ZHI_HIDE_GAN[this.getYearZhi()];
    return v ? v : [];
  }
  getYearWuXing() {
    const gan = LunarUtil.WU_XING_GAN[this.getYearGan()];
    const zhi = LunarUtil.WU_XING_ZHI[this.getYearZhi()];
    return gan && zhi ? gan + zhi : "";
  }
  getYearNaYin() {
    const v = LunarUtil.NAYIN[this.getYear()];
    return v ? v : "";
  }
  getYearShiShenGan() {
    const v = LunarUtil.SHI_SHEN[this.getDayGan() + this.getYearGan()];
    return v ? v : "";
  }
  getYearShiShenZhi() {
    const dayGan = this.getDayGan();
    const hideGan = LunarUtil.ZHI_HIDE_GAN[this.getYearZhi()];
    const l = [];
    if (hideGan) {
      for (let i = 0, j = hideGan.length; i < j; i++) {
        const v = LunarUtil.SHI_SHEN[dayGan + hideGan[i]];
        if (v) {
          l.push(v);
        }
      }
    }
    return l;
  }
  getDiShi(zhiIndex) {
    const offset = LunarUtil.CHANG_SHENG_OFFSET[this.getDayGan()];
    if (offset == void 0) {
      return "";
    }
    let index = offset + (this.getDayGanIndex() % 2 == 0 ? zhiIndex : -zhiIndex);
    if (index >= 12) {
      index -= 12;
    }
    if (index < 0) {
      index += 12;
    }
    return LunarUtil.CHANG_SHENG[index];
  }
  getYearDiShi() {
    return this.getDiShi(this._lunar.getYearZhiIndexExact());
  }
  getYearXun() {
    return this._lunar.getYearXunExact();
  }
  getYearXunKong() {
    return this._lunar.getYearXunKongExact();
  }
  getMonth() {
    return this._lunar.getMonthInGanZhiExact();
  }
  getMonthGan() {
    return this._lunar.getMonthGanExact();
  }
  getMonthZhi() {
    return this._lunar.getMonthZhiExact();
  }
  getMonthHideGan() {
    const v = LunarUtil.ZHI_HIDE_GAN[this.getMonthZhi()];
    return v ? v : [];
  }
  getMonthWuXing() {
    const gan = LunarUtil.WU_XING_GAN[this.getMonthGan()];
    const zhi = LunarUtil.WU_XING_ZHI[this.getMonthZhi()];
    return gan && zhi ? gan + zhi : "";
  }
  getMonthNaYin() {
    const v = LunarUtil.NAYIN[this.getMonth()];
    return v ? v : "";
  }
  getMonthShiShenGan() {
    const v = LunarUtil.SHI_SHEN[this.getDayGan() + this.getMonthGan()];
    return v ? v : "";
  }
  getMonthShiShenZhi() {
    const dayGan = this.getDayGan();
    const hideGan = LunarUtil.ZHI_HIDE_GAN[this.getMonthZhi()];
    const l = [];
    if (hideGan) {
      for (let i = 0, j = hideGan.length; i < j; i++) {
        const v = LunarUtil.SHI_SHEN[dayGan + hideGan[i]];
        if (v) {
          l.push(v);
        }
      }
    }
    return l;
  }
  getMonthDiShi() {
    return this.getDiShi(this._lunar.getMonthZhiIndexExact());
  }
  getMonthXun() {
    return this._lunar.getMonthXunExact();
  }
  getMonthXunKong() {
    return this._lunar.getMonthXunKongExact();
  }
  getDay() {
    return 2 === this._sect ? this._lunar.getDayInGanZhiExact2() : this._lunar.getDayInGanZhiExact();
  }
  getDayGan() {
    return 2 === this._sect ? this._lunar.getDayGanExact2() : this._lunar.getDayGanExact();
  }
  getDayZhi() {
    return 2 === this._sect ? this._lunar.getDayZhiExact2() : this._lunar.getDayZhiExact();
  }
  getDayHideGan() {
    const v = LunarUtil.ZHI_HIDE_GAN[this.getDayZhi()];
    return v ? v : [];
  }
  getDayWuXing() {
    const gan = LunarUtil.WU_XING_GAN[this.getDayGan()];
    const zhi = LunarUtil.WU_XING_ZHI[this.getDayZhi()];
    return gan && zhi ? gan + zhi : "";
  }
  getDayNaYin() {
    const v = LunarUtil.NAYIN[this.getDay()];
    return v ? v : "";
  }
  getDayShiShenGan() {
    return "\u65E5\u4E3B";
  }
  getDayShiShenZhi() {
    const dayGan = this.getDayGan();
    const hideGan = LunarUtil.ZHI_HIDE_GAN[this.getDayZhi()];
    const l = [];
    if (hideGan) {
      for (let i = 0, j = hideGan.length; i < j; i++) {
        const v = LunarUtil.SHI_SHEN[dayGan + hideGan[i]];
        if (v) {
          l.push(v);
        }
      }
    }
    return l;
  }
  getDayDiShi() {
    return this.getDiShi(this.getDayZhiIndex());
  }
  getDayXun() {
    return 2 === this._sect ? this._lunar.getDayXunExact2() : this._lunar.getDayXunExact();
  }
  getDayXunKong() {
    return 2 === this._sect ? this._lunar.getDayXunKongExact2() : this._lunar.getDayXunKongExact();
  }
  getTime() {
    return this._lunar.getTimeInGanZhi();
  }
  getTimeGan() {
    return this._lunar.getTimeGan();
  }
  getTimeZhi() {
    return this._lunar.getTimeZhi();
  }
  getTimeHideGan() {
    const v = LunarUtil.ZHI_HIDE_GAN[this.getTimeZhi()];
    return v ? v : [];
  }
  getTimeWuXing() {
    const gan = LunarUtil.WU_XING_GAN[this._lunar.getTimeGan()];
    const zhi = LunarUtil.WU_XING_ZHI[this._lunar.getTimeZhi()];
    return gan && zhi ? gan + zhi : "";
  }
  getTimeNaYin() {
    const v = LunarUtil.NAYIN[this.getTime()];
    return v ? v : "";
  }
  getTimeShiShenGan() {
    const v = LunarUtil.SHI_SHEN[this.getDayGan() + this.getTimeGan()];
    return v ? v : "";
  }
  getTimeShiShenZhi() {
    const dayGan = this.getDayGan();
    const hideGan = LunarUtil.ZHI_HIDE_GAN[this.getTimeZhi()];
    const l = [];
    if (hideGan) {
      for (let i = 0, j = hideGan.length; i < j; i++) {
        const v = LunarUtil.SHI_SHEN[dayGan + hideGan[i]];
        if (v) {
          l.push(v);
        }
      }
    }
    return l;
  }
  getTimeDiShi() {
    return this.getDiShi(this._lunar.getTimeZhiIndex());
  }
  getTimeXun() {
    return this._lunar.getTimeXun();
  }
  getTimeXunKong() {
    return this._lunar.getTimeXunKong();
  }
  getTaiYuan() {
    let ganIndex = this._lunar.getMonthGanIndexExact() + 1;
    if (ganIndex >= 10) {
      ganIndex -= 10;
    }
    let zhiIndex = this._lunar.getMonthZhiIndexExact() + 3;
    if (zhiIndex >= 12) {
      zhiIndex -= 12;
    }
    return LunarUtil.GAN[ganIndex + 1] + LunarUtil.ZHI[zhiIndex + 1];
  }
  getTaiYuanNaYin() {
    const v = LunarUtil.NAYIN[this.getTaiYuan()];
    return v ? v : "";
  }
  getTaiXi() {
    const ganIndex = 2 == this._sect ? this._lunar.getDayGanIndexExact2() : this._lunar.getDayGanIndexExact();
    const zhiIndex = 2 == this._sect ? this._lunar.getDayZhiIndexExact2() : this._lunar.getDayZhiIndexExact();
    return LunarUtil.HE_GAN_5[ganIndex] + LunarUtil.HE_ZHI_6[zhiIndex];
  }
  getTaiXiNaYin() {
    const v = LunarUtil.NAYIN[this.getTaiXi()];
    return v ? v : "";
  }
  getMingGong() {
    const monthZhiIndex = LunarUtil.find(this.getMonthZhi(), LunarUtil.MONTH_ZHI).index;
    const timeZhiIndex = LunarUtil.find(this.getTimeZhi(), LunarUtil.MONTH_ZHI).index;
    let offset = monthZhiIndex + timeZhiIndex;
    offset = (offset >= 14 ? 26 : 14) - offset;
    let ganIndex = (this._lunar.getYearGanIndexExact() + 1) * 2 + offset;
    while (ganIndex > 10) {
      ganIndex -= 10;
    }
    return LunarUtil.GAN[ganIndex] + LunarUtil.MONTH_ZHI[offset];
  }
  getMingGongNaYin() {
    const v = LunarUtil.NAYIN[this.getMingGong()];
    return v ? v : "";
  }
  getShenGong() {
    const monthZhiIndex = LunarUtil.find(this.getMonthZhi(), LunarUtil.MONTH_ZHI).index;
    const timeZhiIndex = LunarUtil.find(this.getTimeZhi(), LunarUtil.ZHI).index;
    let offset = monthZhiIndex + timeZhiIndex;
    if (offset > 12) {
      offset -= 12;
    }
    let ganIndex = (this._lunar.getYearGanIndexExact() + 1) * 2 + offset;
    while (ganIndex > 10) {
      ganIndex -= 10;
    }
    return LunarUtil.GAN[ganIndex] + LunarUtil.MONTH_ZHI[offset];
  }
  getShenGongNaYin() {
    const v = LunarUtil.NAYIN[this.getShenGong()];
    return v ? v : "";
  }
  getLunar() {
    return this._lunar;
  }
  getYun(gender, sect = 1) {
    return new Yun(this._lunar, gender, sect);
  }
  toString() {
    return this.getYear() + " " + this.getMonth() + " " + this.getDay() + " " + this.getTime();
  }
}
