# 阶段复习 3：Spring 核心与 Spring Boot ／ ステージ復習3：Springコアと Spring Boot

## 知识地图 ／ 知識マップ

按学习依赖顺序梳理一遍本阶段学过的内容：

> 🇯🇵 この段階で学んだ内容を、学習の依存順に一通り整理します。

```
为什么需要 Spring（IoC/DI）——解决 new 对象满天飞、耦合度高的痛点
        ↓
Bean 与构造器注入——容器怎么创建对象、怎么解决依赖
        ↓
Maven 基础——pom.xml、依赖管理、mvn 常用命令
        ↓
创建第一个 Spring Boot 项目——Initializr、项目结构、application.yml
        ↓
@SpringBootApplication 与自动配置——三合一注解、3.x/4.x 差异
        ↓
Spring MVC 全链路——DispatcherServlet → HandlerMapping → HandlerAdapter → Controller
        ↓
Project 1：Hello Spring Boot——第一次亲手跑通 Browser → Controller
        ↓
JSON 与 Jackson——Java 对象 ↔ JSON，序列化/反序列化
        ↓
RESTful API 设计——资源 + HTTP Method + 状态码
        ↓
Project 2：内存版 User API——Controller-Service-List<User>，REST 风格接口
        ↓
配置、日志与打包运行——application.yml/Profile、SLF4J/Logback、mvn package + java -jar
```

这条链条串起来看：前半段（IoC/DI、Bean、Maven、Spring Boot 项目结构）解决的是"对象怎么被创建、怎么被组织起来"的问题；中间（Spring MVC 全链路、Jackson、REST）解决的是"一个 HTTP 请求怎么被处理、数据怎么在 Java 对象和 JSON 之间转换"的问题；最后（配置、日志、打包）解决的是"项目怎么适配不同环境、怎么被观测、怎么被交付运行"的问题。

> 🇯🇵 この一連の流れをつなげて見ると：前半（IoC（Inversion of Control、制御の反転）/DI（Dependency Injection、依存性注入）、Bean、Maven、Spring Bootプロジェクト構造）が解決しているのは「オブジェクトがどのように作成され、どのように組織されるか」という問題です。中間（Spring MVCの全体の流れ、Jackson、REST（RESTful、リソース指向のAPI設計スタイル））が解決しているのは「一つのHTTPリクエストがどのように処理され、データがJavaオブジェクトとJSONの間でどう変換されるか」という問題です。最後（設定、ログ、パッケージング）が解決しているのは「プロジェクトがどう異なる環境に適応し、どう観測され、どう配布・実行されるか」という問題です。

## 易混概念对照 ／ 混同しやすい概念の対比

| 概念 A ／ 概念A | 概念 B ／ 概念B | 一句话区别 ／ 一言での違い |
|---|---|---|
| Spring | Spring Boot | Spring 是一整套底层框架（IoC 容器、AOP 等核心能力）；Spring Boot 是建立在 Spring 之上的"脚手架"，通过自动配置和起步依赖（starter）大幅简化了 Spring 项目的搭建和配置过程，本质上是"用 Spring 的技术，做配置更少的项目"<br><span class="ja-inline">🇯🇵 Springは一連の基盤フレームワーク（IoC（Inversion of Control、制御の反転）コンテナ、AOPなどの中核機能）です。Spring BootはSpringの上に構築された「足場」であり、自動設定とスターター依存（starter）によってSpringプロジェクトの構築・設定プロセスを大幅に簡素化しています。本質的には「Springの技術を使いながら、設定をより少なくしたプロジェクトを作る」ものです </span>|
| Spring MVC | Spring Boot | Spring MVC 是 Spring 里专门处理 Web 请求的模块（DispatcherServlet、Controller 那一整套）；Spring Boot 不是另一个 Web 框架，而是帮你自动配置好 Spring MVC（以及内嵌 Tomcat 等）的工具，让你不用手写一大堆 XML/Java Config 就能直接用 Spring MVC<br><span class="ja-inline">🇯🇵 Spring MVCはSpringの中でWebリクエストの処理を専門に担当するモジュールです（DispatcherServlet、Controllerといった一式）。Spring Bootは別のWebフレームワークではなく、Spring MVC（および内蔵Tomcatなど）を自動的に設定してくれるツールであり、大量のXML/Java Configを手書きしなくてもそのままSpring MVCを使えるようにしてくれます </span>|
| Bean | 普通对象 ／ 普通のオブジェクト | 普通对象是你自己在代码里 `new` 出来的，生命周期完全由你自己管理；Bean 特指被 Spring 容器扫描、创建并统一管理起来的对象，创建时机、依赖注入都由容器负责，你可以通过构造器注入等方式直接使用它，不用自己 `new`<br><span class="ja-inline">🇯🇵 普通のオブジェクトは自分でコードの中で `new` して作るもので、ライフサイクルは完全に自分で管理します。Beanは特にSpringコンテナがスキャンし、作成して一元管理しているオブジェクトを指し、作成のタイミングや依存性注入はすべてコンテナが担当します。コンストラクタインジェクションなどの方法で直接使うことができ、自分で `new` する必要はありません </span>|
| IoC | DI | IoC（控制反转）是一种设计思想，指"对象的创建权交给容器，而不是自己 new"；DI（依赖注入）是实现 IoC 这个思想的具体手段之一，指"容器主动把一个对象需要的依赖传给它"（比如通过构造器注入）。可以理解为 IoC 是目标，DI 是达成这个目标常用的技术手段<br><span class="ja-inline">🇯🇵 IoC（制御の反転）は一種の設計思想であり、「オブジェクトの作成権をコンテナに渡し、自分で `new` しない」ことを指します。DI（依存性注入）はIoCというこの思想を実現する具体的な手段の一つであり、「コンテナが能動的にオブジェクトが必要とする依存関係をそれに渡す」（例えばコンストラクタインジェクションを通じて）ことを指します。IoCが目標で、DIはその目標を達成するためによく使われる技術的手段だと理解できます </span>|
| `@PathVariable` | `@RequestParam` | `@PathVariable` 从 URL 路径本身取值，对应 `/users/{id}` 这种写法，取的是 `id` 这一段路径；`@RequestParam` 从 URL 的查询字符串（`?key=value`）取值，比如 `/users?name=Tom` 里的 `name`<br><span class="ja-inline">🇯🇵 `@PathVariable` はURLパス自体から値を取り出すもので、`/users/{id}` のような書き方に対応し、`id` というパスの部分を取得します。`@RequestParam` はURLのクエリ文字列（`?key=value`）から値を取り出すもので、例えば `/users?name=Tom` の中の `name` です </span>|
| `@RequestBody` | `@RequestParam` | `@RequestBody` 把整个 HTTP 请求体（通常是一段 JSON 文本）反序列化成一个 Java 对象，一般用在 `POST`/`PUT` 这种需要传较复杂结构数据的场景；`@RequestParam` 只取 URL 查询字符串里的某一个简单参数值（字符串、数字等），两者拿数据的位置完全不同（请求体 vs URL）<br><span class="ja-inline">🇯🇵 `@RequestBody` はHTTPリクエストボディ全体（通常はJSONテキスト）をJavaオブジェクトにデシリアライズするもので、一般に `POST`/`PUT` のような比較的複雑な構造のデータを渡す必要がある場面で使われます。`@RequestParam` はURLクエリ文字列の中のある一つの単純なパラメータ値（文字列、数値など）だけを取得します。両者がデータを取る場所はまったく異なります（リクエストボディ vs URL） </span>|

## 测试题 ／ テスト問題

1. 一句话说明 IoC 解决的是什么痛点。<br><span class="ja-inline">🇯🇵 IoCが解決している課題を一言で説明してください。</span>
2. 构造器注入相比字段注入（`@Autowired` 写在字段上）有什么优势？<br><span class="ja-inline">🇯🇵 コンストラクタインジェクションはフィールドインジェクション（`@Autowired` をフィールドに書く方法）と比べてどんな利点がありますか？</span>
3. `@SpringBootApplication` 大致等价于哪三个注解的组合？<br><span class="ja-inline">🇯🇵 `@SpringBootApplication` はおおよそどの3つのアノテーションの組み合わせと等価ですか？</span>
4. Spring MVC 全链路里，`HandlerMapping` 和 `HandlerAdapter` 各自负责什么？<br><span class="ja-inline">🇯🇵 Spring MVCの全体の流れの中で、`HandlerMapping` と `HandlerAdapter` はそれぞれ何を担当していますか？</span>
5. Controller 方法返回一个 Java 对象后，它是什么时候变成 JSON 的？由谁完成？<br><span class="ja-inline">🇯🇵 ControllerメソッドがJavaオブジェクトを返した後、それはいつJSONになるのですか？誰が行うのですか？</span>
6. 按 REST 风格，"查询所有用户"和"新增一个用户"分别应该用什么 URL + HTTP Method 组合？<br><span class="ja-inline">🇯🇵 RESTスタイルに従うと、「すべてのユーザーを検索する」と「ユーザーを一人新規追加する」はそれぞれどんなURL + HTTP Methodの組み合わせを使うべきですか？</span>
7. 为什么正式项目不建议到处使用 `System.out.println()`？<br><span class="ja-inline">🇯🇵 なぜ正式なプロジェクトでは至る所で `System.out.println()` を使うことが推奨されないのですか？</span>
8. 为什么一个 Spring Boot 打出来的 jar 包，`java -jar` 就能直接跑起 Web 服务，不需要额外部署到外部 Tomcat？<br><span class="ja-inline">🇯🇵 なぜSpring Bootが生成したjarファイルは、`java -jar` だけで直接Webサービスを起動でき、外部のTomcatに追加でデプロイする必要がないのですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. IoC 解决的是"对象创建权和依赖关系散落在业务代码各处、耦合度高、难以维护"的问题——把对象的创建和组装交给容器统一管理，业务代码只管"用"，不管"怎么造出来"。<br><span class="ja-inline">🇯🇵 IoCが解決しているのは、「オブジェクトの作成権と依存関係がビジネスロジックのコードのあちこちに散らばり、結合度が高く保守しにくい」という問題です——オブジェクトの作成と組み立てをコンテナに一元管理させ、ビジネスロジックのコードは「使う」ことだけを担当し、「どう作るか」は気にしません。</span>
2. 构造器注入可以把依赖字段声明为 `final`，一旦对象创建完成依赖就不能再被改动；依赖关系在构造方法签名上一目了然；也更方便做单元测试（可以直接 new 对象传参数，不依赖 Spring 容器）。<br><span class="ja-inline">🇯🇵 コンストラクタインジェクションは依存フィールドを `final` として宣言でき、オブジェクトが作成された後は依存関係を変更できなくなります。依存関係がコンストラクタのシグネチャに一目瞭然です。また単体テストもしやすくなります（Springコンテナに依存せず、直接オブジェクトをnewしてパラメータを渡せます）。</span>
3. 大致等价于 `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan` 三者的组合（`@SpringBootConfiguration` 本身又是基于 `@Configuration` 的）。<br><span class="ja-inline">🇯🇵 おおよそ `@SpringBootConfiguration` + `@EnableAutoConfiguration` + `@ComponentScan` の3つの組み合わせと等価です（`@SpringBootConfiguration` 自体はさらに `@Configuration` をベースにしています）。</span>
4. `HandlerMapping` 负责"找谁处理"——根据请求的 URL 和 HTTP Method，匹配到应该由哪个 Controller 的哪个方法处理；`HandlerAdapter` 负责"怎么调用"——按照这个方法的参数签名（比如处理 `@PathVariable`、`@RequestBody` 等）正确地把它调用起来。<br><span class="ja-inline">🇯🇵 `HandlerMapping` は「誰が処理するか探す」ことを担当します——リクエストのURLとHTTP Methodに基づいて、どのControllerのどのメソッドが処理すべきかをマッチングします。`HandlerAdapter` は「どう呼び出すか」を担当します——そのメソッドの引数シグネチャ（`@PathVariable`、`@RequestBody` などの処理）に従って正しく呼び出します。</span>
5. 是在 Controller 方法执行完毕、返回值确定之后，由 `HttpMessageConverter`（内部使用 Jackson）在写入 HTTP 响应体之前完成序列化转换的，业务代码本身不需要手写任何转换逻辑。<br><span class="ja-inline">🇯🇵 Controllerメソッドの実行が終わり戻り値が確定した後、`HttpMessageConverter`（内部でJacksonを使用）がHTTPレスポンスボディに書き込む前にシリアライズ変換を完了します。ビジネスロジックのコード自体は変換ロジックを一切手書きする必要はありません。</span>
6. 查询所有用户：`GET /users`；新增一个用户：`POST /users`，新用户的数据放在请求体里。<br><span class="ja-inline">🇯🇵 すべてのユーザーを検索する：`GET /users`。ユーザーを一人新規追加する：`POST /users`、新しいユーザーのデータはリクエストボディに入れます。</span>
7. `println` 不能分级（分不清调试信息和报错信息）、不好定位是哪个类打的、无法灵活开关（想在生产环境屏蔽调试信息只能删代码/注释代码）、也不便于生产环境统一管理日志文件。<br><span class="ja-inline">🇯🇵 `println` はレベル分けができず（デバッグ情報とエラー情報の区別がつかない）、どのクラスが出力したか特定しにくく、柔軟にオン/オフできず（本番環境でデバッグ情報を隠したければコードを削除/コメントアウトするしかない）、本番環境でログファイルを一元管理するのにも不便です。</span>
8. 因为 Spring Boot 通过 `spring-boot-starter-webmvc` 把 Tomcat 作为普通依赖库一起打进了同一个 jar 包（内嵌 Tomcat），`java -jar` 启动时程序内部会用代码方式创建并启动这个 Tomcat，不依赖外部单独安装、配置的 Tomcat 服务器。<br><span class="ja-inline">🇯🇵 Spring Bootは `spring-boot-starter-webmvc` を通じて、Tomcatを普通の依存ライブラリとして同じjarファイルに一緒にパッケージングしているからです（内蔵Tomcat）。`java -jar` で起動すると、プログラム内部でコードによってこのTomcatを作成・起動し、外部に個別にインストール・設定されたTomcatサーバーに依存しません。</span>
</details>

## 小项目回顾 ／ ミニプロジェクトの振り返り

**Project 1：Hello Spring Boot**

> 🇯🇵 **Project 1：Hello Spring Boot**

- 练习了 Spring Boot 项目的基本结构（`@SpringBootApplication`、`application.yml`）<br><span class="ja-inline">🇯🇵 Spring Bootプロジェクトの基本構造（`@SpringBootApplication`、`application.yml`）を練習した</span>
- 第一次亲手体验"浏览器发请求 → Controller 方法被调用 → 返回内容显示在浏览器"这条最简单的调用链<br><span class="ja-inline">🇯🇵 「ブラウザがリクエストを送る → Controllerメソッドが呼び出される → 返却内容がブラウザに表示される」という最もシンプルな呼び出しの流れを初めて自分の手で体験した</span>
- 巩固了 Spring MVC 全链路里 `DispatcherServlet`/`HandlerMapping` 的作用，建立起"请求是怎么找到 Controller 的"这个心智模型<br><span class="ja-inline">🇯🇵 Spring MVCの全体の流れの中の `DispatcherServlet`/`HandlerMapping` の役割を定着させ、「リクエストがどうやってControllerを見つけるのか」というメンタルモデルを確立した</span>

**Project 2：内存版 User API**

> 🇯🇵 **Project 2：メモリ版 User API**

- 综合运用了 IoC/DI 和构造器注入：`UserController` 通过构造方法拿到 `UserService` 这个 Bean，没有用字段注入<br><span class="ja-inline">🇯🇵 IoC/DIとコンストラクタインジェクションを総合的に活用した：`UserController` はコンストラクタを通じて `UserService` というBeanを受け取り、フィールドインジェクションは使わなかった</span>
- 完整实践了 REST 风格的 URL 设计：`GET /users`、`GET /users/{id}`、`POST /users`、`PUT /users/{id}`、`DELETE /users/{id}` 五个接口，一次性覆盖了资源 + HTTP Method 的组合方式<br><span class="ja-inline">🇯🇵 RESTスタイルのURL設計を完全に実践した：`GET /users`、`GET /users/{id}`、`POST /users`、`PUT /users/{id}`、`DELETE /users/{id}` の5つのインターフェースで、リソース + HTTP Methodの組み合わせ方を一気にカバーした</span>
- 用到了 Jackson 的序列化和反序列化：`User` 对象和请求/响应中的 JSON 互相转换，Controller 方法直接返回或接收 `User` 对象<br><span class="ja-inline">🇯🇵 Jacksonのシリアライズとデシリアライズを使った：`User` オブジェクトとリクエスト/レスポンスの中のJSONが互いに変換され、Controllerメソッドは直接 `User` オブジェクトを返したり受け取ったりした</span>
- 用 `List<User>` 模拟了数据存储，直观感受到"没有数据库，数据只能存在内存里，重启即丢失"的局限，为后面引入数据库做了铺垫<br><span class="ja-inline">🇯🇵 `List<User>` でデータの保存をシミュレートし、「データベースがなければデータはメモリに保存するしかなく、再起動すれば失われる」という限界を直感的に感じ、この後データベースを導入する布石とした</span>
- 也留下了两个刻意的"未完成项"：Controller 直接暴露 Entity、查询失败时只返回 `null` 而非规范的 404——这两点分别在第 30 章（DTO）和第 32 章（全局异常处理）里会补上<br><span class="ja-inline">🇯🇵 意図的な「未完成の項目」も2つ残した：Controllerが直接Entityを露出していること、検索が失敗したときに規範的な404ではなく `null` を返すだけであること——この2点はそれぞれ第30章（DTO）と第32章（グローバル例外処理）で補われる</span>

## 本章总结 ／ 本章のまとめ
这一阶段你从"为什么需要 Spring"出发，一路学到了 Bean、构造器注入、Spring Boot 项目搭建、Spring MVC 全链路、JSON 转换、REST 设计规范，最终用两个小项目把这些知识串成了两条完整可运行的调用链。接下来进入阶段 3：数据库与持久层，Project 2 里"数据存在内存里"这个明显的短板，很快就会被解决。

> 🇯🇵 この段階では「なぜSpringが必要なのか」から出発し、Bean、コンストラクタインジェクション、Spring Bootプロジェクトの構築、Spring MVCの全体の流れ、JSON変換、REST設計規範まで一通り学び、最終的に2つのミニプロジェクトでこれらの知識を2本の完全に動作する呼び出しの流れにつなげました。次はステージ3：データベースと永続化層に進みます。Project 2の「データがメモリに保存されている」という明らかな弱点は、まもなく解決されることになります。
