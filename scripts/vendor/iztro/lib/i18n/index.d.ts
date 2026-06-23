import i18next from 'i18next';
import { Language } from '../data/types';
/**
 * 设置国际化语言。
 * 支持的语言见 type.ts -> Language
 *
 * @param language 需要设置的语言【默认为zh-CN】
 */
export declare const setLanguage: (language: Language) => void;
/**
 * 输出国际化文本。
 *
 * @param str 待翻译的字符串
 * @returns 翻译后的字符串
 */
export declare const t: <T>(str: string) => T;
/**
 * kot(Key of Translation).
 *
 * 通过翻译文本反查Key的值，用于各种计算。
 * 若没有找到则会返回Value本身。
 *
 * @param value 翻译后的字符串
 * @returns 翻译文本的Key值
 */
export declare const kot: <T>(value: string, k?: string) => T;
export * from './types';
export default i18next;
