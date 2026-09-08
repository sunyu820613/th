# 第 23 章　配置、日志与打包运行

## 本章目标
理解 `application.yml` 的作用，以及为什么要区分开发环境和生产环境的配置（Spring Profile）；认识 SLF4J 和 Logback，学会用日志替代 `System.out.println()`；理解 `mvn package` 打包和 `java -jar` 运行的原理，知道为什么一个 jar 包就能跑起整个 Web 服务。

## 一句话理解
配置文件负责"把会变的东西挪到代码外面"，日志负责"给程序留一份可以分级查看的运行记录"，打包负责"把整个项目压缩成一个能独立运行的文件"。

## 为什么需要它
到目前为止，我们的项目里数据库密码（还没学到）、端口号这些信息，理论上都可以直接写死在 Java 代码里，程序照样能跑。但设想这样一个场景：你在自己电脑上开发时用的是本地环境，上线时要换成公司服务器的环境，两边的端口、以后要用到的数据库地址、密码完全不同。如果这些信息都写死在 `.java` 文件里，每次切换环境都要改代码、重新编译、重新打包——不仅麻烦，还容易改漏、改错，而且修改配置这种"运维层面的事情"要经过"改代码"这道门槛，对不熟悉这段代码的人来说很不友好。配置文件和 Profile 机制，就是用来解决这个问题的。

日志和打包也是同样的道理：`System.out.println()` 能凑合用来调试，但没法支撑一个真实运行的项目；写好的代码总要变成一个能在服务器上跑起来的东西，这就要靠打包。

## 核心概念

### 23.1 application.yml 是干什么的

从第 18 章开始，我们的 Spring Boot 项目里就有一个 `src/main/resources/application.yml` 文件，之前主要用来配置端口号之类的简单信息。它的本质作用是：**把项目运行时需要、但又容易变化的信息，从 Java 代码里搬出来，集中放在一个配置文件里**。

一个最基础的例子：

```yaml
server:
  port: 8080
```

这行配置告诉 Spring Boot"用 8080 端口启动内嵌的 Tomcat"。如果哪天要换成 9090 端口，只需要改这一行配置，完全不用碰任何 `.java` 文件，也不需要重新编译代码。

**反面例子**：假如你在代码里这样写：

```java
// 不推荐的写法：把配置写死在代码里
int port = 8080;
String dbPassword = "123456";
```

一旦要切换环境（比如上线到生产服务器，端口和密码都不一样），就得改这两行 Java 代码，重新 `javac` 编译、重新打包，才能生效。配置写死在代码里，"改配置"这件事就被绑架成了"改代码 + 重新编译"，这在真实项目里是不可接受的。

### 23.2 Spring Profile：区分开发环境和生产环境

真实项目至少要区分"开发环境（dev）"和"生产环境（prod）"——开发时连的是本地测试数据，上线后连的是真实数据库，两边配置必然不同。Spring Boot 提供了 **Profile（环境）** 机制来解决这个问题，做法是拆成多个配置文件：

```
application.yml         # 公共配置，所有环境都生效
application-dev.yml     # 开发环境专属配置
application-prod.yml    # 生产环境专属配置
```

在 `application.yml` 里指定当前激活哪个 Profile：

```yaml
spring:
  profiles:
    active: dev
```

比如：

`application-dev.yml`
```yaml
server:
  port: 8080
```

`application-prod.yml`
```yaml
server:
  port: 80
```

把 `active` 改成 `prod`（或者启动时用参数 `--spring.profiles.active=prod` 覆盖），Spring Boot 就会去读 `application-prod.yml` 里的配置，其余代码完全不用动。**这正好解决了上面那个反例的问题**：环境要切换，只改一行配置或者启动参数即可，不需要重新编译代码。

> 提前说一句：数据库密码、第三方服务的 API Key 这类真正敏感的信息，正式项目里通常还会用环境变量或者专门的配置中心来管理，不会直接明文写进 `application-prod.yml` 提交到代码仓库。这属于更进阶的实践，本教程后面涉及数据库配置时会再简单提一句，这里先理解"配置和代码分离""不同环境用不同配置文件"这两个核心思想即可。

### 23.3 日志：SLF4J 与 Logback

到目前为止，我们调试代码基本靠 `System.out.println()`。这在小实验里没问题，但正式项目不会这么干，原因有几个：

- **不能分级**：`println` 打印出来的所有内容长得都一样，分不清哪些是"仅供调试看看"的信息，哪些是"出大问题了"的报错。
- **不好定位输出位置**：一堆 `println` 混在控制台里，很难一眼看出这行输出是哪个类、哪一行代码打的。
- **无法灵活开关**：想在生产环境只看警告和错误、不看调试信息，`println` 做不到"按级别过滤"这件事，只能一个个删掉或者注释掉代码。
- **生产环境不便管理**：正式的日志框架能做到"自动按天分文件、自动删旧日志、同时输出到控制台和文件"这些能力，`println` 完全没有。

Spring Boot 里日志分成两部分：

- **SLF4J**：一套"接口规范"，定义了 `logger.debug(...)`、`logger.info(...)` 这些统一的写法，本身不负责真正把日志写出来。
- **Logback**：Spring Boot 默认使用的日志"实现"，真正负责把日志格式化并输出到控制台或文件。

你在代码里只需要面向 SLF4J 的接口写代码，Spring Boot 已经帮你把 Logback 配好了，开箱即用，不需要额外引入依赖。

日志分为四个常用级别，从"最不严重"到"最严重"：

| 级别 | 含义 | 典型用途 |
|---|---|---|
| `DEBUG` | 调试信息 | 开发阶段想看的细节，比如某个变量的具体值，生产环境通常关闭 |
| `INFO` | 正常的关键流程信息 | 比如"服务启动成功""用户下单成功"，记录系统正常运行的关键节点 |
| `WARN` | 警告，还没出错但值得注意 | 比如"这个接口用了过时的旧版本参数"，程序还能继续跑，但有隐患 |
| `ERROR` | 出错了 | 比如捕获到一个异常，需要人工关注和排查 |

最小示例：

```java
package com.example.userapi.service;

import com.example.userapi.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    // 面向 SLF4J 接口编程，Logback 是背后真正干活的实现
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public User create(User user) {
        logger.info("准备新增用户，姓名：{}", user.getName());
        // ... 实际创建逻辑
        logger.debug("用户详细数据：{}", user);
        return user;
    }
}
```

- `LoggerFactory.getLogger(UserService.class)`：创建一个和当前类绑定的 `Logger`，日志输出时会自动带上类名，这就解决了"不好定位输出位置"的问题——一看日志就知道是哪个类打的。
- `logger.info("...：{}", user.getName())`：`{}` 是占位符，会被后面的参数依次替换，效果类似字符串拼接，但性能更好、写法更清晰。
- 生产环境可以只开 `INFO` 及以上级别（`INFO`、`WARN`、`ERROR`），`DEBUG` 不会输出，不需要删代码，只改配置即可——这就是"能灵活开关"的体现。

### 23.4 打包与运行：mvn package 和 java -jar

写完代码只是第一步，最终要让程序在服务器上真正跑起来，这一步靠 Maven 打包完成。

**打包过程**：在项目根目录执行

```bash
mvn package
```

Maven 会依次做这些事：编译所有 `.java` 源文件成 `.class` 字节码、运行测试（如果有的话）、把编译好的字节码、`resources` 目录下的配置文件、以及项目依赖的所有第三方库，全部打进一个文件里，生成在 `target/` 目录下，比如 `user-api-memory-0.0.1-SNAPSHOT.jar`。

**运行方式**：

```bash
java -jar target/user-api-memory-0.0.1-SNAPSHOT.jar
```

这一条命令就能把整个 Web 服务跑起来，控制台会打印出 Spring Boot 的启动日志，最后看到类似"Started ... in ... seconds"就说明启动成功了，可以直接用浏览器或 Postman 访问。

**为什么一个 jar 包就能启动整个 Web 服务？** 关键在于"内嵌 Tomcat"这个设计。传统 Java Web 项目要先装一个独立的 Tomcat 服务器，再把项目打成 `.war` 包扔进 Tomcat 的目录里，由外部 Tomcat 来启动它——这意味着服务器上要单独安装、配置、维护一个 Tomcat。而 Spring Boot 项目里已经通过 `spring-boot-starter-webmvc` 依赖，把 Tomcat 作为一个普通的 Java 库打包进了同一个 jar 包里（这就是"内嵌 Tomcat"的含义）。`java -jar` 启动时，Spring Boot 会在程序内部用代码的方式创建并启动这个内嵌的 Tomcat，不需要你在服务器上单独部署一个外部 Tomcat——这也是"能不能把整个应用打成一个文件、丢到任何装了 Java 的机器上直接跑"这个能力的关键。

## 图解

```
源代码 + 配置文件 + 依赖库
        │  mvn package
        ▼
   xxx.jar（一个文件，包含代码 + 依赖 + 内嵌 Tomcat）
        │  java -jar xxx.jar
        ▼
JVM 启动
  → Spring Boot 启动流程开始
  → 内部代码创建并启动内嵌 Tomcat
  → Tomcat 监听配置文件里指定的端口（如 8080）
  → 控制台打印 "Started ... in ... seconds"
        ▼
   服务已就绪，可以接收浏览器 / Postman 的请求
```

## 最小示例

`application.yml`：
```yaml
server:
  port: 8080

spring:
  application:
    name: user-api-memory
  profiles:
    active: dev
```

`application-dev.yml`：
```yaml
server:
  port: 8080

logging:
  level:
    com.example.userapi: debug
```

`application-prod.yml`：
```yaml
server:
  port: 80

logging:
  level:
    com.example.userapi: info
```

## 代码逐行解释

- `spring.application.name`：给应用起个名字，会出现在启动日志里，方便区分多个服务。
- `spring.profiles.active: dev`：告诉 Spring Boot 当前激活 `dev` 这个 Profile，启动时会自动去读 `application-dev.yml`，和公共的 `application.yml` 合并生效。
- `logging.level.com.example.userapi: debug`：设置 `com.example.userapi` 这个包下所有类的日志级别为 `debug`，也就是 `DEBUG`/`INFO`/`WARN`/`ERROR` 都会输出——开发阶段想看细节，级别放宽一些。
- `application-prod.yml` 里把日志级别改成 `info`：生产环境只输出 `INFO` 及以上级别，`DEBUG` 信息不会打印，减少不必要的日志量。
- 两份环境配置的 `server.port` 不同：开发用 `8080`，生产假设用标准的 `80` 端口，切换只需要改 `active` 的值。

## 程序运行过程

以"打包并运行"为例，串一遍完整过程：

1. 开发者在项目根目录执行 `mvn package`。
2. Maven 依次编译 `src/main/java` 下所有 `.java` 文件成字节码，并把 `src/main/resources` 下的 `application.yml` 等配置文件一起收集起来。
3. Maven 把编译产物、配置文件，连同项目依赖的所有第三方库（包括内嵌 Tomcat 相关的库），一起打进 `target/xxx.jar`。
4. 运维或开发者在目标机器上执行 `java -jar target/xxx.jar`。
5. JVM 启动，加载这个 jar 包，找到 `main` 方法（也就是 `@SpringBootApplication` 标注的启动类里的 `main`）开始执行。
6. Spring Boot 启动流程开始：扫描组件、创建各个 Bean（Controller、Service 等）、读取 `application.yml` 及当前激活 Profile 对应的配置文件。
7. Spring Boot 用代码的方式创建并启动内嵌 Tomcat，绑定配置文件里指定的端口。
8. 控制台打印启动成功的日志，服务正式对外提供访问。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `java -jar xxx.jar` 提示找不到主清单属性（no main manifest attribute） | 打包时没有用 `spring-boot-maven-plugin`，生成的是普通 jar 而不是可执行 jar | 确认 `pom.xml` 里 `<build><plugins>` 有配置 `spring-boot-maven-plugin` |
| 改了 `application-prod.yml` 但不生效 | `spring.profiles.active` 没有切成 `prod`，还在用 `dev` | 检查启动时激活的 Profile 是不是对的 |
| 日志一行都没输出 | 级别设置得太高（比如设成了只有更严重的级别才输出），或者代码里根本没调用 logger | 检查 `logging.level` 配置，确认调用了对应的 `logger.xxx(...)` |
| 项目里到处都是 `System.out.println` | 早期为了图方便直接用，习惯没改过来 | 逐步替换成 SLF4J 的 `logger.info/debug/warn/error`，本章讲的正是原因 |
| 端口冲突，启动报 `Port 8080 already in use` | 本地已经有别的程序占用了这个端口（比如上一次启动的项目还没关掉） | 换一个端口，或者先关掉占用端口的进程 |

## 动手练习

1. 给 `user-api-memory` 项目补上 `application-dev.yml` 和 `application-prod.yml`，分别设置不同的端口，切换 `active` 的值，观察启动日志里实际使用的端口是否跟着变化。
2. 在 `UserService` 的每个方法里加上 `logger.info(...)`，把关键操作（新增、删除等）记录下来，重新调用几个接口，观察控制台输出。
3. 执行 `mvn package`，找到生成的 jar 包，用 `java -jar` 启动它，用 Postman 验证之前写的接口依然可以正常访问。

## 小测验

1. 如果把数据库密码直接写死在 Java 代码里，切换开发/生产环境会遇到什么麻烦？
2. `DEBUG`、`INFO`、`WARN`、`ERROR` 分别在什么场景下使用？
3. 为什么一个 Spring Boot 打出来的 jar 包，不需要额外部署到外部 Tomcat 就能提供 Web 服务？

<details>
<summary>参考答案</summary>

1. 每次切换环境都要修改这部分 Java 代码，然后重新编译、重新打包才能生效，操作繁琐且容易改错，配置这种"运维层面的信息"和代码耦合在了一起。
2. `DEBUG` 用于开发阶段查看细节，生产环境通常关闭；`INFO` 记录正常的关键运行节点；`WARN` 表示程序还能运行但有潜在问题，需要留意；`ERROR` 表示确实出错了，需要人工排查。
3. 因为 Spring Boot 项目通过 `spring-boot-starter-webmvc` 已经把 Tomcat 作为普通依赖库打包进了同一个 jar 包（内嵌 Tomcat），`java -jar` 启动时程序内部会用代码创建并启动这个 Tomcat，不需要单独安装、配置外部 Tomcat 服务器。
</details>

## 本章总结
你现在知道了怎么用 `application.yml` 和 Profile 机制把易变的配置从代码里分离出来、按环境切换；知道了为什么正式项目要用 SLF4J + Logback 而不是 `println`；也理解了 `mvn package` 打包和 `java -jar` 运行背后"内嵌 Tomcat"的原理。到这里，Spring 核心与 Spring Boot 这一阶段的内容就学完了，下一步进入阶段复习 3，然后正式开始数据库与持久层的学习。
