# ARCHITECTURE — SAP BTP Agent

状态：**占位（Phase 0）— 尚未定稿**

## 为什么现在是占位

按照项目治理流程，架构必须先由 Codex 完成调研（见
`docs/tasks/codex/001-btp-agent-architecture-research.md`），
再由 Claude Code 基于研究结果做出最终技术决策。Phase 0 阶段禁止实现完整业务功能，
因此本文件暂不包含定稿的架构方案，避免在调研完成前锁定错误的技术选型。

## 候选架构（未定稿，来自需求文档，仅供研究参考）

见 `docs/requirements/REQUIREMENTS.md` 第 6 节列出的候选组件：Backend
（Python 3.12+ / FastAPI / Pydantic / httpx / pytest / SAP Cloud SDK for AI /
SAP AI Core / Generative AI Hub / Orchestration Service V2 / 可选 LangGraph /
可选 MCP / 可选 HANA Vector Engine）、SAP BTP 服务、Frontend、Agent Modules 拆分。

## 定稿流程

1. Codex 完成 `docs/research/001-btp-agent-architecture-research.md`。
2. Claude Code 审查研究报告的完整性与来源可信度。
3. Claude Code 在本文件中补全以下内容并将状态改为 **Confirmed**：
   - 系统总体架构图（模块划分与数据流）
   - 各 Agent 模块的输入/输出契约
   - LLM Provider 抽象层设计（含 Mock Provider）
   - 检索与引用（citation）机制
   - 与 SAP BTP 服务的集成方式（AI Core / Gen AI Hub / Orchestration / Destination / XSUAA / HANA Cloud）
   - 是否采用 LangGraph / MCP 的最终结论及理由
   - 部署拓扑（Cloud Foundry / Kyma）
4. 关联 ADR 记录在 `docs/decisions/`。

## 变更记录

| 日期 | 变更 | 说明 |
|---|---|---|
| 2026-08-12 | 创建占位文档 | Phase 0，等待 Codex 研究报告 001 |
