# Part 17：学习路线

## 17.1 三个能力层级

### Level 1：项目不懵（进入项目能听懂、能跟上讨论）

必须掌握：
- SAP SD 核心概念（Part 3 全部）：Sales Order/Sales Area/BP 四种角色/Material/Pricing 基础
- VA01/VA02/VA03 的屏幕结构和它们与数据模型的对应关系（Part 4）
- OData 基础概念（Entity/Metadata/CRUD/CSRF）（Part 5.3）
- LLM Tool Calling 的基本工作原理（Part 7.1-7.2）
- 整体架构分层（Part 1），能说清楚"LLM 负责什么、SAP 负责什么、中间层负责什么"

### Level 2：能独立开发（能写 Tool、能接 SAP API、能处理错误）

在 Level 1 基础上增加：
- OData 写操作完整流程（CSRF Token、Deep Insert、错误响应解析）（Part 5）
- Destination/Connectivity 的配置和使用（Part 5.7）
- CAP 框架实操（能写 service/entity/action/handler）（Part 10.4）
- Tool Abstraction Layer 设计（Part 7.4、Part 6.5）
- 幂等性设计与错误分类处理（Part 13）
- 基础的鉴权知识（OAuth2 Client Credentials 至少要会用）（Part 9.4）
- 能独立完成 Part 11 的 Demo 项目并替换为真实 SAP Sandbox

### Level 3：能设计架构（能做技术选型、能评估安全和合规风险）

在 Level 2 基础上增加：
- ECC/On-Prem/Private Cloud/Public Cloud 的集成差异及选型判断（Part 6）
- Principal Propagation 的实现原理和适用场景判断（Part 9.5）
- Integration Suite/CPI 的编排能力，判断何时需要引入这一层（Part 10.3）
- 安全设计全貌：Prompt Injection 防护、最小权限、密钥管理（Part 14）
- 生产参考架构与 Trust Boundary 设计（Part 16）
- 能主导审批流程、审计体系的设计决策（Part 9.3、Part 15）

## 17.2 推荐学习顺序（六周计划，可按实际情况调整）

| 周次 | 主题 | 对应章节 | 产出 |
|---|---|---|---|
| 第一周 | SAP SD 基础 + Order-to-Cash + VA01/02/03 | Part 3、4 | 能用自己的话解释一遍"创建销售订单要填哪些东西、为什么" |
| 第二周 | OData 基础 + SAP API Business Accelerator Hub 实操 | Part 5 | 用 Postman/curl 对着一个 SAP 沙箱（或公开的 SAP Gateway Demo 系统）跑通一次 GET 查询和一次 POST 创建（如果有沙箱访问权限） |
| 第三周 | SAP BTP 全景 + Destination/Connectivity | Part 5.7、Part 10.1-10.2 | 在 BTP 试用账号里配置一个 Destination（即使指向的是测试端点） |
| 第四周 | LLM Tool Calling + Agent 设计原则 | Part 7、8、9 | 设计并写出至少 3 个 Tool 的完整 JSON Schema，包括至少一个 READ 和一个 WRITE |
| 第五周 | CAP 实操 + Integration Suite 概念 | Part 10.3-10.4 | 用 CAP 写一个简化的 Business Service，能连接到（真实或 Mock 的）SAP OData |
| 第六周 | 完整 Demo + 错误处理 + 安全 + 审计 | Part 11-16 | 跑通 Part 11 的完整 Demo，覆盖至少 5 种错误场景的测试用例 |

## 17.3 学习建议

- **不要跳过 SAP SD 基础直接学 API**：很多开发者急于写代码，跳过业务概念，结果在处理 Sales Area/伙伴角色这类"看起来简单实际有隐藏规则"的字段时反复踩坑。花一周打好业务基础，后面的开发效率会显著提高。
- **优先动手，不要只看文档**：SAP API Business Accelerator Hub 的 Try-out 功能、CAP 的 `cds watch` 本地开发体验，都值得亲自跑一遍，比反复读文档更有效。
- **和 SAP 顾问建立共同语言**：学会用 VA01 的屏幕结构和 SD 术语跟顾问沟通，能大幅提升协作效率，减少"技术人员觉得顾问啰嗦、顾问觉得技术人员不懂业务"的沟通摩擦。

## 17.4 项目中你需要记住什么

- 三个 Level 是能力递进关系，不要跳级——尤其 Level 3 的架构决策能力，建立在对 Level 1/2 内容有扎实实操经验的基础上。
- 六周计划是参考节奏，如果你已经有 SAP 或 LLM 任一方向的基础，可以压缩对应周次，把时间集中在你的知识盲区。
