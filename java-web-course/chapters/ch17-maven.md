# 第 17 章　Maven 基础

## 本章目标
理解 Maven 是做什么用的；读懂一个最小 `pom.xml` 里 dependency、plugin、repository 各自的作用；掌握 `mvn clean`、`mvn test`、`mvn package` 三个常用命令分别做了什么；理解 `target` 目录和最终 jar 包是怎么来的。

## 一句话理解
Maven 是 Java 项目的"项目管理 + 自动装依赖"工具：你只需要在一个叫 `pom.xml` 的文件里写清楚"我要用哪些外部代码库"，Maven 就会自动帮你下载、管理版本，并且能一条命令帮你编译、测试、打包整个项目。

> 小提醒：如果你用 IntelliJ IDEA 创建 Spring Boot 项目（本教程第 18 章开始就是这样做的），IDEA 会自带一份 Maven，不需要你额外安装。如果你想在命令行独立使用 `mvn` 命令，官方下载地址是 https://maven.apache.org/download.cgi （下载 Binary zip/tar.gz，解压后把 `bin` 目录加进系统 `PATH` 环境变量即可）。

## 为什么需要它

回忆一下第 1 章：写一个 `Hello.java`，用 `javac` 编译、`java` 运行，两条命令就够了。但 Spring Boot 项目会用到大量别人写好的代码库（比如处理 Web 请求的库、操作数据库的库），这些库本身可能又依赖其他更底层的库。如果全靠你自己手动下载 `.jar` 文件、手动配置到项目里、还要留意版本会不会互相冲突，这件事很快就会变得不可维护。

Maven 解决的正是这个问题：

- 你只需要在 `pom.xml` 里声明"我要用 Spring Web，版本随 Spring Boot 走"，Maven 会自动去网上把它和它依赖的所有库都下载下来。
- 项目"怎么编译""怎么测试""怎么打包"这些流程，Maven 也提供了统一的命令，不需要你自己手写一长串编译命令。

## 核心概念

### 17.1 pom.xml 是什么

`pom.xml`（Project Object Model，项目对象模型）是 Maven 项目的核心配置文件，放在项目根目录下。它至少要说明这个项目自己是谁（坐标：groupId/artifactId/version）、依赖哪些外部库（dependency）、要用哪些构建工具（plugin），以及去哪里下载这些东西（repository）。

| 元素 | 作用 |
|---|---|
| `groupId` | 项目所属组织/公司的标识，类似 Java 的包名风格，比如 `com.example` |
| `artifactId` | 项目自己的名字，比如 `hello-spring-boot` |
| `version` | 项目自己的版本号 |
| `<dependency>` | 声明这个项目需要用到的**外部代码库**，Maven 会自动下载它和它依赖的其他库 |
| `<plugin>` | 声明构建过程中需要用到的**工具**，比如"怎么把 Spring Boot 项目打成一个可直接运行的 jar 包"就是靠一个插件完成的 |
| `<repository>` | 声明去**哪里**下载依赖，默认是 Maven 中央仓库（Maven Central），大多数项目不需要额外配置这一项 |

### 17.2 常用命令

| 命令 | 做什么 |
|---|---|
| `mvn clean` | 清空 `target` 目录，把上一次编译、打包留下的文件全部删除，保证这次是"干净"地重新构建 |
| `mvn test` | 编译源代码和测试代码，然后运行 `src/test/java` 下的所有测试（测试相关内容在第 36 章详细讲，这里先知道这条命令的作用） |
| `mvn package` | 编译、运行测试，然后把整个项目打包成一个 `.jar` 文件（放在 `target` 目录下），这个 jar 包就是可以交付、可以直接运行的成果物 |

实际开发中经常把它们连起来用，比如 `mvn clean package`，表示"先清空旧的构建结果，再重新完整构建一次"。

### 17.3 target 目录和 jar 包是怎么来的

Maven 项目有一套约定俗成的目录结构：源代码放在 `src/main/java`，配置文件放在 `src/main/resources`，测试代码放在 `src/test/java`。当你执行 `mvn package` 时：

1. Maven 先把 `src/main/java` 下的 `.java` 源文件编译成 `.class` 字节码文件。
2. 把编译结果和 `src/main/resources` 下的配置文件一起，按规则整理到项目根目录下自动生成的 `target` 目录里。
3. 借助 Spring Boot 提供的打包插件（`spring-boot-maven-plugin`），把这些内容连同项目依赖的所有第三方库，一起打包成一个"胖 jar"（Fat Jar）——之所以叫"胖"，是因为它不仅包含你自己写的代码，还把所有依赖的库也一起打包了进去，所以这一个 jar 包可以直接用 `java -jar` 运行，不需要额外配置任何依赖。

`target` 目录本身**不需要**手动创建，也不需要提交到 Git 仓库（它是构建过程中自动生成的产物，`mvn clean` 会把它清空）。

## 图解

```
pom.xml（声明依赖、插件）
   ↓ mvn clean
清空 target 目录
   ↓ mvn test（编译 + 跑测试）
target/classes（编译出的 .class 文件）
   ↓ mvn package（在 test 基础上继续打包）
target/hello-spring-boot-0.0.1-SNAPSHOT.jar
   ↓ java -jar
程序运行起来
```

## 最小示例

一个最小的 `pom.xml`（对应下一章将要创建的 `hello-spring-boot` 项目，Spring Boot 4.1.1，Java 21）：

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                              https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 项目自身的坐标 -->
    <groupId>com.example</groupId>
    <artifactId>hello-spring-boot</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <!-- 继承 Spring Boot 官方提供的父项目，统一管理各依赖的版本号，
         这样下面写依赖时大多不需要再手写版本号 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
    </parent>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Spring Web：让项目具备处理 HTTP 请求的能力，
             版本号由上面的 parent 统一管理，这里不需要手写 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- 这个插件负责把项目打包成可直接用 java -jar 运行的胖 jar -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## 代码逐行解释

- `<modelVersion>4.0.0</modelVersion>`：固定写法，表示使用哪个版本的 pom 格式规范，几乎所有 Maven 项目都写 `4.0.0`。
- `<groupId>`/`<artifactId>`/`<version>`：这个项目自己的坐标，唯一标识"这是谁的、哪个项目、哪个版本"。
- `<parent>` 里的 `spring-boot-starter-parent`：这是 Spring Boot 官方提供的一个"父项目"，作用是统一管理一大批常用依赖的版本号。有了它，下面写 `spring-boot-starter-webmvc` 时就不需要再纠结版本号写多少——它会自动和 Spring Boot 4.1.1 匹配一套经过官方验证、互相兼容的版本组合。
- `<properties><java.version>21</java.version></properties>`：告诉 Maven 用 Java 21 的语法标准来编译这个项目，对应本教程锁定的 JDK 21。
- `<dependency>` 块：声明了一个依赖——`spring-boot-starter-webmvc`，这是 Spring Boot 提供的"起步依赖"（Starter），引入它，项目就自动具备了处理 HTTP 请求、内嵌 Tomcat 等一整套 Web 开发相关的能力（这些能力具体怎么用，第 18～20 章会陆续讲到）。注意这里没有写 `<version>`，因为版本已经由上面的 `parent` 统一管理了。

  > 小提醒：如果你在 Spring Boot 3 或者更早的教程/资料里看到的是 `spring-boot-starter-web`（没有 `mvc` 三个字母），那不是打错字——`spring-boot-starter-web` 在 Spring Boot 4 里仍然保留、可以正常使用，但官方已经把它标记为 deprecated（不推荐继续使用），推荐新项目统一使用 `spring-boot-starter-webmvc`。本教程从这里开始统一用后者，你不需要自己去改老资料，只要知道"看到 `-web` 结尾的是旧写法，`-webmvc` 是 Boot 4 推荐写法"就行。

- `<build><plugins>` 里的 `spring-boot-maven-plugin`：一个构建插件，专门负责把项目和它的所有依赖一起打成一个可以直接运行的胖 jar 包，`mvn package` 时会用到它。

## 程序运行过程

以执行 `mvn clean package` 为例：

1. `clean` 阶段：Maven 删除项目根目录下的 `target` 目录（如果存在），保证接下来是一次干净的构建。
2. Maven 读取 `pom.xml`，根据 `<dependency>` 里声明的坐标，检查本地是否已经缓存了对应的库；没有的话，就联网去仓库（默认 Maven Central）下载，存放到本地的一个仓库缓存目录里。
3. 编译阶段：把 `src/main/java` 下的源代码编译成字节码，连同 `src/main/resources` 的配置文件，一起整理到 `target/classes` 目录。
4. 测试阶段（`mvn package` 内部会先执行测试）：编译并运行 `src/test/java` 下的测试代码，如果有测试失败，默认会中断构建（不会继续打包）。
5. 打包阶段：`spring-boot-maven-plugin` 把 `target/classes` 里的内容，连同所有依赖的第三方库，一起打进一个 jar 文件，生成在 `target/hello-spring-boot-0.0.1-SNAPSHOT.jar`。
6. 之后执行 `java -jar target/hello-spring-boot-0.0.1-SNAPSHOT.jar` 就能直接运行这个项目，不需要额外配置任何依赖——因为所有依赖都已经打进这一个文件里了。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 第一次执行 Maven 命令特别慢，卡在下载依赖上 | Maven 第一次运行需要联网下载 `pom.xml` 里声明的所有依赖到本地缓存 | 属于正常现象，保持网络畅通，等待下载完成即可；之后同样的依赖会直接用本地缓存，不会重复下载 |
| `mvn package` 报错提示测试失败，导致打包中断 | Spring Boot 默认在打包前会先跑一遍测试，测试没通过就不会继续生成 jar 包 | 修复测试失败的问题，或者临时用 `mvn package -DskipTests` 跳过测试（不建议长期这样做） |
| pom.xml 里依赖没写版本号，报错找不到版本 | 忘记引入 `spring-boot-starter-parent`，导致 Maven 不知道该用哪个版本 | 检查是否正确配置了 `<parent>`；如果确实不用 parent 管理版本，则必须自己在 `<dependency>` 里手写 `<version>` |
| `target` 目录被误提交到了 Git 仓库 | 没有配置忽略规则 | `target` 是自动生成的构建产物，应该加入 `.gitignore`，不需要提交到版本库 |

## 动手练习

1. 打开本章示例的 `pom.xml`，尝试指出里面哪些内容是"项目自己的坐标"，哪些是"外部依赖"，哪些是"构建插件"。
2. 思考一下：如果没有 `<parent>` 统一管理版本号，`spring-boot-starter-webmvc` 这个依赖需要自己写版本号，会带来什么麻烦？
3. 想一想 `mvn clean`、`mvn test`、`mvn package` 三个命令的关系——`mvn package` 是不是相当于把前两个命令的效果都包含了？

## 小测验

1. `pom.xml` 里的 `<dependency>` 和 `<plugin>` 分别负责什么？
2. `mvn clean` 具体做了什么事？
3. 最终生成的那个"胖 jar"为什么可以直接用 `java -jar` 运行，不需要额外配置依赖？

<details>
<summary>参考答案</summary>

1. `<dependency>` 声明项目需要用到的外部代码库，Maven 会自动下载并管理它们的版本；`<plugin>` 声明构建过程中要用到的工具，比如把项目打包成可运行 jar 包的插件。
2. 删除项目根目录下的 `target` 目录，清空上一次构建留下的所有产物，保证接下来重新构建时不会受到旧文件的干扰。
3. 因为打包时，`spring-boot-maven-plugin` 把项目自身的代码和它依赖的所有第三方库，全部打进了同一个 jar 文件里，运行时不需要再去别处查找任何依赖，所以是"自带全部家当"的一个完整包。
</details>

## 本章总结
你已经理解了 Maven 用 `pom.xml` 声明依赖、用统一命令完成编译测试打包的基本思路，也知道了 `target` 目录和最终 jar 包是怎么一步步生成的。下一章我们就正式用 Spring Initializr 创建属于你的第一个 Spring Boot 项目——`hello-spring-boot`。
