export declare class I18n {
    private static _DEFAULT_LANG;
    private static _LANG;
    private static _INIT;
    private static _MESSAGES;
    private static _OBJ_STRING;
    private static _DICT_STRING;
    private static _DICT_NUMBER;
    private static _OBJ_NUMBER;
    private static _DICT_ARRAY;
    private static _OBJ_ARRAY;
    private static _ARRAYS;
    private static _OBJ_ARRAYS;
    private static updateArray;
    private static updateStringDictionary;
    private static updateNumberDictionary;
    private static updateArrayDictionary;
    private static update;
    static setMessages(lang: string, messages: Record<string, string>): void;
    static getMessage(key: string): string;
    static setLanguage(lang: string): void;
    static getLanguage(): string;
    private static initArray;
    private static initArrayDictionary;
    private static initStringDictionary;
    private static initNumberDictionary;
    static init(): void;
}
