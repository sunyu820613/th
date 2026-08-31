# Part 19：SAP MM（物料管理）基础全解

前面 Part 3 只讲了 SD（销售），但一个真实的"AI + SAP"项目几乎不可能只涉及 SD——**物料主数据本身就归属 MM 模块**（Part 3 提到的 Material Master 只是从 SD 视角看到了"销售视图"，它还有 MM 视角的"采购视图/仓储视图/MRP 视图"等），而且很多企业的 AI 助手场景不止"创建销售订单"，还包括"创建采购订单""查询库存""创建收货"这类 MM 场景。本章补齐 MM 侧的核心知识。

## 19.1 SD 与 MM 的关系（先厘清，避免混淆）

| | SD（Sales & Distribution） | MM（Materials Management） |
|---|---|---|
| 业务方向 | 面向客户的"卖出去"（Order-to-Cash） | 面向供应商的"买进来"（Procure-to-Pay） |
| 核心凭证 | Sales Order → Delivery → Billing | Purchase Requisition → Purchase Order → Goods Receipt → Invoice Verification |
| 核心伙伴 | Customer（客户） | Vendor / Supplier（供应商） |
| 共享的主数据 | **Material（物料）**、Plant（工厂）——两个模块共用同一个物料主数据对象，只是各自维护不同的"视图"（Views） | 同左 |
| 与本教程主案例的关系 | 创建销售订单本身属于 SD | 但订单创建过程中查询的"库存是否够"、ATP 检查，背后依赖的是 **MM 的库存管理（Inventory Management）** 数据；而"物料是否存在""物料基本信息"这类查询，物料主数据的维护归属也横跨 MM/SD 两个模块的视图 |

一句话理解："物料"这个主数据对象是 MM 模块"生的"，SD/MM/PP（生产）等模块各自在它身上挂了自己需要的字段视图；而**库存数量的实时变化**（增加/减少）是 MM 的 Inventory Management 子模块管理的，这也是为什么 Part 3 提到的 ATP 检查，其数据源头实际上来自 MM。

## 19.2 MM 核心概念表

| # | 中文 | SAP 英文 | 作用 | AI 项目为什么要知道 | 举例 |
|---|---|---|---|---|---|
| 1 | 物料主数据 | Material Master | 描述一个物料的所有属性（基本信息、采购、销售、财务、库存、MRP 等多视图） | 无论创建销售订单还是采购订单，都要先确认物料存在且对应视图数据齐全（如物料没有维护"采购视图"就无法创建采购订单） | M-100 |
| 2 | 物料类型 | Material Type | 决定物料的业务属性和可用视图集合（原材料/成品/贸易货物等） | 影响后续能做哪些业务动作，AI 补全参数时可能需要据此判断某些字段是否适用 | ROH=原材料, FERT=产成品, HAWA=贸易货物 |
| 3 | 供应商 | Vendor / Supplier | MM 场景的"客户对应角色"，采购的交易对方 | 采购订单的核心伙伴，同样需要模糊搜索+确认，不能让 AI 猜编号 | 供应商 0020001111 |
| 4 | 采购申请 | Purchase Requisition (PR) | 内部提出的"需要采购"的申请，尚未对外承诺 | 类似 SD 的 Inquiry/Quotation 阶段，是采购订单的前置（可选）步骤 | PR 号 10000123 |
| 5 | 采购订单 | Purchase Order (PO) | 正式向供应商下达的采购订单，对外有约束力 | 本章的"MM 版主案例"目标对象 | PO 号 4500012345 |
| 6 | 采购组织 | Purchasing Organization | 负责采购活动的组织单位，类似 SD 里的 Sales Organization | 决定采购订单归属和定价/供应商关系范围 | 1000 |
| 7 | 采购组 | Purchasing Group | 具体负责某类采购的人员/团队分组 | 影响审批路由 | 001 |
| 8 | 工厂 | Plant | 收货/入库的物理单位，与 SD 共用同一概念 | 采购订单需要指定交货到哪个工厂 | 1000 |
| 9 | 收货 | Goods Receipt (GR) | 供应商发货后，企业在系统里确认"货到了"，触发库存增加 | 理解采购订单之后的流程，AI 若扩展"确认收货"场景需要 | 物料凭证 5000000123 |
| 10 | 发票校验 | Invoice Verification (IV/MIRO) | 核对供应商发票与采购订单/收货的三方匹配（PO-GR-Invoice 三单匹配） | 理解 P2P 全链路，涉及财务付款环节 | 发票凭证 5100000456 |
| 11 | 库存管理 | Inventory Management (IM) | 管理物料的实时库存数量、移动类型（入库/出库/转储等） | ATP 检查的数据来源，AI 查询"库存是否够"本质是查这里 | 现有库存 80 EA |
| 12 | 移动类型 | Movement Type | 定义每一次库存变动的业务含义（101=收货入库，261=生产领料等） | 如果 AI 场景涉及"记录库存移动"，需要理解这是一个关键分类字段 | 101 |
| 13 | 物料需求计划 | Material Requirements Planning (MRP) | 根据需求和库存自动计算需要采购/生产多少物料、什么时候 | 高级场景：AI 若要回答"这个物料什么时候会到货""需不需要补货"，背后是 MRP 的运行结果 | MRP 建议采购 500 EA |
| 14 | 定价条件（采购侧） | Condition (Purchasing) | 采购订单的价格计算规则（合同价/报价单价等） | 与 SD Pricing 类似的机制，但条件类型和业务含义不同 | PB00=标准采购价 |
| 15 | 长期协议 | Outline Agreement（合同 Contract / 计划协议 Scheduling Agreement） | 与供应商的长期采购约定，采购订单可引用它 | 如果企业主要通过合同下单，AI 需要知道"是否有有效合同覆盖这个物料/供应商" | 合同号 4600000789 |

## 19.3 Procure-to-Pay（P2P）全流程

```mermaid
flowchart LR
    PR[Purchase Requisition<br/>采购申请] --> PO[Purchase Order<br/>采购订单 ← MM版主案例]
    PO --> GR[Goods Receipt<br/>收货]
    GR --> IV[Invoice Verification<br/>发票校验]
    IV --> ACC[Accounting<br/>应付账款/付款]
```

与 SD 的 O2C（Part 3.2）对称：**PR 类似 Inquiry/Quotation 阶段（意向阶段），PO 类似 Sales Order（正式承诺），GR 类似 Delivery（物流动作，只是方向相反——一个是发货出库，一个是收货入库），IV 类似 Billing（单据核对触发财务记账）。**

理解这种对称性，能帮你更快把 SD 里学到的架构模式（写操作前置校验、确认、幂等、审计）直接迁移到 MM 场景，不需要重新学一套设计思路——**协议、字段、业务规则不同，但"AI+SAP"这套架构分层原则是通用的（回顾 Part 1）。**

## 19.4 事务代码速查（MM 版的 VA01/02/03）

| 事务代码 | 名称 | 对应 SD 的 |
|---|---|---|
| ME21N | Create Purchase Order | 对应 VA01（创建） |
| ME22N | Change Purchase Order | 对应 VA02（修改） |
| ME23N | Display Purchase Order | 对应 VA03（查看） |
| MM01 | Create Material Master | 物料主数据创建 |
| MM02 | Change Material Master | 物料主数据修改 |
| MM03 | Display Material Master | 物料主数据查看 |
| MIGO | Goods Movement (收发货过账) | 对应 SD 侧的 VL02N（交货过账/PGI），但方向相反 |
| MIRO | Invoice Verification | 对应 SD 侧的开票（VF01），但是从"付款"视角而非"收款"视角 |
| ME01/ME03 等 | 货源清单/供应商目录相关 | （历史 T-code，不同版本有调整，⚠️需按系统版本核实） |

同 Part 4 的结论：**这些 T-code 的屏幕结构直接对应 API 的数据模型（Header/Item/Schedule Line 等），是与 MM 顾问沟通的共同语言，也是理解 API 字段该填什么的捷径。**

## 19.5 与 AI 项目相关的关键澄清

1. **"查库存"不是 SD 的能力，是 MM 的能力**：AI 助手里常见的 `check_inventory` Tool，其后端调用的其实是 MM 的库存查询 API（如 `API_MATERIAL_STOCK_SRV`，⚠️需核实具体服务名和版本），只是这个能力经常在"创建销售订单"的场景里被间接用到（ATP 检查）。如果你的项目只做 Part 1-18 描述的 SD 场景，也已经在"顺带"接触 MM 的库存数据了，只是没有专门管理这个模块的知识边界。
2. **采购场景引入了新的角色和风险模型**：Vendor 主数据的敏感度不亚于 Customer（涉及付款账户信息等），`create_purchase_order` 这类 WRITE Tool 同样需要 Part 9 描述的八件套（RBAC/Confirmation/Approval/Audit/Idempotency/RateLimit/Validation/RiskControl），而且采购订单直接关联企业资金流出，审批阈值和风控通常比销售订单更严格。
3. **MRP 相关的"智能建议"类查询要小心边界**：如果 AI 助手要回答"我们需要采购多少 M-100"，这类问题的答案来自 MRP 运行结果（一个复杂的计算过程，涉及多个提前期、安全库存策略等参数），**AI 只能读取和转述 MRP 的既有结果，绝不能自己"估算"一个采购建议数量**——这与 Part 1.6 强调的"Credit Check/ATP/Pricing 必须由 SAP 权威计算"是同一条原则在 MM 场景的延伸。

## 19.6 项目中你需要记住什么

- SD 和 MM 共享 Material 主数据，但各自维护不同视图；库存数据（ATP 的数据源）属于 MM 的 Inventory Management，不是 SD 自己算的。
- P2P（Procure-to-Pay）与 O2C（Order-to-Cash）在业务角色上对称（PR↔Inquiry/Quotation, PO↔Sales Order, GR↔Delivery, IV↔Billing），可以复用同一套架构设计思路。
- ME21N/ME22N/ME23N 是 MM 的"VA01/02/03"，MM01/02/03 是物料主数据的维护事务。
- 采购类 WRITE Tool（`create_purchase_order`）风险模型不亚于甚至可能高于销售订单（涉及资金流出），必须同样落实八件套安全设计。
- MRP 结果只能被 AI 转述，不能被 AI"重新计算"或"估算"，这是权威计算归属原则在 MM 场景的具体体现。
