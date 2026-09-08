# 阶段复习 4：数据库与持久层

## 知识地图

本阶段（第 24～29 章 + Project 3）按依赖顺序学习了以下内容：

```
数据库基础概念（表/行/列/主键/外键，第 24 章）
    ↓
基础 SQL 实战（SELECT/INSERT/UPDATE/DELETE/WHERE/ORDER BY/LIMIT，第 25 章）
    ↓
Spring Boot 连接 MySQL（spring.datasource：url/username/password/driver-class-name，第 26 章）
    ↓
JDBC 是什么、为什么繁琐 → MyBatis 出现
  → @Mapper + @Select + #{} 占位符（防 SQL 注入）
  → 接口没有实现类也能工作：MyBatis 动态代理自动生成实现类
  （第 27 章）
    ↓
MyBatis-Plus：BaseMapper<T> 免去手写基础增删改查 SQL
  → @TableName / @TableId
  → 依赖坐标 mybatis-plus-spring-boot4-starter:3.5.17
  （第 28 章）
    ↓
事务 @Transactional：commit / rollback，转账例子，背后是 AOP 动态代理
  （第 29 章）
    ↓
Project 3：User CRUD 从内存版升级为 MySQL 版
  Controller → Service → Mapper → MySQL
```

## 易混概念对照

| 概念 A | 概念 B | 一句话区别 |
|---|---|---|
| JDBC | MyBatis | JDBC 是 Java 官方定义的数据库访问标准接口，写法繁琐（手动建连接、拼 SQL、取结果）；MyBatis 是建立在 JDBC 之上的框架，把这些重复劳动自动化，开发者只需要写 SQL 和方法签名 |
| MyBatis | MyBatis-Plus | MyBatis 需要你自己在 `@Select`/`@Insert` 等注解（或 XML）里手写每一条 SQL；MyBatis-Plus 建立在 MyBatis 之上，通过 `BaseMapper<T>` 把最基础的增删改查 SQL 自动生成，你可以不用再手写这些"万能模板 SQL" |
| `@Select`（MyBatis 原生） | `BaseMapper`（MyBatis-Plus） | 前者需要显式写出 SQL 字符串；后者继承即拥有 `selectById`/`insert` 等方法，SQL 由框架在运行时自动拼装，不需要显式写出来 |
| commit | rollback | commit 是事务里所有操作都成功后，把改动永久保存到数据库；rollback 是事务里任意一步失败时，把已执行的操作全部撤销，恢复到事务开始前的状态 |
| `#{}` 占位符 | 字符串拼接 SQL | `#{}` 走预编译机制，参数值只会被当作普通数据处理，能防止 SQL 注入；字符串拼接直接把外部输入拼进 SQL 文本，存在被恶意篡改 SQL 逻辑的风险 |
| 主键（Primary Key） | 外键（Foreign Key） | 主键是一张表里唯一标识一行数据的列（唯一、不为空）；外键是一张表里的某一列，存的是另一张表的主键值，用来表示"谁属于谁"的关系 |

## 测试题

1. 为什么原始 JDBC 代码里"每查一次表就要重复一整套样板代码"？
2. `@Mapper` 标注的接口没有实现类，为什么依然能被 Spring 注入使用？
3. `#{id}` 占位符相比字符串拼接，安全性上的核心区别是什么？
4. `UserMapper extends BaseMapper<User>` 之后，不写任何方法，能直接调用哪些常见方法？
5. Spring Boot 3 项目和 Spring Boot 4 项目使用的 MyBatis-Plus Starter 坐标分别是什么？
6. 转账场景里，为什么"扣钱"和"加钱"必须放在同一个事务里？
7. `spring.datasource.url` 里的 `useSSL=false` 和 `serverTimezone` 分别解决什么问题？
8. Project 3 相比 Project 2，最本质的变化是什么？

<details>
<summary>参考答案</summary>

1. 因为原始 JDBC 需要手动完成建立连接、拼装 `PreparedStatement`、绑定参数、执行查询、遍历 `ResultSet` 逐列取值并手动赋值给 Java 对象、关闭资源这一整套流程，且这套流程在几乎每一次查询里都要重复一遍。
2. 因为 MyBatis 会在程序运行时用动态代理技术，根据接口的方法签名和注解里的 SQL，自动生成一个实现类，处理实际的数据库访问逻辑，Spring 把这个动态生成的实现类注册成 Bean 供注入使用。
3. `#{id}` 走 JDBC 预编译机制，参数值永远只被当作普通数据绑定进 SQL，不会被解释成 SQL 语法的一部分；字符串拼接则是把外部输入直接拼进 SQL 文本，恶意输入可能篡改整条 SQL 的逻辑，造成 SQL 注入。
4. `selectById`、`selectList`、`insert`、`updateById`、`deleteById` 等 `BaseMapper` 内置的基础增删改查方法。
5. Spring Boot 3：`mybatis-plus-boot-starter` 或 `mybatis-plus-spring-boot3-starter`；Spring Boot 4：`mybatis-plus-spring-boot4-starter`（本教程锁定版本 `3.5.17`）。
6. 因为这两步是一个不可分割的业务整体：如果只有第一步成功、第二步失败，就会出现"钱已经扣了但没有转到对方账户"这种数据不一致，甚至导致资金凭空消失，所以必须要求两步要么一起成功（commit），要么一起撤销（rollback）。
7. `useSSL=false` 避免本地开发环境因缺少 SSL 证书配置导致连接失败或反复报警告；`serverTimezone` 明确时区，避免日期时间字段出现"差 8 小时"这类时区错位问题。
8. 数据存储从内存 `List<User>`（程序重启数据即丢失）变成了真正的 MySQL 数据库持久化存储（程序重启数据依然存在），整体结构也从"Controller → Service → List"变成了"Controller → Service → Mapper → MySQL"。
</details>

## 小项目回顾

Project 3（User CRUD MySQL）综合运用了本阶段的全部知识点：

- **第 24 章（数据库基础）**：设计并理解 `user` 表的结构——`id`/`name`/`email`/`age` 四列，`id` 作为主键。
- **第 25 章（基础 SQL）**：项目背后 `BaseMapper` 自动生成的 SQL，本质上就是本章练过的 `SELECT`/`INSERT`/`UPDATE`/`DELETE`。
- **第 26 章（连接 MySQL）**：`application.yml` 里配置 `spring.datasource` 的 `url`/`username`/`password`/`driver-class-name`，让项目真正连上本地 MySQL。
- **第 27 章（JDBC 与 MyBatis）**：理解了 `UserMapper` 这个 interface 为什么不写实现类也能工作（MyBatis 动态代理），为后面直接使用 `BaseMapper` 打下基础。
- **第 28 章（MyBatis-Plus）**：`UserMapper extends BaseMapper<User>`，`User` 类加上 `@TableName`/`@TableId`，不手写一行 SQL 就实现了完整的增删改查。
- **第 29 章（事务）**：`UserServiceImpl` 的写操作方法上加 `@Transactional`，保证写入过程中出现异常时能正确回滚，不留下脏数据。
- **第 16、20、21、22 章（前一阶段已学内容的复用）**：构造器注入、Controller-Service 分层、RESTful 路由设计、Jackson 自动序列化，全部原样复用到 Project 3 里，没有引入任何本阶段之前没学过的新概念。

至此，你已经具备了"从浏览器发一个请求，到数据真正写进 MySQL、再原路返回浏览器"的完整能力。下一阶段将学习 DTO、参数校验、全局异常处理等工程化内容，为最终的 Task 管理系统项目做准备。
