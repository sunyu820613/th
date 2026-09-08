# 第 27 章　JDBC 与 MyBatis 入门

## 本章目标
理解 JDBC 是什么、原始 JDBC 代码为什么繁琐；学会用 MyBatis 写第一个 `@Mapper` 接口，理解 `@Select` 和 `#{}` 占位符的作用；理解"接口没有实现类，为什么也能被调用"。

## 一句话理解
JDBC 是 Java 官方定义的"怎么访问数据库"的标准接口，但直接用它写代码非常繁琐；MyBatis 就是在 JDBC 之上做了一层封装，让你只需要写 SQL 和方法签名，剩下的样板代码它帮你搞定。

## 为什么需要它
上一章我们让 Spring Boot 连上了 MySQL，但连上之后呢？总得有一种方式，让 Java 代码真正把 SQL 发出去、把结果取回来，还要转换成 Java 对象方便使用。这一层工作最早由 JDBC 承担，但写法太繁琐，于是有了 MyBatis 这样的框架来简化它。

## 核心概念

### 27.1 JDBC 是什么

**JDBC（Java Database Connectivity）** 是 Java 官方定义的一套"访问数据库"的标准接口。不管你用 MySQL、PostgreSQL 还是其它数据库，只要有对应的 JDBC 驱动（上一章提到的 `mysql-connector-j` 就是 MySQL 的 JDBC 驱动），Java 代码都可以用同一套 JDBC API 去操作它们。

来看一段最原始的 JDBC 代码，作用是"查出 `id = 1` 的用户"：

```java
String url = "jdbc:mysql://localhost:3306/usercrud_db?useSSL=false&serverTimezone=Asia/Shanghai";
String username = "root";
String password = "your_password";

try (Connection conn = DriverManager.getConnection(url, username, password)) {
    String sql = "select id, name, email, age from user where id = ?";
    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
        stmt.setLong(1, 1L);
        try (ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Long id = rs.getLong("id");
                String name = rs.getString("name");
                String email = rs.getString("email");
                Integer age = rs.getInt("age");
                System.out.println(id + ", " + name + ", " + email + ", " + age);
            }
        }
    }
} catch (SQLException e) {
    e.printStackTrace();
}
```

感受一下：只是查一条数据，就要手动建立 `Connection`（连接）、拼 SQL 字符串、创建 `PreparedStatement`（预编译语句）、手动 `setLong` 绑定参数、执行查询拿到 `ResultSet`（结果集）、还要写一个 `while (rs.next())` 循环手动把每一列取出来、一个个赋值给 Java 变量……**每查一次表都要重复这一整套样板代码**，稍微多几张表、多几个查询方法，代码量会迅速膨胀，而且大量代码长得几乎一模一样，纯粹是体力劳动。

这就是 MyBatis 出现的原因：**把"建连接、拼 SQL、绑参数、取结果、关资源"这些重复劳动自动化**，你只需要专注在"SQL 怎么写"和"结果映射成哪个 Java 类"上。

### 27.2 MyBatis 基础：`@Mapper` + `@Select`

```java
package com.example.usercrud.mapper;

import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {

    @Select("select * from user where id = #{id}")
    User findById(Long id);
}
```

这几行代码做的事情，和上面那一大段原始 JDBC 代码完全等价——但你不需要手写 `Connection`/`PreparedStatement`/`ResultSet` 里的任何一行。

### 27.3 逐个注解拆解

- **`@Mapper`**：这是 MyBatis 提供的注解，作用是"告诉 Spring：把这个接口注册成一个可以被注入使用的 Bean"。

  这里有一个初学者一定会疑惑的点：**`UserMapper` 只是一个 `interface`，连实现类都没写，凭什么能被创建成 Bean、被注入进 Service 里使用？**

  答案是：**MyBatis 在背后用"动态代理"技术，在程序运行时自动帮你生成了这个接口的实现类**——你从来不需要自己写 `UserMapperImpl`。你可以把它想象成：MyBatis 拿到 `UserMapper` 接口后，"照着接口的样子"在内存里现造了一个类，这个类的每个方法内部，其实就是去执行你在 `@Select` 里写的那句 SQL、再把结果转换成方法声明的返回类型。对使用者（比如 Service 层）来说，感觉就是在正常调用一个接口方法，完全感知不到"背后其实是动态生成的代理对象"这件事。

- **`@Select("select * from user where id = #{id}")`**：声明这个方法对应的 SQL 语句是什么。方法名 `findById` 本身对 MyBatis 没有任何魔法作用（不像有些框架靠方法名自动生成 SQL），SQL 完全是你在注解里显式写出来的。

- **`#{id}` 占位符**：对应方法参数 `Long id`。MyBatis 执行时会把它替换成一个 JDBC 的 `?` 预编译占位符，再安全地把参数值绑定进去——效果上等同于上面原始 JDBC 代码里 `stmt.setLong(1, id)` 那一步，只是 MyBatis 帮你自动做了。

  **为什么不直接用字符串拼接 `"select * from user where id = " + id`？** 因为字符串拼接存在 **SQL 注入**风险：如果 `id` 这个值来自用户输入，恶意用户可以构造出类似 `1 OR 1=1` 这样的内容，拼接后整条 SQL 的逻辑被彻底改变，可能导致查出所有数据甚至更严重的后果。而 `#{}` 占位符走的是预编译机制，参数值永远只会被当作"一个普通的值"处理，不会被解释成 SQL 的一部分，从根本上避免了这个问题。**结论：凡是涉及外部输入的 SQL 参数，一律用 `#{}` 占位符，绝不手动拼接字符串。**

> **补充**：本教程简单场景统一用注解方式（`@Select`/`@Insert`/`@Update`/`@Delete` 写在接口方法上）。实际项目里如果 SQL 比较复杂（比如多表关联、动态拼接条件），通常会把 SQL 写在单独的 XML 文件里（俗称 "XML Mapper"），原理和注解方式完全一样，只是 SQL 存放的位置从注解变成了 XML 文件。本教程不展开完整的 XML Mapper 示例，遇到复杂场景时你已经理解了底层原理，学习 XML 写法不会有障碍。

### 27.4 Maven 依赖（版本锁定）

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>4.0.0</version>
</dependency>
```

**版本说明**：`mybatis-spring-boot-starter` 的 **4.0.0** 版本是官方明确兼容 Spring Boot 4.0 及以上、Java 17 及以上的版本，和本教程锁定的 Spring Boot 4.1.1 + Java 21 组合是合适的。**注意范围**：本章是为了单独学习"原生 MyBatis 怎么工作"才引入 `mybatis-spring-boot-starter:4.0.0`；从下一章（第 28 章）切换到 MyBatis-Plus 之后，`mybatis-plus-spring-boot4-starter` 内部已经包含了运行 MyBatis 所需的核心能力，Project 3 和最终项目都**不再单独引入**这个原生 Starter——不是"从这一章到最终项目一直用它"，而是只在这一章学原理时用一下。

## 图解

```
原始 JDBC 方式：
Java 代码
  → 手动 DriverManager.getConnection()
  → 手动拼 SQL 字符串 + PreparedStatement
  → 手动 setXxx() 绑定每个参数
  → 手动 executeQuery()
  → 手动 while(rs.next()) 逐列取值、逐个赋值
  → 手动关闭 Connection/Statement/ResultSet
（每次查询都要重复这一整套）

MyBatis 方式：
Java 代码
  → 只写一个 interface 方法 + @Select 注解里的 SQL
  → MyBatis 动态代理自动生成实现类
  → 调用方法时，MyBatis 自动完成"建连接→绑参数→执行→取结果→转成 Java 对象→关资源"
```

## 最小示例

```java
package com.example.usercrud.entity;

public class User {
    private Long id;
    private String name;
    private String email;
    private Integer age;
    // getter/setter 省略
}
```

```java
package com.example.usercrud.mapper;

import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {

    @Select("select * from user where id = #{id}")
    User findById(Long id);
}
```

在 Service 里像使用普通对象一样注入并调用它：

```java
package com.example.usercrud.service;

// ...省略 import

@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public User getUserById(Long id) {
        return userMapper.findById(id);
    }
}
```

## 代码逐行解释

- `private final UserMapper userMapper;` + 构造器注入：和之前章节讲过的构造器注入完全一样（第 16 章）。Spring 在创建 `UserService` 这个 Bean 时，发现构造器需要一个 `UserMapper` 类型的参数，就会去容器里找——而 `@Mapper` 标注的接口，正是因为被 MyBatis 动态代理生成了实现类并注册成 Bean，才能被这里成功注入。
- `userMapper.findById(id)`：从代码写法上看，这就是普通的接口方法调用；实际执行时，走的是 MyBatis 生成的代理对象，代理对象内部会执行 `@Select` 里的 SQL，并把查询结果（一行数据）自动映射成一个 `User` 对象返回。MyBatis 默认按"列名和 Java 属性名相同（不区分大小写）"的规则自动完成这个映射，比如查询结果的 `email` 列会自动赋值给 `User` 对象的 `email` 属性。

## 程序运行过程

1. Service 方法调用 `userMapper.findById(id)`。
2. 因为 `userMapper` 实际指向的是 MyBatis 动态生成的代理对象，代理对象接管这次调用。
3. MyBatis 从上一章配置好的数据源（连接池）里取出一条数据库连接。
4. MyBatis 把 `@Select` 注解里的 SQL 和 `#{id}` 占位符转换成 JDBC 的 `PreparedStatement`，并把参数 `id` 安全绑定进去。
5. 执行查询，MySQL 返回结果集。
6. MyBatis 遍历结果集，按列名自动映射，把这一行数据封装成一个 `User` 对象。
7. MyBatis 把连接归还给连接池，把 `User` 对象作为方法返回值交还给 Service。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `Invalid bound statement (not found)` | `UserMapper` 接口没有被 MyBatis 扫描到，或方法和 SQL 没对应上 | 确认接口上有 `@Mapper` 注解，且方法名、参数没写错 |
| 用 `+` 拼接 SQL 字符串，被认为存在安全隐患 | 没用 `#{}` 占位符，而是手动拼接参数值 | 涉及外部输入的参数一律改用 `#{}` 占位符 |
| 查询结果对象里某个字段一直是 `null` | 数据库列名和 Java 属性名对不上（比如列名 `user_name`，属性名 `userName`） | 确认命名一致，或使用 `@Results`/XML `resultMap` 做映射（本教程暂不展开） |
| 依赖版本冲突或启动报错 | 引入了和 Spring Boot 4 不兼容的 MyBatis Starter 版本 | 严格使用本章锁定的 `mybatis-spring-boot-starter:4.0.0` |

## 动手练习

1. 在 `UserMapper` 里再加一个方法 `List<User> findAll();`，配上 `@Select("select * from user")`，查出所有用户。
2. 尝试把 `#{id}` 改写成字符串拼接的写法（仅用于观察，不要在真实项目里这样做），思考如果 `id` 来自用户输入会有什么风险。
3. 想一想：为什么 `UserMapper` 明明只是一个 `interface`，你却能像调用普通对象方法一样调用 `userMapper.findById(id)`？试着自己复述一遍"动态代理"的原理。

## 小测验

1. 原始 JDBC 代码里，哪几个步骤是 MyBatis 帮你自动化掉的？
2. `@Mapper` 标注的接口没有写实现类，为什么还能正常工作？
3. `#{}` 占位符解决了什么安全问题？
4. 本教程锁定的 MyBatis Spring Boot Starter 版本号是多少？

<details>
<summary>参考答案</summary>

1. 建立连接、拼装 `PreparedStatement`、绑定参数、执行 SQL、遍历 `ResultSet` 取值并转换成 Java 对象、关闭资源，这些都由 MyBatis 自动完成。
2. 因为 MyBatis 在运行时用动态代理技术，根据接口定义自动生成了一个实现类，处理"建连接、执行 SQL、封装结果"这些工作，开发者不需要自己写实现类。
3. 解决 SQL 注入问题。`#{}` 占位符通过预编译机制绑定参数，参数值永远只被当作普通数据处理，不会被解释成 SQL 语法的一部分。
4. `org.mybatis.spring.boot:mybatis-spring-boot-starter:4.0.0`。
</details>

## 本章总结
你已经理解了 JDBC 的繁琐之处，学会了用 `@Mapper` + `@Select` + `#{}` 写出第一个 MyBatis 查询方法，并理解了"接口为什么没有实现类也能工作"这个关键原理。下一章学习 MyBatis-Plus——它能让你连最基础的增删改查 SQL 都不用手写。
