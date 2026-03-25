# CAPABILITY_MAPPING.md - 节点与现有 Skill / 工具对应表

## 目的

把虫群式架构中的各节点，与当前已安装的 skill、可用工具和推荐调用方式对应起来，便于后续稳定运行。

## 一、总表

| 节点 | 主要职责 | 对应 Skill | 对应工具 | 建议调用方式 |
|---|---|---|---|---|
| 总调度中心 | 接需求、判复杂度、路由、统一输出 | 无固定单一 skill，依赖 AGENTS 规则 | sessions_spawn, sessions_send, read, write, memory_search | 主会话直接承担 |
| 快速响应中心 | 简单任务、标准任务、低风险闭环 | feishu-channel-rules, memory-system-v2（可选） | feishu 系列工具、web_search、web_fetch、read | 主会话轻处理模式 |
| 协同编排中心 | 拆解复杂任务、组织多节点协同 | proactive-agent, task-orchestrator | sessions_spawn, sessions_send, subagents, read, write | 主会话编排模式 |
| 事务支持中心 | 收集、整理、提醒、跟进 | feishu-calendar, feishu-task | feishu_calendar_*, feishu_task_*, feishu_im_user_message | 直接工具优先 |
| 信息支持中心 | 检索、汇总、背景整理 | feishu-im-read, feishu-fetch-doc, multi-search-engine, research-packager | web_search, web_fetch, feishu_im_user_*, feishu_fetch_doc | skill + 工具 |
| 分析研判中心 | 研究、评估、判断 | stock-market-pro, trading-coach, political-translator, multi-search-engine, industry-analysis-framework, feasibility-study-framework | web_search, web_fetch, read, exec | skill 优先，必要时子代理 |
| 策略规划中心 | 方案设计、路径规划、优先级建议 | proactive-agent, strategy-planning, decision-memo | read, write, web_search, sessions_spawn | 主会话 + 子代理 |
| 行政保障中心 | 流程、资源、事务落地 | feishu-calendar, feishu-task, feishu-create-doc, feishu-update-doc, meeting-minutes-kit, project-tracker | feishu_calendar_*, feishu_task_*, feishu_create_doc, feishu_update_doc | 工具优先 |
| 家庭支持中心 | 家庭事务、生活保障、家庭项目支持 | meeting-minutes-kit, project-tracker, feasibility-study-framework, decision-memo, household-operations, family-care-coordinator, home-project-manager | feishu_calendar_*, feishu_task_*, web_search, web_fetch, read | 家庭场景轻量编排 |
| 出行支持中心 | 机票、酒店、火车票、打车、租车查询与比价 | travel-search | web_search, web_fetch, read | 查询+比价+建议，不代下单 |
| 技术支持中心 | 技术实现、排查、自动化 | coding-agent（可按需）, openclaw-control-center | exec, read, write, browser, gateway, sessions_spawn | 复杂任务可派子代理 |
| 合规风控中心 | 合规、风险、边界判断 | self-improving（辅助纠错）, legal-review | read, web_search, feishu_doc_comments（如需） | 主会话审查为主 |
| 文旅项目中心 | 文旅专项任务支持 | tourism-project-analyst, tourism-project-due-diligence, feasibility-study-framework | web_search, web_fetch, feishu_doc / sheet / bitable 工具 | 临时编组 |
| 系统进化中心 | 复盘、纠错、总结、规则优化 | cognitive-memory, self-improving, proactive-agent, skill-creator, skill-vetter | memory_search, memory_get, read, write, sessions_spawn | 旁路运行 |

## 二、各节点详细映射

### 1. 总调度中心

#### 作用
- 接收老板/业务方需求
- 判断复杂度
- 选择直接处理、工具处理、还是子代理协同
- 统一输出

#### 主要依赖
- `AGENTS.md`
- `ARCHITECTURE.md`
- `OPERATING_MODEL.md`
- `memory_search` / `memory_get`
- `sessions_spawn` / `sessions_send`

#### 推荐方式
主会话直接承担，不额外拆独立 skill。

---

### 2. 快速响应中心

#### 作用
- 消化简单任务
- 标准化回复
- 低风险一步闭环

#### 对应 skill
- `feishu-channel-rules`：保证飞书输出风格稳定
- `memory-system-v2`：如需要更快记忆检索，可辅助简单任务判断

#### 对应工具
- 飞书基础工具
- `web_search`
- `web_fetch`
- `read`

#### 推荐方式
仍由主会话承担，不拆独立 agent。

---

### 3. 协同编排中心

#### 作用
- 拆复杂任务
- 设计处理顺序
- 调度多节点协同
- 汇总结果

#### 对应 skill
- `proactive-agent`：适合持续观察任务流与优化编排
- `task-orchestrator`：适合做复杂任务拆解、依赖判断、并串行规划与结果整合

#### 对应工具
- `sessions_spawn`
- `sessions_send`
- `subagents`
- `read` / `write`

#### 推荐方式
主会话进入编排模式；复杂任务再 spawn。

---

### 4. 事务支持中心

#### 作用
- 日程、提醒、跟进
- 清单、纪要、基础整理

#### 对应 skill
- `feishu-calendar`
- `feishu-task`

#### 对应工具
- `feishu_calendar_event`
- `feishu_calendar_calendar`
- `feishu_task_task`
- `feishu_task_tasklist`
- `feishu_task_comment`

#### 推荐方式
直接走飞书工具，不必过度抽象。

---

### 5. 信息支持中心

#### 作用
- 检索资料
- 查聊天记录、文档、背景资料
- 结构化整理信息

#### 对应 skill
- `feishu-im-read`
- `feishu-fetch-doc`
- `multi-search-engine`
- `research-packager`：适合把多源结果整理成带来源、可信度和缺口说明的资料包

#### 对应工具
- `feishu_im_user_get_messages`
- `feishu_im_user_search_messages`
- `feishu_fetch_doc`
- `web_search`
- `web_fetch`

#### 推荐方式
技能负责方法，工具负责抓数据。

---

### 6. 分析研判中心

#### 作用
- 对收集到的信息做分析、评估、研判

#### 对应 skill
- `stock-market-pro`
- `trading-coach`
- `political-translator`
- `multi-search-engine`

#### 对应工具
- `web_search`
- `web_fetch`
- `read`
- `exec`

#### 推荐方式
优先用现成 skill；复杂分析可派子代理独立跑。

---

### 7. 策略规划中心

#### 作用
- 拟定路径
- 形成方案
- 给出优先级建议

#### 对应 skill
- `proactive-agent`

#### 对应工具
- `read`
- `write`
- `web_search`
- `sessions_spawn`

#### 推荐方式
主会话完成轻量规划；复杂规划任务可分给子代理。

---

### 8. 行政保障中心

#### 作用
- 流程推进
- 会议、任务、文档、资源协调

#### 对应 skill
- `feishu-calendar`
- `feishu-task`
- `feishu-create-doc`
- `feishu-update-doc`

#### 对应工具
- `feishu_calendar_*`
- `feishu_task_*`
- `feishu_create_doc`
- `feishu_update_doc`
- `feishu_sheet`

#### 推荐方式
飞书场景优先直接调用工具，减少中间层。

---

### 9. 家庭支持中心

#### 作用
- 家庭事务支持
- 生活保障与周期提醒
- 家庭成员协同
- 家庭项目推进

#### 对应 skill
- `meeting-minutes-kit`
- `project-tracker`
- `feasibility-study-framework`
- `decision-memo`

#### 对应工具
- `feishu_calendar_*`
- `feishu_task_*`
- `web_search`
- `web_fetch`
- `read`

#### 推荐方式
优先采用轻量编排和清单/台账化输出，必要时再调用其他专业中心支持。

---

### 10. 技术支持中心

#### 作用
- 技术实现
- 配置修改
- 故障排查
- 自动化

#### 对应 skill
- `openclaw-control-center`
- `coding-agent`（如后续启用）

#### 对应工具
- `exec`
- `read`
- `write`
- `edit`
- `browser`
- `gateway`
- `sessions_spawn`

#### 推荐方式
小改动直接工具；复杂开发或排障可派子代理。

---

### 11. 合规风控中心

#### 作用
- 合规判断
- 边界控制
- 风险提醒

#### 对应 skill
- `self-improving`（用于发现错误与边界偏差）
- `skill-vetter`（针对新 skill 的安全审查）
- `legal-review`：适合合同、方案、制度与操作流程的风险分级和审查意见输出

#### 对应工具
- `read`
- `web_search`
- 文档/消息读取类工具

#### 推荐方式
以主会话审查为主，不建议完全自动化。

---

### 12. 文旅项目中心

#### 作用
- 文旅专项研究、整理、执行支持

#### 对应 skill
- 当前暂无专门文旅 skill

#### 对应工具
- `web_search`
- `web_fetch`
- `feishu_create_doc`
- `feishu_update_doc`
- `feishu_sheet`
- `feishu_bitable_*`

#### 推荐方式
按项目临时编组，不急着独立化。

---

### 13. 系统进化中心

#### 作用
- 复盘
- 纠错
- 总结
- 优化规则
- 沉淀模板与能力

#### 对应 skill
- `cognitive-memory`
- `self-improving`
- `proactive-agent`
- `memory-system-v2`（增强）
- `skill-creator`（后期增强）
- `skill-vetter`（安全增强）

#### 对应工具
- `memory_search`
- `memory_get`
- `read`
- `write`
- `sessions_spawn`

#### 推荐方式
当前作为旁路能力组合运行，不直接承接业务主链路。

## 三、调用优先级建议

### 优先级 1：先用现成工具
如果有一等工具可直接完成，就先用工具。

### 优先级 2：再用 skill 提升方法质量
当任务需要稳定方法论时，再套上 skill。

### 优先级 3：复杂任务再派子代理
只有任务复杂、长链路、跨上下文时，再 spawn。

## 四、一句话结论

当前最合理的映射方式是：
**总调度中心和快速响应中心由主会话承担，协同编排中心由主会话在复杂任务中切换模式承担，专业能力中心由现有 skill + 工具 + 子代理动态承载，系统进化中心由 cognitive-memory / self-improving / proactive-agent 组合形成。**

---
_更新于：2026-03-22_