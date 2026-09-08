# 第 32 章　全局异常处理

## 本章目标
理解不处理异常时，前端会收到什么样的响应；学会用 `@RestControllerAdvice` + `@ExceptionHandler` 统一处理业务异常和校验异常，把它们转换成清晰的、带正确状态码的 JSON 错误信息。

## 一句话理解
`@RestControllerAdvice` 相当于给整个项目设置一个"异常总接待处"：不管哪个 Controller 抛出了异常，只要类型匹配，都会先被这里拦下来，转换成一份统一格式、状态码正确的错误响应，而不是把 Java 内部的报错堆栈直接甩给前端。

## 为什么需要它

假设 `task` 表里根本没有 `id = 999` 的任务，前端却发起了 `GET /tasks/999`。如果 Service 里是这样写的：

```java
public Task getById(Long id) {
    Task task = taskMapper.selectById(id);
    return task.getTitle() == null ? task : task; // 假设这里没做任何"查不到"的判断
}
```

或者更常见的情况：`taskMapper.selectById(999)` 返回 `null`，后面某处代码直接调用了 `task.getTitle()`。这时会抛出一个 `NullPointerException`，而 Spring 默认情况下，任何没有被捕获处理的异常，最终都会变成一个 **500 Internal Server Error** 响应返回给浏览器，响应体大概长这样：

```json
{
    "timestamp": "2026-09-06T10:00:00.000+00:00",
    "status": 500,
    "error": "Internal Server Error",
    "path": "/tasks/999"
}
```

前端拿到这个响应，完全不知道"到底是任务不存在，还是服务器出了别的故障"——500 这个状态码本身的含义是"服务器内部出问题了"，但"任务不存在"其实不是服务器故障，而是一个正常的业务场景，本该用更明确的 **404 Not Found** 来表达。同理，上一章提到的校验失败（`MethodArgumentNotValidException`），如果不处理，默认也会返回一个不够清晰的错误结构。

我们需要一种方式，把"任务不存在""参数不合法"这类业务异常，统一转换成结构清晰、状态码语义正确的 JSON 错误响应，而且这个转换逻辑最好写在一个地方，不用在每个 Controller 方法里都写一遍 `try-catch`。

## 核心概念

| 名词 | 含义 |
|---|---|
| `@RestControllerAdvice` | 贴在一个类上，声明这个类是"全局异常处理中心"（也可以做全局的返回值预处理，本章只讲异常处理这一种用法） |
| `@ExceptionHandler` | 贴在方法上，声明"这个方法专门处理某一种类型的异常" |
| `ResourceNotFoundException` | 自定义的业务异常，表示"要找的资源不存在"，本教程用它表示"任务/用户不存在" |
| `ResponseEntity` | Spring 提供的一个包装类，可以同时指定 HTTP 状态码和响应体 |
| `MethodArgumentNotValidException` | 上一章 `@Valid` 校验失败时 Spring 自动抛出的异常类型 |

## 图解

```
Browser 请求 GET /tasks/999
     ↓
Controller → Service 发现任务不存在，抛出 ResourceNotFoundException
     ↓
异常没有被 Controller 自己 catch，继续向外抛
     ↓
GlobalExceptionHandler（@RestControllerAdvice）拦截到这个异常
     ↓
对应的 @ExceptionHandler(ResourceNotFoundException.class) 方法被调用
     ↓
组装出 { "status": 404, "message": "任务不存在，id=999" }
     ↓
HttpMessageConverter / Jackson 把这个错误对象转成 JSON
     ↓ HTTP 404 Response
Browser
```

## 最小示例

`exception/ResourceNotFoundException.java`
```java
package com.example.taskmanager.exception;

// 自定义异常，表示"要查找的资源不存在"
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

`service/impl/TaskServiceImpl.java`（只展示相关方法）
```java
package com.example.taskmanager.service.impl;

import com.example.taskmanager.entity.Task;
import com.example.taskmanager.exception.ResourceNotFoundException;
import com.example.taskmanager.mapper.TaskMapper;
import com.example.taskmanager.service.TaskService;
import org.springframework.stereotype.Service;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskMapper taskMapper;

    public TaskServiceImpl(TaskMapper taskMapper) {
        this.taskMapper = taskMapper;
    }

    @Override
    public Task getById(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new ResourceNotFoundException("任务不存在，id=" + id);
        }
        return task;
    }
}
```

`exception/GlobalExceptionHandler.java`
```java
package com.example.taskmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 专门处理"资源不存在"这种业务异常，转换成 404
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", 404);
        body.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    // 专门处理 @Valid 校验失败抛出的异常，转换成 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("status", 400);
        // 把每个校验不通过的字段和对应的提示信息收集起来
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(
                error -> errors.put(error.getField(), error.getDefaultMessage())
        );
        body.put("message", "参数校验失败");
        body.put("errors", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
```

## 代码逐行解释

- `ResourceNotFoundException extends RuntimeException`：继承 `RuntimeException`（第 8 章讲过的"运行时异常"），这样抛出它的地方不需要在方法签名上写 `throws`，调用方也不强制要求 `catch`。
- `TaskServiceImpl.getById`：查询结果为 `null` 时，主动 `throw new ResourceNotFoundException(...)`，把"查不到数据"这个情况明确地表达成一个异常，而不是让 `null` 悄悄往下传，直到某处访问字段时才意外报 `NullPointerException`。
- `@RestControllerAdvice`：贴在 `GlobalExceptionHandler` 类上，告诉 Spring："这个类里的 `@ExceptionHandler` 方法，对项目里**所有** Controller 抛出的匹配异常都生效"，不需要在每个 Controller 里单独写。
- `@ExceptionHandler(ResourceNotFoundException.class)`：声明"这个方法专门处理 `ResourceNotFoundException` 类型（以及它的子类）的异常"。
- `ResponseEntity.status(HttpStatus.NOT_FOUND).body(body)`：`HttpStatus.NOT_FOUND` 对应状态码 404，`.body(body)` 把 `body` 这个 `Map` 作为响应体——最终这个 `Map` 同样会被 Jackson 转成 JSON。
- `handleValidation` 方法：处理上一章遗留的问题——`@Valid` 校验失败时抛出的 `MethodArgumentNotValidException`，从异常对象的 `getBindingResult()` 里能拿到具体是哪个字段、因为什么原因没通过校验，逐个收集后一起返回，方便前端展示给用户看。

## 程序运行过程

1. 浏览器发起 `GET /tasks/999`。
2. 请求经过 `DispatcherServlet → HandlerMapping → HandlerAdapter`，找到并调用 `TaskController` 里对应的方法。
3. Controller 调用 `taskService.getById(999)`。
4. Service 查询发现结果为 `null`，抛出 `ResourceNotFoundException("任务不存在，id=999")`。
5. 这个异常没有在 Controller 或 Service 里被 `catch`，于是继续沿着调用栈向外抛。
6. Spring MVC 发现抛出的异常类型匹配 `GlobalExceptionHandler` 里某个 `@ExceptionHandler` 方法的声明，调用该方法处理，而不是走默认的 500 错误逻辑。
7. `handleNotFound` 方法返回一个 `ResponseEntity`，里面已经指定好状态码 404 和响应体内容。
8. `HttpMessageConverter`/Jackson 把响应体（一个 `Map`）转换成 JSON。
9. 浏览器最终收到状态码 404、内容清晰的 JSON：`{"status": 404, "message": "任务不存在，id=999"}`。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `GlobalExceptionHandler` 写好了但完全没生效，还是原来的 500 页面 | 类上忘了加 `@RestControllerAdvice`，或者这个类没有被 Spring 扫描到（不在 `@ComponentScan` 覆盖的包路径下） | 检查注解是否写全，检查类所在包路径 |
| 抛出的自定义异常没有被对应方法处理 | `@ExceptionHandler` 里指定的异常类型和实际抛出的类型不匹配（比如继承关系搞反了） | 确认异常类的继承关系，`@ExceptionHandler` 也能匹配子类异常 |
| 校验失败的字段信息拿不到 | 用错了异常类型，或者没有调用 `getBindingResult()` | 参照本章示例，确认捕获的是 `MethodArgumentNotValidException` |

## 动手练习

1. 给 `UserService` 也加上"用户不存在则抛出 `ResourceNotFoundException`"的逻辑，验证同一个 `GlobalExceptionHandler` 是否对 `User` 相关的 Controller 也生效。
2. 尝试新增一个 `@ExceptionHandler(Exception.class)` 方法作为"兜底处理"，放在其它 `@ExceptionHandler` 方法之后，思考它什么时候会被触发（提示：更具体的异常类型优先匹配）。
3. 故意发一个标题为空的 `POST /tasks` 请求，观察返回的 JSON 里 `errors` 字段的内容是否符合预期。

## 小测验

1. 不做任何异常处理时，一个未被捕获的异常最终会让浏览器收到什么状态码？
2. `@RestControllerAdvice` 和 `@ExceptionHandler` 分别起什么作用？
3. `MethodArgumentNotValidException` 是在什么情况下被抛出的？

<details>
<summary>参考答案</summary>

1. 500 Internal Server Error。
2. `@RestControllerAdvice` 贴在类上，声明这个类是全局异常处理中心，对整个项目所有 Controller 生效；`@ExceptionHandler` 贴在方法上，声明这个方法具体处理哪一种类型的异常。
3. 在 Controller 方法参数上使用了 `@Valid`，且传入的对象字段不满足校验注解要求时被抛出。
</details>

## 本章总结
你学会了用自定义异常 + `@RestControllerAdvice` 把"资源不存在""参数不合法"这类业务场景，转换成状态码正确、结构清晰的 JSON 错误响应，不再让前端收到一个看不懂的 500 页面。下一章开始讲前后端如何通过 `fetch()` 交互，以及如何处理跨域问题。
