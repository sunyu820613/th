# Java Web 入门到实战教程 — Project 1～4 真实工程验证报告 Round 5（真实 MySQL 8.0 复跑）

## 结论

按 Round 4 指摘的"如需严格关闭问题，请在真实 MySQL 8.0/8.4 上复跑 Project 3、Project 4"要求，本轮已经：

1. 卸载此前用于验证的 MariaDB 10.11.14（含配置文件一并清除，避免残留配置冲突）
2. 安装并初始化真正的 **MySQL Community Server 8.0.46**（Ubuntu 官方仓库版本，来源 `archive.ubuntu.com`）
3. 在真实 MySQL 8.0 上重新执行 Project 3、Project 4 的完整验证流程

```text
Java 21（OpenJDK 21.0.10）
Spring Boot 4.1.1
Maven 3.9.11
MySQL Community Server 8.0.46（真实 MySQL，非 MariaDB）
```

**结论：Project 1：PASS；Project 2：PASS；Project 3：PASS（MySQL 8.0.46 实测）；Project 4：PASS（MySQL 8.0.46 实测）。**

Round 4 遗留的"MariaDB ≠ MySQL 8.x"问题，本轮已彻底关闭。

---

## 验证结果表

| Project | Compile | Test | Startup | CRUD | Pagination | Result |
|---|---|---|---|---|---|---|
| Project 1（hello-spring-boot） | ✅ | N/A（教程 Project 1 最终代码未定义业务测试） | ✅ | N/A | N/A | **PASS**（沿用 Round 4 结果，不涉及数据库，无需重跑） |
| Project 2（user-api-memory） | ✅ | N/A（教程 Project 2 最终代码未定义业务测试） | ✅ | ✅ | N/A | **PASS**（沿用 Round 4 结果，纯内存实现，不涉及数据库，无需重跑） |
| Project 3（user-crud-mysql） | ✅ BUILD SUCCESS | N/A | ✅ `Started UserCrudMysqlApplication` | ✅ 新增/查询/修改/删除全部对真实 MySQL 8.0.46 实测通过 | N/A | **PASS（MySQL 8.0.46 实测）** |
| Project 4（task-manager） | ✅ BUILD SUCCESS | ✅ `Tests run: 2, Failures: 0, Errors: 0` | ✅ `Started TaskManagerApplication` | ✅ User/Task 增删改查、404、400 全部对真实 MySQL 8.0.46 实测通过 | ✅ page/size/total/records 结构与分页结果正确 | **PASS（MySQL 8.0.46 实测）** |

---

## MySQL 8.0 环境搭建记录（可复现）

1. `apt-get purge mariadb-server mariadb-client mariadb-common ...` 完全卸载 MariaDB，并删除残留的 `/etc/mysql/mariadb.conf.d`（否则 MySQL 初始化会因为读到 MariaDB 专属配置项 `provider_bzip2=force_plus_permanent` 而报错退出，这是本轮踩到的一个环境坑，与教程内容无关）。
2. `apt-get install mysql-server` 安装 `mysql-server-8.0 8.0.46-0ubuntu0.24.04.4`。
3. 清空 `/var/lib/mysql`，用 `mysqld --initialize-insecure` 重新初始化数据目录。
4. 补建 `/var/lib/mysql-files` 目录（`secure-file-priv` 需要，否则 MySQL 启动会失败）。
5. 手工 `mysqld --user=mysql --datadir=/var/lib/mysql --socket=/var/run/mysqld/mysqld.sock` 启动（容器环境没有 systemd，走不了 `service mysql start`）。
6. `mysql -u root -S <socket> -e "SELECT VERSION();"` 确认输出 `8.0.46-0ubuntu0.24.04.4`，确认是真正的 MySQL，不是 MariaDB。
7. 确认监听 `bind_address=*`、`port=3306`，用 `mysql -u appuser -h 127.0.0.1 -P 3306` 走 TCP 连接成功——这和教程 `application.yml` 里 `jdbc:mysql://localhost:3306/...` 的连接方式完全一致。
8. 按教程建表 SQL 原样建库建表（`usercrud_db.user`、`task_manager.user`/`task`，含外键约束）。

---

## Project 3 详细验证记录（真实 MySQL 8.0.46）

```text
mvn clean test    -> BUILD SUCCESS
mvn clean package -> BUILD SUCCESS, 生成 user-crud-mysql-0.0.1-SNAPSHOT.jar

java -jar 启动后：
POST /users {"name":"Tom","email":"tom@example.com","age":20}
  -> {"id":1,"name":"Tom","email":"tom@example.com","age":20}
GET  /users/1
  -> {"id":1,"name":"Tom","email":"tom@example.com","age":20}
PUT  /users/1 {"name":"Tom U","email":"tomu@example.com","age":21}
  -> {"id":1,"name":"Tom U","email":"tomu@example.com","age":21}
  数据库独立核对（mysql 命令行，非接口自证）：
  SELECT * FROM user; -> 1 | Tom U | tomu@example.com | 21   ✔ 一致
DELETE /users/1
  数据库独立核对：SELECT COUNT(*) FROM user; -> 0             ✔ 确认真删除
```

## Project 4 详细验证记录（真实 MySQL 8.0.46）

```text
mvn clean test
  Tests run: 2, Failures: 0, Errors: 0
  - TaskServiceTest：不启动 Spring，纯逻辑单元测试通过
  - TaskControllerTest：@WebMvcTest + @MockitoBean + MockMvc，验证 GET /tasks 返回结构

mvn clean package -> BUILD SUCCESS

java -jar 启动后（连接真实 MySQL 8.0.46）：

User：
  POST /users {"username":"bob","email":"bob@example.com"} -> 创建成功，返回用户 id=2（本轮该请求用的是不带 -i 的 curl，未实际记录 HTTP 状态码，因此不写成 201，只记录已观察到的响应体结果）
  GET  /users/1（种子数据 alice）-> 正常返回
  POST /users 非法邮箱 -> 400 {"message":"邮箱格式不正确"}

Task：
  POST /tasks x3 -> 依次生成 id=1,2,3
  GET  /tasks/1 -> 正常返回
  PUT  /tasks/1 -> 更新成功
  GET  /tasks/999 -> 404 {"message":"任务不存在，id=999"}
  POST /tasks 空标题 -> 400 {"message":"标题不能为空"}

分页：
  GET /tasks?page=1&size=2 -> {"page":1,"size":2,"total":3,"records":[任务1,任务2]}
  GET /tasks?page=2&size=2 -> {"page":2,"size":2,"total":3,"records":[任务3]}
  DELETE /tasks/2 后再查全部 -> total 正确变为 2

数据库独立核对（mysql 命令行，--default-character-set=utf8mb4）：
  SELECT id, title, description FROM task;
  1 | 学习 Spring Boot（已修改） | 完成最终项目
  3 | 复习 MyBatis-Plus          | NULL
  （中文内容正确无乱码，此前一次不带 --default-character-set 参数查询时
   终端显示乱码，是 mysql 命令行客户端会话字符集设置问题，不是数据损坏
   或程序编码问题——已交叉验证：接口 GET /tasks/1 返回的 JSON 中文一直正常）

User/Task 外键（task.user_id -> user.id）在真实 MySQL 8.0 上约束生效。
```

---

## 本轮是否发现新问题

**没有发现教程代码或依赖层面的新问题。** 唯一遇到的是一次性的本地环境搭建问题（MariaDB 残留配置导致 MySQL 初始化失败、`secure-file-priv` 目录缺失），这两个都是本次验证环境自身的操作性问题，与教程内容、代码、依赖无关，已经在上面的"环境搭建记录"里如实记录，不影响教程本身的正确性结论。

## 验证方式说明（可复现性）

1. 所有代码逐字从教程 markdown 源文件提取，未做任何"更正"或"优化"。
2. 本轮 Project 3、4 连接的是真实起跑的 **MySQL Community Server 8.0.46**（`mysql -u root -e "SELECT VERSION();"` 确认），不是 MariaDB，不是 mock，也不是内存数据库。
3. 每个接口都用真实 `curl` 发送 HTTP 请求、接收真实响应；数据库状态变化用 `mysql` 命令行独立核对，不只信任接口返回值。
4. 验证完成后已 `pkill` 清理所有测试用 Java 进程，并 `mysqladmin shutdown` 关闭 MySQL 服务，不留后台进程。

---

## 最终判断

```text
教程静态内容：保持冻结，未做任何改动
教程结构：保持冻结
技术栈：保持冻结

Project 1：PASS
Project 2：PASS
Project 3：PASS（MySQL 8.0.46 实测）
Project 4：PASS（MySQL 8.0.46 实测）
```

Round 4 提出的"MariaDB ≠ MySQL 8.x"问题已彻底关闭，本报告可以作为教程工程可运行性的最终有效证据。
