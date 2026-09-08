# 阶段复习 2：Web 通信原理

## 知识地图

本阶段（第 10～14 章）按依赖顺序学习了以下内容，梳理成一条主线：

```
第 10 章 HTTP 协议详解
  认识 Request/Response 报文结构：URL/URI、Method、Header、
  Query Parameter、Body、状态码
        │
        ▼
第 11 章 Servlet 与 Tomcat
  理解 Tomcat 作为 Servlet 容器的角色；
  HttpServlet / doGet·doPost / HttpServletRequest·HttpServletResponse；
  URL 怎么映射到 Servlet（@WebServlet / web.xml）；
  Cookie / Session / Filter 的基础作用
        │
        ▼
第 12 章 Servlet Hello 小实验
  亲手写 @WebServlet("/hello") + doGet，
  第一次亲眼验证"请求路径 → doGet 方法"这条最小调用链
        │
        ▼
第 13 章 从 Servlet 到 MVC
  体会纯 Servlet 写法在项目变大后的痛点：
  类爆炸、重复代码、业务逻辑与页面展示混杂，
  引出"需要统一分发入口"的诉求
        │
        ▼
第 14 章 MVC 模式（经典 + 现代分层）
  经典 MVC：Model / View / Controller
  现代分层：Controller → Service → Mapper/Repository → Database
  明确 Model 并非单一类，而是 Service + Mapper + Entity/DTO 的合称
```

整条主线可以概括为一句话：**先看懂"一次通信长什么样"（HTTP），再搞清楚"服务器怎么接住这次通信并执行代码"（Servlet/Tomcat），亲手跑通一次最小例子，然后发现这种最原始的写法在项目变大后会出问题，于是引出更合理的组织方式（MVC 分层）**。这也是整个 Web 后端知识体系最基础的一条脉络，后面学 Spring MVC，本质上是在用更强大的工具把这条脉络实现得更好。

## 易混概念对照

| 概念 A | 概念 B | 一句话区别 |
|---|---|---|
| Servlet | Controller | Servlet 是 Java Web 最底层的"能处理请求的类"，需要自己继承 `HttpServlet`、手动取参数拼页面；Controller 是 Spring MVC 里更高层的角色，本质上底层仍然依赖 Servlet 机制（`DispatcherServlet` 本身也是一个 Servlet），但框架已经帮你处理好了参数绑定、结果转换等重复工作 |
| HTTP | REST | HTTP 是一套具体的**协议**，规定了报文格式、方法、状态码等；REST 是一种**设计风格**（不是协议），指导你如何用 HTTP 已有的方法和 URL 设计出语义清晰、结构统一的接口。可以简单理解为："HTTP 是工具，REST 是一种用好这个工具的最佳实践风格"，详细内容留到第 22 章展开 |
| URL | URI | URL 描述"资源在哪"，是 URI 的一种；URI 是更大的概念（标识符），日常开发里经常把两者混用，不用过分纠结 |
| Cookie | Session | Cookie 是浏览器端保存的一小段信息；Session 是服务器端为某个访问者保存的一份"档案"，两者通常配合使用（Cookie 里存 Session ID，服务器靠这个 ID 找到对应的 Session） |
| doGet / doPost | Controller 方法（如后面的 `@GetMapping` 方法） | `doGet`/`doPost` 是 Servlet 规范里按 HTTP 方法名固定命名的方法，一个 Servlet 类通常对应一个 URL；后面 Spring MVC 里一个 Controller 类可以用注解灵活声明多个方法分别对应不同的 URL 和方法，不再受限于固定的方法名 |

## 测试题

1. HTTP 请求报文里，Query Parameter 出现在报文的哪个位置？
2. 状态码 `404` 和 `500` 分别代表什么类型的问题（客户端的 or 服务器的）？
3. Tomcat 是怎么根据 `GET /hello` 这个请求找到对应的 Servlet 类的？
4. 为什么说"业务逻辑和页面展示混在一个 Servlet 方法里"是不好的写法？
5. 经典 MVC 的 Model，在现代 Spring Boot 项目里对应哪几个部分？
6. `HttpServletRequest` 和 `HttpServletResponse` 是谁创建、谁负责传给 `doGet` 方法的？
7. "REST 是协议"这个说法对不对？
8. Servlet 和 Controller 最本质的区别是什么？

<details>
<summary>参考答案</summary>

1. 出现在 URL 的路径后面，以 `?` 开始，多个参数用 `&` 分隔，属于请求行的一部分，不在 Header 或 Body 里。
2. `404` 是客户端的问题（访问了不存在的资源）；`500` 是服务器的问题（服务器内部处理出错，比如代码抛出了未处理的异常）。
3. Tomcat 在启动时扫描所有带 `@WebServlet` 注解（或 `web.xml` 里配置）的类，建立一张"URL → Servlet 类"的映射表；收到请求后，按请求路径去查这张表，找到对应的 Servlet 类，创建实例并调用它的 `doGet`（因为请求方法是 GET）。
4. 因为这两件事变化的原因不同——业务逻辑因需求调整而改，页面样式因视觉调整而改——混在一起会导致改动一处牵连另一处，代码难以维护，也难以复用和测试。
5. 对应 Service（业务逻辑）+ Mapper/Repository（数据库访问）+ Entity/DTO（数据结构定义）这三部分的合称，不是某一个单独的类。
6. 都是由容器（Tomcat）创建的，容器在调用 `doGet` 方法时把这两个对象作为参数传进去，开发者不需要、也不应该自己 `new` 它们。
7. 不对。REST 是一种设计风格，不是协议；HTTP 才是协议。REST 风格通常是"基于 HTTP 协议"来实现的，两者不是同一个层面的概念，详细区别在第 22 章展开。
8. Servlet 是 Java Web 最底层、需要手动处理很多重复细节的处理单元；Controller 是 Spring MVC 提供的更高层封装，本质上仍然建立在 Servlet 机制之上，但帮你自动处理了参数绑定、数据转换等大量重复劳动。
</details>

## 小项目回顾

本阶段没有独立的完整项目（回顾第 3 章的知识依赖顺序可以看到，正式的阶段项目要到学完 Spring MVC 之后的 Project 1 才会出现），但完成了 **第 12 章的 Servlet Hello 小实验**：亲手用 `@WebServlet("/hello")` 声明一个 `HttpServlet`，在 `doGet` 里输出一段 HTML，第一次亲眼验证"请求路径能够精确找到某个方法并执行"这条最原始的调用链。这条体感非常关键——后面第 20 章学 Spring MVC 的 `DispatcherServlet → HandlerMapping → Controller` 时，本质上是在一个更复杂、更强大的框架里，再现这次实验里"URL 对应方法"的同一个道理。
