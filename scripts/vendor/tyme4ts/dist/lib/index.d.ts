declare enum YinYang {
    YIN = 0,
    YANG = 1
}
declare enum Side {
    IN = 0,
    OUT = 1
}
declare enum Gender {
    WOMAN = 0,
    MAN = 1
}
declare enum HideHeavenStemType {
    RESIDUAL = 0,
    MIDDLE = 1,
    MAIN = 2
}
declare enum EventType {
    SOLAR_DAY = 0,
    SOLAR_WEEK = 1,
    LUNAR_DAY = 2,
    TERM_DAY = 3,
    TERM_HS = 4,
    TERM_EB = 5
}
interface Culture {
    getName(): string;
    toString(): string;
}
interface Tyme extends Culture {
    next(n: number): Tyme | null;
}
declare abstract class AbstractCulture implements Culture {
    abstract getName(): string;
    toString(): string;
    equals(o: Culture): boolean;
    protected indexOf(index: number, size: number): number;
    protected static numeric(n: number | string, name: string): number;
    static validateRange(value: number, min: number, max: number, field: string): void;
}
declare abstract class AbstractTyme extends AbstractCulture implements Tyme {
    abstract next(n: number): Tyme | null;
}
declare abstract class YearUnit extends AbstractTyme {
    protected year: number;
    protected constructor(year: number);
    getYear(): number;
    getCompareIndex(): number;
}
declare abstract class MonthUnit extends YearUnit {
    protected month: number;
    protected constructor(year: number, month: number);
    getMonth(): number;
    getCompareIndex(): number;
}
declare abstract class DayUnit extends MonthUnit {
    protected day: number;
    protected constructor(year: number, month: number, day: number);
    getDay(): number;
    getCompareIndex(): number;
}
declare abstract class WeekUnit extends MonthUnit {
    static NAMES: string[];
    protected index: number;
    protected start: number;
    protected constructor(year: number, month: number, index: number, start: number);
    getIndex(): number;
    getStart(): number;
    static validate(_year: number, _month: number, index: number, start: number): void;
}
declare abstract class SecondUnit extends DayUnit {
    protected hour: number;
    protected minute: number;
    protected second: number;
    protected constructor(year: number, month: number, day: number, hour: number, minute: number, second: number);
    getHour(): number;
    getMinute(): number;
    getSecond(): number;
    getSecondsInDay(): number;
    getCompareIndex(): number;
    static validate(_year: number, _month: number, _day: number, hour: number, minute: number, second: number): void;
}
declare abstract class AbstractCultureDay extends AbstractCulture {
    protected culture: AbstractCulture;
    protected dayIndex: number;
    protected constructor(culture: AbstractCulture, dayIndex: number);
    getDayIndex(): number;
    protected getCulture(): Culture;
    getName(): string;
    toString(): string;
}
declare abstract class LoopTyme extends AbstractTyme {
    protected names: string[];
    protected index: number;
    protected constructor(names: string[], indexOrName: number | string);
    protected indexOfBy(indexOrName: number | string): number;
    getName(): string;
    getIndex(): number;
    getSize(): number;
    protected nextIndex(n: number): number;
    stepsTo(targetIndex: number): number;
    stepsBackTo(targetIndex: number): number;
    stepsCloseTo(targetIndex: number): number;
}
declare class Animal extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Animal;
    static fromName(name: string): Animal;
    next(n: number): Animal;
    getTwentyEightStar(): TwentyEightStar;
}
declare class TwentyEightStar extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): TwentyEightStar;
    static fromName(name: string): TwentyEightStar;
    next(n: number): TwentyEightStar;
    getSevenStar(): SevenStar;
    getLand(): Land;
    getZone(): Zone;
    getAnimal(): Animal;
    getLuck(): Luck;
}
declare class SevenStar extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): SevenStar;
    static fromName(name: string): SevenStar;
    next(n: number): SevenStar;
    getWeek(): Week;
}
declare class Week extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Week;
    static fromName(name: string): Week;
    next(n: number): Week;
    getSevenStar(): SevenStar;
}
declare class Land extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Land;
    static fromName(name: string): Land;
    next(n: number): Land;
    getDirection(): Direction;
}
declare class Direction extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Direction;
    static fromName(name: string): Direction;
    next(n: number): Direction;
    getLand(): Land;
    getElement(): Element;
}
declare class Zone extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Zone;
    static fromName(name: string): Zone;
    next(n: number): Zone;
    getDirection(): Direction;
    getBeast(): Beast;
}
declare class Beast extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Beast;
    static fromName(name: string): Beast;
    next(n: number): Beast;
    getZone(): Zone;
}
declare class Luck extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Luck;
    static fromName(name: string): Luck;
    next(n: number): Luck;
}
declare class Constellation extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Constellation;
    static fromName(name: string): Constellation;
    next(n: number): Constellation;
}
declare class Duty extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Duty;
    static fromName(name: string): Duty;
    next(n: number): Duty;
}
declare class Element extends LoopTyme {
    static NAMES: string[];
    protected constructor(names: string[] | null, indexOrName: number | string);
    static fromIndex(index: number | string): Element;
    static fromName(name: string): Element;
    next(n: number): Element;
    getReinforce(): Element;
    getRestrain(): Element;
    getReinforced(): Element;
    getRestrained(): Element;
    getDirection(): Direction;
}
declare class God extends LoopTyme {
    static NAMES: string[];
    protected static dayGods: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): God;
    static fromName(name: string): God;
    next(n: number): God;
    getLuck(): Luck;
    static getDayGods(month: SixtyCycle, day: SixtyCycle): God[];
}
declare class Phase extends LoopTyme {
    static NAMES: string[];
    protected lunarYear: number;
    protected lunarMonth: number;
    protected constructor(lunarYear: number | string, lunarMonth: number | string, indexOrName: number | string);
    static fromIndex(lunarYear: number | string, lunarMonth: number | string, index: number | string): Phase;
    static fromName(lunarYear: number | string, lunarMonth: number | string, name: string): Phase;
    next(n: number): Phase;
    protected getStartSolarTime(): SolarTime;
    getSolarTime(): SolarTime;
    getSolarDay(): SolarDay;
}
declare class PhaseDay extends AbstractCultureDay {
    constructor(phase: Phase, dayIndex: number);
    getPhase(): Phase;
}
declare class Sixty extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Sixty;
    static fromName(name: string): Sixty;
    next(n: number): Sixty;
}
declare class Sound extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Sound;
    static fromName(name: string): Sound;
    next(n: number): Sound;
}
declare class Taboo extends LoopTyme {
    static NAMES: string[];
    protected static dayTaboo: string[];
    protected static hourTaboo: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Taboo;
    static fromName(name: string): Taboo;
    next(n: number): Taboo;
    static _getTaboos(data: string[], supIndex: number, subIndex: number, index: number): Taboo[];
    static getDayRecommends(month: SixtyCycle, day: SixtyCycle): Taboo[];
    static getDayAvoids(month: SixtyCycle, day: SixtyCycle): Taboo[];
    static getHourRecommends(day: SixtyCycle, hour: SixtyCycle): Taboo[];
    static getHourAvoids(day: SixtyCycle, hour: SixtyCycle): Taboo[];
}
declare class Ten extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Ten;
    static fromName(name: string): Ten;
    next(n: number): Ten;
}
declare class Terrain extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Terrain;
    static fromName(name: string): Terrain;
    next(n: number): Terrain;
}
declare class Twenty extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Twenty;
    static fromName(name: string): Twenty;
    next(n: number): Twenty;
    getSixty(): Sixty;
}
declare class Zodiac extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Zodiac;
    static fromName(name: string): Zodiac;
    next(n: number): Zodiac;
    getEarthBranch(): EarthBranch;
}
declare class EarthBranch extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): EarthBranch;
    static fromName(name: string): EarthBranch;
    next(n: number): EarthBranch;
    getElement(): Element;
    getYinYang(): YinYang;
    getHideHeavenStemMain(): HeavenStem;
    getHideHeavenStemMiddle(): HeavenStem | null;
    getHideHeavenStemResidual(): HeavenStem | null;
    getHideHeavenStems(): HideHeavenStem[];
    getZodiac(): Zodiac;
    getDirection(): Direction;
    getOpposite(): EarthBranch;
    getOminous(): Direction;
    getPengZuEarthBranch(): PengZuEarthBranch;
    getCombine(): EarthBranch;
    getHarm(): EarthBranch;
    combine(target: EarthBranch): Element | null;
}
declare class HeavenStem extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): HeavenStem;
    static fromName(name: string): HeavenStem;
    next(n: number): HeavenStem;
    getElement(): Element;
    getYinYang(): YinYang;
    getTenStar(target: HeavenStem): TenStar;
    getDirection(): Direction;
    getJoyDirection(): Direction;
    getYangDirection(): Direction;
    getYinDirection(): Direction;
    getWealthDirection(): Direction;
    getMascotDirection(): Direction;
    getPengZuHeavenStem(): PengZuHeavenStem;
    getTerrain(earthBranch: EarthBranch): Terrain;
    getCombine(): HeavenStem;
    combine(target: HeavenStem): Element | null;
}
declare class HideHeavenStem extends AbstractCulture {
    protected heavenStem: HeavenStem;
    protected type: HideHeavenStemType;
    constructor(heavenStem: HeavenStem | string | number, type: HideHeavenStemType);
    getName(): string;
    getHeavenStem(): HeavenStem;
    getType(): HideHeavenStemType;
}
declare class HideHeavenStemDay extends AbstractCultureDay {
    constructor(hideHeavenStem: HideHeavenStem, dayIndex: number);
    getHideHeavenStem(): HideHeavenStem;
    getName(): string;
    toString(): string;
}
declare class PengZuHeavenStem extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): PengZuHeavenStem;
    static fromName(name: string): PengZuHeavenStem;
    next(n: number): PengZuHeavenStem;
}
declare class PengZuEarthBranch extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): PengZuEarthBranch;
    static fromName(name: string): PengZuEarthBranch;
    next(n: number): PengZuEarthBranch;
}
declare class PengZu extends AbstractCulture {
    protected pengZuHeavenStem: PengZuHeavenStem;
    protected pengZuEarthBranch: PengZuEarthBranch;
    protected constructor(sixtyCycle: SixtyCycle);
    static fromSixtyCycle(sixtyCycle: SixtyCycle): PengZu;
    getName(): string;
    getPengZuHeavenStem(): PengZuHeavenStem;
    getPengZuEarthBranch(): PengZuEarthBranch;
}
declare class TenStar extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): TenStar;
    static fromName(name: string): TenStar;
    next(n: number): TenStar;
}
declare class SixStar extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): SixStar;
    static fromName(name: string): SixStar;
    next(n: number): SixStar;
}
declare class MinorRen extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): MinorRen;
    static fromName(name: string): MinorRen;
    next(n: number): MinorRen;
    getLuck(): Luck;
    getElement(): Element;
}
declare class SixtyCycle extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): SixtyCycle;
    static fromName(name: string): SixtyCycle;
    next(n: number): SixtyCycle;
    getHeavenStem(): HeavenStem;
    getEarthBranch(): EarthBranch;
    getSound(): Sound;
    getPengZu(): PengZu;
    getTen(): Ten;
    getExtraEarthBranches(): EarthBranch[];
}
declare class Dog extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Dog;
    static fromName(name: string): Dog;
    next(n: number): Dog;
}
declare class DogDay extends AbstractCultureDay {
    constructor(dog: Dog, dayIndex: number);
    getDog(): Dog;
}
declare class PlumRain extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): PlumRain;
    static fromName(name: string): PlumRain;
    next(n: number): PlumRain;
}
declare class PlumRainDay extends AbstractCultureDay {
    constructor(plumRain: PlumRain, dayIndex: number);
    getPlumRain(): PlumRain;
    toString(): string;
}
declare class FetusHeavenStem extends LoopTyme {
    static NAMES: string[];
    constructor(index: number);
    next(n: number): FetusHeavenStem;
}
declare class FetusEarthBranch extends LoopTyme {
    static NAMES: string[];
    constructor(index: number);
    next(n: number): FetusEarthBranch;
}
declare class FetusDay extends AbstractCulture {
    protected fetusHeavenStem: FetusHeavenStem;
    protected fetusEarthBranch: FetusEarthBranch;
    protected side: Side;
    protected direction: Direction;
    protected constructor(sixtyCycle: SixtyCycle);
    static fromLunarDay(lunarDay: LunarDay): FetusDay;
    static fromSixtyCycleDay(sixtyCycleDay: SixtyCycleDay): FetusDay;
    getName(): string;
    getSide(): Side;
    getDirection(): Direction;
    getFetusHeavenStem(): FetusHeavenStem;
    getFetusEarthBranch(): FetusEarthBranch;
}
declare class Nine extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Nine;
    static fromName(name: string): Nine;
    next(n: number): Nine;
}
declare class NineDay extends AbstractCultureDay {
    constructor(nine: Nine, dayIndex: number);
    getNine(): Nine;
}
declare class Phenology extends LoopTyme {
    static NAMES: string[];
    protected year: number;
    protected constructor(year: number | string, indexOrName: number | string);
    static fromIndex(year: number | string, index: number | string): Phenology;
    static fromName(year: number | string, name: string): Phenology;
    next(n: number): Phenology;
    getYear(): number;
    getThreePhenology(): ThreePhenology;
    getJulianDay(): JulianDay;
}
declare class ThreePhenology extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): ThreePhenology;
    static fromName(name: string): ThreePhenology;
    next(n: number): ThreePhenology;
    getThreePhenology(): ThreePhenology;
}
declare class Dipper extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Dipper;
    static fromName(name: string): Dipper;
    next(n: number): Dipper;
}
declare class PhenologyDay extends AbstractCultureDay {
    constructor(phenology: Phenology, dayIndex: number);
    getPhenology(): Phenology;
}
declare class NineStar extends LoopTyme {
    static NAMES: string[];
    static COLORS: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): NineStar;
    static fromName(name: string): NineStar;
    next(n: number): NineStar;
    getColor(): string;
    getElement(): Element;
    getDipper(): Dipper;
    getDirection(): Direction;
    toString(): string;
}
declare class TwelveStar extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): TwelveStar;
    static fromName(name: string): TwelveStar;
    next(n: number): TwelveStar;
    getEcliptic(): Ecliptic;
}
declare class Ecliptic extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): Ecliptic;
    static fromName(name: string): Ecliptic;
    next(n: number): Ecliptic;
    getLuck(): Luck;
}
declare class LunarYear extends YearUnit {
    protected static isInit: boolean;
    protected static LEAP: number[][];
    protected static init(): void;
    protected constructor(year: number | string);
    static validate(year: number): void;
    static fromYear(year: number | string): LunarYear;
    getDayCount(): number;
    getMonthCount(): number;
    getName(): string;
    next(n: number): LunarYear;
    getLeapMonth(): number;
    getSixtyCycle(): SixtyCycle;
    getTwenty(): Twenty;
    getNineStar(): NineStar;
    getJupiterDirection(): Direction;
    getFirstMonth(): LunarMonth;
    getMonths(): LunarMonth[];
    getKitchenGodSteed(): KitchenGodSteed;
}
declare class LunarSeason extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): LunarSeason;
    static fromName(name: string): LunarSeason;
    next(n: number): LunarSeason;
}
declare class FetusMonth extends LoopTyme {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromLunarMonth(lunarMonth: LunarMonth): FetusMonth | null;
    next(n: number): FetusMonth;
}
declare class LunarMonth extends MonthUnit {
    static NAMES: string[];
    protected leap: boolean;
    constructor(year: number | string, month: number | string);
    static validate(year: number, month: number): void;
    static fromYm(year: number | string, month: number | string): LunarMonth;
    protected getNewMoon(): number;
    getLunarYear(): LunarYear;
    getMonthWithLeap(): number;
    getDayCount(): number;
    getIndexInYear(): number;
    getSeason(): LunarSeason;
    getFirstJulianDay(): JulianDay;
    isLeap(): boolean;
    getWeekCount(start: number): number;
    getName(): string;
    toString(): string;
    next(n: number): LunarMonth;
    getDays(): LunarDay[];
    getFirstDay(): LunarDay;
    getWeeks(start: number): LunarWeek[];
    getSixtyCycle(): SixtyCycle;
    getNineStar(): NineStar;
    getJupiterDirection(): Direction;
    getFetus(): FetusMonth | null;
    getMinorRen(): MinorRen;
}
declare class LunarWeek extends WeekUnit {
    protected constructor(year: number | string, month: number | string, index: number | string, start: number | string);
    static validate(year: number, month: number, index: number, start: number): void;
    static fromYm(year: number | string, month: number | string, index: number | string, start: number | string): LunarWeek;
    getLunarMonth(): LunarMonth;
    getName(): string;
    toString(): string;
    next(n: number): LunarWeek;
    getFirstDay(): LunarDay;
    getDays(): LunarDay[];
    equals(o: LunarWeek): boolean;
}
declare class LunarDay extends DayUnit {
    static NAMES: string[];
    protected constructor(year: number | string, month: number | string, day: number | string);
    static validate(year: number, month: number, day: number): void;
    static fromYmd(year: number | string, month: number | string, day: number | string): LunarDay;
    getLunarMonth(): LunarMonth;
    getName(): string;
    toString(): string;
    next(n: number): LunarDay;
    isBefore(target: LunarDay): boolean;
    isAfter(target: LunarDay): boolean;
    getWeek(): Week;
    getYearSixtyCycle(): SixtyCycle;
    getMonthSixtyCycle(): SixtyCycle;
    getSixtyCycle(): SixtyCycle;
    getDuty(): Duty;
    getTwelveStar(): TwelveStar;
    getNineStar(): NineStar;
    getJupiterDirection(): Direction;
    getFetusDay(): FetusDay;
    getPhaseDay(): PhaseDay;
    getPhase(): Phase;
    getSolarDay(): SolarDay;
    getSixtyCycleDay(): SixtyCycleDay;
    getTwentyEightStar(): TwentyEightStar;
    getFestival(): LunarFestival | null;
    getSixStar(): SixStar;
    getGods(): God[];
    getRecommends(): Taboo[];
    getAvoids(): Taboo[];
    getHours(): LunarHour[];
    getMinorRen(): MinorRen;
    getThreePillars(): ThreePillars;
}
declare class SixtyCycleYear extends AbstractTyme {
    protected year: number;
    protected constructor(year: number | string);
    static fromYear(year: number | string): SixtyCycleYear;
    getYear(): number;
    getName(): string;
    next(n: number): SixtyCycleYear;
    getSixtyCycle(): SixtyCycle;
    getTwenty(): Twenty;
    getNineStar(): NineStar;
    getJupiterDirection(): Direction;
    getFirstMonth(): SixtyCycleMonth;
    getMonths(): SixtyCycleMonth[];
}
declare class SixtyCycleMonth extends AbstractTyme {
    protected year: SixtyCycleYear;
    protected month: SixtyCycle;
    constructor(year: SixtyCycleYear, month: SixtyCycle);
    static fromIndex(year: number | string, index: number | string): SixtyCycleMonth;
    getSixtyCycleYear(): SixtyCycleYear;
    getYear(): SixtyCycle;
    getIndexInYear(): number;
    getName(): string;
    toString(): string;
    next(n: number): SixtyCycleMonth;
    getFirstDay(): SixtyCycleDay;
    getDays(): SixtyCycleDay[];
    getSixtyCycle(): SixtyCycle;
    getNineStar(): NineStar;
    getJupiterDirection(): Direction;
}
declare class SixtyCycleDay extends AbstractTyme {
    protected solarDay: SolarDay;
    protected month: SixtyCycleMonth;
    protected day: SixtyCycle;
    constructor(solarDay: SolarDay, month: SixtyCycleMonth, day: SixtyCycle);
    static fromSolarDay(solarDay: SolarDay): SixtyCycleDay;
    getSolarDay(): SolarDay;
    getSixtyCycleMonth(): SixtyCycleMonth;
    getYear(): SixtyCycle;
    getMonth(): SixtyCycle;
    getSixtyCycle(): SixtyCycle;
    getName(): string;
    toString(): string;
    next(n: number): SixtyCycleDay;
    getDuty(): Duty;
    getTwelveStar(): TwelveStar;
    getNineStar(): NineStar;
    getJupiterDirection(): Direction;
    getFetusDay(): FetusDay;
    getTwentyEightStar(): TwentyEightStar;
    getGods(): God[];
    getRecommends(): Taboo[];
    getAvoids(): Taboo[];
    getHours(): SixtyCycleHour[];
    getThreePillars(): ThreePillars;
}
declare class SixtyCycleHour extends AbstractTyme {
    protected solarTime: SolarTime;
    protected day: SixtyCycleDay;
    protected hour: SixtyCycle;
    constructor(solarTime: SolarTime);
    static fromSolarTime(solarTime: SolarTime): SixtyCycleHour;
    getYear(): SixtyCycle;
    getMonth(): SixtyCycle;
    getDay(): SixtyCycle;
    getSixtyCycle(): SixtyCycle;
    getSixtyCycleDay(): SixtyCycleDay;
    getSolarTime(): SolarTime;
    getName(): string;
    toString(): string;
    getIndexInDay(): number;
    next(n: number): SixtyCycleHour;
    getTwelveStar(): TwelveStar;
    getNineStar(): NineStar;
    getEightChar(): EightChar;
    getRecommends(): Taboo[];
    getAvoids(): Taboo[];
}
declare class ThreePillars extends AbstractCulture {
    protected year: SixtyCycle;
    protected month: SixtyCycle;
    protected day: SixtyCycle;
    constructor(year: SixtyCycle | string, month: SixtyCycle | string, day: SixtyCycle | string);
    getYear(): SixtyCycle;
    getMonth(): SixtyCycle;
    getDay(): SixtyCycle;
    getName(): string;
    getSolarDays(startYear: number, endYear: number): SolarDay[];
}
interface EightCharProvider {
    getEightChar(hour: LunarHour): EightChar;
}
declare class DefaultEightCharProvider implements EightCharProvider {
    getEightChar(hour: LunarHour): EightChar;
}
declare class LunarSect2EightCharProvider implements EightCharProvider {
    getEightChar(hour: LunarHour): EightChar;
}
declare class LunarHour extends SecondUnit {
    static provider: EightCharProvider;
    protected constructor(year: number | string, month: number | string, day: number | string, hour: number | string, minute: number | string, second: number | string);
    static validate(year: number, month: number, day: number, hour: number, minute: number, second: number): void;
    static fromYmdHms(year: number | string, month: number | string, day: number | string, hour: number | string, minute: number | string, second: number | string): LunarHour;
    getLunarDay(): LunarDay;
    getName(): string;
    toString(): string;
    getIndexInDay(): number;
    next(n: number): LunarHour;
    isBefore(target: LunarHour): boolean;
    isAfter(target: LunarHour): boolean;
    getYearSixtyCycle(): SixtyCycle;
    getMonthSixtyCycle(): SixtyCycle;
    getDaySixtyCycle(): SixtyCycle;
    getSixtyCycle(): SixtyCycle;
    getTwelveStar(): TwelveStar;
    getNineStar(): NineStar;
    getSolarTime(): SolarTime;
    getSixtyCycleHour(): SixtyCycleHour;
    getEightChar(): EightChar;
    getRecommends(): Taboo[];
    getAvoids(): Taboo[];
    getMinorRen(): MinorRen;
}
declare class JulianDay extends AbstractTyme {
    static J2000: number;
    protected day: number;
    protected constructor(day: number | string);
    static fromJulianDay(day: number | string): JulianDay;
    static fromYmdHms(year: number | string, month: number | string, day: number | string, hour: number | string, minute: number | string, second: number | string): JulianDay;
    getDay(): number;
    getName(): string;
    next(n: number): JulianDay;
    getSolarDay(): SolarDay;
    getSolarTime(): SolarTime;
    getWeek(): Week;
    subtract(target: JulianDay): number;
}
declare class ShouXingUtil {
    static PI_2: number;
    static ONE_THIRD: number;
    static SECOND_PER_DAY: number;
    static SECOND_PER_RAD: number;
    private static NUT_B;
    private static DT_AT;
    private static XL0;
    private static XL1;
    private static QI_KB;
    private static QB;
    private static SHUO_KB;
    private static SB;
    private static decode;
    static nutationLon2(t: number): number;
    static eLon(t: number, n: number): number;
    static mLon(t: number, n: number): number;
    static gxcSunLon(t: number): number;
    static ev(t: number): number;
    static saLon(t: number, n: number): number;
    static dtExt(y: number, jsd: number): number;
    static dtCalc(y: number): number;
    static dtT(t: number): number;
    static mv(t: number): number;
    static saLonT(w: number): number;
    static msaLon(t: number, mn: number, sn: number): number;
    static msaLonT(w: number): number;
    static saLonT2(w: number): number;
    static msaLonT2(w: number): number;
    static qiHigh(w: number): number;
    static shuoHigh(w: number): number;
    static qiLow(w: number): number;
    static shuoLow(w: number): number;
    static qiShuo(isQi: boolean, isHigh: boolean, jd: number, pc: number): number;
    static calc(isQi: boolean, jd: number, kb: number[], pc: number, fkb: string): number;
    static calcShuo(jd: number): number;
    static calcQi(jd: number): number;
    static qiAccurate(w: number): number;
    static qiAccurate2(jd: number): number;
}
declare class SolarTerm extends LoopTyme {
    static NAMES: string[];
    protected year: number;
    protected cursoryJulianDay: number;
    protected constructor(year: number | string, indexOrName: number | string);
    static fromIndex(year: number | string, index: number | string): SolarTerm;
    static fromName(year: number | string, name: string): SolarTerm;
    next(n: number): SolarTerm;
    isJie(): boolean;
    isQi(): boolean;
    getJulianDay(): JulianDay;
    getSolarDay(): SolarDay;
    getYear(): number;
    getCursoryJulianDay(): number;
}
declare class SolarTermDay extends AbstractCultureDay {
    constructor(solarTerm: SolarTerm, dayIndex: number);
    getSolarTerm(): SolarTerm;
}
declare class SolarYear extends YearUnit {
    protected constructor(year: number | string);
    static validate(year: number): void;
    static fromYear(year: number | string): SolarYear;
    getDayCount(): number;
    isLeap(): boolean;
    getName(): string;
    next(n: number): SolarYear;
    getMonths(): SolarMonth[];
    getSeasons(): SolarSeason[];
    getHalfYears(): SolarHalfYear[];
    getRabByungYear(): RabByungYear;
}
declare class SolarHalfYear extends YearUnit {
    static NAMES: string[];
    protected index: number;
    protected constructor(year: number | string, index: number | string);
    static validate(year: number, index: number): void;
    static fromIndex(year: number | string, index: number | string): SolarHalfYear;
    getSolarYear(): SolarYear;
    getIndex(): number;
    getName(): string;
    toString(): string;
    next(n: number): SolarHalfYear;
    getMonths(): SolarMonth[];
    getSeasons(): SolarSeason[];
}
declare class SolarSeason extends YearUnit {
    static NAMES: string[];
    protected index: number;
    protected constructor(year: number | string, index: number | string);
    static validate(year: number, index: number): void;
    static fromIndex(year: number | string, index: number | string): SolarSeason;
    getSolarYear(): SolarYear;
    getIndex(): number;
    getName(): string;
    toString(): string;
    next(n: number): SolarSeason;
    getMonths(): SolarMonth[];
}
declare class SolarMonth extends MonthUnit {
    static NAMES: string[];
    static DAYS: number[];
    protected constructor(year: number | string, month: number | string);
    static validate(year: number, month: number): void;
    static fromYm(year: number | string, month: number | string): SolarMonth;
    getSolarYear(): SolarYear;
    getDayCount(): number;
    getIndexInYear(): number;
    getSeason(): SolarSeason;
    getWeekCount(start: number): number;
    getName(): string;
    toString(): string;
    next(n: number): SolarMonth;
    getWeeks(start: number): SolarWeek[];
    getDays(): SolarDay[];
    getFirstDay(): SolarDay;
}
declare class SolarWeek extends WeekUnit {
    protected constructor(year: number | string, month: number | string, index: number | string, start: number | string);
    static validate(year: number, month: number, index: number, start: number): void;
    static fromYm(year: number | string, month: number | string, index: number | string, start: number | string): SolarWeek;
    getSolarMonth(): SolarMonth;
    getIndexInYear(): number;
    getName(): string;
    toString(): string;
    next(n: number): SolarWeek;
    getFirstDay(): SolarDay;
    getDays(): SolarDay[];
    equals(o: SolarWeek): boolean;
}
declare class SolarDay extends DayUnit {
    static NAMES: string[];
    protected constructor(year: number | string, month: number | string, day: number | string);
    static validate(year: number, month: number, day: number): void;
    static fromYmd(year: number | string, month: number | string, day: number | string): SolarDay;
    getSolarMonth(): SolarMonth;
    getWeek(): Week;
    getConstellation(): Constellation;
    getName(): string;
    toString(): string;
    next(n: number): SolarDay;
    isBefore(target: SolarDay): boolean;
    isAfter(target: SolarDay): boolean;
    getTerm(): SolarTerm;
    getTermDay(): SolarTermDay;
    getSolarWeek(start: number): SolarWeek;
    getPhenologyDay(): PhenologyDay;
    getPhenology(): Phenology;
    getDogDay(): DogDay | null;
    getPlumRainDay(): PlumRainDay | null;
    getHideHeavenStemDay(): HideHeavenStemDay;
    getNineDay(): NineDay | null;
    getIndexInYear(): number;
    subtract(target: SolarDay): number;
    getJulianDay(): JulianDay;
    getLunarDay(): LunarDay;
    getRabByungDay(): RabByungDay;
    getSixtyCycleDay(): SixtyCycleDay;
    getLegalHoliday(): LegalHoliday | null;
    getFestival(): SolarFestival | null;
    getPhaseDay(): PhaseDay;
    getPhase(): Phase;
    getNineStar(): NineStar;
    getHijriDay(): HijriDay;
}
declare class SolarTime extends SecondUnit {
    protected constructor(year: number | string, month: number | string, day: number | string, hour: number | string, minute: number | string, second: number | string);
    static validate(year: number, month: number, day: number, hour: number, minute: number, second: number): void;
    static fromYmdHms(year: number | string, month: number | string, day: number | string, hour: number | string, minute: number | string, second: number | string): SolarTime;
    getSolarDay(): SolarDay;
    getName(): string;
    toString(): string;
    next(n: number): SolarTime;
    isBefore(target: SolarTime): boolean;
    isAfter(target: SolarTime): boolean;
    getTerm(): SolarTerm;
    getPhenology(): Phenology;
    getJulianDay(): JulianDay;
    subtract(target: SolarTime): number;
    getLunarHour(): LunarHour;
    getSixtyCycleHour(): SixtyCycleHour;
    getPhase(): Phase;
}
declare class LegalHoliday extends AbstractTyme {
    static NAMES: string[];
    static DATA: string;
    protected day: SolarDay;
    protected name: string;
    protected work: boolean;
    protected constructor(year: number, month: number, day: number, data: string);
    static fromYmd(year: number, month: number, day: number): LegalHoliday | null;
    getName(): string;
    getDay(): SolarDay;
    isWork(): boolean;
    toString(): string;
    next(n: number): LegalHoliday | null;
}
declare abstract class AbstractFestival extends AbstractTyme {
    protected index: number;
    protected day: DayUnit;
    protected event: Event;
    protected constructor(index: number, event: Event, day: DayUnit);
    getName(): string;
    getIndex(): number;
    getDay(): DayUnit;
    toString(): string;
}
declare class SolarFestival extends AbstractFestival {
    static NAMES: string[];
    static DATA: string;
    protected constructor(index: number, event: Event, day: SolarDay);
    static fromIndex(year: number | string, index: number | string): SolarFestival | null;
    static fromYmd(year: number | string, month: number | string, day: number | string): SolarFestival | null;
    getDay(): SolarDay;
    getStartYear(): number;
    next(n: number): SolarFestival | null;
}
declare class LunarFestival extends AbstractFestival {
    static NAMES: string[];
    static DATA: string;
    protected constructor(index: number, event: Event, day: LunarDay);
    static fromIndex(year: number | string, index: number | string): LunarFestival | null;
    static fromYmd(year: number | string, month: number | string, day: number | string): LunarFestival | null;
    getDay(): LunarDay;
    getSolarTerm(): SolarTerm | null;
    next(n: number): LunarFestival;
}
declare class EightChar extends AbstractCulture {
    protected threePillars: ThreePillars;
    protected hour: SixtyCycle;
    constructor(year: SixtyCycle | string, month: SixtyCycle | string, day: SixtyCycle | string, hour: SixtyCycle | string);
    getYear(): SixtyCycle;
    getMonth(): SixtyCycle;
    getDay(): SixtyCycle;
    getHour(): SixtyCycle;
    getFetalOrigin(): SixtyCycle;
    getFetalBreath(): SixtyCycle;
    getOwnSign(): SixtyCycle;
    getBodySign(): SixtyCycle;
    getDuty(): Duty;
    getName(): string;
    getSolarTimes(startYear: number, endYear: number): SolarTime[];
}
declare class ChildLimitInfo {
    protected startTime: SolarTime;
    protected endTime: SolarTime;
    protected yearCount: number;
    protected monthCount: number;
    protected dayCount: number;
    protected hourCount: number;
    protected minuteCount: number;
    constructor(startTime: SolarTime, endTime: SolarTime, yearCount: number, monthCount: number, dayCount: number, hourCount: number, minuteCount: number);
    getStartTime(): SolarTime;
    getEndTime(): SolarTime;
    getYearCount(): number;
    getMonthCount(): number;
    getDayCount(): number;
    getHourCount(): number;
    getMinuteCount(): number;
}
interface ChildLimitProvider {
    getInfo(birthTime: SolarTime, term: SolarTerm): ChildLimitInfo;
}
declare abstract class AbstractChildLimitProvider implements ChildLimitProvider {
    next(birthTime: SolarTime, addYear: number, addMonth: number, addDay: number, addHour: number, addMinute: number, addSecond: number): ChildLimitInfo;
    abstract getInfo(birthTime: SolarTime, term: SolarTerm): ChildLimitInfo;
}
declare class DefaultChildLimitProvider extends AbstractChildLimitProvider {
    getInfo(birthTime: SolarTime, term: SolarTerm): ChildLimitInfo;
}
declare class China95ChildLimitProvider extends AbstractChildLimitProvider {
    getInfo(birthTime: SolarTime, term: SolarTerm): ChildLimitInfo;
}
declare class LunarSect1ChildLimitProvider extends AbstractChildLimitProvider {
    getInfo(birthTime: SolarTime, term: SolarTerm): ChildLimitInfo;
}
declare class LunarSect2ChildLimitProvider extends AbstractChildLimitProvider {
    getInfo(birthTime: SolarTime, term: SolarTerm): ChildLimitInfo;
}
declare class ChildLimit {
    static provider: ChildLimitProvider;
    protected eightChar: EightChar;
    protected gender: Gender;
    protected forward: boolean;
    protected info: ChildLimitInfo;
    protected constructor(birthTime: SolarTime, gender: Gender);
    static fromSolarTime(birthTime: SolarTime, gender: Gender): ChildLimit;
    getEightChar(): EightChar;
    getGender(): Gender;
    getYearCount(): number;
    getMonthCount(): number;
    getDayCount(): number;
    getHourCount(): number;
    getMinuteCount(): number;
    getStartTime(): SolarTime;
    getEndTime(): SolarTime;
    isForward(): boolean;
    getStartDecadeFortune(): DecadeFortune;
    getDecadeFortune(): DecadeFortune;
    getStartFortune(): Fortune;
    getEndLunarYear(): LunarYear;
    getStartSixtyCycleYear(): SixtyCycleYear;
    getEndSixtyCycleYear(): SixtyCycleYear;
    getStartAge(): number;
    getEndAge(): number;
}
declare class DecadeFortune extends AbstractTyme {
    protected childLimit: ChildLimit;
    protected index: number;
    protected constructor(childLimit: ChildLimit, index: number);
    static fromChildLimit(childLimit: ChildLimit, index: number): DecadeFortune;
    getStartAge(): number;
    getEndAge(): number;
    getStartLunarYear(): LunarYear;
    getEndLunarYear(): LunarYear;
    getStartSixtyCycleYear(): SixtyCycleYear;
    getEndSixtyCycleYear(): SixtyCycleYear;
    getSixtyCycle(): SixtyCycle;
    getName(): string;
    next(n: number): DecadeFortune;
    getStartFortune(): Fortune;
}
declare class Fortune extends AbstractTyme {
    protected childLimit: ChildLimit;
    protected index: number;
    protected constructor(childLimit: ChildLimit, index: number);
    static fromChildLimit(childLimit: ChildLimit, index: number): Fortune;
    getAge(): number;
    getLunarYear(): LunarYear;
    getSixtyCycleYear(): SixtyCycleYear;
    getSixtyCycle(): SixtyCycle;
    getName(): string;
    next(n: number): Fortune;
}
declare class KitchenGodSteed extends AbstractCulture {
    static NUMBERS: string[];
    protected firstDaySixtyCycle: SixtyCycle;
    protected constructor(lunarYear: number | string);
    static fromLunarYear(lunarYear: number | string): KitchenGodSteed;
    protected byHeavenStem(n: number): string;
    protected byEarthBranch(n: number): string;
    getMouse(): string;
    getGrass(): string;
    getCattle(): string;
    getFlower(): string;
    getDragon(): string;
    getHorse(): string;
    getChicken(): string;
    getSilkworm(): string;
    getPig(): string;
    getField(): string;
    getCake(): string;
    getGold(): string;
    getPeopleCakes(): string;
    getPeopleHoes(): string;
    getName(): string;
}
declare class RabByungElement extends Element {
    static NAMES: string[];
    protected constructor(indexOrName: number | string);
    static fromIndex(index: number | string): RabByungElement;
    static fromName(name: string): RabByungElement;
    next(n: number): RabByungElement;
    getReinforce(): RabByungElement;
    getRestrain(): RabByungElement;
    getReinforced(): RabByungElement;
    getRestrained(): RabByungElement;
}
declare class RabByungYear extends AbstractTyme {
    protected rabByungIndex: number;
    protected elementIndex: number;
    protected zodiacIndex: number;
    protected constructor(rabByungIndex: number | string, elementIndex: number | string, zodiacIndex: number | string);
    static validate(year: number): void;
    static fromYear(year: number | string): RabByungYear;
    static fromSixtyCycle(rabByungIndex: number | string, sixtyCycle: SixtyCycle): RabByungYear;
    static fromElementZodiac(rabByungIndex: number | string, element: RabByungElement, zodiac: Zodiac): RabByungYear;
    getRabByungIndex(): number;
    getSixtyCycle(): SixtyCycle;
    getZodiac(): Zodiac;
    getElement(): RabByungElement;
    getName(): string;
    next(n: number): RabByungYear;
    getYear(): number;
    getLeapMonth(): number;
    getSolarYear(): SolarYear;
    getFirstMonth(): RabByungMonth;
    getMonthCount(): number;
    getMonths(): RabByungMonth[];
}
declare class RabByungMonth extends MonthUnit {
    static DAYS: Record<string, number[]>;
    static ALIAS: string[];
    protected static isInit: boolean;
    protected leap: boolean;
    protected static init(): void;
    constructor(year: number | string, month: number | string);
    static validate(year: number, month: number): void;
    static fromYm(year: number | string, month: number | string): RabByungMonth;
    getRabByungYear(): RabByungYear;
    getMonthWithLeap(): number;
    getDayCount(): number;
    getIndexInYear(): number;
    isLeap(): boolean;
    getName(): string;
    getAlias(): string;
    toString(): string;
    next(n: number): RabByungMonth;
    getSpecialDays(): number[];
    getLeapDays(): number[];
    getMissDays(): number[];
    getDays(): RabByungDay[];
    getFirstDay(): RabByungDay;
}
declare class RabByungDay extends DayUnit {
    static NAMES: string[];
    protected leap: boolean;
    protected constructor(year: number | string, month: number | string, day: number | string);
    static validate(year: number, month: number, day: number): void;
    static fromYmd(year: number | string, month: number | string, day: number | string): RabByungDay;
    static fromSolarDay(solarDay: SolarDay): RabByungDay;
    getRabByungMonth(): RabByungMonth;
    isLeap(): boolean;
    getDayWithLeap(): number;
    getName(): string;
    toString(): string;
    next(n: number): RabByungDay;
    subtract(target: RabByungDay): number;
    getSolarDay(): SolarDay;
}
declare class HijriYear extends YearUnit {
    protected constructor(year: number | string);
    static validate(year: number): void;
    static fromYear(year: number | string): HijriYear;
    getDayCount(): number;
    isLeap(): boolean;
    getName(): string;
    next(n: number): HijriYear;
    getMonths(): HijriMonth[];
    getFirstMonth(): HijriMonth;
}
declare class HijriMonth extends MonthUnit {
    static NAMES: string[];
    protected constructor(year: number | string, month: number | string);
    static validate(year: number, month: number): void;
    static fromYm(year: number | string, month: number | string): HijriMonth;
    getHijriYear(): HijriYear;
    getDayCount(): number;
    getIndexInYear(): number;
    getName(): string;
    toString(): string;
    next(n: number): HijriMonth;
    getDays(): HijriDay[];
    getFirstDay(): HijriDay;
}
declare class HijriDay extends DayUnit {
    static NAMES: string[];
    protected constructor(year: number | string, month: number | string, day: number | string);
    static validate(year: number, month: number, day: number): void;
    static fromYmd(year: number | string, month: number | string, day: number | string): HijriDay;
    getHijriMonth(): HijriMonth;
    getName(): string;
    toString(): string;
    next(n: number): HijriDay;
    isBefore(target: HijriDay): boolean;
    isAfter(target: HijriDay): boolean;
    subtract(target: HijriDay): number;
    getJulianDay(): JulianDay;
    getSolarDay(): SolarDay;
    getIndexInYear(): number;
}
declare class Event extends AbstractCulture {
    protected name: string;
    protected data: string;
    static validate(data: string): void;
    constructor(name: string, data: string);
    static builder(): EventBuilder;
    static fromName(name: string): Event | null;
    protected getCharIndex(index: number): number;
    getValue(index: number): number;
    getMonth(year: number): number[];
    getType(): EventType;
    getName(): string;
    getData(): string;
    getStartYear(): number;
    static fromSolarDay(d: SolarDay): Event[];
    static all(): Event[];
    getSolarDay(year: number): SolarDay | null;
    getSolarDayBySolarDay(year: number): SolarDay | null;
    getSolarDayByLunarDay(year: number): SolarDay | null;
    getSolarDayByWeek(year: number): SolarDay | null;
    getSolarDayByTerm(year: number): SolarDay;
    getSolarDayByTermHeavenStem(year: number): SolarDay | null;
    getSolarDayByTermEarthBranch(year: number): SolarDay | null;
}
declare class EventBuilder {
    protected _name: string;
    protected data: string[];
    constructor();
    name(n: string): EventBuilder;
    protected getChar(index: number): string;
    protected setValue(index: number, n: number): EventBuilder;
    protected encodeType(t: EventType): string;
    protected content(t: EventType, a: number, b: number, c: number): EventBuilder;
    solarDay(solarMonth: number, solarDay: number, delayDays: number): EventBuilder;
    lunarDay(lunarMonth: number, lunarDay: number, delayDays: number): EventBuilder;
    solarWeek(solarMonth: number, weekIndex: number, week: number): EventBuilder;
    termDay(termIndex: number, delayDays: number): EventBuilder;
    termHeavenStem(termIndex: number, heavenStemIndex: number, delayDays: number): EventBuilder;
    termEarthBranch(termIndex: number, earthBranchIndex: number, delayDays: number): EventBuilder;
    startYear(year: number): EventBuilder;
    offset(days: number): EventBuilder;
    build(): Event;
}
declare class EventManager {
    static REGEX: string;
    static DATA: string;
    static CHARS: string;
    static remove(name: string): void;
    static saveOrUpdate(name: string, data: string): void;
    static updateData(name: string, data: string): void;
    static update(name: string, e: Event): void;
}

export { AbstractChildLimitProvider, AbstractCulture, AbstractCultureDay, AbstractFestival, AbstractTyme, Animal, Beast, ChildLimit, ChildLimitInfo, China95ChildLimitProvider, Constellation, DayUnit, DecadeFortune, DefaultChildLimitProvider, DefaultEightCharProvider, Dipper, Direction, Dog, DogDay, Duty, EarthBranch, Ecliptic, EightChar, Element, Event, EventManager, EventType, FetusDay, FetusEarthBranch, FetusHeavenStem, FetusMonth, Fortune, Gender, God, HeavenStem, HideHeavenStem, HideHeavenStemDay, HideHeavenStemType, HijriDay, HijriMonth, HijriYear, JulianDay, KitchenGodSteed, Land, LegalHoliday, LoopTyme, Luck, LunarDay, LunarFestival, LunarHour, LunarMonth, LunarSeason, LunarSect1ChildLimitProvider, LunarSect2ChildLimitProvider, LunarSect2EightCharProvider, LunarWeek, LunarYear, MinorRen, MonthUnit, Nine, NineDay, NineStar, PengZu, PengZuEarthBranch, PengZuHeavenStem, Phase, PhaseDay, Phenology, PhenologyDay, PlumRain, PlumRainDay, RabByungDay, RabByungElement, RabByungMonth, RabByungYear, SecondUnit, SevenStar, ShouXingUtil, Side, SixStar, Sixty, SixtyCycle, SixtyCycleDay, SixtyCycleHour, SixtyCycleMonth, SixtyCycleYear, SolarDay, SolarFestival, SolarHalfYear, SolarMonth, SolarSeason, SolarTerm, SolarTermDay, SolarTime, SolarWeek, SolarYear, Sound, Taboo, Ten, TenStar, Terrain, ThreePhenology, ThreePillars, TwelveStar, Twenty, TwentyEightStar, Week, WeekUnit, YearUnit, YinYang, Zodiac, Zone };
export type { ChildLimitProvider, Culture, EightCharProvider, Tyme };
