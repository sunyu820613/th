# PROJECT STATUS — SAP BTP Agent

最后更新：2026-08-12
当前阶段：**Phase 0 — Discovery（进行中）**

## 1. 已完成

- 确定新项目位于 `sap-btp-agent/` 子目录，与仓库根目录既有的、无关的
  Spring Boot Java 脚手架（`pom.xml`、`src/main/java/com/th/...`）隔离，互不影响。
- 建立治理目录结构：`docs/{architecture,decisions,requirements,research,reviews,
  tasks/{codex,claude},handoffs,testing,operations}`、`research/`、`examples/codex-poc/`、
  `src/`、`app/`、`tests/`（当前为空占位）。
- 创建核心治理文档：
  - `CLAUDE.md` — Claude Code 职责/权限/验证标准/禁止事项
  - `AGENTS.md` — Codex 职责/权限/Review 标准/交接格式
  - `README.md` — 项目说明（本地启动方式待 Phase 1 补全）
  - `docs/requirements/REQUIREMENTS.md` — 四大能力需求、候选架构、阶段划分、验收标准
  - `docs/architecture/ARCHITECTURE.md` — 占位，待 Codex 研究报告 001 完成后定稿
  - `docs/architecture/SECURITY.md` — 密钥管理、日志脱敏、不可信输入处理规则
  - `docs/testing/TEST_STRATEGY.md` — 测试策略与 13 项验证清单
  - `docs/tasks/CODEX_TASK_TEMPLATE.md` / `CLAUDE_TASK_TEMPLATE.md`
  - `docs/reviews/CODEX_REVIEW_TEMPLATE.md`
  - `docs/decisions/ADR_TEMPLATE.md`
  - `docs/AGENT_HANDOFF.md`
- 生成 Codex 第一份研究任务：`docs/tasks/codex/001-btp-agent-architecture-research.md`，
  覆盖 SAP BTP Pro-Code AI Agent 官方架构、SAP Cloud SDK for AI、AI Core/Gen AI Hub、
  Orchestration Service V2、HANA Cloud Vector Engine、Destination/XSUAA、
  Cloud Foundry 部署、MCP/A2A 适用性、LangGraph 适用性共 9 个方向。
- 建立 `.gitignore` 与 `.env.example`（占位变量名，禁止提交真实密钥）。

## 2. 未完成 / 阻塞项

- **Codex 研究报告尚未产出**：当前会话环境中未安装 `codex` CLI（`command -v codex`
  返回 not found），Claude Code 无法直接调用 Codex 执行研究任务。
  → **需要用户在可访问 Codex CLI 的环境中运行任务文件
  `docs/tasks/codex/001-btp-agent-architecture-research.md`，并将结果保存为
  `docs/research/001-btp-agent-architecture-research.md`。**
- 架构尚未定稿（`docs/architecture/ARCHITECTURE.md` 为占位状态），依赖上述研究报告。
- Phase 1（FastAPI 骨架、配置、日志、异常处理、`/health`、测试框架、LLM Provider
  抽象、Mock Provider、基础 Agent 接口）尚未开始，`src/`、`app/`、`tests/` 目前为空。
- 尚无任何可运行代码，因此本阶段无测试结果可记录。

## 3. 下一步

1. 用户执行 Codex 研究任务 001，产出 `docs/research/001-btp-agent-architecture-research.md`。
2. Claude Code 审查该报告的完整性与来源可信度，将结论写入 `docs/architecture/ARCHITECTURE.md`
   并视需要产出 ADR（`docs/decisions/`）。
3. 经用户确认后，进入 Phase 1 Foundation 实施。

## 4. 阶段进度总览

| Phase | 状态 |
|---|---|
| 0 Discovery | 进行中（治理结构已建立，等待 Codex 研究报告） |
| 1 Foundation | 未开始 |
| 2 SAP Knowledge Agent | 未开始 |
| 3 SAP Error Diagnosis Agent | 未开始 |
| 4 SAP Code Analysis Agent | 未开始 |
| 5 BTP Integration | 未开始 |
| 6 UI 和运营能力 | 未开始 |
