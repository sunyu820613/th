# 第 19 章　@SpringBootApplication 与自动配置 ／ 第19章　@SpringBootApplicationと自動設定

## 本章目标 ／ 本章の目標
准确理解 `@SpringBootApplication` 这一个注解背后其实包含了三件事；理解 Spring Boot 项目为什么能"一键启动"、为什么自带 Tomcat、为什么不需要手动打 war 包部署；了解 Spring Boot 3.x 与 4.x 之间几个最基础的差异，避免以后在公司看到 Boot 3 项目产生"是不是自己学错了"的困惑。

> 🇯🇵 `@SpringBootApplication` というアノテーションの背後に実は3つのことが含まれていることを正確に理解します。Spring Bootプロジェクトがなぜ「ワンクリックで起動」でき、なぜTomcatを内蔵しており、なぜwarファイルを手動でパッケージングしてデプロイする必要がないのかを理解します。Spring Boot 3.xと4.xの間にあるいくつかの最も基本的な違いを知り、将来会社でBoot 3のプロジェクトを見たときに「自分の学び方が間違っていたのでは」と戸惑わないようにします。

## 一句话理解 ／ 一言で理解する
`@SpringBootApplication` 是一个"打包注解"，一个注解顶三个注解用，背后真正干活的是它组合起来的三件事：找配置、自动配置、扫描组件。

> 🇯🇵 `@SpringBootApplication` は「まとめアノテーション」であり、1つのアノテーションが3つのアノテーションの働きを兼ねています。実際に働いているのは、それが組み合わせている3つのこと——設定を見つける、自動設定を行う、コンポーネントをスキャンする——です。

## 为什么需要它 ／ なぜ必要なのか

打开上一章生成的 `hello-spring-boot` 项目，你会看到入口类长这样：

> 🇯🇵 前章で生成した `hello-spring-boot` プロジェクトを開くと、エントリークラスは次のようになっています。

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

> 🇯🇵 コードは信じられないほど短いです——Servletの設定も、Tomcatの設定も一切なく、第15、16章で説明した「コンポーネントのスキャン」がどこで行われているのかさえ見当たりません。しかしこの `main` メソッドを実行するだけで、HTTPリクエストを処理できる完全なWebサーバーが動き出します。この「魔法」のほとんどは、クラスの上にあるあの1つのアノテーション——`@SpringBootApplication`——に由来しています。これを理解して初めて、Spring Bootプロジェクトが「動き出す」背後で何が起きているのか本当に分かるようになります。

## 核心概念 ／ コアコンセプト

### 19.1 @SpringBootApplication 到底是什么 ／ 19.1　@SpringBootApplicationとは一体何か

很多入门资料会简单地说"`@SpringBootApplication` 就是 `@Configuration`"，这种说法方便记忆，但不够准确。本教程给你讲准确一点：

> 🇯🇵 多くの入門資料は簡単に「`@SpringBootApplication` は `@Configuration` である」と説明しますが、これは覚えやすい一方で正確ではありません。本チュートリアルではもう少し正確に説明します。

```
@SpringBootApplication
    ≈ @SpringBootConfiguration
    + @EnableAutoConfiguration
    + @ComponentScan
```

也就是说，`@SpringBootApplication` 其实是把下面三个注解的功能，打包成了一个注解：

> 🇯🇵 つまり、`@SpringBootApplication` は実際には以下の3つのアノテーションの機能を1つのアノテーションにまとめたものです。

| 组成部分 ／ 構成要素 | 作用 ／ 役割 |
|---|---|
| `@SpringBootConfiguration` | 表示这个类是一个配置类。**补充说明**：`@SpringBootConfiguration` 本身又是基于 `@Configuration` 的（也就是说它内部包含了 `@Configuration` 的效果），所以很多入门资料会简化理解成"`@SpringBootApplication` 就是 `@Configuration`"——这个说法不算错，但不够精确，本教程希望你了解真正的三段组合<br><span class="ja-inline">🇯🇵 このクラスが設定クラス（Configuration）であることを示します。**補足**：`@SpringBootConfiguration` 自体が `@Configuration` をベースにしています（つまり内部に `@Configuration` の効果を含んでいます）。そのため多くの入門資料が簡略化して「`@SpringBootApplication` は `@Configuration` である」と理解していますが、これは間違いとは言えないものの正確ではありません。本チュートリアルでは本当の3つの組み合わせを理解してほしいと思います </span>|
| `@EnableAutoConfiguration` | 开启 Spring Boot 的**自动配置**机制：根据你项目里引入了哪些依赖（比如引入了 `spring-boot-starter-webmvc`），自动帮你配置好相应的功能（比如自动配置内嵌 Tomcat、自动配置处理 HTTP 请求所需的一整套组件），不需要你手写这些配置<br><span class="ja-inline">🇯🇵 Spring Bootの**自動設定（autoconfigure）**の仕組みを有効にします：プロジェクトにどの依存関係が導入されているか（例えば `spring-boot-starter-webmvc`）に応じて、対応する機能（例えば内蔵Tomcatの自動設定、HTTPリクエストを処理するために必要な一連のコンポーネントの自動設定）を自動的に設定してくれます。これらの設定を自分で手書きする必要はありません </span>|
| `@ComponentScan` | 开启**组件扫描**：这就是第 16 章讲的"Spring 扫描组件"这一步在代码层面的来源——它会扫描当前类所在包（以及所有子包）下贴了 `@Service`、`@RestController`、`@Component` 等注解的类，把它们创建成 Bean<br><span class="ja-inline">🇯🇵 **コンポーネントスキャン**を有効にします：これは第16章で説明した「Springがコンポーネントをスキャンする」というステップがコードレベルでどこから来ているかを示すものです——現在のクラスが属するパッケージ（およびすべてのサブパッケージ）内で `@Service`、`@RestController`、`@Component` などが付いたクラスをスキャンし、それらをBeanとして作成します </span>|

回到第 18 章：`hello-spring-boot` 项目的入口类是 `com.example.hello.HelloSpringBootApplication`，贴着 `@SpringBootApplication`。这意味着 `@ComponentScan` 会默认扫描 `com.example.hello` 包及其所有子包——这也是为什么本教程要求 Controller、Service 等类**必须**放在这个包（或它的子包）下面，放到包外面 Spring 是扫描不到的。

> 🇯🇵 第18章に戻りましょう：`hello-spring-boot` プロジェクトのエントリークラスは `com.example.hello.HelloSpringBootApplication` で、`@SpringBootApplication` が付いています。これは `@ComponentScan` がデフォルトで `com.example.hello` パッケージとそのすべてのサブパッケージをスキャンすることを意味します——これが本チュートリアルがController、Serviceなどのクラスを**必ず**このパッケージ（またはそのサブパッケージ）の下に置くよう求めている理由です。パッケージの外に置くと、Springはスキャンできません。

### 19.2 为什么 Spring Boot 项目能"一键启动" ／ 19.2　なぜSpring Bootプロジェクトは「ワンクリックで起動」できるのか

`main` 方法里唯一的一行核心代码是：

> 🇯🇵 `main` メソッドの中の唯一の中核となる行は次の通りです。

```java
SpringApplication.run(HelloSpringBootApplication.class, args);
```

`SpringApplication.run(...)` 做的事情，正是第 16 章讲过的那条流程的起点：它会启动 Spring 容器（创建 `ApplicationContext`），触发组件扫描、创建 Bean、解决依赖……一直到整个应用准备就绪、可以对外提供服务。

> 🇯🇵 `SpringApplication.run(...)` が行っていることは、まさに第16章で説明した流れの出発点です：Springコンテナ（`ApplicationContext`）を起動し、コンポーネントスキャン、Bean生成、依存関係の解決……をトリガーし、アプリケーション全体が準備完了して外部にサービスを提供できる状態になるまで続きます。

### 19.3 为什么自带 Tomcat，不需要手动打 war 包部署 ／ 19.3　なぜTomcatを内蔵し、warファイルを手動でパッケージング・デプロイする必要がないのか

在没有 Spring Boot 的年代，一个 Java Web 项目通常要打包成一个 `.war` 文件，再手动部署到一个独立安装、独立启动的 Tomcat 服务器里，才能对外提供服务——这是阶段 1 你在学 Servlet 时接触到的模式。

> 🇯🇵 Spring Bootが無かった時代、Java Webプロジェクトは通常 `.war` ファイルにパッケージングされ、それを別途インストール・起動されたTomcatサーバーに手動でデプロイして初めて外部にサービスを提供できました——これはステージ1でServletを学んだ際に触れたパターンです。

Spring Boot 采用了不同的思路：它把 Tomcat 本身作为一个"内嵌"的依赖，直接打包进你的项目里。因为第 18 章创建项目时勾选了 "Spring Web"（对应依赖 `spring-boot-starter-webmvc`），这个 Starter 内部已经自动带上了内嵌 Tomcat 相关的依赖。这样一来：

> 🇯🇵 Spring Bootは異なる考え方を採用しています：Tomcat自体を「内蔵」の依存関係として、直接プロジェクトにパッケージングします。第18章でプロジェクトを作成する際に "Spring Web"（対応する依存関係は `spring-boot-starter-webmvc`）にチェックを入れたため、このStarterの内部にはすでに内蔵Tomcat関連の依存関係が自動的に含まれています。こうすることで、

- 你的项目本身就是一个"自带服务器"的独立程序。<br><span class="ja-inline">🇯🇵 あなたのプロジェクト自体が「サーバーを内蔵した」独立したプログラムになります。</span>
- 打包时（第 17 章讲的 `mvn package`）生成的是一个可以直接用 `java -jar` 运行的胖 jar 包，运行它就相当于同时启动了你的业务代码和一个内嵌的 Tomcat 服务器。<br><span class="ja-inline">🇯🇵 パッケージング時（第17章で説明した `mvn package`）に生成されるのは `java -jar` で直接実行できる太ったjarファイルであり、それを実行することはあなたの業務コードと内蔵Tomcatサーバーを同時に起動することに相当します。</span>
- 不再需要额外安装一个独立的 Tomcat、也不需要打 war 包、手动部署——这大大简化了"从写完代码到能被访问"这中间的步骤。<br><span class="ja-inline">🇯🇵 別途独立したTomcatをインストールする必要も、warファイルにパッケージングして手動デプロイする必要もなくなります——これにより「コードを書き終えてからアクセスできるようになるまで」の間のステップが大幅に簡略化されます。</span>

## 图解 ／ 図解

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

## 最小示例 ／ 最小限のサンプル

本章不新增业务代码，仍以第 18 章生成的入口类为例：

> 🇯🇵 本章では新たに業務コードを追加せず、第18章で生成したエントリークラスを引き続き例にします。

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

## 代码逐行解释 ／ コードの行ごとの解説

- `package com.example.hello;`：这个类所在的包，同时也是 `@ComponentScan` 默认扫描的起点——扫描范围是这个包本身和它的所有子包。<br><span class="ja-inline">🇯🇵 `package com.example.hello;`：このクラスが属するパッケージであり、同時に `@ComponentScan` がデフォルトでスキャンする起点でもあります——スキャン範囲はこのパッケージ自体とそのすべてのサブパッケージです。</span>
- `import org.springframework.boot.autoconfigure.SpringBootApplication;`：`@SpringBootApplication` 注解所在的包路径，注意它属于 `org.springframework.boot.autoconfigure` 这个模块，这从命名上也能看出它和"自动配置"（autoconfigure）密切相关。<br><span class="ja-inline">🇯🇵 `import org.springframework.boot.autoconfigure.SpringBootApplication;`：`@SpringBootApplication` アノテーションが属するパッケージパスです。これが `org.springframework.boot.autoconfigure` というモジュールに属していることに注目してください。名前からも「自動設定」（autoconfigure）と密接に関係していることが分かります。</span>
- `@SpringBootApplication`：如前所述，等价于同时贴上了 `@SpringBootConfiguration`、`@EnableAutoConfiguration`、`@ComponentScan` 三个注解的效果。<br><span class="ja-inline">🇯🇵 `@SpringBootApplication`：前述の通り、`@SpringBootConfiguration`、`@EnableAutoConfiguration`、`@ComponentScan` の3つのアノテーションを同時に付けたのと同じ効果を持ちます。</span>
- `public static void main(String[] args)`：Java 程序固定的入口方法（第 1 章讲过，`static` 是因为程序启动时还没有任何对象）。<br><span class="ja-inline">🇯🇵 `public static void main(String[] args)`：Javaプログラムの固定のエントリーポイント（第1章で説明した通り、`static` なのはプログラム起動時にまだオブジェクトが一つも存在しないためです）。</span>
- `SpringApplication.run(HelloSpringBootApplication.class, args);`：启动 Spring Boot 应用的核心语句。第一个参数告诉 Spring"以这个类作为配置的起点"（决定了组件扫描从哪个包开始），第二个参数把命令行参数原样传下去。这一行执行完，Spring 容器、自动配置、内嵌 Tomcat 全部准备就绪，应用进入运行状态。<br><span class="ja-inline">🇯🇵 `SpringApplication.run(HelloSpringBootApplication.class, args);`：Spring Bootアプリケーションを起動する中核の文です。第一引数はSpringに「このクラスを設定の起点とする」ことを伝え（コンポーネントスキャンがどのパッケージから始まるかを決定します）、第二引数はコマンドライン引数をそのまま渡します。この行が実行されると、Springコンテナ、自動設定、内蔵Tomcatがすべて準備完了し、アプリケーションが実行状態に入ります。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. 执行 `main` 方法，调用 `SpringApplication.run(...)`。<br><span class="ja-inline">🇯🇵 `main` メソッドが実行され、`SpringApplication.run(...)` が呼び出されます。</span>
2. Spring Boot 读取 `HelloSpringBootApplication` 类上的 `@SpringBootApplication` 注解，识别出它包含的三部分功能。<br><span class="ja-inline">🇯🇵 Spring Bootが `HelloSpringBootApplication` クラスの `@SpringBootApplication` アノテーションを読み取り、それが含む3つの機能を識別します。</span>
3. `@ComponentScan` 生效：扫描 `com.example.hello` 包及子包，找到所有贴了 `@Service`、`@RestController` 等注解的类，准备把它们创建为 Bean（第 16 章讲过的流程）。<br><span class="ja-inline">🇯🇵 `@ComponentScan` が働きます：`com.example.hello` パッケージとそのサブパッケージをスキャンし、`@Service`、`@RestController` などが付いたすべてのクラスを見つけて、それらをBeanとして作成する準備をします（第16章で説明した流れ）。</span>
4. `@EnableAutoConfiguration` 生效：Spring Boot 检查项目引入的依赖（发现有 `spring-boot-starter-webmvc`），据此自动配置好处理 HTTP 请求所需的一整套组件，包括启动一个内嵌的 Tomcat。<br><span class="ja-inline">🇯🇵 `@EnableAutoConfiguration` が働きます：Spring Bootはプロジェクトに導入されている依存関係を確認し（`spring-boot-starter-webmvc` があることを発見し）、それに基づいてHTTPリクエストを処理するために必要な一連のコンポーネント（内蔵Tomcatの起動を含む）を自動的に設定します。</span>
5. 所有 Bean 创建完成，放入 `ApplicationContext`。<br><span class="ja-inline">🇯🇵 すべてのBeanの生成が完了し、`ApplicationContext` に格納されます。</span>
6. 内嵌 Tomcat 启动完毕，开始监听指定端口（默认 `8080`）。<br><span class="ja-inline">🇯🇵 内蔵Tomcatの起動が完了し、指定されたポート（デフォルトは `8080`）のリッスンを開始します。</span>
7. 控制台打印出类似 "Started HelloSpringBootApplication in x.xxx seconds" 的日志，表示应用已经准备就绪，可以接收 HTTP 请求了（具体请求怎么被处理，第 20 章详细讲）。<br><span class="ja-inline">🇯🇵 コンソールに "Started HelloSpringBootApplication in x.xxx seconds" のようなログが表示され、アプリケーションが準備完了し、HTTPリクエストを受け付けられるようになったことを示します（リクエストが具体的にどう処理されるかは第20章で詳しく説明します）。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| Controller 类明明贴了 `@RestController`，却完全不生效，访问接口 404 | Controller 所在的包，不在入口类所在包（或其子包）范围内，`@ComponentScan` 扫描不到它<br><span class="ja-inline">🇯🇵 Controllerが属するパッケージが、エントリークラスが属するパッケージ（またはそのサブパッケージ）の範囲外にあるため、`@ComponentScan` がそれをスキャンできない </span>| 检查包路径，确保所有需要被扫描的类都放在入口类所在包（本例是 `com.example.hello`）或它的子包下<br><span class="ja-inline">🇯🇵 パッケージパスを確認し、スキャンされる必要のあるすべてのクラスがエントリークラスの属するパッケージ（本例では `com.example.hello`）またはそのサブパッケージの下に置かれていることを確かめる </span>|
| 误以为 `@SpringBootApplication` 就是 `@Configuration`，和别人讨论时说不清楚自动配置从哪来 | 记忆的是简化说法，没记住准确的三段组合<br><span class="ja-inline">🇯🇵 簡略化した説明を覚えており、正確な3つの組み合わせを覚えていない </span>| 记住准确表述：`@SpringBootApplication ≈ @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan`，其中 `@SpringBootConfiguration` 又基于 `@Configuration`<br><span class="ja-inline">🇯🇵 正確な表現を覚えておく：`@SpringBootApplication ≈ @SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan`。うち `@SpringBootConfiguration` はさらに `@Configuration` をベースにしている </span>|
| 启动时提示端口 8080 已被占用 | 本机其他程序已经占用了 8080 端口，和自动配置本身无关<br><span class="ja-inline">🇯🇵 ローカルの他のプログラムがすでに8080ポートを占有しており、自動設定自体とは関係がない </span>| 关闭占用端口的程序，或者在 `application.yml` 里配置 `server.port` 改用别的端口（配置文件用法第 23 章详细讲）<br><span class="ja-inline">🇯🇵 ポートを占有しているプログラムを終了するか、`application.yml` で `server.port` を設定して別のポートに変更する（設定ファイルの使い方は第23章で詳しく説明します） </span>|

## 动手练习 ／ 演習

1. 打开你在第 18 章创建的 `hello-spring-boot` 项目，找到入口类，确认它确实贴着 `@SpringBootApplication`，并且和你在 Initializr 里填写的 Package name 一致。<br><span class="ja-inline">🇯🇵 第18章で作成した `hello-spring-boot` プロジェクトを開き、エントリークラスを見つけて、確かに `@SpringBootApplication` が付いており、Initializrで入力したPackage nameと一致していることを確認しましょう。</span>
2. 尝试把一个测试用的 `@RestController` 类放到入口类所在包**之外**的一个包里（比如包名少了 `hello.` 这一级），重新启动项目，观察这个 Controller 是否还能正常被访问，体会 `@ComponentScan` 扫描范围的重要性。<br><span class="ja-inline">🇯🇵 テスト用の `@RestController` クラスをエントリークラスが属するパッケージの**外**にある別のパッケージ（例えば `hello.` の階層が抜けたパッケージ名）に置いてみて、プロジェクトを再起動し、このControllerが正常にアクセスできるかどうか観察し、`@ComponentScan` のスキャン範囲の重要性を体感しましょう。</span>
3. 用自己的话，向别人解释一遍"为什么 Spring Boot 项目不需要单独安装 Tomcat"。<br><span class="ja-inline">🇯🇵 自分の言葉で、「なぜSpring Bootプロジェクトは別途Tomcatをインストールする必要がないのか」を人に説明してみましょう。</span>

### Spring Boot 3.x 与 4.x 的主要区别 ／ Spring Boot 3.xと4.xの主な違い

工作后你大概率会同时见到用 Spring Boot 3.x 和 4.x 写的项目，本教程统一锁定 4.1.1，但这里补充 5 个最基础的差异，目标只是让你**以后在公司看到 Boot 3 项目不会以为自己学错了**，不展开成完整的迁移指南：

> 🇯🇵 就職後は、Spring Boot 3.xと4.xの両方で書かれたプロジェクトを見かける可能性が高いです。本チュートリアルは4.1.1に統一していますが、ここでは最も基本的な5つの違いを補足します。目的はあくまで**将来会社でBoot 3のプロジェクトを見たときに、自分の学び方が間違っていたと思わないようにする**ことであり、完全な移行ガイドとして展開するものではありません。

1. **Java 最低版本要求变化**：Spring Boot 4 要求更高的 Java 最低版本（本教程使用的 Java 21 完全满足要求），Boot 3 时代的项目可能还在用较早的 Java 版本。<br><span class="ja-inline">🇯🇵 **Java最低バージョン要件の変化**：Spring Boot 4はより高いJavaの最低バージョンを要求します（本チュートリアルが使用するJava 21は要件を完全に満たしています）。Boot 3時代のプロジェクトはより古いJavaバージョンを使っている可能性があります。</span>
2. **Spring Framework 主版本变化**：Spring Boot 4 底层依赖的 Spring Framework 主版本也随之升级。<br><span class="ja-inline">🇯🇵 **Spring Frameworkのメジャーバージョンの変化**：Spring Boot 4が内部で依存するSpring Frameworkのメジャーバージョンもそれに伴い上がっています。</span>
3. **继续使用 Jakarta 命名空间**：无论 Boot 3 还是 Boot 4，Servlet 相关的包名都是 `jakarta.servlet.*`，而不是更早期 Java EE 时代的 `javax.servlet.*`——这一点 Boot 3 到 Boot 4 是延续的，不是新变化，但很多"老"教程（Spring Boot 2 时代）里还在用 `javax.*`，看到时要留意版本背景。<br><span class="ja-inline">🇯🇵 **Jakarta名前空間の継続使用**：Boot 3でもBoot 4でも、Servlet関連のパッケージ名は `jakarta.servlet.*` であり、より古いJava EE時代の `javax.servlet.*` ではありません——これはBoot 3からBoot 4へ引き継がれているもので新しい変化ではありませんが、多くの「古い」教材（Spring Boot 2時代）ではまだ `javax.*` を使っているので、見かけたときはバージョンの背景に注意が必要です。</span>
4. **部分 Starter 坐标发生变化**：个别第三方库的 Starter 依赖坐标（`groupId`/`artifactId`）在适配 Boot 4 时发生了变化，不能直接照抄 Boot 3 教程里的坐标。最典型的例子就是 Web 开发最基础的 Starter：Spring Boot 3 及更早版本用的是 `spring-boot-starter-web`，这个坐标在 Boot 4 里仍然保留、可以正常运行，但官方已标记为 deprecated；Boot 4 新项目推荐使用 `spring-boot-starter-webmvc`（本教程第 17 章开始就统一用的是这一个）。<br><span class="ja-inline">🇯🇵 **一部のStarterの座標の変化**：一部のサードパーティライブラリのStarter依存関係の座標（`groupId`/`artifactId`）がBoot 4に対応する際に変わっており、Boot 3の教材の座標をそのまま流用することはできません。最も典型的な例はWeb開発の最も基本的なStarterです：Spring Boot 3以前は `spring-boot-starter-web` を使っていましたが、この座標はBoot 4でも保持されており正常に動作しますが、公式はすでにdeprecatedとマークしています。Boot 4の新規プロジェクトでは `spring-boot-starter-webmvc` の使用が推奨されています（本チュートリアルは第17章からこちらを統一して使っています）。</span>
5. **MyBatis / MyBatis-Plus 需要选择 Boot 4 兼容的 Starter**：本教程后面会用到的 `mybatis-spring-boot-starter` 和 `mybatis-plus-spring-boot4-starter`，坐标和版本都专门对应 Boot 4；如果照抄网上针对 Boot 3 写的教程（比如用了 `mybatis-plus-boot-starter` 这种旧坐标），会导致依赖冲突或无法正常工作，第 27～28 章会再次提醒这一点。<br><span class="ja-inline">🇯🇵 **MyBatis／MyBatis-PlusはBoot 4互換のStarterを選ぶ必要がある**：本チュートリアルで後ほど使用する `mybatis-spring-boot-starter` と `mybatis-plus-spring-boot4-starter` は、座標とバージョンが専用にBoot 4に対応しています。もしネット上のBoot 3向けの教材（例えば `mybatis-plus-boot-starter` のような古い座標を使ったもの）をそのまま流用すると、依存関係の衝突や正常に動作しないといった問題が起きます。第27〜28章で改めて注意を促します。</span>

## 小测验 ／ 小テスト

1. `@SpringBootApplication` 准确来说等价于哪三个注解的组合？<br><span class="ja-inline">🇯🇵 `@SpringBootApplication` は正確にはどの3つのアノテーションの組み合わせに相当しますか？</span>
2. `@ComponentScan` 的扫描范围是怎么确定的？<br><span class="ja-inline">🇯🇵 `@ComponentScan` のスキャン範囲はどのように決まりますか？</span>
3. Spring Boot 项目为什么不需要单独安装 Tomcat、也不需要打 war 包部署？<br><span class="ja-inline">🇯🇵 なぜSpring Bootプロジェクトは別途Tomcatをインストールする必要がなく、warファイルをパッケージングしてデプロイする必要もないのですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`（其中 `@SpringBootConfiguration` 本身又基于 `@Configuration`）。<br><span class="ja-inline">🇯🇵 `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan`（うち `@SpringBootConfiguration` 自体はさらに `@Configuration` をベースにしています）。</span>
2. 以贴着 `@SpringBootApplication`（或者说贴着 `@ComponentScan`）的入口类所在的包为起点，扫描这个包本身及其所有子包。<br><span class="ja-inline">🇯🇵 `@SpringBootApplication`（つまり `@ComponentScan`）が付いたエントリークラスが属するパッケージを起点として、このパッケージ自体とそのすべてのサブパッケージをスキャンします。</span>
3. 因为项目引入了 `spring-boot-starter-webmvc` 之后，`@EnableAutoConfiguration` 会根据这个依赖自动配置好内嵌 Tomcat，Tomcat 本身作为依赖被打包进最终生成的 jar 包里，运行这个 jar 包就相当于同时启动了业务代码和内嵌的 Web 服务器，不再需要额外部署到独立的 Tomcat 服务器。<br><span class="ja-inline">🇯🇵 プロジェクトが `spring-boot-starter-webmvc` を導入すると、`@EnableAutoConfiguration` がこの依存関係に基づいて内蔵Tomcatを自動的に設定するためです。Tomcat自体が依存関係として最終的に生成されるjarファイルにパッケージングされ、そのjarファイルを実行することは業務コードと内蔵Webサーバーを同時に起動することに相当し、別途独立したTomcatサーバーにデプロイする必要がなくなります。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经准确理解了 `@SpringBootApplication` 是三个注解组合的产物，也搞清楚了 Spring Boot 项目"一键启动、自带 Tomcat"的原因，并且了解了 Boot 3 与 Boot 4 之间几个最基础的差异，以后看到公司里的 Boot 3 项目不会感到陌生。下一章，我们正式进入全教程的重点章节之一：Spring MVC 全链路——搞清楚一个 HTTP 请求是怎么一步步找到你写的 Controller 方法的。

> 🇯🇵 これで `@SpringBootApplication` が3つのアノテーションの組み合わせの産物であることを正確に理解し、Spring Bootプロジェクトが「ワンクリックで起動でき、Tomcatを内蔵している」理由も分かり、Boot 3とBoot 4の間にあるいくつかの最も基本的な違いも知ることができました。今後会社でBoot 3のプロジェクトを見ても違和感を覚えないはずです。次章では、いよいよ本チュートリアルの重点の一つであるSpring MVC全体の流れ——1つのHTTPリクエストがどのように段階を経てあなたの書いたControllerメソッドにたどり着くのかを明らかにしていきます。
