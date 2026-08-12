# SAP BTP Agent

面向 SAP BTP / SAP S/4HANA / ABAP / RAP / CDS / OData / Fiori Elements / CAP /
SAP HANA Cloud / SAP AI Core / Generative AI Hub 等场景的智能体，提供知识问答、
错误诊断、代码分析、官方资料检索与开发辅助能力。

> **当前状态：Phase 0（Discovery）**。本项目尚处于治理结构搭建与架构调研阶段，
> 还没有可运行的业务代码。实际功能与启动方式将在 Phase 1（Foundation）落地后补全本文件。
> 项目实时状态见 [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)。

## 协作模式

本项目由 Claude Code（Implementation Owner）与 Codex（Research / Design /
Documentation / Review Owner）协作完成，角色划分、权限范围与工作流程见：

- [`CLAUDE.md`](CLAUDE.md) — Claude Code 的规则
- [`AGENTS.md`](AGENTS.md) — Codex 的规则
- [`docs/AGENT_HANDOFF.md`](docs/AGENT_HANDOFF.md) — 双方交接记录

## 目录结构

```
sap-btp-agent/
├─ src/                     # 正式实现代码（Phase 1 起）
├─ app/                     # 应用入口（Phase 1 起，如 FastAPI app）
├─ tests/                   # 单元 / 集成 / 端到端测试
├─ examples/codex-poc/      # Codex 产出的参考代码 / PoC（非正式实现）
├─ research/                # Codex 调研过程中的辅助材料
└─ docs/
   ├─ architecture/         # 架构与安全文档
   ├─ decisions/            # ADR
   ├─ requirements/         # 需求文档
   ├─ research/             # Codex 研究报告（正式产出）
   ├─ reviews/               # Codex Review 报告
   ├─ tasks/                # Claude Code ↔ Codex 任务文件
   │  ├─ codex/
   │  └─ claude/
   ├─ handoffs/             # 交接归档
   ├─ testing/              # 测试记录与证据
   └─ operations/           # 运维相关文档
```

## 本地启动方式

Phase 0 阶段暂无可运行代码，本节将在 Phase 1 完成 FastAPI 项目骨架后补全，
届时会包含：环境准备、依赖安装、`.env` 配置、启动命令、`/health` 验证方式。

## SAP BTP 部署前提

Phase 5（BTP Integration）之前不会涉及真实部署。部署前提（服务实例、凭据、
Cloud Foundry / Kyma 环境等）将在对应阶段的研究报告与架构文档确定后，在本节列出。

## 需求与验收标准

详见 [`docs/requirements/REQUIREMENTS.md`](docs/requirements/REQUIREMENTS.md)。
