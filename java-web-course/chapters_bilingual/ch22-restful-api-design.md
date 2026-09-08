# 第 22 章　RESTful API 设计 ／ 第22章　RESTful API設計

## 本章目标 ／ 本章の目標
理解"资源""URI""HTTP Method""状态码"这几个概念是怎么组合成一套 URL 设计风格的；能按 REST 风格设计一组基本的增删改查接口；清楚地知道 REST 是约定而不是语法规则。

> 🇯🇵 「リソース（resource）」「URI」「HTTP Method（HTTPメソッド）」「状态码（ステータスコード）」といった概念がどのように組み合わさって一つのURL設計スタイルになるのかを理解します。REST（RESTful、リソース指向のAPI設計スタイル）のスタイルに沿って基本的なCRUD（作成・取得・更新・削除）インターフェースの一式を設計できるようになります。RESTが約束事であって文法規則ではないことをはっきり理解します。

## 一句话理解 ／ 一言で理解する
REST 说的是"用名词表示资源，用 HTTP 方法表示动作"——URL 里只写"是什么"（`/users`），"要干什么"交给 GET/POST/PUT/DELETE 去表达，而不是把动词也塞进 URL 里。

> 🇯🇵 RESTが言っているのは「名詞でリソースを表し、HTTPメソッドで動作を表す」ということです——URLには「それが何か」（`/users`）だけを書き、「何をするか」はGET/POST/PUT/DELETEに表現させます。動詞までURLに詰め込むことはしません。

## 为什么需要它 ／ なぜ必要なのか
第 20、21 章我们已经能写出能跑的 Controller 了，接口能用，但"能用"和"设计得好"是两回事。如果每个人写接口都随手起名字，团队协作起来会很痛苦：一个人写 `/getUser`，另一个人写 `/user/query`，还有人写 `/fetchUserInfo`——功能类似的接口，命名风格完全不统一，新人接手时得一个个去看代码才知道每个接口是干嘛的。RESTful 是业界总结出来的一套"大家都这么起名字"的约定，学会它，你的接口设计一眼就能被同行看懂。

> 🇯🇵 第20、21章ですでに動くControllerを書けるようになり、インターフェースは使えるようになりましたが、「使える」ことと「うまく設計されている」ことは別の話です。もし各人がインターフェースを思いつくままに名付けたら、チーム開発は非常に苦しくなります。ある人は `/getUser` と書き、別の人は `/user/query` と書き、さらに別の人は `/fetchUserInfo` と書く——似たような機能のインターフェースなのに命名スタイルがまったく統一されず、新しいメンバーが引き継ぐ際には一つ一つコードを見ないとどのインターフェースが何をしているのか分かりません。RESTfulは業界がまとめた「みんながこう名付ける」という約束事であり、これを学べば、あなたのインターフェース設計は同業者が一目で理解できるようになります。

## 核心概念 ／ コアコンセプト

### 22.1 资源（Resource） ／ リソース（Resource）

REST 的核心思想是：**把系统里的一切都看成"资源"**，资源通常对应一类"东西"，比如"用户"、"订单"、"文章"。资源用**名词**表示，而且通常用复数形式，比如 `users`、`orders`。

> 🇯🇵 RESTの核心的な考え方は：**システム内のあらゆるものを「リソース」として捉える**ことです。リソースは通常「モノ」の種類に対応します。例えば「ユーザー」「注文」「記事」などです。リソースは**名詞**で表し、通常は複数形を使います。例えば `users`、`orders` のようにです。

### 22.2 URI：资源的地址 ／ URI：リソースのアドレス

URI（可以先简单理解成 URL）用来定位一个资源或者一组资源：

> 🇯🇵 URI（まずはURLと同じものと簡単に理解して構いません）は、一つのリソースまたは一群のリソースを特定するために使われます。

- `/users`：所有用户这个"集合"<br><span class="ja-inline">🇯🇵 `/users`：すべてのユーザーという「集合」</span>
- `/users/1`：编号为 1 的这一个用户<br><span class="ja-inline">🇯🇵 `/users/1`：番号が1のこの一人のユーザー</span>

注意 URI 里**只出现名词，不出现动词**。"查询""新增""删除"这些动作，不应该写进 URL 里（比如不写 `/queryUsers`、`/deleteUser`），动作交给下面要讲的 HTTP Method 去表达。

> 🇯🇵 URIには**名詞だけが現れ、動詞は現れない**ことに注意してください。「検索」「新規追加」「削除」といった動作はURLに書き込むべきではありません（例えば `/queryUsers`、`/deleteUser` とは書きません）。動作はこの後説明する HTTP Method に表現させます。

### 22.3 HTTP Method：表达"要对资源做什么动作" ／ HTTP Method：「リソースに対して何の動作を行うか」を表す

同一个 URI，配合不同的 HTTP 方法，表示对这个资源做不同的操作：

> 🇯🇵 同じURIでも、異なるHTTPメソッドと組み合わせることで、このリソースに対する異なる操作を表します。

| HTTP Method | 语义 ／ 意味 | 例子 ／ 例 |
|---|---|---|
| `GET` | 查询，不会修改数据<br><span class="ja-inline">🇯🇵 検索（クエリ）で、データを変更しない </span>| `GET /users` 查所有用户，`GET /users/1` 查 1 号用户<br><span class="ja-inline">🇯🇵 `GET /users` はすべてのユーザーを検索し、`GET /users/1` は1番のユーザーを検索する </span>|
| `POST` | 新增一个资源<br><span class="ja-inline">🇯🇵 リソースを一つ新規作成する </span>| `POST /users`，请求体带上新用户的数据<br><span class="ja-inline">🇯🇵 `POST /users`、リクエストボディに新しいユーザーのデータを載せる </span>|
| `PUT` | 整体替换（更新）一个已有资源<br><span class="ja-inline">🇯🇵 既存のリソースを全体的に置き換える（更新する） </span>| `PUT /users/1`，请求体带上这个用户的完整新数据<br><span class="ja-inline">🇯🇵 `PUT /users/1`、リクエストボディにこのユーザーの完全な新しいデータを載せる </span>|
| `DELETE` | 删除一个资源<br><span class="ja-inline">🇯🇵 リソースを削除する </span>| `DELETE /users/1`<br><span class="ja-inline">🇯🇵 `DELETE /users/1` </span>|

把"资源"和"动作"分开之后，同一个 URI `/users/1` 配上不同方法，含义就完全不同：

> 🇯🇵 「リソース」と「動作」を分離すると、同じURI `/users/1` でも異なるメソッドと組み合わせることで、意味がまったく異なるものになります。

```
GET    /users        → 查询所有用户
GET    /users/{id}   → 查询某个用户
POST   /users        → 新增一个用户
PUT    /users/{id}   → 更新某个用户
DELETE /users/{id}   → 删除某个用户
```

这就是本章要求你记住并会用的一组标准写法。

> 🇯🇵 これがこの章で覚えて使いこなせるようになってほしい、標準的な書き方の一式です。

### 22.4 状态码：表达"结果怎么样" ／ ステータスコード：「結果がどうだったか」を表す

HTTP 状态码在第 10 章已经学过基础含义，这里结合 REST 接口再强调几个最常用的：

> 🇯🇵 HTTPステータスコードの基本的な意味は第10章ですでに学びました。ここではRESTインターフェースと絡めて、最もよく使うものをいくつか改めて強調します。

| 状态码 ／ ステータスコード | 含义 ／ 意味 | 典型场景 ／ 典型的なシーン |
|---|---|---|
| `200 OK` | 请求成功<br><span class="ja-inline">🇯🇵 リクエスト成功 </span>| `GET`/`PUT`/`DELETE` 成功<br><span class="ja-inline">🇯🇵 `GET`/`PUT`/`DELETE` の成功 </span>|
| `201 Created` | 创建成功<br><span class="ja-inline">🇯🇵 作成成功 </span>| `POST` 新增资源成功<br><span class="ja-inline">🇯🇵 `POST` によるリソースの新規作成成功 </span>|
| `400 Bad Request` | 请求参数有问题<br><span class="ja-inline">🇯🇵 リクエストパラメータに問題がある </span>| 前端传的数据格式不对<br><span class="ja-inline">🇯🇵 フロントエンドが送ったデータの形式が正しくない </span>|
| `404 Not Found` | 资源不存在<br><span class="ja-inline">🇯🇵 リソースが存在しない </span>| 查询一个不存在的用户 id<br><span class="ja-inline">🇯🇵 存在しないユーザーidを検索した場合 </span>|
| `500 Internal Server Error` | 服务器内部出错<br><span class="ja-inline">🇯🇵 サーバー内部エラー </span>| 代码抛了没处理的异常<br><span class="ja-inline">🇯🇵 コードが処理されていない例外をスローした場合 </span>|

状态码的精细控制（比如"用户不存在时怎么优雅地返回 404 而不是 500"）要用到全局异常处理，这是第 32 章的内容，这里先知道有这几个状态码、大致什么时候用即可。

> 🇯🇵 ステータスコードの細かい制御（例えば「ユーザーが存在しないときにどうすれば500ではなく404をエレガントに返せるか」）には、グローバル例外処理（全局异常处理）が必要になります。これは第32章の内容です。ここではまずこれらのステータスコードがあること、だいたいどんなときに使うのかを知っておけば十分です。

### 22.5 对比：不规范的设计长什么样 ／ 比較：規範に沿っていない設計とはどんなものか

把"动作"写进 URL、用 URL 表达动词，是最常见的反例：

> 🇯🇵 「動作」をURLに書き込み、URLで動詞を表現するのは、最もよくある悪い例です。

```
GET  /getUser?id=1        ← 动词 get 出现在 URL 里，是多余的
GET  /addUser              ← 用 GET 去做新增，语义和方法完全对不上
POST /deleteUser?id=1      ← 用 POST 去做删除，也是语义不匹配
```

这种写法的问题不是"跑不起来"——它完全可以正常工作，服务器该怎么处理还是怎么处理。问题在于：URL 里的动词和实际用的 HTTP 方法经常对不上（比如用 `GET` 实现"新增"），阅读代码或者接口文档的人没法只看一眼 URL 和方法就判断出这个接口在做什么，得每个都点开看实现。

> 🇯🇵 この書き方の問題は「動かない」ことではありません——完全に正常に動作し、サーバーはやるべき処理をきちんと行います。問題は、URLの中の動詞と実際に使うHTTPメソッドがしばしば一致しないこと（例えば `GET` で「新規追加」を実現するなど）で、コードやAPIドキュメントを読む人がURLとメソッドを一目見ただけではこのインターフェースが何をしているのか判断できず、一つ一つ実装を開いて見る必要が出てくることです。

### 22.6 REST 是风格，不是语法规则 ／ RESTはスタイルであり、文法規則ではない

这一点必须说清楚：**REST 是一种设计风格、一种团队协作的约定，不是 Java 或 Spring 强制要求的语法规则**。你完全可以继续写 `/getUser`、`/addUser` 这样的接口，Spring 不会因此报错，程序照样能跑起来、能被浏览器和 Postman 正常访问。

> 🇯🇵 この点ははっきりさせておかなければなりません。**RESTは一種の設計スタイルであり、チーム協業の約束事であって、JavaやSpringが強制する文法規則ではありません**。あなたは引き続き `/getUser`、`/addUser` のようなインターフェースを書き続けることも完全に可能で、Springはそれでエラーを出すことはなく、プログラムは変わらず動き、ブラウザやPostmanから正常にアクセスできます。

选择遵守 REST 风格，图的是：

> 🇯🇵 RESTスタイルに従うことを選ぶのは、次のことを狙ってのことです。

- 团队里的人一看 URL + Method 组合，就能猜到接口在干什么，不用每次都翻文档<br><span class="ja-inline">🇯🇵 チームの人がURL + Methodの組み合わせを見ただけで、インターフェースが何をしているか推測できるようになり、毎回ドキュメントをめくる必要がなくなる</span>
- 前后端约定接口时有一套通用语言，减少沟通成本<br><span class="ja-inline">🇯🇵 フロントエンドとバックエンドがインターフェースを取り決める際に共通の言語ができ、コミュニケーションコストが減る</span>
- 接口多了之后，命名依然保持统一、不混乱<br><span class="ja-inline">🇯🇵 インターフェースが増えても、命名が統一されたまま混乱しない</span>

也就是说，**不遵守 REST，代码能跑；遵守 REST，是为了让代码在"能跑"之外，还"好维护、好协作"**。这是本章最重要的一句话，请记住。

> 🇯🇵 つまり、**RESTに従わなくてもコードは動きます。RESTに従うのは、コードが「動く」ことに加えて「保守しやすく、協業しやすい」ようにするためです**。これがこの章で最も重要な一文なので、覚えておいてください。

### 22.7 补充一点：PUT 和 PATCH 的区别 ／ 補足：PUTとPATCHの違い

标准 HTTP 方法里还有一个 `PATCH`，很多人会跟 `PUT` 搞混：

> 🇯🇵 標準的なHTTPメソッドにはもう一つ `PATCH` というものがあり、多くの人が `PUT` と混同してしまいます。

- `PUT`：**整体替换**。请求体要带上这个资源完整的新数据，服务器用它整个覆盖掉原来的数据。<br><span class="ja-inline">🇯🇵 `PUT`：**全体を置き換える**。リクエストボディにこのリソースの完全な新しいデータを載せる必要があり、サーバーはそれを使って元のデータ全体を上書きします。</span>
- `PATCH`：**部分更新**。请求体只带你想改的那几个字段，其余字段保持不变。<br><span class="ja-inline">🇯🇵 `PATCH`：**部分的に更新する**。リクエストボディには変更したいいくつかのフィールドだけを載せ、残りのフィールドはそのまま変わりません。</span>

举例：一个用户有 `name` 和 `age` 两个字段，你只想改 `age`。用 `PUT` 的话，理论上请求体要把 `name` 和 `age` 都带上（哪怕 `name` 没变）；用 `PATCH` 的话，请求体只需要带 `{"age": 20}` 就够了。本教程后续项目里为了简化，主要使用 `PUT` 做更新，`PATCH` 你只需要知道它是干什么用的，点到为止，不深入展开。

> 🇯🇵 例：あるユーザーに `name` と `age` の2つのフィールドがあり、`age` だけを変更したいとします。`PUT` を使う場合、理論上はリクエストボディに `name` と `age` の両方を載せる必要があります（`name` が変わっていなくても）。`PATCH` を使う場合、リクエストボディには `{"age": 20}` だけ載せれば十分です。本チュートリアルでは以降のプロジェクトで簡潔にするため、主に `PUT` で更新を行います。`PATCH` については何のためのものかを知っておくだけで十分で、これ以上深く掘り下げません。

## 图解 ／ 図解

```
资源（名词）        +   HTTP Method（动作）   =    完整语义
/users                  GET                       查询所有用户
/users/{id}             GET                       查询某一个用户
/users                  POST                       新增一个用户
/users/{id}             PUT                        整体更新某个用户
/users/{id}             DELETE                     删除某个用户

           ✕ 反例：把动作硬塞进 URL
/getUser  /addUser  /deleteUser   ← URL 里出现动词，职责和 Method 重复/冲突
```

## 最小示例 ／ 最小限のサンプル

延续第 21 章的 `User` 类，按 REST 风格给出一组 Controller 方法框架（本章先看写法，完整可运行版本放在下一节 Project 2 里）：

> 🇯🇵 第21章の `User` クラスを引き継ぎ、RESTスタイルに沿ったControllerメソッドの骨組みの一式を示します（この章ではまず書き方を見るだけで、完全に動作するバージョンは次の節のProject 2にあります）。

```java
package com.example.userapi.controller;

import com.example.userapi.entity.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @GetMapping
    public List<User> listUsers() {
        // 对应 GET /users
        return null; // 具体实现见 Project 2
    }

    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        // 对应 GET /users/{id}
        return null;
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        // 对应 POST /users
        return null;
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User user) {
        // 对应 PUT /users/{id}
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        // 对应 DELETE /users/{id}
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `@RequestMapping("/users")`：写在类上，表示这个 Controller 里所有方法的 URL 都以 `/users` 开头，避免每个方法重复写一遍前缀。<br><span class="ja-inline">🇯🇵 `@RequestMapping("/users")`：クラスに書くことで、このControllerの全メソッドのURLが `/users` で始まることを示し、各メソッドで毎回接頭辞を書く手間を省きます。</span>
- `@GetMapping`（不带路径）：结合类上的 `/users`，完整路径是 `GET /users`，表示"查询所有用户"这个集合资源。<br><span class="ja-inline">🇯🇵 `@GetMapping`（パスなし）：クラスの `/users` と組み合わさって、完全なパスは `GET /users` となり、「すべてのユーザーを検索する」という集合リソースを表します。</span>
- `@GetMapping("/{id}")`：完整路径 `GET /users/{id}`，`{id}` 是路径变量（占位符），配合 `@PathVariable Long id` 把 URL 里的这一段取出来，赋给方法参数 `id`。<br><span class="ja-inline">🇯🇵 `@GetMapping("/{id}")`：完全なパスは `GET /users/{id}`、`{id}` はパス変数（プレースホルダー）で、`@PathVariable Long id` と組み合わせてURLのこの部分を取り出し、メソッドの引数 `id` に代入します。</span>
- `@PostMapping`：完整路径 `POST /users`，配合 `@RequestBody User user`，表示"新增一个用户，新用户的数据在请求体里"。<br><span class="ja-inline">🇯🇵 `@PostMapping`：完全なパスは `POST /users`、`@RequestBody User user` と組み合わせて「ユーザーを一人新規追加する、新しいユーザーのデータはリクエストボディにある」ことを表します。</span>
- `@PutMapping("/{id}")`：完整路径 `PUT /users/{id}`，同时用了 `@PathVariable`（从 URL 拿到"改哪一个"）和 `@RequestBody`（从请求体拿到"改成什么样"）。<br><span class="ja-inline">🇯🇵 `@PutMapping("/{id}")`：完全なパスは `PUT /users/{id}`、`@PathVariable`（URLから「どれを変更するか」を取得）と `@RequestBody`（リクエストボディから「どう変更するか」を取得）の両方を使っています。</span>
- `@DeleteMapping("/{id}")`：完整路径 `DELETE /users/{id}`，只需要知道删哪一个，不需要请求体。<br><span class="ja-inline">🇯🇵 `@DeleteMapping("/{id}")`：完全なパスは `DELETE /users/{id}`、どれを削除するかさえ分かればよく、リクエストボディは不要です。</span>

可以看到，**同一个资源前缀 `/users`，靠五个不同的 Method 注解就表达出了五种不同的操作**，这正是 REST 风格的核心体现。

> 🇯🇵 このように、**同じリソースの接頭辞 `/users` に対して、5つの異なるMethodアノテーションだけで5種類の異なる操作を表現できている**ことが分かります。これこそがRESTスタイルの核心的な表れです。

## 程序运行过程 ／ プログラムの実行の流れ

以 `GET /users/1` 为例：

> 🇯🇵 `GET /users/1` を例にします。

1. 浏览器（或 Postman）发起 `GET /users/1` 请求。<br><span class="ja-inline">🇯🇵 ブラウザ（またはPostman）が `GET /users/1` リクエストを発行します。</span>
2. Tomcat 接收请求，交给 `DispatcherServlet`。<br><span class="ja-inline">🇯🇵 Tomcatがリクエストを受け取り、`DispatcherServlet` に渡します。</span>
3. `HandlerMapping` 根据 URL 匹配到 `UserController` 里 `@GetMapping("/{id}")` 标注的 `getUser` 方法，并把 URL 里的 `1` 解析出来准备传给 `@PathVariable Long id`。<br><span class="ja-inline">🇯🇵 `HandlerMapping` はURLに基づいて `UserController` の `@GetMapping("/{id}")` が付いた `getUser` メソッドにマッチさせ、URLの中の `1` を解析して `@PathVariable Long id` に渡す準備をします。</span>
4. `HandlerAdapter` 调用 `getUser(1L)`。<br><span class="ja-inline">🇯🇵 `HandlerAdapter` が `getUser(1L)` を呼び出します。</span>
5. 方法内部去查找 id 为 1 的用户（下一章 Project 2 里会用 `List<User>` 实现），把结果对象返回。<br><span class="ja-inline">🇯🇵 メソッド内部でidが1のユーザーを検索し（次章のProject 2で `List<User>` を使って実装します）、結果のオブジェクトを返します。</span>
6. Spring 通过 `HttpMessageConverter`（内部是 Jackson，第 21 章讲过）把返回的 `User` 对象序列化成 JSON。<br><span class="ja-inline">🇯🇵 Springは `HttpMessageConverter`（内部はJackson、第21章で説明済み）を通じて、返された `User` オブジェクトをJSONにシリアライズします。</span>
7. JSON 文本作为响应体，原路返回给浏览器。<br><span class="ja-inline">🇯🇵 JSONテキストがレスポンスボディとして、元の経路でブラウザに返されます。</span>

**请求怎么找到这个 Controller？** 靠 `HandlerMapping` 根据"URL + HTTP Method"的组合去匹配——这也是为什么同一个 URL 前缀 `/users`，配上不同的 Method 注解，能对应到不同的方法上，互不冲突。

> 🇯🇵 **リクエストはどうやってこのControllerを見つけるのか？** `HandlerMapping` が「URL + HTTP Method」の組み合わせでマッチングを行うことによります——これが、同じURL接頭辞 `/users` でも、異なるMethodアノテーションと組み合わせることで、互いに衝突せず異なるメソッドに対応できる理由です。

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 访问 `GET /users/1` 报 404 | 方法上写成了 `@PostMapping` 之类别的 Method，Method 对不上<br><span class="ja-inline">🇯🇵 メソッドに `@PostMapping` など別のMethodが書かれていて、Methodが一致していない </span>| 确认注解和你实际发起请求用的 Method 一致<br><span class="ja-inline">🇯🇵 アノテーションと実際にリクエストで使うMethodが一致しているか確認する </span>|
| `@PathVariable Long id` 报错，取不到值 | 类上 `@RequestMapping` 或方法上 `@GetMapping` 里的占位符名字和参数名不一致，比如路径写的是 `{userId}` 但参数叫 `id`<br><span class="ja-inline">🇯🇵 クラスの `@RequestMapping` またはメソッドの `@GetMapping` のプレースホルダー名と引数名が一致していない。例えばパスは `{userId}` と書かれているのに引数は `id` という名前 </span>| 保证 `{}` 里的名字和参数名一致，或者用 `@PathVariable("userId") Long id` 显式指定<br><span class="ja-inline">🇯🇵 `{}` の中の名前と引数名を一致させるか、`@PathVariable("userId") Long id` のように明示的に指定する </span>|
| 两个方法都能匹配同一个 URL，报"发现冲突的映射" | 不同方法用了相同的 Method + 路径组合<br><span class="ja-inline">🇯🇵 異なるメソッドが同じMethod + パスの組み合わせを使っている </span>| 检查是不是重复定义了同一个 `GET /users` 之类的接口<br><span class="ja-inline">🇯🇵 同じ `GET /users` のようなインターフェースを重複して定義していないか確認する </span>|
| 团队里 URL 风格五花八门 | 没有统一约定，各写各的<br><span class="ja-inline">🇯🇵 統一された約束事がなく、各自が好き勝手に書いている </span>| 这正是本章要解决的问题——统一按资源 + Method 的方式设计<br><span class="ja-inline">🇯🇵 これはまさにこの章が解決したい問題です——リソース + Methodの方式に統一して設計する </span>|

## 动手练习 ／ 演習

1. 给上面的 `UserController` 补一个 `GET /users/{id}/name` 的接口，只返回这个用户的名字（字符串），思考一下这个设计是否还符合"资源是名词"的原则。<br><span class="ja-inline">🇯🇵 上の `UserController` に `GET /users/{id}/name` というインターフェースを追加し、このユーザーの名前（文字列）だけを返すようにして、この設計が「リソースは名詞である」という原則にまだ合っているかどうか考えてみましょう。</span>
2. 把 `deleteUser` 方法故意改成用 `@PostMapping("/{id}/delete")`，对比一下和 `@DeleteMapping("/{id})` 两种写法，哪个更符合本章讲的风格。<br><span class="ja-inline">🇯🇵 `deleteUser` メソッドをわざと `@PostMapping("/{id}/delete")` に変えてみて、`@DeleteMapping("/{id})` との2つの書き方を比較し、どちらがこの章で説明したスタイルによく合っているか考えましょう。</span>
3. 尝试写出"获取所有用户里状态为启用的那些"这个需求的 URL，思考应该设计成 `/users?status=enabled`（查询参数）还是单独起一个新 URL，说说你的理由。<br><span class="ja-inline">🇯🇵 「すべてのユーザーの中で状態が有効なものを取得する」という要件のURLを書いてみて、`/users?status=enabled`（クエリパラメータ）にすべきか、それとも別の新しいURLを立てるべきかを考え、その理由を説明しましょう。</span>

## 小测验 ／ 小テスト

1. REST 风格里，URL 应该出现名词还是动词？<br><span class="ja-inline">🇯🇵 RESTスタイルでは、URLには名詞と動詞のどちらが現れるべきですか？</span>
2. `PUT` 和 `PATCH` 的核心区别是什么？<br><span class="ja-inline">🇯🇵 `PUT` と `PATCH` の核心的な違いは何ですか？</span>
3. 如果团队里有人写了 `/deleteUser` 这样的接口，代码能不能正常运行？这样写主要的问题出在哪？<br><span class="ja-inline">🇯🇵 もしチームの誰かが `/deleteUser` のようなインターフェースを書いたら、コードは正常に動作しますか？このように書く主な問題はどこにありますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 应该出现名词（资源），动作交给 HTTP Method（GET/POST/PUT/DELETE）表达。<br><span class="ja-inline">🇯🇵 名詞（リソース）が現れるべきで、動作はHTTP Method（GET/POST/PUT/DELETE）に表現させます。</span>
2. `PUT` 是整体替换，请求体要带完整数据；`PATCH` 是部分更新，请求体只带要改的字段。<br><span class="ja-inline">🇯🇵 `PUT` は全体を置き換えるもので、リクエストボディに完全なデータを載せる必要があります。`PATCH` は部分更新で、リクエストボディには変更したいフィールドだけを載せます。</span>
3. 能正常运行，Spring 不会因为 URL 命名报错。问题在于团队协作和维护性变差：URL 里的动词和实际用的 HTTP Method 容易对不上，别人看代码/文档时不能一眼看懂接口语义，需要额外去翻实现。<br><span class="ja-inline">🇯🇵 正常に動作します。SpringはURLの命名によってエラーを出すことはありません。問題はチーム協業と保守性が悪くなることにあります。URLの中の動詞と実際に使うHTTP Methodが一致しにくくなり、他の人がコードやドキュメントを見てもインターフェースの意味を一目で理解できず、余分に実装を調べる必要が出てきます。</span>
</details>

## 本章总结 ／ 本章のまとめ
你现在知道了怎么用"资源 + HTTP Method + 状态码"组合出一套规范的 URL 设计，也清楚了 REST 只是一种协作约定而不是语法强制。下一节我们就用这套风格，动手实现一个完整的 Project 2：内存版 User API。

> 🇯🇵 これで「リソース + HTTP Method + ステータスコード」を組み合わせて規範に沿ったURL設計を行う方法が分かり、RESTが単なる協業上の約束事であって文法上の強制ではないこともはっきりしました。次の節では、このスタイルを使って完全なProject 2：メモリ版User APIを実際に実装します。
