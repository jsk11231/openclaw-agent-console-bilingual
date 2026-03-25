# openclaw-agent-console-bilingual

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/jsk11231/openclaw-agent-console-bilingual)](https://github.com/jsk11231/openclaw-agent-console-bilingual/commits/main)
[![Repo size](https://img.shields.io/github/repo-size/jsk11231/openclaw-agent-console-bilingual)](https://github.com/jsk11231/openclaw-agent-console-bilingual)

这是 OpenClaw 本地 agent 控制台与架构文档的**深度脱敏中文导出版**。英文版见 `README_EN.md`。

## 它是什么

- 本地单服务的 agent 架构控制台
- 支持实时刷新、Agent 状态、skill 编辑、导出、审计、模型切换
- 支持架构图拖拽、缩放、自动排布、关系编辑
- 已去除本地路径、私有角色和敏感引用，适合公开发布

## 快速开始

```bash
node agent-console-server.js
```

然后打开：

- `http://127.0.0.1:8787/`
- `http://127.0.0.1:8787/audit`

## 截图

- 仪表盘：`docs/screenshots/dashboard.png`
- 审计页：`docs/screenshots/audit.png`

## 仓库内容

- `agent-console-server.js` —— 本地 HTTP 服务 + API
- `agent-console.html` —— 主控制台界面
- `audit.html` —— 配置审计页
- `AGENTS.md`、`ARCHITECTURE.md`、`OPERATING_MODEL.md` —— 架构与运行说明
- `README_EN.md` —— 英文说明

## 发布说明

见 `RELEASES.md`。

## 许可证

MIT License，见 `LICENSE`。
