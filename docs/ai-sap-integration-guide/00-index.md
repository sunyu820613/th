# AI + SAP 集成项目完整教程（AI + SAP 統合プロジェクト完全チュートリアル）

> 目标：从零开始，系统掌握"自然语言 → AI Agent → SAP → 创建 Sales Order"这一类企业项目所需的全部知识，能够真正参与开发。
>
> 目標：ゼロから始めて、「自然言語 → AI Agent → SAP → Sales Order 作成」というタイプの企業プロジェクトに必要な知識を体系的に習得し、実際に開発に参加できるようになること。
>
> 案例贯穿全文：**"帮我给客户 ABC 创建一个销售订单，物料 M-100，数量 100 个，下周五交货。"**
>
> 事例は全編を通じて使用します：**「顧客 ABC のために販売オーダーを作成してください。品目は M-100、数量は 100 個、納品は来週金曜日でお願いします。」**

## 目录（Part 划分）（目次（Part 構成））

| Part | 文件 | 内容（内容） |
|---|---|---|
| 1 | [01-architecture-overview.md](./01-architecture-overview.md) | 总体架构、分层职责、LLM 能做/不能做什么<br>全体アーキテクチャ、レイヤーごとの役割、LLM ができること／できないこと |
| 2 | [02-case-walkthrough.md](./02-case-walkthrough.md) | 主案例七步详细拆解（NLU→确认→SAP API→返回）<br>メイン事例の 7 ステップ詳細解説（NLU→確認→SAP API→返却） |
| 3 | [03-sap-sd-basics.md](./03-sap-sd-basics.md) | SAP SD 核心概念全解 + Order-to-Cash 流程<br>SAP SD の中核概念の全解説 + Order-to-Cash プロセス |
| 4 | [04-tcode-vs-api.md](./04-tcode-vs-api.md) | VA01/VA02/VA03 与 API 的关系<br>VA01/VA02/VA03 と API の関係 |
| 5 | [05-sap-api-integration.md](./05-sap-api-integration.md) | OData / BAPI / RFC / IDoc、API Business Hub、Destination<br>OData / BAPI / RFC / IDoc、API Business Hub、Destination |
| 6 | [06-ecc-vs-s4hana.md](./06-ecc-vs-s4hana.md) | ECC / On-Premise / Private Cloud / Public Cloud 集成差异<br>ECC / On-Premise / Private Cloud / Public Cloud の統合の違い |
| 7 | [07-llm-tool-calling.md](./07-llm-tool-calling.md) | LLM Tool Calling 从零讲起 + Tool 设计<br>LLM Tool Calling の基礎から解説 + Tool 設計 |
| 8 | [08-agent-must-not-touch-sap-directly.md](./08-agent-must-not-touch-sap-directly.md) | 为什么 Agent 不能直连 SAP，事故案例<br>なぜ Agent は SAP に直接接続してはいけないか、事故事例 |
| 9 | [09-read-write-tools-authz.md](./09-read-write-tools-authz.md) | READ/WRITE 工具分类、鉴权与身份传递<br>READ/WRITE ツールの分類、認可とアイデンティティ伝播 |
| 10 | [10-btp-integration-suite-cap.md](./10-btp-integration-suite-cap.md) | SAP BTP 全景、Integration Suite/CPI、CAP 教程<br>SAP BTP の全体像、Integration Suite/CPI、CAP チュートリアル |
| 11 | [11-demo-project.md](./11-demo-project.md) | 可动手做的 Mini Demo（Mock SAP → 真实 SAP）<br>実際に手を動かせる Mini Demo（Mock SAP → 実際の SAP） |
| 12 | [12-sequence-diagrams.md](./12-sequence-diagrams.md) | 完整 Mermaid 时序图<br>完全な Mermaid シーケンス図 |
| 13 | [13-error-scenarios-idempotency.md](./13-error-scenarios-idempotency.md) | 15+ 错误场景、幂等性设计<br>15 以上のエラーシナリオ、べき等性設計 |
| 14 | [14-security.md](./14-security.md) | Prompt Injection、最小权限、密钥管理<br>Prompt Injection、最小権限、鍵管理 |
| 15 | [15-observability-audit.md](./15-observability-audit.md) | 全链路日志、Correlation ID、审计<br>全経路のログ、Correlation ID、監査 |
| 16 | [16-production-architecture.md](./16-production-architecture.md) | 生产参考架构、Trust Boundary、云归属<br>本番参照アーキテクチャ、Trust Boundary、クラウドの帰属 |
| 17 | [17-learning-path.md](./17-learning-path.md) | Level 1/2/3 学习路线与推荐顺序<br>Level 1/2/3 の学習ロードマップと推奨順序 |
| 18 | [18-glossary.md](./18-glossary.md) | 中英日术语表<br>中日英用語対照表 |
| 19 | [19-sap-mm-basics.md](./19-sap-mm-basics.md) | SAP MM（物料管理）基础：采购订单、库存管理、Procure-to-Pay<br>SAP MM（購買管理）基礎：発注、在庫管理、Procure-to-Pay |
| 20 | [20-sap-pp-basics.md](./20-sap-pp-basics.md) | SAP PP（生产计划）基础：生产订单、BOM、MRP、SD/MM/PP 三角关系<br>SAP PP（生産計画）基礎：製造指図、BOM、MRP、SD/MM/PP の三角関係 |
| 21 | [21-clean-core-rap-released-api.md](./21-clean-core-rap-released-api.md) | Clean Core、Released API/CDS/Business Object、ABAP Cloud、RAP、三种扩展路径的决策表<br>Clean Core、Released API/CDS/Business Object、ABAP Cloud、RAP、3 つの拡張パスの意思決定表 |
| 22 | [22-event-driven-integration.md](./22-event-driven-integration.md) | 事件驱动集成：SAP Business Event、Event Mesh 定位、事件不可信问题、事件幂等/顺序/重放<br>イベント駆動統合：SAP Business Event、Event Mesh の位置付け、イベントの信頼性の問題、イベントのべき等性／順序／リプレイ |
| 23 | [23-agent-testing-evaluation.md](./23-agent-testing-evaluation.md) | Agent 测试金字塔、Golden Dataset、核心评估指标（含 False Success Rate）、红队测试、CI/CD 门禁<br>Agent テストピラミッド、Golden Dataset、主要評価指標（False Success Rate を含む）、レッドチームテスト、CI/CD ゲート |
| 24 | [24-resilience-distributed-systems.md](./24-resilience-distributed-systems.md) | Timeout/Retry/Backoff/熔断/舱壁隔离、LLM/Tool/SAP 三层重试的安全性区分、Outbox/Saga<br>Timeout/Retry/Backoff/サーキットブレーカー/バルクヘッド分離、LLM/Tool/SAP の 3 層リトライにおける安全性の区分、Outbox/Saga |
| 25 | [25-environments-transport-contract-testing.md](./25-environments-transport-contract-testing.md) | DEV/QAS/UAT/PRD、SAP Transport、API Contract Drift 检测、生产就绪检查清单<br>DEV/QAS/UAT/PRD、SAP Transport、API Contract Drift 検出、本番稼働準備チェックリスト |

## 关于准确性的重要说明（正確性に関する重要な注意事項）

- 本教程列出的 SAP API / 产品名称（如 `API_SALES_ORDER_SRV`）、Fiori App ID、BTP 服务名等，均为**公开可查、基于当前公开标准能力**的内容，但**这不等于"永久不变"**：实际项目中仍必须核实目标系统版本、该对象的 **API State / Release Contract**（是否 Released、挂载的是 C0-C4 中的哪一种，见 Part 21.4）、**Communication Scenario**（S/4HANA Cloud 场景）、实际的 API metadata（`$metadata`），以及该对象是否已被标记 Deprecated——教程中标注「⚠️ 需按版本核实」的地方尤其如此。

  本チュートリアルに記載されている SAP API／製品名（`API_SALES_ORDER_SRV` など）、Fiori App ID、BTP サービス名などは、いずれも**公開情報として確認可能で、現行の公開標準機能に基づく**内容ですが、**これは「永久に変わらない」ことを意味しません**：実際のプロジェクトでは、対象システムのバージョン、当該オブジェクトの **API State / Release Contract**（Released かどうか、C0～C4 のどれに該当するか、Part 21.4 参照）、**Communication Scenario**（S/4HANA Cloud のシナリオ）、実際の API メタデータ（`$metadata`）、そして当該オブジェクトが Deprecated としてマークされていないかを必ず確認する必要があります——本チュートリアルで「⚠️ バージョンによる確認が必要」と注記されている箇所は特にそうです。

- Joule / Joule Studio / Generative AI Hub / SAP AI Core 相关内容变化较快（2024-2026 SAP 持续发版），教程给出的是**架构性认知**（这个组件大致负责哪一层），不代表当前最新 UI 或计费方式，标注「⚠️ 需核实当前版本」。

  Joule / Joule Studio / Generative AI Hub / SAP AI Core 関連の内容は変化が速く（2024～2026 年にかけて SAP は継続的にリリースを行っています）、本チュートリアルが示しているのは**アーキテクチャ的な理解**（このコンポーネントがおおよそどの層を担当するか）であり、現時点の最新 UI や課金方式を表すものではありません。「⚠️ 現行バージョンでの確認が必要」と注記しています。

- 明确区分 **ECC / S/4HANA On-Premise / Private Cloud / Public Cloud** 四种情形，不混用。

  **ECC / S/4HANA On-Premise / Private Cloud / Public Cloud** の 4 つのケースを明確に区別し、混同しません。

- 已知 deprecated 的技术会明确标注（例如经典 SOAP-based Sales Order API 在新项目中已不推荐，优先 OData V2/V4）。

  既知の deprecated（非推奨）技術には明確に注記します（例えば、クラシックな SOAP ベースの Sales Order API は新規プロジェクトでは推奨されず、OData V2/V4 が優先されます）。
