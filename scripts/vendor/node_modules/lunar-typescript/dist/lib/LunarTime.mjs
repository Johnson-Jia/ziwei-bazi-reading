import { LunarUtil } from "./LunarUtil.mjs";
import { Lunar } from "./Lunar.mjs";
import { NineStar } from "./NineStar.mjs";
import { I18n } from "./I18n.mjs";
export class LunarTime {
  static fromYmdHms(lunarYear, lunarMonth, lunarDay, hour, minute, second) {
    return new LunarTime(lunarYear, lunarMonth, lunarDay, hour, minute, second);
  }
  constructor(lunarYear, lunarMonth, lunarDay, hour, minute, second) {
    this._lunar = Lunar.fromYmdHms(lunarYear, lunarMonth, lunarDay, hour, minute, second);
    this._zhiIndex = LunarUtil.getTimeZhiIndex([(hour < 10 ? "0" : "") + hour, (minute < 10 ? "0" : "") + minute].join(":"));
    this._ganIndex = (this._lunar.getDayGanIndexExact() % 5 * 2 + this._zhiIndex) % 10;
  }
  getGanIndex() {
    return this._ganIndex;
  }
  getZhiIndex() {
    return this._zhiIndex;
  }
  getGan() {
    return LunarUtil.GAN[this._ganIndex + 1];
  }
  getZhi() {
    return LunarUtil.ZHI[this._zhiIndex + 1];
  }
  getGanZhi() {
    return this.getGan() + this.getZhi();
  }
  getShengXiao() {
    return LunarUtil.SHENGXIAO[this._zhiIndex + 1];
  }
  getPositionXi() {
    return LunarUtil.POSITION_XI[this._ganIndex + 1];
  }
  getPositionXiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionXi()];
  }
  getPositionYangGui() {
    return LunarUtil.POSITION_YANG_GUI[this._ganIndex + 1];
  }
  getPositionYangGuiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionYangGui()];
  }
  getPositionYinGui() {
    return LunarUtil.POSITION_YIN_GUI[this._ganIndex + 1];
  }
  getPositionYinGuiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionYinGui()];
  }
  getPositionFu(sect = 2) {
    return (1 === sect ? LunarUtil.POSITION_FU : LunarUtil.POSITION_FU_2)[this._ganIndex + 1];
  }
  getPositionFuDesc(sect = 2) {
    return LunarUtil.POSITION_DESC[this.getPositionFu(sect)];
  }
  getPositionCai() {
    return LunarUtil.POSITION_CAI[this._ganIndex + 1];
  }
  getPositionCaiDesc() {
    return LunarUtil.POSITION_DESC[this.getPositionCai()];
  }
  getNaYin() {
    return LunarUtil.NAYIN[this.getGanZhi()];
  }
  getTianShen() {
    return LunarUtil.TIAN_SHEN[(this._zhiIndex + LunarUtil.ZHI_TIAN_SHEN_OFFSET[this._lunar.getDayZhiExact()]) % 12 + 1];
  }
  getTianShenType() {
    return LunarUtil.TIAN_SHEN_TYPE[this.getTianShen()];
  }
  getTianShenLuck() {
    return LunarUtil.TIAN_SHEN_TYPE_LUCK[this.getTianShenType()];
  }
  getChong() {
    return LunarUtil.CHONG[this._zhiIndex];
  }
  getSha() {
    return LunarUtil.SHA[this.getZhi()];
  }
  getChongShengXiao() {
    const chong = this.getChong();
    for (let i = 0, j = LunarUtil.ZHI.length; i < j; i++) {
      if (LunarUtil.ZHI[i] === chong) {
        return LunarUtil.SHENGXIAO[i];
      }
    }
    return "";
  }
  getChongDesc() {
    return "(" + this.getChongGan() + this.getChong() + ")" + this.getChongShengXiao();
  }
  getChongGan() {
    return LunarUtil.CHONG_GAN[this._ganIndex];
  }
  getChongGanTie() {
    return LunarUtil.CHONG_GAN_TIE[this._ganIndex];
  }
  getYi() {
    return LunarUtil.getTimeYi(this._lunar.getDayInGanZhiExact(), this.getGanZhi());
  }
  getJi() {
    return LunarUtil.getTimeJi(this._lunar.getDayInGanZhiExact(), this.getGanZhi());
  }
  getNineStar() {
    const solarYmd = this._lunar.getSolar().toYmd();
    const jieQi = this._lunar.getJieQiTable();
    let asc = false;
    if (solarYmd >= jieQi[I18n.getMessage("jq.dongZhi")].toYmd() && solarYmd < jieQi[I18n.getMessage("jq.xiaZhi")].toYmd()) {
      asc = true;
    }
    const offset = asc ? [0, 3, 6] : [8, 5, 2];
    const start = offset[this._lunar.getDayZhiIndex() % 3];
    const index = asc ? start + this._zhiIndex : start + 9 - this._zhiIndex;
    return NineStar.fromIndex(index % 9);
  }
  getXun() {
    return LunarUtil.getXun(this.getGanZhi());
  }
  getXunKong() {
    return LunarUtil.getXunKong(this.getGanZhi());
  }
  getMinHm() {
    let hour = this._lunar.getHour();
    if (hour < 1) {
      return "00:00";
    } else if (hour > 22) {
      return "23:00";
    }
    if (hour % 2 === 0) {
      hour -= 1;
    }
    return (hour < 10 ? "0" : "") + hour + ":00";
  }
  getMaxHm() {
    let hour = this._lunar.getHour();
    if (hour < 1) {
      return "00:59";
    } else if (hour > 22) {
      return "23:59";
    }
    if (hour % 2 !== 0) {
      hour += 1;
    }
    return (hour < 10 ? "0" : "") + hour + ":59";
  }
  toString() {
    return this.getGanZhi();
  }
}
