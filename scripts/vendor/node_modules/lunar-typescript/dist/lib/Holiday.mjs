export class Holiday {
  constructor(day, name, work, target) {
    this._day = Holiday._ymd(day);
    this._name = name;
    this._work = work;
    this._target = Holiday._ymd(target);
  }
  static _ymd(s) {
    return s.indexOf("-") < 0 ? s.substring(0, 4) + "-" + s.substring(4, 6) + "-" + s.substring(6) : s;
  }
  getDay() {
    return this._day;
  }
  setDay(value) {
    this._day = Holiday._ymd(value);
  }
  getName() {
    return this._name;
  }
  setName(value) {
    this._name = value;
  }
  isWork() {
    return this._work;
  }
  setWork(value) {
    this._work = value;
  }
  getTarget() {
    return this._target;
  }
  setTarget(value) {
    this._target = Holiday._ymd(value);
  }
  toString() {
    return this._day + " " + this._name + (this._work ? "\u8C03\u4F11" : "") + " " + this._target;
  }
}
