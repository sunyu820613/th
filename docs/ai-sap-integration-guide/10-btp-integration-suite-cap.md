# Part 10：SAP BTP 全景 + Integration Suite + CAP 教程

## 10.1 SAP BTP 基础概念

| 概念 | 说明 |
|---|---|
| SAP BTP (Business Technology Platform) | SAP 的统一云平台，承载集成、扩展、数据分析、AI 等能力，是"AI+SAP"项目里除 S/4HANA 本身之外最重要的技术底座 |
| Global Account | BTP 租户的最顶层账户，对应企业与 SAP 的商务合同关系 |
| Subaccount | Global Account 下的子账户，通常按环境（开发/测试/生产）或业务单元划分，实际的服务实例、应用部署都在 Subaccount 层级 |
| Space（Cloud Foundry） | Cloud Foundry 环境下 Subaccount 内的进一步隔离单元，应用和服务实例部署在 Space 里 |
| Cloud Foundry | BTP 上的一种运行时环境（PaaS），支持多语言（Node.js/Java/Python等）应用部署 |
| Kyma | BTP 上基于 Kubernetes 的运行时环境，适合容器化、微服务架构、需要更细粒度基础设施控制的场景 |

## 10.2 与本项目相关的 BTP 服务/产品，各自负责哪一层

| 服务/产品 | 一句话 | 在本项目里可能负责哪一层 |
|---|---|---|
| Destination Service | 统一管理目标系统的连接信息（URL/认证方式），见 Part 5.7 | SAP Integration Layer：解耦连接配置 |
| Connectivity Service | 提供到 On-Premise 系统的安全连接通道（配合 Cloud Connector），支持 Principal Propagation | SAP Integration Layer：网络与身份透传 |
| SAP Integration Suite | 一站式集成平台，包含 Cloud Integration (CPI)、API Management、Integration Advisor 等能力 | SAP Integration Layer：协议转换、路由、编排、监控 |
| Cloud Integration (CPI) | Integration Suite 里的集成流程引擎，用可视化 iFlow 编排消息路由/转换/协议适配 | 具体承担"AI Backend 输出 JSON → SAP 所需结构"的转换与编排 |
| SAP API Management | API 网关能力，负责限流、鉴权代理、API 生命周期管理、开发者门户 | Tool Layer 与 SAP 之间的网关/限流/鉴权代理，也可作为对外暴露 API 的门面 |
| SAP Build Process Automation | 低代码的流程自动化和审批工作流工具 | Approval / Confirmation 层：实现审批流程编排 |
| SAP AI Core | 托管 AI/ML 模型训练与推理的基础设施服务 | 如果企业需要自己训练/托管专用模型（而非直接调用第三方 LLM API），归属这一层；对多数"调用现成 LLM API 做 Tool Calling"的项目不是必需 |
| Generative AI Hub（AI Core 的一部分能力） | 提供统一接口调用多种大模型（含第三方模型），并附带企业级治理（审计、内容过滤等）能力 | 可以作为 LLM 调用的统一入口/网关层，尤其当企业要求所有 LLM 调用经过统一治理时 |
| Joule | SAP 官方的生成式 AI 助手产品，内嵌在 SAP 应用（如 S/4HANA、SuccessFactors）中提供对话式体验 | ⚠️ 如果企业已采购并启用 Joule，本项目描述的"自建 Chat+Agent"能力，部分可能与 Joule 的能力重叠或可以通过 Joule 的扩展机制实现，需要在项目立项时明确"自建 Agent" vs "基于 Joule 扩展"的选型 |
| Joule Studio | ⚠️ SAP 用于配置/扩展 Joule 能力（如自定义 Skill）的工具（具体功能边界和产品成熟度需按当前版本核实） | 如果选择"基于 Joule 扩展"路线，Tool/Skill 的定义和编排可能在这里完成，而不是自建 Agent Backend |
| CAP (Cloud Application Programming Model) | SAP 官方推荐的应用开发框架（Node.js/Java），内置对 OData、SAP 系统集成、鉴权的最佳实践支持 | Business Service 层：用来实现 Tool 背后真正的业务逻辑代码 |
| SAP Build Code | ⚠️ SAP 面向 CAP/Fiori 开发的云端 IDE 和 AI 辅助编码工具（具体能力边界需按当前版本核实） | 开发工具层，不直接参与运行时架构 |

**重要提醒**：Joule、Joule Studio、Generative AI Hub、AI Core 这几项是 SAP 生成式 AI 产品线里变化最快的部分（2024-2026 期间持续快速迭代），本节只给出"架构定位"层面的认知（"它大概负责哪一层"），具体的功能边界、是否需要额外许可证、当前 UI 操作方式，**必须在项目启动时查阅 SAP 官方最新文档核实**，不要以本教程的描述作为实施依据。

## 10.3 Integration Suite / CPI 详解

### 10.3.1 能力清单

| 能力 | 说明 |
|---|---|
| Routing | 根据消息内容/头信息，把请求路由到不同的目标系统或不同的处理分支 |
| Mapping | 字段级映射（如把 `customer` 映射到 SAP 的 `SoldToParty`） |
| Transformation | 更复杂的数据结构转换（如把扁平 JSON 转成 OData Deep Insert 需要的嵌套结构） |
| Authentication | 集中管理到目标系统的认证方式（可配合 BTP Destination/Credential Store） |
| Error Handling | 定义异常分支（比如目标系统返回 4xx/5xx 时的处理逻辑：重试、告警、写入死信队列） |
| Retry | 对瞬时性故障（网络抖动、目标系统短暂不可用）做自动重试，需配合幂等设计 |
| Monitoring | 提供消息处理的可视化监控、消息追踪、告警 |
| API Integration | 把内部流程封装成标准 REST/OData 接口对外暴露，供 AI Backend 调用 |

### 10.3.2 一个具体例子

AI Backend 输入（业务语义层）：

```json
{
  "customer": "ABC",
  "customerId": "0010001234",
  "material": "M100",
  "qty": 100,
  "unit": "EA",
  "deliveryDate": "2026-09-11"
}
```

在 Integration Suite 的 iFlow 中做映射转换后，变成 SAP OData 所需的结构（示意，⚠️字段名需以实际 metadata 为准）：

```json
{
  "SalesOrderType": "OR",
  "SalesOrganization": "1000",
  "DistributionChannel": "10",
  "OrganizationDivision": "00",
  "SoldToParty": "0010001234",
  "RequestedDeliveryDate": "/Date(1789084800000)/",
  "to_Item": [
    { "Material": "M100", "RequestedQuantity": "100", "RequestedQuantityUnit": "EA" }
  ]
}
```

iFlow 在这个过程里做的事：字段名映射（`customerId`→`SoldToParty`）、日期格式转换（ISO 字符串→OData `/Date()/`）、补充固定/推导值（`SalesOrderType`/`SalesOrganization` 这些如果是租户级固定配置，也可以在这一层通过查表补充）、加上认证头、发送请求、处理响应/错误并回传。

### 10.3.3 Mapping 应该放在哪一层：Integration Suite？Backend？SAP？

| Mapping 类型 | 建议归属 | 原因 |
|---|---|---|
| 业务语义解析（"ABC"→客户编号，"下周五"→日期） | **Backend / LLM 协作层** | 需要模糊匹配、对话交互、追问逻辑，Integration Suite 不擅长这类"智能"处理 |
| 业务规则前置校验（数量合法性、日期合法性） | **Backend** | 属于应用逻辑，且往往需要结合多个数据源做判断，放在应用代码里更灵活、更易测试 |
| 协议级字段映射与格式转换（日期格式、Deep Insert 结构拼装） | **Integration Suite（如果架构中有这一层）** | 这是 CPI 的核心能力，用可视化 iFlow 维护，非开发人员（集成顾问）也能调整，且天然带监控/重试/错误处理 |
| Sales Area 组合校验、Credit Check、ATP、Pricing | **SAP 自身** | 权威业务规则，任何中间层都不应重新实现 |

**架构选择提示**：不是所有项目都需要引入 Integration Suite/CPI 这一层——如果集成场景简单（点对点、单一 SAP 系统、无需复杂路由/多系统编排），Backend 直接通过 Destination Service 调用 SAP OData 也是完全合理的选择，能省掉一层运维和学习成本。**Integration Suite 更适合"多系统集成、需要专职集成团队维护、需要非开发人员可配置"的场景**。

## 10.4 CAP (Cloud Application Programming Model) 教程

### 10.4.1 CAP 是什么

CAP 是 SAP 官方推荐的应用开发框架，核心思想是"领域驱动 + 声明式"：你用 CDS（Core Data Services）语言定义数据模型和服务，框架自动生成 OData/REST 端点、处理 SAP 系统集成的样板代码（认证、Destination 解析、协议转换），你只需要写业务逻辑（Handler）。支持 Node.js 和 Java 两种运行时，本教程用 Node.js。

### 10.4.2 核心概念

| 概念 | 说明 |
|---|---|
| `cds` | CAP 的核心工具/运行时命令（CDS = Core Data Services），`cds watch` 本地起服务、`cds deploy` 部署等 |
| service | 用 CDS 语言定义的一组对外暴露的操作（Entity 的 CRUD + 自定义 Action/Function） |
| entity | 数据模型定义，类似数据库表结构，也可以是"虚拟实体"（不落库，仅作为 API 契约） |
| action | 自定义的、有副作用的操作（对应我们的 `createSalesOrder`） |
| handler | 用 JS/TS 写的实际业务逻辑，绑定到某个 entity 的 CRUD 事件或某个 action 上 |
| destination | CAP 通过 `cds.connect.to()` 结合 `cds.requires` 配置，自动读取 BTP Destination 完成到远程系统（SAP）的连接 |
| remote service | CAP 对"外部系统的 OData 服务"的抽象，可以直接把 SAP 的 OData 服务导入为 CAP 里的一个 remote service，像调用本地服务一样调用远程 SAP |
| credentials | 敏感连接信息，本地开发用 `.env`/`default-env.json`（不进版本库），云端部署用 BTP Destination + Credential Store，不应硬编码 |
| deployment | 通常打包为 MTA (Multi-Target Application)，部署到 Cloud Foundry 或 Kyma |

### 10.4.3 简化项目目录结构

```
ai-sap-sales-order-srv/
├── app/                      # 前端/Fiori UI（本项目可选，Chat UI 通常独立部署）
├── srv/                      # 服务层：CDS 服务定义 + Handler 实现
│   ├── sales-order-service.cds
│   ├── sales-order-service.js
│   └── external/
│       └── API_SALES_ORDER_SRV.edmx   # 从 SAP 导入的远程服务定义
├── db/                       # 数据模型（本项目主要是"透传型"服务，db 可能很薄，甚至只放本地缓存/日志表）
│   └── schema.cds
├── package.json
├── .cdsrc.json / cds.requires 配置（也可能写在 package.json 的 cds 字段里）
└── mta.yaml                  # 部署描述（可选，视部署方式而定）
```

### 10.4.4 `cds.requires` 配置示例（`package.json` 片段）

```json
{
  "cds": {
    "requires": {
      "S4_SALES_ORDER_API": {
        "kind": "odata-v2",
        "model": "srv/external/API_SALES_ORDER_SRV",
        "credentials": {
          "destination": "S4HANA_SALES_ORDER_API"
        }
      }
    }
  }
}
```

这里的 `destination` 名字对应 BTP Destination Service 里配置好的目标（Part 5.7），本地开发时可以用 `default-env.json` 模拟这个 Destination 的连接信息，部署到云端后由平台自动注入真实凭据——**代码本身完全不感知实际的 URL/密码**。

### 10.4.5 CDS 服务定义：`sales-order-service.cds`

```cds
using { API_SALES_ORDER_SRV as external } from './external/API_SALES_ORDER_SRV';

service SalesOrderService {

  // 只读：给 AI Tool 层调用的查询接口
  entity Customers as projection on external.A_BusinessPartner {
    key BusinessPartner as id,
    BusinessPartnerFullName as name
  };

  // 自定义 action：对应 create_sales_order 这个 Tool
  action createSalesOrder(
    customerId          : String,
    materialId           : String,
    quantity              : Decimal,
    unit                  : String,
    requestedDeliveryDate : Date,
    idempotencyKey         : String
  ) returns {
    success        : Boolean;
    salesOrder     : String;
    errorCode      : String;
    errorMessage   : String;
  };
}
```

### 10.4.6 Handler 实现：`sales-order-service.js`

```javascript
const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { createSalesOrder } = this.actions;

  // 简化的幂等存储，生产环境应使用持久化存储（如 Redis/数据库表）
  const idempotencyStore = new Map();

  this.on(createSalesOrder, async (req) => {
    const { customerId, materialId, quantity, unit, requestedDeliveryDate, idempotencyKey } = req.data;

    // 1. 幂等检查：同一 key 的重复调用直接返回上次结果，不重复创建
    if (idempotencyStore.has(idempotencyKey)) {
      return idempotencyStore.get(idempotencyKey);
    }

    // 2. 前置业务校验（示例，实际项目应更完善）
    if (!(quantity > 0)) {
      return req.error(400, 'QUANTITY_INVALID', 'quantity 必须大于 0');
    }
    if (new Date(requestedDeliveryDate) < new Date()) {
      return req.error(400, 'DELIVERY_DATE_IN_PAST', '交货日期不能是过去时间');
    }

    // 3. 连接远程 S/4HANA Sales Order 服务（凭据由 destination 自动解析，代码不感知）
    const s4 = await cds.connect.to('S4_SALES_ORDER_API');

    try {
      const result = await s4.send({
        method: 'POST',
        path: '/A_SalesOrder',
        data: {
          SalesOrderType: 'OR',
          SalesOrganization: '1000',      // ⚠️ 真实项目中应从客户主数据/租户配置推导，而非写死
          DistributionChannel: '10',
          OrganizationDivision: '00',
          SoldToParty: customerId,
          RequestedDeliveryDate: requestedDeliveryDate,
          to_Item: [
            {
              Material: materialId,
              RequestedQuantity: String(quantity),
              RequestedQuantityUnit: unit || 'EA',
            },
          ],
        },
      });

      const response = {
        success: true,
        salesOrder: result.SalesOrder,
        errorCode: null,
        errorMessage: null,
      };
      idempotencyStore.set(idempotencyKey, response);
      return response;

    } catch (err) {
      // 区分业务错误 vs 系统错误，供上层决定是否可重试、如何转述给用户
      const response = {
        success: false,
        salesOrder: null,
        errorCode: err.code || 'SAP_UNKNOWN_ERROR',
        errorMessage: err.message,
      };
      // 注意：系统性错误（超时/5xx）不应写入幂等缓存为"最终失败"，
      // 应该走单独的"状态不确定，需要核实"分支（见 Part 13 幂等性设计）
      if (!isTransientError(err)) {
        idempotencyStore.set(idempotencyKey, response);
      }
      return response;
    }
  });
});

function isTransientError(err) {
  return err.code === 'ETIMEDOUT' || (err.status && err.status >= 500);
}
```

### 10.4.7 要点说明

- CAP 的 `cds.connect.to('S4_SALES_ORDER_API')` 会自动：读取 `cds.requires` 配置 → 解析对应的 BTP Destination → 处理认证（Basic/OAuth2/Principal Propagation，取决于 Destination 配置）→ 返回一个可直接调用的 remote service 客户端。这就是 CAP 相比"自己手写 HTTP Client + Token 管理"的最大价值：**大量样板代码被框架吸收，业务代码只关注业务逻辑**。
- 上面的代码是"接近真实项目结构"的教学示例，生产代码还需要补充：完整的输入 Schema 校验（用 CDS 的 `@assert` 注解或独立校验库）、结构化日志、RBAC 检查（CAP 有内置的 `@requires`/`@restrict` 注解机制做授权）、更完善的幂等存储（用持久化存储而非内存 Map）。

## 10.5 项目中你需要记住什么

- BTP 是一个"能力集合"，不是单一产品；本项目最常用到的是 Destination/Connectivity（连接层）、Integration Suite/CPI（如果需要复杂集成编排）、CAP（写 Business Service 层代码）。
- Joule/AI Core/Generative AI Hub 这类生成式 AI 产品线变化快，只建立架构定位认知，具体细节按需在项目启动时核实最新文档。
- Integration Suite 不是必需品，简单集成场景 Backend 直接连 SAP OData 也完全合理，团队规模和集成复杂度决定是否引入。
- CAP 的核心价值是把"连接 SAP、认证、协议细节"的样板代码框架化，让你专注业务逻辑；`cds.requires` + Destination 的组合，是"不硬编码连接信息"这条原则在 CAP 里的具体落地方式。
