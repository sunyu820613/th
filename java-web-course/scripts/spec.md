# 写作规范（所有章节必须遵守）

本文档是给"写章节内容"的写手看的共享规范。写之前请先读：
- `/tmp/claude-0/-home-user-th/fc11efe4-58ae-5bcb-b38b-1cec944b2fd8/scratchpad/java-course-outline.md`（完整大纲 v2.2，里面有每章的学习目标、知识依赖顺序、四个阶段项目、最终项目目录结构）
- `/tmp/claude-0/-home-user-th/fc11efe4-58ae-5bcb-b38b-1cec944b2fd8/scratchpad/chapters/ch01-environment.md`
- `/tmp/claude-0/-home-user-th/fc11efe4-58ae-5bcb-b38b-1cec944b2fd8/scratchpad/chapters/ch02-variables.md`

这两章是已经写好并通过审核的风格范本，语气、深度、结构必须严格模仿。

## 目标读者
Java 完全零基础的自学者。语言要浅显、口语化但准确，杜绝黑话轰炸；每个新概念第一次出现都要解释清楚。

## 技术栈（全教程锁定，任何章节不得使用其他版本或写法）

| 项目 | 版本 |
|---|---|
| Java | 21 LTS |
| Spring Boot | 4.1.1 |
| 构建工具 | Maven |
| IDE | IntelliJ IDEA Community |
| 数据库 | MySQL 8.x |
| MyBatis | `org.mybatis.spring.boot:mybatis-spring-boot-starter:4.0.0` |
| MyBatis-Plus | artifactId 固定为 `mybatis-plus-spring-boot4-starter`；版本号统一写 **1.0.0**（本教程锁定值，写代码时直接用这个版本号，不要再纠结）|
| 测试 | JUnit 5 + Spring Boot Test |

**Spring Boot 3 → 4 对照**（仅在涉及到的章节提一句，不要写成完整迁移指南）：
1. Java 最低版本要求提高
2. Spring Framework 主版本变化
3. 继续使用 Jakarta 命名空间（`jakarta.servlet.*` 而不是 `javax.servlet.*`）
4. 部分 Starter/dependency 坐标发生变化
5. MyBatis / MyBatis-Plus 要选择 Boot 4 兼容的 Starter（`mybatis-spring-boot-starter:4.0.0` / `mybatis-plus-spring-boot4-starter`）

## 每章统一结构（严格照此顺序，标题用二级标题 `##`）

```
# 第 N 章　标题

## 本章目标
## 一句话理解
## 为什么需要它
## 核心概念
## 图解
## 最小示例
## 代码逐行解释
## 程序运行过程
## 常见错误
## 动手练习
## 小测验（用 <details><summary>参考答案</summary>...</details> 包住答案）
## 本章总结
```

如果一章内容较多，可以在"核心概念"和"最小示例"之间按小节（`###`）拆分，但整体大标题顺序不能变。

## 调用链要求（全教程核心，硬性要求）

**每一个**涉及 HTTP/Servlet/Spring MVC/数据库的主要代码示例，必须在"程序运行过程"部分回答以下问题中和本章相关的部分：
- 谁调用了这个方法？
- 这个对象是谁创建的？
- 请求怎么找到这个 Controller？
- Service 从哪里来的？
- Mapper 为什么只有 interface 也能工作？
- Java 对象什么时候变成 JSON？
- 数据库查询结果怎么返回浏览器？

涉及完整链路时用这张图（根据本章进度截取相应片段即可，不用每次画全）：

```
Browser
  ↓ HTTP Request
Tomcat
  ↓
DispatcherServlet
  ↓
HandlerMapping（找谁处理）
  ↓
HandlerAdapter（怎么调用）
  ↓
Controller
  ↓
Service
  ↓
Mapper
  ↓
MySQL
  ↓（结果原路返回）
Mapper → Service → Controller
  ↓
HttpMessageConverter / Jackson（Java 对象 → JSON）
  ↓ HTTP Response
Browser
```

## 强制自检规则（写完每章前自查一遍）

1. 示例代码是否适用于 Java 21
2. 是否适用于 Spring Boot 4.1.1
3. Starter 的 artifactId 是否为 Boot 4 对应版本（尤其 MyBatis-Plus）
4. 是否混入了 Spring Boot 2/3 的旧写法
5. import 包路径是否正确
6. pom.xml 片段是否能正常解析
7. 前后章节出现的类名、包名、字段名、URL 是否保持一致（统一用包名 `com.example.<项目名>`）
8. 示例代码是否具备可编译运行的完整性
9. 不得为了"讲完整"提前引入后面章节才会学习的概念
10. 如果必须提前出现一个陌生概念，只给一句最小解释，并注明"后面第 X 章详细讲"
11. 阶段项目必须建立在此前已学内容之上，不能偷偷使用未教过的注解/API/设计模式
12. 涉及版本兼容性的依赖，统一按本文件顶部的版本表，不自作主张升级

## 项目命名统一

- Project 1（Hello Spring Boot）：`hello-spring-boot`，包名 `com.example.hello`
- Project 2（内存版 User API）：`user-api-memory`，包名 `com.example.userapi`
- Project 3（MySQL User CRUD）：`user-crud-mysql`，包名 `com.example.usercrud`
- Project 4（最终项目 Task 管理系统）：`task-manager`，包名 `com.example.taskmanager`

## 阶段复习（Review）统一结构

```
# 阶段复习 N：标题

## 知识地图
（用一段 flow 图或分点列出本阶段学过的概念，按依赖顺序排列）

## 易混概念对照
（表格：概念A | 概念B | 一句话区别）

## 测试题
（5~8 道选择/简答题，答案用 <details> 折叠）

## 小项目回顾
（如果本阶段有对应的 Project，简要总结它用到了哪些本阶段知识点）
```

## 输出要求

每章/每次复习/每个项目单独写成一个 Markdown 文件，文件名和路径见分配任务时给出的清单，直接用 Write 工具写入，不要询问，不要输出到聊天里（避免浪费上下文），写完后简短汇报文件清单即可。
