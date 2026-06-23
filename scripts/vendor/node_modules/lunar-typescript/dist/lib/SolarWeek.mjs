import { SolarUtil } from "./SolarUtil.mjs";
import { Solar } from "./Solar.mjs";
export class SolarWeek {
  static fromYmd(year, month, day, start) {
    return new SolarWeek(year, month, day, start);
  }
  static fromDate(date, start) {
    return SolarWeek.fromYmd(date.getFullYear(), date.getMonth() + 1, date.getDate(), start);
  }
  constructor(year, month, day, start) {
    this._year = year;
    this._month = month;
    this._day = day;
    this._start = start;
  }
  getYear() {
    return this._year;
  }
  getMonth() {
    return this._month;
  }
  getDay() {
    return this._day;
  }
  getStart() {
    return this._start;
  }
  getIndex() {
    let offset = Solar.fromYmd(this._year, this._month, 1).getWeek() - this._start;
    if (offset < 0) {
      offset += 7;
    }
    return Math.ceil((this._day + offset) / 7);
  }
  getIndexInYear() {
    let offset = Solar.fromYmd(this._year, 1, 1).getWeek() - this._start;
    if (offset < 0) {
      offset += 7;
    }
    return Math.ceil((SolarUtil.getDaysInYear(this._year, this._month, this._day) + offset) / 7);
  }
  next(weeks, separateMonth) {
    const start = this._start;
    if (0 === weeks) {
      return SolarWeek.fromYmd(this._year, this._month, this._day, start);
    }
    let solar = Solar.fromYmd(this._year, this._month, this._day);
    if (separateMonth) {
      let n = weeks;
      let week = SolarWeek.fromYmd(this._year, this._month, this._day, start);
      let month = this._month;
      const plus = n > 0;
      while (0 !== n) {
        solar = solar.next(plus ? 7 : -7);
        week = SolarWeek.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay(), start);
        let weekMonth = week.getMonth();
        if (month !== weekMonth) {
          const index = week.getIndex();
          if (plus) {
            if (1 === index) {
              const firstDay = week.getFirstDay();
              week = SolarWeek.fromYmd(firstDay.getYear(), firstDay.getMonth(), firstDay.getDay(), start);
              weekMonth = week.getMonth();
            } else {
              solar = Solar.fromYmd(week.getYear(), week.getMonth(), 1);
              week = SolarWeek.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay(), start);
            }
          } else {
            if (SolarUtil.getWeeksOfMonth(week.getYear(), week.getMonth(), start) === index) {
              const lastDay = week.getFirstDay().next(6);
              week = SolarWeek.fromYmd(lastDay.getYear(), lastDay.getMonth(), lastDay.getDay(), start);
              weekMonth = week.getMonth();
            } else {
              solar = Solar.fromYmd(week.getYear(), week.getMonth(), SolarUtil.getDaysOfMonth(week.getYear(), week.getMonth()));
              week = SolarWeek.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay(), start);
            }
          }
          month = weekMonth;
        }
        n -= plus ? 1 : -1;
      }
      return week;
    } else {
      solar = solar.next(weeks * 7);
      return SolarWeek.fromYmd(solar.getYear(), solar.getMonth(), solar.getDay(), start);
    }
  }
  getFirstDay() {
    const solar = Solar.fromYmd(this._year, this._month, this._day);
    let prev = solar.getWeek() - this._start;
    if (prev < 0) {
      prev += 7;
    }
    return solar.next(-prev);
  }
  getFirstDayInMonth() {
    let index = 0;
    const days = this.getDays();
    for (let i = 0; i < days.length; i++) {
      if (this._month === days[i].getMonth()) {
        index = i;
        break;
      }
    }
    return days[index];
  }
  getDays() {
    const firstDay = this.getFirstDay();
    const l = [];
    l.push(firstDay);
    for (let i = 1; i < 7; i++) {
      l.push(firstDay.next(i));
    }
    return l;
  }
  getDaysInMonth() {
    const days = this.getDays();
    const l = [];
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (this._month !== day.getMonth()) {
        continue;
      }
      l.push(day);
    }
    return l;
  }
  toString() {
    return `${this.getYear()}.${this.getMonth()}.${this.getIndex()}`;
  }
  toFullString() {
    return `${this.getYear()}\u5E74${this.getMonth()}\u6708\u7B2C${this.getIndex()}\u5468`;
  }
}
