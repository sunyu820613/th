# Java Web 从零到实战教程

从 Java 基础一路讲到 Spring Boot + Spring MVC + MySQL + MyBatis-Plus 的完整全栈教程，共 38 章 + 5 次阶段复习 + 4 个循序渐进的实战项目。目标栈：Java 21 + Spring Boot 4.1.1 + MyBatis-Plus 3.5.17 + MySQL 8.x。

## 目录结构

```
java-web-course/
├── chapters/              中文原版教程（Markdown 源文件，46 篇）
├── chapters_bilingual/    中日双语版教程（Markdown 源文件，46 篇）
├── projects/              4 个循序渐进的示例项目（真实可运行的 Maven 工程）
│   ├── hello-spring-boot/     项目1：最小 Spring Boot 应用
│   ├── user-api-memory/       项目2：内存版用户管理 API
│   ├── user-crud-mysql/       项目3：MySQL + MyBatis-Plus 版用户 CRUD
│   └── task-manager/          项目4：最终完整 Task 管理系统（分页/校验/异常处理/事务/测试）
├── scripts/               把 Markdown 源文件构建成最终单页 HTML 教程的 Python 脚本
├── output/                构建好的最终成品 HTML（可直接双击用浏览器打开）
├── verification-report-round4.md   项目 1~4 的真实 Maven/MySQL 构建验证报告
└── verification-report-round5.md
```

## 阅读教程

直接用浏览器打开：

- `output/Java-Web入门到实战教程.html`（中文版）
- `output/Java-Web中日双语教程.html`（中日双语版）

## 运行示例项目

每个 `projects/*` 目录都是独立的 Maven 工程，进入目录后：

```bash
cd projects/task-manager
mvn spring-boot:run
```

`user-crud-mysql` 和 `task-manager` 需要本地先起一个 MySQL 8.x 实例，并按项目里 `application.yml`/`application.properties` 中的连接信息建好库。

## 修改教程内容后重新生成 HTML

修改 `chapters/` 或 `chapters_bilingual/` 下的 Markdown 后，在 `scripts/` 目录下依次运行：

```bash
# 中文单语版
python3 scripts/build.py
python3 scripts/generate.py
python3 - <<'EOF'
shell = open("scripts/shell.html", encoding="utf-8").read()
toc = open("toc.html", encoding="utf-8").read()
sections = open("sections.html", encoding="utf-8").read()
body = shell.replace("__TOC__", toc).replace("__SECTIONS__", sections)
# 补上完整 HTML 文档结构（DOCTYPE/head/meta charset），否则非内置浏览器打开会乱码
open("output/Java-Web入门到实战教程.html", "w", encoding="utf-8").write(body)
EOF

# 中日双语版
python3 scripts/build_bilingual.py
python3 scripts/generate_bilingual.py
# 同样需要用 shell_bilingual.html + toc_bilingual.html + sections_bilingual.html 拼装，
# 并补齐 <!DOCTYPE html><html><head><meta charset="UTF-8">...</head><body>...</body></html>
```

> 注意：`scripts/build.py` 等脚本里当前写死的是临时容器内的绝对路径，本地跑之前需要先把脚本里的路径改成本地的 `java-web-course/` 实际路径。
