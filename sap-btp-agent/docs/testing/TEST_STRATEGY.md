# TEST STRATEGY — SAP BTP Agent

## 1. 原则

- 测试金字塔：单元测试为主，集成测试覆盖模块边界，端到端测试覆盖关键用户路径。
- 涉及真实 SAP BTP 服务的路径默认使用 Mock Provider 测试；真实服务测试需要用户提供凭据，
  在没有凭据时必须在报告中明确标注为"尚未执行"，不得伪造通过。
- 每次实现任务完成后，Claude Code 必须实际运行测试并记录结果到 `docs/testing/`，
  不得声称未运行过的测试已经通过。

## 2. Claude Code 验证清单（每次实现任务的最低要求）

1. **静态检查**（ruff / 等价工具）
2. **类型检查**（mypy / 等价工具）
3. **单元测试**（pytest）
4. **集成测试**（模块间协作，使用 Mock Provider）
5. **API 启动测试**（服务能正常启动，无启动期异常）
6. **`/health` 健康检查**（返回 200 及预期结构）
7. **错误输入测试**（非法/畸形请求体、超长输入、编码异常等）
8. **超时测试**（下游服务无响应时的行为，如 SAP AI Core / Destination 调用超时）
9. **外部服务不可用测试**（下游 5xx / 网络错误时的降级与错误信息）
10. **凭据缺失测试**（未配置 XSUAA / Destination / AI Core 凭据时的明确报错，而非崩溃或静默）
11. **Prompt Injection 基础测试**（检索结果/用户输入中嵌入"忽略以上指令"等内容时，
    不得改变系统行为或泄露敏感信息）
12. **日志脱敏测试**（断言日志输出中不包含 `authorization` / `access_token` /
    `refresh_token` / `client_secret` / `password` / `api_key` / `cookie` /
    `set-cookie` 等字段的明文值）
13. **Codex Review 问题回归测试**（针对上一轮 Review 中标记为 BLOCKER/HIGH 的问题，
    补充专项测试用例证明已修复）

## 3. 测试分类与产出位置

| 类型 | 位置 | 说明 |
|---|---|---|
| 单元测试 | `tests/unit/` | 对单个模块/函数 |
| 集成测试 | `tests/integration/` | 跨模块，使用 Mock Provider |
| 端到端测试 | `tests/e2e/` | 覆盖完整用户请求路径 |
| Mock 测试证据 | `docs/testing/` | 记录 Mock 模式下的运行结果 |
| 真实 BTP 测试记录 | `docs/testing/` | 明确区分"已执行"与"待用户执行" |

## 4. 测试结果记录格式

每次提交测试证据时，在 `docs/testing/` 下创建对应记录文件，至少包含：

```markdown
# Test Run — <日期> — <任务/阶段>

## 环境
（本地 / CI / 是否有真实 BTP 凭据）

## 执行命令
（实际执行的命令，逐条列出）

## 结果摘要
（通过/失败数量、关键失败信息）

## 已完成的本地测试
...

## Mock 测试
...

## 尚未执行的 BTP 测试
...

## 需要用户执行的验证步骤
...
```

## 5. 与验收标准的关系

`docs/requirements/REQUIREMENTS.md` 第 9 节验收标准中关于测试和回归的条目，
以本文件第 2 节清单为最低执行标准；Phase 5（BTP Integration）涉及真实服务时，
额外记录见第 4 节"尚未执行的 BTP 测试"部分。
