# 第 21 章　JSON 与 Jackson ／ 第21章　JSONとJackson

## 本章目标 ／ 本章の目標
理解 Java 对象和 JSON 之间是怎么互相转换的；认识 Jackson 是什么、它在 Spring Boot 里扮演什么角色；分清"序列化"和"反序列化"这两个方向；知道为什么 POJO 类必须要有 getter/setter。

> 🇯🇵 Javaオブジェクトと JSON（JavaScript Object Notation、テキスト形式のデータ表現）が互いにどのように変換されるのかを理解します。Jackson（JavaのJSON処理ライブラリ）が何であり、Spring Bootの中でどんな役割を果たしているのかを知ります。「シリアライズ（serialization、直列化）」と「デシリアライズ（deserialization、逆直列化）」という2つの方向を区別します。POJOクラスにgetter/setterが必要な理由を理解します。

## 一句话理解 ／ 一言で理解する
浏览器和服务器之间传的是纯文本（JSON 字符串），而 Java 里跑的是对象；Jackson 就是那个在"文本"和"对象"之间来回搬运、自动翻译的工具。

> 🇯🇵 ブラウザとサーバーの間でやり取りされるのは純粋なテキスト（JSON文字列）ですが、Javaの中で動いているのはオブジェクトです。Jacksonは「テキスト」と「オブジェクト」の間を行き来し、自動的に変換してくれるツールです。

## 为什么需要它 ／ なぜ必要なのか
第 20 章我们写过一个 Controller 方法，返回值直接是一个 Java 对象，但浏览器收到的却是一段 JSON 文本，比如：

> 🇯🇵 第20章では、戻り値がそのままJavaオブジェクトであるControllerメソッドを書きました。しかしブラウザが受け取るのは以下のようなJSONテキストです。

```json
{"id": 1, "name": "Tom"}
```

中间这一步"Java 对象怎么变成这段文字"，上一章图里画的调用链只写了一个词——`HttpMessageConverter / Jackson`。这一章就是把这个黑箱打开，讲清楚它到底做了什么，这样你以后遇到"字段没转出来""JSON 里多了个字段""前端传的 JSON 收不到"这类问题，才知道从哪查起。

> 🇯🇵 「Javaオブジェクトがどのようにこの文字列になるのか」という中間ステップについて、前章の図では `HttpMessageConverter / Jackson` という一言しか書きませんでした。この章ではこのブラックボックスを開いて、実際に何をしているのかをはっきりさせます。そうすれば今後「フィールドが出力されない」「JSONに余計なフィールドがある」「フロントエンドが送ったJSONが受け取れない」といった問題に出会ったとき、どこから調べればいいか分かるようになります。

## 核心概念 ／ コアコンセプト

### 21.1 Jackson 是什么 ／ Jacksonとは何か

Jackson 是一个 Java 的 JSON 处理库，负责两件事：

> 🇯🇵 JacksonはJavaのJSON処理ライブラリで、2つのことを担当します。

- **把 Java 对象转成 JSON 文本**（写给别人看/用）<br><span class="ja-inline">🇯🇵 **Javaオブジェクトを JSON テキストに変換する**（他者に渡す/使ってもらうため）</span>
- **把 JSON 文本转成 Java 对象**（读别人传过来的数据）<br><span class="ja-inline">🇯🇵 **JSON テキストを Java オブジェクトに変換する**（相手から送られてきたデータを読み取るため）</span>

Spring Boot 默认已经把 Jackson 引进来了——只要你的项目里有 `spring-boot-starter-webmvc`（写 Controller 用的那个 starter），Jackson 就已经在依赖里了，不需要你自己再加一条 `<dependency>`。也正因为它是"默认自带、自动生效"的，很多初学者会觉得 JSON 转换是"Spring 自己变出来的魔法"，其实背后一直是 Jackson 在干活。

> 🇯🇵 Spring Bootはデフォルトですでに Jackson を取り込んでいます——プロジェクトに `spring-boot-starter-webmvc`（Controllerを書くために使うstarter）さえあれば、Jacksonはすでに依存関係に含まれているので、自分で `<dependency>` を追加する必要はありません。「デフォルトで組み込まれ、自動的に効いている」ものだからこそ、多くの初心者はJSON変換を「Springが自分で出してくれる魔法」だと思いがちですが、実際には裏でずっとJacksonが働いています。

### 21.2 序列化（Serialization）：Java 对象 → JSON ／ シリアライズ（serialization）：Javaオブジェクト → JSON

"序列化"这个词听起来抽象，但意思很朴素：**把一个结构化的东西，压扁成一串文本，方便存储或者传输**。

> 🇯🇵 「シリアライズ」という言葉は抽象的に聞こえますが、意味はとてもシンプルです。**構造化されたものを、保存や伝送がしやすいように一続きのテキストに「圧縮」することです**。

Java 对象是存在内存里的一块结构（有字段、有值），没法直接原样发给浏览器（浏览器又不认识 Java 的内存布局）。所以 Controller 方法返回一个对象后，Spring 会调用 Jackson，把这个对象"压扁"成一段 JSON 字符串，再放进 HTTP 响应体里发出去。这个"对象 → JSON 文本"的过程，就叫**序列化**。

> 🇯🇵 Javaオブジェクトはメモリ上に存在する構造（フィールドと値を持つもの）であり、そのままの形でブラウザに送ることはできません（ブラウザはJavaのメモリレイアウトを理解できません）。そのためControllerメソッドがオブジェクトを返した後、Springは Jackson を呼び出してこのオブジェクトを JSON文字列に「圧縮」し、それを HTTPレスポンスボディに入れて送信します。この「オブジェクト → JSONテキスト」というプロセスを**シリアライズ**と呼びます。

### 21.3 反序列化（Deserialization）：JSON → Java 对象 ／ デシリアライズ（deserialization）：JSON → Javaオブジェクト

方向反过来：前端通过 `POST`/`PUT` 请求，在请求体里带了一段 JSON 文本过来，比如：

> 🇯🇵 方向が逆になります。フロントエンドが `POST`/`PUT` リクエストを通じて、リクエストボディに以下のようなJSONテキストを載せて送ってきたとします。

```json
{"name": "Tom"}
```

Controller 方法的参数如果是一个 Java 对象（并加上 `@RequestBody` 注解），Spring 会先把请求体里的这段 JSON 文本交给 Jackson，Jackson 把它"撑开"还原成一个 Java 对象，再把这个对象作为参数传进你的方法里。这个"JSON 文本 → 对象"的过程，就叫**反序列化**。

> 🇯🇵 Controllerメソッドの引数がJavaオブジェクトで（かつ `@RequestBody` アノテーションが付いていれば）、Springはまずリクエストボディの中のこのJSONテキストを Jackson に渡し、Jacksonがそれを「展開」してJavaオブジェクトに復元し、そのオブジェクトを引数としてメソッドに渡します。この「JSONテキスト → オブジェクト」というプロセスを**デシリアライズ**と呼びます。

一句话记忆：**序列化是"对象变文字"，反序列化是"文字变对象"，方向正好相反。**

> 🇯🇵 一言で覚えるなら：**シリアライズは「オブジェクトが文字になる」、デシリアライズは「文字がオブジェクトになる」——方向がちょうど逆です。**

### 21.4 Jackson 靠什么知道字段名对应关系 ／ Jacksonはどうやってフィールド名の対応関係を知るのか

这是最容易被忽略、但特别关键的一点。Jackson 转换的时候，**看的不是你类里的字段名，而是 getter/setter 方法名**。

> 🇯🇵 これは見落とされがちですが、非常に重要なポイントです。Jacksonが変換を行う際に**見ているのはクラス内のフィールド名ではなく、getter/setterのメソッド名です**。

比如这个类：

> 🇯🇵 例えば次のクラスを見てみましょう。

```java
public class User {
    private Long id;
    private String name;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

序列化的时候，Jackson 会去找这个对象上所有形如 `getXxx()` 的方法：找到 `getId()`，就认为 JSON 里应该有一个字段叫 `"id"`；找到 `getName()`，就认为应该有一个字段叫 `"name"`（方法名去掉 `get` 前缀，首字母变小写）。所以最终生成的 JSON 是：

> 🇯🇵 シリアライズの際、Jacksonはこのオブジェクトにある `getXxx()` という形のメソッドをすべて探します。`getId()` を見つければ、JSONに `"id"` というフィールドがあるべきだと判断し、`getName()` を見つければ `"name"` というフィールドがあるべきだと判断します（メソッド名から `get` の接頭辞を取り除き、先頭を小文字にします）。そのため最終的に生成されるJSONは次のようになります。

```json
{"id": 1, "name": "Tom"}
```

反过来，反序列化的时候，Jackson 看到 JSON 里有 `"name"` 这个字段，就去找这个类里有没有 `setName(...)` 方法，找到了就调用它把值塞进去。

> 🇯🇵 逆に、デシリアライズの際にはJacksonはJSONの中に `"name"` というフィールドがあるのを見ると、このクラスに `setName(...)` メソッドがあるかを探し、見つかればそれを呼び出して値を代入します。

**这就是为什么 POJO 类必须要有 getter/setter：** 如果 `User` 类里没有 `getName()` 方法，Jackson 根本不知道 `name` 字段要不要输出、输出成什么名字；如果没有 `setName(...)` 方法，前端传来的 `name` 字段就没法赋值进这个对象，最终这个字段会保持默认值（比如 `null`）。字段本身是 `private` 的，Jackson 拿不到，它能"看见"的只有你暴露出来的这些方法。

> 🇯🇵 **これがPOJOクラスに必ずgetter/setterが必要な理由です。** もし `User` クラスに `getName()` メソッドがなければ、Jacksonは `name` フィールドを出力すべきかどうか、どんな名前で出力すべきかがまったく分かりません。`setName(...)` メソッドがなければ、フロントエンドから送られてきた `name` フィールドをこのオブジェクトに代入する方法がなく、最終的にこのフィールドはデフォルト値（例えば `null`）のままになります。フィールド自体は `private` なので、Jacksonはそこにアクセスできず、「見える」のはあなたが公開したこれらのメソッドだけです。

提前说一句：IDEA 可以自动生成 getter/setter（右键 → Generate），不用手写；后面用 Lombok 之类的工具还能进一步省掉这些样板代码，但那是后面的内容，这里先手写，理解原理最重要。

> 🇯🇵 先に一言：IDEAはgetter/setterを自動生成できます（右クリック → Generate）ので、手書きする必要はありません。今後 Lombok のようなツールを使えば、これらの定型コードをさらに省略できますが、それは後の内容です。ここではまず手書きして、仕組みを理解することが一番大切です。

## 图解 ／ 図解

```
【序列化：对象 → JSON，用于返回响应】

Controller 方法 return new User(1, "Tom")
        ↓
   Jackson 检查这个对象有哪些 getXxx() 方法
        ↓
   getId() → 字段名 "id"      getName() → 字段名 "name"
        ↓
   拼成 JSON 文本：{"id": 1, "name": "Tom"}
        ↓
   放进 HTTP 响应体，发给浏览器


【反序列化：JSON → 对象，用于接收 @RequestBody】

浏览器发来请求体：{"name": "Tom"}
        ↓
   Jackson 先 new 一个空的 User 对象
        ↓
   看到 JSON 里有 "name" 字段 → 找 setName(String) 方法并调用
        ↓
   得到一个 name="Tom" 的 User 对象
        ↓
   作为参数传进 Controller 方法
```

## 最小示例 ／ 最小限のサンプル

先准备好实体类 `User.java`：

> 🇯🇵 まずエンティティクラス `User.java` を用意します。

```java
package com.example.hello;

public class User {

    private Long id;
    private String name;

    public User() {
        // Jackson 反序列化时需要先创建一个空对象，
        // 所以必须保留一个无参构造方法
    }

    public User(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
```

序列化的例子（返回对象）：

> 🇯🇵 シリアライズの例（オブジェクトを返す）：

```java
package com.example.hello.controller;

import com.example.hello.User;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @GetMapping("/user")
    public User getUser() {
        return new User(1L, "Tom");
        // 方法返回这个 User 对象，
        // Jackson 会自动把它序列化成 JSON 写进响应体
    }
}
```

浏览器访问 `GET /user`，收到的响应体是：

> 🇯🇵 ブラウザが `GET /user` にアクセスすると、受け取るレスポンスボディは次のようになります。

```json
{"id": 1, "name": "Tom"}
```

反序列化的例子（接收对象）：

> 🇯🇵 デシリアライズの例（オブジェクトを受け取る）：

```java
package com.example.hello.controller;

import com.example.hello.User;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    @PostMapping("/user")
    public String createUser(@RequestBody User user) {
        // Jackson 把请求体里的 JSON 反序列化成 User 对象，
        // 再传给这个方法作为参数 user
        return "收到了：" + user.getName();
    }
}
```

用 Postman 发一个 `POST /user`，请求体（Body，选择 raw / JSON）填：

> 🇯🇵 Postmanで `POST /user` を送信し、リクエストボディ（Body、raw / JSONを選択）に次のように入力します。

```json
{"name": "Tom"}
```

响应：

> 🇯🇵 レスポンス：

```
收到了：Tom
```

## 代码逐行解释 ／ コードの行ごとの解説

- `public User() {}`：无参构造方法。Jackson 做反序列化时的第一步是"先 new 一个空对象出来"，如果类里只写了带参数的构造方法而没有无参构造方法，Jackson 默认情况下会转换失败（这也是一个常见错误，见下面"常见错误"）。<br><span class="ja-inline">🇯🇵 `public User() {}`：引数なしコンストラクタです。Jacksonがデシリアライズを行う際の最初のステップは「まず空のオブジェクトをnewする」ことです。クラスに引数ありコンストラクタしかなく、引数なしコンストラクタがない場合、Jacksonはデフォルトでは変換に失敗します（これもよくあるエラーの一つで、下の「よくあるエラー」を参照してください）。</span>
- `getId()` / `getName()`：Jackson 序列化时依赖的就是这些方法，方法名决定了 JSON 里字段的名字。<br><span class="ja-inline">🇯🇵 `getId()` / `getName()`：Jacksonがシリアライズする際に頼るのはこれらのメソッドで、メソッド名がJSONのフィールド名を決定します。</span>
- `setId(...)` / `setName(...)`：Jackson 反序列化时依赖的就是这些方法。<br><span class="ja-inline">🇯🇵 `setId(...)` / `setName(...)`：Jacksonがデシリアライズする際に頼るのはこれらのメソッドです。</span>
- `@RequestBody User user`：告诉 Spring "请求体里的 JSON 数据，请帮我转换成 `User` 类型，赋给参数 `user`"。没有这个注解，Spring 不会去解析请求体，`user` 参数拿到的不会是你期望的数据。<br><span class="ja-inline">🇯🇵 `@RequestBody User user`：Springに「リクエストボディのJSONデータを `User` 型に変換して、引数 `user` に代入してほしい」と伝えます。このアノテーションがなければ、Springはリクエストボディを解析しないため、`user` 引数は期待通りのデータを受け取れません。</span>
- `return new User(1L, "Tom");`：方法返回的是一个普通 Java 对象，不是字符串，也不是 JSON——转成 JSON 文本这一步，是 Spring 在方法返回之后自动帮你做的。<br><span class="ja-inline">🇯🇵 `return new User(1L, "Tom");`：メソッドが返しているのは普通のJavaオブジェクトであり、文字列でもJSONでもありません——JSONテキストに変換するステップは、メソッドが値を返した後にSpringが自動的に行ってくれます。</span>

## 程序运行过程 ／ プログラムの実行の流れ

以 `GET /user` 这个序列化的例子为例，串一遍完整调用链（第 20 章图的后半段）：

> 🇯🇵 `GET /user` というシリアライズの例をもとに、完全な呼び出しの流れを一通り追ってみましょう（第20章の図の後半部分に相当します）。

1. 浏览器发起 `GET /user` 请求。<br><span class="ja-inline">🇯🇵 ブラウザが `GET /user` リクエストを発行します。</span>
2. Tomcat 收到请求，交给 `DispatcherServlet`。<br><span class="ja-inline">🇯🇵 Tomcatがリクエストを受け取り、`DispatcherServlet` に渡します。</span>
3. `HandlerMapping` 根据 URL `/user` 找到 `UserController.getUser()` 这个方法。<br><span class="ja-inline">🇯🇵 `HandlerMapping` がURL `/user` に基づいて `UserController.getUser()` メソッドを見つけます。</span>
4. `HandlerAdapter` 调用这个方法。<br><span class="ja-inline">🇯🇵 `HandlerAdapter` がこのメソッドを呼び出します。</span>
5. 方法执行 `return new User(1L, "Tom");`，方法结束，返回值是一个 `User` 对象。<br><span class="ja-inline">🇯🇵 メソッドが `return new User(1L, "Tom");` を実行し終了します。戻り値は `User` オブジェクトです。</span>
6. Spring 发现这是一个 `@RestController`，返回值不需要跳转页面，而是要直接作为响应内容，于是把这个对象交给 `HttpMessageConverter`。<br><span class="ja-inline">🇯🇵 Springはこれが `@RestController` であることを確認し、戻り値はページ遷移ではなくレスポンス内容そのものとして扱う必要があるため、このオブジェクトを `HttpMessageConverter` に渡します。</span>
7. `HttpMessageConverter` 内部使用 Jackson，扫描 `User` 对象的 `getXxx()` 方法，把它序列化成 JSON 文本 `{"id": 1, "name": "Tom"}`。<br><span class="ja-inline">🇯🇵 `HttpMessageConverter` は内部でJacksonを使用し、`User` オブジェクトの `getXxx()` メソッドをスキャンして、JSONテキスト `{"id": 1, "name": "Tom"}` にシリアライズします。</span>
8. 这段 JSON 文本被放进 HTTP 响应体，原路返回给浏览器。<br><span class="ja-inline">🇯🇵 このJSONテキストはHTTPレスポンスボディに入れられ、元の経路でブラウザに返されます。</span>

再串一遍 `POST /user` 反序列化的例子：

> 🇯🇵 続いて `POST /user` のデシリアライズの例も一通り追ってみましょう。

1. 浏览器（或 Postman）发起 `POST /user`，请求体里带着 JSON 文本 `{"name": "Tom"}`。<br><span class="ja-inline">🇯🇵 ブラウザ（またはPostman）が `POST /user` を発行し、リクエストボディにJSONテキスト `{"name": "Tom"}` を載せます。</span>
2. 请求经过 Tomcat → `DispatcherServlet` → `HandlerMapping` 找到 `createUser` 方法。<br><span class="ja-inline">🇯🇵 リクエストは Tomcat → `DispatcherServlet` → `HandlerMapping` を経て `createUser` メソッドが見つかります。</span>
3. `HandlerAdapter` 在真正调用这个方法之前，发现参数 `user` 上有 `@RequestBody` 注解，于是先把请求体交给 Jackson。<br><span class="ja-inline">🇯🇵 `HandlerAdapter` は実際にこのメソッドを呼び出す前に、引数 `user` に `@RequestBody` アノテーションが付いていることを確認し、先にリクエストボディをJacksonに渡します。</span>
4. Jackson 反序列化：先 `new User()`，再根据 JSON 里的 `"name"` 字段调用 `setName("Tom")`，得到一个填好数据的 `User` 对象。<br><span class="ja-inline">🇯🇵 Jacksonがデシリアライズします。まず `new User()` を実行し、JSONの `"name"` フィールドに基づいて `setName("Tom")` を呼び出し、データが入った `User` オブジェクトを得ます。</span>
5. `HandlerAdapter` 拿着这个对象去调用 `createUser(user)`。<br><span class="ja-inline">🇯🇵 `HandlerAdapter` はこのオブジェクトを持って `createUser(user)` を呼び出します。</span>
6. 方法内部用 `user.getName()` 取出值，拼成字符串返回。<br><span class="ja-inline">🇯🇵 メソッド内部では `user.getName()` で値を取り出し、文字列に組み立てて返します。</span>
7. 返回值是 `String`，Jackson 对普通字符串不需要特殊处理，直接作为响应体文本返回给浏览器。<br><span class="ja-inline">🇯🇵 戻り値は `String` であり、Jacksonは通常の文字列に対して特別な処理を行う必要がないため、そのままレスポンスボディのテキストとしてブラウザに返されます。</span>

**Java 对象什么时候变成 JSON？** 答案：Controller 方法执行完毕、返回值确定之后，由 `HttpMessageConverter`（内部用 Jackson）在发送响应之前完成转换，你自己的业务代码里不需要手写任何转换逻辑。

> 🇯🇵 **JavaオブジェクトはいつJSONになるのか？** 答え：Controllerメソッドの実行が終わり戻り値が確定した後、`HttpMessageConverter`（内部でJacksonを使用）がレスポンスを送信する前に変換を完了します。自分のビジネスロジックのコードでは変換ロジックを一切手書きする必要はありません。

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 返回的 JSON 里少了某个字段 | 这个字段没有对应的 `getXxx()` 方法<br><span class="ja-inline">🇯🇵 このフィールドに対応する `getXxx()` メソッドがない </span>| 补上 getter；确认方法名拼写和大小写正确（`getName` 而不是 `getname`）<br><span class="ja-inline">🇯🇵 getterを追加する。メソッド名のスペルと大文字小文字が正しいか確認する（`getname` ではなく `getName`） </span>|
| `@RequestBody` 接收到的对象所有字段都是 `null` | 类里缺少无参构造方法，或者字段缺少对应的 `setXxx()` 方法<br><span class="ja-inline">🇯🇵 クラスに引数なしコンストラクタがない、またはフィールドに対応する `setXxx()` メソッドがない </span>| 保留一个无参构造方法；补齐 setter<br><span class="ja-inline">🇯🇵 引数なしコンストラクタを残す。setterを補う </span>|
| 报错 `Cannot construct instance of ...(no Creators, like default constructor, exist)` | 同上，Jackson 找不到无参构造方法<br><span class="ja-inline">🇯🇵 上と同じ、Jacksonが引数なしコンストラクタを見つけられない </span>| 给类加一个 `public User() {}`<br><span class="ja-inline">🇯🇵 クラスに `public User() {}` を追加する </span>|
| 请求体明明是 JSON，但接收方法的参数一直拿不到值 | 忘了加 `@RequestBody` 注解<br><span class="ja-inline">🇯🇵 `@RequestBody` アノテーションを付け忘れた </span>| Controller 方法参数上补上 `@RequestBody`<br><span class="ja-inline">🇯🇵 Controllerメソッドの引数に `@RequestBody` を追加する </span>|
| Postman 报服务端 415 错误（Unsupported Media Type） | 请求头 `Content-Type` 没有设置成 `application/json`<br><span class="ja-inline">🇯🇵 リクエストヘッダーの `Content-Type` が `application/json` に設定されていない </span>| Postman 里 Body 选 raw，右侧下拉选 JSON，会自动带上正确的请求头<br><span class="ja-inline">🇯🇵 Postmanで Body で raw を選び、右側のドロップダウンで JSON を選べば、正しいリクエストヘッダーが自動的に付与される </span>|

## 动手练习 ／ 演習

1. 在 `User` 类里再加一个 `email` 字段（带 getter/setter），重新访问 `GET /user`，观察 JSON 里是不是自动多了一个 `"email"` 字段。<br><span class="ja-inline">🇯🇵 `User` クラスに `email` フィールドを追加し（getter/setter付き）、`GET /user` に再アクセスして、JSONに `"email"` フィールドが自動的に増えているか観察しましょう。</span>
2. 故意把 `getName()` 改名成 `getUserName()`，不改字段名，重新运行，观察 JSON 里字段名的变化，理解"Jackson 认的是方法名，不是字段名"。<br><span class="ja-inline">🇯🇵 わざと `getName()` を `getUserName()` に改名し、フィールド名は変えずに再実行して、JSONのフィールド名の変化を観察し、「Jacksonが認識するのはメソッド名であり、フィールド名ではない」ことを理解しましょう。</span>
3. 把 `User` 类的无参构造方法删掉，只保留带参数的构造方法，重新发一次 `POST /user` 请求，观察报错信息，再把无参构造方法加回来验证。<br><span class="ja-inline">🇯🇵 `User` クラスの引数なしコンストラクタを削除し、引数ありコンストラクタだけ残して、もう一度 `POST /user` リクエストを送り、エラーメッセージを観察してから、引数なしコンストラクタを戻して確認しましょう。</span>

## 小测验 ／ 小テスト

1. 序列化和反序列化，方向分别是什么？<br><span class="ja-inline">🇯🇵 シリアライズとデシリアライズ、それぞれの方向は何ですか？</span>
2. Jackson 序列化一个对象时，是看字段名还是看方法名？<br><span class="ja-inline">🇯🇵 Jacksonがオブジェクトをシリアライズする際、見ているのはフィールド名ですか、それともメソッド名ですか？</span>
3. 为什么 POJO 类通常都要保留一个无参构造方法？<br><span class="ja-inline">🇯🇵 なぜPOJOクラスは通常、引数なしコンストラクタを残しておく必要があるのですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 序列化是"Java 对象 → JSON"，用在返回响应的时候；反序列化是"JSON → Java 对象"，用在接收 `@RequestBody` 请求体的时候。<br><span class="ja-inline">🇯🇵 シリアライズは「Javaオブジェクト → JSON」で、レスポンスを返すときに使われます。デシリアライズは「JSON → Javaオブジェクト」で、`@RequestBody` のリクエストボディを受け取るときに使われます。</span>
2. 看方法名，具体来说是 `getXxx()`（序列化）和 `setXxx()`（反序列化），字段本身是 `private` 的，Jackson 访问不到。<br><span class="ja-inline">🇯🇵 メソッド名を見ます。具体的には `getXxx()`（シリアライズ）と `setXxx()`（デシリアライズ）です。フィールド自体は `private` であり、Jacksonはアクセスできません。</span>
3. 因为 Jackson 反序列化时的第一步是"先 new 一个空对象"，如果类里没有无参构造方法，Jackson 默认无法创建这个空对象，反序列化会失败。<br><span class="ja-inline">🇯🇵 Jacksonがデシリアライズする際の最初のステップは「まず空のオブジェクトをnewする」ことだからです。クラスに引数なしコンストラクタがなければ、Jacksonはデフォルトでこの空オブジェクトを作成できず、デシリアライズは失敗します。</span>
</details>

## 本章总结 ／ 本章のまとめ
你现在知道了 Controller 返回的 Java 对象是怎么变成浏览器看到的 JSON 文本的，也知道了反过来前端传的 JSON 是怎么变成 Java 对象塞进方法参数的，中间全靠 Jackson 根据 getter/setter 方法名做匹配。下一章我们学习 RESTful API 设计——把 URL 和 HTTP 方法组织成一套有规律的接口风格，而不是想到哪个功能就随手起一个 URL。

> 🇯🇵 これでControllerが返すJavaオブジェクトがどのようにブラウザで見えるJSONテキストになるのか、逆にフロントエンドが送ったJSONがどのようにJavaオブジェクトになってメソッドの引数に渡されるのかが分かりました。その間はすべてJacksonがgetter/setterのメソッド名に基づいてマッチングしています。次の章ではRESTful API設計を学びます——URLとHTTPメソッドを規則性のあるインターフェーススタイルに組織する方法で、思いついた機能ごとに適当にURLを付けるのではありません。
