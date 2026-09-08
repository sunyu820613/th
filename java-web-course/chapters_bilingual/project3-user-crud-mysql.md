# Project 3　MySQL User CRUD ／ Project 3　MySQL User CRUD

## 本章目标 ／ 本章の目標
把 Project 2（内存版 User API）升级成真正连接 MySQL 的版本：数据不再放在 `List<User>` 里，而是持久化到数据库。整体结构从"Controller → Service → List"变成"Controller → Service → Mapper → MySQL"。

> 🇯🇵 Project 2（メモリ版User API）を、実際にMySQLに接続するバージョンにアップグレードします。データはもはや `List<User>` に置かれるのではなく、データベースに永続化されます。全体構造は「Controller → Service → List」から「Controller → Service → Mapper → MySQL」に変わります。

## 一句话理解 ／ 一言で理解する
Project 3 做的事情，本质上是把前面几章学到的"数据库 + SQL + 连接配置 + MyBatis-Plus + 事务"全部拼在一起，套进第 20～22 章学过的 Controller-Service 分层结构里，做出一个真正"重启程序数据也不会丢"的 User CRUD 接口。

> 🇯🇵 Project 3がやっていることは、本質的には前の数章で学んだ「データベース＋SQL＋接続設定＋MyBatis-Plus＋トランザクション」をすべて組み合わせ、第20〜22章で学んだController-Service（コントローラー・サービス）の階層構造に当てはめて、実際に「プログラムを再起動してもデータが消えない」User CRUD APIを作ることです。

## 为什么需要它 ／ なぜ必要なのか
Project 2 的痛点很明确：数据存在内存 `List` 里，程序一重启数据全没了，也没法在多个实例之间共享数据。这在真实项目里是不可接受的。Project 3 就是要解决这个问题——把存储层从"内存"换成"MySQL"，而 Controller 层的 RESTful 接口设计（第 22 章）完全复用，不需要改动。

> 🇯🇵 Project 2の痛点ははっきりしています。データはメモリ上の `List` に保存されているため、プログラムを再起動すると全データが消えてしまい、複数のインスタンス間でデータを共有することもできません。これは実際のプロジェクトでは受け入れられません。Project 3はまさにこの問題を解決するためのものです——ストレージ層を「メモリ」から「MySQL」に置き換える一方で、Controller層のRESTful API設計（第22章）はそのまま完全に流用し、変更する必要はありません。

## 项目信息 ／ プロジェクト情報

- 项目名：`user-crud-mysql`<br><span class="ja-inline">🇯🇵 プロジェクト名：`user-crud-mysql`</span>
- 包名：`com.example.usercrud`<br><span class="ja-inline">🇯🇵 パッケージ名：`com.example.usercrud`</span>
- 技术栈：Java 21、Spring Boot 4.1.1、Maven、MySQL 8.x、`mybatis-plus-spring-boot4-starter:3.5.17`<br><span class="ja-inline">🇯🇵 技術スタック：Java 21、Spring Boot 4.1.1、Maven、MySQL 8.x、`mybatis-plus-spring-boot4-starter:3.5.17`</span>

## 核心概念：整体结构 ／ コアコンセプト：全体構造

```
Browser（Postman）
    ↓ HTTP
UserController   （接收请求，返回响应）
    ↓
UserService      （业务逻辑，构造器注入 UserMapper）
    ↓
UserMapper       （继承 BaseMapper<User>，不用手写 SQL）
    ↓
MySQL            （user 表，真正持久化数据）
```

## 建表 SQL ／ テーブル作成SQL

```sql
CREATE DATABASE IF NOT EXISTS usercrud_db;

USE usercrud_db;

CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT
);
```

## Maven 依赖（`pom.xml` 关键片段） ／ Maven依存関係（`pom.xml` の主要部分）

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>

    <dependency>
        <groupId>com.baomidou</groupId>
        <artifactId>mybatis-plus-spring-boot4-starter</artifactId>
        <version>3.5.17</version>
    </dependency>

    <dependency>
        <groupId>com.mysql</groupId>
        <artifactId>mysql-connector-j</artifactId>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

`spring-boot-starter-webmvc` 版本由 Spring Boot 4.1.1 的 BOM 统一管理；`mybatis-plus-spring-boot4-starter` 按第 28 章的规定固定为 `3.5.17`（内部已包含 MyBatis 能力，不需要再单独引入 `mybatis-spring-boot-starter`）；`mysql-connector-j` 是 MySQL 的 JDBC 驱动，`scope` 为 `runtime`。

> 🇯🇵 `spring-boot-starter-webmvc` のバージョンはSpring Boot 4.1.1のBOMによって統一管理されます。`mybatis-plus-spring-boot4-starter` は第28章の規定に従い `3.5.17` に固定します（内部にすでにMyBatisの機能が含まれているため、`mybatis-spring-boot-starter` を単独で導入する必要はありません）。`mysql-connector-j` はMySQLのJDBCドライバで、`scope` は `runtime` です。

## `application.yml` ／ `application.yml`

```yaml
spring:
  application:
    name: user-crud-mysql
  datasource:
    url: jdbc:mysql://localhost:3306/usercrud_db?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

server:
  port: 8080
```

## 完整代码 ／ 完全なコード

### Entity：`User.java` ／ Entity：`User.java`

```java
package com.example.usercrud.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;
    private String email;
    private Integer age;

    public User() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
```

### Mapper：`UserMapper.java` ／ Mapper：`UserMapper.java`

```java
package com.example.usercrud.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
```

### Service 接口：`UserService.java` ／ Serviceインターフェース：`UserService.java`

```java
package com.example.usercrud.service;

import com.example.usercrud.entity.User;

import java.util.List;

public interface UserService {

    List<User> listUsers();

    User getUser(Long id);

    User createUser(User user);

    User updateUser(Long id, User user);

    void deleteUser(Long id);
}
```

### Service 实现：`UserServiceImpl.java` ／ Service実装：`UserServiceImpl.java`

```java
package com.example.usercrud.service.impl;

import com.example.usercrud.entity.User;
import com.example.usercrud.mapper.UserMapper;
import com.example.usercrud.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;

    public UserServiceImpl(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    @Override
    public List<User> listUsers() {
        return userMapper.selectList(null);
    }

    @Override
    public User getUser(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    @Transactional
    public User createUser(User user) {
        userMapper.insert(user);
        return user;
    }

    @Override
    @Transactional
    public User updateUser(Long id, User user) {
        user.setId(id);
        userMapper.updateById(user);
        return userMapper.selectById(id);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userMapper.deleteById(id);
    }
}
```

`createUser`/`updateUser`/`deleteUser` 各自只涉及一次数据库写操作，严格来说单独一步操作本身具备原子性，不一定非要加 `@Transactional` 才能保证正确性。这里统一加上，一是养成"写操作方法默认交给事务托管"的习惯，二是为最终项目（第 37 章可能出现"一个方法里多步写操作"的场景）做铺垫。

> 🇯🇵 `createUser`/`updateUser`/`deleteUser` はそれぞれ1回のデータベース書き込み操作しか関わっておらず、厳密に言えば単独の1ステップの操作自体に原子性があるため、必ずしも `@Transactional` を付けなければ正しさが保証されないわけではありません。ここで一律に付けているのは、1つには「書き込み操作のメソッドはデフォルトでトランザクションに任せる」習慣を身につけるため、2つには最終プロジェクト（第37章で「1つのメソッドの中に複数の書き込み操作がある」場面が出てくる可能性がある）への布石とするためです。

### Controller：`UserController.java` ／ Controller：`UserController.java`

复用第 22 章 RESTful API 设计的路由规则（资源名用复数 `/users`，用 HTTP 方法表达动作）：

> 🇯🇵 第22章のRESTful API設計のルーティングルール（リソース名は複数形の `/users` を使い、HTTPメソッドで動作を表現する）をそのまま流用します。

```java
package com.example.usercrud.controller;

import com.example.usercrud.entity.User;
import com.example.usercrud.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> list() {
        return userService.listUsers();
    }

    @GetMapping("/{id}")
    public User get(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable Long id, @RequestBody User user) {
        return userService.updateUser(id, user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
```

### 启动类：`UserCrudMysqlApplication.java` ／ 起動クラス：`UserCrudMysqlApplication.java`

```java
package com.example.usercrud;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UserCrudMysqlApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserCrudMysqlApplication.class, args);
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `@TableName("user")` + `@TableId(type = IdType.AUTO)`：见第 28 章，声明 `User` 对应 `user` 表，`id` 为自增主键。<br><span class="ja-inline">🇯🇵 `@TableName("user")` ＋ `@TableId(type = IdType.AUTO)`：第28章参照。`User` が `user` テーブルに対応し、`id` が自動採番の主キーであることを宣言します。</span>
- `UserMapper extends BaseMapper<User>`：不写任何 SQL，自动获得 `selectById`/`selectList`/`insert`/`updateById`/`deleteById`。<br><span class="ja-inline">🇯🇵 `UserMapper extends BaseMapper<User>`：SQLを一切書かずに `selectById`/`selectList`/`insert`/`updateById`/`deleteById` を自動的に手に入れます。</span>
- `UserServiceImpl implements UserService`：接口 + 实现类分离是企业项目里的常见习惯（不是 Spring 强制要求），`@Service` 让 Spring 把 `UserServiceImpl` 注册成 Bean。构造器注入 `UserMapper`，写法和第 16 章讲过的构造器注入完全一致。<br><span class="ja-inline">🇯🇵 `UserServiceImpl implements UserService`：インターフェース＋実装クラスの分離は企業のプロジェクトでよくある習慣です（Springが強制するものではありません）。`@Service` によってSpringが `UserServiceImpl` をBeanとして登録します。`UserMapper` のコンストラクタ注入は、第16章で説明したコンストラクタ注入とまったく同じ書き方です。</span>
- `@Transactional` 加在写操作方法上：见第 29 章，保证写操作出现异常时能正确回滚。<br><span class="ja-inline">🇯🇵 `@Transactional` を書き込み操作のメソッドに付ける：第29章参照。書き込み操作で例外が発生した際に正しくロールバックできることを保証します。</span>
- `UserController` 里的路由设计完全沿用第 22 章：`GET /users` 查全部、`GET /users/{id}` 查一个、`POST /users` 新增、`PUT /users/{id}` 整体更新、`DELETE /users/{id}` 删除。<br><span class="ja-inline">🇯🇵 `UserController` のルーティング設計は第22章をそのまま踏襲しています。`GET /users` で全件検索、`GET /users/{id}` で1件検索、`POST /users` で新規追加、`PUT /users/{id}` で全体更新、`DELETE /users/{id}` で削除です。</span>

## 程序运行过程 / 调用链回顾 ／ プログラムの実行の流れ／呼び出しチェーンの振り返り

以 `GET /users/1`（查询 id 为 1 的用户）为例，把完整调用链和本项目的实际代码对照一遍：

> 🇯🇵 `GET /users/1`（idが1のユーザーを検索する）を例に、完全な呼び出しチェーンと本プロジェクトの実際のコードを対照してみましょう。

```
Browser（或 Postman）发起 GET http://localhost:8080/users/1
    ↓ HTTP Request
Tomcat（Spring Boot 内嵌）接收到这个 HTTP 请求
    ↓
DispatcherServlet（Spring MVC 的统一入口）接管这个请求
    ↓
HandlerMapping：根据请求路径 /users/1 和方法 GET，找到应该由
  UserController 的 get(Long id) 方法处理（因为它标注了
  @GetMapping("/{id}")，且类上有 @RequestMapping("/users")）
    ↓
HandlerAdapter：负责实际调用 get 方法，并把路径变量 "1" 转换成
  Long 类型，绑定给参数 id（@PathVariable）
    ↓
UserController.get(1)
    ↓ 调用
UserService.getUser(1)   ← UserService 是构造器注入进 Controller 的，
                            这个 Bean 是 Spring 启动扫描组件时创建并
                            放进 ApplicationContext 的（第 16 章）
    ↓ 调用
UserMapper.selectById(1) ← UserMapper 只是一个 interface，之所以能
                            被调用，是因为 MyBatis（被 MyBatis-Plus
                            增强后）用动态代理在运行时生成了它的实现
                            类（第 27 章讲过的原理）
    ↓
MyBatis-Plus 根据 @TableName/@TableId 自动拼装出等价于
  "SELECT * FROM user WHERE id = ?" 的 SQL
    ↓
MySQL 执行查询，返回这一行数据
    ↓（结果原路返回）
UserMapper 把结果映射成一个 User 对象，返回给 UserService
    ↓
UserService.getUser 把这个 User 对象原样返回给 UserController
    ↓
UserController.get 方法返回这个 User 对象
    ↓
HttpMessageConverter / Jackson：Spring MVC 发现返回值不是 String
  而是一个普通 Java 对象，且类上有 @RestController，于是自动把这
  个 User 对象序列化成 JSON（第 21 章讲过的 Java 对象 ↔ JSON 转换）
    ↓ HTTP Response（Content-Type: application/json）
Browser（Postman）收到 JSON 格式的用户数据
```

> 🇯🇵
> ```
> Browser（またはPostman）が GET http://localhost:8080/users/1 を発行
>     ↓ HTTPリクエスト
> Tomcat（Spring Boot内蔵）がこのHTTPリクエストを受信
>     ↓
> DispatcherServlet（Spring MVCの統一入口）がこのリクエストを引き継ぐ
>     ↓
> HandlerMapping：リクエストパス /users/1 とメソッド GET から、
>   UserController の get(Long id) メソッドが処理すべきだと判断する
>   （@GetMapping("/{id}") が付いており、クラスに @RequestMapping("/users")
>   があるため）
>     ↓
> HandlerAdapter：実際に get メソッドを呼び出し、パス変数 "1" を
>   Long 型に変換して引数 id（@PathVariable）にバインドする
>     ↓
> UserController.get(1)
>     ↓ 呼び出し
> UserService.getUser(1)   ← UserService はコンストラクタ注入で
>                             Controllerに渡されており、このBeanは
>                             Spring起動時にコンポーネントスキャンで
>                             作成されApplicationContextに登録された
>                             ものです（第16章）
>     ↓ 呼び出し
> UserMapper.selectById(1) ← UserMapper はただの interface だが、
>                             呼び出せるのはMyBatis（MyBatis-Plusに
>                             よって拡張された後）が動的プロキシで
>                             実行時にその実装クラスを生成している
>                             からです（第27章で説明した原理）
>     ↓
> MyBatis-Plus が @TableName/@TableId に基づいて
>   "SELECT * FROM user WHERE id = ?" と等価なSQLを自動的に組み立てる
>     ↓
> MySQL がクエリを実行し、この1行のデータを返す
>     ↓（結果が元の経路で返る）
> UserMapper が結果を User オブジェクトにマッピングし、UserServiceに返す
>     ↓
> UserService.getUser がこの User オブジェクトをそのまま UserController に返す
>     ↓
> UserController.get メソッドがこの User オブジェクトを返す
>     ↓
> HttpMessageConverter / Jackson：Spring MVCは戻り値がStringではなく
>   普通のJavaオブジェクトであり、クラスに @RestController があることを
>   検出し、自動的にこの User オブジェクトをJSONにシリアライズする
>   （第21章で説明したJavaオブジェクト↔JSON変換）
>     ↓ HTTPレスポンス（Content-Type: application/json）
> Browser（Postman）がJSON形式のユーザーデータを受け取る
> ```

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 启动报 `Unknown database 'usercrud_db'` | 忘记先执行建表 SQL 里的 `CREATE DATABASE`<br><span class="ja-inline">🇯🇵 テーブル作成SQLの `CREATE DATABASE` を先に実行するのを忘れた </span>| 先在 MySQL 里手动执行本章给出的建表 SQL<br><span class="ja-inline">🇯🇵 先にMySQLで本章のテーブル作成SQLを手動で実行する </span>|
| `POST /users` 返回的 JSON 里 `id` 是 `null` | Entity 的 `@TableId` 没配置正确，或者插入后没有重新读取自增值<br><span class="ja-inline">🇯🇵 Entityの `@TableId` が正しく設定されていない、または挿入後に自動採番の値を読み直していない </span>| 确认 `@TableId(type = IdType.AUTO)` 配置正确；`insert` 执行成功后 MyBatis-Plus 会自动回填 `id`<br><span class="ja-inline">🇯🇵 `@TableId(type = IdType.AUTO)` の設定が正しいか確認する。`insert` の実行に成功すればMyBatis-Plusが自動的に `id` を書き戻す </span>|
| `PUT /users/{id}` 更新后其它字段变成了 `null` | 前端只传了部分字段，`updateById` 却被误以为会保留原值<br><span class="ja-inline">🇯🇵 フロントエンドが一部のフィールドしか渡していないのに、`updateById` が元の値を保持すると誤解していた </span>| `updateById` 只更新非空字段，理论上不会覆盖成 `null`；如果确实清空了，检查请求体是否传了 `null` 值的字段<br><span class="ja-inline">🇯🇵 `updateById` はNULLでないフィールドのみ更新し、理論上 `null` で上書きされることはない。実際にクリアされてしまった場合は、リクエストボディで `null` 値のフィールドが渡されていないか確認する </span>|
| 项目启动正常但所有接口都报 500，日志显示找不到表<br><span class="ja-inline">🇯🇵 プロジェクトは正常に起動するが、すべてのAPIが500エラーになり、ログにテーブルが見つからないと表示される </span>| 建表 SQL 没有执行，或者连的不是 `usercrud_db` 这个库<br><span class="ja-inline">🇯🇵 テーブル作成SQLが実行されていない、または接続先が `usercrud_db` ではない </span>| 检查 `application.yml` 里 `url` 指定的库名和实际建表的库名是否一致<br><span class="ja-inline">🇯🇵 `application.yml` の `url` で指定したデータベース名と、実際にテーブルを作成したデータベース名が一致しているか確認する </span>|

## 动手练习 ／ 演習

1. 用 Postman 依次测试 `GET /users`、`POST /users`、`GET /users/{id}`、`PUT /users/{id}`、`DELETE /users/{id}`，观察每次操作后数据库 `user` 表的真实变化。<br><span class="ja-inline">🇯🇵 Postmanを使って `GET /users`、`POST /users`、`GET /users/{id}`、`PUT /users/{id}`、`DELETE /users/{id}` を順番にテストし、各操作の後にデータベースの `user` テーブルに実際にどんな変化が起きるか観察しましょう。</span>
2. 重启这个 Spring Boot 项目，再次调用 `GET /users`，确认之前插入的数据依然还在——这正是它和 Project 2（内存版）最本质的区别。<br><span class="ja-inline">🇯🇵 このSpring Bootプロジェクトを再起動し、もう一度 `GET /users` を呼び出して、以前挿入したデータがまだ残っていることを確認しましょう——これこそがProject 2（メモリ版）との最も本質的な違いです。</span>
3. 尝试给 `UserServiceImpl` 的 `createUser` 方法故意制造一个会抛异常的场景（比如插入前手动抛一个 `RuntimeException`），观察加了 `@Transactional` 后数据库里是否真的没有留下这条脏数据。<br><span class="ja-inline">🇯🇵 `UserServiceImpl` の `createUser` メソッドにわざと例外をスローする場面を作ってみて（例えば挿入前に手動で `RuntimeException` をスローする）、`@Transactional` を付けた後、データベースに本当にその不正なデータが残らないか観察しましょう。</span>

## 小测验 ／ 小テスト

1. Project 3 相比 Project 2，存储层发生了什么变化？<br><span class="ja-inline">🇯🇵 Project 3はProject 2と比べて、ストレージ層にどんな変化がありましたか？</span>
2. `UserMapper` 是一个空的 interface，为什么能直接调用 `selectById` 这样的方法？<br><span class="ja-inline">🇯🇵 `UserMapper` は空の interface なのに、なぜ `selectById` のようなメソッドを直接呼び出せるのですか？</span>
3. 在本项目的调用链里，Java 对象是在哪一步被转换成 JSON 的？<br><span class="ja-inline">🇯🇵 本プロジェクトの呼び出しチェーンにおいて、JavaオブジェクトはどのステップでJSONに変換されますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 数据存储从内存 `List<User>` 变成了真正的 MySQL 数据库表，程序重启后数据依然存在。<br><span class="ja-inline">🇯🇵 データストレージがメモリ上の `List<User>` から実際のMySQLデータベーステーブルに変わり、プログラムを再起動してもデータが存続するようになりました。</span>
2. 因为 `UserMapper extends BaseMapper<User>`，MyBatis-Plus（基于 MyBatis）在运行时用动态代理为它生成了实现类，`BaseMapper` 里定义的方法（如 `selectById`）在这个动态生成的实现类里已经有对应的 SQL 执行逻辑。<br><span class="ja-inline">🇯🇵 `UserMapper extends BaseMapper<User>` としているため、MyBatis-Plus（MyBatisをベースとする）が実行時に動的プロキシでその実装クラスを生成しており、`BaseMapper` で定義されたメソッド（`selectById` など）には、この動的生成された実装クラスの中にすでに対応するSQL実行ロジックがあるからです。</span>
3. 在 `HttpMessageConverter`/Jackson 这一步：`UserController` 返回 Java 对象后，Spring MVC 在写响应之前，用 Jackson 把这个 Java 对象序列化成 JSON 字符串，再写入 HTTP 响应体。<br><span class="ja-inline">🇯🇵 `HttpMessageConverter`／Jacksonのステップです。`UserController` がJavaオブジェクトを返した後、Spring MVCはレスポンスを書き込む前に、JacksonでこのJavaオブジェクトをJSON文字列にシリアライズし、それからHTTPレスポンスボディに書き込みます。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经把内存版 User API 升级成了真正连接 MySQL 的完整四层结构（Controller → Service → Mapper → MySQL），并且能完整讲出一次请求从浏览器到数据库、再原路返回的整条调用链。下一步进入阶段复习 4，梳理数据库与持久层这一整块知识。

> 🇯🇵 これでメモリ版User APIを、実際にMySQLに接続する完全な4層構造（Controller → Service → Mapper → MySQL）にアップグレードし、1回のリクエストがブラウザからデータベースへ、そして元の経路で戻ってくるまでの呼び出しチェーン全体を完全に説明できるようになりました。次はステージ復習4に進み、データベースと永続化層というこの一連の知識を整理します。
