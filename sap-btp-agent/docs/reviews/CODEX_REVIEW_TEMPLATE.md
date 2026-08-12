# Codex Review — <编号>-<被评审的任务/模块>

## Review Target
（被评审的实现/PR/文件范围）

## Reviewer
Codex

## Date
YYYY-MM-DD

## Review Dimensions

### Correctness
- 实现是否满足需求
- 逻辑是否正确
- 边界条件是否处理
- 异常是否正确处理

### SAP Compliance
- SAP API 是否真实存在
- SDK 调用是否符合当前版本
- BTP 服务绑定是否正确
- Destination 使用方式是否正确
- XSUAA 权限设计是否合理
- MTA 和 Manifest 配置是否合理
- 是否违反 Clean Core 原则

### Security
- 是否存在硬编码密钥
- 是否记录 Token、密码或敏感信息
- 是否存在 Prompt Injection 风险
- 是否存在 SSRF 风险
- 是否允许任意命令执行
- 是否允许任意文件读取
- 是否缺少输入校验
- 是否存在过度授权

### Maintainability
- 模块职责是否清晰
- 是否存在重复代码
- 是否存在超大文件或超大函数
- 配置是否与代码分离
- 日志是否可追踪
- 错误信息是否有意义

### Testing
- 是否有单元测试
- 是否有集成测试
- 是否测试失败路径
- 是否测试超时
- 是否测试无效输入
- 是否测试 SAP API 模拟
- 是否提供实际运行证据

## Findings

（每个问题使用以下结构，按 Severity 从高到低排列；无问题的维度也需说明"已检查，无发现"）

```markdown
## Finding

Severity: BLOCKER | HIGH | MEDIUM | LOW | SUGGESTION

File:

Location:

Problem:

Evidence:

Impact:

Recommended Fix:

Required Test:
```

## Summary

| Severity | Count |
|---|---|
| BLOCKER |  |
| HIGH |  |
| MEDIUM |  |
| LOW |  |
| SUGGESTION |  |

## Verdict
Approved / Approved with follow-ups / Changes Required

## Handoff
更新 `docs/AGENT_HANDOFF.md`，`Next Owner` 设为 Claude Code（若存在 BLOCKER/HIGH）。
