# 第 36 章　基础自动化测试

## 本章目标
理解为什么不能永远只靠 Postman 手动测试；认识 JUnit 5 常用的注解和断言方法；清楚区分"普通单元测试"（`@Test`，不启动 Spring）和"Spring Boot 集成测试"（`@SpringBootTest`，启动整个 ApplicationContext），并各写一个最小例子。

## 一句话理解
普通单元测试是"不惊动 Spring，只测一小段独立逻辑，跑得飞快"；Spring Boot 集成测试是"真的把整个 Spring 容器启动起来，Bean 之间真实地互相注入，更接近程序实际运行的样子，但速度慢一些"——这是两种目的不同的测试，不是同一回事。

## 为什么需要它

到目前为止，验证一个接口写得对不对，我们一直依赖 Postman：改完代码，打开 Postman，手动点一下"发送"，肉眼看看返回结果对不对。这个方法在项目还小的时候够用，但会暴露出两个明显的问题：

1. **容易漏测。** `task-manager` 项目到最后至少有十几个接口，每次改完代码，理论上应该把所有可能受影响的接口都手动点一遍。人是会偷懒、会遗漏的，改了 `TaskService` 里的一行代码，你未必会记得去重新测一遍所有依赖它的接口。
2. **改坏了不容易第一时间发现。** 如果你今天改了代码，但没有测到某个受影响的接口，这个 Bug 可能要等到几天后别人（甚至是上线后的用户）踩到才会暴露，那时候排查成本比当场发现要高得多。

自动化测试解决的正是这个问题：把"验证代码对不对"这件事写成代码本身，以后每次改动，只需要重新跑一遍这些测试代码，几秒钟内就能知道有没有把之前能跑通的功能改坏。

## 核心概念

| 概念 | 含义 |
|---|---|
| `@Test` | JUnit 5 提供的注解，贴在一个方法上，表示"这是一个测试方法"，测试框架会自动发现并执行它 |
| 普通单元测试 | 只用 `@Test`，**不启动**整个 Spring 容器，测试对象通常是自己 `new` 出来的，或者只测一段不依赖 Spring、不依赖数据库的独立逻辑，速度非常快 |
| `@SpringBootTest` | 贴在测试类上，表示这个测试类需要启动**完整的** Spring ApplicationContext，测试方法里可以通过依赖注入拿到真实的 Bean（比如真正连接数据库的 `TaskService`），更接近程序实际运行时的状态，但因为要启动整个容器，速度比单元测试慢很多 |
| Arrange-Act-Assert（AAA） | 一种常见的测试代码组织方式：**Arrange**（准备数据）→ **Act**（执行被测试的操作）→ **Assert**（断言结果是否符合预期） |
| 断言（Assertion） | 类似 `assertEquals(期望值, 实际值)` 这样的方法，用来判断"实际结果是否和预期一致"，不一致时测试会失败并给出提示 |

### JUnit 5 详细介绍

前面提到的 `@Test`，其实只是 JUnit 5 众多功能里最基础的一个。既然本教程从这里开始要正式写测试代码，有必要把 JUnit 5 本身多介绍一点，不然只知道 `@Test`，遇到别的项目用到别的写法就会看不懂。

**JUnit 5 是什么**：目前 Java 生态里最主流的单元测试框架，本教程锁定的 `spring-boot-starter-test` 内部已经整合了它，不需要单独引入。JUnit 5 内部分成三部分（了解即可，不用深究）：JUnit Platform（负责发现和运行测试的底层机制）、JUnit Jupiter（我们平时写的 `@Test`、断言这些 API 的来源）、JUnit Vintage（用来兼容运行老版本 JUnit 4 的测试代码）。写测试代码时，我们基本只会接触到 Jupiter 提供的这一套。

**常用注解**：

| 注解 | 作用 |
|---|---|
| `@Test` | 标记一个方法是测试方法 |
| `@BeforeEach` | 标记一个方法在**每个** `@Test` 方法执行之前都会自动跑一次，常用来做重复的准备工作（比如创建一个新的测试对象） |
| `@AfterEach` | 标记一个方法在**每个** `@Test` 方法执行之后都会自动跑一次，常用来做清理工作 |
| `@BeforeAll` | 标记一个方法在这个测试类**所有**测试方法开始之前只执行**一次**（必须是 `static` 方法），适合"整个类共用、代价较大"的准备工作 |
| `@AfterAll` | 和 `@BeforeAll` 相对，在所有测试方法跑完之后只执行一次（同样必须是 `static`） |
| `@DisplayName("描述文字")` | 给测试方法起一个更易读的显示名称，测试报告里会显示这个名字而不是方法名 |
| `@Disabled("原因")` | 暂时跳过这个测试，不参与执行，适合"这个功能还没写完，先别测"的场景 |

**常用断言方法**（都在 `org.junit.jupiter.api.Assertions` 里，通常用 `import static` 直接调用方法名）：

| 断言方法 | 作用 |
|---|---|
| `assertEquals(期望值, 实际值)` | 判断两个值相等 |
| `assertTrue(条件)` / `assertFalse(条件)` | 判断一个布尔表达式为真/为假 |
| `assertNull(对象)` / `assertNotNull(对象)` | 判断对象是否为 `null` |
| `assertThrows(异常类型.class, () -> { ... })` | 判断执行某段代码时，是否会抛出指定类型的异常——这是验证"错误处理逻辑对不对"的常用手段 |
| `assertAll(...)` | 把多个断言打包在一起执行，即使前面某个断言失败，后面的断言依然会继续执行并一起报告，而不是像普通写法那样一失败就中断 |

**测试方法的执行顺序示例**（帮助理解 `@BeforeEach`/`@AfterEach` 什么时候跑）：

```java
class OrderCalculatorTest {

    private OrderCalculator calculator;

    @BeforeEach
    void setUp() {
        // 每个 @Test 方法执行前都会先跑一遍这里，保证每个测试用到的都是"干净"的新对象
        calculator = new OrderCalculator();
    }

    @Test
    @DisplayName("数量为 0 时，总价应该是 0")
    void totalPrice_shouldBeZero_whenQuantityIsZero() {
        assertEquals(0, calculator.totalPrice(10, 0));
    }

    @Test
    @DisplayName("传入负数数量应该抛出异常")
    void totalPrice_shouldThrow_whenQuantityIsNegative() {
        assertThrows(IllegalArgumentException.class, () -> calculator.totalPrice(10, -1));
    }
}
```

如果 `OrderCalculatorTest` 里有 5 个 `@Test` 方法，`setUp()` 会在**每一个**方法执行前各跑一次，一共跑 5 次——这保证了测试之间互不干扰：上一个测试对 `calculator` 做的任何修改，都不会影响下一个测试，因为每次都是全新的对象。

**JUnit 5 是怎么被跑起来的**：在 IDEA 里，直接点测试方法左侧的运行按钮即可；命令行执行 `mvn test`（第 17 章学过的 Maven 命令）时，Maven 会调用一个叫 `maven-surefire-plugin` 的插件，自动扫描 `src/test/java` 下所有符合命名规则的测试类（比如以 `Test` 结尾），依次执行里面的 `@Test` 方法，最后在控制台汇总打印"运行了多少个、通过多少个、失败多少个"。

**必须明确的一点：单元测试和集成测试不是一回事。** 单元测试追求"快、独立、只测一个小单元"；集成测试追求"真实、贴近实际运行环境"，两者服务于不同的目的，一个项目里通常两种都会写，不能互相替代。

对应的依赖，Spring Boot 项目用 Spring Initializr 创建时通常已经默认包含（`spring-boot-starter-test`，内部整合了 JUnit 5），版本由 Spring Boot 的依赖管理（BOM）统一控制，不需要手写具体版本号：

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

## 图解

```
普通单元测试（@Test）
  测试方法 → 直接 new 对象 / 调用纯逻辑方法 → 断言结果
  （全程没有 Spring 容器参与，跑得很快）

Spring Boot 集成测试（@SpringBootTest）
  测试方法启动 ------> 整个 ApplicationContext 被启动
                            ↓
                  Bean 之间按真实依赖关系被创建、注入
                            ↓
                  测试方法里 @Autowired 拿到真实的 TaskService
                            ↓
                  调用真实方法（可能真的会访问数据库）
                            ↓
                        断言结果
  （更接近生产环境的运行方式，但启动过程比单元测试慢很多）
```

## 最小示例

### ① 普通单元测试：测试一段不依赖数据库的纯逻辑

假设 `TaskService` 里有一个方法，用来判断一个状态字符串是否是合法的任务状态，这段逻辑本身不需要访问数据库，很适合写成单元测试：

`service/TaskService.java`（新增一个纯逻辑方法）
```java
package com.example.taskmanager.service;

import com.example.taskmanager.entity.Task;

import java.util.List;

public interface TaskService {

    Task create(Task task);

    // 纯逻辑判断，不依赖数据库，只判断传入的字符串是否是合法状态
    boolean isValidStatus(String status);
}
```

`service/impl/TaskServiceImpl.java`（实现该方法）
```java
@Override
public boolean isValidStatus(String status) {
    return "TODO".equals(status) || "IN_PROGRESS".equals(status) || "DONE".equals(status);
}
```

`src/test/java/com/example/taskmanager/TaskServiceUnitTest.java`
```java
package com.example.taskmanager;

import com.example.taskmanager.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

// 注意：这个类没有 @SpringBootTest，也没有启动 Spring 容器
class TaskServiceUnitTest {

    @Test
    void isValidStatus_shouldReturnTrue_whenStatusIsTodo() {
        // Arrange：准备被测试的对象，这里直接 new，不需要 Spring 帮忙注入
        TaskServiceImpl taskService = new TaskServiceImpl(null); // 这个方法用不到 Mapper，可以先传 null

        // Act：执行被测试的方法
        boolean result = taskService.isValidStatus("TODO");

        // Assert：断言结果符合预期
        assertTrue(result);
    }

    @Test
    void isValidStatus_shouldReturnFalse_whenStatusIsUnknown() {
        TaskServiceImpl taskService = new TaskServiceImpl(null);

        boolean result = taskService.isValidStatus("UNKNOWN_STATUS");

        assertFalse(result);
    }
}
```

### ② Spring Boot 集成测试：真正启动容器，测试 create 方法

`src/test/java/com/example/taskmanager/TaskServiceIntegrationTest.java`
```java
package com.example.taskmanager;

import com.example.taskmanager.entity.Task;
import com.example.taskmanager.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest // 启动完整的 Spring ApplicationContext
class TaskServiceIntegrationTest {

    @Autowired // 由 Spring 容器真实注入，内部的 TaskMapper 也是真实创建、真实连接数据库的
    private TaskService taskService;

    @Test
    void create_shouldReturnTaskWithGeneratedId() {
        // Arrange：准备一个待新建的任务
        Task task = new Task();
        task.setTitle("集成测试专用任务");
        task.setStatus("TODO");

        // Act：调用真实的 Service 方法，这一步会真的经过 Mapper，操作数据库
        Task saved = taskService.create(task);

        // Assert：新建成功后，数据库应该已经为它生成了主键 id
        assertNotNull(saved.getId());
    }
}
```

## 代码逐行解释

- `TaskServiceUnitTest` 类上**没有**任何 Spring 相关注解，`new TaskServiceImpl(null)` 是自己手动创建对象——因为 `isValidStatus` 方法完全不涉及 `taskMapper`，传 `null` 也不会出问题。这个测试从头到尾，Spring 容器根本没有被启动，跑起来是毫秒级的。
- `TaskServiceIntegrationTest` 类上贴了 `@SpringBootTest`，测试运行时会真的启动整个 Spring Boot 应用（和你平时点"运行"启动项目做的事情基本一样），把所有 Bean 都创建好、注入好。
- `@Autowired private TaskService taskService;`：这里的 `taskService` 是 Spring 容器里**真实**创建、真实装配好依赖（包括内部的 `TaskMapper`）的对象，不是自己手动 `new` 出来的。
- `taskService.create(task)`：这一步会真正调用到 `TaskMapper`，执行真实的 `INSERT` 语句，所以这个测试需要有一个可连接的数据库环境，运行速度比单元测试明显慢。
- 两个测试方法名都遵循"被测方法\_场景\_预期结果"这样的命名习惯，方便一眼看出这个测试在验证什么。

## 程序运行过程

**普通单元测试执行过程：**

1. 测试框架（JUnit 5）扫描到 `TaskServiceUnitTest` 类里带 `@Test` 的方法。
2. 直接调用这些方法，方法内部自己 `new` 出被测对象，全程不涉及 Spring 容器、DispatcherServlet、数据库连接。
3. 方法执行完，断言通过则测试标记为"通过"（绿色），不通过则标记为"失败"并打印出期望值和实际值的差异。

**Spring Boot 集成测试执行过程：**

1. JUnit 5 扫描到 `TaskServiceIntegrationTest` 类，发现它带有 `@SpringBootTest`。
2. 测试运行前，Spring 先完整启动一次 ApplicationContext——扫描组件、创建 Bean（包括 `TaskServiceImpl`、`TaskMapper` 对应的实现）、按依赖关系完成注入，这个过程和正常启动 `TaskManagerApplication` 基本一致。
3. 容器启动完成后，`@Autowired` 把真实的 `TaskService` 注入到测试类的字段上。
4. 测试方法执行 `taskService.create(task)`，请求真实经过 `Service → Mapper → MySQL` 这条链路，数据库里真的会多出一条记录。
5. 断言 `saved.getId()` 不为 `null`，验证数据库确实生成了自增主键并正确返回。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 单元测试里 `@Autowired` 报空指针 | 忘了单元测试没有启动 Spring 容器，`@Autowired` 根本不会生效 | 需要依赖注入的场景请用 `@SpringBootTest`，纯逻辑测试直接 `new` 对象即可 |
| 集成测试报连接数据库失败 | 运行测试的环境没有可用的 MySQL，或者测试用的数据库配置和开发环境冲突 | 确认测试运行的机器上数据库可访问；实际项目里通常会为测试单独准备一份测试库，本教程不深入这部分配置 |
| 集成测试跑一次要好几秒，写单元测试一样的量级但明显更慢 | 这是正常现象，`@SpringBootTest` 每次都要启动完整容器 | 优先用单元测试覆盖大量纯逻辑分支，只在必要处编写少量集成测试 |

## 动手练习

1. 给 `UserService` 也写一个类似 `isValidStatus` 的纯逻辑方法（比如"判断用户名长度是否在 3~20 之间"），并为它写一个普通单元测试。
2. 仿照 `TaskServiceIntegrationTest`，为 `UserService.create` 写一个集成测试，验证新建用户后 `id` 不为空。
3. 故意让 `isValidStatus` 的实现出现一个 Bug（比如漏判断 `"DONE"`），重新运行单元测试，观察测试失败时的提示信息长什么样。

## 小测验

1. 普通单元测试和 Spring Boot 集成测试最核心的区别是什么？
2. Arrange-Act-Assert 三个步骤分别对应做什么？
3. 为什么不能永远只靠 Postman 手动测试？
4. 一个测试类里有 3 个 `@Test` 方法，`@BeforeEach` 标注的方法会被执行几次？如果换成 `@BeforeAll` 呢？
5. 如果想验证"传入非法参数时，方法应该抛出异常"，应该用哪个断言方法？

<details>
<summary>参考答案</summary>

1. 普通单元测试不启动 Spring 容器，只测一个独立的小单元，速度快；Spring Boot 集成测试用 `@SpringBootTest` 启动完整的 ApplicationContext，Bean 可以被真实注入，更接近实际运行环境，但速度更慢。
2. Arrange 准备测试所需的数据和对象；Act 执行被测试的方法或操作；Assert 断言实际结果是否符合预期。
3. 手动测试每次改完代码都要重新点一遍，容易遗漏受影响的接口，而且改坏了不容易第一时间发现，问题可能要等很久之后才暴露。
4. `@BeforeEach` 会执行 3 次——每个 `@Test` 方法执行前都会跑一次；`@BeforeAll` 只会执行 1 次，在这个类所有测试方法开始之前统一跑一次。
5. `assertThrows(异常类型.class, () -> { ... })`。
</details>

## 本章总结
你理解了自动化测试相对手动测试的价值，学会了区分"不启动 Spring 的普通单元测试"和"启动完整容器的 Spring Boot 集成测试"，并用 Arrange-Act-Assert 结构分别写出了最小示例。下一章我们综合运用前面学过的全部知识，完成最终项目：Task 管理系统的完整 CRUD（含基础分页）。
