# 第 28 章　MyBatis-Plus 入门

## 本章目标
理解 MyBatis-Plus 解决了什么问题；学会用 `BaseMapper<T>` 免去手写基础增删改查 SQL；能给一个 Entity 类加上 `@TableName`/`@TableId` 等基础注解；清楚知道本教程锁定的 MyBatis-Plus 依赖坐标和版本号。

## 一句话理解
MyBatis-Plus 是建立在 MyBatis 之上的增强工具，让你连最简单的"根据 id 查一条""插入一条""改一条""删一条"这种重复性 SQL 都不用再手写。

## 为什么需要它
上一章我们用 MyBatis 写了 `findById`，需要自己写 `@Select` 里的 SQL。但仔细想想：几乎每张表都需要"按 id 查""查全部""插入一条""按 id 改""按 id 删"这几个最基础的操作，SQL 写法几乎一模一样，只是表名和字段不同。如果每张表、每个项目都要重复写这些"万能模板 SQL"，还是一种不必要的体力劳动。MyBatis-Plus 就是为了解决这个问题而生的：**哪怕是最简单的增删改查，也不需要手写一行 SQL**。

## 核心概念

### 28.1 `BaseMapper<T>`：继承即拥有

```java
package com.example.usercrud.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.usercrud.entity.User;

public interface UserMapper extends BaseMapper<User> {
}
```

注意这里连方法体都不用写，甚至连 `@Mapper` 注解在有些配置方式下都可以省略（MyBatis-Plus 提供了 `@MapperScan` 在启动类上统一扫描，本教程为了和上一章保持一致、且更直观，仍然建议显式加上 `@Mapper` 注解）。仅仅是"继承 `BaseMapper<User>`"这一个动作，`UserMapper` 就自动拥有了一批现成的方法，常用的包括：

| 方法 | 作用 |
|---|---|
| `selectById(Long id)` | 按主键查一条 |
| `selectList(Wrapper<T> queryWrapper)` | 按条件查多条（不传条件可查全部） |
| `insert(T entity)` | 插入一条 |
| `updateById(T entity)` | 按主键更新（只更新非空字段） |
| `deleteById(Long id)` | 按主键删除 |

这些方法背后对应的 SQL，MyBatis-Plus 会在运行时根据 Entity 类的信息（表名、主键列、字段列表）自动拼装出来，原理上和你自己写 `@Select`/`@Insert`/`@Update`/`@Delete` 得到的效果是一致的，只是这些"万能模板 SQL"不需要你再写一遍。

### 28.2 给 Entity 加注解

MyBatis-Plus 需要知道"这个 Java 类对应数据库的哪张表、哪一列是主键"，这就要靠几个注解：

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

    // getter/setter 省略
}
```

- `@TableName("user")`：声明这个类对应数据库里的 `user` 表。如果类名（去掉大小写差异后）本来就和表名一致，这个注解甚至可以省略，但显式写出来更清晰，本教程统一显式声明。
- `@TableId(type = IdType.AUTO)`：声明 `id` 是主键，`IdType.AUTO` 表示主键值由数据库自增生成（对应上一章建表 SQL 里的 `AUTO_INCREMENT`）。
- `name`/`email`/`age`：没有额外注解的普通字段，MyBatis-Plus 默认按"属性名和列名相同"的规则自动对应到数据库的同名列。

### 28.3 版本坐标——务必看清楚

**本教程锁定的 Maven 依赖如下**：

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot4-starter</artifactId>
    <version>3.5.17</version>
</dependency>
```

这里有两处必须特别注意：

1. **artifactId 是 `mybatis-plus-spring-boot4-starter`**。这是 **Spring Boot 4 专用坐标**。如果你在网上搜到的教程或旧项目里用的是 `mybatis-plus-boot-starter` 或者 `mybatis-plus-spring-boot3-starter`，那些是给 **Spring Boot 3** 项目用的坐标，**不能直接照抄**到本教程的 Spring Boot 4.1.1 项目里——用错坐标轻则依赖冲突、重则启动直接报错。本教程从这一章开始统一使用 `mybatis-plus-spring-boot4-starter`。
2. **版本号统一写 `3.5.17`**。这是本教程锁定的版本号，从这一章到最终项目（第 37 章）全程使用这一个版本号，不要再纠结"是不是应该用最新版"，直接照抄本教程给出的版本号即可。

> 加了 `mybatis-plus-spring-boot4-starter` 之后，它已经内部包含了 MyBatis 的能力，不需要再额外重复引入上一章的 `mybatis-spring-boot-starter`（两者选其一：只用 MyBatis 原生方式就只引 `mybatis-spring-boot-starter`；用 MyBatis-Plus 就只引 `mybatis-plus-spring-boot4-starter`，本教程 Project 3 及之后统一使用后者）。

## 图解

```
MyBatis（第 27 章）
  └── 你自己写 @Select/@Insert/@Update/@Delete 里的 SQL

MyBatis-Plus（本章，建立在 MyBatis 之上）
  └── UserMapper extends BaseMapper<User>
        └── 自动获得 selectById / selectList / insert / updateById / deleteById
              （SQL 由 MyBatis-Plus 在运行时根据 @TableName/@TableId 自动拼装，你不用写）
```

## 最小示例

```java
// User.java
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

    // getter/setter 省略
}
```

```java
// UserMapper.java
package com.example.usercrud.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
```

在 Service 里直接使用这些自带方法：

```java
package com.example.usercrud.service;

import com.example.usercrud.entity.User;
import com.example.usercrud.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    public void createUser(User user) {
        userMapper.insert(user);
    }

    public void updateUser(User user) {
        userMapper.updateById(user);
    }

    public void deleteUser(Long id) {
        userMapper.deleteById(id);
    }
}
```

## 代码逐行解释

- `userMapper.selectById(id)`：等价于第 27 章手写的 `@Select("select * from user where id = #{id}")`，但这里一行 SQL 都没写，`BaseMapper` 已经内置了这个方法。
- `userMapper.insert(user)`：把 `user` 对象里非空的属性，自动拼装成一条 `INSERT INTO user (...) VALUES (...)` 并执行；如果 `id` 用了 `IdType.AUTO`，插入成功后 `user.id` 会被自动回填成数据库生成的自增值。
- `userMapper.updateById(user)`：要求 `user.id` 不能为空，MyBatis-Plus 会以 `id` 为条件，把 `user` 对象里其余非空字段更新到对应行。
- `userMapper.deleteById(id)`：等价于 `DELETE FROM user WHERE id = ?`。

## 程序运行过程

1. Service 调用 `userMapper.selectById(id)`。
2. 和第 27 章一样，`userMapper` 实际是 MyBatis（被 MyBatis-Plus 增强后）动态生成的代理对象。
3. MyBatis-Plus 根据 `User` 类上的 `@TableName("user")` 和 `@TableId` 信息，在运行时自动拼装出等价于 `SELECT * FROM user WHERE id = ?` 的 SQL。
4. 后续步骤（取连接、绑参数、执行、取结果、映射成 `User` 对象、归还连接）和第 27 章完全一样，只是这一次连"写 SQL"这一步都被自动化了。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 启动报错，提示找不到 `mybatis-plus-boot-starter` 相关类，或依赖冲突 | 照抄了网上 Spring Boot 3 教程的坐标 `mybatis-plus-boot-starter`/`mybatis-plus-spring-boot3-starter` | 本教程 Spring Boot 4 项目必须使用 `mybatis-plus-spring-boot4-starter` |
| `updateById` 执行后发现某些字段被清空了 | 误以为 `updateById` 会更新所有字段，但传入的对象里某些字段没赋值（为 `null`） | `updateById` 默认只更新非空字段；如果确实想清空某个字段，需要显式赋值再传入 |
| `Table 'usercrud_db.users' doesn't exist` | 类名是 `User`，MyBatis-Plus 按默认规则猜测表名为复数或下划线形式，和实际表名 `user` 不一致 | 显式加 `@TableName("user")`，不要依赖默认猜测规则 |

## 动手练习

1. 在 `UserService` 里新增一个方法，调用 `userMapper.selectList(null)` 查出所有用户，观察它和第 27 章手写 `findAll` 的效果是否一致。
2. 尝试去掉 `@TableId(type = IdType.AUTO)`，改成不写 `type`，查阅一下默认的 `IdType` 是什么（提示：默认是全局唯一 ID 生成策略，不一定是数据库自增，这里先了解即可，本教程统一显式使用 `IdType.AUTO`）。
3. 说说看，为什么 Spring Boot 3 项目和 Spring Boot 4 项目的 MyBatis-Plus 依赖坐标不一样？如果照抄错了会有什么后果？

## 小测验

1. `UserMapper extends BaseMapper<User>` 之后，自动获得了哪些常用方法？
2. 本教程锁定的 MyBatis-Plus 依赖 artifactId 和版本号分别是什么？
3. 为什么不能直接把 Spring Boot 3 教程里的 `mybatis-plus-boot-starter` 坐标照抄到本教程项目里？
4. `@TableId(type = IdType.AUTO)` 是什么意思？

<details>
<summary>参考答案</summary>

1. 常见的有 `selectById`、`selectList`、`insert`、`updateById`、`deleteById` 等，不需要手写 SQL。
2. artifactId 为 `mybatis-plus-spring-boot4-starter`，版本号为 `3.5.17`。
3. 因为 `mybatis-plus-boot-starter`（以及 `mybatis-plus-spring-boot3-starter`）是给 Spring Boot 3 设计的坐标，和 Spring Boot 4 的兼容性、内部依赖版本不同，直接照抄可能导致依赖冲突或启动报错；Spring Boot 4 必须使用专门适配的 `mybatis-plus-spring-boot4-starter`。
4. 表示这个字段是主键，且主键值由数据库自增（`AUTO_INCREMENT`）生成，插入后 MyBatis-Plus 会自动把生成的主键值回填到对象里。
</details>

## 本章总结
你已经理解了 MyBatis-Plus 解决的痛点，学会了用 `BaseMapper<T>` 免去手写基础 SQL，并记住了本教程锁定的依赖坐标 `mybatis-plus-spring-boot4-starter:3.5.17`。下一章学习事务 `@Transactional`——保证一组数据库操作要么全部成功、要么全部撤销。
