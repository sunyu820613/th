# 第 26 章　Spring Boot 连接 MySQL

## 本章目标
理解"Java 程序连接数据库"到底是什么意思；能读懂并配置 `application.yml` 里 `spring.datasource` 下的 `url`/`username`/`password`/`driver-class-name`；亲手让一个 Spring Boot 项目连上本地 MySQL。

## 一句话理解
"Java 程序连接数据库"，说白了就是 Java 程序通过一个叫 JDBC 驱动的"翻译官"，像打电话一样跟 MySQL 服务进程建立一条网络连接，之后就通过这条连接不断地"发送 SQL、接收结果"。

## 为什么需要它
前两章我们在数据库客户端（比如命令行或图形化工具）里手动敲 SQL，这没问题，但我们真正的目标是：让 Java 程序自己去查询、修改数据库，而不是靠人工敲命令。要做到这一点，第一步就是让 Java 程序"知道"数据库在哪里、怎么登录进去——这就是本章要解决的"连接"问题。注意：本章**还不会**用到 MyBatis，先把"连接"这一层单独讲透。

## 核心概念

### 26.1 "连接数据库"到底在做什么

MySQL 本质上是一个一直在后台运行的**服务进程**，它监听某个网络端口（默认 `3306`），等着别的程序来"敲门"。

Java 程序要用数据库，流程是这样的：

1. Java 程序里加载一个专门为 MySQL 写的 **JDBC 驱动**（一个 jar 包，相当于"懂得怎么和 MySQL 服务进程对话"的翻译官）。
2. 通过这个驱动，Java 程序向 MySQL 所在的地址和端口发起一条**网络连接**——这一步就跟打电话拨号很像：你要知道对方的"号码"（IP 地址 + 端口）,还要"验证身份"（用户名 + 密码）,对方接通了才能继续说话。
3. 连接建立成功后，Java 程序就可以通过这条连接反复发送 SQL 语句（"帮我查一下 user 表"），MySQL 执行完把结果通过同一条连接传回来。
4. 用完之后，连接可以关闭（实际项目中通常用"连接池"复用连接，避免每次都重新建立，这个概念本教程不展开）。

### 26.2 `spring.datasource` 四大配置项

Spring Boot 项目里，数据库连接信息统一写在 `application.yml` 的 `spring.datasource` 下面：

| 配置项 | 含义 |
|---|---|
| `url` | 数据库的"地址"，包含协议、主机、端口、库名以及一些连接参数 |
| `username` | 登录数据库用的用户名 |
| `password` | 登录数据库用的密码 |
| `driver-class-name` | JDBC 驱动的类全名，告诉 Spring Boot "用哪个翻译官去连" |

### 26.3 真实配置示例（MySQL 8.x）

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/usercrud_db?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

逐段拆解 `url`：

- `jdbc:mysql://`：固定前缀，告诉 JDBC 框架"接下来是一个 MySQL 数据库地址"。
- `localhost:3306`：MySQL 服务所在的主机地址和端口。`localhost` 表示"就在本机"，`3306` 是 MySQL 默认端口。
- `/usercrud_db`：要连接的具体数据库名（一个 MySQL 服务里可以有很多个数据库，得指明用哪一个）。
- `?useSSL=false`：**为什么需要它**——MySQL 8 默认会检查 SSL 加密连接的证书，本地开发环境一般没有配置证书，加上 `useSSL=false` 明确告诉驱动"不需要 SSL 加密"，避免因为证书问题连接失败或疯狂打印警告（生产环境通常会启用更完善的 SSL 配置，这里只是本地开发的简化写法）。
- `&serverTimezone=Asia/Shanghai`：**为什么需要它**——MySQL 8 的 JDBC 驱动要求明确指定时区，否则处理日期时间字段时可能会出现"差 8 小时"这种时区错位问题。写成你实际所在的时区（这里以上海/北京时间为例）。
- `&characterEncoding=UTF-8`：指定字符编码为 UTF-8，避免中文（比如用户名"张三"）存进数据库后变成乱码。

### 26.4 需要额外添加的依赖

想让 Spring Boot 项目具备连接 MySQL 的能力，`pom.xml` 里需要加两个依赖：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

`spring-boot-starter-jdbc` 版本由 Spring Boot 4.1.1 的 BOM 统一管理，无需手写版本号；`mysql-connector-j` 就是上面说的 MySQL JDBC 驱动 jar 包，`scope` 设为 `runtime` 表示"只在程序运行时需要，编译代码时不需要直接引用它的类"。

## 图解

```
Java 程序（Spring Boot）
     │
     │ 1. 读取 application.yml 里的 url / username / password
     ▼
JDBC 驱动（mysql-connector-j）
     │
     │ 2. 按 url 里的主机+端口，向 MySQL 服务进程发起网络连接
     ▼
MySQL 服务进程（监听 3306 端口）
     │
     │ 3. 校验 username/password，通过后建立连接
     ▼
连接建立成功 ──▶ 之后 Java 程序通过这条连接发送 SQL、接收结果
```

## 最小示例

一个完整的 `application.yml`（放在 `src/main/resources/` 下）：

```yaml
spring:
  application:
    name: user-crud-mysql
  datasource:
    url: jdbc:mysql://localhost:3306/usercrud_db?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

启动项目后，如果配置正确，控制台日志会看到类似 `HikariPool-1 - Start completed` 的字样（Spring Boot 内置的连接池叫 HikariCP，本教程不展开它的细节，这里只需要知道"看到这行日志说明连接池启动成功，数据库连上了"）。

## 代码逐行解释

- `url` 一行：这是唯一一行信息量最大的配置，前面已经逐段拆解过：协议 + 主机 + 端口 + 库名 + 连接参数。
- `username` / `password`：就是你登录 MySQL 时用的账号密码，和你在命令行 `mysql -u root -p` 里输入的是同一套。
- `driver-class-name: com.mysql.cj.jdbc.Driver`：这是 `mysql-connector-j` 这个 jar 包里提供的驱动类的完整路径。Spring Boot 实际上大多数情况下能自动根据 `url` 猜出驱动类，但显式写出来更清晰、不容易出问题，本教程统一显式配置。

## 程序运行过程

1. Spring Boot 应用启动时，读取 `application.yml` 里 `spring.datasource` 下的配置。
2. Spring Boot 自动配置（`@EnableAutoConfiguration`，第 19 章讲过）检测到 classpath 里有 `mysql-connector-j` 和 `spring-boot-starter-jdbc`，于是自动创建一个数据源（DataSource）Bean，并用配置里的 `url`/`username`/`password` 初始化连接池。
3. 连接池按需向 MySQL 服务进程建立若干条网络连接，放在池子里备用。
4. 只要连接池启动成功，说明"Java 程序能连上数据库"这件事已经打通了——接下来的章节会讲怎么用 MyBatis 通过这些连接真正发送 SQL。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `Communications link failure` | MySQL 服务没启动，或者 `url` 里的主机/端口写错 | 确认本地 MySQL 服务已启动，检查 `localhost:3306` 是否正确 |
| `Access denied for user 'root'@'localhost'` | 用户名或密码错误 | 核对 `username`/`password` 是否和实际 MySQL 账号一致 |
| `Unknown database 'usercrud_db'` | `url` 里指定的数据库名在 MySQL 里还不存在 | 先手动执行 `CREATE DATABASE usercrud_db;` 创建这个库，再启动项目 |
| 时间字段查出来差 8 小时 | 没有配置 `serverTimezone`，或时区配置和实际不符 | 在 `url` 里加上正确的 `serverTimezone` 参数 |

## 动手练习

1. 在本地安装的 MySQL 里手动创建一个数据库 `usercrud_db`，然后按本章的 `application.yml` 配置一个 Spring Boot 项目，启动后观察控制台日志有没有出现连接池启动成功的字样。
2. 故意把 `password` 改错，重新启动项目，观察报错信息，理解这条错误对应哪一步失败了。
3. 试着去掉 `url` 里的 `serverTimezone` 参数，看看是否还能正常启动（不同 MySQL 驱动版本表现可能不同，体会一下这个参数的作用）。

## 小测验

1. "Java 程序连接数据库"这句话具体指的是什么过程？
2. `spring.datasource.url` 里的 `useSSL=false` 和 `serverTimezone` 分别是为了解决什么问题？
3. `driver-class-name` 配置的是什么？

<details>
<summary>参考答案</summary>

1. 指 Java 程序通过 JDBC 驱动，按照配置的地址、端口、用户名、密码，向 MySQL 服务进程发起网络连接并完成身份校验，之后就能通过这条连接发送 SQL、接收结果。
2. `useSSL=false` 是为了避免本地开发环境因缺少 SSL 证书配置而连接失败或报警告；`serverTimezone` 是为了明确时区，避免日期时间字段出现时区错位（比如差 8 小时）。
3. 配置 JDBC 驱动类的完整类路径，告诉 Spring Boot 用哪个"翻译官"（驱动实现）去连接对应类型的数据库。
</details>

## 本章总结
你已经理解了"连接数据库"背后的网络连接本质，并学会了配置 `spring.datasource` 让 Spring Boot 项目连上本地 MySQL。下一章开始学习 JDBC 和 MyBatis——真正通过 Java 代码发送 SQL、拿到结果。
