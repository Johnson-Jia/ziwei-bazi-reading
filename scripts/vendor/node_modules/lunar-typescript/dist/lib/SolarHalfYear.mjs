import { SolarMonth } from "./SolarMonth.mjs";
export class SolarHalfYear {
  static fromYm(year, month) {
    return new SolarHalfYear(year, month);
  }
  static fromDate(date) {
    return SolarHalfYear.fromYm(date.getFullYear(), date.getMonth() + 1);
  }
  constructor(year, month) {
    this._year = year;
    this._month = month;
  }
  getYear() {
    return this._year;
  }
  getMonth() {
    return this._month;
  }
  getIndex() {
    return Math.ceil(this._month / 6);
  }
  next(halfYears) {
    const month = SolarMonth.fromYm(this._year, this._month).next(6 * halfYears);
    return SolarHalfYear.fromYm(month.getYear(), month.getMonth());
  }
  getMonths() {
    const l = [];
    const index = this.getIndex() - 1;
    for (let i = 0; i < 6; i++) {
      l.push(SolarMonth.fromYm(this._year, 6 * index + i + 1));
    }
    return l;
  }
  toString() {
    return `${this.getYear()}.${this.getIndex()}`;
  }
  toFullString() {
    const name = ["\u4E0A", "\u4E0B"][this.getIndex() - 1];
    return `${this.getYear()}\u5E74${name}\u534A\u5E74`;
  }
}
