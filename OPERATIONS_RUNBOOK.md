# OPERATIONS_RUNBOOK.md - 虫群架构运维手册

## 目的

给后续维护这套系统的人一份能直接落地的操作说明：
- 现在有哪些 agent
- 各自负责什么
- 什么任务该直办、该转交、该编排
- 哪些地方不能乱改

## 一、当前稳定 id 对照

| 中文名称 | 稳定 id | 用途 |
|---|---|---|
| 总调度中心 | `dispatch` | 总入口、总判断、总收口 |
| 快速响应中心 | `fast-response` | 简单任务、低风险闭环 |
| 协同编排中心 | `orchestration` | 复杂任务拆解与多节点协同 |
| 信息支持中心 | `information` | 检索、汇总、背景整理 |
| 分析研判中心 | `analysis-center` | 分析、评估、研判 |
| 策略规划中心 | `strategy-center` | 方案、路径、节奏建议 |
| 行政保障中心 | `admin-support` | 日程、任务、提醒、行政支撑 |
| 技术支持中心 | `tech-support` | 配置、实现、自动化、排障 |
| 合规风控中心 | `compliance` | 风险、边界、合规判断 |
| 文旅项目中心 | `tourism-center` | 文旅专项任务 |
| 系统进化中心 | `evolution-center` | 复盘、纠错、规则优化 |

## 二、对外口径与对内口径

### 对外
- 优先用中文组织名说话
- 不需要向业务方暴露内部 id
- 不主动暴露内部调度细节

### 对内
- 配置、文档、验证样本一律使用稳定 id
- 不再把旧 id 当成当前运行标识
- 如需保留旧 id，只能放在“迁移说明”里

## 三、任务路由速查

### 1. 直接闭环 / 快速响应
适用：
- 简单问答
- 一步查询
- 固定格式回复
- 低风险轻事务

优先节点：
- `dispatch`
- 或直接交 `fast-response`

### 2. 单能力任务
适用：
- 明确只需要一个专业中心
- 不需要复杂拆解

优先节点：
- `information`
- `analysis-center`
- `strategy-center`
- `admin-support`
- `tech-support`
- `compliance`
- `tourism-center`

补充说明：
- `tech-support` 可在编码、重构、代码审查、脚本实现等任务中调用 Claude Code
- 推荐调用方式：`claude --permission-mode bypassPermissions --print '任务说明'`
- Claude Code 适合复杂编码任务；简单一两行修补优先直接改文件

### 3. 复杂协同任务
适用：
- 两个及以上中心参与
- 有依赖顺序
- 需要拆解、编排、整合

优先节点：
- `dispatch` 判断
- `orchestration` 牵头执行

### 4. 复盘优化任务
适用：
- 任务失败
- 用户纠错
- 路由错误
- 复杂任务结束后需要沉淀规则

优先节点：
- `evolution-center`

## 四、什么时候不要乱升级

以下情况不要轻易送进协同编排：
- 一步能答完的问题
- 一个专业中心能独立完成的问题
- 没有真实依赖关系的问题
- 只是篇幅长，但本质单线程的问题

一句话：
**长，不等于复杂；专业，不等于协同。**

## 五、什么时候必须提高审慎等级

以下情况必须更稳：
- 删除
- 覆盖写入
- 配置修改
- 外部发送
- 高权限操作

原则：
- 能确认就确认
- 能验证就验证
- 能留痕就留痕

## 六、配置维护红线

### 可以改的
- `name`
- `identity`
- 文档说明
- 路由样本
- 低风险描述类配置

### 高风险项
- `id`
- `allowAgents`
- `bindings[].agentId`
- `channels.*.accounts.*.agent`

### 规则
- 改 `id` 必须一次性联动替换
- 改完必须马上验证
- 高风险改动后必须留 git 提交

## 七、标准验证动作

每次架构或配置修改后，至少做这几步：

1. 看服务是否起来
   - `openclaw status`

2. 看 agent ids 是否生效
   - 检查 `~/.openclaw/openclaw.json`

3. 看绑定是否断链
   - `bindings[].agentId`
   - `channels.feishu.accounts.*.agent`

4. 看文档是否还在用旧口径
   - 扫描核心文档中的旧 id

5. git 留痕
   - 变更后提交 commit

## 八、技术任务执行编排（tech-execution-orchestrator）

### 核心原则
- `dispatch` 是唯一总路由与总收口
- `tech-support` 是技术任务正式承接中心
- Claude Code 是 `tech-support` 可调用的编码执行器，不是独立调度中心

### 技术任务三分法

| 路径 | 使用时机 | 避免时机 |
|---|---|---|
| 直接编辑 | 单文件、小改动、模式清晰、风险低 | 影响多文件、需要探索、需要系统验证、高风险配置 |
| Claude Code | 多文件修改、重构、脚本开发、代码审查、需要探索或验证 | 1-2 行确定性小修、纯配置改动、secrets / 凭据 / 高风险系统操作 |
| tech-support 审慎直办 | OpenClaw 配置、CI/CD、权限、插件、外部集成、敏感系统变更 | 普通业务文档改写、纯信息整理、非技术任务 |

### Claude Code 使用规则
- 推荐命令：`claude --permission-mode bypassPermissions --print '任务说明'`
- Claude Code 负责技术执行，不负责总路由判断
- 小改动不为了“形式完整”强行调用 Claude Code
- Claude Code 输出后，仍要由当前链路做验证与收口

### 技术任务回报给 dispatch
至少包含：
- 做了什么
- 怎么做的（直接编辑 / Claude Code / tech-support 审慎直办）
- 验证结果
- 风险点
- 是否已 git 留痕

## 九、当前建议的真实压测集合

建议长期保留四类样本：
- A 类：简单闭环
- B 类：单能力任务
- C 类：复杂协同
- D 类：复盘优化

每次架构调整后，至少补 1 个新样本。

## 十、一句话总纲

**配置统一靠稳定 id，业务表达统一靠中文组织名，系统跑得顺不看概念多漂亮，只看真实任务有没有被送到对的人和对的链路上。**

---
_更新于：2026-03-22_