# 第 10 章　HTTP 协议详解 ／ 第10章　HTTPプロトコル詳解

## 本章目标 ／ 本章の目標
看懂一条真实的 HTTP 请求报文和响应报文；理解 URL/URI、Method、Header、Query Parameter、Body 各自的位置和作用；掌握 GET/POST/PUT/PATCH/DELETE 五个方法的语义，以及常见状态码的含义；建立"浏览器/客户端 → HTTP Request → 服务器 → HTTP Response"这个最基础的通信模型。

> 🇯🇵 実際のHTTPリクエストメッセージとレスポンスメッセージを読み解けるようになります。URL/URI、Method（メソッド、リクエストの動作を表す）、Header（ヘッダー、通信の付加情報）、Query Parameter（クエリパラメータ、URLに付加する条件）、Body（ボディ、実際のデータ内容）それぞれの位置と役割を理解します。GET/POST/PUT/PATCH/DELETEという5つのメソッドの意味、およびよく使うステータスコード（Status Code）の意味を身につけます。「ブラウザ/クライアント → HTTP Request → サーバー → HTTP Response」という、最も基本的な通信モデルを構築します。

## 一句话理解 ／ 一言で理解する
HTTP 就是浏览器（或者任何客户端）和服务器之间"打电话"用的固定话术：一方按规定格式提出请求，另一方按规定格式给出答复，双方都能看懂对方在说什么。

> 🇯🇵 HTTPとは、ブラウザ（あるいは任意のクライアント）とサーバーの間で「電話をかける」ときに使う決まった言い回しのようなものです。片方が規定のフォーマットでリクエストを出し、もう片方が規定のフォーマットで返答をする——お互いに相手が何を言っているのか理解できます。

## 为什么需要它 ／ なぜ必要なのか
从这一章开始，我们正式进入"Web 开发"的世界。不管你之后用 Servlet 还是 Spring Boot 写后端，本质上都是在做同一件事：**接收一个 HTTP 请求，返回一个 HTTP 响应**。如果不先搞懂 HTTP 报文长什么样、每个部分是干什么用的，后面学 `@GetMapping`、`@RequestParam`、`@RequestBody` 这些注解时，就只能死记硬背"这个注解要这样写"，却不知道它们到底在处理报文里的哪一部分。这一章不涉及任何 Java 代码，纯粹是"看懂协议"，是后面所有 Web 章节的地基。

> 🇯🇵 この章から、私たちは正式に「Web開発」の世界に入ります。今後Servletを使うにしろSpring Bootを使ってバックエンドを書くにしろ、本質的にやっていることは同じです——**HTTPリクエストを受け取り、HTTPレスポンスを返す**ことです。まずHTTPメッセージがどんな形をしていて、各部分が何のためにあるのかを理解しておかなければ、この先 `@GetMapping`、`@RequestParam`、`@RequestBody` といったアノテーションを学ぶときに、「このアノテーションはこう書くものだ」と丸暗記するしかなく、それらが実際にメッセージのどの部分を処理しているのか分からないままになってしまいます。この章はJavaのコードを一切扱わず、純粋に「プロトコルを読み解く」ことに専念します。これは、この先のすべてのWeb関連の章の土台になります。

## 核心概念 ／ コアコンセプト

| 术语 ／ 用語 | 含义 ／ 意味 |
|---|---|
| HTTP（HyperText Transfer Protocol） | 超文本传输协议，浏览器和服务器之间约定好的一套"通信规则"<br><span class="ja-inline">🇯🇵 ハイパーテキスト転送プロトコル。ブラウザとサーバーの間で取り決められた「通信ルール」の一式です </span>|
| URL | 统一资源定位符，说明"资源在哪"，比如 `http://localhost:8080/users/10`<br><span class="ja-inline">🇯🇵 統一資源位置指定子（Uniform Resource Locator）。「リソースがどこにあるか」を示します。例えば `http://localhost:8080/users/10` のようなものです </span>|
| URI | 统一资源标识符，比 URL 范围更大（URL 是 URI 的一种）；日常开发中经常把两者混用，不用过分纠结区别<br><span class="ja-inline">🇯🇵 統一資源識別子（Uniform Resource Identifier）。URLよりも広い概念です（URLはURIの一種）。日常の開発では両者を混同して使うことも多く、あまり細かい区別にこだわる必要はありません </span>|
| Method（请求方法） | 说明"想对资源做什么"，比如 GET（查）、POST（增）<br><span class="ja-inline">🇯🇵 「リソースに対して何をしたいか」を表します。例えばGET（参照）、POST（追加）などです </span>|
| Header（请求头/响应头） | 一组"附加说明"，用 `名字: 值` 的形式描述这次通信的元信息<br><span class="ja-inline">🇯🇵 一連の「付加情報」で、`名前: 値` の形式でこの通信のメタ情報を記述します </span>|
| Query Parameter（查询参数） | 拼在 URL 问号后面的键值对，用来传递一些简单的筛选/附加条件<br><span class="ja-inline">🇯🇵 URLの疑問符の後ろに付けるキーと値のペアで、簡単な絞り込み条件や付加条件を伝えるために使います </span>|
| Body（请求体/响应体） | 真正要传输的数据内容，GET 请求通常没有 Body，POST/PUT 经常带 Body<br><span class="ja-inline">🇯🇵 実際に転送したいデータの内容です。GETリクエストには通常Bodyがなく、POST/PUTにはよくBodyが付きます </span>|
| 状态码（Status Code） | 服务器用一个三位数字告诉客户端"这次请求处理得怎么样"<br><span class="ja-inline">🇯🇵 サーバーが3桁の数字でクライアントに「今回のリクエストの処理結果はどうだったか」を伝えるものです </span>|

## 图解 ／ 図解

先建立最顶层的模型，这是本章、乃至后面十几章反复会用到的一张图：

> 🇯🇵 まず最も大局的なモデルを頭に入れましょう。この図は本章だけでなく、この先十数章にわたって繰り返し登場します。

```
Browser（浏览器 / 客户端）
      │
      │  ① 发出 HTTP Request（说明：我要什么资源，用什么方法）
      ▼
   Server（服务器）
      │
      │  ② 处理请求，准备好数据
      │
      ▼
Browser（浏览器 / 客户端）
      ▲
      │  ③ 收到 HTTP Response（说明：处理结果如何，数据是什么）
      └──────────────────────
```

一次完整的网页访问、一次 App 拉数据、一次 Postman 测试接口，本质上都是"发一个 Request，收一个 Response"的重复。后面章节要学的 Servlet、Tomcat、DispatcherServlet、Controller，全都是**服务器内部**如何处理这个 Request、组装这个 Response 的细节，先把最外层这张图刻在脑子里。

> 🇯🇵 1回の完全なWebページアクセス、1回のアプリのデータ取得、1回のPostmanでのAPIテスト——これらは本質的にすべて「1回のRequestを送り、1回のResponseを受け取る」という動作の繰り返しです。この先の章で学ぶServlet、Tomcat、DispatcherServlet、Controller（コントローラー）は、いずれも**サーバー内部**がこのRequestをどう処理し、Responseをどう組み立てるかという詳細に過ぎません。まずはこの最も外側の図をしっかり頭に刻んでおきましょう。

## 最小示例 ／ 最小限のサンプル

### 一条真实的请求报文 ／ 実際のリクエストメッセージ

假设浏览器要查询 id 为 10 的用户，并且要求以 JSON 格式返回详情，报文长这样：

> 🇯🇵 ブラウザがid=10のユーザーを検索し、詳細をJSON形式で返してほしいとします。メッセージは次のような形になります。

```
GET /users/10?detail=true HTTP/1.1
Host: localhost:8080
Accept: application/json
```

逐项拆解：

> 🇯🇵 各部分を分解して見てみましょう。

| 部分 ／ 部分 | 内容 ／ 内容 | 说明 ／ 説明 |
|---|---|---|
| 请求行第一段 ／ リクエスト行の第1部分 | `GET` | Method，说明这是一次"查询"操作<br><span class="ja-inline">🇯🇵 Method（メソッド）。これが「参照」操作であることを示します </span>|
| 请求行第二段 ／ リクエスト行の第2部分 | `/users/10?detail=true` | 这是 URI；其中 `/users/10` 是路径部分，`?detail=true` 是 Query Parameter 部分<br><span class="ja-inline">🇯🇵 これはURIです。`/users/10` はパス部分、`?detail=true` はQuery Parameter部分です </span>|
| 请求行第三段 ／ リクエスト行の第3部分 | `HTTP/1.1` | 使用的协议版本<br><span class="ja-inline">🇯🇵 使用しているプロトコルのバージョン </span>|
| `Host: localhost:8080` | Header 之一 ／ Headerの一つ | 告诉服务器"我要访问哪台主机的哪个端口"，`localhost` 是本机地址，`8080` 是端口号<br><span class="ja-inline">🇯🇵 サーバーに「どのホストのどのポートにアクセスしたいか」を伝えます。`localhost` は自分自身のアドレス、`8080` はポート番号です </span>|
| `Accept: application/json` | Header 之一 ／ Headerの一つ | 告诉服务器"我希望你返回 JSON 格式的数据"（而不是网页 HTML）<br><span class="ja-inline">🇯🇵 サーバーに「JSON形式のデータを返してほしい」（HTMLのページではなく）と伝えます </span>|

把 URL 拆开看会更直观：

> 🇯🇵 URLを分解して見ると、より直感的に理解できます。

```
http://localhost:8080/users/10?detail=true
└─┬─┘   └────┬─────┘└───┬────┘└─────┬────┘
 协议        主机+端口     路径      Query Parameter
```

- **URL/URI**：整个 `http://localhost:8080/users/10?detail=true` 就是这次请求的资源定位符，说明"我要访问的东西在哪"。<br><span class="ja-inline">🇯🇵 **URL/URI**：`http://localhost:8080/users/10?detail=true` 全体が、今回のリクエストのリソースの位置を示す識別子であり、「アクセスしたいものがどこにあるか」を表します。</span>
- **路径（Path）**：`/users/10` 表示"我要访问的资源是 users 里 id 为 10 的那一个"。<br><span class="ja-inline">🇯🇵 **路径（パス、Path）**：`/users/10` は「アクセスしたいリソースは users の中のid=10のものだ」ということを表します。</span>
- **Query Parameter**：`?` 后面的 `detail=true` 是附加条件，意思是"顺便告诉你我想要详细信息"。多个参数之间用 `&` 连接，比如 `?detail=true&lang=zh`。<br><span class="ja-inline">🇯🇵 **Query Parameter**：`?` の後ろの `detail=true` は付加条件で、「ついでに詳細情報が欲しいと伝える」という意味です。複数のパラメータは `&` でつなぎます。例えば `?detail=true&lang=zh` のようになります。</span>
- **Method**：这里是 `GET`，表示"只是查询，不修改任何数据"。<br><span class="ja-inline">🇯🇵 **Method**：ここでは `GET` で、「単に参照するだけで、いかなるデータも変更しない」ことを表します。</span>
- **Header**：`Host` 和 `Accept` 都是 Header，格式统一是"名字: 值"，一次请求可以带很多个 Header。<br><span class="ja-inline">🇯🇵 **Header**：`Host` と `Accept` はどちらもHeaderで、フォーマットは統一して「名前: 値」の形です。1回のリクエストに多数のHeaderを付けることができます。</span>

### 一条真实的响应报文 ／ 実際のレスポンスメッセージ

服务器处理完这个请求后，可能会返回：

> 🇯🇵 サーバーがこのリクエストを処理した後、次のように返すことがあります。

```
HTTP/1.1 200 OK
Content-Type: application/json

{
  "id": 10,
  "name": "Tom"
}
```

逐项拆解：

> 🇯🇵 各部分を分解して見てみましょう。

| 部分 ／ 部分 | 内容 ／ 内容 | 说明 ／ 説明 |
|---|---|---|
| 状态行第一段 ／ ステータス行の第1部分 | `HTTP/1.1` | 协议版本<br><span class="ja-inline">🇯🇵 プロトコルのバージョン </span>|
| 状态行第二段 ／ ステータス行の第2部分 | `200` | 状态码，`200` 代表"成功"<br><span class="ja-inline">🇯🇵 状态码（ステータスコード）。`200` は「成功」を表します </span>|
| 状态行第三段 ／ ステータス行の第3部分 | `OK` | 状态码对应的文字说明，纯粹给人看，程序一般只看数字<br><span class="ja-inline">🇯🇵 ステータスコードに対応する文字での説明で、純粋に人が見るためのものです。プログラムは通常数字だけを見ます </span>|
| `Content-Type: application/json` | Header ／ Header | 告诉客户端"我返回的 Body 是 JSON 格式的"，客户端据此决定用什么方式解析后面的内容<br><span class="ja-inline">🇯🇵 クライアントに「返すBodyはJSON形式だ」と伝えます。クライアントはこれをもとに後続の内容をどう解析するかを決めます </span>|
| 空行 ／ 空行 | —— | Header 和 Body 之间必须用一个空行隔开，这是 HTTP 报文的固定格式<br><span class="ja-inline">🇯🇵 HeaderとBodyの間は必ず1行の空行で区切らなければなりません。これはHTTPメッセージの固定フォーマットです </span>|
| `{ "id": 10, "name": "Tom" }` | Body ／ Body | 真正的数据内容，这里是一段 **JSON**（JavaScript Object Notation，一种用"键值对"描述数据的通用文本格式，几乎是现在前后端交互的标配）<br><span class="ja-inline">🇯🇵 実際のデータ内容です。ここでは **JSON**（JavaScript Object Notation、「キーと値のペア」でデータを記述する汎用的なテキスト形式で、現在のフロントエンド・バックエンド間のやり取りではほぼ標準になっています）となっています </span>|

## 代码逐行解释 ／ コードの行ごとの解説

这一章没有 Java 代码，我们把上面两段报文再串起来看一遍完整的因果关系：

> 🇯🇵 この章にはJavaのコードはありません。上記2つのメッセージをつなげて、一連の因果関係をもう一度見てみましょう。

1. 客户端想查看 id=10 的用户详情，于是拼出 URL `http://localhost:8080/users/10?detail=true`，决定用 `GET` 方法（因为只是查询）。<br><span class="ja-inline">🇯🇵 クライアントはid=10のユーザーの詳細を見たいので、URL `http://localhost:8080/users/10?detail=true` を組み立て、`GET` メソッドを使うことにします（単なる参照だからです）。</span>
2. 客户端把这次请求的元信息写进 Header：`Host` 告诉服务器要连哪台机器，`Accept` 告诉服务器"我希望你用 JSON 格式回答我"。<br><span class="ja-inline">🇯🇵 クライアントは今回のリクエストのメタ情報をHeaderに書き込みます。`Host` はサーバーにどのマシンに接続するかを伝え、`Accept` はサーバーに「JSON形式で答えてほしい」と伝えます。</span>
3. 因为是 `GET` 查询，不需要携带额外的数据体，所以这次请求**没有 Body**——需要传的信息（`10` 和 `detail=true`）已经写在 URL 里了。<br><span class="ja-inline">🇯🇵 `GET` での参照なので、追加のデータ本体を携える必要はなく、今回のリクエストには**Bodyがありません**——伝えたい情報（`10` と `detail=true`）はすでにURLの中に書かれています。</span>
4. 服务器收到请求后，按 URL 和 Method 找到对应的处理逻辑（这部分从下一章 Servlet 开始学），查到用户信息。<br><span class="ja-inline">🇯🇵 サーバーはリクエストを受け取ると、URLとMethodに応じて対応する処理ロジック（この部分は次の章のServletから学びます）を見つけ、ユーザー情報を検索します。</span>
5. 服务器把处理结果封装进响应：状态码 `200` 表示"一切正常"，`Content-Type: application/json` 表示"接下来的 Body 是 JSON"，Body 里放着 `{ "id": 10, "name": "Tom" }`。<br><span class="ja-inline">🇯🇵 サーバーは処理結果をレスポンスにまとめます。ステータスコード `200` は「すべて正常」を表し、`Content-Type: application/json` は「これから続くBodyはJSONだ」を表し、Bodyには `{ "id": 10, "name": "Tom" }` が入っています。</span>
6. 客户端收到响应，先看状态码判断是否成功，再根据 `Content-Type` 决定怎么解析 Body，最终拿到 `id` 和 `name` 两个字段的值。<br><span class="ja-inline">🇯🇵 クライアントはレスポンスを受け取ると、まずステータスコードを見て成功したかどうかを判断し、次に `Content-Type` に応じてBodyの解析方法を決め、最終的に `id` と `name` という2つのフィールドの値を取得します。</span>

## 程序运行过程 ／ プログラムの実行の流れ

把"浏览器/客户端 → HTTP Request → 服务器 → HTTP Response"这张图，套到这个具体例子上：

> 🇯🇵 「ブラウザ/クライアント → HTTP Request → サーバー → HTTP Response」という図を、この具体的な例に当てはめてみましょう。

```
浏览器
  │  组装 Request：
  │    GET /users/10?detail=true HTTP/1.1
  │    Host: localhost:8080
  │    Accept: application/json
  ▼
服务器（localhost:8080）
  │  读取 Method（GET）+ 路径（/users/10）+ Query（detail=true）
  │  内部查到 id=10 的用户数据
  │  组装 Response：
  │    HTTP/1.1 200 OK
  │    Content-Type: application/json
  │
  │    { "id": 10, "name": "Tom" }
  ▼
浏览器
  收到响应，先看状态码 200（成功），
  再按 Content-Type 把 Body 当 JSON 解析，
  拿到 name = "Tom"
```

这里的"服务器内部怎么根据路径找到该执行哪段代码"，正是接下来几章要讲的 Servlet、Tomcat、Spring MVC 的核心内容，本章先只关心"报文长什么样"。

> 🇯🇵 ここでの「サーバー内部がパスに応じてどのコードを実行すべきか、どうやって見つけるのか」という部分は、まさにこの先の章で説明するServlet、Tomcat、Spring MVCの核心的な内容です。本章ではまず「メッセージがどんな形をしているか」だけに注目します。

### GET / POST / PUT / PATCH / DELETE：五个方法的语义 ／ 5つのメソッドの意味

HTTP 定义了很多方法，但 Web 开发里最常用的是这五个，它们的区别不是"技术上能不能做同一件事"（技术上确实都能塞数据），而是**约定俗成的语义**——大家看到某个方法，就知道你想干什么：

> 🇯🇵 HTTPには多くのメソッドが定義されていますが、Web開発で最もよく使うのはこの5つです。これらの違いは「技術的に同じことができるかどうか」（技術的には確かにどれもデータを送ることができます）ではなく、**慣習として定着した意味**にあります——誰かが特定のメソッドを見れば、あなたが何をしたいのか分かるのです。

| 方法 ／ メソッド | 语义 ／ 意味 | 典型场景 ／ 典型的な場面 |
|---|---|---|
| `GET` | 查询资源，不应该修改任何数据<br><span class="ja-inline">🇯🇵 リソースを参照する。いかなるデータも変更してはいけません </span>| 查看用户列表、查看某个用户详情<br><span class="ja-inline">🇯🇵 ユーザー一覧の閲覧、あるユーザーの詳細の閲覧 </span>|
| `POST` | 新增一个资源<br><span class="ja-inline">🇯🇵 リソースを新規追加する </span>| 注册一个新用户、创建一条新订单<br><span class="ja-inline">🇯🇵 新規ユーザーの登録、新しい注文の作成 </span>|
| `PUT` | 整体替换/更新一个资源（通常要求把所有字段都传一遍）<br><span class="ja-inline">🇯🇵 リソースを全体的に置き換え/更新する（通常はすべてのフィールドを渡す必要がある） </span>| 把某个用户的全部信息覆盖更新<br><span class="ja-inline">🇯🇵 あるユーザーの全情報を上書き更新する </span>|
| `PATCH` | 部分更新一个资源（只传要改的字段）<br><span class="ja-inline">🇯🇵 リソースを部分的に更新する（変更したいフィールドだけを渡す） </span>| 只修改用户的昵称，其它字段不动<br><span class="ja-inline">🇯🇵 ユーザーのニックネームだけを変更し、他のフィールドはそのままにする </span>|
| `DELETE` | 删除一个资源<br><span class="ja-inline">🇯🇵 リソースを削除する </span>| 删除某个用户<br><span class="ja-inline">🇯🇵 あるユーザーを削除する </span>|

记忆技巧：可以把这五个方法对应到最常见的"增删改查"（CRUD）——`POST` 对应"增"，`GET` 对应"查"，`PUT`/`PATCH` 对应"改"，`DELETE` 对应"删"。第 22 章讲 RESTful API 设计时，会详细讲怎么用这五个方法 + 资源式 URL 设计一整套接口。

> 🇯🇵 記憶のコツ：この5つのメソッドを最もよく使う「CRUD」（作成・参照・更新・削除）に対応させることができます——`POST` は「作成」、`GET` は「参照」、`PUT`/`PATCH` は「更新」、`DELETE` は「削除」に対応します。第22章でRESTful API設計を学ぶ際に、この5つのメソッドとリソース指向のURL設計を使って一式のAPIを設計する方法を詳しく説明します。

### 常见状态码：服务器在告诉你什么 ／ よくあるステータスコード：サーバーが何を伝えているか

状态码按第一位数字分类：`2xx` 成功、`4xx` 客户端的错、`5xx` 服务器的错。零基础阶段先记住这几个最常见的：

> 🇯🇵 ステータスコードは先頭の数字で分類されます。`2xx` は成功、`4xx` はクライアント側のエラー、`5xx` はサーバー側のエラーです。初心者の段階ではまずこの最もよく使うものを覚えておきましょう。

| 状态码 ／ ステータスコード | 含义 ／ 意味 | 大致场景 ／ おおよその場面 |
|---|---|---|
| `200 OK` | 成功<br><span class="ja-inline">🇯🇵 成功 </span>| 最常见的"一切正常"，GET 查询成功、更新成功都可能用它<br><span class="ja-inline">🇯🇵 最もよくある「すべて正常」で、GETの参照成功や更新成功にも使われます </span>|
| `201 Created` | 创建成功<br><span class="ja-inline">🇯🇵 作成成功 </span>| `POST` 新增资源成功后，规范的做法是返回 `201` 而不是 `200`<br><span class="ja-inline">🇯🇵 `POST` でリソースの新規作成に成功した後、規範的なやり方は `200` ではなく `201` を返すことです </span>|
| `204 No Content` | 成功但没有内容返回<br><span class="ja-inline">🇯🇵 成功したが返す内容がない </span>| 比如 `DELETE` 删除成功，不需要再返回被删的数据<br><span class="ja-inline">🇯🇵 例えば `DELETE` の削除成功時、削除されたデータを返す必要はありません </span>|
| `400 Bad Request` | 客户端传的参数有问题<br><span class="ja-inline">🇯🇵 クライアントが渡したパラメータに問題がある </span>| 必填字段没传、参数格式不对（比如把字符串传给了要求数字的字段）<br><span class="ja-inline">🇯🇵 必須項目が渡されていない、パラメータの形式が不正（例えば数値が必要なフィールドに文字列を渡した） </span>|
| `401 Unauthorized` | 没有登录 / 身份未验证<br><span class="ja-inline">🇯🇵 ログインしていない／認証されていない </span>| 访问需要登录的接口，但没带有效的登录凭证<br><span class="ja-inline">🇯🇵 ログインが必要なAPIにアクセスしたが、有効なログイン情報を持っていない </span>|
| `403 Forbidden` | 已经知道你是谁，但你没权限<br><span class="ja-inline">🇯🇵 あなたが誰かは分かっているが、権限がない </span>| 普通用户想访问管理员专属的接口<br><span class="ja-inline">🇯🇵 一般ユーザーが管理者専用のAPIにアクセスしようとする </span>|
| `404 Not Found` | 找不到资源<br><span class="ja-inline">🇯🇵 リソースが見つからない </span>| 访问了不存在的用户 id，或者 URL 本身写错了<br><span class="ja-inline">🇯🇵 存在しないユーザーidにアクセスした、あるいはURL自体が間違っている </span>|
| `409 Conflict` | 请求和当前资源状态冲突<br><span class="ja-inline">🇯🇵 リクエストが現在のリソースの状態と競合している </span>| 注册时用户名已经被占用<br><span class="ja-inline">🇯🇵 登録時にユーザー名がすでに使われている </span>|
| `500 Internal Server Error` | 服务器自己出错了<br><span class="ja-inline">🇯🇵 サーバー自身にエラーが発生した </span>| 代码抛了未处理的异常、数据库连接失败等<br><span class="ja-inline">🇯🇵 コードが未処理の例外を投げた、データベース接続に失敗したなど </span>|

`4xx` 系列的潜台词是"你（客户端）传的东西有问题"，`5xx` 系列的潜台词是"是我（服务器）自己没处理好"，这个区分在后面第 32 章讲全局异常处理时会非常关键——我们要保证程序自己的 bug 不要包装成看起来像用户错误的状态码，反之亦然。

> 🇯🇵 `4xx` 系列の裏の意味は「あなた（クライアント）が渡したものに問題がある」ということで、`5xx` 系列の裏の意味は「私（サーバー）自身の処理がうまくいかなかった」ということです。この区別は、後の第32章でグローバル例外処理を学ぶ際に非常に重要になります——プログラム自身のバグをユーザーのエラーに見えるステータスコードで包んでしまわないように、またその逆も起こらないようにしなければなりません。

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 把该放 URL 里的参数硬塞进 Body，或者反过来<br><span class="ja-inline">🇯🇵 URLに入れるべきパラメータを無理やりBodyに詰め込む、あるいはその逆 </span>| 没搞清楚 Query Parameter 和 Body 的定位差异<br><span class="ja-inline">🇯🇵 Query ParameterとBodyの位置づけの違いを理解できていない </span>| 简单筛选/定位类的参数（比如分页的 page、size，查询条件）放 Query Parameter；成块的、复杂的数据（比如一个完整的用户信息）放 Body<br><span class="ja-inline">🇯🇵 簡単な絞り込みや特定用のパラメータ（例えばページネーションの page、size、検索条件）はQuery Parameterに置き、まとまった複雑なデータ（例えば完全なユーザー情報）はBodyに置く </span>|
| 以为状态码只是"给人看的提示文字"<br><span class="ja-inline">🇯🇵 ステータスコードは単に「人が見るための説明文」だと思い込む </span>| 只看响应里的文字说明，没有用状态码本身做逻辑判断<br><span class="ja-inline">🇯🇵 レスポンスの文字説明だけを見て、ステータスコード自体でロジックの判断をしていない </span>| 客户端代码应该先判断状态码（比如 `res.status === 200`），再决定怎么处理返回内容，这是后面第 33 章 `fetch()` 调用接口时的标准写法<br><span class="ja-inline">🇯🇵 クライアントのコードはまずステータスコード（例えば `res.status === 200`）を判定し、それから返された内容の処理方法を決めるべきです。これは後の第33章で `fetch()` を使ってAPIを呼び出すときの標準的な書き方です </span>|
| 混淆 `PUT` 和 `PATCH`<br><span class="ja-inline">🇯🇵 `PUT` と `PATCH` を混同する </span>| 以为它们完全一样，随便用<br><span class="ja-inline">🇯🇵 両者がまったく同じだと思い込み、適当に使う </span>| `PUT` 语义上是"整体替换"，`PATCH` 是"部分修改"；很多团队图省事全用 `PUT`，但理解语义差异有助于看懂规范的 API 文档<br><span class="ja-inline">🇯🇵 `PUT` の意味は「全体置き換え」、`PATCH` は「部分修正」です。多くのチームは手間を省くためにすべて `PUT` を使いますが、意味の違いを理解しておくことは、規範的なAPIドキュメントを読み解くのに役立ちます </span>|
| 以为 GET 请求完全不能带任何数据<br><span class="ja-inline">🇯🇵 GETリクエストはいかなるデータも持てないと思い込む </span>| 忽略了 Query Parameter 也是一种"带数据"的方式<br><span class="ja-inline">🇯🇵 Query Parameterも「データを持つ」方法の一つであることを見落としている </span>| GET 请求确实通常不带 Body，但可以通过 URL 路径和 Query Parameter 传递数据，这正是本章示例里 `/users/10?detail=true` 的写法<br><span class="ja-inline">🇯🇵 GETリクエストには確かに通常Bodyがありませんが、URLパスとQuery Parameterでデータを伝えることができます。これがまさに本章の例における `/users/10?detail=true` という書き方です </span>|

## 动手练习 ／ 演習

1. 打开浏览器，按 F12 打开开发者工具，切到 Network（网络）面板，随便访问一个网站，找到一条请求，观察它的 Method、Header、状态码分别是什么。<br><span class="ja-inline">🇯🇵 ブラウザを開き、F12キーで開発者ツールを開き、Network（ネットワーク）パネルに切り替えて、適当なWebサイトにアクセスし、1件のリクエストを見つけて、そのMethod、Header、ステータスコードがそれぞれ何かを観察してみましょう。</span>
2. 自己动手写一条"删除 id 为 5 的订单"的请求报文（只写请求行 + Host 这一个 Header 即可），思考应该用哪个 Method。<br><span class="ja-inline">🇯🇵 自分で「id=5の注文を削除する」というリクエストメッセージを書いてみましょう（リクエスト行と `Host` というHeader1つだけでかまいません）。どのMethodを使うべきか考えてみましょう。</span>
3. 假设你要设计一个"修改用户邮箱"的接口，思考应该用 `PUT` 还是 `PATCH`，并说出你的理由。<br><span class="ja-inline">🇯🇵 「ユーザーのメールアドレスを変更する」というAPIを設計するとしたら、`PUT` と `PATCH` のどちらを使うべきか考え、その理由を述べてみましょう。</span>

## 小测验 ／ 小テスト

1. Query Parameter 写在 URL 的哪个位置？用什么符号分隔多个参数？<br><span class="ja-inline">🇯🇵 Query ParameterはURLのどこに書きますか？複数のパラメータはどんな記号で区切りますか？</span>
2. `POST` 和 `PUT` 都能用来"改数据"，它们的语义区别是什么？<br><span class="ja-inline">🇯🇵 `POST` と `PUT` はどちらも「データを変更する」ために使えますが、意味の違いは何ですか？</span>
3. 用户传了一个格式错误的手机号，服务器应该返回 `4xx` 还是 `5xx`？为什么？<br><span class="ja-inline">🇯🇵 ユーザーが形式の誤った電話番号を渡してきた場合、サーバーは `4xx` と `5xx` のどちらを返すべきですか？それはなぜですか？</span>
4. Header 和 Body 之间用什么隔开？<br><span class="ja-inline">🇯🇵 HeaderとBodyの間は何で区切りますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. Query Parameter 写在 URL 的 `?` 之后，多个参数之间用 `&` 分隔，比如 `?page=1&size=10`。<br><span class="ja-inline">🇯🇵 Query ParameterはURLの `?` の後ろに書き、複数のパラメータは `&` で区切ります。例えば `?page=1&size=10` のようになります。</span>
2. `POST` 语义上是"新增一个资源"；`PUT` 语义上是"整体替换/更新一个已存在的资源"。虽然技术上两者都能拿来改数据，但规范的 API 设计会按语义区分使用场景。<br><span class="ja-inline">🇯🇵 `POST` の意味は「リソースを新規追加する」ことです。`PUT` の意味は「既存のリソースを全体的に置き換え/更新する」ことです。技術的にはどちらもデータの変更に使えますが、規範的なAPI設計では意味に応じて使用場面を区別します。</span>
3. 应该返回 `4xx`（比如 `400 Bad Request`），因为错误是客户端传的参数有问题，不是服务器自己出了故障。<br><span class="ja-inline">🇯🇵 `4xx`（例えば `400 Bad Request`）を返すべきです。なぜなら、エラーはクライアントが渡したパラメータに問題があるのであって、サーバー自身に故障が起きたわけではないからです。</span>
4. 用一个空行隔开，这是 HTTP 报文的固定格式。<br><span class="ja-inline">🇯🇵 1行の空行で区切ります。これはHTTPメッセージの固定フォーマットです。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经能看懂一条真实的 HTTP 请求和响应报文，理解了 URL、Method、Header、Query Parameter、Body、状态码各自的位置和作用，也记住了 GET/POST/PUT/PATCH/DELETE 的语义和几个最常见的状态码。下一章开始学习 Servlet 和 Tomcat——服务器内部到底是怎么"接住"这个 HTTP 请求、并且执行到你写的代码里的。

> 🇯🇵 これで実際のHTTPリクエストとレスポンスのメッセージを読み解けるようになり、URL、Method、Header、Query Parameter、Body、ステータスコードそれぞれの位置と役割を理解し、GET/POST/PUT/PATCH/DELETEの意味とよく使うステータスコードも覚えられました。次の章からはServletとTomcatを学びます——サーバー内部が実際にどうやってこのHTTPリクエストを「受け止め」て、あなたの書いたコードまで実行するのかを見ていきます。
