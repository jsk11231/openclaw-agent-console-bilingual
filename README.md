# openclaw-agent-console-bilingual

A sanitized, bilingual export of the OpenClaw agent console, architecture docs, and operating model.

中文说明见下方。

## Highlights

- Local single-service console for agent architecture management
- Live refresh, agent status, skill editing, export, audit, and model switching
- Architecture graph with drag layout, zoom, auto-layout, and relation editing
- Sanitized for public sharing: private paths, local-only roles, and sensitive references removed
- Bilingual docs: Chinese + English

## Screenshots

### Dashboard

![Dashboard](docs/screenshots/dashboard.png)

> Screenshot files will be added when running on a display-enabled Mac session.

### Audit Page

![Audit Page](docs/screenshots/audit.png)

## What’s inside

- `agent-console-server.js` — local HTTP server + API
- `agent-console.html` — main console UI
- `audit.html` — config audit page
- `AGENTS.md`, `ARCHITECTURE.md`, `OPERATING_MODEL.md` — architecture and operating docs
- `README.md`, `README_EN.md` — bilingual overview

## Quick Start

```bash
node agent-console-server.js
```

Then open:

- `http://127.0.0.1:8787/`
- `http://127.0.0.1:8787/audit`

## Release notes

See `RELEASES.md` for release history and packaging notes.

## License

MIT License. See `LICENSE`.

---

# 中文说明

这是 OpenClaw 本地 agent 控制台与架构文档的**深度脱敏中英文双语导出版**。

## 主要能力

- 本地单服务控制台
- Agent 状态查看与实时刷新
- 新增 / 编辑 / 删除 Agent
- 手动改 skill
- 导出 JSON
- 配置审计页
- 默认 API 模型切换
- 架构图拖拽、缩放、自动排布、关系编辑

## 已做脱敏

- 去除本地路径痕迹
- 去除私有角色与内部入口节点
- 去除明显敏感引用
- 保留可公开的架构与运行说明

## 快速启动

```bash
node agent-console-server.js
```

打开：

- `http://127.0.0.1:8787/`
- `http://127.0.0.1:8787/audit`

## 许可证

MIT License。见 `LICENSE`。
