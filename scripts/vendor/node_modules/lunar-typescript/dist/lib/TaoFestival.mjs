export class TaoFestival {
  constructor(name, remark = "") {
    this._name = name;
    this._remark = remark;
  }
  getName() {
    return this._name;
  }
  getRemark() {
    return this._remark;
  }
  toString() {
    return this._name;
  }
  toFullString() {
    const l = [this._name];
    if (this._remark) {
      l.push("[" + this._remark + "]");
    }
    return l.join("");
  }
}
