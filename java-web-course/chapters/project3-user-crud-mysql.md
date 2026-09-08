# Project 3　MySQL User CRUD

## 本章目标
把 Project 2（内存版 User API）升级成真正连接 MySQL 的版本：数据不再放在 `List<User>` 里，而是持久化到数据库。整体结构从"Controller → Service → List"变成"Controller → Service → Mapper → MySQL"。

## 一句话理解
Project 3 做的事情，本质上是把前面几章学到的"数据库 + SQL + 连接配置 + MyBatis-Plus + 事务"全部拼在一起，套进第 20～22 章学过的 Controller-Service 分层结构里，做出一个真正"重启程序数据也不会丢"的 User CRUD 接口。

## 为什么需要它
Project 2 的痛点很明确：数据存在内存 `List` 里，程序一重启数据全没了，也没法在多个实例之间共享数据。这在真实项目里是不可接受的。Project 3 就是要解决这个问题——把存储层从"内存"换成"MySQL"，而 Controller 层的 RESTful 接口设计（第 22 章）完全复用，不需要改动。

## 项目信息

- 项目名：`user-crud-mysql`
- 包名：`com.example.usercrud`
- 技术栈：Java 21、Spring Boot 4.1.1、Maven、MySQL 8.x、`mybatis-plus-spring-boot4-starter:3.5.17`

## 核心概念：整体结构

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

## 建表 SQL

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

## Maven 依赖（`pom.xml` 关键片段）

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

## `application.yml`

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

## 完整代码

### Entity：`User.java`

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

### Mapper：`UserMapper.java`

```java
package com.example.usercrud.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
```

### Service 接口：`UserService.java`

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

### Service 实现：`UserServiceImpl.java`

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

> `createUser`/`updateUser`/`deleteUser` 各自只涉及一次数据库写操作，严格来说单独一步操作本身具备原子性，不一定非要加 `@Transactional` 才能保证正确性。这里统一加上，一是养成"写操作方法默认交给事务托管"的习惯，二是为最终项目（第 37 章可能出现"一个方法里多步写操作"的场景）做铺垫。

### Controller：`UserController.java`

复用第 22 章 RESTful API 设计的路由规则（资源名用复数 `/users`，用 HTTP 方法表达动作）：

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

### 启动类：`UserCrudMysqlApplication.java`

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

## 代码逐行解释

- `@TableName("user")` + `@TableId(type = IdType.AUTO)`：见第 28 章，声明 `User` 对应 `user` 表，`id` 为自增主键。
- `UserMapper extends BaseMapper<User>`：不写任何 SQL，自动获得 `selectById`/`selectList`/`insert`/`updateById`/`deleteById`。
- `UserServiceImpl implements UserService`：接口 + 实现类分离是企业项目里的常见习惯（不是 Spring 强制要求），`@Service` 让 Spring 把 `UserServiceImpl` 注册成 Bean。构造器注入 `UserMapper`，写法和第 16 章讲过的构造器注入完全一致。
- `@Transactional` 加在写操作方法上：见第 29 章，保证写操作出现异常时能正确回滚。
- `UserController` 里的路由设计完全沿用第 22 章：`GET /users` 查全部、`GET /users/{id}` 查一个、`POST /users` 新增、`PUT /users/{id}` 整体更新、`DELETE /users/{id}` 删除。

## 程序运行过程 / 调用链回顾

以 `GET /users/1`（查询 id 为 1 的用户）为例，把完整调用链和本项目的实际代码对照一遍：

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

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 启动报 `Unknown database 'usercrud_db'` | 忘记先执行建表 SQL 里的 `CREATE DATABASE` | 先在 MySQL 里手动执行本章给出的建表 SQL |
| `POST /users` 返回的 JSON 里 `id` 是 `null` | Entity 的 `@TableId` 没配置正确，或者插入后没有重新读取自增值 | 确认 `@TableId(type = IdType.AUTO)` 配置正确；`insert` 执行成功后 MyBatis-Plus 会自动回填 `id` |
| `PUT /users/{id}` 更新后其它字段变成了 `null` | 前端只传了部分字段，`updateById` 却被误以为会保留原值 | `updateById` 只更新非空字段，理论上不会覆盖成 `null`；如果确实清空了，检查请求体是否传了 `null` 值的字段 |
| 项目启动正常但所有接口都报 500，日志显示找不到表 | 建表 SQL 没有执行，或者连的不是 `usercrud_db` 这个库 | 检查 `application.yml` 里 `url` 指定的库名和实际建表的库名是否一致 |

## 动手练习

1. 用 Postman 依次测试 `GET /users`、`POST /users`、`GET /users/{id}`、`PUT /users/{id}`、`DELETE /users/{id}`，观察每次操作后数据库 `user` 表的真实变化。
2. 重启这个 Spring Boot 项目，再次调用 `GET /users`，确认之前插入的数据依然还在——这正是它和 Project 2（内存版）最本质的区别。
3. 尝试给 `UserServiceImpl` 的 `createUser` 方法故意制造一个会抛异常的场景（比如插入前手动抛一个 `RuntimeException`），观察加了 `@Transactional` 后数据库里是否真的没有留下这条脏数据。

## 小测验

1. Project 3 相比 Project 2，存储层发生了什么变化？
2. `UserMapper` 是一个空的 interface，为什么能直接调用 `selectById` 这样的方法？
3. 在本项目的调用链里，Java 对象是在哪一步被转换成 JSON 的？

<details>
<summary>参考答案</summary>

1. 数据存储从内存 `List<User>` 变成了真正的 MySQL 数据库表，程序重启后数据依然存在。
2. 因为 `UserMapper extends BaseMapper<User>`，MyBatis-Plus（基于 MyBatis）在运行时用动态代理为它生成了实现类，`BaseMapper` 里定义的方法（如 `selectById`）在这个动态生成的实现类里已经有对应的 SQL 执行逻辑。
3. 在 `HttpMessageConverter`/Jackson 这一步：`UserController` 返回 Java 对象后，Spring MVC 在写响应之前，用 Jackson 把这个 Java 对象序列化成 JSON 字符串，再写入 HTTP 响应体。
</details>

## 本章总结
你已经把内存版 User API 升级成了真正连接 MySQL 的完整四层结构（Controller → Service → Mapper → MySQL），并且能完整讲出一次请求从浏览器到数据库、再原路返回的整条调用链。下一步进入阶段复习 4，梳理数据库与持久层这一整块知识。
