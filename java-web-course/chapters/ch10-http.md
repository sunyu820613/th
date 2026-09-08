# 第 10 章　HTTP 协议详解

## 本章目标
看懂一条真实的 HTTP 请求报文和响应报文；理解 URL/URI、Method、Header、Query Parameter、Body 各自的位置和作用；掌握 GET/POST/PUT/PATCH/DELETE 五个方法的语义，以及常见状态码的含义；建立"浏览器/客户端 → HTTP Request → 服务器 → HTTP Response"这个最基础的通信模型。

## 一句话理解
HTTP 就是浏览器（或者任何客户端）和服务器之间"打电话"用的固定话术：一方按规定格式提出请求，另一方按规定格式给出答复，双方都能看懂对方在说什么。

## 为什么需要它
从这一章开始，我们正式进入"Web 开发"的世界。不管你之后用 Servlet 还是 Spring Boot 写后端，本质上都是在做同一件事：**接收一个 HTTP 请求，返回一个 HTTP 响应**。如果不先搞懂 HTTP 报文长什么样、每个部分是干什么用的，后面学 `@GetMapping`、`@RequestParam`、`@RequestBody` 这些注解时，就只能死记硬背"这个注解要这样写"，却不知道它们到底在处理报文里的哪一部分。这一章不涉及任何 Java 代码，纯粹是"看懂协议"，是后面所有 Web 章节的地基。

## 核心概念

| 术语 | 含义 |
|---|---|
| HTTP（HyperText Transfer Protocol） | 超文本传输协议，浏览器和服务器之间约定好的一套"通信规则" |
| URL | 统一资源定位符，说明"资源在哪"，比如 `http://localhost:8080/users/10` |
| URI | 统一资源标识符，比 URL 范围更大（URL 是 URI 的一种）；日常开发中经常把两者混用，不用过分纠结区别 |
| Method（请求方法） | 说明"想对资源做什么"，比如 GET（查）、POST（增） |
| Header（请求头/响应头） | 一组"附加说明"，用 `名字: 值` 的形式描述这次通信的元信息 |
| Query Parameter（查询参数） | 拼在 URL 问号后面的键值对，用来传递一些简单的筛选/附加条件 |
| Body（请求体/响应体） | 真正要传输的数据内容，GET 请求通常没有 Body，POST/PUT 经常带 Body |
| 状态码（Status Code） | 服务器用一个三位数字告诉客户端"这次请求处理得怎么样" |

## 图解

先建立最顶层的模型，这是本章、乃至后面十几章反复会用到的一张图：

```
Browser（浏览器 / 客户端）
      │
      │  ① 发出 HTTP Request（说明：我要什么资源，用什么方法）
      ▼
   Server（服务器）
      │
      │  ② 处理请求，准备好数据
      │
      ▼
Browser（浏览器 / 客户端）
      ▲
      │  ③ 收到 HTTP Response（说明：处理结果如何，数据是什么）
      └──────────────────────
```

一次完整的网页访问、一次 App 拉数据、一次 Postman 测试接口，本质上都是"发一个 Request，收一个 Response"的重复。后面章节要学的 Servlet、Tomcat、DispatcherServlet、Controller，全都是**服务器内部**如何处理这个 Request、组装这个 Response 的细节，先把最外层这张图刻在脑子里。

## 最小示例

### 一条真实的请求报文

假设浏览器要查询 id 为 10 的用户，并且要求以 JSON 格式返回详情，报文长这样：

```
GET /users/10?detail=true HTTP/1.1
Host: localhost:8080
Accept: application/json
```

逐项拆解：

| 部分 | 内容 | 说明 |
|---|---|---|
| 请求行第一段 | `GET` | Method，说明这是一次"查询"操作 |
| 请求行第二段 | `/users/10?detail=true` | 这是 URI；其中 `/users/10` 是路径部分，`?detail=true` 是 Query Parameter 部分 |
| 请求行第三段 | `HTTP/1.1` | 使用的协议版本 |
| `Host: localhost:8080` | Header 之一 | 告诉服务器"我要访问哪台主机的哪个端口"，`localhost` 是本机地址，`8080` 是端口号 |
| `Accept: application/json` | Header 之一 | 告诉服务器"我希望你返回 JSON 格式的数据"（而不是网页 HTML） |

把 URL 拆开看会更直观：

```
http://localhost:8080/users/10?detail=true
└─┬─┘   └────┬─────┘└───┬────┘└─────┬────┘
 协议        主机+端口     路径      Query Parameter
```

- **URL/URI**：整个 `http://localhost:8080/users/10?detail=true` 就是这次请求的资源定位符，说明"我要访问的东西在哪"。
- **路径（Path）**：`/users/10` 表示"我要访问的资源是 users 里 id 为 10 的那一个"。
- **Query Parameter**：`?` 后面的 `detail=true` 是附加条件，意思是"顺便告诉你我想要详细信息"。多个参数之间用 `&` 连接，比如 `?detail=true&lang=zh`。
- **Method**：这里是 `GET`，表示"只是查询，不修改任何数据"。
- **Header**：`Host` 和 `Accept` 都是 Header，格式统一是"名字: 值"，一次请求可以带很多个 Header。

### 一条真实的响应报文

服务器处理完这个请求后，可能会返回：

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 10,
  "name": "Tom"
}
```

逐项拆解：

| 部分 | 内容 | 说明 |
|---|---|---|
| 状态行第一段 | `HTTP/1.1` | 协议版本 |
| 状态行第二段 | `200` | 状态码，`200` 代表"成功" |
| 状态行第三段 | `OK` | 状态码对应的文字说明，纯粹给人看，程序一般只看数字 |
| `Content-Type: application/json` | Header | 告诉客户端"我返回的 Body 是 JSON 格式的"，客户端据此决定用什么方式解析后面的内容 |
| 空行 | —— | Header 和 Body 之间必须用一个空行隔开，这是 HTTP 报文的固定格式 |
| `{ "id": 10, "name": "Tom" }` | Body | 真正的数据内容，这里是一段 **JSON**（JavaScript Object Notation，一种用"键值对"描述数据的通用文本格式，几乎是现在前后端交互的标配） |

## 代码逐行解释

这一章没有 Java 代码，我们把上面两段报文再串起来看一遍完整的因果关系：

1. 客户端想查看 id=10 的用户详情，于是拼出 URL `http://localhost:8080/users/10?detail=true`，决定用 `GET` 方法（因为只是查询）。
2. 客户端把这次请求的元信息写进 Header：`Host` 告诉服务器要连哪台机器，`Accept` 告诉服务器"我希望你用 JSON 格式回答我"。
3. 因为是 `GET` 查询，不需要携带额外的数据体，所以这次请求**没有 Body**——需要传的信息（`10` 和 `detail=true`）已经写在 URL 里了。
4. 服务器收到请求后，按 URL 和 Method 找到对应的处理逻辑（这部分从下一章 Servlet 开始学），查到用户信息。
5. 服务器把处理结果封装进响应：状态码 `200` 表示"一切正常"，`Content-Type: application/json` 表示"接下来的 Body 是 JSON"，Body 里放着 `{ "id": 10, "name": "Tom" }`。
6. 客户端收到响应，先看状态码判断是否成功，再根据 `Content-Type` 决定怎么解析 Body，最终拿到 `id` 和 `name` 两个字段的值。

## 程序运行过程

把"浏览器/客户端 → HTTP Request → 服务器 → HTTP Response"这张图，套到这个具体例子上：

```
浏览器
  │  组装 Request：
  │    GET /users/10?detail=true HTTP/1.1
  │    Host: localhost:8080
  │    Accept: application/json
  ▼
服务器（localhost:8080）
  │  读取 Method（GET）+ 路径（/users/10）+ Query（detail=true）
  │  内部查到 id=10 的用户数据
  │  组装 Response：
  │    HTTP/1.1 200 OK
  │    Content-Type: application/json
  │
  │    { "id": 10, "name": "Tom" }
  ▼
浏览器
  收到响应，先看状态码 200（成功），
  再按 Content-Type 把 Body 当 JSON 解析，
  拿到 name = "Tom"
```

这里的"服务器内部怎么根据路径找到该执行哪段代码"，正是接下来几章要讲的 Servlet、Tomcat、Spring MVC 的核心内容，本章先只关心"报文长什么样"。

### GET / POST / PUT / PATCH / DELETE：五个方法的语义

HTTP 定义了很多方法，但 Web 开发里最常用的是这五个，它们的区别不是"技术上能不能做同一件事"（技术上确实都能塞数据），而是**约定俗成的语义**——大家看到某个方法，就知道你想干什么：

| 方法 | 语义 | 典型场景 |
|---|---|---|
| `GET` | 查询资源，不应该修改任何数据 | 查看用户列表、查看某个用户详情 |
| `POST` | 新增一个资源 | 注册一个新用户、创建一条新订单 |
| `PUT` | 整体替换/更新一个资源（通常要求把所有字段都传一遍） | 把某个用户的全部信息覆盖更新 |
| `PATCH` | 部分更新一个资源（只传要改的字段） | 只修改用户的昵称，其它字段不动 |
| `DELETE` | 删除一个资源 | 删除某个用户 |

> 记忆技巧：可以把这五个方法对应到最常见的"增删改查"（CRUD）——`POST` 对应"增"，`GET` 对应"查"，`PUT`/`PATCH` 对应"改"，`DELETE` 对应"删"。第 22 章讲 RESTful API 设计时，会详细讲怎么用这五个方法 + 资源式 URL 设计一整套接口。

### 常见状态码：服务器在告诉你什么

状态码按第一位数字分类：`2xx` 成功、`4xx` 客户端的错、`5xx` 服务器的错。零基础阶段先记住这几个最常见的：

| 状态码 | 含义 | 大致场景 |
|---|---|---|
| `200 OK` | 成功 | 最常见的"一切正常"，GET 查询成功、更新成功都可能用它 |
| `201 Created` | 创建成功 | `POST` 新增资源成功后，规范的做法是返回 `201` 而不是 `200` |
| `204 No Content` | 成功但没有内容返回 | 比如 `DELETE` 删除成功，不需要再返回被删的数据 |
| `400 Bad Request` | 客户端传的参数有问题 | 必填字段没传、参数格式不对（比如把字符串传给了要求数字的字段） |
| `401 Unauthorized` | 没有登录 / 身份未验证 | 访问需要登录的接口，但没带有效的登录凭证 |
| `403 Forbidden` | 已经知道你是谁，但你没权限 | 普通用户想访问管理员专属的接口 |
| `404 Not Found` | 找不到资源 | 访问了不存在的用户 id，或者 URL 本身写错了 |
| `409 Conflict` | 请求和当前资源状态冲突 | 注册时用户名已经被占用 |
| `500 Internal Server Error` | 服务器自己出错了 | 代码抛了未处理的异常、数据库连接失败等 |

> `4xx` 系列的潜台词是"你（客户端）传的东西有问题"，`5xx` 系列的潜台词是"是我（服务器）自己没处理好"，这个区分在后面第 32 章讲全局异常处理时会非常关键——我们要保证程序自己的 bug 不要包装成看起来像用户错误的状态码，反之亦然。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 把该放 URL 里的参数硬塞进 Body，或者反过来 | 没搞清楚 Query Parameter 和 Body 的定位差异 | 简单筛选/定位类的参数（比如分页的 page、size，查询条件）放 Query Parameter；成块的、复杂的数据（比如一个完整的用户信息）放 Body |
| 以为状态码只是"给人看的提示文字" | 只看响应里的文字说明，没有用状态码本身做逻辑判断 | 客户端代码应该先判断状态码（比如 `res.status === 200`），再决定怎么处理返回内容，这是后面第 33 章 `fetch()` 调用接口时的标准写法 |
| 混淆 `PUT` 和 `PATCH` | 以为它们完全一样，随便用 | `PUT` 语义上是"整体替换"，`PATCH` 是"部分修改"；很多团队图省事全用 `PUT`，但理解语义差异有助于看懂规范的 API 文档 |
| 以为 GET 请求完全不能带任何数据 | 忽略了 Query Parameter 也是一种"带数据"的方式 | GET 请求确实通常不带 Body，但可以通过 URL 路径和 Query Parameter 传递数据，这正是本章示例里 `/users/10?detail=true` 的写法 |

## 动手练习

1. 打开浏览器，按 F12 打开开发者工具，切到 Network（网络）面板，随便访问一个网站，找到一条请求，观察它的 Method、Header、状态码分别是什么。
2. 自己动手写一条"删除 id 为 5 的订单"的请求报文（只写请求行 + Host 这一个 Header 即可），思考应该用哪个 Method。
3. 假设你要设计一个"修改用户邮箱"的接口，思考应该用 `PUT` 还是 `PATCH`，并说出你的理由。

## 小测验

1. Query Parameter 写在 URL 的哪个位置？用什么符号分隔多个参数？
2. `POST` 和 `PUT` 都能用来"改数据"，它们的语义区别是什么？
3. 用户传了一个格式错误的手机号，服务器应该返回 `4xx` 还是 `5xx`？为什么？
4. Header 和 Body 之间用什么隔开？

<details>
<summary>参考答案</summary>

1. Query Parameter 写在 URL 的 `?` 之后，多个参数之间用 `&` 分隔，比如 `?page=1&size=10`。
2. `POST` 语义上是"新增一个资源"；`PUT` 语义上是"整体替换/更新一个已存在的资源"。虽然技术上两者都能拿来改数据，但规范的 API 设计会按语义区分使用场景。
3. 应该返回 `4xx`（比如 `400 Bad Request`），因为错误是客户端传的参数有问题，不是服务器自己出了故障。
4. 用一个空行隔开，这是 HTTP 报文的固定格式。
</details>

## 本章总结
你已经能看懂一条真实的 HTTP 请求和响应报文，理解了 URL、Method、Header、Query Parameter、Body、状态码各自的位置和作用，也记住了 GET/POST/PUT/PATCH/DELETE 的语义和几个最常见的状态码。下一章开始学习 Servlet 和 Tomcat——服务器内部到底是怎么"接住"这个 HTTP 请求、并且执行到你写的代码里的。
