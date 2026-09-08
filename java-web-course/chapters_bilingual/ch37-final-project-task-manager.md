# 第 37 章　最终项目：Task 管理系统完整 CRUD（含基础分页） ／ 第37章　最終プロジェクト：Task管理システムの一通りのCRUD（基本的なページネーションを含む）

## 本章目标 ／ 本章の目標
把从第 1 章到第 36 章学过的所有东西——Java 语法、HTTP、Spring Boot、MyBatis-Plus、DTO、参数校验、全局异常处理、日志、事务、自动化测试——全部用在同一个项目里，独立搭建一个可以真实运行的"Task 管理系统"后端接口，并且亲手实现一个带分页的列表接口。

> 🇯🇵 第1章から第36章まで学んできたすべてのこと——Java の文法、HTTP、Spring Boot、MyBatis-Plus、DTO（Data Transfer Object、外部とやり取りするためのデータの入れ物）、パラメータ検証、グローバル例外処理、ログ、トランザクション、自動テスト——を一つのプロジェクトにすべて注ぎ込み、実際に動く「Task 管理システム」のバックエンド API を独力で構築し、さらにページネーション（一覧を複数ページに分けて返す仕組み）付きの一覧 API を自分の手で実装します。

## 一句话理解 ／ 一言で理解する
这一章不学任何新知识点，只做一件事：把之前分散在各章节的知识拼成一个完整的、能跑起来的企业级项目雏形。

> 🇯🇵 この章では新しい知識点は一切学びません。やることはただ一つ、これまでの各章に散らばっていた知識を組み合わせて、完全な、実際に動くエンタープライズレベルのプロジェクトの原型を作り上げることです。

## 为什么需要它 ／ なぜ必要なのか
前三个阶段项目（Hello Spring Boot、内存版 User API、MySQL User CRUD）都是"单点验证"——每次只验证一小块新知识。但真实项目里，Controller、Service、Mapper、DTO、异常处理、分页、测试都要同时存在、互相配合。这一章的价值就是让你亲手体验一次"从 0 到能跑"的完整搭建过程，之后遇到任何企业项目的后端代码，你都能看出它的骨架和这个项目是同一套逻辑。

> 🇯🇵 これまでの3つの段階プロジェクト（Hello Spring Boot、メモリ版 User API、MySQL User CRUD）はすべて「単一項目の検証」でした——毎回、小さな一つの新しい知識だけを検証してきました。しかし実際のプロジェクトでは、Controller、Service、Mapper、DTO、例外処理、ページネーション、テストがすべて同時に存在し、互いに連携する必要があります。この章の価値は、あなたに「ゼロから動くようになるまで」の完全な構築プロセスを自分の手で体験させることです。これ以降、どんな企業プロジェクトのバックエンドコードに出会っても、その骨格がこのプロジェクトと同じロジックであることが見抜けるようになります。

## 核心概念 ／ コアコンセプト

### 37.1 整体架构图 ／ 全体アーキテクチャ図

下面这张图是本项目的分层结构。**特别注意图中标注**：哪些是 Spring / MyBatis / MyBatis-Plus / JUnit 的**官方注解或官方接口**（改了名字程序就不认了），哪些只是**企业项目里约定俗成的目录习惯**（改了名字完全不影响程序运行，只是大家习惯这么分）。

> 🇯🇵 下の図はこのプロジェクトの階層構造です。**図中の注記に特に注意してください**：どれが Spring / MyBatis / MyBatis-Plus / JUnit の**公式アノテーションまたは公式インターフェース**（名前を変えるとプログラムが認識できなくなるもの）で、どれが単に**企業プロジェクトで慣習的に使われているディレクトリの習わし**（名前を変えてもプログラムの動作には一切影響せず、みんなが慣習的にそう分けているだけのもの）なのかです。

```
┌─────────────┐   HTTP 请求（JSON）   ┌──────────────────────┐
│   Browser   │ ───────────────────▶ │   TaskController       │
│  / Postman  │ ◀─────────────────── │  （controller 包）      │
└─────────────┘   HTTP 响应（JSON）   └──────────┬────────────┘
                                                  │ 调用接口方法
                                                  ▼
                                       ┌──────────────────────┐
                                       │   TaskService          │
                                       │  （service 包，接口）   │
                                       └──────────┬────────────┘
                                                  │ 唯一实现类
                                                  ▼
                                       ┌──────────────────────┐
                                       │   TaskServiceImpl      │
                                       │ （service.impl 包）     │
                                       └──────────┬────────────┘
                                                  │ 构造器注入后调用
                                                  ▼
                                       ┌──────────────────────┐
                                       │   TaskMapper           │
                                       │  （mapper 包，接口）    │
                                       └──────────┬────────────┘
                                                  │ MyBatis 动态代理生成 SQL
                                                  ▼
                                       ┌──────────────────────┐
                                       │        MySQL            │
                                       │   user 表 / task 表      │
                                       └──────────────────────┘

横向支撑（不在主调用链上，但每一层都会用到）：
  entity/   —— User、Task，和数据库表一一对应
  dto/      —— TaskCreateRequest、TaskResponse、PageResult，和前端打交道，不直接暴露 entity
  exception/—— GlobalExceptionHandler，统一拦截所有 Controller 抛出的异常
  config/   —— MybatisPlusConfig，注册分页插件
```

**官方注解/官方接口（写错名字或漏掉程序就跑不起来）：**

> 🇯🇵 **公式アノテーション／公式インターフェース（名前を間違えたり、書き忘れたりするとプログラムが起動しません）：**

| 名称 ／ 名称 | 来源 ／ 由来 |
|---|---|
| `@RestController` `@RequestMapping` `@GetMapping` 等 | Spring MVC 官方注解<br><span class="ja-inline">🇯🇵 Spring MVC の公式アノテーション </span>|
| `@Service` | Spring 官方注解，标记这是一个要被容器管理的 Bean<br><span class="ja-inline">🇯🇵 Spring の公式アノテーションで、これがコンテナに管理される Bean（Spring コンテナが一元管理するオブジェクト）であることを示す </span>|
| `@Mapper` | MyBatis 官方注解，告诉 MyBatis 给这个接口生成代理实现<br><span class="ja-inline">🇯🇵 MyBatis の公式アノテーションで、このインターフェースに対してプロキシ実装を生成するよう MyBatis に指示する </span>|
| `BaseMapper<T>` | MyBatis-Plus 官方接口，提供现成的增删改查方法<br><span class="ja-inline">🇯🇵 MyBatis-Plus の公式インターフェースで、既製の CRUD（作成・参照・更新・削除）メソッドを提供する </span>|
| `@RestControllerAdvice` `@ExceptionHandler` | Spring MVC 官方注解，统一异常处理<br><span class="ja-inline">🇯🇵 Spring MVC の公式アノテーションで、例外を一括処理する </span>|
| `@Valid` `@NotBlank` `@NotNull` | Jakarta Bean Validation 官方注解<br><span class="ja-inline">🇯🇵 Jakarta Bean Validation の公式アノテーション </span>|
| `@Test` | JUnit 5 官方注解<br><span class="ja-inline">🇯🇵 JUnit 5（Java の単体テストフレームワーク）の公式アノテーション </span>|
| `@WebMvcTest` `@MockitoBean` | Spring Boot Test 官方注解<br><span class="ja-inline">🇯🇵 Spring Boot Test の公式アノテーション </span>|

**企业常见目录/命名约定（改了名字程序照样能跑，只是大家看不懂）：**

> 🇯🇵 **企業でよく見る目录（ディレクトリ）／命名の慣習（名前を変えてもプログラムは変わらず動きますが、他の人が理解できなくなるだけです）：**

| 约定 ／ 慣習 | 说明 ／ 説明 |
|---|---|
| `controller` / `service` / `service.impl` / `mapper` / `entity` / `dto` / `exception` / `config` 这几个包名 | Spring 不强制任何包名，纯粹是团队协作的习惯，方便"看包名就知道这是哪一层"<br><span class="ja-inline">🇯🇵 Spring はいかなるパッケージ名も強制しません。純粋にチームでの協業上の習慣であり、「パッケージ名を見ればどの層か分かる」ようにするためのものです </span>|
| Service 拆成"接口 + `impl` 实现类" | 面向接口编程的企业习惯，方便未来换实现或写测试替身，Spring 本身不要求这么做（一个 Service 类直接标 `@Service` 也完全合法）<br><span class="ja-inline">🇯🇵 インターフェース指向プログラミングという企業の習慣で、将来実装を差し替えたりテスト用の代替品を書いたりしやすくするためのものです。Spring 自体はこうすることを要求していません（Service クラス一つに直接 `@Service` を付けるのも完全に正しいやり方です） </span>|
| `TaskCreateRequest` / `TaskResponse` / `PageResult` 这类命名 | DTO 命名没有全行业统一标准，第 30 章已经讲过，这里延续同一套命名思路<br><span class="ja-inline">🇯🇵 DTO の命名には業界全体で統一された標準はなく、第30章ですでに説明した通り、ここでも同じ命名の考え方を踏襲しています </span>|

### 37.2 项目目录结构 ／ プロジェクトのディレクトリ構造

```
task-manager/
├── pom.xml
├── src/main/java/com/example/taskmanager/
│   ├── TaskManagerApplication.java      # 入口
│   ├── controller/
│   │   ├── UserController.java
│   │   └── TaskController.java          # 含 GET /tasks?page=&size=
│   ├── service/
│   │   ├── UserService.java             # 接口
│   │   └── TaskService.java
│   ├── service/impl/
│   │   ├── UserServiceImpl.java         # 实现类
│   │   └── TaskServiceImpl.java
│   ├── mapper/
│   │   ├── UserMapper.java              # @Mapper 接口，继承 BaseMapper<User>
│   │   └── TaskMapper.java              # 继承 BaseMapper<Task>，用于分页
│   ├── entity/
│   │   ├── User.java
│   │   └── Task.java
│   ├── dto/
│   │   ├── UserCreateRequest.java
│   │   ├── UserResponse.java
│   │   ├── TaskCreateRequest.java
│   │   ├── TaskResponse.java
│   │   └── PageResult.java              # 封装 page/size/total/records
│   ├── exception/
│   │   ├── ResourceNotFoundException.java
│   │   └── GlobalExceptionHandler.java  # @RestControllerAdvice
│   └── config/
│       └── MybatisPlusConfig.java       # 分页插件配置
├── src/main/resources/
│   └── application.yml
└── src/test/java/com/example/taskmanager/
    ├── TaskServiceTest.java             # 普通单元测试概念示例（不启动 Spring）
    └── TaskControllerTest.java          # HTTP 层测试概念示例，验证 GET /tasks 能成功返回
```

## 图解 ／ 図解

本章不新增调用链知识，直接复用全教程的标准链路图，在"程序运行过程"里会对照本项目的真实类名走一遍：

> 🇯🇵 この章では呼び出し連鎖に関する新しい知識は追加せず、全チュートリアルの標準的な連鎖図をそのまま使い回します。「プログラムの実行の流れ」のセクションで、このプロジェクトの実際のクラス名と照らし合わせながら一通り辿ります。

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

## 最小示例 ／ 最小限のサンプル

### 37.3 建库建表 SQL ／ データベース・テーブル作成 SQL

```sql
CREATE DATABASE IF NOT EXISTS task_manager DEFAULT CHARACTER SET utf8mb4;

USE task_manager;

CREATE TABLE user (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    username    VARCHAR(50)  NOT NULL,
    email       VARCHAR(100) NOT NULL,
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE task (
    id          BIGINT PRIMARY KEY AUTO_INCREMENT,
    title       VARCHAR(200) NOT NULL,
    description VARCHAR(1000),
    status      VARCHAR(20)  NOT NULL DEFAULT 'TODO',
    user_id     BIGINT       NOT NULL,
    create_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES user(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入一条测试用户，方便后面测接口
INSERT INTO user (username, email) VALUES ('alice', 'alice@example.com');
```

`task.user_id` 用外键关联 `user.id`：一个用户可以有多个任务，一个任务只属于一个用户（一对多关系，第 24 章讲过的"外键"在这里第一次真正落地）。

> 🇯🇵 `task.user_id` は外部キー（テーブル間の関連を保証する制約）で `user.id` に紐づけられています。一人のユーザーは複数のタスクを持つことができ、一つのタスクは一人のユーザーにしか属しません（一対多の関係で、第24章で学んだ「外部キー」がここで初めて実際に使われます）。

### 37.4 pom.xml（完整文件） ／ pom.xml（完全なファイル）

依赖版本严格按全教程锁定的版本表，一个都不能变：

> 🇯🇵 依存関係のバージョンは全チュートリアルで固定したバージョン表に厳密に従い、一つも変更してはいけません。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
        <relativePath/>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>task-manager</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>task-manager</name>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Web 层：内嵌 Tomcat + Spring MVC，版本由 Spring Boot BOM 统一管理 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>

        <!-- 参数校验：@Valid/@NotNull/@NotBlank，版本由 BOM 统一管理 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- MyBatis-Plus 的 Spring Boot 4 专用 starter，第 28 章确认并锁定的坐标和版本。
             它内部已经包含了运行 MyBatis 所需的核心能力，不需要再单独引入
             org.mybatis.spring.boot:mybatis-spring-boot-starter（那是第 27 章
             单独学习"原生 MyBatis"时用的坐标，只在只用原生 MyBatis、不用
             MyBatis-Plus 的项目里才需要）。 -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot4-starter</artifactId>
            <version>3.5.17</version>
        </dependency>

        <!-- 分页插件 PaginationInnerInterceptor 依赖的 SQL 解析能力，从 MyBatis-Plus
             3.5.9 开始被拆分成了独立的可选模块；本章用到分页查询，所以必须单独引入，
             版本号和上面的 starter 保持一致 -->
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-jsqlparser</artifactId>
            <version>3.5.17</version>
        </dependency>

        <!-- MySQL 驱动，版本由 BOM 统一管理 -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- 测试：JUnit 5 + Spring Boot Test + MockMvc，版本由 BOM 统一管理 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Spring Boot 4 把 Spring MVC 专用的测试支持拆分到了独立模块
             spring-boot-webmvc-test / spring-boot-starter-webmvc-test 里。
             本项目的 TaskControllerTest 用到了 @WebMvcTest，所以这里显式引入
             这个 starter，让 Spring MVC 测试相关的依赖关系清晰、明确，
             版本同样由 BOM 统一管理 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

小提醒：`mybatis-plus-spring-boot4-starter` 内部已经传递依赖了 MyBatis 相关的包，所以最终项目**只保留这一个 starter**，不再像第 27 章那样单独引入 `mybatis-spring-boot-starter`——那是当时为了单独学习"原生 MyBatis 怎么工作"才引入的，真实项目里如果用了 MyBatis-Plus，通常不会两个 starter 一起引入。另外要注意，`PaginationInnerInterceptor`（本章要用到的分页插件）依赖的 SQL 解析能力从 MyBatis-Plus 3.5.9 版本开始被拆分成了独立的 `mybatis-plus-jsqlparser` 模块——**只做普通增删改查不需要它，但只要用到分页插件就必须额外引入**，所以上面的 pom.xml 里专门加了这一条。

> 🇯🇵 ちょっとした注意：`mybatis-plus-spring-boot4-starter` はすでに内部で MyBatis 関連のパッケージを推移的に依存しているため、最終プロジェクトでは**この starter 一つだけを残します**。第27章のように別途 `mybatis-spring-boot-starter` を引き込む必要はもうありません——あれは当時「素の MyBatis がどう動くか」を単独で学ぶために導入したもので、実際のプロジェクトで MyBatis-Plus を使う場合、通常は2つの starter を同時に導入することはありません。また、注意すべき点として、`PaginationInnerInterceptor`（本章で使うページネーションプラグイン）が依存する SQL 解析機能は、MyBatis-Plus 3.5.9 から独立した `mybatis-plus-jsqlparser` モジュールに分割されました——**普通の CRUD だけならこれは不要ですが、ページネーションプラグインを使うなら必ず追加で導入する必要があります**。そのため、上記の pom.xml にはこの一項目を特別に追加してあります。

### 37.5 配置文件 `application.yml` ／ 設定ファイル `application.yml`

```yaml
server:
  port: 8080

spring:
  application:
    name: task-manager
  datasource:
    url: jdbc:mysql://localhost:3306/task_manager?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: 你的数据库密码
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true   # 数据库 user_id ↔ Java 字段 userId 自动映射
```

### 37.6 entity（实体类，与数据库表一一对应） ／ entity（データベースのテーブルと一対一で対応する実体クラス）

`entity/User.java`
```java
package com.example.taskmanager.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String username;

    private String email;

    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
```

`entity/Task.java`
```java
package com.example.taskmanager.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

import java.time.LocalDateTime;

@TableName("task")
public class Task {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String title;

    private String description;

    private String status; // TODO / DOING / DONE

    private Long userId;

    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
    public LocalDateTime getUpdateTime() { return updateTime; }
    public void setUpdateTime(LocalDateTime updateTime) { this.updateTime = updateTime; }
}
```

### 37.7 dto（和前端打交道，不直接暴露 entity） ／ dto（フロントエンドとやり取りする。entity をそのまま公開しない）

`dto/UserCreateRequest.java`
```java
package com.example.taskmanager.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserCreateRequest {

    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

`dto/UserResponse.java`
```java
package com.example.taskmanager.dto;

import java.time.LocalDateTime;

public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
```

`dto/TaskCreateRequest.java`
```java
package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TaskCreateRequest {

    @NotBlank(message = "标题不能为空")
    private String title;

    private String description;

    @NotNull(message = "userId 不能为空")
    private Long userId;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
```

`dto/TaskResponse.java`
```java
package com.example.taskmanager.dto;

import java.time.LocalDateTime;

public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private Long userId;
    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
```

`dto/PageResult.java`（本章新增，专门用来包装分页结果）
> 🇯🇵 `dto/PageResult.java`（本章で新たに追加。ページネーションの結果を包むための専用クラス）
```java
package com.example.taskmanager.dto;

import java.util.List;

public class PageResult<T> {

    private long page;   // 当前第几页
    private long size;   // 每页几条
    private long total;  // 总条数
    private List<T> records; // 当前页的数据

    public PageResult() {
    }

    public PageResult(long page, long size, long total, List<T> records) {
        this.page = page;
        this.size = size;
        this.total = total;
        this.records = records;
    }

    public long getPage() { return page; }
    public void setPage(long page) { this.page = page; }
    public long getSize() { return size; }
    public void setSize(long size) { this.size = size; }
    public long getTotal() { return total; }
    public void setTotal(long total) { this.total = total; }
    public List<T> getRecords() { return records; }
    public void setRecords(List<T> records) { this.records = records; }
}
```

### 37.8 mapper（接口，MyBatis 动态代理） ／ mapper（インターフェース、MyBatis の動的プロキシ）

`mapper/UserMapper.java`
```java
package com.example.taskmanager.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.taskmanager.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
```

`mapper/TaskMapper.java`
```java
package com.example.taskmanager.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.taskmanager.entity.Task;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TaskMapper extends BaseMapper<Task> {
}
```

两个接口都没有任何方法体，也没有实现类——这是第 27～28 章讲过的 MyBatis 动态代理机制：程序启动时，MyBatis 扫描到这些接口，为它们生成一个"代理对象"，注册成 Spring Bean。`BaseMapper<T>` 已经提供了 `insert`/`deleteById`/`updateById`/`selectById`/`selectList`/`selectPage` 等一整套现成方法，不用我们写一行 SQL。

> 🇯🇵 この2つのインターフェースにはメソッドの本体が一つもなく、実装クラスもありません——これは第27～28章で説明した MyBatis の動的プロキシの仕組みです。プログラム起動時、MyBatis がこれらのインターフェースをスキャンし、それぞれに「プロキシオブジェクト」を生成して Spring Bean として登録します。`BaseMapper<T>` はすでに `insert`/`deleteById`/`updateById`/`selectById`/`selectList`/`selectPage` などの一式の既製メソッドを提供しており、私たちは SQL を一行も書く必要がありません。

### 37.9 config（分页插件配置） ／ config（ページネーションプラグインの設定）

`config/MybatisPlusConfig.java`
```java
package com.example.taskmanager.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MybatisPlusConfig {

    /**
     * 注册 MyBatis-Plus 的分页插件。
     * 没有这个 Bean，调用 selectPage() 只会把所有数据一次性查出来，
     * page/size 参数完全不生效——这是初学者最容易踩的坑。
     */
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

**本章明确说明边界**：分页插件内部是怎么把一条 `SELECT * FROM task LIMIT ?, ?` 自动拼出来的、`COUNT` 语句是怎么优化的、数据量很大时"深分页"（比如翻到第 10000 页）为什么会变慢、游标分页怎么做——这些都属于性能优化范畴，本教程**不深入**，目标只是"会配置这个插件、会用 `IPage`/`Page`、看得懂返回结构里的 `page/size/total/records`"。

> 🇯🇵 **本章で明確にしておく範囲**：ページネーションプラグインが内部でどのように `SELECT * FROM task LIMIT ?, ?` を自動的に組み立てているのか、`COUNT` 文がどう最適化されているのか、データ量が非常に多いときに「深いページ送り」（例えば第10000ページまでめくる）がなぜ遅くなるのか、カーソルページネーションはどうやるのか——これらはすべてパフォーマンス最適化の範疇であり、本チュートリアルでは**深く扱いません**。目標はあくまで「このプラグインを設定できる、`IPage`/`Page` を使える、返却構造の中の `page/size/total/records` が読める」ことです。

### 37.10 service（业务逻辑层） ／ service（ビジネスロジック層）

`service/UserService.java`
```java
package com.example.taskmanager.service;

import com.example.taskmanager.dto.UserCreateRequest;
import com.example.taskmanager.dto.UserResponse;

public interface UserService {
    UserResponse createUser(UserCreateRequest request);
    UserResponse getUserById(Long id);
}
```

`service/impl/UserServiceImpl.java`
```java
package com.example.taskmanager.service.impl;

import com.example.taskmanager.dto.UserCreateRequest;
import com.example.taskmanager.dto.UserResponse;
import com.example.taskmanager.entity.User;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.mapper.UserMapper;
import com.example.taskmanager.service.UserService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    // 构造器注入，第 16 章学过：不用 @Autowired，Spring 看到"只有一个构造方法"会自动注入
    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public UserResponse createUser(UserCreateRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setCreateTime(LocalDateTime.now());
        userMapper.insert(user);
        return toResponse(user);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userMapper.selectById(id);
        if (user == null) {
            throw new ResourceNotFoundException("用户不存在，id=" + id);
        }
        return toResponse(user);
    }

    public UserResponse toResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setCreateTime(user.getCreateTime());
        return response;
    }
}
```

`service/TaskService.java`
```java
package com.example.taskmanager.service;

import com.example.taskmanager.dto.PageResult;
import com.example.taskmanager.dto.TaskCreateRequest;
import com.example.taskmanager.dto.TaskResponse;

public interface TaskService {
    TaskResponse createTask(TaskCreateRequest request);
    TaskResponse getTaskById(Long id);
    TaskResponse updateTask(Long id, TaskCreateRequest request);
    void deleteTask(Long id);
    PageResult<TaskResponse> listTasks(long page, long size);
}
```

`service/impl/TaskServiceImpl.java`（本项目的核心，含分页查询）
> 🇯🇵 `service/impl/TaskServiceImpl.java`（このプロジェクトの中核であり、ページネーションクエリを含みます）
```java
package com.example.taskmanager.service.impl;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.taskmanager.dto.PageResult;
import com.example.taskmanager.dto.TaskCreateRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.service.TaskService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskMapper taskMapper;

    // 构造器注入 TaskMapper：Spring 容器启动时，MyBatis 已经把 TaskMapper 的
    // 代理对象注册成了 Bean，这里 Spring 直接把它塞进来，我们不用 new
    public TaskServiceImpl(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }

    @Override
    public TaskResponse createTask(TaskCreateRequest request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setUserId(request.getUserId());
        task.setStatus("TODO");
        task.setCreateTime(LocalDateTime.now());
        task.setUpdateTime(LocalDateTime.now());
        taskMapper.insert(task); // BaseMapper 提供的现成方法，自动生成 INSERT 语句
        return toResponse(task);
    }

    @Override
    public TaskResponse getTaskById(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new ResourceNotFoundException("任务不存在，id=" + id);
        }
        return toResponse(task);
    }

    @Override
    public TaskResponse updateTask(Long id, TaskCreateRequest request) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new ResourceNotFoundException("任务不存在，id=" + id);
        }
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setUserId(request.getUserId());
        task.setUpdateTime(LocalDateTime.now());
        taskMapper.updateById(task);
        return toResponse(task);
    }

    @Override
    public void deleteTask(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new ResourceNotFoundException("任务不存在，id=" + id);
        }
        taskMapper.deleteById(id);
    }

    @Override
    public PageResult<TaskResponse> listTasks(long page, long size) {
        // Page<Task> 是 MyBatis-Plus 提供的分页参数对象：page 表示第几页（从 1 开始），size 表示每页几条
        Page<Task> pageParam = new Page<>(page, size);

        // selectPage 是 BaseMapper 提供的分页查询方法；第二个参数是查询条件，
        // 这里传 null 表示"不加任何过滤条件，查全部"
        Page<Task> resultPage = taskMapper.selectPage(pageParam, null);

        List<TaskResponse> records = resultPage.getRecords().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        // getCurrent()/getSize()/getTotal() 都是分页插件帮我们自动算好的
        return new PageResult<>(resultPage.getCurrent(), resultPage.getSize(), resultPage.getTotal(), records);
    }

    // 声明为 public 方便在 TaskServiceTest 里直接测试这一小段纯逻辑，不用连数据库
    public TaskResponse toResponse(Task task) {
        TaskResponse response = new TaskResponse();
        response.setId(task.getId());
        response.setTitle(task.getTitle());
        response.setDescription(task.getDescription());
        response.setStatus(task.getStatus());
        response.setUserId(task.getUserId());
        response.setCreateTime(task.getCreateTime());
        return response;
    }
}
```

### 37.11 controller（RESTful 路由） ／ controller（RESTful ルーティング）

`controller/UserController.java`
```java
package com.example.taskmanager.controller;

import com.example.taskmanager.dto.UserCreateRequest;
import com.example.taskmanager.dto.UserResponse;
import com.example.taskmanager.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public UserResponse create(@Valid @RequestBody UserCreateRequest request) {
        return userService.createUser(request);
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return userService.getUserById(id);
    }
}
```

`controller/TaskController.java`（本章重点，含分页接口）
> 🇯🇵 `controller/TaskController.java`（本章の重点であり、ページネーション API を含みます）
```java
package com.example.taskmanager.controller;

import com.example.taskmanager.dto.PageResult;
import com.example.taskmanager.dto.TaskCreateRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskResponse create(@Valid @RequestBody TaskCreateRequest request) {
        return taskService.createTask(request);
    }

    @GetMapping("/{id}")
    public TaskResponse getById(@PathVariable Long id) {
        return taskService.getTaskById(id);
    }

    @PutMapping("/{id}")
    public TaskResponse update(@PathVariable Long id, @Valid @RequestBody TaskCreateRequest request) {
        return taskService.updateTask(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        taskService.deleteTask(id);
    }

    // GET /tasks?page=1&size=20
    // page/size 都用 @RequestParam 接收（第 22 章讲过：查询参数用 @RequestParam，路径参数用 @PathVariable）
    @GetMapping
    public PageResult<TaskResponse> list(
            @RequestParam(defaultValue = "1") long page,
            @RequestParam(defaultValue = "20") long size) {
        return taskService.listTasks(page, size);
    }
}
```

### 37.12 exception（全局异常处理，复用第 32 章思路） ／ exception（グローバル例外処理、第32章の考え方を踏襲）

`exception/ResourceNotFoundException.java`
```java
package com.example.taskmanager.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

`exception/GlobalExceptionHandler.java`
```java
package com.example.taskmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 任务/用户不存在 → 返回 404，而不是让 Spring 默认抛出 500
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", 404);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // @Valid 校验失败 → 返回 400，并把第一条校验错误信息带回去
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", 400);
        body.put("message", ex.getBindingResult().getFieldError().getDefaultMessage());
        return ResponseEntity.badRequest().body(body);
    }
}
```

`GlobalExceptionHandler` 是唯一一个不放在 `controller`/`service`/`mapper` 任何一层里的类，但它能拦截**所有** Controller 抛出的异常——这就是 `@RestControllerAdvice` 的作用：不需要每个 Controller 方法自己写 try-catch。

> 🇯🇵 `GlobalExceptionHandler` は `controller`/`service`/`mapper` のどの層にも属さない唯一のクラスですが、**すべての** Controller が投げる例外を捕捉できます——これが `@RestControllerAdvice` の役割です。各 Controller メソッドが自分で try-catch を書く必要がなくなります。

### 37.13 测试代码（呼应第 36 章） ／ テストコード（第36章と対応）

第 36 章讲过：测试不是只能用 `@SpringBootTest` 测整个项目，Controller、Service、Mapper 都可以独立测试。这里给出两个层次的例子。

> 🇯🇵 第36章で説明した通り、テストは `@SpringBootTest` でプロジェクト全体をテストするだけではなく、Controller、Service、Mapper はそれぞれ独立してテストできます。ここでは2つの階層の例を示します。

`src/test/java/com/example/taskmanager/TaskServiceTest.java`（普通单元测试，不启动 Spring，也不连数据库）
> 🇯🇵 `src/test/java/com/example/taskmanager/TaskServiceTest.java`（普通の単体テストで、Spring も起動せず、データベースにも接続しません）
```java
package com.example.taskmanager;

import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TaskServiceTest {

    @Test
    void toResponse_shouldMapAllFields() {
        // Arrange：这里故意传 null 给构造方法，因为 toResponse() 这个方法
        // 根本不会用到 TaskMapper，所以完全不需要启动 Spring、也不需要连数据库
        TaskServiceImpl taskService = new TaskServiceImpl(null);

        Task task = new Task();
        task.setId(1L);
        task.setTitle("学习 Spring Boot");
        task.setDescription("完成最终项目");
        task.setStatus("TODO");
        task.setUserId(100L);
        task.setCreateTime(LocalDateTime.of(2026, 1, 1, 10, 0));

        // Act
        TaskResponse response = taskService.toResponse(task);

        // Assert
        assertEquals(1L, response.getId());
        assertEquals("学习 Spring Boot", response.getTitle());
        assertEquals("TODO", response.getStatus());
        assertEquals(100L, response.getUserId());
    }
}
```

`src/test/java/com/example/taskmanager/TaskControllerTest.java`（HTTP 层测试，验证 `GET /tasks` 能成功返回）
> 🇯🇵 `src/test/java/com/example/taskmanager/TaskControllerTest.java`（HTTP 層のテストで、`GET /tasks` が正常に返却できることを検証します）
```java
package com.example.taskmanager;

import com.example.taskmanager.controller.TaskController;
import com.example.taskmanager.dto.PageResult;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

// @WebMvcTest 只启动 Web 层相关的 Bean（Controller、参数校验、异常处理等），
// 不会真正连接数据库，速度比 @SpringBootTest 启动全部 Bean 快很多
@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc; // 模拟发 HTTP 请求，不需要真的启动 Tomcat 监听端口

    @MockitoBean
    private TaskService taskService; // 给 Controller 用的是一个"假的" Service，不是真实实现

    @Test
    void getTasks_shouldReturn200AndPageStructure() throws Exception {
        // Arrange：编排"假的" Service 应该返回什么
        TaskResponse task = new TaskResponse();
        task.setId(1L);
        task.setTitle("学习 Spring Boot");
        PageResult<TaskResponse> fakePage = new PageResult<>(1, 20, 1, List.of(task));
        given(taskService.listTasks(1, 20)).willReturn(fakePage);

        // Act & Assert：真正发一个 GET 请求进 Controller，检查返回的 JSON 结构
        mockMvc.perform(get("/tasks?page=1&size=20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.records[0].title").value("学习 Spring Boot"));
    }
}
```

小提醒：这里用到的 `@MockitoBean` 背后确实是 Mockito 框架（Spring Boot Test 已经内置，不用额外加依赖），作用是"造一个假的 TaskService，让 Controller 测试不用真的连数据库"。第 36 章明确说过不深入 Mockito，这里只是让你知道 Controller 层测试**长什么样**、以及它和 Service 层单元测试的区别在哪——Mockito 的完整用法留到第 38 章指路，属于后续进阶内容。

> 🇯🇵 ちょっとした注意：ここで使われている `@MockitoBean`（Spring Boot Test にすでに組み込まれており、追加の依存関係は不要です）の背後には Mockito フレームワークがあり、その役割は「偽物の TaskService を作り、Controller のテストで本当にデータベースに接続しなくて済むようにする」ことです。第36章で明言した通り Mockito は深く扱いませんが、ここでは Controller 層のテストが**どんな形をしているか**、そして Service 層の単体テストとの違いがどこにあるかを知ってもらうだけです——Mockito の完全な使い方は第38章の道しるべで触れる、今後のステップアップ内容です。

## 代码逐行解释 ／ コードの行ごとの解説

挑几处最容易看不懂的地方讲一下：

> 🇯🇵 最も分かりにくいポイントをいくつか選んで説明します。

- `@TableName("user")` / `@TableId(type = IdType.AUTO)`：MyBatis-Plus 官方注解，告诉框架"这个类对应哪张表"、"主键是哪个字段、用什么方式生成"（`AUTO` 表示交给数据库自增）。没有这两个注解，MyBatis-Plus 会按类名/字段名的驼峰转下划线规则去猜表名和列名，猜不中就会报错。<br><span class="ja-inline">🇯🇵 `@TableName("user")` / `@TableId(type = IdType.AUTO)`：MyBatis-Plus の公式アノテーションで、「このクラスがどのテーブルに対応するか」「主キーはどのフィールドで、どんな方式で生成するか」（`AUTO` はデータベースの自動採番に任せることを意味します）をフレームワークに伝えます。この2つのアノテーションがないと、MyBatis-Plus はクラス名/フィールド名をキャメルケースからスネークケースに変換するルールでテーブル名や列名を推測しようとし、推測が外れるとエラーになります。</span>
- `TaskServiceImpl` 的构造方法只接收 `TaskMapper`：因为它只依赖 Mapper，不依赖任何其他 Service。整个项目里 `TaskServiceImpl` 和 `UserServiceImpl` 是互相独立的，没有互相调用——这是刻意的简化，真实项目里"任务必须属于一个已存在的用户"这种校验，往往需要 `TaskServiceImpl` 再注入 `UserMapper` 或 `UserService` 去检查，本教程为了不引入新概念，这里从简，把校验留给数据库外键去兜底（插入一个不存在的 `user_id` 会直接报外键约束错误）。<br><span class="ja-inline">🇯🇵 `TaskServiceImpl` のコンストラクタが `TaskMapper` だけを受け取るのは、それが Mapper だけに依存し、他の Service には一切依存していないからです。プロジェクト全体で `TaskServiceImpl` と `UserServiceImpl` は互いに独立しており、互いを呼び出し合うことはありません——これは意図的な簡略化です。実際のプロジェクトでは「タスクは既存のユーザーに属していなければならない」といった検証のために、`TaskServiceImpl` がさらに `UserMapper` や `UserService` を注入してチェックすることがよくありますが、本チュートリアルでは新しい概念を持ち込まないよう、ここでは簡略化し、検証をデータベースの外部キーに任せています（存在しない `user_id` を挿入すると、外部キー制約エラーが直接発生します）。</span>
- `taskMapper.selectPage(pageParam, null)`：第二个参数类型是 `Wrapper<Task>`（查询条件构造器），MyBatis-Plus 里专门用来拼 `WHERE` 条件，本章不需要过滤条件所以传 `null`。以后要做"只查某个用户的任务"这种需求，就是在这里传一个 `Wrapper`。<br><span class="ja-inline">🇯🇵 `taskMapper.selectPage(pageParam, null)`：第2引数の型は `Wrapper<Task>`（クエリ条件ビルダー）で、MyBatis-Plus の中で `WHERE` 条件を組み立てるために使われます。本章ではフィルタ条件が不要なので `null` を渡しています。今後「あるユーザーのタスクだけを検索する」といった要件を実装するときは、ここに `Wrapper` を渡すことになります。</span>
- `resultPage.getCurrent()`：注意分页插件返回的字段名是 `current` 不是 `page`，我们在 `PageResult` 里统一改名成 `page`，这也是 DTO 的作用之一——把底层库的字段名"翻译"成对前端更友好、更稳定的字段名，前端完全不需要知道我们用的是 MyBatis-Plus。<br><span class="ja-inline">🇯🇵 `resultPage.getCurrent()`：ページネーションプラグインが返すフィールド名は `page` ではなく `current` であることに注意してください。私たちは `PageResult` の中で統一して `page` という名前に変えています。これも DTO の役割の一つです——下層のライブラリのフィールド名を、フロントエンドにとってより分かりやすく、より安定したフィールド名に「翻訳」することです。フロントエンドは私たちが MyBatis-Plus を使っていることをまったく知る必要がありません。</span>

## 程序运行过程 ／ プログラムの実行の流れ

### 37.14 运行步骤 ／ 実行手順

1. **建库建表**：在 MySQL 里执行 37.3 的 SQL，确认 `task_manager` 库下有 `user` 表和 `task` 表，并且 `user` 表里已经有一条 `id=1` 的测试数据。<br><span class="ja-inline">🇯🇵 **データベース・テーブルの作成**：MySQL で37.3の SQL を実行し、`task_manager` データベースの下に `user` テーブルと `task` テーブルが存在し、`user` テーブルにはすでに `id=1` のテストデータが1件あることを確認します。</span>
2. **配置 `application.yml`**：把 37.5 里的用户名密码改成你本机 MySQL 的真实账号密码。<br><span class="ja-inline">🇯🇵 **`application.yml` の設定**：37.5 のユーザー名・パスワードを、あなたのローカル MySQL の実際のアカウント・パスワードに変更します。</span>
3. **启动项目**：在 IDEA 里运行 `TaskManagerApplication` 的 `main` 方法（或命令行 `mvn spring-boot:run`），控制台看到 `Tomcat started on port 8080` 说明启动成功。<br><span class="ja-inline">🇯🇵 **プロジェクトの起動**：IDEA で `TaskManagerApplication` の `main` メソッドを実行する（またはコマンドラインで `mvn spring-boot:run`）と、コンソールに `Tomcat started on port 8080` と表示されれば起動成功です。</span>
4. **用 curl 依次测试每个接口**：<br><span class="ja-inline">🇯🇵 **curl で各 API を順にテストする**：</span>

创建任务：
> 🇯🇵 タスクを作成：
```bash
curl -X POST http://localhost:8080/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"学习 Spring Boot","description":"完成最终项目","userId":1}'
```
返回：
> 🇯🇵 返却：
```json
{"id":1,"title":"学习 Spring Boot","description":"完成最终项目","status":"TODO","userId":1,"createTime":"2026-09-06T10:00:00"}
```

查询单个任务：
> 🇯🇵 単一のタスクを検索：
```bash
curl http://localhost:8080/tasks/1
```

修改任务：
> 🇯🇵 タスクを修正：
```bash
curl -X PUT http://localhost:8080/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"学习 Spring Boot（已修改）","description":"完成最终项目","userId":1}'
```

删除任务：
> 🇯🇵 タスクを削除：
```bash
curl -X DELETE http://localhost:8080/tasks/1
```

查询不存在的任务（验证全局异常处理）：
> 🇯🇵 存在しないタスクを検索（グローバル例外処理を検証）：
```bash
curl -i http://localhost:8080/tasks/999
```
返回 `404`：
> 🇯🇵 `404` を返却：
```json
{"status":404,"message":"任务不存在，id=999"}
```

**分页查询接口**（本章重点）：
> 🇯🇵 **ページネーションクエリ API**（本章の重点）：
```bash
curl "http://localhost:8080/tasks?page=1&size=20"
```
假设数据库里一共有 3 条任务，返回：
> 🇯🇵 データベースに合計3件のタスクがあると仮定すると、返却は：
```json
{
  "page": 1,
  "size": 20,
  "total": 3,
  "records": [
    {"id":1,"title":"学习 Spring Boot","description":"完成最终项目","status":"TODO","userId":1,"createTime":"2026-09-06T10:00:00"},
    {"id":2,"title":"写周报","description":null,"status":"TODO","userId":1,"createTime":"2026-09-06T10:05:00"},
    {"id":3,"title":"复习 MyBatis-Plus","description":null,"status":"DOING","userId":1,"createTime":"2026-09-06T10:10:00"}
  ]
}
```
如果把 `size` 改成 `2`（`GET /tasks?page=1&size=2`），`records` 里只会返回前 2 条，`total` 依然是 `3`——这正是分页的意义：一次请求不用把全部数据都传回来。

> 🇯🇵 もし `size` を `2` に変更すると（`GET /tasks?page=1&size=2`）、`records` には最初の2件しか返ってこず、`total` は依然として `3` のままです——これこそがページネーションの意義です。一度のリクエストで全データを返す必要がなくなります。

### 37.15 完整调用链回顾（全教程收官） ／ 完全な呼び出し連鎖の振り返り（チュートリアル全体の締めくくり）

以 **`GET /tasks/5`** 这一个具体请求为例，把全教程反复强调的调用链，对照本项目的真实类名、方法名，完整走一遍：

> 🇯🇵 **`GET /tasks/5`** という具体的なリクエストを例に、全チュートリアルで繰り返し強調してきた呼び出し連鎖を、このプロジェクトの実際のクラス名・メソッド名と照らし合わせながら、最初から最後まで一通り辿ってみましょう。

1. **Browser**（或 Postman）发出 `GET http://localhost:8080/tasks/5`。<br><span class="ja-inline">🇯🇵 **Browser**（または Postman）が `GET http://localhost:8080/tasks/5` を送信します。</span>
2. 请求先到达 **Tomcat**——Spring Boot 项目内嵌的 Tomcat，监听着 8080 端口（第 11、19 章讲过：不用像传统 Java Web 那样单独装一个 Tomcat 服务器）。<br><span class="ja-inline">🇯🇵 リクエストはまず **Tomcat**——Spring Boot プロジェクトに内蔵された Tomcat——に到達します。8080 ポートを監視しています（第11、19章で説明した通り、従来の Java Web のように別途 Tomcat サーバーをインストールする必要はありません）。</span>
3. Tomcat 把请求转交给 **DispatcherServlet**——Spring MVC 的统一入口，所有请求都先经过它（第 13、20 章讲过：这就是"从 Servlet 到 MVC"要解决的"统一分发"问题）。<br><span class="ja-inline">🇯🇵 Tomcat はリクエストを **DispatcherServlet**——Spring MVC の統一された入口——に転送します。すべてのリクエストはまずここを通過します（第13、20章で説明した通り、これが「Servlet から MVC へ」が解決しようとした「統一的なディスパッチ」の問題です）。</span>
4. DispatcherServlet 问 **HandlerMapping**："谁能处理 `GET /tasks/5`？" HandlerMapping 根据 `TaskController` 上的 `@RequestMapping("/tasks")` 和 `getById` 方法上的 `@GetMapping("/{id}")`，确定处理者是 `TaskController.getById` 方法，并且解析出路径变量 `id = 5`。<br><span class="ja-inline">🇯🇵 DispatcherServlet が **HandlerMapping** に「誰が `GET /tasks/5` を処理できるか」を尋ねます。HandlerMapping は `TaskController` に付いた `@RequestMapping("/tasks")` と `getById` メソッドに付いた `@GetMapping("/{id}")` に基づき、処理者が `TaskController.getById` メソッドであると特定し、パス変数 `id = 5` を解析します。</span>
5. HandlerMapping 把"找到的处理者"交给 **HandlerAdapter**，由它负责实际"调用"——包括把 URL 里的字符串 `"5"` 转换成 `Long` 类型，绑定到 `@PathVariable Long id` 参数上。<br><span class="ja-inline">🇯🇵 HandlerMapping は「見つかった処理者」を **HandlerAdapter** に渡し、実際の「呼び出し」はこちらが担当します——URL 中の文字列 `"5"` を `Long` 型に変換し、`@PathVariable Long id` パラメータにバインドすることも含みます。</span>
6. HandlerAdapter 反射调用：`taskController.getById(5L)`。<br><span class="ja-inline">🇯🇵 HandlerAdapter がリフレクションで `taskController.getById(5L)` を呼び出します。</span>
7. **TaskController** 是谁创建的？是 Spring 容器在项目启动时创建的——因为它标了 `@RestController`，被组件扫描到，构造方法需要一个 `TaskService`，Spring 发现容器里已经有一个 `TaskServiceImpl` 的 Bean（因为它标了 `@Service`），于是自动把它注入进 `TaskController` 的构造方法（第 15、16 章讲的 IoC/DI，在这里真正落地）。<br><span class="ja-inline">🇯🇵 **TaskController** は誰が作成したのでしょうか？プロジェクト起動時に Spring コンテナが作成しました——`@RestController` が付いているためコンポーネントスキャンで検出され、コンストラクタが `TaskService` を必要としています。Spring はコンテナ内にすでに `TaskServiceImpl` の Bean があること（`@Service` が付いているため）を発見し、それを自動的に `TaskController` のコンストラクタに注入します（第15、16章で学んだ IoC/DI が、ここで実際に使われています）。</span>
8. `TaskController.getById` 调用 `taskService.getTaskById(5L)`。<br><span class="ja-inline">🇯🇵 `TaskController.getById` が `taskService.getTaskById(5L)` を呼び出します。</span>
9. **TaskServiceImpl** 里调用 `taskMapper.selectById(5L)`。**Mapper 为什么只有 interface 也能工作？**——因为 `@Mapper` 注解让 MyBatis 在项目启动时，用动态代理技术为 `TaskMapper` 这个接口生成了一个"代理实现类"，并把这个代理对象注册成 Spring Bean，同样通过构造器注入进了 `TaskServiceImpl`。我们从没写过这个代理类的一行代码。<br><span class="ja-inline">🇯🇵 **TaskServiceImpl** 内で `taskMapper.selectById(5L)` を呼び出します。**なぜ Mapper は interface しかないのに動作するのか？**——`@Mapper` アノテーションにより、MyBatis がプロジェクト起動時に動的プロキシ技術を使って `TaskMapper` インターフェースに対して「プロキシ実装クラス」を生成し、このプロキシオブジェクトを Spring Bean として登録するからです。これも同じくコンストラクタインジェクションで `TaskServiceImpl` に注入されています。私たちはこのプロキシクラスのコードを一行も書いたことがありません。</span>
10. 代理对象根据 `BaseMapper` 预置的 SQL 模板，拼出 `SELECT * FROM task WHERE id = ?`，通过 JDBC 把这条 SQL 发送给 **MySQL** 执行。<br><span class="ja-inline">🇯🇵 プロキシオブジェクトは `BaseMapper` にあらかじめ組み込まれた SQL テンプレートに従って `SELECT * FROM task WHERE id = ?` を組み立て、JDBC を通じてこの SQL を **MySQL** に送信して実行します。</span>
11. MySQL 执行查询，把结果行返回。<br><span class="ja-inline">🇯🇵 MySQL がクエリを実行し、結果行を返します。</span>
12. MyBatis 把结果集"翻译"成一个 `Task` 对象（这就是 entity 存在的意义：Java 对象和数据库表行之间的映射），沿原路径 `Mapper → Service` 返回。<br><span class="ja-inline">🇯🇵 MyBatis が結果セットを `Task` オブジェクトに「翻訳」し（これが entity の存在意義です。Java オブジェクトとデータベースのテーブルの行との間のマッピングです）、来た経路 `Mapper → Service` を辿って返ります。</span>
13. `TaskServiceImpl.getTaskById` 判断：如果 `task == null`，抛出 `ResourceNotFoundException`；如果查到了，调用 `toResponse(task)` 把 `Task`（entity）转换成 `TaskResponse`（DTO）——**这一步就是第 30 章反复强调的"为什么不能直接把 entity 返回给前端"的真实体现**：万一 `Task` 以后新增了敏感字段，只要不加进 `TaskResponse`，就不会意外泄露给前端。<br><span class="ja-inline">🇯🇵 `TaskServiceImpl.getTaskById` が判定します。もし `task == null` なら `ResourceNotFoundException` を投げ、見つかっていれば `toResponse(task)` を呼び出して `Task`（entity）を `TaskResponse`（DTO）に変換します——**このステップこそが、第30章で繰り返し強調してきた「なぜ entity をそのままフロントエンドに返してはいけないのか」の実際の現れです**：万が一 `Task` に今後機密フィールドが追加されても、それを `TaskResponse` に加えない限り、フロントエンドへ誤って漏れることはありません。</span>
14. `TaskController.getById` 方法返回这个 `TaskResponse` 对象。**Java 对象什么时候变成 JSON？**——因为 `TaskController` 标了 `@RestController`（等价于 `@Controller` + `@ResponseBody`），DispatcherServlet 不会走视图解析，而是直接交给 **HttpMessageConverter**（背后由 Jackson 库实现）把 `TaskResponse` 对象序列化成 JSON 字符串。<br><span class="ja-inline">🇯🇵 `TaskController.getById` メソッドがこの `TaskResponse` オブジェクトを返します。**Java オブジェクトはいつ JSON になるのか？**——`TaskController` に `@RestController`（`@Controller` + `@ResponseBody` と等価）が付いているため、DispatcherServlet はビュー解決を行わず、直接 **HttpMessageConverter**（背後は Jackson ライブラリが実装）に渡して `TaskResponse` オブジェクトを JSON 文字列にシリアライズします。</span>
15. JSON 字符串装进 HTTP 响应体，状态码 `200`，经 Tomcat 沿原路径返回给 **Browser**。<br><span class="ja-inline">🇯🇵 JSON 文字列が HTTP レスポンスボディに詰め込まれ、ステータスコード `200` とともに、Tomcat を経由して来た経路を辿り **Browser** に返されます。</span>
16. 如果第 13 步抛出的是 `ResourceNotFoundException`（比如请求的是 `GET /tasks/999`），请求会被 `GlobalExceptionHandler`（标了 `@RestControllerAdvice`，会自动拦截所有 Controller 抛出的异常）捕获，转换成 `404` 状态码 + 一段 JSON 错误信息，同样经 Jackson 序列化后返回给浏览器。<br><span class="ja-inline">🇯🇵 もしステップ13で `ResourceNotFoundException` が投げられた場合（例えば `GET /tasks/999` をリクエストしたとき）、リクエストは `GlobalExceptionHandler`（`@RestControllerAdvice` が付いており、すべての Controller が投げる例外を自動的に捕捉します）に捕捉され、`404` ステータスコードと JSON のエラーメッセージに変換されます。これも同様に Jackson でシリアライズされてブラウザに返されます。</span>

从 Browser 发出请求，到 Browser 收到 JSON，中间经过的每一环——Tomcat、DispatcherServlet、HandlerMapping、HandlerAdapter、Controller、Service、Mapper、MySQL、Jackson——现在你都能准确说出它在这个真实项目里对应的类名和方法名。这就是这本教程从第 1 章走到这里，想让你真正拿到手的东西。

> 🇯🇵 Browser がリクエストを発してから、Browser が JSON を受け取るまで、その間に経由するすべての段階——Tomcat、DispatcherServlet、HandlerMapping、HandlerAdapter、Controller、Service、Mapper、MySQL、Jackson——について、今のあなたはこの実際のプロジェクトにおいて対応するクラス名・メソッド名を正確に言えるはずです。これこそが、このチュートリアルが第1章からここまで歩んできて、あなたに本当に手にしてほしかったものです。

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 启动报错 `Invalid bound statement (not found)` | `TaskMapper`/`UserMapper` 忘了继承 `BaseMapper<T>`，或者忘了标 `@Mapper`<br><span class="ja-inline">🇯🇵 `TaskMapper`/`UserMapper` が `BaseMapper<T>` を継承し忘れている、または `@Mapper` を付け忘れている </span>| 检查 mapper 接口的 `extends` 和注解<br><span class="ja-inline">🇯🇵 mapper インターフェースの `extends` とアノテーションを確認する </span>|
| `GET /tasks?page=1&size=20` 返回的 `records` 是全部数据，`total` 也不对 | 忘了注册 `MybatisPlusInterceptor` 分页插件<br><span class="ja-inline">🇯🇵 `MybatisPlusInterceptor` ページネーションプラグインの登録を忘れている </span>| 检查 `config/MybatisPlusConfig.java` 是否被扫描到（是否在 `com.example.taskmanager` 包或子包下）<br><span class="ja-inline">🇯🇵 `config/MybatisPlusConfig.java` がスキャンされているか（`com.example.taskmanager` パッケージまたはそのサブパッケージにあるか）を確認する </span>|
| 插入任务报外键约束错误 | 传的 `userId` 在 `user` 表里不存在<br><span class="ja-inline">🇯🇵 渡された `userId` が `user` テーブルに存在しない </span>| 先用 `POST /users` 建一个用户，或者确认 37.3 的初始数据已插入<br><span class="ja-inline">🇯🇵 先に `POST /users` でユーザーを作成するか、37.3 の初期データが挿入されているか確認する </span>|
| `POST /tasks` 传空 `title` 却没有报 400 | Controller 方法参数上忘了加 `@Valid`<br><span class="ja-inline">🇯🇵 Controller メソッドの引数に `@Valid` を付け忘れている </span>| 检查 `@Valid @RequestBody TaskCreateRequest request`<br><span class="ja-inline">🇯🇵 `@Valid @RequestBody TaskCreateRequest request` を確認する </span>|
| `TaskControllerTest` 报 `NoSuchBeanDefinitionException` | `@WebMvcTest` 只加载 Web 层相关 Bean，`TaskService` 必须用 `@MockitoBean` 提供假实现，不能指望它能注入真实的 `TaskServiceImpl`<br><span class="ja-inline">🇯🇵 `@WebMvcTest` は Web 層関連の Bean しかロードしないため、`TaskService` は `@MockitoBean` で偽の実装を提供する必要があり、本物の `TaskServiceImpl` が注入されることを期待してはいけない </span>| 检查测试类里是否正确使用了 `@MockitoBean private TaskService taskService;`<br><span class="ja-inline">🇯🇵 テストクラスで `@MockitoBean private TaskService taskService;` が正しく使われているか確認する </span>|
| 分页返回的字段是 `current` 不是 `page` | 直接把 MyBatis-Plus 的 `Page<Task>` 对象返回给了前端，没有转换成 `PageResult`<br><span class="ja-inline">🇯🇵 MyBatis-Plus の `Page<Task>` オブジェクトをそのままフロントエンドに返しており、`PageResult` に変換していない </span>| 按 37.10 的写法，手动构造 `PageResult` 再返回<br><span class="ja-inline">🇯🇵 37.10 の書き方に従い、手動で `PageResult` を組み立ててから返す </span>|
| `TaskControllerTest.java` 编译报错，提示找不到 `org.springframework.boot.webmvc.test.autoconfigure` 包或 `WebMvcTest` 类型 | Spring Boot 4 把 Spring MVC 专用的测试支持拆分到了独立模块 `spring-boot-webmvc-test` / `spring-boot-starter-webmvc-test`<br><span class="ja-inline">🇯🇵 Spring Boot 4 は Spring MVC 専用のテストサポートを独立したモジュール `spring-boot-webmvc-test` / `spring-boot-starter-webmvc-test` に分割した </span>| 确认 `pom.xml` 里已经显式加了 `spring-boot-starter-webmvc-test`（37.4 已经加上）——这是 Boot 4 模块拆分后需要特别注意的依赖点<br><span class="ja-inline">🇯🇵 `pom.xml` に `spring-boot-starter-webmvc-test` が明示的に追加されているか確認する（37.4 ですでに追加済み）——これは Boot 4 のモジュール分割後、特に注意すべき依存関係のポイントです </span>|

## 动手练习 ／ 演習

1. 给 `TaskController` 加一个 `GET /tasks/by-user/{userId}`接口，返回某个用户名下的全部任务（提示：需要在 `Wrapper` 里加条件，或者先用最简单的方式——查出全部任务后在 Service 层用 Stream 过滤，二选一都可以，重点是先跑通）。<br><span class="ja-inline">🇯🇵 `TaskController` に `GET /tasks/by-user/{userId}` API を追加し、あるユーザー名義の全タスクを返してください（ヒント：`Wrapper` に条件を加える方法でも、まずは最も簡単な方法——全タスクを検索した後 Service 層で Stream を使ってフィルタする方法でも、どちらでも構いません。重要なのはまず動かすことです）。</span>
2. 给 `TaskCreateRequest` 的 `description` 字段加上 `@Size(max = 500)` 校验，测试传一个超长描述会不会被 `GlobalExceptionHandler` 拦截成 400。<br><span class="ja-inline">🇯🇵 `TaskCreateRequest` の `description` フィールドに `@Size(max = 500)` の検証を追加し、長すぎる説明を渡したときに `GlobalExceptionHandler` に捕捉されて400になるかテストしてください。</span>
3. 仿照 `TaskServiceTest`，给 `UserServiceImpl.toResponse` 也写一个单元测试。<br><span class="ja-inline">🇯🇵 `TaskServiceTest` を参考に、`UserServiceImpl.toResponse` にも単体テストを書いてください。</span>
4. 仿照 `TaskControllerTest`，给 `POST /tasks` 写一个 Controller 层测试，验证传入合法数据时返回状态码是不是 200。<br><span class="ja-inline">🇯🇵 `TaskControllerTest` を参考に、`POST /tasks` に対する Controller 層のテストを書き、正当なデータを渡したときに200のステータスコードが返るか検証してください。</span>

## 小测验 ／ 小テスト

1. 为什么 `TaskController` 里注入的是接口类型 `TaskService` 而不是 `TaskServiceImpl`？<br><span class="ja-inline">🇯🇵 なぜ `TaskController` に注入されるのは interface 型の `TaskService` であって `TaskServiceImpl` ではないのですか。</span>
2. `PageResult` 里的 `records` 字段，为什么类型是 `List<TaskResponse>` 而不是 `List<Task>`？<br><span class="ja-inline">🇯🇵 `PageResult` の `records` フィールドの型が `List<Task>` ではなく `List<TaskResponse>` なのはなぜですか。</span>
3. `@WebMvcTest` 和 `@SpringBootTest` 测出来的东西有什么本质区别？<br><span class="ja-inline">🇯🇵 `@WebMvcTest` と `@SpringBootTest` でテストされる内容には、本質的にどんな違いがありますか。</span>
4. 如果没有注册 `MybatisPlusInterceptor`，`taskMapper.selectPage()` 会发生什么？<br><span class="ja-inline">🇯🇵 もし `MybatisPlusInterceptor` を登録していなかったら、`taskMapper.selectPage()` は何が起こりますか。</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 面向接口编程的企业习惯：`TaskController` 只关心"能调用 createTask/getTaskById 这些方法"，不关心具体是哪个实现类。这样以后想换实现（比如换成先查缓存的版本），只要新写一个实现类换掉 Spring 容器里注册的 Bean，`TaskController` 一行代码都不用改。<br><span class="ja-inline">🇯🇵 インターフェース指向プログラミングという企業の習慣です。`TaskController` は「createTask/getTaskById といったメソッドを呼び出せる」ことだけを気にし、具体的にどの実装クラスかは気にしません。こうすることで、将来実装を差し替えたいとき（例えばまずキャッシュを見るバージョンに変えたいとき）、新しい実装クラスを書いて Spring コンテナに登録された Bean を差し替えるだけで、`TaskController` は一行も変更する必要がありません。</span>
2. `Task` 是 entity，和数据库表结构绑定；`TaskResponse` 是 DTO，专门用来和前端交互。即使 `Task` 以后新增字段，只要不加进 `TaskResponse`，就不会意外暴露给前端——这是第 30 章讲过的 entity/DTO 分离原则。<br><span class="ja-inline">🇯🇵 `Task` は entity であり、データベースのテーブル構造に紐づいています。`TaskResponse` は DTO であり、フロントエンドとのやり取り専用です。たとえ `Task` に今後フィールドが追加されても、それを `TaskResponse` に加えない限り、フロントエンドに意図せず公開されることはありません——これが第30章で説明した entity/DTO 分離の原則です。</span>
3. `@WebMvcTest` 只启动 Web 层相关的少量 Bean（Controller、参数校验、异常处理等），Service 需要用 `@MockitoBean` 提供假实现，速度快，不连数据库；`@SpringBootTest` 会启动完整的 `ApplicationContext`，所有真实 Bean（包括真正连数据库的 Mapper）都会被创建，更接近真实运行环境，但速度慢很多——这正是第 36 章讲的单元测试 vs 集成测试的区别。<br><span class="ja-inline">🇯🇵 `@WebMvcTest` は Web 層関連のわずかな Bean（Controller、パラメータ検証、例外処理など）だけを起動し、Service は `@MockitoBean` で偽の実装を提供する必要があります。速度が速く、データベースに接続しません。`@SpringBootTest` は完全な `ApplicationContext`（Spring コンテナの実体）を起動し、すべての本物の Bean（本当にデータベースに接続する Mapper を含む）が作成されるため、実際の実行環境により近いですが、速度はかなり遅くなります——これがまさに第36章で説明した単体テスト対結合テストの違いです。</span>
4. `page`/`size` 参数完全不生效，`selectPage()` 会退化成查询全部数据，`total` 也算不对——分页插件是"拦截并改写 SQL"的机制，没注册这个插件，MyBatis-Plus 根本不知道要做分页。<br><span class="ja-inline">🇯🇵 `page`/`size` パラメータがまったく効かなくなり、`selectPage()` は全データを検索する動作に退化し、`total` も正しく計算されなくなります——ページネーションプラグインは「SQL を横取りして書き換える」仕組みなので、このプラグインを登録していなければ、MyBatis-Plus はページネーションをすべきことをそもそも知らないのです。</span>
</details>

## 本章总结 ／ 本章のまとめ
恭喜你，从环境搭建到最终项目，你已经亲手搭建了一个具备完整分层结构（Controller-Service-Mapper）、参数校验、全局异常处理、双表关联、基础分页、基础自动化测试的 Spring Boot 项目——这已经是一个真实企业后端项目的完整雏形。下一步先做一次全课程的复习（阶段复习 5），再看看学完之后还能往哪些方向继续深入（第 38 章）。

> 🇯🇵 おめでとうございます。環境構築から最終プロジェクトまで、あなたはすでに、一通りのレイヤー構成（Controller-Service-Mapper）、パラメータ検証、グローバル例外処理、2テーブル関連、基本的なページネーション、基本的な自動テストを備えた Spring Boot プロジェクトを自分の手で構築しました——これはすでに実務的なバックエンドプロジェクトのひな型です。次のステップとして、まず全コースの復習（ステージ復習5）を行い、それから学び終えた後にどの方向へさらに深められるか（第38章）を見ていきましょう。
