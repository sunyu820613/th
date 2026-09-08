# 第 20 章　Spring MVC 全链路

## 本章目标
先建立一个最简单的心智模型：请求怎么找到 Controller；再在此基础上补全完整链路（HandlerMapping、HandlerAdapter、HttpMessageConverter 等角色分别负责什么）；掌握 `@RequestMapping`/`@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`/`@PathVariable`/`@RequestParam`/`@RequestBody` 这几个常用注解的含义和最小用法。本章不深入 Spring MVC 源码。

## 一句话理解
Spring MVC 的核心思路是：所有请求先统一交给一个"总调度员"（`DispatcherServlet`），由它去找到该由哪个 Controller 方法处理，再负责调用它、把结果处理成响应返回给浏览器。

## 为什么需要它

阶段 1 你学过原始的 Servlet：每一个 URL 都要对应一个 Servlet 类，自己继承 `HttpServlet`、重写 `doGet`/`doPost`。项目一大，Servlet 类会越来越多，URL 和类的映射关系也要一个个手动配置，非常繁琐（这也是第 13 章"从 Servlet 到 MVC"讲过的痛点）。

Spring MVC 的做法是：不再让每个功能对应一个独立的 Servlet 类，而是**只用一个统一的入口 Servlet**（`DispatcherServlet`）接收所有请求，再由它内部去"调度"，找到你写的、用普通 Java 方法表示的 Controller 方法来处理。这样你只需要写业务方法、贴上注解声明"我负责处理哪个 URL"，其余的调度工作全部交给框架完成。

## 核心概念

### 20.1 第一遍：最简心智模型

先不管中间那么多环节，用一句话记住 Spring MVC 最核心的流程：

```
DispatcherServlet → 找到 Controller → 调用 Controller
```

看一个最小的例子：

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring MVC!";
    }
}
```

浏览器访问 `http://localhost:8080/hello` 时，发生的事情可以简化成三步：

1. 请求 `GET /hello` 到达 `DispatcherServlet`（Spring Boot 自动配置好的、唯一的统一入口）。
2. `DispatcherServlet` 找到"谁声明了处理 `/hello` 这个路径"——也就是我们贴了 `@GetMapping("/hello")` 的 `hello()` 方法。
3. `DispatcherServlet` 调用这个方法，拿到返回值 `"Hello, Spring MVC!"`，把它作为响应内容返回给浏览器。

这就是本章要建立的第一层、也是最重要的一层认知：**你写的 Controller 方法，从来不是被浏览器直接调用的，中间一定隔着 `DispatcherServlet` 这个统一入口。**

### 20.2 第二遍：补全完整链路

第一遍的"找到 Controller"其实是被压缩省略掉的两个步骤。完整展开后是这样的：

```
HTTP Request
   ↓
Tomcat（内嵌服务器，接收网络请求）
   ↓
DispatcherServlet（统一入口，所有请求先到这里）
   ↓
HandlerMapping（负责"找谁处理"——根据请求的 URL 和方法，
                查出应该由哪个 Controller 的哪个方法来处理）
   ↓
HandlerAdapter（负责"怎么调用这个处理方法"——不同写法的
                处理方法，调用方式细节不完全一样，由它负责
                统一适配、实际发起调用）
   ↓
Controller 方法（执行你写的业务入口代码，往往会再调用 Service）
   ↓
Service（具体业务逻辑，见下方说明）
   ↓
返回 Java 对象（比如一个 User 对象，或者一个字符串）
   ↓
HttpMessageConverter / Jackson（把 Java 对象转换成 JSON 等格式）
   ↓
HTTP Response（最终返回给浏览器的响应）
```

结合一个更完整的例子看这条链路：

```java
@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getById(id);
    }
}
```

现在逐段回答："**谁调用了 `getUser()`？**"

1. 浏览器发出 `GET /users/1` 请求。
2. 请求先到达 Tomcat（Spring Boot 内嵌的服务器，第 19 章讲过它为什么会自动配置好）。
3. Tomcat 把请求交给 `DispatcherServlet`——这是 Spring MVC 唯一的统一入口，所有请求都先经过它。
4. `DispatcherServlet` 请教 **HandlerMapping**："`GET /users/1` 该由谁处理？" HandlerMapping 内部记录着所有贴了 `@GetMapping`/`@PostMapping` 等注解的方法和 URL 的对应关系，它匹配出应该由 `UserController` 的 `getUser` 方法处理，并且能从 URL 里解析出路径变量 `id = 1`。
5. `DispatcherServlet` 拿到"该由谁处理"的结果后，交给 **HandlerAdapter**，请它负责真正发起调用——因为 `getUser` 方法的参数需要绑定 `@PathVariable Long id`，这个"怎么把路径里的 `1` 转换成 `Long` 类型并传给方法参数"的具体适配工作，就是 HandlerAdapter 负责的。
6. HandlerAdapter 实际调用 `getUser(1L)`——**到这一步，`getUser()` 才真正被执行，调用者是 HandlerAdapter，而不是浏览器，也不是 Tomcat**。
7. `getUser` 方法内部调用 `userService.getById(id)`。这里的 `userService` 是哪来的？——正是第 15、16 章讲过的依赖注入：Spring 容器在创建 `UserController` 这个 Bean 时，已经把 `UserService` 的 Bean 通过构造器注入进来了，`UserController` 不需要自己 `new`。
8. `userService.getById(id)` 具体是怎么去查数据库、找到这个 `User` 对象的，我们要到第 24 章之后学完数据库相关内容才会讲；现在你可以先假设它"已经能够返回一个 `User` 对象"，不需要关心内部实现。
9. `getUser` 方法把 `User` 对象作为返回值交回给 HandlerAdapter，再一路交回给 `DispatcherServlet`。
10. `DispatcherServlet` 发现返回的是一个 Java 对象（不是页面），于是交给 **HttpMessageConverter**（Spring Boot 默认使用 Jackson 这个库来实现）把这个 `User` 对象转换成 JSON 格式的文本。
11. 转换好的 JSON 文本作为 HTTP 响应体，通过 Tomcat 发送回浏览器。

> `Java 对象什么时候变成 JSON？` 就发生在第 10 步——`HttpMessageConverter`/Jackson 这一环。具体它是怎么做转换、字段名对应规则等细节，我们留到第 21 章"JSON 与 Jackson"详细讲，这里只需要知道"发生在链路的哪一步"。

### 20.3 常用注解速览

| 注解 | 含义 | 最小示例 |
|---|---|---|
| `@RequestMapping` | 最基础的路径映射注解，可以指定 URL 和 HTTP 方法，下面几个是它针对具体方法的"简化写法" | `@RequestMapping(value = "/hello", method = RequestMethod.GET)` |
| `@GetMapping` | 处理 `GET` 请求（通常用于"查询"） | `@GetMapping("/users")` |
| `@PostMapping` | 处理 `POST` 请求（通常用于"新增"） | `@PostMapping("/users")` |
| `@PutMapping` | 处理 `PUT` 请求（通常用于"整体更新"） | `@PutMapping("/users/{id}")` |
| `@DeleteMapping` | 处理 `DELETE` 请求（通常用于"删除"） | `@DeleteMapping("/users/{id}")` |
| `@PathVariable` | 把 URL 路径里的一段占位符，绑定到方法参数上 | `@GetMapping("/users/{id}") public User get(@PathVariable Long id)` |
| `@RequestParam` | 获取 URL 问号后面的查询参数（`?key=value` 这种形式） | `@GetMapping("/users") public List<User> list(@RequestParam String name)` |
| `@RequestBody` | 用于接收 JSON 格式的请求体，把请求体自动转换成一个 Java 对象；详细的转换原理放到第 21 章讲 | `@PostMapping("/users") public User create(@RequestBody User user)` |

这几个方法级注解（`@GetMapping` 等）本质上都是 `@RequestMapping` 针对某一种 HTTP 方法的"语法糖"（更简洁的写法），实际项目里几乎总是直接用这些更具体的注解，很少直接写 `@RequestMapping` 加 `method` 参数。

## 图解

（同"核心概念"20.2 小节里的完整链路图，此处不重复贴出。本章的图解重点，就是理解 `HandlerMapping` 负责"找谁处理"、`HandlerAdapter` 负责"怎么调用"这两个角色的分工，它们都夹在 `DispatcherServlet` 和你写的 Controller 方法之间，不需要你手动调用它们，全部由 Spring MVC 内部自动完成。）

## 最小示例

```java
package com.example.hello.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring MVC!";
    }
}
```

## 代码逐行解释

- `@RestController`：贴在类上，前面章节讲过它有两个作用——一是让 Spring 把这个类创建成 Bean（第 15、16 章的内容），二是告诉 Spring MVC"这个类里的方法，返回值应该直接作为响应内容（一般会自动转成 JSON 或者纯文本），而不是当作页面模板名去查找页面"。
- `@GetMapping("/hello")`：贴在方法上，告诉 `HandlerMapping`"当有 `GET /hello` 请求进来时，应该交给这个方法处理"。
- `public String hello()`：方法本身不需要任何特殊写法，就是一个普通的 Java 方法；返回值 `"Hello, Spring MVC!"` 会被 `DispatcherServlet` 直接作为响应内容（因为是 `String` 类型，会被当作纯文本响应，不需要经过 JSON 转换）。

## 程序运行过程

以浏览器访问 `http://localhost:8080/hello` 为例，对照 20.1 小节的三步简化模型：

1. 浏览器发出 `GET /hello` 请求，经 Tomcat 到达 `DispatcherServlet`。
2. `DispatcherServlet` 通过 `HandlerMapping` 找到：这个请求应该由 `HelloController` 的 `hello()` 方法处理。
3. `DispatcherServlet` 通过 `HandlerAdapter` 实际调用 `hello()` 方法（这个方法没有参数，不需要做任何参数绑定，是本章里最简单的情况）。
4. `hello()` 方法执行完毕，返回字符串 `"Hello, Spring MVC!"`。
5. 因为返回值是 `String` 类型，`DispatcherServlet` 直接将其作为响应体的文本内容（不需要 Jackson 转换成 JSON）。
6. 响应通过 Tomcat 返回给浏览器，浏览器页面上显示出 `Hello, Spring MVC!`。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 访问接口返回 `404 Not Found` | URL 拼写和 `@GetMapping` 里写的不一致（大小写、多了/少了斜杠等），或者这个 Controller 类没有被 `@ComponentScan` 扫描到（第 19 章讲过的扫描范围问题） | 仔细核对 URL 拼写；确认 Controller 类在入口类所在包及其子包下 |
| 用浏览器直接访问一个只支持 `POST` 的接口，报 `405 Method Not Allowed` | 浏览器地址栏直接访问默认发起的是 `GET` 请求，和接口声明的 `@PostMapping` 不匹配 | `POST`/`PUT`/`DELETE` 类型的接口需要用 Postman 等工具，或者写代码（比如 `fetch()`，第 33 章会讲）发起对应方法的请求，不能直接在地址栏里访问 |
| `@PathVariable` 绑定的参数名和 URL 占位符名字对不上，报错或拿不到值 | 比如 URL 写 `/users/{id}` 但方法参数名写成 `uid` 且没有显式指定对应关系 | 保证方法参数名和 `{}` 里的占位符名字一致，或者显式写成 `@PathVariable("id") Long uid` |
| 把 `@RequestBody` 用在了 `GET` 请求上，觉得没生效 | `@RequestBody` 是用来接收请求体里的 JSON 数据，`GET` 请求语义上通常不带请求体 | `@RequestBody` 一般搭配 `@PostMapping`/`@PutMapping` 使用；`GET` 请求的参数应该用 `@RequestParam` 或 `@PathVariable` |

## 动手练习

1. 仿照 `HelloController`，自己写一个 `@GetMapping("/ping")`，返回字符串 `"pong"`，启动项目后用浏览器访问验证。
2. 写一个 `@GetMapping("/greet")`，用 `@RequestParam` 接收一个叫 `name` 的查询参数，返回 `"你好，" + name`，用浏览器访问 `http://localhost:8080/greet?name=小明` 验证。
3. 对照 20.2 小节的完整链路图，自己动手默写一遍，尝试不看书说出每一环的名字和职责。

## 小测验

1. 浏览器发出的请求，是直接调用了你写的 Controller 方法吗？中间经过了哪些角色？
2. `HandlerMapping` 和 `HandlerAdapter` 分别负责什么？
3. `@PathVariable` 和 `@RequestParam` 有什么区别？

<details>
<summary>参考答案</summary>

1. 不是直接调用。请求先到达 Tomcat，再交给 `DispatcherServlet`，`DispatcherServlet` 通过 `HandlerMapping` 找到对应的处理方法，再通过 `HandlerAdapter` 实际发起调用，最终才执行到你写的 Controller 方法。
2. `HandlerMapping` 负责"找谁处理"——根据请求的 URL 和方法，查出应该由哪个 Controller 的哪个方法处理；`HandlerAdapter` 负责"怎么调用"——实际发起对这个处理方法的调用，包括处理参数绑定等细节。
3. `@PathVariable` 用于获取 URL 路径中的一段占位符（比如 `/users/{id}` 里的 `id`）；`@RequestParam` 用于获取 URL 问号后面的查询参数（比如 `/users?name=xxx` 里的 `name`）。两者取值的位置不同。
</details>

## 本章总结
你已经建立起 Spring MVC 处理请求的完整心智模型：从最简单的"`DispatcherServlet` → 找到 Controller → 调用 Controller`"，到补全 `HandlerMapping`（找谁处理）、`HandlerAdapter`（怎么调用）、`HttpMessageConverter`/Jackson（对象转 JSON）这几个关键角色的完整链路，也掌握了几个最常用的请求映射和参数绑定注解。是时候用一个真实的、可以运行的项目，把这条链路完整体验一遍了——接下来是 Project 1：Hello Spring Boot。
