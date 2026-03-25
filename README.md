# openclaw-agent-console-bilingual

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/jsk11231/openclaw-agent-console-bilingual)](https://github.com/jsk11231/openclaw-agent-console-bilingual/commits/main)
[![Repo size](https://img.shields.io/github/repo-size/jsk11231/openclaw-agent-console-bilingual)](https://github.com/jsk11231/openclaw-agent-console-bilingual)

A sanitized, bilingual export of the OpenClaw agent console and architecture docs.

## What it is

- Local single-service console for agent architecture management
- Live refresh, agent status, skill editing, export, audit, and model switching
- Architecture graph with drag layout, zoom, auto-layout, and relation editing
- Public-safe snapshot with private paths, local-only roles, and sensitive references removed
- Bilingual docs: Chinese + English

## Quick Start

```bash
node agent-console-server.js
```

Open:

- `http://127.0.0.1:8787/`
- `http://127.0.0.1:8787/audit`

## Screenshots

- Dashboard: `docs/screenshots/dashboard.png`
- Audit page: `docs/screenshots/audit.png`

## Included

- `agent-console-server.js` — local HTTP server + API
- `agent-console.html` — main console UI
- `audit.html` — config audit page
- `AGENTS.md`, `ARCHITECTURE.md`, `OPERATING_MODEL.md` — architecture and operating docs
- `README_EN.md` — English overview

## Release notes

See `RELEASES.md`.

## License

MIT License. See `LICENSE`.

---

# 中文说明

这是 OpenClaw 本地 agent 控制台与架构文档的**深度脱敏中英文双语导出版**。

## 快速启动

```bash
node agent-console-server.js
```

打开：

- `http://127.0.0.1:8787/`
- `http://127.0.0.1:8787/audit`

## 许可证

MIT License。见 `LICENSE`。
