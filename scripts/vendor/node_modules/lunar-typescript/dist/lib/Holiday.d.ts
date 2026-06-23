export declare class Holiday {
    private _day;
    private _name;
    private _work;
    private _target;
    constructor(day: string, name: string, work: boolean, target: string);
    private static _ymd;
    getDay(): string;
    setDay(value: string): void;
    getName(): string;
    setName(value: string): void;
    isWork(): boolean;
    setWork(value: boolean): void;
    getTarget(): string;
    setTarget(value: string): void;
    toString(): string;
}
