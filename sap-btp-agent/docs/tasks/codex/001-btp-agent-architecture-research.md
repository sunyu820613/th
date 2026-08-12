# Codex Task — 001-btp-agent-architecture-research

## Task Type
Research

## Requested By
Claude Code

## Date
2026-08-12

## Context

我们正在 SAP BTP 上从零搭建一个 Python 智能体项目（`sap-btp-agent/`），目标是支持
SAP 技术知识问答、错误诊断、代码分析、官方资料检索四大能力，第一阶段面向
SAP BTP、SAP AI Core、Generative AI Hub、SAP Cloud SDK for AI、CAP、HANA Cloud、
Destination/XSUAA 等技术栈。当前处于 Phase 0（Discovery），尚未确定最终架构，
候选架构见 `docs/requirements/REQUIREMENTS.md` 第 6 节，但候选内容基于模型已有知识，
**必须通过官方资料重新核实**后才能作为 Phase 1 实施依据。

## Research Question(s)

请针对以下 9 个方向分别给出结论，每个方向都要有官方来源支撑：

1. **SAP BTP Pro-Code AI Agent 官方推荐架构**：SAP 官方（SAP Help Portal / SAP
   Developers / SAP CAP 文档 / 官方 GitHub）目前对"在 BTP 上用 Python/Node.js
   构建 Pro-Code AI Agent"有哪些推荐架构模式？是否有官方参考架构图或参考实现仓库？
2. **SAP Cloud SDK for AI (Python)**：当前正式发布版本、安装方式（PyPI 包名与版本）、
   核心能力（是否封装 AI Core Client、Orchestration Client、Prompt Templating 等）、
   与直接调用 AI Core REST API 相比的优劣势、是否有已知限制。
3. **SAP AI Core + Generative AI Hub**：Generative AI Hub 当前支持的模型接入方式
   （Model Library / BYOM）、Deployment 概念（Scenario / Executable / Configuration /
   Deployment）、鉴权方式（Service Key、OAuth2 Client Credentials）、调用配额与限流
   相关的官方说明。
4. **SAP AI Core Orchestration Service V2**：当前版本能力范围（Prompt Templating、
   Content Filtering、Data Masking、Grounding/RAG、Translation 等模块）、
   请求/响应结构、是否已 GA、Python SDK 对其的支持程度。
5. **SAP HANA Cloud Vector Engine**：当前 GA 状态、Python 访问方式（hana-ml /
   hdbcli 等）、向量存储与检索的推荐用法、与其他向量方案（如自建 pgvector/FAISS）
   相比在 BTP 场景下的适用性。
6. **Destination Service 与 XSUAA**：Python 应用中通过 Destination Service 调用
   AI Core / 其他后端服务的标准做法、认证类型选择（OAuth2ClientCredentials 等）、
   XSUAA 在 Python（而非 Java/Node）应用中的集成现状（是否有官方/社区成熟库，
   还是需要自行实现 JWT 校验）。
7. **Cloud Foundry 部署**：Python 应用在 SAP BTP Cloud Foundry 上的官方部署方式
   （buildpack、`manifest.yml` 关键字段、`mta.yaml` 是否必需）、服务绑定
   （VCAP_SERVICES）在 Python 中的读取方式。
8. **MCP 与 A2A 在 SAP BTP 中的适用方式**：SAP 官方或 SAP 生态目前对 Model Context
   Protocol（MCP）、Agent2Agent（A2A）协议的支持/集成情况如何？是否有官方 SDK、
   参考实现，或明确说明尚不支持/处于早期阶段。
9. **LangGraph 是否适合本项目**：结合本项目的 Agent 拆分（coordinator、
   intent_router、多个专用 sub-agent、retrieval/citation 等），评估引入 LangGraph
   相对于轻量自研工作流（例如手写的路由 + 状态机）的优劣，是否存在与 SAP Cloud SDK
   for AI / Orchestration Service 集成的已知案例或摩擦点。

## Scope

仅调研上述 9 个方向的**架构选型与官方能力边界**，不需要产出可运行代码；
如有官方 quickstart/sample 仓库，请记录仓库地址与关键结构，无需克隆分析全部源码。

## Out of Scope

- 不需要给出具体的 UI/前端选型调研（Phase 6 再处理）。
- 不需要调研 SAP Build Work Zone、SAP Integration Suite 细节（非本阶段架构决策项）。
- 不需要产出最终 ADR（由 Claude Code 在审查本报告后编写）。

## Required Output

- 输出文件路径：`docs/research/001-btp-agent-architecture-research.md`
- 必须使用标准 Codex Research 输出格式（见 `docs/tasks/CODEX_TASK_TEMPLATE.md`
  / `AGENTS.md`）：Research Question / Executive Summary / Official Sources
  （表格）/ Confirmed Facts / Assumptions / Options / Recommended Option /
  Risks / Implementation Notes / Verification Plan / Unresolved Questions。
- 第 9 个问题（LangGraph 适用性）需要在 Options 中至少给出"引入 LangGraph"与
  "轻量自研"两个选项的对比。

## Constraints

- 关键技术结论至少需要一个官方来源（SAP Help Portal / SAP Developers /
  SAP CAP 官方文档 / SAP 官方 GitHub / SAP Notes / KBA / SDK 官方 API Reference
  优先）。
- 版本、API、SDK、支持状态、服务能力、部署命令必须重新检索确认，不得只依赖模型记忆。
- 禁止只给链接不总结内容；禁止只根据博客或社区帖子做关键技术决定（社区资料可作为
  补充，不能作为唯一依据）。
- 仅可在 `docs/research/`、`docs/tasks/`、`research/`、`examples/codex-poc/` 等
  Codex 可写目录中产出文件。

## Deadline / Priority

Phase 0 阻塞项：Phase 1 的 FastAPI 骨架与 LLM Provider 抽象设计依赖本报告的结论
（尤其是第 2、3、4、9 项），请优先完成。

## Handoff

完成后：

1. 将报告保存为 `docs/research/001-btp-agent-architecture-research.md`。
2. 更新 `docs/AGENT_HANDOFF.md`：`Current Owner` 改为 Claude Code，
   `Completed Work` 填写研究覆盖范围，`Ready for Handoff` 设为 `Yes`
   （若仍有未解决的关键问题导致无法交接，设为 `No` 并在 `Open Issues` 中说明）。
3. 若发现调研过程中候选架构需要重大调整（例如某组件实际不可用/已废弃），
   在 Executive Summary 中明确标出，便于 Claude Code 优先处理。
