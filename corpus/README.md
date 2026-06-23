# 倪海厦紫微斗数语料库（Ni Haixia Ziwei Corpus）

> 2026-04-19 创建 · 用于校对和喂给 AI 的**可信**倪师原话来源

## 核心原则

1. **语料库只收录能追溯到来源的内容**，每条带 `source: 天纪 XX 集 / URL` 字段
2. **模糊来源的条目放在 `unverified/`**，不作为可信依据
3. **通识性紫微口诀**（如「化忌主是非」）放在 `traditional/`，标注"非倪师独创"
4. AI / Codex 生成内容时必须：**优先 corpus → 其次 traditional → 未查证的用"传统共识"措辞**

## 目录结构

```
corpus/
├── README.md                      ← 本文件
├── sources.md                     ← 资料来源清单（天纪集数 → URL → 可信度）
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
└── annotations.json               ← 引号句核对分级（verified/traditional/suspect）
```

## 用法（按需加载）

本语料库为 `ziwei-bazi-reading` 技能的按需参考资料，**不全量加载进上下文**——批命批到对应主题时，再加载对应文件：

| 批命场景 | 按需 Read |
|---|---|
| 查某主星倪师论断（长相/性情/规则） | `verified/01-stars.md` |
| 查某宫位倪师论断 | `verified/02-palaces.md` |
| 查某格局倪师出处 | `verified/03-patterns.md` |
| 查某四化倪师论断 | `verified/04-sihua.md` |
| 查疾厄宫脏腑（子午流注） | `verified/05-illness.md` |
| 查阳宅/风水化解 | `verified/06-fengshui.md` |
| 查批命方法论/顺序 | `verified/07-methodology.md` |
| 查通识古诀（非倪师独创） | `traditional/common-idioms.md` |

**优先级**：`verified/`（倪师原话，带集数出处）→ `traditional/`（通识古诀）→ 未查证用"传统共识"措辞，不臆测。

引用后在产出中标注 `[倪海厦视角]` + 出处（如"天纪05"），与 `methods/ziwei-method.md` 九·五语料标注规范一致。

## 重大发现（vs 常见误区）

1. **疾厄宫论法错**：之前按"星曜五行 → 脏腑"映射，倪师实际是**按宫位（地支）→ 脏腑**。比如丑宫代表肝、酉宫代表肾。
2. **贪狼桃花性**：贪狼**只在亥子宫才是正格桃花**，在午宫是武官星（这点之前的库没标）
3. **紫微必需辅弼**：「紫微星一定要有左辅右弼来会合，没有的话是僧道」
4. **身宫重要性**：身宫决定人生方向（财帛宫→私企、官禄→做官、迁移→外地）
5. **福德宫对女命**：「女人的命，福德宫非常重要！福德宫等于讲的也是夫妻」
