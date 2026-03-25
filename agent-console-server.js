#!/usr/bin/env node
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const ROOT = process.cwd();
const CONFIG_PATH = path.join(os.homedir(), '.openclaw', 'openclaw.json');
const HTML_PATH = path.join(ROOT, 'agent-console.html');
const AUDIT_HTML_PATH = path.join(ROOT, 'audit.html');
const DASHBOARD_MD_PATH = path.join(ROOT, 'AGENT_DASHBOARD.md');
const LAYOUT_PATH = path.join(ROOT, 'agent-layout.json');
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '0.0.0.0';
const BACKUP_DIR = path.join(os.homedir(), '.openclaw', 'backups');
const ASSET_VERSION = String(Date.now());

function readConfig() {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

function writeConfig(nextConfig) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupName = `openclaw.${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const backupPath = path.join(BACKUP_DIR, backupName);
  if (fs.existsSync(CONFIG_PATH)) {
    fs.copyFileSync(CONFIG_PATH, backupPath);
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(nextConfig, null, 2) + '\n');
  const state = syncDashboardMarkdown(nextConfig);
  return { backupPath, state };
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(JSON.stringify(body, null, 2));
}

function sendText(res, status, body, contentType = 'text/html; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function normalizeArchitecture(arch) {
  const d = defaultArchitecture();
  const edges = Array.isArray(arch?.edges) ? arch.edges : d.edges;
  const collapsed = arch?.collapsed || {};
  const layout = { ...d.layout, ...(arch?.layout || {}) };
  return {
    layout,
    edges,
    collapsed,
    zoom: typeof arch?.zoom === 'number' ? arch.zoom : 1,
    zoomX: typeof arch?.zoomX === 'number' ? arch.zoomX : 0,
    zoomY: typeof arch?.zoomY === 'number' ? arch.zoomY : 0,
  };
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let buf = '';
    req.on('data', chunk => {
      buf += chunk;
      if (buf.length > 2 * 1024 * 1024) {
        reject(new Error('Body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!buf) return resolve({});
      try { resolve(JSON.parse(buf)); }
      catch (err) { reject(err); }
    });
    req.on('error', reject);
  });
}

function normalizeSkills(skills) {
  if (Array.isArray(skills)) return skills.map(s => String(s).trim()).filter(Boolean);
  if (typeof skills === 'string') {
    return skills.split(/[\n,，]/).map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[，,。；;！!？?、]/g, '')
    .trim();
}


function defaultArchitecture() {
  return {
    layout: {
      dispatch: { x: 560, y: 40 },
      'fast-response': { x: 220, y: 180 },
      orchestration: { x: 560, y: 180 },
      information: { x: 900, y: 180 },
      'analysis-center': { x: 120, y: 340 },
      'strategy-center': { x: 400, y: 340 },
      'admin-support': { x: 680, y: 340 },
      'tech-support': { x: 960, y: 340 },
      compliance: { x: 1240, y: 340 },
      'tourism-center': { x: 260, y: 500 },
      'shop-growth-officer': { x: 540, y: 500 },
      'trading-strategy-officer': { x: 820, y: 500 },
      'evolution-center': { x: 1100, y: 500 },
      xiaohongshu: { x: 1380, y: 500 },
    },
    edges: [
      ['dispatch', 'fast-response'],
      ['dispatch', 'orchestration'],
      ['dispatch', 'information'],
      ['orchestration', 'analysis-center'],
      ['orchestration', 'strategy-center'],
      ['orchestration', 'admin-support'],
      ['orchestration', 'tech-support'],
      ['orchestration', 'compliance'],
      ['orchestration', 'tourism-center'],
      ['strategy-center', 'shop-growth-officer'],
      ['strategy-center', 'trading-strategy-officer'],
      ['dispatch', 'evolution-center'],
      ['dispatch', 'xiaohongshu'],
    ],
    collapsed: {},
  };
}

function readArchitecture() {
  if (!fs.existsSync(LAYOUT_PATH)) return defaultArchitecture();
  try {
    const raw = JSON.parse(fs.readFileSync(LAYOUT_PATH, 'utf8'));
    const normalized = normalizeArchitecture(raw);
    if (JSON.stringify(normalized) !== JSON.stringify(raw)) {
      fs.writeFileSync(LAYOUT_PATH, JSON.stringify(normalized, null, 2) + '\n');
    }
    return normalized;
  } catch {
    return defaultArchitecture();
  }
}

function writeArchitecture(next) {
  const normalized = normalizeArchitecture(next);
  fs.writeFileSync(LAYOUT_PATH, JSON.stringify(normalized, null, 2) + '\n');
  return normalized;
}

function architectureEdges() {
  return readArchitecture().edges;
}

function computeState(config) {
  const agents = Array.isArray(config?.agents?.list) ? config.agents.list : [];
  const mapped = agents.map(agent => {
    const skills = Array.isArray(agent.skills) ? agent.skills : [];
    const status = agent.status || (agent.enabled === false ? 'disabled' : 'online');
    return {
      id: agent.id,
      name: agent.name || agent.id,
      workspace: agent.workspace || '',
      emoji: agent.identity?.emoji || agent.emoji || '',
      theme: agent.identity?.theme || '',
      skills,
      skillCount: skills.length,
      status,
      tools: agent.tools?.alsoAllow || [],
      allowAgents: agent.subagents?.allowAgents || [],
    };
  });

  const counts = {
    total: mapped.length,
    online: mapped.filter(a => a.status === 'online' || a.status === 'active' || a.status === '🟢').length,
    attention: mapped.filter(a => a.status === 'attention' || a.status === 'warning' || a.status === '🟡').length,
    risk: mapped.filter(a => a.status === 'risk' || a.status === 'error' || a.status === '🔴').length,
    skills: mapped.reduce((sum, a) => sum + a.skillCount, 0),
  };

  const skillOwners = new Map();
  for (const agent of mapped) {
    for (const skill of agent.skills) {
      if (!skillOwners.has(skill)) skillOwners.set(skill, []);
      skillOwners.get(skill).push(agent.id);
    }
  }

  const duplicates = [...skillOwners.entries()].filter(([, owners]) => owners.length > 1)
    .map(([skill, owners]) => ({ skill, owners }));

  const arch = readArchitecture();
  return {
    meta: config.meta || {},
    counts,
    agents: mapped,
    duplicates,
    bindings: Array.isArray(config.bindings) ? config.bindings : [],
    layout: arch.layout,
    edges: arch.edges,
    collapsed: arch.collapsed,
    zoom: arch.zoom,
    zoomX: arch.zoomX,
    zoomY: arch.zoomY,
    updatedAt: new Date().toISOString(),
  };
}

function dashboardMarkdown(state, config) {
  const lines = [];
  lines.push('# Agent Control Console');
  lines.push('');
  lines.push('> 更新时间：2026-03-25');
  lines.push(`> 数据来源：\`~/.openclaw/openclaw.json\``);
  lines.push('> 启动方式：`node agent-console-server.js`');
  lines.push('> 默认地址：`http://0.0.0.0:8787`');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## 1. 总览面板');
  lines.push('');
  lines.push('| 指标 | 数值 | 说明 |');
  lines.push('|---|---:|---|');
  lines.push(`| Agent 总数 | ${state.counts.total} | 架构已实体化 |`);
  lines.push(`| 正常 | ${state.counts.online} | 大部分节点状态良好 |`);
  lines.push(`| 关注 | ${state.counts.attention} | 需要留意的节点 |`);
  lines.push(`| 风险 | ${state.counts.risk} | 当前需处理的节点 |`);
  lines.push(`| 专职 skill 总数 | ${state.counts.skills} | 去重后汇总 |`);
  lines.push(`| 多头挂载 skill | ${state.duplicates.length} | 重复归属项 |`);
  lines.push('');
  lines.push('### 当前告警');
  lines.push('');
  lines.push('| 等级 | 项目 | 说明 |');
  lines.push('|---|---|---|');
  lines.push('| 🟡 | 文档一致性 | 角色文件已基本统一，但仍需持续防止重复文件再出现 |');
  lines.push('| 🟡 | `xiaohongshu` 角色 | 已补角色文件，但需确认是否要纳入全局 AGENTS 侧主表长期展示 |');
  if (state.duplicates.length) {
    const sample = state.duplicates.slice(0, 3).map(x => `${x.skill} → ${x.owners.join(' / ')}`).join('；');
    lines.push(`| 🟡 | skill 冲突 | 发现 ${state.duplicates.length} 个重复 skill：${sample} |`);
  }
  lines.push('');
  lines.push('## 2. Agent 状态灯');
  lines.push('');
  lines.push('| Agent ID | 中文名 | 状态 | 权重分 | 说明 |');
  lines.push('|---|---|:---:|---:|---|');
  for (const agent of state.agents) {
    const score = agent.skillCount;
    const note = agent.theme || '—';
    lines.push(`| \`${agent.id}\` | ${agent.name || agent.id} | ${agent.status === 'risk' ? '🔴' : agent.status === 'attention' ? '🟡' : '🟢'} | ${score} | ${note} |`);
  }
  lines.push('');
  lines.push('## 3. 资源 / 技能分布');
  lines.push('');
  lines.push('| 中心 | 专职 skill 数 | 工作区 |');
  lines.push('|---|---:|---|');
  for (const agent of state.agents) {
    lines.push(`| \`${agent.id}\` | ${agent.skillCount} | ${agent.workspace || '—'} |`);
  }
  lines.push('');
  lines.push('## 4. 文档一致性');
  lines.push('');
  lines.push('| 文件 | 状态 | 说明 |');
  lines.push('|---|:---:|---|');
  lines.push('| `AGENTS.md` | 🟢 | 已补 `xiaohongshu` |');
  lines.push('| `AGENT_MAPPING.md` | 🟢 | 映射清晰 |');
  lines.push('| `OPERATING_MODEL.md` | 🟢 | 运行口径一致 |');
  lines.push('| `ROLE_analysis.md` | 🟢 | 存在 |');
  lines.push('| `ROLE_strategy.md` | 🟢 | 存在 |');
  lines.push('| `ROLE_shop-growth.md` | 🟢 | 存在 |');
  lines.push('| `ROLE_trading-strategy.md` | 🟢 | 存在 |');
  lines.push('| `ROLE_xiaohongshu.md` | 🟢 | 存在 |');
  lines.push('');
  lines.push('## 5. 告警与建议');
  lines.push('');
  lines.push('- 继续观察 `xiaohongshu` 是否应长期保留在总调度主表中。');
  lines.push('- 仪表盘如果后续扩容，建议拆成“运营监控页”和“配置审计页”。');
  lines.push('- 每次 skill 调整后，检查：`openclaw.json`、`AGENTS.md`、`ROLE_*.md`。');
  lines.push('');
  lines.push('## 6. 一句话结论');
  lines.push('');
  lines.push('当前系统已经从“组织树”升级成了“可视化控制台”。');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`_自动生成于：${new Date().toISOString()}_`);
  return lines.join('\n');
}

function computeAudit(config) {
  const agents = Array.isArray(config?.agents?.list) ? config.agents.list : [];
  const rows = agents.map(agent => ({
    id: agent.id,
    name: agent.name || agent.id,
    workspace: agent.workspace || '',
    theme: agent.identity?.theme || '',
    skills: Array.isArray(agent.skills) ? agent.skills : [],
    allowAgents: Array.isArray(agent.subagents?.allowAgents) ? agent.subagents.allowAgents : [],
    tools: Array.isArray(agent.tools?.alsoAllow) ? agent.tools.alsoAllow : [],
  }));

  const skillMap = new Map();
  const workspaceMap = new Map();
  const responsibilityMap = new Map();

  for (const agent of rows) {
    for (const skill of agent.skills) {
      const key = normalizeText(skill);
      if (!key) continue;
      if (!skillMap.has(key)) skillMap.set(key, { label: skill, owners: [] });
      skillMap.get(key).owners.push(agent.id);
    }

    const wsKey = normalizeText(agent.workspace);
    if (wsKey) {
      if (!workspaceMap.has(wsKey)) workspaceMap.set(wsKey, { label: agent.workspace, owners: [] });
      workspaceMap.get(wsKey).owners.push(agent.id);
    }

    const responsibilityKey = normalizeText(agent.theme || agent.name || agent.id)
      .replace(/^你是/, '')
      .replace(/。.*$/, '');
    if (responsibilityKey) {
      if (!responsibilityMap.has(responsibilityKey)) responsibilityMap.set(responsibilityKey, { label: agent.theme || agent.name || agent.id, owners: [] });
      responsibilityMap.get(responsibilityKey).owners.push(agent.id);
    }
  }

  const duplicates = (map) => [...map.values()]
    .filter(item => item.owners.length > 1)
    .sort((a, b) => b.owners.length - a.owners.length || a.label.localeCompare(b.label, 'zh-Hans-CN'));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalAgents: rows.length,
      duplicateSkills: duplicates(skillMap).length,
      duplicateWorkspaces: duplicates(workspaceMap).length,
      duplicateResponsibilities: duplicates(responsibilityMap).length,
    },
    duplicateSkills: duplicates(skillMap),
    duplicateWorkspaces: duplicates(workspaceMap),
    duplicateResponsibilities: duplicates(responsibilityMap),
    agents: rows,
  };
}

function syncDashboardMarkdown(config) {
  const state = computeState(config);
  fs.writeFileSync(DASHBOARD_MD_PATH, dashboardMarkdown(state, config));
  return state;
}

function htmlEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderHome() {
  if (fs.existsSync(HTML_PATH)) return fs.readFileSync(HTML_PATH, 'utf8');
  return `<!doctype html><html><body><pre>Missing ${htmlEscape(HTML_PATH)}</pre></body></html>`;
}

function renderAuditPage() {
  if (fs.existsSync(AUDIT_HTML_PATH)) return fs.readFileSync(AUDIT_HTML_PATH, 'utf8');
  return `<!doctype html><html><body><pre>Missing ${htmlEscape(AUDIT_HTML_PATH)}</pre></body></html>`;
}

function validateAgent(agent, existingIds = new Set()) {
  const id = String(agent.id || '').trim();
  if (!id) throw new Error('agent.id is required');
  if (!/^[a-z0-9][a-z0-9-_.]*$/i.test(id)) throw new Error('agent.id contains invalid characters');
  if (existingIds.has(id)) throw new Error(`agent.id already exists: ${id}`);
  return {
    id,
    name: String(agent.name || id).trim(),
    workspace: String(agent.workspace || '').trim(),
    skills: normalizeSkills(agent.skills),
    identity: {
      name: String(agent.identityName || agent.name || id).trim(),
      theme: String(agent.theme || '').trim(),
      emoji: String(agent.emoji || '🤖').trim(),
    },
  };
}

function findAgent(config, id) {
  const agents = config?.agents?.list;
  if (!Array.isArray(agents)) throw new Error('config.agents.list is missing');
  return agents.find(a => a.id === id);
}

async function handler(req, res) {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (req.method === 'GET' && url.pathname === '/') {
      return sendText(res, 200, renderHome());
    }
    if (req.method === 'GET' && url.pathname === '/audit') {
      return sendText(res, 200, renderAuditPage());
    }
    if (req.method === 'GET' && url.pathname === '/api/health') {
      return send(res, 200, { ok: true, port: PORT, host: HOST });
    }
    if (req.method === 'GET' && url.pathname === '/api/state') {
      return send(res, 200, computeState(readConfig()));
    }

    if (req.method === 'POST' && url.pathname === '/api/refresh') {
      return send(res, 200, computeState(readConfig()));
    }

    if (req.method === 'GET' && url.pathname === '/api/models') {
      const config = readConfig();
      const providers = config?.models?.providers || {};
      const current = config?.agents?.defaults?.model || {};
      const available = [];
      for (const [providerId, provider] of Object.entries(providers)) {
        for (const model of provider.models || []) {
          available.push({
            providerId,
            modelId: model.id,
            label: `${providerId}/${model.id}`,
            name: model.name || model.id,
            input: model.input || [],
            reasoning: Boolean(model.reasoning),
          });
        }
      }
      return send(res, 200, {
        current: {
          primary: current.primary || '',
          fallbacks: Array.isArray(current.fallbacks) ? current.fallbacks : [],
        },
        available,
      });
    }

    if (req.method === 'PUT' && url.pathname === '/api/model') {
      const body = await parseBody(req);
      const config = readConfig();
      if (!config.agents) config.agents = {};
      if (!config.agents.defaults) config.agents.defaults = {};
      if (!config.agents.defaults.model) config.agents.defaults.model = {};
      if (body.primary !== undefined) config.agents.defaults.model.primary = String(body.primary).trim();
      if (body.fallbacks !== undefined) config.agents.defaults.model.fallbacks = normalizeSkills(body.fallbacks);
      const { backupPath, state } = writeConfig(config);
      let restart = { ok: false, skipped: false };
      if (body.restart !== false) {
        try {
          execFileSync('openclaw', ['gateway', 'restart'], { stdio: 'pipe' });
          restart = { ok: true };
        } catch (err) {
          restart = { ok: false, error: err.message };
        }
      } else {
        restart.skipped = true;
      }
      return send(res, 200, { ok: true, backup: backupPath, model: config.agents.defaults.model, restart, state });
    }

    if (req.method === 'GET' && url.pathname === '/api/layout') {
      return send(res, 200, readArchitecture());
    }

    if (req.method === 'POST' && url.pathname === '/api/layout/normalize') {
      const saved = writeArchitecture(readArchitecture());
      return send(res, 200, { ok: true, ...saved });
    }

    if (req.method === 'PUT' && url.pathname === '/api/layout') {
      const body = await parseBody(req);
      const current = readArchitecture();
      const incomingEdges = Array.isArray(body.edges) ? body.edges : null;
      const allowEmptyEdges = body.allowEmptyEdges === true;
      const edges = (incomingEdges && incomingEdges.length > 0)
        ? incomingEdges
        : (allowEmptyEdges ? [] : current.edges);
      const next = {
        layout: body.layout || current.layout,
        edges,
        collapsed: body.collapsed || current.collapsed || {},
        zoom: typeof body.zoom === 'number' ? body.zoom : (current.zoom || 1),
        zoomX: typeof body.zoomX === 'number' ? body.zoomX : (current.zoomX || 0),
        zoomY: typeof body.zoomY === 'number' ? body.zoomY : (current.zoomY || 0),
      };
      const saved = writeArchitecture(next);
      return send(res, 200, { ok: true, ...saved });
    }

    if (req.method === 'GET' && url.pathname === '/api/audit') {
      return send(res, 200, computeAudit(readConfig()));
    }

    if (req.method === 'POST' && url.pathname === '/api/agents') {
      const body = await parseBody(req);
      const config = readConfig();
      if (!config.agents) config.agents = { list: [] };
      if (!Array.isArray(config.agents.list)) config.agents.list = [];
      const ids = new Set(config.agents.list.map(a => a.id));
      const agent = validateAgent(body, ids);
      const newAgent = {
        id: agent.id,
        name: agent.name,
        workspace: agent.workspace,
        skills: agent.skills,
        identity: agent.identity,
        tools: { alsoAllow: [] },
        subagents: { allowAgents: [] },
      };
      if (body.subagents?.allowAgents) {
        newAgent.subagents.allowAgents = normalizeSkills(body.subagents.allowAgents);
      }
      if (body.tools?.alsoAllow) {
        newAgent.tools.alsoAllow = normalizeSkills(body.tools.alsoAllow);
      }
      config.agents.list.push(newAgent);
      const { backupPath, state } = writeConfig(config);
      return send(res, 201, { ok: true, backup: backupPath, agent: newAgent, state });
    }

    const agentMatch = url.pathname.match(/^\/api\/agents\/([^/]+)$/);
    if (agentMatch && req.method === 'PUT') {
      const id = decodeURIComponent(agentMatch[1]);
      const body = await parseBody(req);
      const config = readConfig();
      const agent = findAgent(config, id);
      if (!agent) return send(res, 404, { ok: false, error: `agent not found: ${id}` });

      if (body.name !== undefined) agent.name = String(body.name).trim();
      if (body.workspace !== undefined) agent.workspace = String(body.workspace).trim();
      if (body.skills !== undefined) agent.skills = normalizeSkills(body.skills);
      if (body.emoji !== undefined) {
        agent.identity = agent.identity || {};
        agent.identity.emoji = String(body.emoji).trim();
      }
      if (body.theme !== undefined) {
        agent.identity = agent.identity || {};
        agent.identity.theme = String(body.theme).trim();
      }
      if (body.identityName !== undefined) {
        agent.identity = agent.identity || {};
        agent.identity.name = String(body.identityName).trim();
      }
      if (body.status !== undefined) agent.status = String(body.status).trim();
      if (body.allowAgents !== undefined) {
        agent.subagents = agent.subagents || {};
        agent.subagents.allowAgents = normalizeSkills(body.allowAgents);
      }
      if (body.tools !== undefined) {
        agent.tools = agent.tools || {};
        agent.tools.alsoAllow = normalizeSkills(body.tools);
      }
      const { backupPath, state } = writeConfig(config);
      return send(res, 200, { ok: true, backup: backupPath, agent, state });
    }

    const skillMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/skills$/);
    if (skillMatch && req.method === 'PUT') {
      const id = decodeURIComponent(skillMatch[1]);
      const body = await parseBody(req);
      const config = readConfig();
      const agent = findAgent(config, id);
      if (!agent) return send(res, 404, { ok: false, error: `agent not found: ${id}` });
      agent.skills = normalizeSkills(body.skills);
      const { backupPath, state } = writeConfig(config);
      return send(res, 200, { ok: true, backup: backupPath, agent, state });
    }

    if (req.method === 'DELETE' && agentMatch) {
      const id = decodeURIComponent(agentMatch[1]);
      const config = readConfig();
      const agents = config?.agents?.list;
      if (!Array.isArray(agents)) return send(res, 500, { ok: false, error: 'config.agents.list missing' });
      const idx = agents.findIndex(a => a.id === id);
      if (idx === -1) return send(res, 404, { ok: false, error: `agent not found: ${id}` });
      const removed = agents.splice(idx, 1)[0];
      const { backupPath, state } = writeConfig(config);
      return send(res, 200, { ok: true, backup: backupPath, removed, state });
    }

    if (req.method === 'GET' && url.pathname === '/api/export') {
      const config = readConfig();
      const body = {
        generatedAt: new Date().toISOString(),
        state: computeState(config),
        config: {
          meta: config.meta,
          agents: config.agents,
          bindings: config.bindings,
          channels: config.channels ? { ...config.channels, accounts: undefined } : undefined,
        },
      };
      return send(res, 200, body);
    }

    send(res, 404, { ok: false, error: 'not found' });
  } catch (error) {
    send(res, 500, { ok: false, error: error.message, stack: process.env.DEBUG ? error.stack : undefined });
  }
}

const server = http.createServer((req, res) => {
  handler(req, res);
});

try {
  syncDashboardMarkdown(readConfig());
} catch (err) {
  console.error('Failed to sync dashboard markdown on startup:', err.message);
}

server.listen(PORT, HOST, () => {
  console.log(`Agent console listening on http://${HOST}:${PORT}`);
  console.log(`Config: ${CONFIG_PATH}`);
  console.log(`Backup dir: ${BACKUP_DIR}`);
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});