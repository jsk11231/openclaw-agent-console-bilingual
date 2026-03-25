# openclaw-agent-console-bilingual

A sanitized bilingual export of the OpenClaw agent console, architecture docs, and operating model.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub last commit](https://img.shields.io/github/last-commit/jsk11231/openclaw-agent-console-bilingual)](https://github.com/jsk11231/openclaw-agent-console-bilingual/commits/main)
[![Repo size](https://img.shields.io/github/repo-size/jsk11231/openclaw-agent-console-bilingual)](https://github.com/jsk11231/openclaw-agent-console-bilingual)


## Highlights

- Local single-service console for agent architecture management
- Live refresh, agent status, skill editing, export, audit, and model switching
- Architecture graph with drag layout, zoom, auto-layout, and relation editing
- Public-safe snapshot with sensitive paths, local-only roles, and private references removed
- Bilingual documentation in Chinese and English

## Screenshots

- Dashboard: `docs/screenshots/dashboard.png`
- Audit Page: `docs/screenshots/audit.png`

## Quick Start

```bash
node agent-console-server.js
```

Open:

- `http://127.0.0.1:8787/`
- `http://127.0.0.1:8787/audit`

## Release notes

See `RELEASES.md`.

## License

MIT License. See `LICENSE`.
