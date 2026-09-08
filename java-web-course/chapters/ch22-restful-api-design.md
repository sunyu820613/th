# 第 22 章　RESTful API 设计

## 本章目标
理解"资源""URI""HTTP Method""状态码"这几个概念是怎么组合成一套 URL 设计风格的；能按 REST 风格设计一组基本的增删改查接口；清楚地知道 REST 是约定而不是语法规则。

## 一句话理解
REST 说的是"用名词表示资源，用 HTTP 方法表示动作"——URL 里只写"是什么"（`/users`），"要干什么"交给 GET/POST/PUT/DELETE 去表达，而不是把动词也塞进 URL 里。

## 为什么需要它
第 20、21 章我们已经能写出能跑的 Controller 了，接口能用，但"能用"和"设计得好"是两回事。如果每个人写接口都随手起名字，团队协作起来会很痛苦：一个人写 `/getUser`，另一个人写 `/user/query`，还有人写 `/fetchUserInfo`——功能类似的接口，命名风格完全不统一，新人接手时得一个个去看代码才知道每个接口是干嘛的。RESTful 是业界总结出来的一套"大家都这么起名字"的约定，学会它，你的接口设计一眼就能被同行看懂。

## 核心概念

### 22.1 资源（Resource）

REST 的核心思想是：**把系统里的一切都看成"资源"**，资源通常对应一类"东西"，比如"用户"、"订单"、"文章"。资源用**名词**表示，而且通常用复数形式，比如 `users`、`orders`。

### 22.2 URI：资源的地址

URI（可以先简单理解成 URL）用来定位一个资源或者一组资源：

- `/users`：所有用户这个"集合"
- `/users/1`：编号为 1 的这一个用户

注意 URI 里**只出现名词，不出现动词**。"查询""新增""删除"这些动作，不应该写进 URL 里（比如不写 `/queryUsers`、`/deleteUser`），动作交给下面要讲的 HTTP Method 去表达。

### 22.3 HTTP Method：表达"要对资源做什么动作"

同一个 URI，配合不同的 HTTP 方法，表示对这个资源做不同的操作：

| HTTP Method | 语义 | 例子 |
|---|---|---|
| `GET` | 查询，不会修改数据 | `GET /users` 查所有用户，`GET /users/1` 查 1 号用户 |
| `POST` | 新增一个资源 | `POST /users`，请求体带上新用户的数据 |
| `PUT` | 整体替换（更新）一个已有资源 | `PUT /users/1`，请求体带上这个用户的完整新数据 |
| `DELETE` | 删除一个资源 | `DELETE /users/1` |

把"资源"和"动作"分开之后，同一个 URI `/users/1` 配上不同方法，含义就完全不同：

```
GET    /users        → 查询所有用户
GET    /users/{id}   → 查询某个用户
POST   /users        → 新增一个用户
PUT    /users/{id}   → 更新某个用户
DELETE /users/{id}   → 删除某个用户
```

这就是本章要求你记住并会用的一组标准写法。

### 22.4 状态码：表达"结果怎么样"

HTTP 状态码在第 10 章已经学过基础含义，这里结合 REST 接口再强调几个最常用的：

| 状态码 | 含义 | 典型场景 |
|---|---|---|
| `200 OK` | 请求成功 | `GET`/`PUT`/`DELETE` 成功 |
| `201 Created` | 创建成功 | `POST` 新增资源成功 |
| `400 Bad Request` | 请求参数有问题 | 前端传的数据格式不对 |
| `404 Not Found` | 资源不存在 | 查询一个不存在的用户 id |
| `500 Internal Server Error` | 服务器内部出错 | 代码抛了没处理的异常 |

> 状态码的精细控制（比如"用户不存在时怎么优雅地返回 404 而不是 500"）要用到全局异常处理，这是第 32 章的内容，这里先知道有这几个状态码、大致什么时候用即可。

### 22.5 对比：不规范的设计长什么样

把"动作"写进 URL、用 URL 表达动词，是最常见的反例：

```
GET  /getUser?id=1        ← 动词 get 出现在 URL 里，是多余的
GET  /addUser              ← 用 GET 去做新增，语义和方法完全对不上
POST /deleteUser?id=1      ← 用 POST 去做删除，也是语义不匹配
```

这种写法的问题不是"跑不起来"——它完全可以正常工作，服务器该怎么处理还是怎么处理。问题在于：URL 里的动词和实际用的 HTTP 方法经常对不上（比如用 `GET` 实现"新增"），阅读代码或者接口文档的人没法只看一眼 URL 和方法就判断出这个接口在做什么，得每个都点开看实现。

### 22.6 REST 是风格，不是语法规则

这一点必须说清楚：**REST 是一种设计风格、一种团队协作的约定，不是 Java 或 Spring 强制要求的语法规则**。你完全可以继续写 `/getUser`、`/addUser` 这样的接口，Spring 不会因此报错，程序照样能跑起来、能被浏览器和 Postman 正常访问。

选择遵守 REST 风格，图的是：

- 团队里的人一看 URL + Method 组合，就能猜到接口在干什么，不用每次都翻文档
- 前后端约定接口时有一套通用语言，减少沟通成本
- 接口多了之后，命名依然保持统一、不混乱

也就是说，**不遵守 REST，代码能跑；遵守 REST，是为了让代码在"能跑"之外，还"好维护、好协作"**。这是本章最重要的一句话，请记住。

### 22.7 补充一点：PUT 和 PATCH 的区别

标准 HTTP 方法里还有一个 `PATCH`，很多人会跟 `PUT` 搞混：

- `PUT`：**整体替换**。请求体要带上这个资源完整的新数据，服务器用它整个覆盖掉原来的数据。
- `PATCH`：**部分更新**。请求体只带你想改的那几个字段，其余字段保持不变。

举例：一个用户有 `name` 和 `age` 两个字段，你只想改 `age`。用 `PUT` 的话，理论上请求体要把 `name` 和 `age` 都带上（哪怕 `name` 没变）；用 `PATCH` 的话，请求体只需要带 `{"age": 20}` 就够了。本教程后续项目里为了简化，主要使用 `PUT` 做更新，`PATCH` 你只需要知道它是干什么用的，点到为止，不深入展开。

## 图解

```
资源（名词）        +   HTTP Method（动作）   =    完整语义
/users                  GET                       查询所有用户
/users/{id}             GET                       查询某一个用户
/users                  POST                       新增一个用户
/users/{id}             PUT                        整体更新某个用户
/users/{id}             DELETE                     删除某个用户

           ✕ 反例：把动作硬塞进 URL
/getUser  /addUser  /deleteUser   ← URL 里出现动词，职责和 Method 重复/冲突
```

## 最小示例

延续第 21 章的 `User` 类，按 REST 风格给出一组 Controller 方法框架（本章先看写法，完整可运行版本放在下一节 Project 2 里）：

```java
package com.example.userapi.controller;

import com.example.userapi.entity.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping
    public List<User> listUsers() {
        // 对应 GET /users
        return null; // 具体实现见 Project 2
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        // 对应 GET /users/{id}
        return null;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        // 对应 POST /users
        return null;
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        // 对应 PUT /users/{id}
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        // 对应 DELETE /users/{id}
    }
}
```

## 代码逐行解释

- `@RequestMapping("/users")`：写在类上，表示这个 Controller 里所有方法的 URL 都以 `/users` 开头，避免每个方法重复写一遍前缀。
- `@GetMapping`（不带路径）：结合类上的 `/users`，完整路径是 `GET /users`，表示"查询所有用户"这个集合资源。
- `@GetMapping("/{id}")`：完整路径 `GET /users/{id}`，`{id}` 是路径变量（占位符），配合 `@PathVariable Long id` 把 URL 里的这一段取出来，赋给方法参数 `id`。
- `@PostMapping`：完整路径 `POST /users`，配合 `@RequestBody User user`，表示"新增一个用户，新用户的数据在请求体里"。
- `@PutMapping("/{id}")`：完整路径 `PUT /users/{id}`，同时用了 `@PathVariable`（从 URL 拿到"改哪一个"）和 `@RequestBody`（从请求体拿到"改成什么样"）。
- `@DeleteMapping("/{id}")`：完整路径 `DELETE /users/{id}`，只需要知道删哪一个，不需要请求体。

可以看到，**同一个资源前缀 `/users`，靠五个不同的 Method 注解就表达出了五种不同的操作**，这正是 REST 风格的核心体现。

## 程序运行过程

以 `GET /users/1` 为例：

1. 浏览器（或 Postman）发起 `GET /users/1` 请求。
2. Tomcat 接收请求，交给 `DispatcherServlet`。
3. `HandlerMapping` 根据 URL 匹配到 `UserController` 里 `@GetMapping("/{id}")` 标注的 `getUser` 方法，并把 URL 里的 `1` 解析出来准备传给 `@PathVariable Long id`。
4. `HandlerAdapter` 调用 `getUser(1L)`。
5. 方法内部去查找 id 为 1 的用户（下一章 Project 2 里会用 `List<User>` 实现），把结果对象返回。
6. Spring 通过 `HttpMessageConverter`（内部是 Jackson，第 21 章讲过）把返回的 `User` 对象序列化成 JSON。
7. JSON 文本作为响应体，原路返回给浏览器。

**请求怎么找到这个 Controller？** 靠 `HandlerMapping` 根据"URL + HTTP Method"的组合去匹配——这也是为什么同一个 URL 前缀 `/users`，配上不同的 Method 注解，能对应到不同的方法上，互不冲突。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 访问 `GET /users/1` 报 404 | 方法上写成了 `@PostMapping` 之类别的 Method，Method 对不上 | 确认注解和你实际发起请求用的 Method 一致 |
| `@PathVariable Long id` 报错，取不到值 | 类上 `@RequestMapping` 或方法上 `@GetMapping` 里的占位符名字和参数名不一致，比如路径写的是 `{userId}` 但参数叫 `id` | 保证 `{}` 里的名字和参数名一致，或者用 `@PathVariable("userId") Long id` 显式指定 |
| 两个方法都能匹配同一个 URL，报"发现冲突的映射" | 不同方法用了相同的 Method + 路径组合 | 检查是不是重复定义了同一个 `GET /users` 之类的接口 |
| 团队里 URL 风格五花八门 | 没有统一约定，各写各的 | 这正是本章要解决的问题——统一按资源 + Method 的方式设计 |

## 动手练习

1. 给上面的 `UserController` 补一个 `GET /users/{id}/name` 的接口，只返回这个用户的名字（字符串），思考一下这个设计是否还符合"资源是名词"的原则。
2. 把 `deleteUser` 方法故意改成用 `@PostMapping("/{id}/delete")`，对比一下和 `@DeleteMapping("/{id})` 两种写法，哪个更符合本章讲的风格。
3. 尝试写出"获取所有用户里状态为启用的那些"这个需求的 URL，思考应该设计成 `/users?status=enabled`（查询参数）还是单独起一个新 URL，说说你的理由。

## 小测验

1. REST 风格里，URL 应该出现名词还是动词？
2. `PUT` 和 `PATCH` 的核心区别是什么？
3. 如果团队里有人写了 `/deleteUser` 这样的接口，代码能不能正常运行？这样写主要的问题出在哪？

<details>
<summary>参考答案</summary>

1. 应该出现名词（资源），动作交给 HTTP Method（GET/POST/PUT/DELETE）表达。
2. `PUT` 是整体替换，请求体要带完整数据；`PATCH` 是部分更新，请求体只带要改的字段。
3. 能正常运行，Spring 不会因为 URL 命名报错。问题在于团队协作和维护性变差：URL 里的动词和实际用的 HTTP Method 容易对不上，别人看代码/文档时不能一眼看懂接口语义，需要额外去翻实现。
</details>

## 本章总结
你现在知道了怎么用"资源 + HTTP Method + 状态码"组合出一套规范的 URL 设计，也清楚了 REST 只是一种协作约定而不是语法强制。下一节我们就用这套风格，动手实现一个完整的 Project 2：内存版 User API。
