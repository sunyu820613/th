# Project 1　Hello Spring Boot

## 项目目标
把第 15～20 章学到的东西串成一个真正能跑起来的项目：搭建一个最小的 Spring Boot 应用，写一个 `GET /hello` 接口，用浏览器访问它，完整体验一次"Browser → Tomcat → DispatcherServlet → Controller → Response"的调用链，把之前只在图上看到的流程亲手跑通一遍。

本项目**不使用**数据库、不使用 Service 层（这些留给 Project 2、Project 3），只专注于最基础的一环：请求怎么进入 Controller 方法、又怎么变成响应返回。

- 项目名：`hello-spring-boot`
- 包名：`com.example.hello`
- 技术栈：Java 21、Spring Boot 4.1.1、Maven、`spring-boot-starter-webmvc`

## 目录结构

```
hello-spring-boot/
├── pom.xml
└── src/
    └── main/
        ├── java/
        │   └── com/example/hello/
        │       ├── HelloSpringBootApplication.java
        │       └── controller/
        │           └── HelloController.java
        └── resources/
            └── application.yml
```

## 完整代码

### pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                              https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.example</groupId>
    <artifactId>hello-spring-boot</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
    </parent>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### src/main/resources/application.yml

本项目暂时不需要任何自定义配置，保留一个空文件（或者留空）即可，Spring Boot 默认会用 `8080` 端口启动：

```yaml
# 本项目暂无需要自定义的配置项，Spring Boot 使用默认值即可
```

### src/main/java/com/example/hello/HelloSpringBootApplication.java

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

### src/main/java/com/example/hello/controller/HelloController.java

```java
package com.example.hello.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring Boot!";
    }
}
```

## 运行步骤

1. 用 IDEA 打开 `hello-spring-boot` 项目根目录（包含 `pom.xml` 的那一层），等待 IDEA 完成 Maven 依赖下载（第 17、18 章讲过的过程）。
2. 找到 `HelloSpringBootApplication.java`，点击 `main` 方法左侧的运行按钮（或者在命令行执行 `mvn spring-boot:run`）。
3. 观察控制台输出，看到类似 `Tomcat started on port 8080` 和 `Started HelloSpringBootApplication` 的日志，说明应用已经启动成功。
4. 打开浏览器，访问 `http://localhost:8080/hello`。
5. 页面上应该显示：

```
Hello, Spring Boot!
```

## 对照调用链回顾

浏览器显示出这行文字的背后，完整走了一遍第 20 章讲过的调用链。逐段回顾一遍，加深理解：

1. **浏览器发起请求**：你在地址栏输入 `http://localhost:8080/hello` 并回车，浏览器发出一个 `GET /hello` 的 HTTP 请求。
2. **Tomcat 接收请求**：因为项目引入了 `spring-boot-starter-webmvc`（第 17、19 章讲过），Spring Boot 在启动时自动配置好了一个内嵌 Tomcat，正在监听 `8080` 端口，请求被它接收到。
3. **交给 DispatcherServlet**：Tomcat 把这个请求转交给 Spring MVC 统一的入口——`DispatcherServlet`，这是所有请求的必经之路（第 20 章的核心内容）。
4. **HandlerMapping 找谁处理**：`DispatcherServlet` 询问 `HandlerMapping`，"`GET /hello` 该由谁处理？" `HandlerMapping` 根据 `HelloController` 上贴的 `@GetMapping("/hello")`，匹配出应该由 `hello()` 这个方法处理。而 `HelloController` 之所以能被找到、能作为 Bean 存在，靠的是 `@RestController` 注解和第 19 章讲过的 `@ComponentScan`——它属于 `com.example.hello.controller` 包，在入口类 `com.example.hello.HelloSpringBootApplication` 的扫描范围之内。
5. **HandlerAdapter 负责调用**：`DispatcherServlet` 把"该由谁处理"的结果交给 `HandlerAdapter`，由它实际发起对 `hello()` 方法的调用。因为这个方法没有任何参数，不需要做参数绑定，是本章遇到的最简单情况。
6. **Controller 方法执行**：`hello()` 方法被调用，执行方法体，返回字符串 `"Hello, Spring Boot!"`。
7. **返回响应**：因为返回值是 `String` 类型，`DispatcherServlet` 直接把这个字符串作为响应体内容（不需要经过 Jackson 转 JSON，这一步在返回 Java 对象、而不是简单字符串时才会发生，第 21 章会详细讲）。
8. **浏览器显示结果**：响应通过 Tomcat 原路返回给浏览器，浏览器把收到的文本内容渲染显示出来，也就是你看到的 `Hello, Spring Boot!`。

至此，你已经亲手完整体验了一次"Browser → Controller"的最小闭环，也验证了第 15、16、19、20 章讲过的所有概念（IoC/DI、Bean 创建、`@SpringBootApplication`、Spring MVC 全链路）确实是能落地运行的，而不只是纸面上的图。下一章开始，我们学习 JSON 与 Jackson，为 Project 2（内存版 User API）返回真正的对象数据做准备。
