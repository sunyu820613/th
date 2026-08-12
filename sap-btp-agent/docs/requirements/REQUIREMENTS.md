# REQUIREMENTS — SAP BTP Agent

状态：Draft（Phase 0）
最后更新：2026-08-12

## 1. 项目目标

构建一个模块化、可测试、可扩展的 SAP BTP 智能体，第一阶段至少支持：

1. SAP 技术知识问答
2. SAP 错误诊断
3. SAP 代码分析
4. 官方资料检索

## 2. 能力 1：SAP 技术知识问答

覆盖范围：SAP BTP 服务选择、SAP AI Core 和 Generative AI Hub、SAP Cloud SDK for AI、
SAP HANA Cloud、CAP、Cloud Foundry、Kyma、Destination Service、Connectivity Service、
XSUAA、SAP Build Work Zone、SAP Integration Suite、ABAP Cloud、RAP、CDS View、
OData V2/V4、Fiori Elements、S/4HANA 扩展开发。

**强制要求**：回答必须区分以下四类信息，并在输出中明确标注：

- 官方文档确认的信息
- 项目代码中确认的信息
- 智能体推断的信息
- 尚未验证的信息

禁止把推断描述成已确认事实。

## 3. 能力 2：SAP 错误诊断

支持的输入类型：ABAP 错误、RAP 激活错误、CDS Annotation 错误、OData 错误、
Fiori Elements 错误、SAP BTP 部署日志、Cloud Foundry 日志、MTA 部署错误、
Destination 连接错误、XSUAA 权限错误、SAP AI Core API 错误、Python Traceback、
HTTP 请求与响应。

输出结构（固定 8 段）：

1. 错误摘要
2. 可能原因
3. 证据
4. 排查顺序
5. 建议修复方法
6. 验证方法
7. 风险和注意事项
8. 仍需用户提供的信息

## 4. 能力 3：SAP 代码分析

第一阶段支持分析的语言/格式：ABAP、CDS DDL、RAP Behavior Definition、
RAP Behavior Implementation、Annotation XML、UI5 JavaScript、CAP CDS、CAP Node.js、
Python、YAML、JSON、MTA Descriptor、Cloud Foundry Manifest。

**约束**：不得在未确认上下文时大范围重写代码；默认先分析问题，再给出最小修改方案。

## 5. 能力 4：官方资料检索

资料优先级（从高到低）：

1. SAP Help Portal
2. SAP Developers
3. SAP Learning
4. SAP CAP 官方文档
5. SAP 官方 GitHub 仓库
6. SAP Notes 和 KBA
7. SDK 官方 API Reference
8. Anthropic、OpenAI、Python 和依赖库官方文档
9. SAP Community
10. 其他第三方资料

约束：

- 关键技术结论至少需要一个官方来源。
- 涉及版本、API、SDK、支持状态、服务能力和部署命令时，必须重新检索，禁止只依赖模型记忆。
- 所有研究结果必须记录：页面标题、来源、URL、访问日期、适用产品、适用版本、结论摘要、
  是否已通过实际测试验证。

## 6. 建议技术架构（候选，待 Codex 研究 + Claude Code 确认后定稿）

见 `docs/architecture/ARCHITECTURE.md`（Phase 0 占位，架构确定后填充）。

候选组件：

- **Backend**：Python 3.12+、FastAPI、Pydantic、httpx、pytest、structlog/logging、
  SAP Cloud SDK for AI Python、SAP AI Core / Generative AI Hub、
  SAP Orchestration Service V2、可选 LangGraph、可选 MCP、可选 SAP HANA Cloud Vector Engine
- **SAP BTP**：Cloud Foundry、SAP AI Core、Generative AI Hub、Destination Service、
  XSUAA、Application Logging、Credential Store / User-Provided Service、
  可选 SAP HANA Cloud、可选 SAP Build Work Zone
- **Frontend**：第一阶段可选简单 Web Chat UI / SAPUI5 / Fiori Elements / 独立轻量前端
  （架构未确定前不得同时实现多个前端框架）
- **Agent Modules**：coordinator、intent_router、sap_research_agent、
  sap_error_diagnosis_agent、sap_code_review_agent、sap_architecture_agent、
  retrieval_service、source_citation_service、tool_registry、prompt_registry、
  session_service、audit_service、security_filter、response_validator
  （每个模块需有明确输入输出，不得让所有逻辑集中在一个文件中）

## 7. 智能体工作流程

每次用户请求：接收请求 → 判断任务类型 → 判断是否需要官方资料检索 →
判断是否需要读取项目代码 → 判断是否涉及敏感数据 → 生成检索/分析计划 →
调用工具 → 收集证据 → 生成初步结论 → 检查结论是否有来源支持 →
检查是否存在版本冲突 → 输出答案 → 保存必要的审计信息。

代码修改类任务：需求分析 → Codex 资料检索 → Codex 技术方案 → Claude Code 实施计划 →
Claude Code 实现 → Claude Code 测试 → Codex 独立 Review → Claude Code 修复 →
Claude Code 回归测试 → 最终验收。不得跳过 Codex Review 和 Claude Code 回归测试。

## 8. 项目阶段

| Phase | 名称 | Owner | 说明 |
|---|---|---|---|
| 0 | Discovery | Codex 调研 / Claude Code 建目录建文档 | 禁止实现完整业务功能 |
| 1 | Foundation | Claude Code | FastAPI 骨架、配置、日志、异常、`/health`、测试框架、LLM Provider 抽象、Mock Provider、基础 Agent 接口 |
| 2 | SAP Knowledge Agent | Claude Code | 问题分类、官方资料检索接口、来源保存、答案引用、事实/推断区分 |
| 3 | SAP Error Diagnosis Agent | Claude Code | 错误日志解析、分类、根因候选、排查步骤、修复建议、验证步骤 |
| 4 | SAP Code Analysis Agent | Claude Code | ABAP/CDS/RAP/OData/Annotation/CAP/Python 分析、最小修改建议 |
| 5 | BTP Integration | Claude Code（依据真实环境） | AI Core、Gen AI Hub、Orchestration Service、Destination、XSUAA、HANA Cloud、CF 部署；无凭据不得伪造成功 |
| 6 | UI 和运营能力 | Claude Code（可选） | Web Chat UI / SAPUI5 / Fiori Elements、会话历史、审计日志、Token 统计、模型切换、管理页面 |

每个 Phase 完成后必须交由 Codex Review，Review 中 BLOCKER / HIGH 问题需处理后才能进入下一 Phase。

## 9. 验收标准

- 项目可在本地启动，`/health` 返回正常
- 核心模块有测试
- 无真实密钥
- 配置与业务代码分离
- Mock 模式下可完整运行
- SAP Provider 可替换
- 回答包含来源
- 事实与推断明确区分
- 错误诊断包含验证步骤
- 所有 Codex Review 的 BLOCKER 和 HIGH 问题已处理
- Claude Code 已执行回归测试
- README 包含本地启动方式
- README 包含 BTP 部署前提
- `docs/AGENT_HANDOFF.md` 已更新
- `docs/PROJECT_STATUS.md` 与代码实际状态一致
- 不得把未实现功能标记为完成
