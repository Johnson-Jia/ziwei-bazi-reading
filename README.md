<div align="center">

# 紫微斗数 × 八字命理 · LLM 推理技能

**ziwei-bazi-reading** — 给 Claude Code 用的中国传统命理推演技能

紫微斗数（iztro）+ 八字命理（tyme4ts）双体系独立推演，算法算盘面、LLM 做解读，产出交互式 HTML 命书。

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

</div>

---

## 这是什么

一个 **Claude Code Skill**：你给它生辰，它用**两套独立算法**（紫微斗数 / 八字命理）各自排盘推演，再由 **LLM 做深度解读**，最终产出一份**交互式 HTML 命书**（带命盘、大运流年、折线图、三方四正、宫干飞化）。

核心理念：**算法负责算（排盘/十神/四化/神煞/大运流年），LLM 负责解（应事方向/依据/置信度）**。算法部分可复现、可验证；解读部分标注依据与置信度，不编造。

> ⚠ 命理属传统文化，**非实证科学**。本项目仅供文化研究、自我觉察与娱乐参考，不替代专业决策。

## ✨ 特性

- **双体系独立**：紫微斗数（iztro v2.5.8）与八字命理（tyme4ts v1.5.2）互不引用术语，各自推演，可交叉印证
- **十维度预测**：妻·财·子·禄·父·身·友·考·宅·灾，覆盖大运/大限基调 + 流年逐年
- **交互式 HTML 命书**：
  - 八字：行表头命盘（主星/天干/地支/藏干/副星/星运/自坐/空亡/纳音/神煞）+ 五行能量 + 刑冲克害 + 大运流年 + 折线图
  - 紫微：环形十二宫盘面（天干地支/十二长生/将星/小限/流年/身宫·来因）+ **点击宫位看三方四正、宫干飞化、大限十二宫** + 折线图
- **LLM 解读注入**：算法出盘面+结构化数据+占位，解读文案由 LLM 逐项深读后写成 JSON 注入（骨架可复现，解读独立不丢）
- **严谨性**：每条判断附依据 + 置信度（🟢高/🟡中/🔴低），绝不编造命主经历
- **全离线**：iztro/tyme4ts 已 vendor 内置，排盘不联网

## 📸 效果预览

> 截图放 `docs/images/`（后续补充）

## 🚀 快速开始

### 安装

**一键安装（推荐）**：

```bash
# 方式一：curl 一键安装（全局，装到 ~/.claude/skills/）
curl -sL https://raw.githubusercontent.com/Johnson-Jia/ziwei-bazi-reading/main/install.sh | bash

# 方式二：clone 后运行安装器
git clone https://github.com/Johnson-Jia/ziwei-bazi-reading.git
cd ziwei-bazi-reading
./install.sh              # 全局安装（默认，~/.claude/skills/）
./install.sh --project    # 项目级（装到当前项目 .claude/skills/）
./install.sh --copy-only  # 仅复制文件，跳过 npm 依赖
```

安装器自动完成：复制技能文件 → 检测 Node.js → 装 iztro 运行时依赖 → 八字/紫微排盘验证。

> Windows 用户请在 **Git Bash** 或 WSL 中运行。

**手动安装**（等价于 install.sh）：

```bash
git clone https://github.com/Johnson-Jia/ziwei-bazi-reading.git ~/.claude/skills/ziwei-bazi-reading
cd ~/.claude/skills/ziwei-bazi-reading/scripts/vendor/iztro && npm install --ignore-scripts   # 装 iztro 运行时依赖
```

### 用法（在 Claude Code 里）

直接对 Claude 说「帮我批一下这个八字 / 排紫微盘」，并提供生辰即可。Claude 会自动调用本技能。

### 命令行（脱离 Claude 直接跑脚本）

```bash
# 八字完整命书（行表头命盘 + 五行 + 刑冲 + 神煞 + LLM解读 + 大运流年 + 折线图）
node scripts/gen_bazi_full_html.js 1993 10 20 19 10 男 1994 2092 八字命书.html 解读-八字.json 解读-八字-流年.json

# 紫微完整命书（环形盘面 + 三方四正 + 宫干飞化 + LLM解读 + 大限流年 + 折线图）
node scripts/gen_ziwei_full_html.js 1993-10-20 10 男 1994 2092 紫微命书.html 解读-紫微.json 解读-紫微-流年.json
```

> 解读 JSON 缺省时，解析区留占位（仅命盘+运势自动生成）——即「纯算法版」。

## 📂 项目结构

```
ziwei-bazi-reading/
├── SKILL.md                    # Skill 入口（铁律/流程/目录）
├── methods/                    # 推演方法论（紫微、八字各自独立）
│   ├── ziwei-method.md
│   └── bazi-method.md
├── scripts/
│   ├── bazi.js                 # 八字静态盘（排盘+关系+神煞 → JSON）
│   ├── bazi_core.js            # 八字核心引擎（排盘+旺衰+流年，共用模块）
│   ├── paipan_ziwei.js         # 紫微排盘（iztro → JSON）
│   ├── gen_bazi_full_html.js   # 八字完整命书 HTML 生成器
│   ├── gen_ziwei_full_html.js  # 紫微完整命书 HTML 生成器
│   ├── bazi_liunian.js         # 八字流年 → JSON
│   ├── ziwei_liunian.js        # 紫微流年 → JSON
│   ├── data/                   # 藏干/四化/节气 查表（两套共用）
│   └── vendor/                 # iztro + tyme4ts + 自研关系·神煞层（离线）
└── templates/                  # 紫微环形盘面模板
```

## 🔧 技术架构

**数据流**：

```
生辰 → 排盘脚本（iztro / tyme4ts+自研层）→ 结构化命盘 JSON
     → methods/*（推演方法论）
     → LLM 解读（写成 解读-*.json，逐项附依据+置信度）
     → gen_*_full_html.js（渲染 + 解读注入）→ 交互式 HTML 命书
```

**关键设计**：

- **算法 vs 解读分离**：排盘/十神/四化/神煞/大运流年由脚本确定性计算（可复现）；解读文案由 LLM 生成（标注依据+置信度，不编造）
- **解读注入机制**：生成器读取「解读 JSON」注入 HTML 对应锚点；骨架（命盘/运势）自动可复现，解读独立成文件不被重跑覆盖
- **三方四正 + 宫干飞化**：标准命理算法自算（地支三合+六冲 / 天干四化表+星落宫），不依赖外部 API

### vendor 依赖

| 库 | 用途 | 说明 |
|---|---|---|
| [iztro](https://github.com/SylarLong/iztro) v2.5.8 | 紫微斗数排盘 | `scripts/vendor/iztro/lib` 已构建，运行时依赖需 `npm install` |
| [tyme4ts](https://github.com/6tail/tyme4ts) v1.5.2 | 八字四柱排盘 | `scripts/vendor/tyme4ts/dist` unbuild 单 bundle，无依赖 |
| 自研 `bazi/` | 三合三会/六冲刑害/38神煞 | 纯数据+函数，无依赖 |

## 📖 解读 JSON 结构

```jsonc
// 解读-八字-1993.json（命主层）
{
  "日主旺衰": ["..."], "喜用神": ["..."], "五行分布": ["..."],
  "格局": ["..."], "柱解": { "年柱": ["..."], ... },
  "六亲": ["..."], "刑冲克害": ["..."], "神煞": ["..."], "命主总论": ["..."]
}
// 解读-八字-流年-1993.json（大运+流年层）
{ "大运解读": { "庚申": "..." }, "流年解读": { "2024": "..." } }
```

紫微同理（命主身主/五行局/格局/生年四化/宫象/总论 + 大限/流年解读）。

## ⚠ 免责声明

本项目的命理推演基于所提供数据，运用中国传统命理技法。命理学属传统文化，**并非实证科学，不具备经科学验证的预测能力**。所有吉凶判断、时间范围与建议，**仅适用于文化研究、自我觉察与娱乐参考，不能替代专业医疗/心理/法律/投资/婚姻决策**。理性看待、积极生活。

## 📄 License

[Apache License 2.0](LICENSE)
