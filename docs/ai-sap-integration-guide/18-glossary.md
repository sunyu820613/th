# Part 18：术语表（中英日）（用語集（中日英））

格式：中文 | English | 日本語 | 一句话解释

| 中文 | English | 日本語 | 一句话解释 |
|---|---|---|---|
| 销售订单 | Sales Order | 受注 / 販売オーダー | 客户下单的正式销售凭证，O2C 流程起点 |
| 销售凭证 | Sales Document | 販売伝票 | Sales Order/Quotation/Inquiry 等的统称，共享底层数据结构 |
| 销售组织 | Sales Organization | 販売組織 | 负责销售的法律/组织架构单位 |
| 分销渠道 | Distribution Channel | 流通チャネル / 販売チャネル | 销售渠道（直销/经销商等） |
| 产品组/事业部 | Division | 製品グループ / 事業部門 | 产品线维度的组织单位 |
| 委托方/订货方 | Sold-to Party | 受注先 / 得意先 | 实际下单的客户 |
| 收货方 | Ship-to Party | 出荷先 | 货物实际送达方 |
| 业务伙伴 | Business Partner (BP) | ビジネスパートナー | S/4HANA 统一主数据模型，客户/供应商都是其角色 |
| 物料/产品 | Material / Product | 品目 / マテリアル | 被销售的商品 |
| 工厂 | Plant | プラント | 生产/仓储的物理组织单位 |
| 交货 | Delivery | 出荷 / 納品 | 订单之后的物流出库凭证 |
| 开票 | Billing | 請求 | 生成客户发票的凭证 |
| 定价 | Pricing | 価格決定 | 根据条件计算最终销售价格 |
| 信用检查 | Credit Check | 与信チェック | 判断客户信用额度是否支持本次交易 |
| OData | OData | OData | 基于 HTTP 的标准化数据访问协议 |
| BAPI | Business API (BAPI) | BAPI | 基于 RFC 的标准化业务函数接口 |
| RFC | Remote Function Call | RFC（リモート関数呼び出し） | SAP 专有远程过程调用协议 |
| IDoc | Intermediate Document | IDoc（中間文書） | SAP 系统间异步消息/文档交换格式 |
| 目标系统 | Destination | デスティネーション | BTP 中管理目标系统连接信息的抽象 |
| 集成套件 | Integration Suite | インテグレーションスイート | SAP BTP 上的一站式集成平台 |
| 云集成 | Cloud Integration (CPI) | クラウドインテグレーション | Integration Suite 内的集成流程引擎 |
| CAP | Cloud Application Programming Model (CAP) | CAP（クラウドアプリケーションプログラミングモデル） | SAP 推荐的应用开发框架 |
| BTP | Business Technology Platform (BTP) | ビジネステクノロジープラットフォーム | SAP 统一云平台 |
| Joule | Joule | Joule（ジュール） | SAP 官方生成式 AI 助手产品 |
| AI Core | SAP AI Core | SAP AI Core | 托管 AI/ML 模型训练与推理的 BTP 服务 |
| 工具调用 | Tool Calling / Function Calling | ツール呼び出し / 関数呼び出し | LLM 输出结构化调用请求、由宿主执行的机制 |
| 智能体 | Agent | エージェント | 能自主决定是否调用工具、如何推进任务的 LLM 应用模式 |
| 审批 | Approval | 承認 | 写操作前的人工审核流程 |
| 鉴权 | Authorization | 認可 / 権限付与 | 判断"是否有权做某操作"的机制 |
| 认证 | Authentication | 認証 | 判断"你是谁"的机制 |
| 幂等性 | Idempotency | べき等性 | 同一操作重复执行不产生额外副作用的特性 |
| 主体传播 | Principal Propagation | プリンシパル伝播 | 将终端用户身份透传到下游系统的机制 |
| 可用性检查 | Availability Check / ATP | 利用可能性チェック（ATP） | 判断库存/产能是否能满足需求的检查 |
| 行项目 | Item | 明細 / アイテム | 订单中的一行（物料+数量） |
| 计划行 | Schedule Line | スケジュールライン | 行项目下的交付计划明细 |

## 项目中你需要记住什么（プロジェクトで覚えておくべきこと）

- 与日本团队协作时，术语对齐比语言流畅度更重要——很多 SAP 日语术语是行业约定俗成的固定译法（如"得意先"对应 Sold-to Party），不是字面直译，建议直接使用本表或与日方顾问核对企业内部惯用译法。

  日本チームと協業する際は、用語の統一が言葉の流暢さよりも重要です——多くの SAP 日本語用語は業界慣習として定着した訳語であり（例えば「得意先」が Sold-to Party に対応するなど）、直訳ではありません。本表をそのまま使うか、日本側のコンサルタントと社内の慣用訳語を確認することをお勧めします。

- 涉及新产品名（Joule/AI Core 等）的日文译法可能随 SAP 官方本地化更新而变化，重要文档建议保留英文原名加中/日文注释，避免歧义。

  新しい製品名（Joule/AI Core など）に関する日本語訳は、SAP 公式のローカライズ更新に伴って変わる可能性があります。重要なドキュメントでは英語の原名を残し、中国語／日本語の注釈を併記することで、誤解を避けることをお勧めします。
