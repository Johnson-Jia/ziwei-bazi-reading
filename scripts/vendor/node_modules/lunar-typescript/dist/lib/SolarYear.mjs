import { SolarMonth } from "./SolarMonth.mjs";
export class SolarYear {
  static fromYear(year) {
    return new SolarYear(year);
  }
  static fromDate(date) {
    return SolarYear.fromYear(date.getFullYear());
  }
  constructor(year) {
    this._year = year;
  }
  getYear() {
    return this._year;
  }
  next(years) {
    return SolarYear.fromYear(this._year + years);
  }
  getMonths() {
    const l = [];
    const m = SolarMonth.fromYm(this._year, 1);
    l.push(m);
    for (let i = 1; i < 12; i++) {
      l.push(m.next(i));
    }
    return l;
  }
  toString() {
    return `${this.getYear()}`;
  }
  toFullString() {
    return `${this.getYear()}\u5E74`;
  }
}
