# Part 15：Observability / Audit

## 15.1 必须记录什么

### AI 层

| 字段 | 说明 |
|---|---|
| User Prompt | 用户原始输入（脱敏后存储，或分级访问控制） |
| Parsed Intent | 模型识别出的意图和抽取的实体（NLU 结果） |
| Tool Call | 模型决定调用的工具名称 |
| Tool Arguments | 传给工具的具体参数 |
| Tool Result | 工具返回的结果（成功数据或错误信息） |
| Model/Prompt Version | 使用的模型版本号、System Prompt 版本（用于问题回溯——"这个错误是不是因为我们上周改了 Prompt"） |

### Backend 层

| 字段 | 说明 |
|---|---|
| Request ID | 单次 HTTP 请求的唯一标识 |
| User ID | 发起请求的最终用户身份 |
| Correlation ID | 贯穿整条调用链（从用户消息到 SAP 响应）的唯一标识，见下文 |
| Validation Result | 前置校验的通过/拒绝结果及原因 |
| Approval Result | 审批流程的状态和审批人（如果触发了审批） |
| Idempotency Key & State | 幂等键及其状态变化 |

### SAP 层

| 字段 | 说明 |
|---|---|
| SAP User | 实际执行操作的 SAP 身份（技术账号或透传的终端用户） |
| Document Number | 创建/修改的凭证号（如 Sales Order Number） |
| Timestamp | SAP 侧记录的操作时间戳 |
| Change Log | SAP 系统自身的变更日志（如 CDHDR/CDPOS，⚠️ 具体机制随版本而异），用于与你自己系统的日志交叉核对 |

## 15.2 为什么需要端到端 Correlation ID

```mermaid
flowchart LR
    A[用户消息] -->|correlationId=abc123| B[LLM 调用]
    B -->|correlationId=abc123| C[Tool 执行]
    C -->|correlationId=abc123| D[Business Service]
    D -->|correlationId=abc123| E[SAP Integration Layer]
    E -->|correlationId=abc123| F[SAP API 调用]
    F -->|correlationId=abc123 附加到自定义头/日志关联字段| G[SAP 侧日志]
```

- **排障效率**：没有统一 ID，出问题时你需要在 LLM 日志、Backend 日志、Integration 日志、SAP 日志之间凭时间戳和业务参数"猜测"哪几条记录属于同一次请求，效率极低且容易猜错（尤其高并发场景下多个相似请求交织在一起）。
- **审计完整性**：合规审计经常要求"证明某个业务结果的完整因果链"（用户说了什么 → 模型做了什么决定 → 系统做了什么校验 → SAP 最终记录了什么），Correlation ID 是把这条链串起来的唯一可靠手段。
- **实现方式**：在用户消息进入系统的最早时刻生成（如 HTTP 网关层），通过日志上下文（如 Node.js 的 AsyncLocalStorage 或显式参数传递）贯穿到每一层，并尽可能作为自定义 HTTP Header（如 `X-Correlation-Id`）传递到 SAP 侧（如果 SAP/Integration Suite 支持记录自定义关联字段）。

## 15.3 日志设计原则

1. **结构化日志**（JSON 格式，而非自由文本拼接），便于查询和聚合分析。
2. **分级**：INFO 记录正常业务流转，WARN 记录已被处理的异常（如校验失败），ERROR 记录未被完善处理的系统性问题。
3. **敏感字段脱敏**：客户姓名/联系方式/金额等按需掩码或分级访问。
4. **不要日志静默失败**：如果一个 catch 块吞掉了异常没有记录，未来排障会异常困难——这是实践中最常见、也最容易被忽视的问题。
5. **监控告警**：对关键指标设置告警阈值，比如：
   - SAP API 错误率突增
   - 幂等冲突/重复提交次数异常
   - Approval 队列积压
   - LLM Tool Call 失败率异常（可能意味着 Prompt/Schema 出了问题）

## 15.4 项目中你需要记住什么

- 三层（AI/Backend/SAP）各自记录该记录的内容，缺一不可，尤其 Tool Arguments 和 Tool Result 是排查"AI 到底做了什么"的第一手证据。
- Correlation ID 从最早的入口生成，贯穿全链路，是审计和排障的生命线。
- 日志要结构化、分级、脱敏，且绝不允许"吞异常不记录"。
