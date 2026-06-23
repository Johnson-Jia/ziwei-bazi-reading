import { Solar } from './Solar';
export declare class JieQi {
    private _name;
    private _solar;
    private readonly _jie;
    private readonly _qi;
    constructor(name: string, solar: Solar);
    getName(): string;
    getSolar(): Solar;
    setName(name: string): void;
    setSolar(solar: Solar): void;
    isJie(): boolean;
    isQi(): boolean;
    toString(): string;
}
