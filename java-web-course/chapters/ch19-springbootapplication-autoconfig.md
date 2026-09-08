# 第 19 章　@SpringBootApplication 与自动配置

## 本章目标
准确理解 `@SpringBootApplication` 这一个注解背后其实包含了三件事；理解 Spring Boot 项目为什么能"一键启动"、为什么自带 Tomcat、为什么不需要手动打 war 包部署；了解 Spring Boot 3.x 与 4.x 之间几个最基础的差异，避免以后在公司看到 Boot 3 项目产生"是不是自己学错了"的困惑。

## 一句话理解
`@SpringBootApplication` 是一个"打包注解"，一个注解顶三个注解用，背后真正干活的是它组合起来的三件事：找配置、自动配置、扫描组件。

## 为什么需要它

打开上一章生成的 `hello-spring-boot` 项目，你会看到入口类长这样：

```java
package com.example.hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HelloSpringBootApplication {
    public static void main(String[] args) {
        SpringApplication.run(HelloSpringBootApplication.class, args);
    }
}
```

代码短得不可思议——没有配置任何 Servlet、没有配置任何 Tomcat，甚至看不到我们在第 15、16 章讲的"扫描组件"具体在哪里发生。但只要执行这个 `main` 方法，一个能处理 HTTP 请求的完整 Web 服务器就跑起来了。这一切的"魔法"，绝大部分都来自类上面那一个注解：`@SpringBootApplication`。搞懂它，你才能真正明白 Spring Boot 项目"能跑起来"背后发生了什么。

## 核心概念

### 19.1 @SpringBootApplication 到底是什么

很多入门资料会简单地说"`@SpringBootApplication` 就是 `@Configuration`"，这种说法方便记忆，但不够准确。本教程给你讲准确一点：

```
@SpringBootApplication
    ≈ @SpringBootConfiguration
    + @EnableAutoConfiguration
    + @ComponentScan
```

也就是说，`@SpringBootApplication` 其实是把下面三个注解的功能，打包成了一个注解：

| 组成部分 | 作用 |
|---|---|
| `@SpringBootConfiguration` | 表示这个类是一个配置类。**补充说明**：`@SpringBootConfiguration` 本身又是基于 `@Configuration` 的（也就是说它内部包含了 `@Configuration` 的效果），所以很多入门资料会简化理解成"`@SpringBootApplication` 就是 `@Configuration`"——这个说法不算错，但不够精确，本教程希望你了解真正的三段组合 |
| `@EnableAutoConfiguration` | 开启 Spring Boot 的**自动配置**机制：根据你项目里引入了哪些依赖（比如引入了 `spring-boot-starter-webmvc`），自动帮你配置好相应的功能（比如自动配置内嵌 Tomcat、自动配置处理 HTTP 请求所需的一整套组件），不需要你手写这些配置 |
| `@ComponentScan` | 开启**组件扫描**：这就是第 16 章讲的"Spring 扫描组件"这一步在代码层面的来源——它会扫描当前类所在包（以及所有子包）下贴了 `@Service`、`@RestController`、`@Component` 等注解的类，把它们创建成 Bean |

回到第 18 章：`hello-spring-boot` 项目的入口类是 `com.example.hello.HelloSpringBootApplication`，贴着 `@SpringBootApplication`。这意味着 `@ComponentScan` 会默认扫描 `com.example.hello` 包及其所有子包——这也是为什么本教程要求 Controller、Service 等类**必须**放在这个包（或它的子包）下面，放到包外面 Spring 是扫描不到的。

### 19.2 为什么 Spring Boot 项目能"一键启动"

`main` 方法里唯一的一行核心代码是：

```java
SpringApplication.run(HelloSpringBootApplication.class, args);
```

`SpringApplication.run(...)` 做的事情，正是第 16 章讲过的那条流程的起点：它会启动 Spring 容器（创建 `ApplicationContext`），触发组件扫描、创建 Bean、解决依赖……一直到整个应用准备就绪、可以对外提供服务。

### 19.3 为什么自带 Tomcat，不需要手动打 war 包部署

在没有 Spring Boot 的年代，一个 Java Web 项目通常要打包成一个 `.war` 文件，再手动部署到一个独立安装、独立启动的 Tomcat 服务器里，才能对外提供服务——这是阶段 1 你在学 Servlet 时接触到的模式。

Spring Boot 采用了不同的思路：它把 Tomcat 本身作为一个"内嵌"的依赖，直接打包进你的项目里。因为第 18 章创建项目时勾选了 "Spring Web"（对应依赖 `spring-boot-starter-webmvc`），这个 Starter 内部已经自动带上了内嵌 Tomcat 相关的依赖。这样一来：

- 你的项目本身就是一个"自带服务器"的独立程序。
- 打包时（第 17 章讲的 `mvn package`）生成的是一个可以直接用 `java -jar` 运行的胖 jar 包，运行它就相当于同时启动了你的业务代码和一个内嵌的 Tomcat 服务器。
- 不再需要额外安装一个独立的 Tomcat、也不需要打 war 包、手动部署——这大大简化了"从写完代码到能被访问"这中间的步骤。

## 图解

```
@SpringBootApplication
   ├── @SpringBootConfiguration   （本身基于 @Configuration，表示这是一个配置类）
   ├── @EnableAutoConfiguration   （根据项目引入的依赖，自动配置好相应功能，比如内嵌 Tomcat）
   └── @ComponentScan             （扫描当前包及子包，把 @Service/@RestController 等类创建成 Bean）

SpringApplication.run(...) 执行
   ↓
启动 ApplicationContext（第 15、16 章讲过的那个容器）
   ↓
执行组件扫描、创建 Bean、解决依赖
   ↓
自动配置生效，内嵌 Tomcat 被启动
   ↓
应用进入"运行中"状态，开始监听端口，等待 HTTP 请求
```

## 最小示例

本章不新增业务代码，仍以第 18 章生成的入口类为例：

```java
package com.example.hello;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HelloSpringBootApplication {

    public static void main(String[] args) {
        SpringApplication.run(HelloSpringBootApplication.class, args);
    }
}
```

## 代码逐行解释

- `package com.example.hello;`：这个类所在的包，同时也是 `@ComponentScan` 默认扫描的起点——扫描范围是这个包本身和它的所有子包。
- `import org.springframework.boot.autoconfigure.SpringBootApplication;`：`@SpringBootApplication` 注解所在的包路径，注意它属于 `org.springframework.boot.autoconfigure` 这个模块，这从命名上也能看出它和"自动配置"（autoconfigure）密切相关。
- `@SpringBootApplication`：如前所述，等价于同时贴上了 `@SpringBootConfiguration`、`@EnableAutoConfiguration`、`@ComponentScan` 三个注解的效果。
- `public static void main(String[] args)`：Java 程序固定的入口方法（第 1 章讲过，`static` 是因为程序启动时还没有任何对象）。
- `SpringApplication.run(HelloSpringBootApplication.class, args);`：启动 Spring Boot 应用的核心语句。第一个参数告诉 Spring"以这个类作为配置的起点"（决定了组件扫描从哪个包开始），第二个参数把命令行参数原样传下去。这一行执行完，Spring 容器、自动配置、内嵌 Tomcat 全部准备就绪，应用进入运行状态。

## 程序运行过程

1. 执行 `main` 方法，调用 `SpringApplication.run(...)`。
2. Spring Boot 读取 `HelloSpringBootApplication` 类上的 `@SpringBootApplication` 注解，识别出它包含的三部分功能。
3. `@ComponentScan` 生效：扫描 `com.example.hello` 包及子包，找到所有贴了 `@Service`、`@RestController` 等注解的类，准备把它们创建为 Bean（第 16 章讲过的流程）。
4. `@EnableAutoConfiguration` 生效：Spring Boot 检查项目引入的依赖（发现有 `spring-boot-starter-webmvc`），据此自动配置好处理 HTTP 请求所需的一整套组件，包括启动一个内嵌的 Tomcat。
5. 所有 Bean 创建完成，放入 `ApplicationContext`。
6. 内嵌 Tomcat 启动完毕，开始监听指定端口（默认 `8080`）。
7. 控制台打印出类似 "Started HelloSpringBootApplication in x.xxx seconds" 的日志，表示应用已经准备就绪，可以接收 HTTP 请求了（具体请求怎么被处理，第 20 章详细讲）。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| Controller 类明明贴了 `@RestController`，却完全不生效，访问接口 404 | Controller 所在的包，不在入口类所在包（或其子包）范围内，`@ComponentScan` 扫描不到它 | 检查包路径，确保所有需要被扫描的类都放在入口类所在包（本例是 `com.example.hello`）或它的子包下 |
| 误以为 `@SpringBootApplication` 就是 `@Configuration`，和别人讨论时说不清楚自动配置从哪来 | 记忆的是简化说法，没记住准确的三段组合 | 记住准确表述：`@SpringBootApplication ≈ @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan`，其中 `@SpringBootConfiguration` 又基于 `@Configuration` |
| 启动时提示端口 8080 已被占用 | 本机其他程序已经占用了 8080 端口，和自动配置本身无关 | 关闭占用端口的程序，或者在 `application.yml` 里配置 `server.port` 改用别的端口（配置文件用法第 23 章详细讲） |

## 动手练习

1. 打开你在第 18 章创建的 `hello-spring-boot` 项目，找到入口类，确认它确实贴着 `@SpringBootApplication`，并且和你在 Initializr 里填写的 Package name 一致。
2. 尝试把一个测试用的 `@RestController` 类放到入口类所在包**之外**的一个包里（比如包名少了 `hello.` 这一级），重新启动项目，观察这个 Controller 是否还能正常被访问，体会 `@ComponentScan` 扫描范围的重要性。
3. 用自己的话，向别人解释一遍"为什么 Spring Boot 项目不需要单独安装 Tomcat"。

### Spring Boot 3.x 与 4.x 的主要区别

工作后你大概率会同时见到用 Spring Boot 3.x 和 4.x 写的项目，本教程统一锁定 4.1.1，但这里补充 5 个最基础的差异，目标只是让你**以后在公司看到 Boot 3 项目不会以为自己学错了**，不展开成完整的迁移指南：

1. **Java 最低版本要求变化**：Spring Boot 4 要求更高的 Java 最低版本（本教程使用的 Java 21 完全满足要求），Boot 3 时代的项目可能还在用较早的 Java 版本。
2. **Spring Framework 主版本变化**：Spring Boot 4 底层依赖的 Spring Framework 主版本也随之升级。
3. **继续使用 Jakarta 命名空间**：无论 Boot 3 还是 Boot 4，Servlet 相关的包名都是 `jakarta.servlet.*`，而不是更早期 Java EE 时代的 `javax.servlet.*`——这一点 Boot 3 到 Boot 4 是延续的，不是新变化，但很多"老"教程（Spring Boot 2 时代）里还在用 `javax.*`，看到时要留意版本背景。
4. **部分 Starter 坐标发生变化**：个别第三方库的 Starter 依赖坐标（`groupId`/`artifactId`）在适配 Boot 4 时发生了变化，不能直接照抄 Boot 3 教程里的坐标。最典型的例子就是 Web 开发最基础的 Starter：Spring Boot 3 及更早版本用的是 `spring-boot-starter-web`，这个坐标在 Boot 4 里仍然保留、可以正常运行，但官方已标记为 deprecated；Boot 4 新项目推荐使用 `spring-boot-starter-webmvc`（本教程第 17 章开始就统一用的是这一个）。
5. **MyBatis / MyBatis-Plus 需要选择 Boot 4 兼容的 Starter**：本教程后面会用到的 `mybatis-spring-boot-starter` 和 `mybatis-plus-spring-boot4-starter`，坐标和版本都专门对应 Boot 4；如果照抄网上针对 Boot 3 写的教程（比如用了 `mybatis-plus-boot-starter` 这种旧坐标），会导致依赖冲突或无法正常工作，第 27～28 章会再次提醒这一点。

## 小测验

1. `@SpringBootApplication` 准确来说等价于哪三个注解的组合？
2. `@ComponentScan` 的扫描范围是怎么确定的？
3. Spring Boot 项目为什么不需要单独安装 Tomcat、也不需要打 war 包部署？

<details>
<summary>参考答案</summary>

1. `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`（其中 `@SpringBootConfiguration` 本身又基于 `@Configuration`）。
2. 以贴着 `@SpringBootApplication`（或者说贴着 `@ComponentScan`）的入口类所在的包为起点，扫描这个包本身及其所有子包。
3. 因为项目引入了 `spring-boot-starter-webmvc` 之后，`@EnableAutoConfiguration` 会根据这个依赖自动配置好内嵌 Tomcat，Tomcat 本身作为依赖被打包进最终生成的 jar 包里，运行这个 jar 包就相当于同时启动了业务代码和内嵌的 Web 服务器，不再需要额外部署到独立的 Tomcat 服务器。
</details>

## 本章总结
你已经准确理解了 `@SpringBootApplication` 是三个注解组合的产物，也搞清楚了 Spring Boot 项目"一键启动、自带 Tomcat"的原因，并且了解了 Boot 3 与 Boot 4 之间几个最基础的差异，以后看到公司里的 Boot 3 项目不会感到陌生。下一章，我们正式进入全教程的重点章节之一：Spring MVC 全链路——搞清楚一个 HTTP 请求是怎么一步步找到你写的 Controller 方法的。
