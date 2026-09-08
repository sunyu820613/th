# 第 35 章　Debug 与常见报错排查

## 本章目标
认识开发中最常遇到的一批报错（404、400、500、连接失败、Bean not found、Mapper not found 等），知道大概是什么原因、怎么排查；学会在 IDEA 里打断点、单步调试、查看变量、看懂 Stack Trace。

## 一句话理解
几乎所有报错信息里都藏着"问题出在哪"的线索——学会读懂这些线索，比死记"遇到 XX 错误就怎么改"更重要，因为同一句报错背后的具体原因，每个项目可能都不完全一样。

## 为什么需要它

从环境搭建到现在，你大概率已经踩过不少坑：程序跑不起来、接口调不通、页面报错。这些报错很多时候看起来很吓人（一大段红色文字、一堆看不懂的类名），但初学者常犯的错误是"看到报错就慌，直接把整段错误复制去搜索，别人怎么改就照抄怎么改"。这一章的目标，是让你学会自己先冷静读一遍报错信息，判断大致是哪个环节出了问题，再有针对性地去排查，而不是盲目试错。

## 核心概念

### 5.1 常见 HTTP 状态码报错

| 报错 | 大概是什么原因 | 怎么排查 |
|---|---|---|
| **404 Not Found** | 请求的路径写错了；或者对应的接口方法没有写、注解没对齐；也可能是服务器压根没启动成功，用的还是旧的端口 | 检查浏览器/Postman 里请求的 URL 和 Controller 上 `@RequestMapping`/`@GetMapping` 等注解声明的路径是否完全一致（包括大小写、有没有多打或少打斜杠）；确认服务确实已经启动 |
| **400 Bad Request** | 请求参数或请求体格式不对，比如漏传了必填字段、JSON 格式写错了、类型对不上（比如该传数字传了文字），或者是第 31 章讲的 `@Valid` 校验没通过 | 打开 IDEA 控制台或浏览器 Network 面板，看返回的错误信息里具体提示哪个字段有问题；对照 Controller 方法参数和请求体逐个核对 |
| **500 Internal Server Error** | 服务器内部代码本身出了异常，比如空指针、类型转换失败、SQL 写错等，是最需要"看控制台堆栈"的一类错误 | 回到 IDEA 控制台，从上往下找到第一行属于**你自己代码包名**（比如 `com.example.taskmanager`）的那一行，通常那就是问题真正发生的位置 |

### 5.2 常见连接类报错

| 报错 | 大概是什么原因 | 怎么排查 |
|---|---|---|
| **Connection refused** | 目标端口没有任何程序在监听，最常见的场景是 MySQL 服务没启动，或者 `application.yml` 里配置的端口和实际不一致 | 检查 MySQL 服务是否已启动（命令行或系统服务列表里确认）；确认 `application.yml` 里的端口号和实际一致 |
| **Communications link failure** | 数据库连接的具体参数不对，比如 `url` 里数据库名拼错、用户名密码不对、防火墙拦截等，和 Connection refused 的区别在于"端口是通的，但连不上具体的数据库实例" | 逐项核对 `application.yml` 里 `datasource` 的 `url`、`username`、`password`；尝试用同样的用户名密码，通过命令行或数据库客户端工具直接连一次，确认凭据本身是对的 |

### 5.3 常见 Spring / MyBatis 报错

| 报错 | 大概是什么原因 | 怎么排查 |
|---|---|---|
| **`No qualifying bean of type '...' found`**（Bean not found） | Spring 想要注入某个类型的 Bean，但容器里根本没有这个 Bean。通常是忘了在类上加 `@Service`/`@Component`/`@Repository` 之类的注解，或者这个类所在的包没有被 `@SpringBootApplication` 所在包及其子包覆盖（包扫描扫不到） | 检查报错提示缺少的是哪个类型的 Bean，去找到对应的类，确认注解齐全；确认类所在的包路径在启动类包路径之下 |
| **`Invalid bound statement (not found): xxx.Mapper.xxx`**（Mapper not found） | Java 里的 Mapper 接口方法，在 MyBatis 的 XML Mapper 文件里找不到对应的 SQL 语句，通常是 XML 文件路径没有正确配置到项目里，或者方法名/`namespace` 对不上 | 确认 `application.yml` 里 `mybatis.mapper-locations` 指向的路径正确；确认 XML 文件里 `<mapper namespace="...">` 写的是完整、正确的 Mapper 接口全限定名；确认 `<select>`/`<insert>` 等标签的 `id` 和接口方法名一字不差（如果用的是 MyBatis-Plus 的 `BaseMapper` 自带方法，通常不会出现这个问题，只有自定义 XML 方法才需要这样排查） |

## 图解

```
看到一段报错，按这个顺序排查：

第一步：看状态码 / 异常类型是什么大类
   404 → 路径问题        400 → 参数问题
   500 → 代码内部异常      连接类报错 → 数据库/网络问题

第二步（针对 500 或未捕获异常）：从控制台堆栈里，
从上往下找第一行属于自己项目包名（com.example.taskmanager）的代码
   ↓
那一行，往往就是问题真正发生的位置

第三步：定位到具体代码后，用断点单步跟踪变量的实际值，
而不是"猜"哪里错了
```

## 最小示例

一段典型的 500 异常堆栈（节选，实际会更长）：

```
java.lang.NullPointerException: Cannot invoke "String.length()" because "title" is null
    at com.example.taskmanager.service.impl.TaskServiceImpl.create(TaskServiceImpl.java:23)
    at com.example.taskmanager.controller.TaskController.create(TaskController.java:15)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    ...（后面一大段属于 Spring 框架内部调用，先不用管）
```

## 代码逐行解释（如何读这段堆栈）

- 第一行 `java.lang.NullPointerException: ...`：异常类型和一句简短描述，这里说的是"想对一个值为 `null` 的 `title` 调用 `.length()`"——这句话本身已经告诉你问题大概是什么。
- 第二行 `at com.example.taskmanager.service.impl.TaskServiceImpl.create(TaskServiceImpl.java:23)`：这是堆栈的第一行，说明异常正是从这里抛出的——`TaskServiceImpl.java` 文件第 23 行。**这一行永远是最值得先看的一行。**
- 第三行 `at com.example.taskmanager.controller.TaskController.create(TaskController.java:15)`：说明是 `TaskController` 的第 15 行调用了刚才那个出问题的方法，往下看能帮你理解"这个调用是怎么发起的"。
- 后面一大串 `at java.base/...`、`at org.springframework...`：属于 Java 标准库和 Spring 框架内部的调用过程，绝大多数情况下**可以直接跳过**，除非你怀疑是框架本身的问题（初学阶段基本不需要怀疑这一点，99% 的情况是自己代码的问题）。

## 程序运行过程（IDEA 断点调试操作步骤）

用文字描述一次典型的断点调试过程，帮助你在 IDEA 里实际操作：

1. **打断点**：在 `TaskServiceImpl.java` 第 23 行（比如 `task.setTitle(request.getTitle().trim());` 这一行）的行号左侧空白处，鼠标点一下，会出现一个红色圆点，这就是"断点"，表示"程序执行到这一行时先暂停，别往下走"。
2. **以 Debug 模式启动**：不要用普通的绿色三角"运行"按钮，而是点旁边的虫子形状图标（Debug 按钮）启动项目。
3. **触发请求**：用 Postman 或浏览器发一个会执行到这段代码的请求，比如 `POST /tasks`。
4. **程序在断点处暂停**：IDEA 界面下方会自动弹出一个调试面板，代码执行到断点那一行时停住，这一行会被高亮显示，说明"还没执行这一行，正准备执行"。
5. **查看 Variables 面板**：调试面板左侧（或下方，视 IDEA 版本布局而定）有一个 "Variables" 面板，能看到当前方法里所有局部变量的实时值——比如这里能直接看到 `request` 对象里 `title` 字段到底是不是 `null`，不需要靠猜。
6. **Step Over（单步跳过）**：点击调试工具栏上那个"向下的箭头跨过一个小点"的图标（快捷键通常是 F8），程序会执行完当前这一行，然后停在下一行，但**不会**跳进这一行调用的方法内部——适合"我不关心这一行内部怎么实现，只想看执行完之后的结果"。
7. **Step Into（单步进入）**：如果当前行调用了另一个自己写的方法，想看看那个方法内部具体怎么执行的，可以用"箭头指向下方一个点"的图标（快捷键通常是 F7），会跳转进入被调用方法的内部，从它的第一行开始单步执行。
8. **观察问题根源**：结合 Variables 面板一步步往下走，直到看到某个变量的值和预期不一样（比如 `title` 果然是 `null`），这一步就找到了问题的真正原因，比如"上一步 `TaskCreateRequest` 里 `title` 字段确实没有被前端传过来"。
9. **停止调试**：确认问题原因后，点调试工具栏上的红色方块（Stop）结束调试，回去修改代码。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 打了断点，但程序完全不停 | 用了普通的"运行"而不是"Debug"模式启动；或者这段代码根本没有被执行到 | 确认用的是 Debug（虫子图标）启动；确认请求确实会触发到断点所在的方法 |
| 堆栈很长，不知道该看哪一行 | 不熟悉"从上往下找第一行自己项目包名"的方法 | 记住这条经验规则：先找包含你自己项目包名（如 `com.example.taskmanager`）的最上面那一行 |
| Bean not found 报错，但类上明明加了注解 | 类所在的包不在启动类 `@SpringBootApplication` 所在包的子包范围内，Spring 扫描不到 | 检查项目目录结构，确认所有类都在启动类所在包（或其子包）下 |

## 动手练习

1. 故意在一个 Controller 方法上写错 URL 路径的大小写，用 Postman 请求原来的路径，观察得到什么状态码。
2. 故意让某个 `@Service` 类漏掉注解，启动项目，仔细阅读控制台报出的 `No qualifying bean` 错误，尝试只凭这段报错文字定位到是哪个类缺了注解。
3. 在 `TaskServiceImpl` 里挑一个方法打上断点，故意发一个请求触发它，实际操作一遍 Step Over 和 Step Into，感受两者的区别。

## 小测验

1. 500 错误和 400 错误的本质区别是什么？
2. 面对一段很长的异常堆栈，应该优先看哪一行？
3. Step Over 和 Step Into 的区别是什么？

<details>
<summary>参考答案</summary>

1. 400 表示请求本身（参数、格式）有问题，责任通常在调用方；500 表示服务器代码内部执行出现了异常，责任在服务器这一端的代码。
2. 优先看堆栈里最上面那一行属于自己项目包名的代码，那通常就是异常真正发生的位置。
3. Step Over 会执行完当前行后停在下一行，不会进入当前行调用的方法内部；Step Into 则会跳进被调用方法内部，从其第一行开始继续单步执行。
</details>

## 本章总结
你认识了开发中最常见的一批报错类型和大致排查思路，也学会了用 IDEA 的断点、Step Over、Step Into 和 Variables 面板去实际定位问题，而不是靠猜测改代码。下一章我们学习基础的自动化测试，把"手动一遍遍点 Postman"这件事逐步交给代码去做。
