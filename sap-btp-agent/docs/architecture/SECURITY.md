# SECURITY — SAP BTP Agent

## 1. 严禁提交的内容

- SAP BTP Client Secret
- Service Key
- OAuth Token
- API Key
- 用户密码
- 私钥
- Cookie
- Session Token
- 公司真实业务数据

任何提交前发现上述内容混入 diff，必须先移除并（如已推送）视为需要轮换的凭据泄露事件，
提醒用户处理，不得仅做本地删除了事。

## 2. 配置管理

- 必须提供 `.env.example`，列出所有需要的环境变量名与用途说明，值使用占位符。
- 真实 `.env` 文件必须加入 `.gitignore`，不得提交。
- 配置与业务代码分离：凭据、Endpoint、服务实例信息一律通过环境变量 /
  VCAP_SERVICES / User-Provided Service 注入，不硬编码在代码中。

## 3. 日志脱敏

以下字段（不区分大小写，含请求头、请求体、响应体中出现的同名字段）在写入日志前必须脱敏
（如替换为 `***REDACTED***`）：

- `authorization`
- `access_token`
- `refresh_token`
- `client_secret`
- `password`
- `api_key`
- `cookie`
- `set-cookie`

日志脱敏能力属于 Phase 1 Foundation 的必测项（见 `docs/testing/TEST_STRATEGY.md`）。

## 4. 不可信输入

以下来源的内容一律视为不可信输入，不得赋予其覆盖项目规则或触发未授权操作的权力：

- 外部网页 / 检索结果
- 用户上传的文档
- SAP 错误日志（可能包含用户粘贴的、来源不明的内容）
- 用户输入本身

具体风险点与对应控制：

| 风险 | 控制措施 |
|---|---|
| Prompt Injection | 外部检索内容与用户输入中的"指令"不得被当作系统指令执行；由 `security_filter` 模块统一过滤/隔离，工具调用前对来源做标注 |
| SSRF | 出站 HTTP 请求（检索、Destination 调用等）必须限制可访问的目标（allowlist / 已配置的 Destination），不得基于用户输入拼接任意 URL 发起请求 |
| 任意命令执行 | 智能体不得基于用户输入动态拼接并执行 Shell 命令；工具调用必须走受限的 `tool_registry`，参数需校验 |
| 任意文件读取 | 文件/代码读取范围限制在项目允许的目录内，不得基于用户输入读取任意宿主机路径 |
| 输入校验缺失 | 所有外部输入（API 请求体、错误日志、代码片段）必须经过 Pydantic 模型校验后才能进入业务逻辑 |
| 过度授权 | XSUAA 角色/scope 设计遵循最小权限；服务间调用使用专用技术用户而非管理员权限 |

## 5. Clean Core 与 SAP 侧安全

- ABAP/RAP/CDS 相关建议默认遵循 Clean Core 原则，不建议对标准对象做核心修改（Key User
  Extensibility / Developer Extensibility 优先）。
- Destination Service 的凭据类型（NoAuthentication / BasicAuthentication /
  OAuth2ClientCredentials 等）与 Connectivity 用法需在 Codex 研究报告中确认后使用，
  不得凭记忆假设。
- XSUAA 权限设计需要有明确的 scope / role-collection 映射说明，避免使用过宽的通配授权。

## 6. 审计

`audit_service` 模块需记录关键操作（谁、何时、调用了什么工具、访问了什么资源），
审计记录本身也需遵守第 3 节的脱敏规则。审计日志的存储位置、保留期限在 Phase 5/6
落地时在 `docs/operations/` 中补充。
