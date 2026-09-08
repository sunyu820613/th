# 第 20 章　Spring MVC 全链路 ／ 第20章　Spring MVCの全体の流れ

## 本章目标 ／ 本章の目標
先建立一个最简单的心智模型：请求怎么找到 Controller；再在此基础上补全完整链路（HandlerMapping、HandlerAdapter、HttpMessageConverter 等角色分别负责什么）；掌握 `@RequestMapping`/`@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`/`@PathVariable`/`@RequestParam`/`@RequestBody` 这几个常用注解的含义和最小用法。本章不深入 Spring MVC 源码。

> 🇯🇵 まずリクエストがどのようにControllerを見つけるのかという最もシンプルなメンタルモデルを作ります。その上で完全な流れ（HandlerMapping、HandlerAdapter、HttpMessageConverterなどの役割がそれぞれ何を担当するか）を補完します。`@RequestMapping`/`@GetMapping`/`@PostMapping`/`@PutMapping`/`@DeleteMapping`/`@PathVariable`/`@RequestParam`/`@RequestBody` といったよく使うアノテーションの意味と最小限の使い方を身につけます。本章ではSpring MVCのソースコードには踏み込みません。

## 一句话理解 ／ 一言で理解する
Spring MVC 的核心思路是：所有请求先统一交给一个"总调度员"（`DispatcherServlet`），由它去找到该由哪个 Controller 方法处理，再负责调用它、把结果处理成响应返回给浏览器。

> 🇯🇵 Spring MVCの中心となる考え方は、すべてのリクエストをまず統一の「総合ディスパッチャー」（`DispatcherServlet`）に渡し、それがどのControllerメソッドが処理すべきかを見つけ出し、そのメソッドを呼び出して、結果をレスポンスに加工してブラウザに返す、というものです。

## 为什么需要它 ／ なぜ必要なのか

阶段 1 你学过原始的 Servlet：每一个 URL 都要对应一个 Servlet 类，自己继承 `HttpServlet`、重写 `doGet`/`doPost`。项目一大，Servlet 类会越来越多，URL 和类的映射关系也要一个个手动配置，非常繁琐（这也是第 13 章"从 Servlet 到 MVC"讲过的痛点）。

> 🇯🇵 ステージ1で生のServletを学びました：それぞれのURLが1つのServletクラスに対応し、自分で `HttpServlet` を継承し `doGet`/`doPost` をオーバーライドする必要がありました。プロジェクトが大きくなるとServletクラスがどんどん増え、URLとクラスの対応関係も一つひとつ手動で設定しなければならず、非常に面倒でした（これは第13章「Servletからmvcへ」で説明した悩みでもあります）。

Spring MVC 的做法是：不再让每个功能对应一个独立的 Servlet 类，而是**只用一个统一的入口 Servlet**（`DispatcherServlet`）接收所有请求，再由它内部去"调度"，找到你写的、用普通 Java 方法表示的 Controller 方法来处理。这样你只需要写业务方法、贴上注解声明"我负责处理哪个 URL"，其余的调度工作全部交给框架完成。

> 🇯🇵 Spring MVCのやり方は、それぞれの機能を独立したServletクラスに対応させるのではなく、**統一された1つの入口Servlet**（`DispatcherServlet`）だけがすべてのリクエストを受け取り、その内部で「ディスパッチ」を行い、あなたが書いた普通のJavaメソッドで表現されたControllerメソッドを見つけて処理させる、というものです。こうすることで、あなたは業務メソッドを書き、アノテーションを付けて「自分がどのURLを処理するか」を宣言するだけでよく、残りのディスパッチ作業はすべてフレームワークに任せられます。

## 核心概念 ／ コアコンセプト

### 20.1 第一遍：最简心智模型 ／ 20.1　まず一巡目：最もシンプルなメンタルモデル

先不管中间那么多环节，用一句话记住 Spring MVC 最核心的流程：

> 🇯🇵 まずは途中の細かい工程を気にせず、Spring MVCの最も核心となる流れを一言で覚えましょう。

```
DispatcherServlet → 找到 Controller → 调用 Controller
```

看一个最小的例子：

> 🇯🇵 最小限の例を見てみましょう。

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring MVC!";
    }
}
```

浏览器访问 `http://localhost:8080/hello` 时，发生的事情可以简化成三步：

> 🇯🇵 ブラウザが `http://localhost:8080/hello` にアクセスするとき、起きることは3つのステップに簡略化できます。

1. 请求 `GET /hello` 到达 `DispatcherServlet`（Spring Boot 自动配置好的、唯一的统一入口）。<br><span class="ja-inline">🇯🇵 `GET /hello` というリクエストが `DispatcherServlet`（Spring Bootが自動設定した唯一の統一入口）に到達します。</span>
2. `DispatcherServlet` 找到"谁声明了处理 `/hello` 这个路径"——也就是我们贴了 `@GetMapping("/hello")` 的 `hello()` 方法。<br><span class="ja-inline">🇯🇵 `DispatcherServlet` は「誰が `/hello` というパスの処理を宣言しているか」——つまり `@GetMapping("/hello")` を付けた `hello()` メソッドを見つけます。</span>
3. `DispatcherServlet` 调用这个方法，拿到返回值 `"Hello, Spring MVC!"`，把它作为响应内容返回给浏览器。<br><span class="ja-inline">🇯🇵 `DispatcherServlet` はこのメソッドを呼び出し、戻り値 `"Hello, Spring MVC!"` を受け取り、それをレスポンス内容としてブラウザに返します。</span>

这就是本章要建立的第一层、也是最重要的一层认知：**你写的 Controller 方法，从来不是被浏览器直接调用的，中间一定隔着 `DispatcherServlet` 这个统一入口。**

> 🇯🇵 これが本章で確立すべき第一の、そして最も重要な認識です：**あなたが書いたControllerメソッドは、決してブラウザから直接呼び出されるのではなく、間には必ず `DispatcherServlet` という統一入口が挟まっています。**

### 20.2 第二遍：补全完整链路 ／ 20.2　二巡目：完全な流れを補完する

第一遍的"找到 Controller"其实是被压缩省略掉的两个步骤。完整展开后是这样的：

> 🇯🇵 一巡目の「Controllerを見つける」というのは、実は2つのステップが圧縮・省略されたものです。完全に展開すると次のようになります。

```
HTTP Request
   ↓
Tomcat（内嵌服务器，接收网络请求）
   ↓
DispatcherServlet（统一入口，所有请求先到这里）
   ↓
HandlerMapping（负责"找谁处理"——根据请求的 URL 和方法，
                查出应该由哪个 Controller 的哪个方法来处理）
   ↓
HandlerAdapter（负责"怎么调用这个处理方法"——不同写法的
                处理方法，调用方式细节不完全一样，由它负责
                统一适配、实际发起调用）
   ↓
Controller 方法（执行你写的业务入口代码，往往会再调用 Service）
   ↓
Service（具体业务逻辑，见下方说明）
   ↓
返回 Java 对象（比如一个 User 对象，或者一个字符串）
   ↓
HttpMessageConverter / Jackson（把 Java 对象转换成 JSON 等格式）
   ↓
HTTP Response（最终返回给浏览器的响应）
```

结合一个更完整的例子看这条链路：

> 🇯🇵 より完全な例と合わせてこの流れを見てみましょう。

```java
@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/{id}")
    public User getUser(@PathVariable Long id) {
        return userService.getById(id);
    }
}
```

现在逐段回答："**谁调用了 `getUser()`？**"

> 🇯🇵 それでは段階を追って「**誰が `getUser()` を呼び出したのか？**」に答えていきましょう。

1. 浏览器发出 `GET /users/1` 请求。<br><span class="ja-inline">🇯🇵 ブラウザが `GET /users/1` リクエストを送信します。</span>
2. 请求先到达 Tomcat（Spring Boot 内嵌的服务器，第 19 章讲过它为什么会自动配置好）。<br><span class="ja-inline">🇯🇵 リクエストはまずTomcat（Spring Boot内蔵のサーバー、なぜ自動設定されるかは第19章で説明しました）に到達します。</span>
3. Tomcat 把请求交给 `DispatcherServlet`——这是 Spring MVC 唯一的统一入口，所有请求都先经过它。<br><span class="ja-inline">🇯🇵 Tomcatはリクエストを `DispatcherServlet` に渡します——これはSpring MVC唯一の統一入口であり、すべてのリクエストがまずここを通過します。</span>
4. `DispatcherServlet` 请教 **HandlerMapping**："`GET /users/1` 该由谁处理？" HandlerMapping 内部记录着所有贴了 `@GetMapping`/`@PostMapping` 等注解的方法和 URL 的对应关系，它匹配出应该由 `UserController` 的 `getUser` 方法处理，并且能从 URL 里解析出路径变量 `id = 1`。<br><span class="ja-inline">🇯🇵 `DispatcherServlet` は **HandlerMapping** に「`GET /users/1` は誰が処理すべきか？」と尋ねます。HandlerMappingの内部には `@GetMapping`/`@PostMapping` などが付いたすべてのメソッドとURLの対応関係が記録されており、`UserController` の `getUser` メソッドが処理すべきだとマッチングし、さらにURLからパス変数 `id = 1` を解析できます。</span>
5. `DispatcherServlet` 拿到"该由谁处理"的结果后，交给 **HandlerAdapter**，请它负责真正发起调用——因为 `getUser` 方法的参数需要绑定 `@PathVariable Long id`，这个"怎么把路径里的 `1` 转换成 `Long` 类型并传给方法参数"的具体适配工作，就是 HandlerAdapter 负责的。<br><span class="ja-inline">🇯🇵 `DispatcherServlet` は「誰が処理すべきか」という結果を受け取ると、それを **HandlerAdapter** に渡し、実際の呼び出しを担当してもらいます——`getUser` メソッドの引数は `@PathVariable Long id` をバインドする必要があるため、「パスの中の `1` をどうやって `Long` 型に変換してメソッドの引数に渡すか」という具体的な適合作業は、HandlerAdapterが担当します。</span>
6. HandlerAdapter 实际调用 `getUser(1L)`——**到这一步，`getUser()` 才真正被执行，调用者是 HandlerAdapter，而不是浏览器，也不是 Tomcat**。<br><span class="ja-inline">🇯🇵 HandlerAdapterが実際に `getUser(1L)` を呼び出します——**この段階になって初めて `getUser()` が本当に実行され、呼び出し元はHandlerAdapterであり、ブラウザでもTomcatでもありません**。</span>
7. `getUser` 方法内部调用 `userService.getById(id)`。这里的 `userService` 是哪来的？——正是第 15、16 章讲过的依赖注入：Spring 容器在创建 `UserController` 这个 Bean 时，已经把 `UserService` 的 Bean 通过构造器注入进来了，`UserController` 不需要自己 `new`。<br><span class="ja-inline">🇯🇵 `getUser` メソッドの内部で `userService.getById(id)` を呼び出します。ここの `userService` はどこから来たのでしょうか——まさに第15、16章で説明した依存性の注入です：Springコンテナは `UserController` というBeanを生成する際、すでにコンストラクタインジェクションを通じて `UserService` のBeanを渡しており、`UserController` は自分で `new` する必要がありません。</span>
8. `userService.getById(id)` 具体是怎么去查数据库、找到这个 `User` 对象的，我们要到第 24 章之后学完数据库相关内容才会讲；现在你可以先假设它"已经能够返回一个 `User` 对象"，不需要关心内部实现。<br><span class="ja-inline">🇯🇵 `userService.getById(id)` が具体的にどうデータベースを検索してこの `User` オブジェクトを見つけるのかは、第24章以降でデータベース関連の内容を学んでから説明します。今は「すでに `User` オブジェクトを返せる」と仮定しておけばよく、内部実装を気にする必要はありません。</span>
9. `getUser` 方法把 `User` 对象作为返回值交回给 HandlerAdapter，再一路交回给 `DispatcherServlet`。<br><span class="ja-inline">🇯🇵 `getUser` メソッドは `User` オブジェクトを戻り値としてHandlerAdapterに返し、さらに一連の流れで `DispatcherServlet` に返されます。</span>
10. `DispatcherServlet` 发现返回的是一个 Java 对象（不是页面），于是交给 **HttpMessageConverter**（Spring Boot 默认使用 Jackson 这个库来实现）把这个 `User` 对象转换成 JSON 格式的文本。<br><span class="ja-inline">🇯🇵 `DispatcherServlet` は返されたものがJavaオブジェクト（ページではない）であることに気づき、**HttpMessageConverter**（Spring Bootはデフォルトで Jackson というライブラリを使って実現しています）にこの `User` オブジェクトをJSON形式のテキストに変換させます。</span>
11. 转换好的 JSON 文本作为 HTTP 响应体，通过 Tomcat 发送回浏览器。<br><span class="ja-inline">🇯🇵 変換されたJSONテキストがHTTPレスポンスボディとして、Tomcatを通じてブラウザに送り返されます。</span>

`Java 对象什么时候变成 JSON？` 就发生在第 10 步——`HttpMessageConverter`/Jackson 这一环。具体它是怎么做转换、字段名对应规则等细节，我们留到第 21 章"JSON 与 Jackson"详细讲，这里只需要知道"发生在链路的哪一步"。

> 🇯🇵 「JavaオブジェクトはいつJSONになるのか？」——それはまさに手順10、`HttpMessageConverter`/Jacksonの部分で起きます。具体的にどのように変換されるのか、フィールド名の対応ルールなどの詳細は、第21章「JSONとJackson」で詳しく説明します。ここでは「流れのどの段階で起きるか」だけ知っておけば十分です。

### 20.3 常用注解速览 ／ 20.3　よく使うアノテーションの早見表

| 注解 ／ アノテーション | 含义 ／ 意味 | 最小示例 ／ 最小限のサンプル |
|---|---|---|
| `@RequestMapping` | 最基础的路径映射注解，可以指定 URL 和 HTTP 方法，下面几个是它针对具体方法的"简化写法"<br><span class="ja-inline">🇯🇵 最も基本的なパスマッピングアノテーションで、URLとHTTPメソッド（HTTP Method）を指定できます。以下のいくつかは、それぞれ具体的なメソッド向けの「簡略化された書き方」です </span>| `@RequestMapping(value = "/hello", method = RequestMethod.GET)` |
| `@GetMapping` | 处理 `GET` 请求（通常用于"查询"）<br><span class="ja-inline">🇯🇵 `GET` リクエストを処理します（通常「検索」に使われます） </span>| `@GetMapping("/users")` |
| `@PostMapping` | 处理 `POST` 请求（通常用于"新增"）<br><span class="ja-inline">🇯🇵 `POST` リクエストを処理します（通常「新規追加」に使われます） </span>| `@PostMapping("/users")` |
| `@PutMapping` | 处理 `PUT` 请求（通常用于"整体更新"）<br><span class="ja-inline">🇯🇵 `PUT` リクエストを処理します（通常「全体更新」に使われます） </span>| `@PutMapping("/users/{id}")` |
| `@DeleteMapping` | 处理 `DELETE` 请求（通常用于"删除"）<br><span class="ja-inline">🇯🇵 `DELETE` リクエストを処理します（通常「削除」に使われます） </span>| `@DeleteMapping("/users/{id}")` |
| `@PathVariable` | 把 URL 路径里的一段占位符，绑定到方法参数上<br><span class="ja-inline">🇯🇵 URLパス内のプレースホルダーの一部を、メソッドの引数にバインドします </span>| `@GetMapping("/users/{id}") public User get(@PathVariable Long id)` |
| `@RequestParam` | 获取 URL 问号后面的查询参数（`?key=value` 这种形式）<br><span class="ja-inline">🇯🇵 URLの疑問符以降のクエリパラメータ（`?key=value` の形式）を取得します </span>| `@GetMapping("/users") public List<User> list(@RequestParam String name)` |
| `@RequestBody` | 用于接收 JSON 格式的请求体，把请求体自动转换成一个 Java 对象；详细的转换原理放到第 21 章讲<br><span class="ja-inline">🇯🇵 JSON形式のリクエストボディを受け取るために使い、リクエストボディを自動的にJavaオブジェクトに変換します。詳しい変換の原理は第21章で説明します </span>| `@PostMapping("/users") public User create(@RequestBody User user)` |

这几个方法级注解（`@GetMapping` 等）本质上都是 `@RequestMapping` 针对某一种 HTTP 方法的"语法糖"（更简洁的写法），实际项目里几乎总是直接用这些更具体的注解，很少直接写 `@RequestMapping` 加 `method` 参数。

> 🇯🇵 これらのメソッドレベルのアノテーション（`@GetMapping` など）は、本質的にはすべて `@RequestMapping` の特定のHTTPメソッド向けの「シンタックスシュガー」（より簡潔な書き方）です。実際のプロジェクトではほぼ常にこれらのより具体的なアノテーションを直接使い、`@RequestMapping` に `method` パラメータを付けて書くことはほとんどありません。

## 图解 ／ 図解

（同"核心概念"20.2 小节里的完整链路图，此处不重复贴出。本章的图解重点，就是理解 `HandlerMapping` 负责"找谁处理"、`HandlerAdapter` 负责"怎么调用"这两个角色的分工，它们都夹在 `DispatcherServlet` 和你写的 Controller 方法之间，不需要你手动调用它们，全部由 Spring MVC 内部自动完成。）

> 🇯🇵 （「コアコンセプト」20.2節の完全な流れの図と同じなので、ここでは繰り返し貼りません。本章の図解の要点は、`HandlerMapping` が「誰が処理するか探す」、`HandlerAdapter` が「どう呼び出すか」を担当するという2つの役割分担を理解することです。両者はいずれも `DispatcherServlet` とあなたが書いたControllerメソッドの間に挟まっており、あなたが手動で呼び出す必要はなく、すべてSpring MVCの内部で自動的に完了します。）

## 最小示例 ／ 最小限のサンプル

```java
package com.example.hello.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello, Spring MVC!";
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `@RestController`：贴在类上，前面章节讲过它有两个作用——一是让 Spring 把这个类创建成 Bean（第 15、16 章的内容），二是告诉 Spring MVC"这个类里的方法，返回值应该直接作为响应内容（一般会自动转成 JSON 或者纯文本），而不是当作页面模板名去查找页面"。<br><span class="ja-inline">🇯🇵 `@RestController`：クラスに付けるもので、前の章で説明した通り2つの役割があります——1つはSpringにこのクラスをBeanとして作成させること（第15、16章の内容）、もう1つはSpring MVCに「このクラス内のメソッドの戻り値は、直接レスポンス内容として扱うべきである（通常自動的にJSONまたは平文に変換される）。ページテンプレート名としてページを探すのではない」と伝えることです。</span>
- `@GetMapping("/hello")`：贴在方法上，告诉 `HandlerMapping`"当有 `GET /hello` 请求进来时，应该交给这个方法处理"。<br><span class="ja-inline">🇯🇵 `@GetMapping("/hello")`：メソッドに付けるもので、`HandlerMapping` に「`GET /hello` というリクエストが来たとき、このメソッドに処理を任せるべきだ」と伝えます。</span>
- `public String hello()`：方法本身不需要任何特殊写法，就是一个普通的 Java 方法；返回值 `"Hello, Spring MVC!"` 会被 `DispatcherServlet` 直接作为响应内容（因为是 `String` 类型，会被当作纯文本响应，不需要经过 JSON 转换）。<br><span class="ja-inline">🇯🇵 `public String hello()`：メソッド自体には特別な書き方は必要なく、普通のJavaメソッドです。戻り値 `"Hello, Spring MVC!"` は `DispatcherServlet` によって直接レスポンス内容として扱われます（`String` 型なので平文のレスポンスとして扱われ、JSON変換を経る必要がありません）。</span>

## 程序运行过程 ／ プログラムの実行の流れ

以浏览器访问 `http://localhost:8080/hello` 为例，对照 20.1 小节的三步简化模型：

> 🇯🇵 ブラウザで `http://localhost:8080/hello` にアクセスする場合を例に、20.1節の3ステップの簡略化モデルと照らし合わせてみましょう。

1. 浏览器发出 `GET /hello` 请求，经 Tomcat 到达 `DispatcherServlet`。<br><span class="ja-inline">🇯🇵 ブラウザが `GET /hello` リクエストを送信し、Tomcatを経て `DispatcherServlet` に到達します。</span>
2. `DispatcherServlet` 通过 `HandlerMapping` 找到：这个请求应该由 `HelloController` 的 `hello()` 方法处理。<br><span class="ja-inline">🇯🇵 `DispatcherServlet` は `HandlerMapping` を通じて、このリクエストは `HelloController` の `hello()` メソッドが処理すべきだと見つけます。</span>
3. `DispatcherServlet` 通过 `HandlerAdapter` 实际调用 `hello()` 方法（这个方法没有参数，不需要做任何参数绑定，是本章里最简单的情况）。<br><span class="ja-inline">🇯🇵 `DispatcherServlet` は `HandlerAdapter` を通じて実際に `hello()` メソッドを呼び出します（このメソッドには引数がなく、パラメータバインディングを行う必要がない、本章で最もシンプルなケースです）。</span>
4. `hello()` 方法执行完毕，返回字符串 `"Hello, Spring MVC!"`。<br><span class="ja-inline">🇯🇵 `hello()` メソッドの実行が終わり、文字列 `"Hello, Spring MVC!"` を返します。</span>
5. 因为返回值是 `String` 类型，`DispatcherServlet` 直接将其作为响应体的文本内容（不需要 Jackson 转换成 JSON）。<br><span class="ja-inline">🇯🇵 戻り値が `String` 型なので、`DispatcherServlet` はそれを直接レスポンスボディのテキスト内容とします（JacksonによるJSON変換は不要です）。</span>
6. 响应通过 Tomcat 返回给浏览器，浏览器页面上显示出 `Hello, Spring MVC!`。<br><span class="ja-inline">🇯🇵 レスポンスがTomcatを通じてブラウザに返され、ブラウザのページ上に `Hello, Spring MVC!` が表示されます。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 访问接口返回 `404 Not Found` | URL 拼写和 `@GetMapping` 里写的不一致（大小写、多了/少了斜杠等），或者这个 Controller 类没有被 `@ComponentScan` 扫描到（第 19 章讲过的扫描范围问题）<br><span class="ja-inline">🇯🇵 URLのつづりと `@GetMapping` に書かれたものが一致していない（大文字小文字、スラッシュの過不足など）、またはこのControllerクラスが `@ComponentScan` にスキャンされていない（第19章で説明したスキャン範囲の問題） </span>| 仔细核对 URL 拼写；确认 Controller 类在入口类所在包及其子包下<br><span class="ja-inline">🇯🇵 URLのつづりを丁寧に確認する。Controllerクラスがエントリークラスの属するパッケージおよびそのサブパッケージの下にあるか確認する </span>|
| 用浏览器直接访问一个只支持 `POST` 的接口，报 `405 Method Not Allowed` | 浏览器地址栏直接访问默认发起的是 `GET` 请求，和接口声明的 `@PostMapping` 不匹配<br><span class="ja-inline">🇯🇵 ブラウザのアドレスバーから直接アクセスするとデフォルトで `GET` リクエストが発行され、エンドポイントが宣言している `@PostMapping` と一致しない </span>| `POST`/`PUT`/`DELETE` 类型的接口需要用 Postman 等工具，或者写代码（比如 `fetch()`，第 33 章会讲）发起对应方法的请求，不能直接在地址栏里访问<br><span class="ja-inline">🇯🇵 `POST`/`PUT`/`DELETE` 型のエンドポイントはPostmanなどのツール、またはコード（例えば `fetch()`、第33章で説明します）を使って対応するメソッドのリクエストを発行する必要があり、アドレスバーから直接アクセスすることはできない </span>|
| `@PathVariable` 绑定的参数名和 URL 占位符名字对不上，报错或拿不到值 | 比如 URL 写 `/users/{id}` 但方法参数名写成 `uid` 且没有显式指定对应关系<br><span class="ja-inline">🇯🇵 例えばURLで `/users/{id}` と書いたのに、メソッドの引数名を `uid` にしてしまい、対応関係を明示的に指定していない </span>| 保证方法参数名和 `{}` 里的占位符名字一致，或者显式写成 `@PathVariable("id") Long uid`<br><span class="ja-inline">🇯🇵 メソッドの引数名と `{}` 内のプレースホルダー名を一致させるか、明示的に `@PathVariable("id") Long uid` と書く </span>|
| 把 `@RequestBody` 用在了 `GET` 请求上，觉得没生效 | `@RequestBody` 是用来接收请求体里的 JSON 数据，`GET` 请求语义上通常不带请求体<br><span class="ja-inline">🇯🇵 `@RequestBody` はリクエストボディ内のJSONデータを受け取るためのもので、`GET` リクエストは意味的に通常リクエストボディを持たない </span>| `@RequestBody` 一般搭配 `@PostMapping`/`@PutMapping` 使用；`GET` 请求的参数应该用 `@RequestParam` 或 `@PathVariable`<br><span class="ja-inline">🇯🇵 `@RequestBody` は通常 `@PostMapping`/`@PutMapping` と組み合わせて使う。`GET` リクエストのパラメータは `@RequestParam` または `@PathVariable` を使うべき </span>|

## 动手练习 ／ 演習

1. 仿照 `HelloController`，自己写一个 `@GetMapping("/ping")`，返回字符串 `"pong"`，启动项目后用浏览器访问验证。<br><span class="ja-inline">🇯🇵 `HelloController` を参考に、自分で `@GetMapping("/ping")` を書き、文字列 `"pong"` を返すようにし、プロジェクトを起動してブラウザでアクセスして確認しましょう。</span>
2. 写一个 `@GetMapping("/greet")`，用 `@RequestParam` 接收一个叫 `name` 的查询参数，返回 `"你好，" + name`，用浏览器访问 `http://localhost:8080/greet?name=小明` 验证。<br><span class="ja-inline">🇯🇵 `@GetMapping("/greet")` を書き、`@RequestParam` で `name` というクエリパラメータを受け取り、`"你好，" + name` を返すようにし、ブラウザで `http://localhost:8080/greet?name=太郎` にアクセスして確認しましょう。</span>
3. 对照 20.2 小节的完整链路图，自己动手默写一遍，尝试不看书说出每一环的名字和职责。<br><span class="ja-inline">🇯🇵 20.2節の完全な流れの図と照らし合わせて、自分で書き出してみましょう。本を見ずに各段階の名前と役割を言えるか試してみます。</span>

## 小测验 ／ 小テスト

1. 浏览器发出的请求，是直接调用了你写的 Controller 方法吗？中间经过了哪些角色？<br><span class="ja-inline">🇯🇵 ブラウザが発したリクエストは、あなたが書いたControllerメソッドを直接呼び出していますか？途中でどんな役割を経ていますか？</span>
2. `HandlerMapping` 和 `HandlerAdapter` 分别负责什么？<br><span class="ja-inline">🇯🇵 `HandlerMapping` と `HandlerAdapter` はそれぞれ何を担当していますか？</span>
3. `@PathVariable` 和 `@RequestParam` 有什么区别？<br><span class="ja-inline">🇯🇵 `@PathVariable` と `@RequestParam` にはどんな違いがありますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 不是直接调用。请求先到达 Tomcat，再交给 `DispatcherServlet`，`DispatcherServlet` 通过 `HandlerMapping` 找到对应的处理方法，再通过 `HandlerAdapter` 实际发起调用，最终才执行到你写的 Controller 方法。<br><span class="ja-inline">🇯🇵 直接呼び出してはいません。リクエストはまずTomcatに到達し、`DispatcherServlet` に渡されます。`DispatcherServlet` は `HandlerMapping` を通じて対応する処理メソッドを見つけ、`HandlerAdapter` を通じて実際に呼び出しを行い、最終的にあなたが書いたControllerメソッドが実行されます。</span>
2. `HandlerMapping` 负责"找谁处理"——根据请求的 URL 和方法，查出应该由哪个 Controller 的哪个方法处理；`HandlerAdapter` 负责"怎么调用"——实际发起对这个处理方法的调用，包括处理参数绑定等细节。<br><span class="ja-inline">🇯🇵 `HandlerMapping` は「誰が処理するか探す」ことを担当します——リクエストのURLとメソッドに基づいて、どのControllerのどのメソッドが処理すべきか調べます。`HandlerAdapter` は「どう呼び出すか」を担当します——この処理メソッドへの呼び出しを実際に行い、パラメータバインディングなどの詳細も処理します。</span>
3. `@PathVariable` 用于获取 URL 路径中的一段占位符（比如 `/users/{id}` 里的 `id`）；`@RequestParam` 用于获取 URL 问号后面的查询参数（比如 `/users?name=xxx` 里的 `name`）。两者取值的位置不同。<br><span class="ja-inline">🇯🇵 `@PathVariable` はURLパス中のプレースホルダー部分（例えば `/users/{id}` の `id`）を取得するために使います。`@RequestParam` はURLの疑問符以降のクエリパラメータ（例えば `/users?name=xxx` の `name`）を取得するために使います。両者は値を取得する位置が異なります。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经建立起 Spring MVC 处理请求的完整心智模型：从最简单的"`DispatcherServlet` → 找到 Controller → 调用 Controller`"，到补全 `HandlerMapping`（找谁处理）、`HandlerAdapter`（怎么调用）、`HttpMessageConverter`/Jackson（对象转 JSON）这几个关键角色的完整链路，也掌握了几个最常用的请求映射和参数绑定注解。是时候用一个真实的、可以运行的项目，把这条链路完整体验一遍了——接下来是 Project 1：Hello Spring Boot。

> 🇯🇵 これでSpring MVCがリクエストを処理する完全なメンタルモデルを確立できました：最もシンプルな「`DispatcherServlet` → Controllerを見つける → Controllerを呼び出す」から、`HandlerMapping`（誰が処理するか探す）、`HandlerAdapter`（どう呼び出すか）、`HttpMessageConverter`/Jackson（オブジェクトをJSONに変換する）といった重要な役割を補完した完全な流れまで理解し、よく使うリクエストマッピングとパラメータバインディングのアノテーションも身につけました。実際に動く本物のプロジェクトで、この流れを一通り体験してみる時です——次はProject 1：Hello Spring Bootです。
