import { SolarUtil } from "./SolarUtil.mjs";
import { SolarWeek } from "./SolarWeek.mjs";
import { LunarUtil } from "./LunarUtil.mjs";
import { HolidayUtil } from "./HolidayUtil.mjs";
import { Lunar } from "./Lunar.mjs";
import { SolarMonth } from "./SolarMonth.mjs";
const _Solar = class {
  static fromYmd(year, month, day) {
    return _Solar.fromYmdHms(year, month, day, 0, 0, 0);
  }
  static fromYmdHms(year, month, day, hour, minute, second) {
    return new _Solar(year, month, day, hour, minute, second);
  }
  static fromDate(date) {
    return _Solar.fromYmdHms(date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
  }
  static fromJulianDay(julianDay) {
    let d = Math.floor(julianDay + 0.5);
    let f = julianDay + 0.5 - d;
    if (d >= 2299161) {
      const c = Math.floor((d - 186721625e-2) / 36524.25);
      d += 1 + c - Math.floor(c / 4);
    }
    d += 1524;
    let year = Math.floor((d - 122.1) / 365.25);
    d -= Math.floor(365.25 * year);
    let month = Math.floor(d / 30.601);
    d -= Math.floor(30.601 * month);
    let day = d;
    if (month > 13) {
      month -= 13;
      year -= 4715;
    } else {
      month -= 1;
      year -= 4716;
    }
    f *= 24;
    let hour = Math.floor(f);
    f -= hour;
    f *= 60;
    let minute = Math.floor(f);
    f -= minute;
    f *= 60;
    let second = Math.round(f);
    if (second > 59) {
      second -= 60;
      minute++;
    }
    if (minute > 59) {
      minute -= 60;
      hour++;
    }
    if (hour > 23) {
      hour -= 24;
      day += 1;
    }
    return _Solar.fromYmdHms(year, month, day, hour, minute, second);
  }
  static fromBaZi(yearGanZhi, monthGanZhi, dayGanZhi, timeGanZhi, sect = 2, baseYear = 1900) {
    sect = 1 == sect ? 1 : 2;
    const l = [];
    let m = LunarUtil.index(monthGanZhi.substring(1), LunarUtil.ZHI, -1) - 2;
    if (m < 0) {
      m += 12;
    }
    if (((LunarUtil.index(yearGanZhi.substring(0, 1), LunarUtil.GAN, -1) + 1) * 2 + m) % 10 !== LunarUtil.index(monthGanZhi.substring(0, 1), LunarUtil.GAN, -1)) {
      return l;
    }
    let y = LunarUtil.getJiaZiIndex(yearGanZhi) - 57;
    if (y < 0) {
      y += 60;
    }
    y++;
    m *= 2;
    const h = LunarUtil.index(timeGanZhi.substring(1), LunarUtil.ZHI, -1) * 2;
    let hours = [h];
    if (0 == h && 2 == sect) {
      hours = [0, 23];
    }
    const startYear = baseYear - 1;
    const endYear = (/* @__PURE__ */ new Date()).getFullYear();
    while (y <= endYear) {
      if (y >= startYear) {
        const jieQiLunar = Lunar.fromYmd(y, 1, 1);
        const jieQiList = jieQiLunar.getJieQiList();
        const jieQiTable = jieQiLunar.getJieQiTable();
        let solarTime = jieQiTable[jieQiList[4 + m]];
        if (solarTime.getYear() >= baseYear) {
          let d = LunarUtil.getJiaZiIndex(dayGanZhi) - LunarUtil.getJiaZiIndex(solarTime.getLunar().getDayInGanZhiExact2());
          if (d < 0) {
            d += 60;
          }
          if (d > 0) {
            solarTime = solarTime.next(d);
          }
          hours.forEach((hour) => {
            let mi = 0;
            let s = 0;
            if (d == 0 && hour === solarTime.getHour()) {
              mi = solarTime.getMinute();
              s = solarTime.getSecond();
            }
            let solar = _Solar.fromYmdHms(solarTime.getYear(), solarTime.getMonth(), solarTime.getDay(), hour, mi, s);
            if (d === 30) {
              solar = solar.nextHour(-1);
            }
            const lunar = solar.getLunar();
            const dgz = 2 === sect ? lunar.getDayInGanZhiExact2() : lunar.getDayInGanZhiExact();
            if (lunar.getYearInGanZhiExact() === yearGanZhi && lunar.getMonthInGanZhiExact() === monthGanZhi && dgz === dayGanZhi && lunar.getTimeInGanZhi() === timeGanZhi) {
              l.push(solar);
            }
          });
        }
      }
      y += 60;
    }
    return l;
  }
  constructor(year, month, day, hour, minute, second) {
    if (1582 === year && 10 === month) {
      if (day > 4 && day < 15) {
        throw new Error(`wrong solar year ${year} month ${month} day ${day}`);
      }
    }
    if (month < 1 || month > 12) {
      throw new Error(`wrong month ${month}`);
    }
    if (day < 1 || day > 31) {
      throw new Error(`wrong day ${day}`);
    }
    if (hour < 0 || hour > 23) {
      throw new Error(`wrong hour ${hour}`);
    }
    if (minute < 0 || minute > 59) {
      throw new Error(`wrong minute ${minute}`);
    }
    if (second < 0 || second > 59) {
      throw new Error(`wrong second ${second}`);
    }
    this._year = year;
    this._month = month;
    this._day = day;
    this._hour = hour;
    this._minute = minute;
    this._second = second;
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
  getHour() {
    return this._hour;
  }
  getMinute() {
    return this._minute;
  }
  getSecond() {
    return this._second;
  }
  getWeek() {
    return (Math.floor(this.getJulianDay() + 0.5) + 7000001) % 7;
  }
  getWeekInChinese() {
    return SolarUtil.WEEK[this.getWeek()];
  }
  getSolarWeek(start) {
    return SolarWeek.fromYmd(this._year, this._month, this._day, start);
  }
  isLeapYear() {
    return SolarUtil.isLeapYear(this._year);
  }
  getFestivals() {
    const l = [];
    let f = SolarUtil.FESTIVAL[this._month + "-" + this._day];
    if (f) {
      l.push(f);
    }
    const weeks = Math.ceil(this._day / 7);
    const week = this.getWeek();
    f = SolarUtil.WEEK_FESTIVAL[this._month + "-" + weeks + "-" + week];
    if (f) {
      l.push(f);
    }
    if (this._day + 7 > SolarUtil.getDaysOfMonth(this._year, this._month)) {
      f = SolarUtil.WEEK_FESTIVAL[this._month + "-0-" + week];
      if (f) {
        l.push(f);
      }
    }
    return l;
  }
  getOtherFestivals() {
    const l = [];
    const fs = SolarUtil.OTHER_FESTIVAL[this._month + "-" + this._day];
    if (fs) {
      fs.forEach((f) => {
        l.push(f);
      });
    }
    return l;
  }
  getXingzuo() {
    return this.getXingZuo();
  }
  getXingZuo() {
    let index = 11;
    const y = this._month * 100 + this._day;
    if (y >= 321 && y <= 419) {
      index = 0;
    } else if (y >= 420 && y <= 520) {
      index = 1;
    } else if (y >= 521 && y <= 621) {
      index = 2;
    } else if (y >= 622 && y <= 722) {
      index = 3;
    } else if (y >= 723 && y <= 822) {
      index = 4;
    } else if (y >= 823 && y <= 922) {
      index = 5;
    } else if (y >= 923 && y <= 1023) {
      index = 6;
    } else if (y >= 1024 && y <= 1122) {
      index = 7;
    } else if (y >= 1123 && y <= 1221) {
      index = 8;
    } else if (y >= 1222 || y <= 119) {
      index = 9;
    } else if (y <= 218) {
      index = 10;
    }
    return SolarUtil.XINGZUO[index];
  }
  /**
   * 获取薪资比例(感谢 https://gitee.com/smr1987)
   * @returns 1 | 2 | 3 薪资比例
   */
  getSalaryRate() {
    if (this._month === 1 && this._day === 1) {
      return 3;
    }
    if (this._month === 5 && this._day === 1) {
      return 3;
    }
    if (this._month === 10 && this._day >= 1 && this._day <= 3) {
      return 3;
    }
    const lunar = this.getLunar();
    if (lunar.getMonth() === 1 && lunar.getDay() >= 1 && lunar.getDay() <= 3) {
      return 3;
    }
    if (lunar.getMonth() === 5 && lunar.getDay() === 5) {
      return 3;
    }
    if (lunar.getMonth() === 8 && lunar.getDay() === 15) {
      return 3;
    }
    if ("\u6E05\u660E" === lunar.getJieQi()) {
      return 3;
    }
    const holiday = HolidayUtil.getHoliday(this._year, this._month, this._day);
    if (holiday) {
      if (!holiday.isWork()) {
        return 2;
      }
    } else {
      const week = this.getWeek();
      if (week === 6 || week === 0) {
        return 2;
      }
    }
    return 1;
  }
  toYmd() {
    let y = this._year + "";
    while (y.length < 4) {
      y = "0" + y;
    }
    return [y, (this._month < 10 ? "0" : "") + this._month, (this._day < 10 ? "0" : "") + this._day].join("-");
  }
  toYmdHms() {
    return this.toYmd() + " " + [(this._hour < 10 ? "0" : "") + this._hour, (this._minute < 10 ? "0" : "") + this._minute, (this._second < 10 ? "0" : "") + this._second].join(":");
  }
  toString() {
    return this.toYmd();
  }
  toFullString() {
    let s = this.toYmdHms();
    if (this.isLeapYear()) {
      s += " \u95F0\u5E74";
    }
    s += " \u661F\u671F" + this.getWeekInChinese();
    const festivals = this.getFestivals();
    festivals.forEach((f) => {
      s += " (" + f + ")";
    });
    s += " " + this.getXingZuo() + "\u5EA7";
    return s;
  }
  nextYear(years) {
    const y = this._year + years;
    const m = this._month;
    let d = this._day;
    if (1582 === y && 10 === m) {
      if (d > 4 && d < 15) {
        d += 10;
      }
    } else if (2 === m) {
      if (d > 28) {
        if (!SolarUtil.isLeapYear(y)) {
          d = 28;
        }
      }
    }
    return _Solar.fromYmdHms(y, m, d, this._hour, this._minute, this._second);
  }
  nextMonth(months) {
    const month = SolarMonth.fromYm(this._year, this._month).next(months);
    const y = month.getYear();
    const m = month.getMonth();
    let d = this._day;
    if (1582 === y && 10 === m) {
      if (d > 4 && d < 15) {
        d += 10;
      }
    } else {
      const maxDay = SolarUtil.getDaysOfMonth(y, m);
      if (d > maxDay) {
        d = maxDay;
      }
    }
    return _Solar.fromYmdHms(y, m, d, this._hour, this._minute, this._second);
  }
  nextDay(days) {
    let y = this._year;
    let m = this._month;
    let d = this._day;
    if (1582 === y && 10 === m) {
      if (d > 4) {
        d -= 10;
      }
    }
    if (days > 0) {
      d += days;
      let daysInMonth = SolarUtil.getDaysOfMonth(y, m);
      while (d > daysInMonth) {
        d -= daysInMonth;
        m++;
        if (m > 12) {
          m = 1;
          y++;
        }
        daysInMonth = SolarUtil.getDaysOfMonth(y, m);
      }
    } else if (days < 0) {
      while (d + days <= 0) {
        m--;
        if (m < 1) {
          m = 12;
          y--;
        }
        d += SolarUtil.getDaysOfMonth(y, m);
      }
      d += days;
    }
    if (1582 === y && 10 === m) {
      if (d > 4) {
        d += 10;
      }
    }
    return _Solar.fromYmdHms(y, m, d, this._hour, this._minute, this._second);
  }
  next(days, onlyWorkday = false) {
    if (onlyWorkday) {
      let solar = _Solar.fromYmdHms(this._year, this._month, this._day, this._hour, this._minute, this._second);
      if (days !== 0) {
        let rest = Math.abs(days);
        const add = days < 1 ? -1 : 1;
        while (rest > 0) {
          solar = solar.next(add);
          let work = true;
          const holiday = HolidayUtil.getHoliday(solar.getYear(), solar.getMonth(), solar.getDay());
          if (!holiday) {
            const week = solar.getWeek();
            if (0 === week || 6 === week) {
              work = false;
            }
          } else {
            work = holiday.isWork();
          }
          if (work) {
            rest -= 1;
          }
        }
      }
      return solar;
    } else {
      return this.nextDay(days);
    }
  }
  nextHour(hours) {
    const h = this._hour + hours;
    const n = h < 0 ? -1 : 1;
    let hour = Math.abs(h);
    let days = Math.floor(hour / 24) * n;
    hour = hour % 24 * n;
    if (hour < 0) {
      hour += 24;
      days--;
    }
    const solar = this.next(days);
    return _Solar.fromYmdHms(solar.getYear(), solar.getMonth(), solar.getDay(), hour, solar.getMinute(), solar.getSecond());
  }
  getLunar() {
    return Lunar.fromSolar(this);
  }
  getJulianDay() {
    let y = this._year;
    let m = this._month;
    const d = this._day + ((this._second / 60 + this._minute) / 60 + this._hour) / 24;
    let n = 0;
    let g = false;
    if (y * 372 + m * 31 + Math.floor(d) >= 588829) {
      g = true;
    }
    if (m <= 2) {
      m += 12;
      y--;
    }
    if (g) {
      n = Math.floor(y / 100);
      n = 2 - n + Math.floor(n / 4);
    }
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + n - 1524.5;
  }
  isBefore(solar) {
    if (this._year > solar.getYear()) {
      return false;
    }
    if (this._year < solar.getYear()) {
      return true;
    }
    if (this._month > solar.getMonth()) {
      return false;
    }
    if (this._month < solar.getMonth()) {
      return true;
    }
    if (this._day > solar.getDay()) {
      return false;
    }
    if (this._day < solar.getDay()) {
      return true;
    }
    if (this._hour > solar.getHour()) {
      return false;
    }
    if (this._hour < solar.getHour()) {
      return true;
    }
    if (this._minute > solar.getMinute()) {
      return false;
    }
    if (this._minute < solar.getMinute()) {
      return true;
    }
    return this._second < solar.getSecond();
  }
  isAfter(solar) {
    if (this._year > solar.getYear()) {
      return true;
    }
    if (this._year < solar.getYear()) {
      return false;
    }
    if (this._month > solar.getMonth()) {
      return true;
    }
    if (this._month < solar.getMonth()) {
      return false;
    }
    if (this._day > solar.getDay()) {
      return true;
    }
    if (this._day < solar.getDay()) {
      return false;
    }
    if (this._hour > solar.getHour()) {
      return true;
    }
    if (this._hour < solar.getHour()) {
      return false;
    }
    if (this._minute > solar.getMinute()) {
      return true;
    }
    if (this._minute < solar.getMinute()) {
      return false;
    }
    return this._second > solar.getSecond();
  }
  subtract(solar) {
    return SolarUtil.getDaysBetween(solar.getYear(), solar.getMonth(), solar.getDay(), this._year, this._month, this._day);
  }
  subtractMinute(solar) {
    let days = this.subtract(solar);
    const cm = this._hour * 60 + this._minute;
    const sm = solar.getHour() * 60 + solar.getMinute();
    let m = cm - sm;
    if (m < 0) {
      m += 1440;
      days--;
    }
    m += days * 1440;
    return m;
  }
};
export let Solar = _Solar;
Solar.J2000 = 2451545;
