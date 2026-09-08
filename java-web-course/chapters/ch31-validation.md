# 第 31 章　参数校验

## 本章目标
掌握 `@NotNull`、`@NotBlank`、`@Email`、`@Size`、`@Valid` 的用法；理解校验发生在 Controller 方法真正执行**之前**，为下一章的全局异常处理打基础。

## 一句话理解
在 `TaskCreateRequest` 的字段上贴几个校验注解，加上 `@Valid`，Spring 就会在你的方法真正执行之前，自动帮你检查这些字段是否合法，不合法就直接拦下来，不需要你在方法体里写一堆 `if (title == null) ...` 的判断。

## 为什么需要它

上一章的 `TaskCreateRequest` 只有 `title` 和 `description` 两个字段。如果前端不小心（或者恶意）传了一个空标题、甚至根本没传 `title` 字段，会发生什么？

如果没有任何校验，`title` 字段就是 `null` 或者空字符串，这个"脏数据"会一路畅通无阻地进入 Service、Mapper，最后存进数据库——数据库里出现一堆标题为空的任务。更糟的是，如果后面某段代码对 `title` 调用了 `.length()` 之类的方法，`title` 是 `null` 就会直接抛出 `NullPointerException`，导致程序在运行中途报错。

与其在方法体里到处写"防御性判断"，不如在字段上声明清楚"这个字段必须满足什么条件"，交给 Spring 在方法执行前统一检查。这样做的好处是：规则写在一个地方（字段声明处），一眼就能看出这个类对字段有什么要求，不用翻遍整个方法体去找校验逻辑。

## 核心概念

| 注解 | 作用 | 最小示例 |
|---|---|---|
| `@NotNull` | 字段不能是 `null`（但空字符串 `""` 是允许的） | `@NotNull private Long userId;` |
| `@NotBlank` | 字段不能是 `null`，也不能是空字符串或全是空格（专用于 `String`） | `@NotBlank private String title;` |
| `@Email` | 字段必须符合邮箱格式 | `@Email private String email;` |
| `@Size` | 限制字符串长度或集合元素个数的范围 | `@Size(min = 1, max = 100) private String title;` |
| `@Valid` | 贴在 Controller 方法参数上，告诉 Spring "请对这个参数做校验" | `create(@Valid @RequestBody TaskCreateRequest request)` |

这些注解都来自 Jakarta Bean Validation 规范（`jakarta.validation.constraints` 包），Spring Boot 的 `spring-boot-starter-validation` 依赖里已经包含了具体实现，直接引入即可使用，不需要手写版本号（由 Spring Boot 的依赖管理统一控制）。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## 图解

```
浏览器提交请求
     ↓
DispatcherServlet 找到 TaskController.create
     ↓
Spring 先看方法参数上有没有 @Valid
     ↓ 有
按照 TaskCreateRequest 字段上的校验注解逐一检查
     ↓
   全部通过 ──────────────▶ 正常执行 create 方法体
     ↓ 有不满足的
抛出 MethodArgumentNotValidException（方法体一行代码都不会执行）
```

## 最小示例

`dto/TaskCreateRequest.java`（在上一章基础上加上校验注解）
```java
package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TaskCreateRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 100, message = "标题长度不能超过 100 个字符")
    private String title;

    @Size(max = 500, message = "描述长度不能超过 500 个字符")
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
```

`controller/TaskController.java`（只展示相关方法）
```java
package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskCreateRequest;
import com.example.taskmanager.dto.TaskResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @PostMapping
    public TaskResponse create(@Valid @RequestBody TaskCreateRequest request) {
        // 能执行到这里，说明 title、description 已经通过了校验
        // 具体的转换、保存逻辑同上一章
        ...
    }
}
```

## 代码逐行解释

- `@NotBlank(message = "标题不能为空")`：贴在 `title` 字段上，`message` 属性是校验失败时用来描述错误的文字，之后会被前端看到。
- `@Size(max = 100, message = "...")`：限制字符串最长 100 个字符，也可以同时写 `min` 限制最短长度。
- `@Valid`：贴在 Controller 方法的参数前面，等于告诉 Spring："这个参数是需要校验的，请在调用方法体之前，按照它类里字段上的校验注解逐条检查一遍。"
- `@RequestBody`：把 HTTP 请求体的 JSON 反序列化成 `TaskCreateRequest` 对象（第 21 章讲过），这一步发生在校验**之前**——先把 JSON 变成对象，再对这个对象做校验。

**关键点：`@Valid` 的校验发生在 Controller 方法真正执行之前。** 如果 `request` 里有任何字段不满足校验注解的要求，Spring 会直接抛出一个 `MethodArgumentNotValidException` 异常，`create` 方法体里的代码**一行都不会执行**。这个异常现在会导致什么样的 HTTP 响应？下一章"全局异常处理"会专门讲怎么把它转换成清晰的 400 错误信息，而不是让浏览器收到一个看不懂的默认报错页面。

## 程序运行过程

1. 浏览器发送 `POST /tasks`，请求体 JSON 里 `title` 是空字符串 `""`。
2. `DispatcherServlet` 根据 URL 和方法找到 `TaskController.create`（`HandlerMapping` 负责"找谁处理"）。
3. `HandlerAdapter` 准备调用 `create` 方法之前，先用 Jackson 把请求体反序列化成 `TaskCreateRequest` 对象。
4. `HandlerAdapter` 发现方法参数上有 `@Valid`，于是按照 `TaskCreateRequest` 类里字段上的校验注解逐一检查这个对象。
5. 检查到 `title` 字段是空字符串，不满足 `@NotBlank`，校验失败。
6. Spring 抛出 `MethodArgumentNotValidException`，`create` 方法体不会被执行，请求处理流程被中断，转而进入异常处理环节（下一章内容）。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 加了 `@NotBlank` 却完全没生效，脏数据照样进方法体 | Controller 方法参数上忘了加 `@Valid` | 校验注解只声明"规则"，必须配合 `@Valid` 才会真正触发检查 |
| 校验失败后浏览器收到一大段看不懂的错误堆栈 | 还没做全局异常处理，Spring 默认返回的错误信息比较原始 | 下一章会讲怎么统一转换成清晰的 JSON 错误信息 |
| `@Email` 校验一个 `null` 值也通过了 | `@Email` 本身不检查"是否为空"，只检查"格式是否正确"，`null` 被视为跳过检查 | 需要同时加 `@NotBlank`（`String` 类型）或 `@NotNull`（其它类型） |

## 动手练习

1. 给 `TaskCreateRequest` 的 `description` 也加上 `@NotBlank`，观察不传 `description` 时会不会被拦下。
2. 参照 `User` 相关的 Request，给邮箱字段加上 `@NotBlank` + `@Email` 两个注解，思考为什么两个要一起用。
3. 故意在 Controller 方法参数上去掉 `@Valid`，重新发一次带空标题的请求，观察是否还会被拦截，验证"注解本身不生效，必须配合 `@Valid`"这个结论。

## 小测验

1. `@NotNull` 和 `@NotBlank` 的区别是什么？
2. 校验失败会在 Controller 方法体执行**之前**还是**之后**发生？
3. 只在字段上写了 `@NotBlank`，但方法参数上没写 `@Valid`，校验会生效吗？

<details>
<summary>参考答案</summary>

1. `@NotNull` 只要求不是 `null`，空字符串 `""` 能通过；`@NotBlank` 专用于字符串，要求既不是 `null`，也不能是空字符串或全空格。
2. 之前。`@Valid` 的校验发生在 Spring 调用 Controller 方法体之前，一旦校验失败会直接抛出异常，方法体不会被执行。
3. 不会生效。校验注解只是声明规则，必须在方法参数前加上 `@Valid`，Spring 才会真正去检查这个参数。
</details>

## 本章总结
你学会了用 `@NotBlank`、`@Size` 等注解声明字段规则，并用 `@Valid` 让 Spring 在方法执行前自动完成校验。校验失败目前会抛出一个不太友好的异常，下一章我们用全局异常处理，把它变成清晰的 400 错误响应。
