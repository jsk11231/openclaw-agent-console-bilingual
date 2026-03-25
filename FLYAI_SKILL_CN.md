# flyai skill 中文说明

## 它是什么

`flyai` 是一个面向**旅行搜索与预订**场景的 OpenClaw skill，基于 **Fliggy MCP（飞猪能力）**，通过 `flyai-cli` 提供旅行相关查询与预订辅助能力。

你可以把它理解成：

> 一个把“飞猪旅行搜索/预订能力”封装给 OpenClaw agent 使用的 skill。

---

## 核心定位

这个 skill 主要用于：

- 旅行信息检索
- 酒店搜索
- 航班搜索
- 景点 / POI 搜索
- 结果整理为可读 Markdown
- 输出图片和跳转预订链接

它不是单纯的静态说明文件，而是一个**依赖 CLI 工具**的 skill：

- `SKILL.md` 负责告诉 agent 怎么调用
- `references/` 负责提供子命令细节
- `flyai-cli` 负责真正执行查询

---

## 目录结构

```text
flyai/
├─ SKILL.md
├─ _meta.json
└─ references/
   ├─ fliggy-fast-search.md
   ├─ search-hotels.md
   ├─ search-flight.md
   └─ search-poi.md
```

---

## SKILL.md 的作用

`SKILL.md` 是主说明文件，核心作用包括：

### 1. 说明调用方式

skill 会指导 agent 使用 `flyai-cli` 来调用 Fliggy MCP 能力。

### 2. 说明安装与验证

典型安装方式：

```bash
npm i -g @fly-ai/flyai-cli
```

典型验证方式：

```bash
flyai fliggy-fast-search --query "what to do in Sanya"
```

### 3. 说明能力范围

支持的核心能力包括：

- 综合旅行搜索：`fliggy-fast-search`
- 酒店搜索：`search-hotels`
- 航班搜索：`search-flight`
- 景点/POI 搜索：`search-poi`

### 4. 规定最终展示格式

该 skill 要求 agent 输出**有效 Markdown**，并尽量适合直接面向用户展示：

- 有图片就展示图片
- 有预订链接就展示链接
- 图片要放在预订链接前
- 用标题、列表、表格组织结果
- 重要信息（日期、地点、价格、约束）要突出显示

---

## references/ 的作用

`references/` 目录相当于每个子命令的详细说明书。

- `SKILL.md` 负责总规则
- `references/*.md` 负责参数、字段、输出含义等细节

你可以把它理解成“子命令手册”。

---

## 各 reference 文件说明

### `references/fliggy-fast-search.md`

对应命令：

- `fliggy-fast-search`

作用：

- 使用自然语言进行综合旅行搜索
- 适合宽搜索场景，例如“去三亚有什么可玩/有什么酒店/什么票务”

---

### `references/search-hotels.md`

对应命令：

- `search-hotels`

作用：

- 做结构化酒店搜索与比较
- 结果通常包含酒店图片、价格、详情页等字段

---

### `references/search-flight.md`

对应命令：

- `search-flight`

作用：

- 做结构化航班搜索与比较
- 适合比较出发时间、价格、航班信息

---

### `references/search-poi.md`

对应命令：

- `search-poi`

作用：

- 搜索景点、门票、活动和目的地项目
- 适合文旅/景点查询场景

---

## 典型工作链路

```text
用户提出旅行需求
  ↓
agent 命中 flyai skill
  ↓
SKILL.md 告诉 agent 调用 flyai-cli
  ↓
根据 references/ 选择正确子命令
  ↓
CLI 返回 JSON
  ↓
agent 按规则整理成 Markdown
  ↓
输出图片、对比信息和预订链接
```

---

## 这个 skill 的特点

### 优点

- 场景清晰：旅行搜索/预订
- 子命令划分明确
- 输出要求细，适合直接面向用户
- 支持图片和预订链接，成品感强

### 注意点

- 依赖 `flyai-cli`
- 最佳效果可能需要配置 `FLYAI_API_KEY`
- 即使没有 key，也可以先做试跑验证

---

## 一句话总结

> `flyai` 是一个把飞猪/Fliggy 的旅行搜索与预订能力，通过 `flyai-cli` 暴露给 OpenClaw agent 使用的 skill；`SKILL.md` 管总规则，`references/` 管子命令细节。
