# Codex Task — <编号>-<简短标题>

## Task Type
Research / Design / Documentation / Review（单选或组合）

## Requested By
Claude Code

## Date
YYYY-MM-DD

## Context
（为什么需要这项研究/设计/Review，关联的需求或 Phase）

## Research Question(s)
（一个或多个明确的问题，避免模糊表述）

## Scope
（本次任务覆盖的技术范围，明确列出）

## Out of Scope
（明确排除的内容，避免范围蔓延）

## Required Output
- 输出文件路径：`docs/research/<编号>-*.md`（或 `docs/reviews/`）
- 必须使用《Codex Research 输出格式》（见 AGENTS.md 引用的模板）：
  1. Research Question
  2. Executive Summary
  3. Official Sources（表格：Source / Product / Version / Access Date / Key Finding）
  4. Confirmed Facts
  5. Assumptions
  6. Options
  7. Recommended Option
  8. Risks
  9. Implementation Notes
  10. Verification Plan
  11. Unresolved Questions

## Constraints
- 关键技术结论至少需要一个官方来源
- 涉及版本/API/SDK/支持状态/服务能力/部署命令必须重新检索，不得只依赖模型记忆
- 禁止只给链接不总结内容
- 禁止只根据博客或社区帖子做关键技术决定
- 仅可修改 AGENTS.md 中列出的可修改目录

## Deadline / Priority
（如有）

## Handoff
完成后更新 `docs/AGENT_HANDOFF.md`，并将 `Next Owner` 设为 Claude Code。
