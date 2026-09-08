# Java Web 入门到实战教程 — Project 1～4 真实工程验证报告（回复 Round 4 指摘）

## 结论

按 Round 4 指摘要求，已把 Project 1～4 从教程 HTML 中还原成真实 Maven 工程，在以下环境实际执行验证，不再是"理论上检查过"：

```text
Java 21（OpenJDK 21.0.10）
Spring Boot 4.1.1
Maven 3.9.11
MariaDB 10.11.14
```

**说明**：教程锁定的目标数据库是 **MySQL 8.x**。本轮实际验证环境用的是 **MariaDB 10.11.14**，其 JDBC 协议及本教程涉及的基础 SQL / CRUD / 外键 / 分页场景与 MySQL 高度兼容，因此本轮足以验证主要业务链路和 ORM 配置（Spring Boot、MyBatis-Plus、事务、外键、分页、接口）是否正确，但**不等价于**"已在 MySQL 8.x 上实测通过"，两者是不同的数据库产品，不能混用表述。

**结论：Project 1：PASS；Project 2：PASS；Project 3：PASS（MariaDB 10.11 实测）；Project 4：PASS（MariaDB 10.11 实测）。**

**教程目标环境仍是 MySQL 8.x；如需形成最终严格验收，建议再在真实 MySQL 8.0/8.4 上复跑 Project 3 / Project 4。**

---

## 验证结果表

| Project | Compile | Test | Startup | CRUD | Pagination | Result |
|---|---|---|---|---|---|---|
| Project 1（hello-spring-boot） | ✅ `mvn clean test` / `mvn clean package` 均 BUILD SUCCESS | N/A（教程 Project 1 最终代码未定义业务测试，还原工程也未额外生成 `HelloSpringBootApplicationTests`） | ✅ 日志出现 `Started HelloSpringBootApplication`，`Tomcat started on port 8080` | N/A | N/A | **PASS** |
| Project 2（user-api-memory） | ✅ BUILD SUCCESS | N/A（教程 Project 2 最终代码未定义业务测试） | ✅ | ✅ `GET/POST/PUT/DELETE /users` 全部用 curl 实测，返回体字段（`id/name/age`）与教程文档逐字一致 | N/A | **PASS** |
| Project 3（user-crud-mysql） | ✅ BUILD SUCCESS | N/A（教程 Project 3 最终代码未定义业务测试） | ✅ | ✅ 真实连接 MariaDB 10.11，新增/查询/修改/删除全部用 curl 实测；删除后用 `SELECT COUNT(*)` 确认行数为 0 | N/A | **PASS（MariaDB 10.11 实测，非 MySQL 8.x）** |
| Project 4（task-manager） | ✅ BUILD SUCCESS | ✅ `Tests run: 2, Failures: 0, Errors: 0`（`TaskServiceTest` + `TaskControllerTest`） | ✅ | ✅ User/Task 增删改查、404（`GET /tasks/999`）、400（空标题/非法邮箱）全部实测通过 | ✅ `GET /tasks?page=1&size=2` 与 `page=2&size=2` 返回结构和分页结果均正确 | **PASS（MariaDB 10.11 实测，非 MySQL 8.x）** |

---

## 逐项验证细节

### Project 1
- `mvn clean test`：BUILD SUCCESS（无测试可运行）
- `mvn clean package`：生成 `hello-spring-boot-0.0.1-SNAPSHOT.jar`
- `java -jar` 启动后，`curl http://localhost:8080/hello` 返回：
  ```
  Hello, Spring Boot!
  ```

### Project 2
- 完整 CRUD 实测记录：
  ```text
  GET  /users            -> []
  POST /users {"name":"Tom","age":20}       -> {"id":1,"name":"Tom","age":20}
  GET  /users            -> [{"id":1,"name":"Tom","age":20}]
  GET  /users/1          -> {"id":1,"name":"Tom","age":20}
  PUT  /users/1 {"name":"Tom2","age":21}    -> {"id":1,"name":"Tom2","age":21}
  DELETE /users/1        -> 删除成功
  GET  /users            -> []
  ```
- Controller / Service / Entity / URL / 字段名，与教程正文完全一致。

### Project 3
- 建表 SQL 执行后，`DESCRIBE user` 输出的列（`id/name/email/age`）与 `User` 实体的 `@TableName`/字段完全对应。
- CRUD 实测：
  ```text
  POST /users {"name":"Tom","email":"tom@example.com","age":20} -> id=1
  GET  /users/1          -> 返回该记录
  PUT  /users/1          -> 更新成功，数据库真实变化（用 mysql 命令行核对过）
  DELETE /users/1        -> 数据库 SELECT COUNT(*) 结果为 0
  ```
- `application.yml` 中 `url/username/password/driver-class-name` 与实际数据库配置一致，程序能正常建立连接。

### Project 4（重点）
- **测试**：`mvn clean test` → `Tests run: 2, Failures: 0, Errors: 0`
  - `TaskServiceTest`：不启动 Spring，纯逻辑单元测试通过
  - `TaskControllerTest`：`@WebMvcTest` + `@MockitoBean` + `MockMvc` 组合，验证 `GET /tasks` 返回结构（`page/total/records[0].title`）全部匹配
- **启动**：日志出现 `Started TaskManagerApplication`，`MybatisPlusInterceptor` 分页插件正常加载
- **User CRUD**：创建用户、查询种子用户（alice）均正常；非法邮箱触发 `400 {"message":"邮箱格式不正确"}`
- **Task CRUD**：创建 3 条任务、查询、更新均正常；`GET /tasks/999` 返回 `404 {"message":"任务不存在，id=999"}`；空标题触发 `400 {"message":"标题不能为空"}`
- **分页**：
  ```text
  GET /tasks?page=1&size=2 -> {"page":1,"size":2,"total":3,"records":[任务1,任务2]}
  GET /tasks?page=2&size=2 -> {"page":2,"size":2,"total":3,"records":[任务3]}
  ```
  删除一条后再查全部，`total` 正确变为 2，`records` 只剩剩余任务。
- User/Task 外键（`task.user_id -> user.id`）在数据库层面真实存在并生效。

---

## 本轮是否发现新问题

**没有。** 上一轮（Round 3）发现的 `spring-boot-starter-webmvc-test` 缺失问题，已经在教程正文的第 37 章 `pom.xml` 中修复；本轮重新从头执行 `mvn clean test`，直接得到 `Tests run: 2, Failures: 0, Errors: 0`，无需再改任何代码。

## 验证方式说明（可复现性）

1. 所有代码逐字从 HTML 教程中的 markdown 源文件提取，未做任何"更正"或"优化"，如实还原。
2. Project 3、4 连接的是真实起跑的 **MariaDB 10.11.14** 实例（不是 mock 或内存数据库），**不是** MySQL 8.x 本身——两者协议和常见 CRUD/SQL 行为高度兼容，但不是同一产品，本报告不把 MariaDB 上的结果等同于 MySQL 8.x 实测。
3. 每个接口都用真实 `curl` 发送 HTTP 请求、接收真实响应；数据库状态变化用 `mysql` 命令行独立核对，不只信任接口返回值。
4. 验证完成后已 `pkill` 清理所有测试用 Java 进程，不留后台服务。

---

## 最终判断

```text
教程静态内容：保持冻结，未做任何改动
教程结构：保持冻结
技术栈：保持冻结
Project 1、2：真实构建 + 真实运行 + 真实 HTTP 验证，PASS
Project 3、4：真实构建 + 真实运行 + MariaDB 10.11 真实数据库验证，PASS（MariaDB 实测，非 MySQL 8.x 实测）
```

暂不写"MySQL 8.x 全部实测 PASS"，除非在真实 MySQL 8.0/8.4 上重新跑一次 Project 3、Project 4。除此之外，本报告可以作为教程工程可运行性的有效证据。
