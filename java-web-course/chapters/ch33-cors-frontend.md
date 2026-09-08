# 第 33 章　前后端交互与 CORS

## 本章目标
学会用浏览器原生 `fetch()` 调用自己写的 Spring Boot API；理解 AJAX、JSON、API 这几个词在前后端交互场景下具体指什么；理解跨域（CORS）问题是什么，学会用 `@CrossOrigin` 或全局配置解决它。

## 一句话理解
`fetch()` 是浏览器提供的一个"发请求"的工具，让网页可以在不刷新整个页面的情况下，向服务器要数据、发数据；但浏览器出于安全考虑，默认不允许网页向"不是同一个来源"的服务器发请求，这就是跨域问题，需要服务器主动声明"允许谁来访问我"。

## 为什么需要它

前面几十章我们一直在用 Postman 测试接口——Postman 是一个专门的测试工具，本身不受浏览器的跨域限制。但真实项目里，接口最终是要被一个网页（前端页面）调用的。本章不深入 Vue、React 这类前端框架（那是另一门课的内容），只讲最基础的：一个普通的 HTML 页面，怎么用浏览器自带的 JavaScript 能力去访问我们写的 Spring Boot 接口，以及这中间会遇到的第一个坑——跨域。

## 核心概念

| 名词 | 在本章场景下的含义 |
|---|---|
| API（Application Programming Interface） | 我们用 Spring Boot 写的那些 `/tasks`、`/users` 接口，就是给前端调用的"编程接口" |
| JSON | 前后端之间传递数据用的通用文本格式，之前章节返回的 `TaskResponse` 最终就是被序列化成 JSON 传给前端的 |
| AJAX（Asynchronous JavaScript and XML） | 一种"网页在不重新加载整个页面的情况下，偷偷在后台发请求、拿数据、再更新页面局部内容"的技术统称。名字里虽然有 XML，但现在几乎都是用 JSON，不是真的用 XML |
| `fetch()` | 浏览器原生提供的、用来发起 AJAX 请求的 JavaScript 函数，不需要额外安装任何库 |
| 同源（Same Origin） | 协议、域名、端口三者都相同，才算"同一个来源"。比如 `http://localhost:5500` 和 `http://localhost:8080` 端口不同，就不是同源 |
| CORS（Cross-Origin Resource Sharing，跨域资源共享） | 浏览器的一种安全机制：默认禁止网页向非同源的服务器发请求，除非服务器明确表示"允许" |

## 图解

```
你双击打开的 HTML 页面                    Spring Boot 后端
http://localhost:5500/index.html         http://localhost:8080/tasks
       │                                          │
       │  fetch('http://localhost:8080/tasks')    │
       ├─────────────────────────────────────────▶│
       │                                          │
       │        浏览器先检查：这是跨域请求吗？        │
       │        端口 5500 ≠ 端口 8080，是跨域       │
       │                                          │
       │   服务器有没有声明"允许 5500 这个来源访问"？  │
       │        没有 ──▶ 浏览器直接拦截，报错        │
       │        有  ──▶ 放行，正常拿到 JSON 数据      │
```

## 最小示例

### fetch() 调用 API

`index.html`
```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>任务列表</title>
</head>
<body>
    <h1>我的任务</h1>
    <ul id="task-list"></ul>

    <script>
        // 用 fetch 发一个 GET 请求，访问我们自己的 Spring Boot 接口
        fetch('http://localhost:8080/tasks')
            .then(response => response.json())   // 把响应体解析成 JSON 对象
            .then(data => {
                const ul = document.getElementById('task-list');
                data.forEach(task => {
                    const li = document.createElement('li');
                    li.textContent = task.title;
                    ul.appendChild(li);
                });
            })
            .catch(error => console.error('请求失败：', error));
    </script>
</body>
</html>
```

把这个文件用浏览器直接打开（或者用 IDEA/VS Code 自带的静态页面服务功能打开），此时页面的地址和 `http://localhost:8080` 不是同一个来源，这就是接下来要解决的跨域问题。

### 解决跨域：方式一，单个 Controller 加 `@CrossOrigin`

```java
package com.example.taskmanager.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:5500")   // 只允许这个来源访问
public class TaskController {
    // ... 方法不变
}
```

### 解决跨域：方式二，全局配置（推荐，一次配置对所有 Controller 生效）

`config/CorsConfig.java`
```java
package com.example.taskmanager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")                          // 对所有接口路径生效
                .allowedOrigins("http://localhost:5500")     // 允许的前端来源
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

## 代码逐行解释

- `fetch('http://localhost:8080/tasks')`：向指定 URL 发起一个默认的 GET 请求，返回一个 `Promise`（可以先简单理解成"一个会在将来某个时刻完成的操作"）。
- `.then(response => response.json())`：请求返回后，把响应体（原始是文本）解析成 JSON 对象，这一步同样返回一个 `Promise`。
- `.then(data => {...})`：拿到解析后的 JSON 数据（这里是任务数组），遍历并动态创建 `<li>` 标签插入页面——**整个过程页面没有刷新**，这正是 AJAX 名字里"Asynchronous（异步）"的体现。
- `@CrossOrigin(origins = "...")`：贴在 Controller 类或方法上，告诉 Spring MVC"这个接口允许指定来源的跨域请求"。只在小范围试验或个别接口需要单独配置时使用。
- `WebMvcConfigurer` + `addCorsMappings`：更推荐的做法，写一次全局配置，对整个项目所有接口统一生效，不用每个 Controller 都加一遍 `@CrossOrigin`。
- `allowedOrigins("http://localhost:5500")`：生产环境要写具体的、可信的域名，不建议图省事写成 `"*"`（允许任何来源），那样等于关掉了这层安全保护。

## 程序运行过程

1. 浏览器打开 `index.html`，执行到 `fetch(...)`，向 `http://localhost:8080/tasks` 发起 GET 请求。
2. 浏览器发现当前页面的来源（`http://localhost:5500`）和目标地址的来源（`http://localhost:8080`）不同，判定为跨域请求。
3. 请求依然会被发出（浏览器不会连请求都不发），但浏览器会检查服务器返回的响应头里有没有 `Access-Control-Allow-Origin` 这类字段，判断是否"允许"这次跨域。
4. 如果 Spring Boot 配置了 CORS（本章的 `@CrossOrigin` 或 `CorsConfig`），响应头里会带上允许的来源信息，浏览器放行，`fetch` 的 `.then` 正常拿到数据。
5. 如果没有配置，浏览器会拦截这次响应，`fetch` 的 `.catch` 会捕获到一个跨域相关的错误，`Network` 面板里能看到请求实际上发出去了、服务器也确实返回了数据，只是被浏览器挡在了 JavaScript 代码能读取的范围之外。
6. Controller → Service → Mapper → MySQL 这条链路和之前章节完全一样，本章新增的只是"响应最终能不能被浏览器里的网页代码读取"这一层。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 浏览器控制台报 `Access to fetch at ... has been blocked by CORS policy` | 服务器没有配置允许该来源的跨域访问 | 用 `@CrossOrigin` 或全局 `CorsConfig` 声明允许的来源 |
| Network 面板显示接口确实返回了 200 和数据，但页面上什么都没显示 | 跨域被浏览器拦截，`.then` 逻辑没有真正执行，只是走到了 `.catch` | 检查是否配置了 CORS；打开浏览器控制台看具体报错信息 |
| 本地文件直接双击打开（`file://` 协议）调用接口，报错更奇怪 | `file://` 协议本身和 `http://` 不是同源，情况更特殊 | 用 IDEA/VS Code 的本地静态服务器功能以 `http://localhost:xxxx` 方式打开页面，而不是直接双击文件 |

## 动手练习

1. 把 `index.html` 中的 `fetch` 改成调用 `/tasks/1`（假设存在 id 为 1 的任务），把返回结果的标题显示在页面上。
2. 故意先不加 `@CrossOrigin` 或 `CorsConfig`，用浏览器打开页面观察控制台报什么错误，再加上配置观察区别。
3. 尝试用 `fetch` 发一个 `POST` 请求（配合 `method: 'POST'`、`headers: {'Content-Type': 'application/json'}`、`body: JSON.stringify({...})`），调用第 30 章的新建任务接口。

## 小测验

1. AJAX 这个词的核心含义是什么？
2. 什么情况下算作"跨域"？
3. `@CrossOrigin` 应该写在哪里？

<details>
<summary>参考答案</summary>

1. 网页在不重新加载整个页面的情况下，在后台发起请求、获取数据并局部更新页面内容。
2. 请求发起页面的协议、域名、端口，只要有一个和目标服务器不同，就算跨域。
3. 贴在 Controller 类或具体方法上，也可以通过全局的 `WebMvcConfigurer` 配置一次对所有接口生效。
</details>

## 本章总结
你学会了用浏览器原生 `fetch()` 调用自己的 Spring Boot 接口，理解了 AJAX/JSON/API 这几个常见词的含义，也解决了前后端分开部署时必然会遇到的跨域问题。下一章我们学习 Git 基础，为团队协作开发做准备。
