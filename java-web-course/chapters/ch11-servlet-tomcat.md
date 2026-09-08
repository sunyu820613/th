# 第 11 章　Servlet 与 Tomcat

## 本章目标
理解 Tomcat 是什么、为什么需要它；认识 `HttpServlet`、`doGet`/`doPost`、`HttpServletRequest`/`HttpServletResponse`；搞清楚"一个 `GET /hello` 请求，最后是怎么找到某个类的 `doGet()` 方法并执行的"；初步了解 Cookie、Session、Filter 的作用。

## 一句话理解
Tomcat 是一个专门"接电话"的程序（负责监听端口、解析 HTTP 报文），它把每一通电话（请求）按照事先登记好的"分机号"（URL），转接给对应的一段 Java 代码（Servlet）去处理。

## 为什么需要它
上一章我们看懂了 HTTP 报文长什么样，但报文本身只是一段文本，谁来把它从网络里读出来、解析成 Method/Header/Body 这些结构化的信息，再交给你写的 Java 代码？Java 本身不自带"监听网络端口、解析 HTTP 协议"的能力，这些又脏又重复的活儿不应该每个开发者自己写一遍。于是就有了 **Servlet 容器**（比如 Tomcat）：它专门负责这些底层网络细节，开发者只需要按照 Servlet 规定的方式写好业务代码，剩下的交给容器。理解这一层，是理解后面 Spring MVC 为什么长成现在这个样子的前提。

## 核心概念

| 术语 | 含义 |
|---|---|
| Tomcat | 一个 **Servlet 容器**：本质是一个一直运行着的 Java 程序，负责监听某个端口（比如 8080），接收 HTTP 请求，解析报文，再把请求交给合适的 Servlet 处理，最后把 Servlet 生成的结果按 HTTP 格式封装成响应发回去 |
| Servlet | 一段能"处理 HTTP 请求"的 Java 代码，写法上遵循一套规范（继承 `HttpServlet`），由容器负责创建和调用，开发者不需要（也不应该）自己 `new` 它 |
| `HttpServlet` | Java 官方提供的一个抽象类，我们自己写的 Servlet 需要继承它，然后重写 `doGet`/`doPost` 等方法 |
| `doGet` / `doPost` | `HttpServlet` 里的两个方法，分别对应处理 `GET` 请求和 `POST` 请求；容器收到什么方法的请求，就调用对应名字的方法 |
| `HttpServletRequest` | 封装了这次 HTTP 请求的所有信息（Method、Header、Query Parameter、Body 等），容器会把它作为参数传给 `doGet`/`doPost`，方便你在代码里读取 |
| `HttpServletResponse` | 用来"组装要返回的 HTTP 响应"的对象，容器同样会作为参数传进来，你往里面写内容，容器负责把它变成真正的响应报文发回浏览器 |
| Cookie | 服务器让浏览器"记一件小事"的机制——服务器在响应里写一个 Cookie，浏览器以后每次请求都会自动带上它，常用来标识"这是谁" |
| Session | 服务器端用来保存"某个用户的一系列状态"的机制，通常配合 Cookie（存一个 Session ID）实现"服务器记得你是谁、上次做了什么" |
| Filter | 在请求真正到达 Servlet **之前**（以及响应发出**之前**）可以插入一段通用处理逻辑的机制，比如统一做日志记录、编码设置、权限拦截，不用在每个 Servlet 里重复写 |

## 图解

先看 Tomcat 在整体链路里的位置：

```
Browser
  ↓ HTTP Request（GET /hello）
Tomcat（Servlet 容器，监听 8080 端口）
  ↓ 解析报文，按 URL 找到登记过的 Servlet
HelloServlet.doGet(request, response)
  ↓ 业务代码执行，往 response 里写内容
Tomcat
  ↓ 把 response 内容封装成 HTTP Response
Browser
```

再放大看"Tomcat 怎么知道该找哪个 Servlet"这一步——这是本章要重点解决的问题：

```
浏览器发来：GET /hello

Tomcat 内部维护一张"URL 映射表"（登记表）：

  URL 路径         对应的 Servlet 类
  ─────────────    ──────────────────
  /hello       →    HelloServlet
  /users       →    UserServlet
  /orders      →    OrderServlet

Tomcat 拿 "/hello" 去这张表里查，
查到对应的类是 HelloServlet，
于是创建（或复用）一个 HelloServlet 对象，
因为这次请求方法是 GET，调用它的 doGet() 方法。
```

这张"登记表"是怎么建立起来的？有两种写法。

## URL 映射：Tomcat 是怎么找到 Servlet 的

### 方式一：`@WebServlet` 注解（现代写法）

在 Servlet 类上直接标注它要处理哪个 URL：

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        // 处理逻辑
    }
}
```

容器启动时会扫描所有带 `@WebServlet` 注解的类，把注解里的路径（`"/hello"`）和这个类记到"登记表"里。以后凡是请求路径匹配 `/hello`，就交给 `HelloServlet` 处理。

### 方式二：`web.xml` 配置文件（传统写法）

在项目的 `web.xml` 文件里手动写映射关系：

```xml
<servlet>
    <servlet-name>hello</servlet-name>
    <servlet-class>com.example.HelloServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>hello</servlet-name>
    <url-pattern>/hello</url-pattern>
</servlet-mapping>
```

这种写法出现得更早，把"起个名字"和"绑定 URL"拆成了两步，现在企业项目里已经很少直接手写，但很多老项目、老教程里还能看到，认识它就够了。

> 两种方式效果完全一样，都是在告诉 Tomcat："看到 `/hello` 这个路径的请求，就交给 `HelloServlet` 处理"。本教程后面统一使用 `@WebServlet` 注解，第 12 章会亲手用它跑通一个最小例子。

## Cookie / Session / Filter：先混个脸熟

这三个概念在真正动手写业务代码之前，先建立最基础的印象即可，暂时不需要写代码：

- **Cookie**：好比服务器给浏览器发了一张"便签纸"，上面写着一些小信息，浏览器会乖乖保管好，并且以后每次访问同一个网站都会把这张便签纸带上，让服务器能"认出"是同一个访问者。
- **Session**：好比服务器专门为每个访问者开了一个"档案袋"，把这个人的登录状态、购物车内容等信息存在服务器这边；配合 Cookie 里存的一个"档案袋编号"（Session ID），服务器就知道该翻哪个档案袋。
- **Filter**：好比在 Servlet 门口设了一道"安检口"，所有请求进 Servlet 之前，以及所有响应出去之前，都会先经过这里，可以统一做一些通用检查或处理（比如记日志、设置字符编码、拦截未登录用户），不用在每个 Servlet 里都重复写一遍。

## 最小示例

这一章先只看"最小映射关系"本身，不深入完整代码（下一章会亲手写一个可运行的完整例子）：

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().println("<h1>Hello, Servlet!</h1>");
    }
}
```

## 代码逐行解释

- `@WebServlet("/hello")`：告诉 Tomcat，"这个类要处理路径为 `/hello` 的请求"，这就是本章重点解释的 URL 映射机制。
- `public class HelloServlet extends HttpServlet`：`HelloServlet` 继承了 `HttpServlet`，这是所有 Servlet 的标准写法——只有继承了 `HttpServlet`，容器才知道这是一个"能处理请求的 Servlet"，才能调用它统一约定好的 `doGet`/`doPost` 等方法。
- `protected void doGet(HttpServletRequest req, HttpServletResponse resp)`：当容器判断这次请求的方法是 `GET` 时，会调用这个方法。`req` 参数装着这次请求的全部信息，`resp` 参数用来组装要返回的响应，这两个对象**都是容器创建好之后传进来的**，不需要（也不能）自己 `new`。
- `resp.setContentType("text/html;charset=UTF-8")`：设置响应头里的 `Content-Type`，告诉浏览器"接下来的内容是 HTML，编码是 UTF-8"——这正是第 10 章讲过的响应报文里的那个 `Content-Type` Header。
- `resp.getWriter().println(...)`：往响应体（Body）里写内容，容器最终会把这些内容拼进 HTTP 响应报文发给浏览器。

## 程序运行过程

以 `GET /hello` 为例，回答"这个请求最后为什么会执行到 `HelloServlet.doGet()` 里"：

1. 浏览器发出 `GET /hello HTTP/1.1` 请求，目标是本机 8080 端口。
2. **谁调用了这个方法**：Tomcat 监听着 8080 端口，收到这条 TCP 连接上的数据后，按 HTTP 协议把它解析成结构化的请求信息（Method=GET，路径=/hello）。
3. **请求怎么找到这个 Servlet**：Tomcat 项目启动时已经扫描过所有 `@WebServlet` 注解，建立好了"URL → Servlet 类"的登记表；现在拿路径 `/hello` 去查表，命中 `HelloServlet`。
4. **这个对象是谁创建的**：Tomcat 创建（或复用已有的）`HelloServlet` 实例，构造好 `HttpServletRequest` 和 `HttpServletResponse` 两个对象，把这次请求的具体信息填进 `request`。
5. 因为请求方法是 `GET`，Tomcat 调用这个实例的 `doGet(request, response)` 方法——这就是开发者自己写的业务代码第一次被执行的地方。
6. 业务代码往 `response` 里写入了 `Content-Type` 和 HTML 内容。
7. `doGet` 执行完毕，Tomcat 读取 `response` 里的内容，按 HTTP 格式拼成一份完整的响应报文，通过网络发回浏览器。
8. 浏览器收到响应，按 `Content-Type` 把内容当 HTML 解析并显示出来。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 访问 `/hello` 返回 `404` | `@WebServlet` 里写的路径和实际访问的路径不一致（比如少写了斜杠，或者拼写错误） | 检查注解里的路径字符串，确认和浏览器地址栏里访问的路径完全一致 |
| 用浏览器直接访问一个只重写了 `doPost` 的 Servlet，报 `405 Method Not Allowed` | 浏览器地址栏直接访问，发出的是 `GET` 请求，但这个 Servlet 没有重写 `doGet`（`HttpServlet` 默认对未重写的方法会报 405） | 确认要处理的请求方法和实际重写的方法（`doGet`/`doPost`）一致 |
| 页面乱码 | 没有设置正确的字符编码 | 用 `resp.setContentType("text/html;charset=UTF-8")` 明确告诉浏览器用什么编码解析 |
| 以为自己可以在代码里 `new HelloServlet()` 来测试 | 混淆了"自己创建对象"和"容器创建对象"的区别 | Servlet 的生命周期由容器统一管理，开发者不需要也不应该自己 `new` 它，只需要按规范写好类，交给容器发现和调用 |

## 动手练习

1. 找一个熟悉的网站，猜猜它首页对应的 Servlet 大概会映射到什么样的 URL（提示：不一定是 `/`，可能是 `/index` 之类）。
2. 试着说出："如果同一个类上写了两个 `@WebServlet` 路径（比如 `/hello` 和 `/hi`），效果会是什么？"（提示：注解支持传数组）
3. 想一想：如果没有 Filter，要在 10 个不同的 Servlet 里都加上"打印一条访问日志"的功能，你需要改几处代码？有了 Filter 之后呢？

## 小测验

1. Tomcat 在这套体系里扮演什么角色？
2. `doGet` 和 `doPost` 分别在什么情况下被调用？
3. `HttpServletRequest` 和 `HttpServletResponse` 是谁创建的？开发者需要自己 `new` 吗？
4. Session 和 Cookie 的关系大致是什么？

<details>
<summary>参考答案</summary>

1. Tomcat 是一个 Servlet 容器，负责监听端口、解析 HTTP 请求、按 URL 映射找到对应的 Servlet 并调用它，再把处理结果封装成 HTTP 响应发回客户端。
2. 当这次请求的 HTTP Method 是 `GET` 时调用 `doGet`；是 `POST` 时调用 `doPost`。
3. 都是容器（Tomcat）创建好之后作为参数传给 `doGet`/`doPost` 的，开发者不需要、也不应该自己 `new`。
4. Session 是服务器端保存的一份"档案"，通常靠 Cookie 里存的 Session ID 来标识"这次请求属于哪份档案"，两者配合才能让服务器"记住"同一个访问者。
</details>

## 本章总结
你已经理解了 Tomcat 作为 Servlet 容器的作用，明白了一个请求是怎么通过 URL 映射找到对应的 `doGet`/`doPost` 方法并执行的，也对 Cookie、Session、Filter 有了初步印象。下一章我们就亲手写一个最原始的 Servlet，真正跑通一次"请求路径 → doGet 方法"的完整调用链。
