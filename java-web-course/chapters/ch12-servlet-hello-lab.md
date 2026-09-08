# 第 12 章　Servlet Hello 小实验

## 本章目标
亲手写一个最原始的 `HttpServlet`，用 `@WebServlet("/hello")` 声明它处理哪个路径，在 `doGet` 里输出一段 HTML；真正建立起"请求路径 → `doGet` 方法"这条最小调用链的体感，为后面理解 DispatcherServlet 打基础。

## 一句话理解
这一章不讲新概念，只做一件事：把上一章讲的"URL 映射到 Servlet"这套原理，变成你亲手敲出来、能跑起来的几行代码。

## 为什么需要它
光看图解、看别人的代码示例，很容易有一种"我好像懂了"的错觉。但"请求怎么找到方法"这件事，只有自己亲手写一遍、看着浏览器地址栏敲下 URL、亲眼看到自己写的那句 `println` 打印出来的内容，才会真正在脑子里扎根。这条最原始的调用链——**一个 URL 对应一个方法**——之后会在 Spring MVC 里以更强大的形式（`@GetMapping`）再次出现，到时候你会一眼认出："这不就是当年 `@WebServlet` 那一套嘛，只是换了个更好用的写法。"

## 核心概念

本章不引入新概念，只复习并动手实践第 11 章讲过的几个角色：

| 术语 | 在本章实验里对应什么 |
|---|---|
| `@WebServlet("/hello")` | 声明"我要处理 `/hello` 这个路径的请求" |
| `HttpServlet` | 我们要继承的父类 |
| `doGet` | 浏览器直接在地址栏访问时，发出的就是 `GET` 请求，会调用这个方法 |
| `HttpServletResponse` | 用来把 HTML 内容写回浏览器 |

关于运行环境，需要说明一句：真正独立部署一个 Servlet 项目，传统上需要搭好 Tomcat 服务器、配置 `web.xml` 或部署描述，这一整套环境搭建过程比较繁琐，而且是"传统部署方式"——本教程后续统一使用 Spring Boot（内嵌 Tomcat，直接运行 `main` 方法就能启动服务器，不需要你自己装 Tomcat、配 `web.xml`）。**这里只需要理解原理，第 18 章开始 Spring Boot 会内嵌 Tomcat，不需要你自己搭。** 所以本章的示例代码，重点是让你看懂"这几行代码为什么能让 `/hello` 触发到 `doGet`"，而不是要求你现在就搭一套完整的传统 Servlet 部署环境。

> 小提醒：本教程统一使用 **Jakarta 命名空间**（`jakarta.servlet.*`），这是因为后面第 18 章开始使用的 Spring Boot 4，其底层就是基于 Jakarta 命名空间的 Servlet 规范（区别于早期教程里常见的 `javax.servlet.*`）。这里提前用 `jakarta.servlet.*` 写法，是为了和后面章节保持一致，不需要现在纠结这个历史原因，只需要记住：**本教程全程使用 `jakarta.servlet.*`，不使用 `javax.servlet.*`**。

## 图解

```
浏览器地址栏输入：http://localhost:8080/hello
      │
      │ 发出 GET /hello HTTP/1.1
      ▼
   Tomcat
      │ 查"URL → Servlet"登记表
      │ /hello → HelloServlet（来自 @WebServlet("/hello") 注解）
      ▼
new HelloServlet()（由容器创建）
      │ 因为是 GET 请求，调用：
      ▼
HelloServlet.doGet(req, resp)
      │ resp.getWriter().println("<h1>Hello, Servlet!</h1>");
      ▼
   Tomcat 把 resp 内容封装成 HTTP 响应
      ▼
浏览器显示：Hello, Servlet!
```

这就是本教程要你建立的第一条、也是最原始的一条"调用链"：**一个 URL 路径，最终精确对应到某个类的某个方法**。

## 最小示例

`HelloServlet.java`：

```java
package com.example.servletdemo;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().println("<h1>Hello, Servlet!</h1>");
        resp.getWriter().println("<p>这是我亲手写的第一个 Servlet。</p>");
    }
}
```

要让这段代码能被编译，项目需要引入 Servlet API 依赖（Maven 坐标示例）：

```xml
<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>6.0.0</version>
    <scope>provided</scope>
</dependency>
```

> `scope` 设为 `provided` 是因为：真正运行时，Servlet API 由 Tomcat 容器本身提供，我们的项目只是在**编译期**需要用到这些接口和注解，不需要把它打进最终的部署包里。这是传统 Servlet 项目的写法；等第 18 章用 Spring Boot 时，这类底层依赖会由 Spring Boot Starter 自动帮我们管理好，不需要手动引入这个坐标。

## 代码逐行解释

- `package com.example.servletdemo;`：这只是本章实验用的临时包名，不属于本教程后面统一命名的四个正式项目（`hello-spring-boot`、`user-api-memory`、`user-crud-mysql`、`task-manager`），纯粹用来做这次最小实验。
- `import jakarta.servlet.annotation.WebServlet;` 等：注意这里全部使用 `jakarta.servlet.*` 包路径，而不是老教程里常见的 `javax.servlet.*`。
- `@WebServlet("/hello")`：声明"这个类处理 `/hello` 路径的请求"，这就是第 11 章讲过的 URL 映射机制，容器启动扫描时会把它登记进"URL → Servlet"表。
- `public class HelloServlet extends HttpServlet`：继承 `HttpServlet`，表明这是一个标准的 Servlet，容器才能识别并调用它统一约定的方法。
- `protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException`：重写 `doGet` 方法。方法签名是固定的，必须原样照写（参数类型、抛出的异常类型都不能随便改），因为容器就是按照这个固定签名去调用它的。
- `resp.setContentType("text/html;charset=UTF-8")`：设置响应头的 `Content-Type`，告诉浏览器"接下来的内容按 HTML、UTF-8 编码解析"。
- `resp.getWriter().println(...)`：`getWriter()` 拿到一个可以往响应体里写字符内容的对象，`println` 把 HTML 文本写进去（这里"写"的意思是写进响应体 Body，不是打印到控制台）。写了两行，浏览器会把这两行 HTML 拼在一起渲染显示。

## 程序运行过程

针对这个最小示例，逐条回答"程序运行过程"要关注的问题：

1. **谁调用了这个方法**：不是我们自己的代码调用 `doGet`，而是 Tomcat 容器在收到匹配 `/hello` 路径的 `GET` 请求后主动调用的。
2. **这个对象是谁创建的**：`HelloServlet` 的实例由容器负责创建，`HttpServletRequest`/`HttpServletResponse` 两个参数对象也是容器构造好、并把这次请求的具体数据填充进去之后，才作为参数传给 `doGet` 的。
3. **请求怎么找到这个类**：容器启动时扫描到 `@WebServlet("/hello")` 注解，把 `"/hello" → HelloServlet` 这条映射记进内部的登记表；浏览器访问 `http://localhost:8080/hello` 时，容器解析出路径 `/hello`，拿它去登记表里查，命中 `HelloServlet`。
4. `doGet` 方法体开始执行：先设置响应的 `Content-Type`，再往响应体里写两行 HTML。
5. `doGet` 执行完毕后，容器把 `resp` 里积累的内容按 HTTP 响应报文的格式封装好，通过网络发回浏览器。
6. 浏览器收到响应，识别出 `Content-Type` 是 HTML，于是把 Body 内容渲染成页面，最终你在浏览器里看到"Hello, Servlet!"和下面那行说明文字。

完整链路串起来就是：

```
浏览器输入 URL
  → Tomcat 接收请求，解析出路径 /hello
  → 查"URL → Servlet"登记表，命中 HelloServlet
  → 容器创建 HelloServlet 实例 + 构造 req/resp
  → 调用 doGet(req, resp)
  → doGet 往 resp 里写 HTML
  → Tomcat 把 resp 封装成 HTTP 响应发回
  → 浏览器渲染显示
```

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 访问 `http://localhost:8080/hello` 报 `404` | `@WebServlet` 注解里的路径和访问路径不一致，或者项目根本没有正确部署到容器里 | 检查注解里的字符串是否严格等于 `/hello`；确认项目已经被容器扫描到（本章重点是理解原理，实际部署配置从第 18 章 Spring Boot 开始会大幅简化） |
| import 报错，找不到 `jakarta.servlet.*` | 没有正确引入 `jakarta.servlet-api` 依赖，或者错误地引入了 `javax.servlet-api` | 确认 `pom.xml` 里引入的是 `jakarta.servlet:jakarta.servlet-api`，本教程全程使用 Jakarta 命名空间 |
| 页面显示乱码 | 没有设置 `Content-Type` 里的字符编码 | 用 `resp.setContentType("text/html;charset=UTF-8")` 明确指定编码 |
| 重写 `doGet` 时方法签名写错（比如漏写 `throws` 或参数类型不对） | 没有严格按照 `HttpServlet` 规定的方法签名重写 | 用 IDE 的"重写方法"功能（IntelliJ 里可以用 `Alt+Insert` → Override Methods）自动生成正确的签名，避免手写出错 |

## 动手练习

1. 把 `doGet` 里输出的内容改成包含你自己名字的一句话，比如 `"<h1>你好，我是小明写的 Servlet</h1>"`。
2. 再加一个 `@WebServlet("/hi")` 的新 Servlet 类，输出不同的内容，体会"一个 URL 对应一个处理方法"这个规则。
3. 想一想：如果这个网站要做 50 个不同的页面，按现在这种写法，你大概需要写多少个 Servlet 类？每个类里都要重复哪些代码（提示：设置 Content-Type、拼 HTML 字符串）？把你的想法记下来，下一章会专门讨论这个问题。

## 小测验

1. 本章示例里，`doGet` 方法是被谁调用的？
2. 为什么本教程要用 `jakarta.servlet.*` 而不是 `javax.servlet.*`？
3. 如果要访问 `/hi` 却触发到了 `HelloServlet` 的 `doGet`，最可能的原因是什么？

<details>
<summary>参考答案</summary>

1. 是 Tomcat 容器在收到匹配的请求后主动调用的，不是我们自己的代码调用它。
2. 因为本教程后面第 18 章开始使用的 Spring Boot 4，底层基于 Jakarta 命名空间的 Servlet 规范，为了保持前后一致，本章提前统一使用 `jakarta.servlet.*`。
3. 最可能是 `@WebServlet` 注解写错了路径（比如把 `/hi` 误写成了 `/hello`），或者两个 Servlet 的路径映射弄反了。
</details>

## 本章总结
你已经亲手写出并理解了一个最原始的 `HttpServlet`，真实建立起"URL 路径 → `doGet` 方法"这条最小调用链的体感。下一章我们会讨论：如果一个网站有几十上百个页面，还按这种"一个类对应一个 URL"的写法，会遇到什么问题——由此引出对"统一分发入口"的需求。
