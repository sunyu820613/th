# 阶段复习 5：全课程收官复习 ／ ステージ復習5：全コース総まとめ

## 知识地图 ／ 知識マップ

从第 1 章到第 37 章，所有知识点其实只沿着一条主线在往前走：**"怎么让一台电脑上的浏览器，安全、规范地拿到另一台电脑上数据库里的数据"**。精简版依赖链路图如下（完整版见大纲"完整知识依赖顺序"）：

> 🇯🇵 第1章から第37章まで、すべての学習内容は実は一本の筋に沿って進んできました。**「あるパソコンのブラウザが、別のパソコンのデータベースにあるデータを、安全かつ規範的に手に入れるにはどうすればよいか」**という筋です。簡略版の依存関係図は以下の通りです（完全版はアウトラインの「完全な知識依存順序」を参照してください）。

```
阶段 0　Java 基础
  变量/分支/循环/数组 → 类与对象 → 封装/继承/多态/接口
  → 泛型/集合/枚举/异常 → Lambda/Stream/Optional → 注解入门

阶段 1　Web 通信原理
  HTTP（请求/响应/方法/状态码）→ Servlet & Tomcat → Servlet Hello 小实验
  → Servlet 的局限 → MVC 模式（Controller-Service-Mapper-DB）

阶段 2　Spring 核心与 Spring Boot
  为什么需要 IoC/DI → Bean 与构造器注入 → Maven 基础
  → Spring Boot 项目结构 → @SpringBootApplication 三件事
  → Spring MVC 全链路（DispatcherServlet→HandlerMapping→HandlerAdapter→Controller）
  →【Project 1：Hello Spring Boot】
  → JSON 与 Jackson → RESTful API 设计
  →【Project 2：内存版 User API】
  → 配置/日志/打包运行

阶段 3　数据库与持久层
  数据库基础概念 → 基础 SQL → Spring Boot 连接 MySQL
  → JDBC 与 MyBatis → MyBatis-Plus → 事务 @Transactional
  →【Project 3：MySQL User CRUD】

阶段 4　工程化与完整项目
  DTO/Entity/VO 边界 → 参数校验 → 全局异常处理
  → 前后端交互与 CORS → Git 基础 → Debug 排查
  → 基础自动化测试（单元测试 vs 集成测试）
  →【Project 4：Task 管理系统完整 CRUD，含基础分页】

阶段 5　后续学习路线（第 38 章指路，不深入）
```

一句话总结这张图：**Java 基础是地基，Web 通信原理告诉你"请求是怎么被接收的"，Spring/Spring Boot 告诉你"怎么优雅地组织接收请求之后的代码"，数据库/MyBatis 告诉你"数据存哪、怎么存取"，工程化章节告诉你"怎么让代码经得起真实世界的检验"，最终项目把它们全部拼在一起。**

> 🇯🇵 この図を一言でまとめると：**Java の基礎が土台であり、Web 通信の原理が「リクエストがどのように受け取られるか」を教え、Spring/Spring Boot が「リクエストを受け取った後のコードをどう優雅に整理するか」を教え、データベース/MyBatis が「データをどこに、どう保存・取得するか」を教え、エンジニアリングの章が「コードを実世界の検証に耐えられるものにするにはどうすればよいか」を教え、最終プロジェクトがそれらすべてを組み合わせたものです。**

## 易混概念对照 ／ 混同しやすい概念の対比

| 概念 A ／ 概念A | 概念 B ／ 概念B | 一句话区别 ／ 一言での違い |
|---|---|---|
| Spring | Spring Boot | Spring 是底层框架（IoC/DI/MVC 等一整套能力），Spring Boot 是在 Spring 之上做的"开箱即用"封装，自动配置、内嵌 Tomcat，让你不用手写一堆 XML 配置<br><span class="ja-inline">🇯🇵 Spring は基盤となるフレームワーク（IoC/DI/MVC などの一式の能力）であり、Spring Boot は Spring の上に作られた「すぐに使える」ラッパーです。自動設定や内蔵 Tomcat により、大量の XML 設定を手書きする必要がなくなります </span>|
| Spring MVC | Spring Boot | Spring MVC 是 Spring 里专门处理 Web 请求的模块（DispatcherServlet 那一套），Spring Boot 只是让"用起 Spring MVC"这件事配置更少、更方便，二者不是平级替代关系<br><span class="ja-inline">🇯🇵 Spring MVC は Spring の中で Web リクエストの処理を専門に担当するモジュール（DispatcherServlet 一式）であり、Spring Boot は「Spring MVC を使う」ことを設定が少なく便利にしているだけです。両者は同列の代替関係ではありません </span>|
| Servlet | Controller | Servlet 是 Java EE/Jakarta 规范里最原始的"处理 HTTP 请求"的接口（`doGet`/`doPost`），Controller 是 Spring MVC 里更高级的抽象，底层其实还是靠一个统一的 Servlet（DispatcherServlet）在转发<br><span class="ja-inline">🇯🇵 Servlet は Java EE/Jakarta 規格における最も原始的な「HTTP リクエストを処理する」インターフェース（`doGet`/`doPost`）であり、Controller は Spring MVC におけるより高レベルな抽象化です。実際には内部で統一された一つの Servlet（DispatcherServlet）が転送を担っています </span>|
| Tomcat | Spring Boot | Tomcat 是 Servlet 容器，真正负责监听端口、接收 HTTP 连接；Spring Boot 项目里内嵌了一个 Tomcat，Spring Boot 本身不负责网络通信<br><span class="ja-inline">🇯🇵 Tomcat は Servlet コンテナであり、実際にポートを監視し HTTP 接続を受け付ける役割を担います。Spring Boot プロジェクトには Tomcat が内蔵されていますが、Spring Boot 自体はネットワーク通信を担当しません </span>|
| Controller | Service | Controller 负责"接收请求、解析参数、调用业务逻辑、包装返回结果"，不写具体业务规则；Service 才是真正写业务逻辑（校验、计算、组合多个数据源）的地方<br><span class="ja-inline">🇯🇵 Controller は「リクエストを受け取り、パラメータを解析し、ビジネスロジックを呼び出し、返却結果を組み立てる」役割を担い、具体的な業務ルールは書きません。Service こそが実際にビジネスロジック（検証、計算、複数のデータソースの組み合わせ）を書く場所です </span>|
| Entity | DTO | Entity 和数据库表结构一一对应，是持久层的数据模型；DTO 是专门用来和前端/外部系统交互的数据模型，字段可以裁剪、改名、组合多个 Entity<br><span class="ja-inline">🇯🇵 Entity はデータベースのテーブル構造と一対一で対応する、永続化層のデータモデルです。DTO はフロントエンド／外部システムとのやり取り専用のデータモデルで、フィールドを取捨選択したり、名前を変えたり、複数の Entity を組み合わせたりできます </span>|
| Mapper | Service | Mapper 只负责"怎么和数据库打交道"（一条 SQL 对应一个方法），不掺杂业务判断；Service 负责调度 Mapper、组合业务规则，是 Mapper 的"上一层调用者"<br><span class="ja-inline">🇯🇵 Mapper は「どうデータベースとやり取りするか」（1本の SQL が1つのメソッドに対応）だけを担当し、業務判断は混ぜません。Service は Mapper を呼び出し業務ルールを組み合わせる、Mapper の「一つ上の呼び出し元」です </span>|
| JDBC | MyBatis | JDBC 是 Java 官方最原始的数据库访问 API，需要手写大量样板代码（建连接、拼 SQL、取结果集、关连接）；MyBatis 是在 JDBC 之上做的封装框架，把 SQL 和 Java 对象自动映射，省掉样板代码<br><span class="ja-inline">🇯🇵 JDBC は Java 公式の最も原始的なデータベースアクセス API で、大量の定型コード（接続の確立、SQL の組み立て、結果セットの取得、接続のクローズ）を手書きする必要があります。MyBatis は JDBC の上に作られたラッパーフレームワークで、SQL と Java オブジェクトを自動でマッピングし、定型コードを省きます </span>|
| MyBatis | MyBatis-Plus | MyBatis 需要你自己写每一条 SQL（或 XML）；MyBatis-Plus 在 MyBatis 基础上提供 `BaseMapper`，单表的增删改查、分页都有现成方法，不用手写 SQL<br><span class="ja-inline">🇯🇵 MyBatis では SQL（または XML）を自分で1本ずつ書く必要があります。MyBatis-Plus は MyBatis をベースに `BaseMapper`（MyBatis-Plus が提供する既製の CRUD メソッド一式を持つインターフェース）を提供し、単一テーブルの CRUD やページネーション（一覧を複数ページに分けて返す仕組み）にはすぐ使えるメソッドが揃っており、SQL を手書きする必要がありません </span>|
| @PathVariable | @RequestParam | `@PathVariable` 取的是 URL 路径里的一段（如 `/tasks/5` 里的 `5`），`@RequestParam` 取的是 `?key=value` 形式的查询参数（如 `?page=1&size=20`）<br><span class="ja-inline">🇯🇵 `@PathVariable` は URL パスの中の一部分（例えば `/tasks/5` の `5`）を取得し、`@RequestParam` は `?key=value` 形式のクエリパラメータ（例えば `?page=1&size=20`）を取得します </span>|
| @RequestBody | @RequestParam | `@RequestBody` 把整个 HTTP 请求体（通常是一段 JSON）反序列化成一个 Java 对象；`@RequestParam` 只取 URL 上某一个零散的参数值<br><span class="ja-inline">🇯🇵 `@RequestBody` は HTTP リクエストボディ全体（通常は JSON）を Java オブジェクトへデシリアライズ（逆シリアル化）します。`@RequestParam` は URL 上のばらばらな一つのパラメータ値だけを取得します </span>|
| Bean | 普通对象 ／ 普通のオブジェクト | 普通对象是你自己 `new` 出来、自己管理生命周期的；Bean 是交给 Spring 容器创建和管理的对象，可以被自动注入到其他需要它的地方<br><span class="ja-inline">🇯🇵 普通のオブジェクトは自分で `new` して自分でライフサイクルを管理するものです。Bean は Spring コンテナが作成・管理するオブジェクトで、それを必要とする他の場所へ自動的に注入できます </span>|
| IoC | DI | IoC（控制反转）是一种设计思想——"对象的创建权交给容器，不再由代码自己 `new`"；DI（依赖注入）是实现 IoC 的具体手段——容器把一个对象需要的依赖"塞"给它，本教程统一用构造器注入<br><span class="ja-inline">🇯🇵 IoC（制御の反転）は「オブジェクトの生成権をコンテナに渡し、コード自身が `new` しない」という設計思想です。DI（依存性注入）は IoC を実現する具体的な手段で、コンテナがオブジェクトに必要な依存を「詰め込んで」あげます。本チュートリアルでは一貫してコンストラクタインジェクションを使います </span>|
| HTTP | REST | HTTP 是底层的网络传输协议，规定了请求/响应的格式；REST 是一种**基于** HTTP 的 API 设计风格（用资源式 URL、用标准方法表达增删改查），不是另一种协议<br><span class="ja-inline">🇯🇵 HTTP は基盤となるネットワーク転送プロトコルで、リクエスト／レスポンスの形式を定めています。REST は HTTP **をベースにした** API 設計スタイル（リソース指向の URL、標準的なメソッドで CRUD を表現する）であり、別のプロトコルではありません </span>|
| 单元测试 ／ 単体テスト | 集成测试 ／ 結合テスト | 单元测试（`@Test`）不启动 Spring 容器，只测一个小单元的逻辑，速度快；集成测试（`@SpringBootTest`）会启动完整的 ApplicationContext，Bean 之间真正互相注入，更接近真实运行环境，但速度慢<br><span class="ja-inline">🇯🇵 単体テスト（`@Test`）は Spring コンテナを起動せず、小さな単位のロジックだけをテストするので高速です。結合テスト（`@SpringBootTest`）は完全な ApplicationContext（Spring コンテナの実体）を起動し、Bean 同士が実際に注入し合うため、実運用環境により近くなりますが、速度は遅くなります </span>|

## 测试题 ／ テスト問題

1. 一个 `GET /tasks/5` 请求从浏览器发出到收到 JSON 响应，请按顺序写出它依次经过的至少 6 个环节。<br><span class="ja-inline">🇯🇵 `GET /tasks/5` というリクエストがブラウザから送信されて JSON レスポンスを受け取るまでに、順番に経由する少なくとも6つの段階を書き出してください。</span>
2. 为什么 `TaskMapper` 只是一个 interface、没有任何实现类，程序却能正常运行？<br><span class="ja-inline">🇯🇵 なぜ `TaskMapper` は単なる interface で、実装クラスが一つもないのに、プログラムは正常に動作するのですか。</span>
3. `@SpringBootApplication` 到底约等于哪三个注解的组合？<br><span class="ja-inline">🇯🇵 `@SpringBootApplication` は結局、どの3つのアノテーションの組み合わせとほぼ等しいのですか。</span>
4. 请解释一下：为什么 `TaskController` 返回 `TaskResponse` 而不是直接返回 `Task`？<br><span class="ja-inline">🇯🇵 なぜ `TaskController` は `Task` を直接返さずに `TaskResponse` を返すのか説明してください。</span>
5. `@RestController` 和 `@Controller + @ResponseBody` 有什么关系？<br><span class="ja-inline">🇯🇵 `@RestController` と `@Controller + @ResponseBody` はどのような関係にありますか。</span>
6. MyBatis-Plus 的分页插件不注册会发生什么？<br><span class="ja-inline">🇯🇵 MyBatis-Plus のページネーションプラグインを登録しないと何が起こりますか。</span>
7. `@Valid` 校验失败之后，请求会被谁拦截？最终返回什么状态码？<br><span class="ja-inline">🇯🇵 `@Valid` によるバリデーションが失敗した後、リクエストは誰に捕捉されますか。最終的にどのステータスコードが返りますか。</span>
8. 简述"构造器注入"相比"字段注入"（直接在字段上写 `@Autowired`）的一个好处。<br><span class="ja-inline">🇯🇵 「コンストラクタインジェクション」が「フィールドインジェクション」（フィールドに直接 `@Autowired` を書く方式）と比べて優れている点を一つ簡潔に述べてください。</span>
9. 事务 `@Transactional` 解决的核心问题是什么？请举一个"转账"之外的业务场景说明为什么需要它。<br><span class="ja-inline">🇯🇵 トランザクション（`@Transactional`）が解決する核心的な問題は何ですか。「振込」以外の業務シーンを一つ挙げて、なぜそれが必要かを説明してください。</span>
10. 单元测试和集成测试，你会分别在什么场景下选择使用？<br><span class="ja-inline">🇯🇵 単体テストと結合テストは、それぞれどのような場面で使い分けますか。</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. Browser → Tomcat → DispatcherServlet → HandlerMapping（找到 TaskController.getById）→ HandlerAdapter（实际调用该方法）→ Controller → Service → Mapper → MySQL → 结果原路返回 → HttpMessageConverter/Jackson 序列化成 JSON → HTTP Response → Browser。<br><span class="ja-inline">🇯🇵 Browser → Tomcat → DispatcherServlet → HandlerMapping（TaskController.getById を見つける）→ HandlerAdapter（実際にそのメソッドを呼び出す）→ Controller → Service → Mapper → MySQL → 結果が同じ経路で返る → HttpMessageConverter/Jackson が JSON にシリアライズ → HTTP Response → Browser。</span>
2. 因为 `@Mapper` 注解让 MyBatis 在项目启动时用动态代理技术，为这个接口自动生成一个"代理实现类"并注册成 Spring Bean，我们从没写过这个实现类的代码。<br><span class="ja-inline">🇯🇵 `@Mapper` アノテーションにより、MyBatis がプロジェクト起動時に動的プロキシ技術を使って、このインターフェースに対して自動的に「プロキシ実装クラス」を生成し、Spring Bean として登録するからです。私たちはこの実装クラスのコードを一行も書いたことがありません。</span>
3. `@SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan`。<br><span class="ja-inline">🇯🇵 `@SpringBootConfiguration + @EnableAutoConfiguration + @ComponentScan` です。</span>
4. `Task` 是 entity，和数据库表结构绑定，可能包含不该暴露给前端的字段；`TaskResponse` 是 DTO，专门为前端裁剪、组合字段，避免把内部数据结构直接暴露出去。<br><span class="ja-inline">🇯🇵 `Task` は entity であり、データベースのテーブル構造に紐づいていて、フロントエンドに公開すべきでないフィールドを含んでいる可能性があります。`TaskResponse` は DTO であり、フロントエンド向けにフィールドを取捨選択・組み合わせる専用のもので、内部のデータ構造をそのまま公開してしまうのを避けられます。</span>
5. `@RestController` 就是 `@Controller` 和 `@ResponseBody` 的组合注解，表示这个类里所有方法的返回值都直接作为响应体（通常是 JSON），不走视图解析。<br><span class="ja-inline">🇯🇵 `@RestController` は `@Controller` と `@ResponseBody` を組み合わせたアノテーションであり、このクラス内のすべてのメソッドの戻り値がそのままレスポンスボディ（通常は JSON）となり、ビュー解決を経由しないことを意味します。</span>
6. `page`/`size` 参数不生效，`selectPage()` 退化成查询全部数据，`total` 也算不对。<br><span class="ja-inline">🇯🇵 `page`/`size` パラメータが効かなくなり、`selectPage()` は全データを検索する動作に退化し、`total` も正しく計算されなくなります。</span>
7. 会被 `@RestControllerAdvice` 标注的 `GlobalExceptionHandler` 里处理 `MethodArgumentNotValidException` 的方法拦截，最终返回 `400`。<br><span class="ja-inline">🇯🇵 `@RestControllerAdvice` が付与された `GlobalExceptionHandler` 内の、`MethodArgumentNotValidException` を処理するメソッドに捕捉され、最終的に `400` が返ります。</span>
8. 构造器注入能保证依赖在对象创建的那一刻就必须提供（不可能出现"依赖还没注入就被调用"的空指针问题），并且方便在单元测试里手动 `new` 出对象、传入自己准备的依赖（或 `null`），不需要启动 Spring 容器。<br><span class="ja-inline">🇯🇵 コンストラクタインジェクションは、オブジェクト生成の瞬間に依存が必ず提供されていることを保証できます（「依存がまだ注入されていないのに呼び出される」というヌルポインタ問題が起こり得ません）。また、単体テストで手動で `new` してオブジェクトを作り、自分で用意した依存（または `null`）を渡すのが簡単で、Spring コンテナを起動する必要がありません。</span>
9. 事务解决的是"一组数据库操作要么全部成功、要么全部失败回滚"的问题，避免出现"扣了库存但没生成订单"这种数据不一致的中间状态。除了转账，比如"下单时既要在 order 表插入一条记录，又要在 stock 表扣减库存"，这两步必须绑定在同一个事务里。<br><span class="ja-inline">🇯🇵 トランザクションが解決するのは「一連のデータベース操作が全部成功するか、全部失敗してロールバックされるか」という問題であり、「在庫は減らしたのに注文が作成されていない」といったデータの不整合な中間状態を避けます。振込以外の例としては、「注文時に order テーブルへレコードを挿入すると同時に、stock テーブルの在庫を減らす」場合、この2つのステップは同じトランザクションに束ねる必要があります。</span>
10. 单元测试适合测试不依赖数据库、不依赖 Spring 容器的纯逻辑（比如一个数据转换方法），开发时随手就能跑，反馈快；集成测试适合验证"多个组件真正配合起来是否正常工作"（比如一个完整的 HTTP 请求能不能从 Controller 一路走到数据库），更接近上线前的真实场景，但运行慢，不适合每改一行代码就跑一次。<br><span class="ja-inline">🇯🇵 単体テストは、データベースにも Spring コンテナにも依存しない純粋なロジック（データ変換メソッドなど）のテストに向いており、開発中に気軽に実行でき、フィードバックが速いです。結合テストは「複数のコンポーネントが実際に連携して正常に動作するか」（完全な HTTP リクエストが Controller からデータベースまで一気通貫で動くかなど）の検証に向いており、本番投入前の実際のシーンにより近いですが、実行が遅く、コードを1行変更するたびに実行するのには向いていません。</span>
</details>

## 小项目回顾 ／ ミニプロジェクトの振り返り

四个阶段项目是一条完整的能力升级路径，每一个都在前一个基础上"刚好多学一层"：

> 🇯🇵 4つの段階プロジェクトは一続きの能力向上の道筋であり、それぞれが前のものをベースに「ちょうど一層分だけ多く学ぶ」ように設計されています。

- **Project 1：Hello Spring Boot**（`hello-spring-boot`）——学完 Spring MVC 全链路之后的第一次实操，只验证"浏览器发请求 → Controller 方法被调用 → 返回一段文字"这一件事，不涉及数据库、不涉及分层，建立最基础的调用链体感。<br><span class="ja-inline">🇯🇵 **Project 1：Hello Spring Boot**（`hello-spring-boot`）—— Spring MVC の全体の流れを学び終えた後の最初の実践で、「ブラウザがリクエストを送る → Controller のメソッドが呼び出される → 一文を返す」という一点だけを検証します。データベースも階層分けも扱わず、最も基本的な呼び出しの流れの感覚をつかみます。</span>
- **Project 2：内存版 User API**（`user-api-memory`）——引入 Controller-Service 分层和 REST 风格 URL 设计，数据先存在一个 `List<User>` 里（内存），不涉及数据库，重点是理解"为什么要把业务逻辑从 Controller 里搬到 Service"。<br><span class="ja-inline">🇯🇵 **Project 2：メモリ版 User API**（`user-api-memory`）—— Controller-Service の階層分けと REST スタイルの URL 設計を導入します。データはまず `List<User>`（メモリ）に保存し、データベースは扱いません。重点は「なぜビジネスロジックを Controller から Service に移すのか」を理解することです。</span>
- **Project 3：MySQL User CRUD**（`user-crud-mysql`）——把内存 List 换成真实 MySQL 数据库，引入完整的 Controller-Service-Mapper 三层结构，用上 MyBatis-Plus 的 `BaseMapper`，第一次让数据"持久化"（重启程序数据不丢）。<br><span class="ja-inline">🇯🇵 **Project 3：MySQL User CRUD**（`user-crud-mysql`）—— メモリの List を実際の MySQL データベースに置き換え、完全な Controller-Service-Mapper の三層構造を導入し、MyBatis-Plus の `BaseMapper` を使い、初めてデータを「永続化」します（プログラムを再起動してもデータが失われません）。</span>
- **Project 4（最终项目）：Task 管理系统**（`task-manager`）——在 Project 3 基础上，新增：DTO 与 Entity 分离、参数校验（`@Valid`）、全局异常处理（`@RestControllerAdvice`）、双表关联（User-Task 一对多，外键）、基础分页（`GET /tasks?page=&size=`，MyBatis-Plus 分页插件）、基础自动化测试（Service 层单元测试 + Controller 层 HTTP 测试）。这是前三个项目所有知识点的合集，外加本教程收尾阶段才教的工程化能力。<br><span class="ja-inline">🇯🇵 **Project 4（最終プロジェクト）：Task 管理システム**（`task-manager`）—— Project 3 をベースに、DTO と Entity の分離、パラメータバリデーション（`@Valid`）、グローバル例外処理（`@RestControllerAdvice`）、2テーブル関連（User-Task の一対多、外部キー（テーブル間の関連を保証する制約））、基本的なページネーション（`GET /tasks?page=&size=`、MyBatis-Plus のページネーションプラグイン）、基本的な自動テスト（Service 層の単体テスト＋ Controller 層の HTTP テスト）を新たに加えます。これは前の3つのプロジェクトのすべての学習内容の集大成に、本チュートリアルの締めくくり段階で教えたエンジニアリング能力を加えたものです。</span>

从 Project 1 到 Project 4，数据存储从"无" → "内存" → "单表 MySQL" → "双表 MySQL + 分页 + 测试"，架构从"一个 Controller 方法" → "Controller-Service" → "Controller-Service-Mapper" → "完整分层 + DTO + 校验 + 异常处理 + 测试"，正好对应全教程从"能跑起来"到"接近企业级项目雏形"的成长路径。

> 🇯🇵 Project 1 から Project 4 まで、データストレージは「なし」→「メモリ」→「単一テーブル MySQL」→「2テーブル MySQL ＋ページネーション＋テスト」へと進み、アーキテクチャは「一つの Controller メソッド」→「Controller-Service」→「Controller-Service-Mapper」→「完全な階層＋DTO＋バリデーション＋例外処理＋テスト」へと進みます。これはまさに、全チュートリアルが「動くようになる」から「企業レベルのプロジェクトの原型に近づく」への成長の道筋に対応しています。
