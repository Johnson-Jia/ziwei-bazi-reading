import { LunarUtil } from "./LunarUtil.mjs";
export class JieQi {
  constructor(name, solar) {
    let jie = false, qi = false;
    for (let i = 0, j = LunarUtil.JIE_QI.length; i < j; i++) {
      if (LunarUtil.JIE_QI[i] === name) {
        if (i % 2 == 0) {
          qi = true;
        } else {
          jie = true;
        }
        break;
      }
    }
    this._name = name;
    this._solar = solar;
    this._jie = jie;
    this._qi = qi;
  }
  getName() {
    return this._name;
  }
  getSolar() {
    return this._solar;
  }
  setName(name) {
    this._name = name;
  }
  setSolar(solar) {
    this._solar = solar;
  }
  isJie() {
    return this._jie;
  }
  isQi() {
    return this._qi;
  }
  toString() {
    return this.getName();
  }
}
