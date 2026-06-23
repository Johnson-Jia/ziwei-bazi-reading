# vendor/ — 内置运行时（离线自包含）

为让 skill **拷贝即用、零网络依赖**，已将两套排盘引擎及其运行时依赖 vendor 到本目录。

## 内容总览

| 路径 | 体系 | 引擎 | 体积 | 外部依赖 |
|---|---|---|---|---|
| `iztro/` + `node_modules/` | 紫微斗数 | iztro v2.5.8 (SylarLong) | ~5.2MB | dayjs/i18next/lunar-lite/lunar-typescript 等(已含) |
| `tyme4ts/` | 八字·主力 | tyme4ts v1.5.2 (6tail) | ~352KB | **无**(unbuild 单文件 bundle) |
| `bazi/` | 八字·自研层 | bazi_relations + shensha | ~16KB | **无**(纯数据+函数) |

---

## iztro/（紫微斗数）

- 来源：[SylarLong/iztro](https://github.com/SylarLong/iztro) v2.5.8，MIT（`iztro/LICENSE` 已保留）
- 内容：`iztro/lib/`（TS→JS 编译产物）+ `node_modules/`（dayjs/i18next/lunar-lite/lunar-typescript 及传递依赖）
- 能力：12 宫星盘、十四正曜、辅星/小星、生年四化、十二长生、大限/小限、四柱、星座生肖、链式飞星/自化查询、多语言
- 入口：`iztro/lib/index.js`；内部依赖解析到本目录 `node_modules/`
- 验证：1993-10-20 戌时男 与文墨天机 **100% 一致**

## tyme4ts/（八字·主力引擎）

- 来源：[6tail/tyme4ts](https://github.com/6tail/tyme4ts) v1.5.2，MIT（`tyme4ts/LICENSE` 已保留）
- 产物：`dist/lib/index.cjs`（unbuild 单文件 bundle，298KB，**零外部 npm 依赖**，vendor 极简）
- 能力：四柱、十神、藏干(本/中/余气)、地势(十二长生)、胎元/命宫/身宫、纳音、**精确节气起运**、大运、4 起运流派 + 2 八字流派、八字转阳历反推
- 节气精度：ShouXingUtil 天文算法（章动+光行差）= 紫金山天文台（立春 2024-02-04 16:27 实测一致）
- 重建：在 tyme4ts 源码目录 `npx unbuild` 生成 `dist/lib/index.cjs`，替换本目录文件

## bazi/（八字·自研关系层 + 神煞层）

补 tyme4ts 缺口（tyme4ts 的 `EarthBranch` 仅六合、`God` 是黄历择日神煞非命局神煞）。

| 文件 | 数据源 | 覆盖 | 自检 |
|---|---|---|---|
| `bazi_relations.js` | china-testing/bazi/ganzhi.py | 三合/三会/半三合/六合/六冲/三刑(无恩·恃势)+自刑/六害/相破、天干五合化气/天干冲 | 三合4·三会4·半三合12·六合6·六冲6·三刑2·自刑4·六害6·相破4 ✓ |
| `shensha.js` | 问真前端bundle(权威)+datas.py | 29 命局神煞(查法已对照问真校正):年支(孤辰/寡宿/大耗/红鸾/天喜)·月支(天德/月德/天医/血刃/天德合/月德合/德秀)·日支(将星/华盖/驿马/劫煞/亡神/桃花)·日干(天乙/文昌/羊刃/红艳/国印/飞刃/太极/天厨/流霞/禄神/金舆) | year5·month7·day6·gan11·断语29 ✓ |

- 编译：源 `.ts` 在 `D:/AI-Agent/算命/_verify/`，用 `tsc --module commonjs` 编译为 `.js`
- 纯数据表 + 纯函数，零运行时依赖

---

## 验证（两端）

- **紫微**：1993-10-20 戌时男 ↔ 文墨天机 100% 一致
- **八字**：1993-10-20 19:10 男 → 四柱 癸酉壬戌甲戌甲戌（=文墨天机/问真八字），起运 4 年 22 天(虚岁 5)，大运 辛酉5-14…甲寅75-84；**酉戌六害×3、华盖入月支戌**（命理判断正确）

## 模块解析

- 紫微：`paipan_ziwei.js → vendor/iztro/lib`（iztro 内部 require 向上解析到 `vendor/node_modules`）
- 八字：`bazi.js → vendor/tyme4ts/dist/lib/index.cjs`（无依赖）+ `vendor/bazi/*.js`（无依赖）
- 两引擎独立，互不干扰；脚本路径用 `__dirname`，不依赖任何外部/全局安装

## 许可证

iztro、tyme4ts 均 **MIT**，LICENSE 已保留（vendor 再分发的法定要求）。自研关系/神煞层为本 skill 移植自开源 Python 数据源（china-testing），遵循其许可，数据为命理学通说。
