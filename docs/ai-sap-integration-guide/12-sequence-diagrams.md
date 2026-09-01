# Part 12：完整时序图（完全なシーケンス図）

## 12.1 端到端主流程（含参数补全、确认、创建、返回）（12.1 エンドツーエンドのメインフロー（パラメータ補完、確認、作成、返却を含む））

```mermaid
sequenceDiagram
    actor U as 用户
    participant UI as Chat UI
    participant LLM as LLM
    participant AB as Agent Backend
    participant CT as Customer Tool
    participant MT as Material Tool
    participant AP as Approval Service
    participant SI as SAP Integration Layer
    participant S4 as S/4HANA

    U->>UI: "给客户ABC创建销售订单，物料M-100，100个，下周五交货"
    UI->>AB: 用户消息 + correlationId
    AB->>LLM: System Prompt + 历史 + Tool定义 + 用户消息

    LLM-->>AB: Tool Call: search_customer(name="ABC")
    AB->>CT: 执行查询
    CT->>SI: GET Business Partner (只读)
    SI->>S4: OData $filter 查询
    S4-->>SI: 候选客户列表
    SI-->>CT: 候选客户列表
    CT-->>AB: [ABC Trading(0010001234), ABC Manufacturing(0010009876)]
    AB->>LLM: 喂回 Tool Result（存在歧义）

    LLM-->>AB: 自然语言："找到两个ABC，请问是哪一个？"
    AB-->>UI: 追问
    UI-->>U: 展示选项
    U->>UI: "第一个，ABC Trading"
    UI->>AB: 用户回复

    AB->>LLM: 喂回用户选择
    LLM-->>AB: Tool Call: search_material(query="M-100")
    AB->>MT: 执行查询
    MT->>SI: GET Material（只读）
    SI->>S4: OData 查询
    S4-->>SI: 物料信息（存在，可售，基本单位EA）
    SI-->>MT: 物料信息
    MT-->>AB: {materialId:"M-100", unit:"EA", salesBlocked:false}
    AB->>LLM: 喂回结果

    LLM-->>AB: Tool Call: simulate_sales_order(customerId, materialId, qty=100, date)
    AB->>SI: 调用 Sales Order 模拟接口（只读，见 Part 5.3.4）
    SI->>S4: 模拟计算（不落库）
    S4-->>SI: 价格/ATP/信用检查预览
    SI-->>AB: 结构化预览结果
    AB->>LLM: 喂回结果

    LLM-->>AB: Tool Call: stage_sales_order(customerId, materialId, qty=100, date)
    AB->>AB: Backend 生成确认记录（confirmationId + 后端持有的 idempotencyKey，状态=PENDING）
    AB-->>LLM: {confirmationId:"conf_abc", status:"PENDING"}
    LLM-->>AB: 自然语言：完整订单摘要（含真实预计金额），请求用户确认
    AB-->>UI: 展示确认卡片（携带 confirmationId）
    UI-->>U: 客户/物料/数量/日期/预计金额
    U->>UI: 点击"确认"
    UI->>AB: POST /confirmations/conf_abc/confirm（独立 REST 接口，不经过 LLM）
    AB->>AB: 校验发起人=当前用户 → 记录状态改为 CONFIRMED
    AB-->>UI: 确认成功

    AB->>LLM: 提示"该记录已确认"
    LLM-->>AB: Tool Call: create_sales_order(confirmationId="conf_abc")
    AB->>AB: 校验确认记录：存在/属于当前用户/状态=CONFIRMED/未过期/未执行过
    AB->>AP: 是否需要审批？（金额/规则判断）
    AP-->>AB: 未超阈值，无需人工审批，直接放行

    AB->>SI: POST 创建销售订单（写操作，携带后端持有的 idempotencyKey）
    SI->>S4: CSRF Token 获取 → OData Deep Insert POST
    S4-->>SI: 201 Created, SalesOrder=4710012345
    SI-->>AB: 结构化结果

    AB->>AB: 记录 Tool Execution Log（含 correlationId）
    AB->>LLM: 喂回 {success:true, salesOrder:"4710012345"}
    LLM-->>AB: "订单已创建成功，订单号 4710012345"
    AB-->>UI: 最终回复
    UI-->>U: 展示结果
```

## 12.2 审批分支（大额/高风险订单）（12.2 承認分岐（高額/高リスクなオーダー））

```mermaid
sequenceDiagram
    actor U as 用户
    participant AB as Agent Backend
    participant AP as Approval Service
    actor MGR as 审批人（经理）
    participant SI as SAP Integration Layer

    AB->>AP: 提交待审批请求（订单摘要+风险评分）
    AP-->>AB: 状态=PENDING_APPROVAL
    AB-->>U: "该订单金额较大，已提交主管审批，请稍候"
    AP->>MGR: 推送审批通知
    MGR->>AP: 批准
    AP-->>AB: 状态=APPROVED（Webhook/轮询通知）
    AB->>SI: 执行创建（携带原 idempotencyKey）
    SI-->>AB: 创建成功
    AB-->>U: 通知用户："审批通过，订单已创建，订单号 XXX"
```

## 12.3 超时/状态不确定分支（12.3 タイムアウト/状態不確定の分岐）

```mermaid
sequenceDiagram
    actor U as 用户
    participant AB as Agent Backend
    participant SI as SAP Integration Layer
    participant S4 as S/4HANA

    AB->>SI: POST 创建订单（idempotencyKey=K1）
    SI->>S4: OData POST
    Note over SI,S4: 网络超时，未收到响应<br/>SAP 端可能已经创建成功
    SI-->>AB: 超时错误
    AB->>AB: 标记 idempotencyKey=K1 状态为 UNKNOWN
    AB-->>U: "系统响应超时，正在核实订单状态，请稍候"
    AB->>SI: 用业务关键字段查询（如按客户+物料+时间窗口查最近订单）
    SI->>S4: GET 查询
    S4-->>SI: 找到匹配订单 4710012399（确认已创建）
    SI-->>AB: 查询结果
    AB->>AB: 更新 idempotencyKey=K1 状态为 COMPLETED
    AB-->>U: "已确认订单创建成功，订单号 4710012399，抱歉刚才响应较慢"
```

## 12.4 项目中你需要记住什么（12.4 プロジェクトで覚えておくべきこと）

- 时序图要体现"歧义必须追问"（第一张图里的 search_customer 返回多个候选）而不是省略这一步。<br>シーケンス図は「曖昧な場合は必ず追加質問する」ことを表現しなければならず（最初の図の search_customer が複数の候補を返す部分）、このステップを省略してはいけません。
- 审批分支是一个独立的异步等待状态，Agent Backend 需要有机制在审批完成后"回来"继续执行（Webhook 回调或轮询），而不是让用户的对话 Session 一直同步阻塞等待。<br>承認分岐は独立した非同期の待機状態であり、Agent Backend には承認完了後に「戻ってきて」処理を継続する仕組み（Webhook コールバックまたはポーリング）が必要であり、ユーザーの対話セッションをずっと同期的にブロックして待たせてはいけません。
- 超时分支的核心不是"重试"，而是"用另一种方式核实真实状态"，这是幂等设计里最容易被忽视但最重要的一环（详见 Part 13）。<br>タイムアウト分岐の核心は「リトライ」ではなく「別の方法で実際の状態を確認する」ことであり、これは冪等設計において最も見落とされがちでありながら最も重要な部分です（詳細は Part 13 参照）。
