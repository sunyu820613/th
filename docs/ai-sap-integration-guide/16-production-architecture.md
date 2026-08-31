# Part 16：生产参考架构

## 16.1 架构图

```mermaid
flowchart TB
    subgraph TB1["Trust Boundary 1: 用户设备 / 公网"]
        U[用户] --> FE[Frontend / Chat UI]
    end

    subgraph TB2["Trust Boundary 2: 企业边缘 / API Gateway"]
        FE --> GW[API Gateway<br/>限流/WAF/TLS终止]
        GW --> AUTH[Authentication<br/>IAS / 企业 IdP]
    end

    subgraph TB3["Trust Boundary 3: AI/应用后端（可在 BTP 或其他云）"]
        AUTH --> AGT[AI Agent Service]
        AGT --> LLMSVC[LLM<br/>直连供应商 或 经由 Generative AI Hub]
        AGT --> TR[Tool Registry]
        TR --> BSVC[Business Service<br/>CAP / 自建]
        BSVC --> APR[Approval Workflow]
        BSVC --> AUD[(Audit Log Store)]
        BSVC --> MON[Monitoring / Alerting]
        BSVC --> SEC[(Secrets Manager /<br/>BTP Destination+Credential Store)]
    end

    subgraph TB4["Trust Boundary 4: SAP 集成层（BTP）"]
        BSVC --> ISU[Integration Suite / Destination+Connectivity]
    end

    subgraph TB5["Trust Boundary 5: SAP 系统内部"]
        ISU --> S4[S/4HANA]
    end
```

## 16.2 各组件归属：SAP BTP vs 其他云（AWS/Azure/GCP）/ On-Prem

| 组件 | 可在 SAP BTP | 可在 AWS/Azure/GCP/On-Prem | 说明 |
|---|---|---|---|
| Frontend / Chat UI | ✅（Fiori/Launchpad/BTP 静态托管） | ✅（更常见，前端部署几乎不限平台） | 无强依赖，看团队技术栈偏好 |
| API Gateway | ✅（SAP API Management） | ✅（云厂商网关/自建 Kong/Nginx） | 两者皆可，若已有企业统一网关标准应复用 |
| Authentication (IdP) | ✅（SAP Cloud Identity Services / IAS） | ✅（Azure AD/Okta 等，可与 IAS 联合信任） | 企业通常已有统一身份提供商，IAS 常作为信任链的一环而非唯一 IdP |
| AI Agent Service / Business Service | ✅（CAP on Cloud Foundry/Kyma） | ✅（任意云的容器/Serverless） | 如果需要 Principal Propagation 到 SAP，放在 BTP 上通常集成更顺畅（Destination/Connectivity 是 BTP 原生能力），放在其他云则需要额外打通网络和信任链 |
| LLM 调用 | ✅（Generative AI Hub，⚠️需核实覆盖的模型范围与治理能力） | ✅（直连各 LLM 厂商 API） | 企业若要求统一的 AI 治理（审计/内容过滤/成本管控），Generative AI Hub 类网关是合理选择；否则直连也是常见做法 |
| Tool Registry | ✅或✅ | ✅或✅ | 通常与 Business Service 同层部署，无平台强绑定 |
| Approval Workflow | ✅（SAP Build Process Automation） | ✅（企业已有工作流引擎，如 ServiceNow/自建） | 优先复用企业已有的审批体系，避免多套审批系统并存 |
| Integration Suite / Destination / Connectivity | ✅（BTP 原生） | ⚠️理论上可自建协议转换层，但会失去 SAP 官方对 Destination/Principal Propagation 的原生支持 | 涉及到 SAP 系统连接的部分，强烈建议留在 BTP 上，这是 SAP 生态里"最省心"的一环 |
| S/4HANA | 取决于部署形态（Part 6） | On-Premise 客户自己机房；Private/Public Cloud 由 SAP 或合作伙伴托管 | |
| Audit Log Store | ✅或✅ | ✅或✅ | 需符合企业数据驻留（Data Residency）合规要求，这通常是决定放哪的关键因素而非技术因素 |
| Secrets Manager | ✅（BTP Credential Store/Destination） | ✅（云厂商 Secret Manager/Vault） | 视整体应用主体部署在哪个云而定，避免凭据管理分散在多处 |

## 16.3 Trust Boundary 说明

- **TB1（用户设备/公网）**：完全不可信，任何输入都要在进入 TB2 时做基础校验（格式、大小、注入特征）。
- **TB2（API Gateway/认证层）**：负责把"匿名公网流量"转换成"已认证的用户身份"，是第一道硬性关卡——未通过认证的请求不应到达 TB3。
- **TB3（AI/应用后端）**：这是本教程反复强调的"业务把关层"，内部又可以细分（Agent Service 相对不可信任其自主决策，Business Service 是强制校验的关卡）。
- **TB4（SAP 集成层）**：负责协议和网络层面的信任转换（比如用 Principal Propagation 把 TB3 已验证的用户身份，转换成 SAP 能识别的身份凭证）。
- **TB5（SAP 系统内部）**：最终、最权威的业务规则执行边界，即使前面所有层都被绕过或出错，SAP 自身的 Authorization Object 检查、Credit Check、ATP 仍是最后一道防线。

**设计原则：每跨越一个 Trust Boundary，都应该有一次显式的身份/权限重新验证，不能假设"上一层已经检查过了就不用再检查"（Defense in Depth，纵深防御）。**

## 16.4 项目中你需要记住什么

- 生产架构的核心不是画出漂亮的框图，而是清楚标出每个 Trust Boundary，并保证跨边界时都有独立的验证逻辑。
- 涉及 SAP 连接的部分（Destination/Connectivity/Integration Suite）建议留在 BTP，其他组件（Frontend/Gateway/Approval）可以根据企业已有技术栈灵活选择云平台，不必强行都放在同一个云。
- 数据驻留合规要求（尤其审计日志和 PII 存储位置）往往是"放哪个云"的决定性因素，不是纯技术判断。
- 本章的架构图默认是同步 Request/Response 视角，SAP 主动推送事件的架构补充见 Part 22；同一套架构在 DEV/QAS/PRD 多环境下如何隔离部署，见 Part 25。
