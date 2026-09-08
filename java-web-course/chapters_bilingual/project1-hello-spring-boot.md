# Project 1　Hello Spring Boot ／ プロジェクト1　Hello Spring Boot

## 项目目标 ／ プロジェクトの目標
把第 15～20 章学到的东西串成一个真正能跑起来的项目：搭建一个最小的 Spring Boot 应用，写一个 `GET /hello` 接口，用浏览器访问它，完整体验一次"Browser → Tomcat → DispatcherServlet → Controller → Response"的调用链，把之前只在图上看到的流程亲手跑通一遍。

> 🇯🇵 第15〜20章で学んだ内容を、実際に動く1つのプロジェクトとしてつなぎ合わせます。最小構成のSpring Bootアプリケーションを構築し、`GET /hello` エンドポイントを1つ書き、ブラウザでアクセスして、「Browser → Tomcat → DispatcherServlet → Controller → Response」という呼び出しの連鎖を一通り体験します。これまで図の上でしか見ていなかった流れを、自分の手で実際に動かしてみましょう。

本项目**不使用**数据库、不使用 Service 层（这些留给 Project 2、Project 3），只专注于最基础的一环：请求怎么进入 Controller 方法、又怎么变成响应返回。

> 🇯🇵 本プロジェクトでは、データベースは**使用せず**、Service層も使用しません（これらはProject 2、Project 3に譲ります）。最も基本的な一環——リクエストがどのようにControllerメソッドに入り、どのようにレスポンスとして返されるのか——だけに集中します。

- 项目名：`hello-spring-boot`<br><span class="ja-inline">🇯🇵 プロジェクト名：`hello-spring-boot`</span>
- 包名：`com.example.hello`<br><span class="ja-inline">🇯🇵 パッケージ名：`com.example.hello`</span>
- 技术栈：Java 21、Spring Boot 4.1.1、Maven、`spring-boot-starter-webmvc`<br><span class="ja-inline">🇯🇵 技術スタック：Java 21、Spring Boot 4.1.1、Maven（ビルドツール）、`spring-boot-starter-webmvc`</span>

## 目录结构 ／ ディレクトリ構造

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

## 完整代码 ／ 完全なコード

### pom.xml ／ pom.xml

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

### src/main/resources/application.yml ／ src/main/resources/application.yml

本项目暂时不需要任何自定义配置，保留一个空文件（或者留空）即可，Spring Boot 默认会用 `8080` 端口启动：

> 🇯🇵 本プロジェクトでは今のところカスタム設定は不要で、空のファイル（または内容を空のまま）にしておけばよいです。Spring Bootはデフォルトで `8080` ポートで起動します。

```yaml
# 本项目暂无需要自定义的配置项，Spring Boot 使用默认值即可
```

### src/main/java/com/example/hello/HelloSpringBootApplication.java ／ src/main/java/com/example/hello/HelloSpringBootApplication.java

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

### src/main/java/com/example/hello/controller/HelloController.java ／ src/main/java/com/example/hello/controller/HelloController.java

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

## 运行步骤 ／ 実行手順

1. 用 IDEA 打开 `hello-spring-boot` 项目根目录（包含 `pom.xml` 的那一层），等待 IDEA 完成 Maven 依赖下载（第 17、18 章讲过的过程）。<br><span class="ja-inline">🇯🇵 IDEAで `hello-spring-boot` プロジェクトのルートディレクトリ（`pom.xml` があるあの階層）を開き、IDEAがMavenの依存関係のダウンロードを完了するのを待ちます（第17、18章で説明した過程です）。</span>
2. 找到 `HelloSpringBootApplication.java`，点击 `main` 方法左侧的运行按钮（或者在命令行执行 `mvn spring-boot:run`）。<br><span class="ja-inline">🇯🇵 `HelloSpringBootApplication.java` を見つけ、`main` メソッドの左側にある実行ボタンをクリックします（またはコマンドラインで `mvn spring-boot:run` を実行します）。</span>
3. 观察控制台输出，看到类似 `Tomcat started on port 8080` 和 `Started HelloSpringBootApplication` 的日志，说明应用已经启动成功。<br><span class="ja-inline">🇯🇵 コンソール出力を観察し、`Tomcat started on port 8080` や `Started HelloSpringBootApplication` のようなログが表示されれば、アプリケーションが正常に起動したことを示します。</span>
4. 打开浏览器，访问 `http://localhost:8080/hello`。<br><span class="ja-inline">🇯🇵 ブラウザを開き、`http://localhost:8080/hello` にアクセスします。</span>
5. 页面上应该显示：<br><span class="ja-inline">🇯🇵 ページには次のように表示されるはずです。</span>

```
Hello, Spring Boot!
```

## 对照调用链回顾 ／ 呼び出しの連鎖と照らし合わせて振り返る

浏览器显示出这行文字的背后，完整走了一遍第 20 章讲过的调用链。逐段回顾一遍，加深理解：

> 🇯🇵 ブラウザにこの一行のテキストが表示される背後では、第20章で説明した呼び出しの連鎖が一通り実行されています。段階を追って振り返り、理解を深めましょう。

1. **浏览器发起请求**：你在地址栏输入 `http://localhost:8080/hello` 并回车，浏览器发出一个 `GET /hello` 的 HTTP 请求。<br><span class="ja-inline">🇯🇵 **ブラウザがリクエストを発行**：アドレスバーに `http://localhost:8080/hello` を入力してEnterを押すと、ブラウザが `GET /hello` というHTTPリクエストを発行します。</span>
2. **Tomcat 接收请求**：因为项目引入了 `spring-boot-starter-webmvc`（第 17、19 章讲过），Spring Boot 在启动时自动配置好了一个内嵌 Tomcat，正在监听 `8080` 端口，请求被它接收到。<br><span class="ja-inline">🇯🇵 **Tomcatがリクエストを受信**：プロジェクトが `spring-boot-starter-webmvc`（第17、19章で説明）を導入しているため、Spring Bootは起動時に内蔵Tomcatを自動的に設定しており、`8080` ポートをリッスンしています。リクエストはそこで受信されます。</span>
3. **交给 DispatcherServlet**：Tomcat 把这个请求转交给 Spring MVC 统一的入口——`DispatcherServlet`，这是所有请求的必经之路（第 20 章的核心内容）。<br><span class="ja-inline">🇯🇵 **DispatcherServletに渡す**：Tomcatはこのリクエストを Spring MVC の統一入口である `DispatcherServlet` に転送します。これはすべてのリクエストが必ず通る道です（第20章の中核内容）。</span>
4. **HandlerMapping 找谁处理**：`DispatcherServlet` 询问 `HandlerMapping`，"`GET /hello` 该由谁处理？" `HandlerMapping` 根据 `HelloController` 上贴的 `@GetMapping("/hello")`，匹配出应该由 `hello()` 这个方法处理。而 `HelloController` 之所以能被找到、能作为 Bean 存在，靠的是 `@RestController` 注解和第 19 章讲过的 `@ComponentScan`——它属于 `com.example.hello.controller` 包，在入口类 `com.example.hello.HelloSpringBootApplication` 的扫描范围之内。<br><span class="ja-inline">🇯🇵 **HandlerMappingが誰が処理するか探す**：`DispatcherServlet` は `HandlerMapping` に「`GET /hello` は誰が処理すべきか？」と尋ねます。`HandlerMapping` は `HelloController` に付いている `@GetMapping("/hello")` に基づいて、`hello()` メソッドが処理すべきだとマッチングします。`HelloController` が見つけられ、Beanとして存在できるのは、`@RestController` アノテーションと第19章で説明した `@ComponentScan` のおかげです——それは `com.example.hello.controller` パッケージに属しており、エントリークラス `com.example.hello.HelloSpringBootApplication` のスキャン範囲内にあります。</span>
5. **HandlerAdapter 负责调用**：`DispatcherServlet` 把"该由谁处理"的结果交给 `HandlerAdapter`，由它实际发起对 `hello()` 方法的调用。因为这个方法没有任何参数，不需要做参数绑定，是本章遇到的最简单情况。<br><span class="ja-inline">🇯🇵 **HandlerAdapterが呼び出しを担当**：`DispatcherServlet` は「誰が処理すべきか」という結果を `HandlerAdapter` に渡し、それが実際に `hello()` メソッドへの呼び出しを行います。このメソッドには引数が一切ないためパラメータバインディングは不要で、本章で扱う最もシンプルなケースです。</span>
6. **Controller 方法执行**：`hello()` 方法被调用，执行方法体，返回字符串 `"Hello, Spring Boot!"`。<br><span class="ja-inline">🇯🇵 **Controllerメソッドの実行**：`hello()` メソッドが呼び出され、メソッド本体が実行され、文字列 `"Hello, Spring Boot!"` を返します。</span>
7. **返回响应**：因为返回值是 `String` 类型，`DispatcherServlet` 直接把这个字符串作为响应体内容（不需要经过 Jackson 转 JSON，这一步在返回 Java 对象、而不是简单字符串时才会发生，第 21 章会详细讲）。<br><span class="ja-inline">🇯🇵 **レスポンスを返す**：戻り値が `String` 型なので、`DispatcherServlet` はこの文字列をそのままレスポンスボディの内容とします（JacksonによるJSON変換を経る必要はありません。この処理は単純な文字列ではなくJavaオブジェクトを返す場合に発生します。第21章で詳しく説明します）。</span>
8. **浏览器显示结果**：响应通过 Tomcat 原路返回给浏览器，浏览器把收到的文本内容渲染显示出来，也就是你看到的 `Hello, Spring Boot!`。<br><span class="ja-inline">🇯🇵 **ブラウザが結果を表示**：レスポンスはTomcatを経て元の経路でブラウザに返され、ブラウザは受け取ったテキスト内容をレンダリングして表示します。それがあなたが目にする `Hello, Spring Boot!` です。</span>

至此，你已经亲手完整体验了一次"Browser → Controller"的最小闭环，也验证了第 15、16、19、20 章讲过的所有概念（IoC/DI、Bean 创建、`@SpringBootApplication`、Spring MVC 全链路）确实是能落地运行的，而不只是纸面上的图。下一章开始，我们学习 JSON 与 Jackson，为 Project 2（内存版 User API）返回真正的对象数据做准备。

> 🇯🇵 ここまでで、あなたは自分の手で「Browser → Controller」という最小の閉じたループを一通り体験し、第15、16、19、20章で説明したすべての概念（IoC/DI、Beanの生成、`@SpringBootApplication`、Spring MVCの全体の流れ）が確かに実際に動くものであり、紙の上の図だけではないことを確認しました。次章からはJSONとJacksonを学び、Project 2（メモリ版User API）で本物のオブジェクトデータを返す準備をします。
