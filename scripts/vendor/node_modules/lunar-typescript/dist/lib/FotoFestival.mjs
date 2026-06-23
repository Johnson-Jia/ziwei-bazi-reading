export class FotoFestival {
  constructor(name, result = "", everyMonth = false, remark = "") {
    this._name = name;
    this._result = result ? result : "";
    this._everyMonth = everyMonth;
    this._remark = remark;
  }
  getName() {
    return this._name;
  }
  getResult() {
    return this._result;
  }
  isEveryMonth() {
    return this._everyMonth;
  }
  getRemark() {
    return this._remark;
  }
  toString() {
    return this._name;
  }
  toFullString() {
    const l = [this._name];
    if (this._result) {
      l.push(this._result);
    }
    if (this._remark) {
      l.push(this._remark);
    }
    return l.join(" ");
  }
}
