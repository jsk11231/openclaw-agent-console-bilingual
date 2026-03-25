# 总索引 / README

这套文档描述的是一套 **虫群式组织架构**：一个总调度入口、一个快速响应层、一个复杂协同层、一组专业能力中心，以及一个持续优化的系统进化中心。

## 先读顺序

如果你第一次看，建议按这个顺序：

1. `ARCHITECTURE.md` —— 先看整体架构
2. `OPERATING_MODEL.md` —— 再看实际怎么跑
3. `CAPABILITY_MAPPING.md` —— 再看节点和 skill / 工具怎么对应
4. `ROUTING_POLICY.md` —— 再看任务怎么分流
5. `TOOL_PRIORITY.md` —— 再看先用什么、后用什么
6. `TASK_TEMPLATES.md` —— 再看常见任务怎么模板化
7. `REFLECTION_POLICY.md` —— 再看系统怎么复盘和进化
8. `EVOLUTION_USAGE.md` —— 再看系统进化中心怎么实际使用
9. `ROUTING_VALIDATION.md` —— 再看怎么用真实任务校准路由
10. `ROADMAP.md` —— 最后看落地顺序

## 文件说明

### `AGENTS.md`
当前工作区的核心行为说明，定义总调度中心的身份、职责和边界。

### `ARCHITECTURE.md`
组织架构总说明，定义整套虫群式结构、节点职责和整体工作流。

### `OPERATING_MODEL.md`
把架构映射到当前 OpenClaw 的实际运行方式，说明哪些节点由谁承担。

### `CAPABILITY_MAPPING.md`
节点与现有 skill / 工具的对应表，方便实际调用。

### `ROUTING_POLICY.md`
任务路由规则，定义什么任务走哪条路。

### `TOOL_PRIORITY.md`
工具与能力调用优先级，定义先用工具、skill、还是子代理。

### `TASK_TEMPLATES.md`
高频任务模板，把常见任务沉淀成可复用模板。

### `REFLECTION_POLICY.md`
系统进化中心的复盘规则，定义怎么纠错、总结和优化。

### `EVOLUTION_USAGE.md`
系统进化中心的使用说明，定义什么时候调它、怎么调它、输出怎么沉淀。

### `ROUTING_VALIDATION.md`
真实任务路由验证样表，用来检查任务是否被送到了正确的节点和正确的链路。

### `ROADMAP.md`
落地路线图，定义这套架构后续如何推进。

### `IDENTITY.md`
身份说明，定义“小秘”在这套体系里的位置。

## 控制台入口

本地控制台已可用：

- 首页：`http://127.0.0.1:8787`
- 配置审计页：`http://127.0.0.1:8787/audit`
- 启动命令：`node agent-console-server.js`
- 开机自启：`~/Library/LaunchAgents/com.openclaw.agent-console.plist`

控制台支持：实时刷新、Agent 状态查看、架构图拖拽调布局、新增 Agent、手动改 skill、删除 Agent、导出 JSON、配置审计、默认 API 模型切换、模型切换后自动重启 gateway。

## 当前版本状态

- 已完成：架构定稿
- 已完成：运行映射
- 已完成：路由规则
- 已完成：工具优先级
- 已完成：模板沉淀
- 已完成：复盘规则
- 已完成：本地 git 初始化与首次提交

## 核心一句话

这不是传统层级组织，而是一套 **按任务动态路由、按能力按需调用、按结果统一收口、按复盘持续进化** 的协同系统。

---
_更新于：2026-03-22_


- 支持 分层折叠
- 支持 自动排布（横向 / 纵向切换）
- 支持 真拖线改上下级关系
- 支持 每个节点右上角折叠按钮
- 前端 API 请求带版本参数，减少浏览器缓存导致的旧脚本问题
- 支持一键规范布局/架构状态
- 架构图区支持缩放（滚轮 / 按钮）
- 支持根子树边界自适应（不缩节点，不含孤岛节点）


---

# English
See `README_EN.md` for the English version.