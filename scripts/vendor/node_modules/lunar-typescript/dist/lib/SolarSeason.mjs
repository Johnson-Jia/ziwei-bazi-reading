import { SolarMonth } from "./SolarMonth.mjs";
export class SolarSeason {
  static fromYm(year, month) {
    return new SolarSeason(year, month);
  }
  static fromDate(date) {
    return SolarSeason.fromYm(date.getFullYear(), date.getMonth() + 1);
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
    return Math.ceil(this._month / 3);
  }
  next(seasons) {
    const month = SolarMonth.fromYm(this._year, this._month).next(3 * seasons);
    return SolarSeason.fromYm(month.getYear(), month.getMonth());
  }
  getMonths() {
    const l = [];
    const index = this.getIndex() - 1;
    for (let i = 0; i < 3; i++) {
      l.push(SolarMonth.fromYm(this._year, 3 * index + i + 1));
    }
    return l;
  }
  toString() {
    return `${this.getYear()}.${this.getIndex()}`;
  }
  toFullString() {
    return `${this.getYear()}\u5E74${this.getIndex()}\u5B63\u5EA6`;
  }
}
