# AI + SAP 集成项目完整教程

> 目标：从零开始，系统掌握"自然语言 → AI Agent → SAP → 创建 Sales Order"这一类企业项目所需的全部知识，能够真正参与开发。
>
> 案例贯穿全文：**"帮我给客户 ABC 创建一个销售订单，物料 M-100，数量 100 个，下周五交货。"**

## 目录（Part 划分）

| Part | 文件 | 内容 |
|---|---|---|
| 1 | [01-architecture-overview.md](./01-architecture-overview.md) | 总体架构、分层职责、LLM 能做/不能做什么 |
| 2 | [02-case-walkthrough.md](./02-case-walkthrough.md) | 主案例七步详细拆解（NLU→确认→SAP API→返回） |
| 3 | [03-sap-sd-basics.md](./03-sap-sd-basics.md) | SAP SD 核心概念全解 + Order-to-Cash 流程 |
| 4 | [04-tcode-vs-api.md](./04-tcode-vs-api.md) | VA01/VA02/VA03 与 API 的关系 |
| 5 | [05-sap-api-integration.md](./05-sap-api-integration.md) | OData / BAPI / RFC / IDoc、API Business Hub、Destination |
| 6 | [06-ecc-vs-s4hana.md](./06-ecc-vs-s4hana.md) | ECC / On-Premise / Private Cloud / Public Cloud 集成差异 |
| 7 | [07-llm-tool-calling.md](./07-llm-tool-calling.md) | LLM Tool Calling 从零讲起 + Tool 设计 |
| 8 | [08-agent-must-not-touch-sap-directly.md](./08-agent-must-not-touch-sap-directly.md) | 为什么 Agent 不能直连 SAP，事故案例 |
| 9 | [09-read-write-tools-authz.md](./09-read-write-tools-authz.md) | READ/WRITE 工具分类、鉴权与身份传递 |
| 10 | [10-btp-integration-suite-cap.md](./10-btp-integration-suite-cap.md) | SAP BTP 全景、Integration Suite/CPI、CAP 教程 |
| 11 | [11-demo-project.md](./11-demo-project.md) | 可动手做的 Mini Demo（Mock SAP → 真实 SAP） |
| 12 | [12-sequence-diagrams.md](./12-sequence-diagrams.md) | 完整 Mermaid 时序图 |
| 13 | [13-error-scenarios-idempotency.md](./13-error-scenarios-idempotency.md) | 15+ 错误场景、幂等性设计 |
| 14 | [14-security.md](./14-security.md) | Prompt Injection、最小权限、密钥管理 |
| 15 | [15-observability-audit.md](./15-observability-audit.md) | 全链路日志、Correlation ID、审计 |
| 16 | [16-production-architecture.md](./16-production-architecture.md) | 生产参考架构、Trust Boundary、云归属 |
| 17 | [17-learning-path.md](./17-learning-path.md) | Level 1/2/3 学习路线与推荐顺序 |
| 18 | [18-glossary.md](./18-glossary.md) | 中英日术语表 |
| 19 | [19-sap-mm-basics.md](./19-sap-mm-basics.md) | SAP MM（物料管理）基础：采购订单、库存管理、Procure-to-Pay |
| 20 | [20-sap-pp-basics.md](./20-sap-pp-basics.md) | SAP PP（生产计划）基础：生产订单、BOM、MRP、SD/MM/PP 三角关系 |

## 关于准确性的重要说明

- 本教程中涉及 SAP 具体 API 名称（如 `API_SALES_ORDER_SRV`）、Fiori App ID、BTP 服务名等，均为**公开可查、长期稳定**的标准内容，但**字段级细节（必填/可选、取值范围、版本差异）必须以你所连接的具体 SAP 系统的 API metadata（`$metadata`）和 SAP API Business Accelerator Hub 文档为准**，教程中标注「⚠️ 需按版本核实」的地方尤其如此。
- Joule / Joule Studio / Generative AI Hub / SAP AI Core 相关内容变化较快（2024-2026 SAP 持续发版），教程给出的是**架构性认知**（这个组件大致负责哪一层），不代表当前最新 UI 或计费方式，标注「⚠️ 需核实当前版本」。
- 明确区分 **ECC / S/4HANA On-Premise / Private Cloud / Public Cloud** 四种情形，不混用。
- 已知 deprecated 的技术会明确标注（例如经典 SOAP-based Sales Order API 在新项目中已不推荐，优先 OData V2/V4）。
