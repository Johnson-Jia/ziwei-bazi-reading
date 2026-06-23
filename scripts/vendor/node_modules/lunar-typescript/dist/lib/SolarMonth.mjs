import { SolarUtil } from "./SolarUtil.mjs";
import { Solar } from "./Solar.mjs";
import { SolarWeek } from "./SolarWeek.mjs";
export class SolarMonth {
  static fromYm(year, month) {
    return new SolarMonth(year, month);
  }
  static fromDate(date) {
    return SolarMonth.fromYm(date.getFullYear(), date.getMonth() + 1);
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
  next(months) {
    const n = months < 0 ? -1 : 1;
    let m = Math.abs(months);
    let y = this._year + Math.floor(m / 12) * n;
    m = this._month + m % 12 * n;
    if (m > 12) {
      m -= 12;
      y++;
    } else if (m < 1) {
      m += 12;
      y--;
    }
    return SolarMonth.fromYm(y, m);
  }
  getDays() {
    const l = [];
    const d = Solar.fromYmd(this._year, this._month, 1);
    l.push(d);
    const days = SolarUtil.getDaysOfMonth(this._year, this._month);
    for (let i = 1; i < days; i++) {
      l.push(d.next(i));
    }
    return l;
  }
  getWeeks(start) {
    const l = [];
    let week = SolarWeek.fromYmd(this._year, this._month, 1, start);
    while (true) {
      l.push(week);
      week = week.next(1, false);
      const firstDay = week.getFirstDay();
      if (firstDay.getYear() > this._year || firstDay.getMonth() > this._month) {
        break;
      }
    }
    return l;
  }
  toString() {
    return `${this.getYear()}-${this.getMonth()}`;
  }
  toFullString() {
    return `${this.getYear()}\u5E74${this.getMonth()}\u6708`;
  }
}
