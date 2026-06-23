# 倪海厦紫微斗数语料库（Ni Haixia Ziwei Corpus）

> 2026-04-19 创建 · 用于校对和喂给 AI 的**可信**倪师原话来源

## 核心原则

1. **语料库只收录能追溯到来源的内容**，每条带 `source: 天纪 XX 集 / URL` 字段
2. **模糊来源的条目放在 `unverified/`**，不作为可信依据
3. **通识性紫微口诀**（如「化忌主是非」）放在 `traditional/`，标注"非倪师独创"
4. AI / Codex 生成内容时必须：**优先 corpus → 其次 traditional → 未查证的用"传统共识"措辞**

## 目录结构

```
ni-haisha-corpus/
├── README.md                      ← 本文件
├── sources.md                     ← 已抓取的真实资料来源清单
├── verified/                      ← 已核对的倪师原话
│   ├── 01-stars.md                ← 十四主星倪师论断
│   ├── 02-palaces.md              ← 十二宫倪师论断
│   ├── 03-patterns.md             ← 格局倪师论断
│   ├── 04-sihua.md                ← 四化倪师论断
│   ├── 05-illness.md              ← 疾厄宫倪师论断（以宫位脏腑为主）
│   ├── 06-fengshui.md             ← 阳宅倪师论断
│   └── 07-methodology.md          ← 命理方法论
├── traditional/                   ← 紫微通识口诀（非倪师独有）
│   └── common-idioms.md
├── unverified/                    ← 疑似/待核对
│   └── suspect-quotes.md
└── annotations.json               ← 对 db-analysis.ts 现有引号句的核对结果
```

## 用法

- 给 Codex：传整个目录 + README，要求"只引用 verified/ 的内容，其他部分以'传统紫微共识'描述"
- 给 AI 回答（Claude API）：把 corpus 作为 system prompt 的一部分

## 重大发现（vs 之前 db-analysis.ts 的错误）

1. **疾厄宫论法错**：之前按"星曜五行 → 脏腑"映射，倪师实际是**按宫位（地支）→ 脏腑**。比如丑宫代表肝、酉宫代表肾。
2. **贪狼桃花性**：贪狼**只在亥子宫才是正格桃花**，在午宫是武官星（这点之前的库没标）
3. **紫微必需辅弼**：「紫微星一定要有左辅右弼来会合，没有的话是僧道」
4. **身宫重要性**：身宫决定人生方向（财帛宫→私企、官禄→做官、迁移→外地）
5. **福德宫对女命**：「女人的命，福德宫非常重要！福德宫等于讲的也是夫妻」
