# 第 14 章　MVC 模式（经典 + 现代分层）

## 本章目标
理解经典 MVC 模式里 Model、View、Controller 三者各自的职责；理解现代 Spring Boot 项目里更细致的分层方式 Controller → Service → Mapper/Repository → Database；搞清楚经典 MVC 的 Model 并不等于一个单独的类，而是被进一步拆分成了 Service、Mapper、Entity/DTO。

## 一句话理解
MVC 就是"谁负责接请求、谁负责管数据和业务规则、谁负责组织展示"分得清清楚楚的一种代码组织方式；现代 Web 项目在这个基础上，把"管数据和业务规则"这一部分又拆得更细。

## 为什么需要它
上一章我们看到了不分层带来的问题：一个方法里既取参数、又校验、又处理业务、又拼页面，改一处影响一片。MVC 就是解决这个问题的经典方案——它的核心思想很简单：**把不同职责的代码放到不同的地方，各自只关心自己该关心的事**。理解了 MVC，你才能理解为什么 Spring Boot 项目里代码要分成 `controller`、`service`、`mapper` 这几个包，而不是把所有代码堆在一个类里。

## 核心概念

### 经典 MVC 三要素

| 角色 | 职责 | 类比 |
|---|---|---|
| Model（模型） | 管理数据和业务规则：数据长什么样、业务逻辑该怎么处理 | 后厨——准备食材、按菜谱做菜 |
| View（视图） | 负责把数据展示给用户看，只管"怎么呈现"，不管"数据从哪来、逻辑怎么算" | 摆盘——把做好的菜端上桌，摆得好看 |
| Controller（控制器） | 接收请求，决定调用 Model 的哪部分逻辑，再决定用哪个 View 展示结果 | 服务员——接收顾客点单，喊后厨做菜，再把菜端给顾客 |

三者的协作关系：

```
用户操作
   │
   ▼
Controller（接收请求，决定找谁处理）
   │
   ▼
Model（执行业务逻辑，处理/获取数据）
   │
   ▼
Controller（拿到 Model 处理的结果）
   │
   ▼
View（把结果组织成用户能看懂的样子）
   │
   ▼
返回给用户
```

### 现代 Spring Boot 项目里的分层

经典 MVC 提出的年代，"Model"这一层还比较笼统——业务逻辑、数据访问，甚至数据结构定义，都可能一股脑塞在这一层里。到了现代企业级 Spring Boot 项目，"Model"这一层被进一步拆细，形成了更常见的四层结构：

| 层 | 对应经典 MVC 里的角色 | 职责 |
|---|---|---|
| Controller | Controller | 接收 HTTP 请求，读取参数，调用 Service，把结果返回给客户端（通常是 JSON，不再是拼 HTML 页面） |
| Service | Model 的一部分 | 处理业务逻辑：这件事该怎么做、要做哪些判断、要按什么顺序调用哪些方法 |
| Mapper / Repository | Model 的一部分 | 负责和数据库打交道：执行 SQL、把数据库里的行数据变成 Java 对象 |
| Entity / DTO | Model 的一部分 | 定义数据的结构长什么样（Entity 对应数据库表结构，DTO 用于层与层之间传递数据） |
| Database | —— | 真正存放数据的地方，MVC 模式本身不包含这一层，但现代 Web 项目几乎都离不开它 |

**关键结论：经典 MVC 的 Model 并不等于一个单独的 Service 类。** 现代企业项目会把 Model 这一层继续拆分为 **Service（业务逻辑）+ Mapper（数据库访问）+ Entity/DTO（数据结构）**——这三部分合起来，才对应经典 MVC 里"Model"这一个角色所承担的全部职责。至于 View，在现代前后端分离的项目里，后端通常不再负责拼页面，而是直接返回 JSON 数据，页面展示交给前端框架去做（这也是为什么第 10 章讲 HTTP 时，响应体举的例子是 JSON 而不是 HTML）。

## 图解

先看完整的现代分层调用链（这张图和全教程的"调用链要求"是同一张图，本章只截取和分层相关的部分）：

```
Browser
  ↓ HTTP Request
Tomcat
  ↓
DispatcherServlet（后面第 20 章详细讲，先知道它是统一入口）
  ↓
Controller       ← 只做：接参数、调用 Service、返回结果
  ↓
Service          ← 只做：业务逻辑判断和处理
  ↓
Mapper           ← 只做：和数据库打交道
  ↓
MySQL
  ↓（结果原路返回）
Mapper → Service → Controller
  ↓
HttpMessageConverter / Jackson（Java 对象 → JSON，第 21 章详细讲）
  ↓ HTTP Response
Browser
```

再对比一下"该有的分层"和"塞满业务逻辑的 Controller"，看看为什么后者是一种不好的写法：

```
❌ 反例：所有逻辑都堆在 Controller 里
┌─────────────────────────────────────┐
│ UserController                       │
│  - 接收请求参数                       │
│  - 手动校验参数格式                    │
│  - 拼 SQL 语句                        │
│  - 直接操作数据库连接                  │
│  - 处理业务规则（比如"余额不足不能下单"）│
│  - 组装返回结果                        │
└─────────────────────────────────────┘
问题：这个类什么都干，改一处容易牵连全部，
     也没法把"业务逻辑"单独拿出来复用或测试。

✅ 正例：职责分给不同的层
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ UserController │──▶│  UserService   │──▶│  UserMapper    │
│ 接参数、调用     │   │ 业务逻辑判断     │   │  和数据库打交道 │
│ Service、返回   │   │ （比如余额校验） │   │  （执行 SQL）  │
└───────────────┘   └───────────────┘   └───────────────┘
```

## 最小示例

这里只用没有具体框架注解的伪代码，展示"分层之后代码大概长什么样"，重点体会**每一层只关心自己该关心的事**（具体的 `@RestController`、`@Service`、`@Mapper` 等 Spring 注解会在第 15 章之后陆续学到，这里先不使用真实注解，避免提前引入尚未学习的概念）：

```java
// Controller 层：只负责接请求、调用 Service、返回结果
class UserController {
    UserService userService; // 从哪里来的，后面第 15、16 章讲 IoC/DI 时详细说明

    Object getUser(String id) {
        User user = userService.findById(id);
        return user; // 交给框架转成 JSON 返回，具体机制第 21 章讲
    }
}

// Service 层：只负责业务逻辑
class UserService {
    UserMapper userMapper;

    User findById(String id) {
        // 这里可以放业务判断，比如"id 格式是否合法"、"是否需要脱敏处理"等
        return userMapper.selectById(id);
    }
}

// Mapper 层：只负责和数据库打交道
interface UserMapper {
    User selectById(String id); // 具体怎么只写接口就能查数据库，第 27 章 MyBatis 会详细讲
}
```

## 代码逐行解释

- `UserController`：只做三件事——接收参数（这里是 `id`）、调用 `userService.findById(id)`、把结果返回。它完全不知道数据是从数据库查出来的，还是从内存缓存里拿的，这正是分层的意义：**Controller 不需要关心数据从哪来，只需要知道找 Service 要**。
- `UserService`：这一层放的是"业务逻辑"，示例里只写了一句注释说明它可以放什么判断（真正的业务规则会随项目不同而不同）。它调用 `userMapper.selectById(id)` 来拿到原始数据，本身不关心 SQL 怎么写。
- `UserMapper`：只是一个接口，声明了"能按 id 查用户"这个能力，具体怎么执行 SQL、怎么和数据库连接，它自己完全不管——这背后的原理（为什么只写 interface 就能工作）留到第 27 章 MyBatis 部分详细讲，这里先记住一句话："Mapper 层负责和数据库打交道，Service 不需要知道细节"。

> 本章示例刻意没有使用任何 Spring 注解（比如 `@RestController`、`@Autowired`），因为这些内容属于后面第 15～21 章的知识点，这里只是借用类名和调用关系来说明"分层"这个概念本身，不要把这段伪代码当作可以直接运行的完整项目。

## 程序运行过程

结合上面的伪代码，按"调用链要求"里和本章相关的问题梳理一遍（完整版本的答案要等学完 Spring MVC、MyBatis 之后才能完全讲清楚，这里先建立整体印象）：

1. **请求怎么找到这个 Controller**：这是第 20 章 `DispatcherServlet` 要详细回答的问题，本章先只需要知道"分层之后，请求最终会被转交到 Controller 层的某个方法里"。
2. **Service 从哪里来的**：示例里 `UserController` 直接声明了一个 `UserService` 类型的字段，真正在 Spring 项目里，这个对象不是自己 `new` 出来的，而是由 Spring 容器创建并"注入"进来的——具体怎么做到，第 15、16 章会详细讲 IoC 和 DI。
3. **Mapper 为什么只有 interface 也能工作**：这是第 27 章 MyBatis 部分才会揭晓的机制，这里只需要记住：Mapper 层对外表现为一个接口，Service 只管调用它声明的方法，不需要关心它内部是怎么实现的。
4. 分层之后，一条请求的处理过程大致是：Controller 收到请求 → 调用 Service 处理业务 → Service 调用 Mapper 查数据 → 数据原路返回 → Controller 把结果交给框架转换和返回。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| Controller 方法里直接写大段 `if-else` 业务判断 | 没有把业务逻辑下沉到 Service 层，图省事直接写在 Controller 里 | 把判断逻辑移到 Service 方法里，Controller 只负责调用 |
| Controller 直接拼 SQL 或直接操作数据库连接 | 跳过了 Mapper 层，Controller 承担了数据访问层的职责 | 数据访问统一放到 Mapper 层，Controller/Service 都不应该直接写 SQL |
| 认为 Model 就是"一个叫 Model 的类" | 把经典 MVC 的术语直接照搬到现代项目里找同名类 | 理解 Model 是一类职责的统称，现代项目里它被拆成了 Service + Mapper + Entity/DTO，不会有一个类真的叫 `Model` |
| 把所有数据结构都塞进同一个类里传来传去 | 没有区分数据库结构（Entity）和层间传递的数据结构（DTO） | Entity 对应数据库表，DTO 用于对外传递数据，两者的区分和命名边界会在第 30 章详细展开 |

## 动手练习

1. 用自己的话解释一下："为什么现代 Spring Boot 项目不会有一个类叫 `Model.java`？"
2. 参照本章"正例"分层图，给"查询商品详情"这个功能画出对应的 Controller/Service/Mapper 三层调用图。
3. 找一个你听说过的开源 Java Web 项目（或者回忆一下上一章的例子），思考：如果它没有做分层，会遇到哪些具体问题？

## 小测验

1. 经典 MVC 的三要素分别是什么，各自负责什么？
2. 现代 Spring Boot 项目里，经典 MVC 的 Model 被拆成了哪几部分？
3. Controller 层应不应该直接写大量业务判断逻辑？为什么？
4. 现代前后端分离项目里，View 这一层通常发生了什么变化？

<details>
<summary>参考答案</summary>

1. Model 负责管理数据和业务规则，View 负责把数据展示给用户，Controller 负责接收请求并协调 Model 和 View。
2. 被拆成 Service（业务逻辑）+ Mapper/Repository（数据库访问）+ Entity/DTO（数据结构定义）。
3. 不应该。Controller 应该只负责接收请求、调用 Service、返回结果，业务判断逻辑应该下沉到 Service 层，这样职责清晰，也方便复用和维护。
4. 后端通常不再负责拼 HTML 页面，而是直接返回 JSON 数据，页面展示交给前端框架处理，"View"这一层的概念在前后端分离架构里更多体现在前端而不是后端代码中。
</details>

## 本章总结
你已经理解了经典 MVC 的三要素，以及现代 Spring Boot 项目如何把 Model 进一步拆分为 Service、Mapper、Entity/DTO 这几层，也明白了 Controller 不应该塞入大量业务逻辑。至此，"Web 通信原理"这一阶段的核心概念都已经讲完，接下来的阶段复习会帮你把 HTTP、Servlet、Tomcat、MVC 这几块知识串成一张完整的地图。
