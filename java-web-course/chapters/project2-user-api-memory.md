# Project 2　内存版 User API

## 项目目标
综合运用前面几章学到的内容，做出一套完整、可运行的 RESTful 接口：`GET /users`、`GET /users/{id}`、`POST /users`、`PUT /users/{id}`、`DELETE /users/{id}`。数据先不连数据库，直接存在内存的 `List<User>` 里——数据库要到第 24 章之后才会学。

## 你将练习到的知识点
- 第 15、16 章：IoC/DI、Bean、**构造器注入**（Controller 依赖 Service，用构造器注入，不用字段注入）
- 第 18～20 章：Spring Boot 项目结构、`@SpringBootApplication`、Spring MVC 全链路
- 第 21 章：Jackson 序列化/反序列化（`User` 对象 ↔ JSON）
- 第 22 章：RESTful 风格 URL 设计（资源 + HTTP Method）

> 提前说明一句：这个项目里 Controller 直接返回 `User` 这个 Entity 本身，没有用 DTO，也没有做参数校验、没有做异常处理（比如查询一个不存在的 id，现在只会返回 `null` 而不是规范的 404）。这些都是刻意先跳过的——DTO 在第 30 章讲，参数校验在第 31 章，全局异常处理在第 32 章。企业项目通常不会像这里一样把 Entity 直接暴露给前端，具体原因会在第 30 章详细解释，这里先把"分层 + REST 风格接口"这个主干跑通。

## 项目结构

项目名：`user-api-memory`，包名：`com.example.userapi`。

```
user-api-memory/
├── pom.xml
└── src/main/java/com/example/userapi/
    ├── UserApiMemoryApplication.java   # 入口类
    ├── entity/
    │   └── User.java                   # 用户实体
    ├── service/
    │   └── UserService.java            # 业务逻辑 + 内存数据存储
    └── controller/
        └── UserController.java         # REST 接口
```

## 完整代码

`pom.xml`（关键部分，Spring Boot 版本按全教程统一锁定的 4.1.1）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
    </parent>

    <groupId>com.example</groupId>
    <artifactId>user-api-memory</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
            <!-- 版本由 spring-boot-starter-parent 的 BOM 统一管理，无需手写版本号 -->
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

入口类 `UserApiMemoryApplication.java`：

```java
package com.example.userapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class UserApiMemoryApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserApiMemoryApplication.class, args);
    }
}
```

实体类 `entity/User.java`：

```java
package com.example.userapi.entity;

public class User {

    private Long id;
    private String name;
    private Integer age;

    public User() {
        // Jackson 反序列化需要无参构造方法，第 21 章讲过原因
    }

    public User(Long id, String name, Integer age) {
        this.id = id;
        this.name = name;
        this.age = age;
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

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }
}
```

Service 层 `service/UserService.java`：

```java
package com.example.userapi.service;

import com.example.userapi.entity.User;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class UserService {

    // 用 List 模拟数据库表，数据只存在内存里，重启程序就会清空
    private final List<User> users = new ArrayList<>();

    // 用来生成自增 id，模拟数据库的主键自增
    private final AtomicLong idGenerator = new AtomicLong(0);

    public List<User> findAll() {
        return users;
    }

    public User findById(Long id) {
        for (User user : users) {
            if (user.getId().equals(id)) {
                return user;
            }
        }
        return null; // 找不到先返回 null，规范的 404 处理留到第 32 章
    }

    public User create(User user) {
        long newId = idGenerator.incrementAndGet();
        user.setId(newId);
        users.add(user);
        return user;
    }

    public User update(Long id, User newData) {
        User existing = findById(id);
        if (existing == null) {
            return null;
        }
        existing.setName(newData.getName());
        existing.setAge(newData.getAge());
        return existing;
    }

    public boolean delete(Long id) {
        return users.removeIf(u -> u.getId().equals(id));
    }
}
```

Controller 层 `controller/UserController.java`：

```java
package com.example.userapi.controller;

import com.example.userapi.entity.User;
import com.example.userapi.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    // 构造器注入：第 16 章教过，优先用这种方式，不用字段注入（@Autowired 写在字段上）
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> listUsers() {
        return userService.findAll();
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.findById(id);
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.create(user);
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        return userService.update(id, user);
    }

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id) {
        boolean removed = userService.delete(id);
        return removed ? "删除成功" : "用户不存在";
    }
}
```

## 代码逐行解释

- `@Service` 标注在 `UserService` 上：告诉 Spring "把这个类交给容器管理，创建成一个 Bean"，这样别的类才能通过构造器注入拿到它（第 15、16 章的内容）。
- `UserController` 里 `private final UserService userService;` + 构造方法：这就是**构造器注入**——Spring 创建 `UserController` 这个 Bean 时，发现构造方法需要一个 `UserService` 参数，就先去容器里找（或创建）一个 `UserService` 的 Bean，再把它传进来。这样写的好处是 `userService` 可以用 `final` 修饰，一旦赋值就不能再改，也不需要在类上写 `@Autowired`。
- `@RequestMapping("/users")` + 五个 Method 注解：完全对应第 22 章讲的 REST 设计——同一个资源前缀 `/users`，靠 `@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping` 区分出五种不同操作。
- `AtomicLong idGenerator`：用来模拟数据库自增主键。每次新增用户，`incrementAndGet()` 让 id 加一并返回新值，保证每个用户 id 唯一（还没学数据库，先用这种方式代替"数据库自动生成主键"）。
- `findById` 返回 `null` 表示没找到：这是本项目故意简化的地方，正常的做法是抛异常并统一转换成 `404 Not Found`，这是第 32 章"全局异常处理"要解决的问题，这里先不引入。

## 启动与测试

先用 `mvn spring-boot:run`（或者在 IDEA 里直接运行 `UserApiMemoryApplication`）启动项目，默认监听 `8080` 端口。下面用 `curl` 演示每个接口，也可以把同样的请求内容丢进 Postman（一个图形化的接口测试工具，不用手写 `curl` 命令，填好方法/URL/请求体点发送即可）——下载地址：https://www.postman.com/downloads/ 。

**1. 查询所有用户（此时应该是空列表）**

```bash
curl http://localhost:8080/users
```

响应：
```json
[]
```

**2. 新增一个用户**

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Tom", "age": 20}'
```

响应（id 由服务端自动生成）：
```json
{"id": 1, "name": "Tom", "age": 20}
```

再新增一个：

```bash
curl -X POST http://localhost:8080/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Jerry", "age": 22}'
```

响应：
```json
{"id": 2, "name": "Jerry", "age": 22}
```

**3. 再次查询所有用户**

```bash
curl http://localhost:8080/users
```

响应：
```json
[
  {"id": 1, "name": "Tom", "age": 20},
  {"id": 2, "name": "Jerry", "age": 22}
]
```

**4. 查询单个用户**

```bash
curl http://localhost:8080/users/1
```

响应：
```json
{"id": 1, "name": "Tom", "age": 20}
```

**5. 更新用户（PUT，整体替换）**

```bash
curl -X PUT http://localhost:8080/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Tom Updated", "age": 21}'
```

响应：
```json
{"id": 1, "name": "Tom Updated", "age": 21}
```

**6. 删除用户**

```bash
curl -X DELETE http://localhost:8080/users/2
```

响应：
```
删除成功
```

再查一次全部用户，会发现只剩 id 为 1 的那个了。

## 程序运行过程（以 POST /users 为例）

1. Postman/curl 发起 `POST /users` 请求，请求体是一段 JSON 文本。
2. Tomcat 接收请求，交给 `DispatcherServlet`。
3. `HandlerMapping` 根据"URL `/users` + Method `POST`"匹配到 `UserController.createUser` 方法。
4. 在真正调用方法之前，`HandlerAdapter` 发现参数 `user` 上有 `@RequestBody`，于是把请求体交给 Jackson 做反序列化，生成一个 `User` 对象（此时 `id` 还是 `null`，因为前端没传）。
5. `HandlerAdapter` 调用 `createUser(user)`。
6. 方法内部调用 `userService.create(user)`——**Service 从哪里来？** 就是构造器注入进来的那个 `UserService` Bean，是 Spring 容器在启动阶段扫描 `@Service` 注解创建好、并在创建 `UserController` 时自动传进来的，不是我们在方法里手动 `new` 出来的。
7. `UserService.create` 生成一个新 id，把用户存进内存的 `List<User>` 里，返回这个填好 id 的对象。
8. Controller 方法把这个对象原样返回。
9. Spring 通过 `HttpMessageConverter`（Jackson）把返回的 `User` 对象序列化成 JSON。
10. JSON 文本作为响应体，原路返回给发起请求的一方。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `POST /users` 返回的 `id` 一直是 `null` | 忘记在 `UserService.create` 里调用 `user.setId(newId)` | 检查 create 方法逻辑，确认赋值那一步没漏 |
| 重启项目后数据全没了 | 数据存在内存 `List` 里，程序结束进程就释放内存 | 这是本项目预期行为，正式持久化要等到第 24 章之后连数据库 |
| `curl` 请求报 415 Unsupported Media Type | 没加 `-H "Content-Type: application/json"`，服务端不知道请求体是 JSON | 补上这个请求头 |
| `PUT /users/{id}` 更新一个不存在的 id，返回体是空的 | `update` 方法里 `findById` 没找到时返回了 `null` | 这属于本项目故意留白的部分，规范处理见第 32 章"全局异常处理" |
| Controller 报错找不到 `UserService` 的 Bean | 忘记在 `UserService` 类上加 `@Service` 注解 | 补上 `@Service` |

## 动手练习

1. 给 `User` 加一个 `email` 字段（记得同步加 getter/setter），重新测试所有接口，确认新字段能正常序列化/反序列化。
2. 尝试新增一个"按名字模糊查询用户"的接口，思考它应该设计成 `GET /users?name=xxx` 还是别的 URL，说说理由（提示：这仍然是在查询 `users` 这个资源集合，只是加了过滤条件）。
3. 故意把 `UserController` 里的构造器注入改成字段注入（`@Autowired private UserService userService;`），观察功能是否依然正常，再改回来，体会两种写法在运行效果上其实一样，只是第 16 章推荐使用构造器注入的写法。

## 本章总结
你完成了第一个"分层 + REST 风格"的完整接口项目：Controller 负责接收请求，Service 负责业务逻辑和数据存储，两者之间通过构造器注入连接，URL 设计遵循第 22 章的资源风格。数据目前存在内存里，比较"脆弱"——这也是下一阶段要引入数据库的动机。继续往下学，第 23 章讲配置文件、日志和打包运行，之后就要正式进入数据库的世界了。
