# 第 16 章　Bean 与构造器注入 ／ 第16章　Beanとコンストラクタインジェクション（DI）

## 本章目标 ／ 本章の目標
搞清楚一个 Bean 从"不存在"到"能被使用"经历了哪几步；能回答"`@Service` 标注的类，对象是谁创建的、什么时候创建、放在哪里"；学会用构造器注入的方式声明依赖，理解为什么本教程优先推荐这种写法。

> 🇯🇵 Bean（Springコンテナが一元管理するオブジェクト）が「存在しない」状態から「使える」状態になるまでにどんなステップを経るのかを明らかにします。「`@Service` が付いたクラスのオブジェクトは、誰が、いつ作成し、どこに置かれるのか」に答えられるようになります。コンストラクタインジェクション（コンストラクタ経由で依存性の注入DIを行う方式）で依存関係を宣言する方法を学び、本チュートリアルがなぜこの書き方を優先的に推奨するのかを理解します。

## 一句话理解 ／ 一言で理解する
Bean 的产生只需要记住一条简化流程：**程序启动 → Spring 扫描组件 → 创建 Bean → 解决依赖 → 放入 ApplicationContext → 程序运行时使用**，构造器注入就是"解决依赖"这一步最推荐的写法。

> 🇯🇵 Beanが生まれる流れは、次の簡略化した一本の流れだけ覚えておけば十分です。**プログラム起動 → Springがコンポーネントをスキャン → Beanを生成 → 依存関係を解決 → ApplicationContext（Springコンテナの実体）に格納 → プログラム実行時に使用**。コンストラクタインジェクションは、この「依存関係を解決」というステップで最も推奨される書き方です。

## 为什么需要它 ／ なぜ必要なのか

上一章我们知道了 Spring 会用容器帮我们创建和管理对象，但还有几个问题没有回答：

> 🇯🇵 前章で、Springがコンテナを使ってオブジェクトの生成と管理を代行してくれることを学びました。しかし、まだ答えていない疑問がいくつかあります。

- `@Service public class UserService {}` 这个对象，到底是**谁**创建的？<br><span class="ja-inline">🇯🇵 `@Service public class UserService {}` というオブジェクトは、一体**誰**が作成するのか？</span>
- 它是**什么时候**被创建出来的——是程序刚启动就建好，还是等到第一次用的时候才建？<br><span class="ja-inline">🇯🇵 それは**いつ**作られるのか——プログラム起動直後に作られるのか、それとも初めて使われるときに作られるのか？</span>
- 创建出来之后，**放在哪里**？<br><span class="ja-inline">🇯🇵 作られたあと、**どこに**置かれるのか？</span>
- 为什么 `UserController` 里可以直接用 `UserService`，却不需要写 `new UserService()`？<br><span class="ja-inline">🇯🇵 なぜ `UserController` の中で `UserService` を直接使えるのに、`new UserService()` と書く必要がないのか？</span>

这一章就是要把这几个问题掰开揉碎讲清楚，同时给出一套具体能写、能跑的代码写法。

> 🇯🇵 本章ではこれらの疑問を一つひとつ丁寧に解きほぐし、あわせて実際に書いて動かせる具体的なコードの書き方を示します。

## 核心概念 ／ コアコンセプト

### 16.1 Bean 从哪里来：一条简化流程 ／ 16.1　Beanはどこから来るのか：簡略化した流れ

本教程只讲下面这条流程，帮你建立"够用"的心智模型，**不涉及** Spring 内部更复杂的机制（比如 `BeanDefinition`、`BeanPostProcessor`、`@PostConstruct`/`@PreDestroy`、复杂的 Bean 作用域 Scope 等）。这些属于 Bean 生命周期的进阶内容，本教程不涉及，感兴趣可以在学完本教程后再深入研究。

> 🇯🇵 本チュートリアルでは以下の流れだけを扱い、「必要十分」なメンタルモデルを作ることを目指します。Spring内部のより複雑な仕組み（例えば `BeanDefinition`、`BeanPostProcessor`、`@PostConstruct`/`@PreDestroy`、複雑なBeanのスコープなど）には**触れません**。これらはBeanのライフサイクルに関するより発展的な内容であり、本チュートリアルの範囲外です。興味があれば本チュートリアルを修了したあとに深掘りしてみてください。

```
程序启动
  ↓
Spring 扫描组件（在你指定的包路径下，找所有贴了 @Component、@Service、
                 @Controller、@RestController 等注解的类）
  ↓
根据扫描结果，创建 Bean（也就是把这些类 new 成对象）
  ↓
解决依赖（如果一个 Bean 的构造方法需要别的 Bean，就先造好那些依赖，
          再"喂"给当前这个 Bean——这一步就是依赖注入 DI）
  ↓
放入 ApplicationContext（所有造好的 Bean 都存在这个容器里，
                         贯穿程序运行的整个生命周期）
  ↓
程序运行时使用（比如收到一个 HTTP 请求，Spring 直接从容器里
              取出对应的 Controller Bean 来处理，不需要临时创建）
```

回到开头的问题，现在可以逐一回答了：

> 🇯🇵 冒頭の疑問に戻って、今度は一つずつ答えられるようになりました。

- **`UserService` 对象是谁创建的？** 是 Spring 容器创建的，你自己不需要写 `new UserService()`。<br><span class="ja-inline">🇯🇵 **`UserService` オブジェクトは誰が作成するのか？** Springコンテナが作成します。自分で `new UserService()` と書く必要はありません。</span>
- **什么时候创建？** 默认情况下，是在程序启动阶段——也就是 `main` 方法执行、Spring Boot 应用启动的过程中，容器会一次性扫描并创建好所有需要的 Bean（这一点对本教程的例子都成立，进阶的"懒加载"用法不在本教程范围内）。<br><span class="ja-inline">🇯🇵 **いつ作成されるのか？** デフォルトでは、プログラム起動段階——つまり `main` メソッドが実行され、Spring Bootアプリケーションが起動する過程で、コンテナが一括ですべての必要なBeanをスキャンし作成します（本チュートリアルの例ではこれが常に成り立ちます。発展的な「遅延読み込み」の使い方は本チュートリアルの範囲外です）。</span>
- **放在哪里？** 放在 `ApplicationContext` 里，程序运行期间它会一直存在，随取随用。<br><span class="ja-inline">🇯🇵 **どこに置かれるのか？** `ApplicationContext` の中に置かれ、プログラムの実行期間中ずっと存在し、いつでも取り出して使えます。</span>
- **为什么 `UserController` 不需要 `new UserService()`？** 因为 Spring 在创建 `UserController` 这个 Bean 的时候，看到构造方法需要一个 `UserService`，会自动从容器里找一个类型匹配的 `UserService` Bean（上一步已经造好了），直接传给 `UserController` 的构造方法——这就是"依赖注入"。<br><span class="ja-inline">🇯🇵 **なぜ `UserController` は `new UserService()` する必要がないのか？** Springは `UserController` というBeanを生成する際、そのコンストラクタが `UserService` を必要としていることを見つけると、コンテナ内から型が一致する `UserService` のBean（前のステップですでに作られている）を自動的に探し出し、そのまま `UserController` のコンストラクタに渡します——これが「依存性の注入」です。</span>

### 16.2 构造器注入（本教程优先推荐） ／ 16.2　コンストラクタインジェクション（本チュートリアルで推奨）

依赖注入具体要怎么写？Spring 支持好几种写法，**本教程统一使用、也优先推荐"构造器注入"**：

> 🇯🇵 依存性の注入は具体的にどう書けばよいのでしょうか。Springはいくつかの書き方をサポートしていますが、**本チュートリアルでは「コンストラクタインジェクション」を統一的に使用し、優先的に推奨します**。

```java
@RestController
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
}
```

### 16.3 字段注入（了解即可，不推荐） ／ 16.3　フィールドインジェクション（知っておくだけでよく、推奨しない）

你可能会在别的教程或者一些老项目里看到这样的写法：

> 🇯🇵 他の教材や一部の古いプロジェクトで、次のような書き方を目にすることがあるかもしれません。

```java
@RestController
public class UserController {
    @Autowired
    private UserService userService;
}
```

这种写法叫"字段注入"，靠 `@Autowired` 注解直接标注在字段上，看起来更省代码。但本教程**不推荐**这种写法，主要原因有两点：

> 🇯🇵 この書き方は「フィールドインジェクション」と呼ばれ、`@Autowired` アノテーションを直接フィールドに付けるもので、一見コード量が少なく見えます。しかし本チュートリアルではこの書き方を**推奨しません**。主な理由は次の2点です。

1. 字段不能声明成 `final`，意味着这个字段理论上后续还可以被重新赋值，不如构造器注入那样"一旦创建就固定不变"来得安全。<br><span class="ja-inline">🇯🇵 フィールドを `final` として宣言できないため、このフィールドは理論上あとから再代入できてしまい、コンストラクタインジェクションのように「一度生成されたら変更できない」という安全性がありません。</span>
2. 写单元测试时，字段注入的类不方便脱离 Spring 容器单独创建对象（没法直接 `new UserController(...)` 传入一个假的 `UserService` 来测试），构造器注入天然就支持这样做。<br><span class="ja-inline">🇯🇵 単体テストを書く際、フィールドインジェクションのクラスはSpringコンテナから切り離して単独でオブジェクトを生成しにくい（`new UserController(...)` として偽の `UserService` を直接渡してテストすることができない）のに対し、コンストラクタインジェクションはこれを自然にサポートします。</span>

你只需要认识这种写法、知道它是什么，不需要把它当作本教程的主要学习内容。

> 🇯🇵 この書き方については、存在を知っておくだけで十分であり、本チュートリアルの主な学習内容とする必要はありません。

## 图解 ／ 図解

```
类上贴了 @Service / @RestController 等注解
          ↓
   Spring 扫描到这些类
          ↓
   按依赖关系依次创建 Bean：
     先造 UserService（它不依赖别的 Bean，直接创建）
          ↓
     再造 UserController（构造方法需要 UserService，
                          容器把刚造好的 UserService 传进去）
          ↓
   两个 Bean 都放进 ApplicationContext
          ↓
   程序运行时，请求进来，直接从容器里取用现成的 UserController
```

## 最小示例 ／ 最小限のサンプル

```java
package com.example.hello.service;

import org.springframework.stereotype.Service;

@Service
public class UserService {
    public String getUserName(Long id) {
        // 业务逻辑（示意，真正查数据库的写法在第 24 章之后学）
        return "小明";
    }
}
```

```java
package com.example.hello.controller;

import com.example.hello.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    private final UserService userService;

    // 构造器注入：Spring 会自动把 UserService 的 Bean 传进来
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/{id}")
    public String getUser(@PathVariable Long id) {
        return userService.getUserName(id);
    }
}
```

说明：这里出现的 `@GetMapping`、`@PathVariable` 属于 Spring MVC 的注解，我们到第 20 章会详细讲；这里先照抄写法即可，不影响理解本章的重点——依赖注入。

> 🇯🇵 補足：ここに登場する `@GetMapping`、`@PathVariable` はSpring MVCのアノテーションで、第20章で詳しく説明します。ここではそのまま書き写せば十分で、本章の要点である依存性の注入の理解には影響しません。

## 代码逐行解释 ／ コードの行ごとの解説

- `@Service`：告诉 Spring"请把 `UserService` 的对象创建成一个 Bean"。<br><span class="ja-inline">🇯🇵 `@Service`：Springに「`UserService` のオブジェクトをBeanとして作成してください」と伝えます。</span>
- `@RestController`：同样告诉 Spring"把 `UserController` 的对象创建成一个 Bean"，同时表示这个类专门处理 HTTP 请求。<br><span class="ja-inline">🇯🇵 `@RestController`：同じくSpringに「`UserController` のオブジェクトをBeanとして作成する」ことを伝え、同時にこのクラスがHTTPリクエストを専門に処理するクラスであることも示します。</span>
- `private final UserService userService;`：声明一个字段，用来保存注入进来的 `UserService` 对象。这里特意用 `final` 修饰——一旦在构造方法里赋值，之后就不能再改，逼着你不能"中途换掉依赖"，代码更安全、更容易推理。<br><span class="ja-inline">🇯🇵 `private final UserService userService;`：注入された `UserService` オブジェクトを保存するためのフィールドを宣言します。ここではあえて `final` を付けています——コンストラクタで一度代入すれば、その後は変更できなくなり、「途中で依存関係を差し替える」ことができなくなるため、コードがより安全で推論しやすくなります。</span>
- `public UserController(UserService userService)`：这是 `UserController` 的构造方法。Spring 在创建 `UserController` 这个 Bean 时，看到构造方法的参数类型是 `UserService`，就会去容器里**按类型匹配**，找到已经创建好的 `UserService` Bean，作为参数传进来——这个过程完全自动，不需要你写任何"查找"代码。<br><span class="ja-inline">🇯🇵 `public UserController(UserService userService)`：`UserController` のコンストラクタです。Springは `UserController` というBeanを生成する際、コンストラクタの引数の型が `UserService` であることを見つけると、コンテナ内で**型による照合**を行い、すでに生成されている `UserService` のBeanを見つけて引数として渡します——このプロセスは完全に自動で行われ、「探す」コードを自分で書く必要はありません。</span>
- `this.userService = userService;`：把传进来的参数赋值给字段，这一行执行完，`UserController` 对象就"拥有"了一个可用的 `UserService`。<br><span class="ja-inline">🇯🇵 `this.userService = userService;`：渡された引数をフィールドに代入します。この行が実行されると、`UserController` オブジェクトは使える `UserService` を「手に入れた」ことになります。</span>
- `getUser` 方法里的 `userService.getUserName(id)`：直接调用注入进来的对象的方法，就像使用一个普通对象一样，`UserController` 完全不需要关心这个 `UserService` 是怎么来的。<br><span class="ja-inline">🇯🇵 `getUser` メソッドの中の `userService.getUserName(id)`：注入されたオブジェクトのメソッドをそのまま呼び出しているだけで、普通のオブジェクトを使うのと変わりません。`UserController` はこの `UserService` がどこから来たのか一切気にする必要がありません。</span>

注意这里没有出现 `@Autowired` 注解——**当一个类只有一个构造方法时，Spring Boot 会自动使用这个构造方法来做依赖注入，不需要额外加注解**。只有当一个类写了多个构造方法、需要明确指定用哪一个时，才需要在对应构造方法上加 `@Autowired`（这种情况在本教程的示例里不会遇到）。

> 🇯🇵 ここで `@Autowired` アノテーションが登場していないことに注目してください——**クラスにコンストラクタが1つしかない場合、Spring Bootはそのコンストラクタを自動的に使って依存性の注入を行うため、追加のアノテーションは不要です**。クラスに複数のコンストラクタがあり、どれを使うか明示的に指定する必要がある場合にのみ、該当するコンストラクタに `@Autowired` を付けます（この状況は本チュートリアルのサンプルでは登場しません）。

## 程序运行过程 ／ プログラムの実行の流れ

1. 程序启动，Spring Boot 开始扫描 `com.example.hello` 包（以及它的子包）下的所有类。<br><span class="ja-inline">🇯🇵 プログラムが起動し、Spring Bootが `com.example.hello` パッケージ（およびそのサブパッケージ）内のすべてのクラスをスキャンし始めます。</span>
2. 扫描到 `UserService` 类上有 `@Service`，Spring 创建一个 `UserService` 对象，作为 Bean 放进 `ApplicationContext`。<br><span class="ja-inline">🇯🇵 `UserService` クラスに `@Service` が付いていることを検出し、Springが `UserService` オブジェクトを生成してBeanとして `ApplicationContext` に入れます。</span>
3. 扫描到 `UserController` 类上有 `@RestController`，Spring 准备创建它的对象，检查它的构造方法，发现需要一个 `UserService` 类型的参数。<br><span class="ja-inline">🇯🇵 `UserController` クラスに `@RestController` が付いていることを検出し、Springがそのオブジェクトを生成しようとしてコンストラクタを確認すると、`UserService` 型の引数が必要であることが分かります。</span>
4. Spring 按**类型**（`UserService`）去容器里查找匹配的 Bean——找到了第 2 步造好的那个，直接拿来传给构造方法。<br><span class="ja-inline">🇯🇵 Springは**型**（`UserService`）でコンテナ内から一致するBeanを探します——手順2で作られたものが見つかり、そのままコンストラクタに渡します。</span>
5. `UserController` 对象创建完成，也作为 Bean 放进 `ApplicationContext`。<br><span class="ja-inline">🇯🇵 `UserController` オブジェクトの生成が完了し、これもBeanとして `ApplicationContext` に入れられます。</span>
6. 之后浏览器访问 `/users/1`，Spring 直接从容器里取出现成的 `UserController` Bean 来处理这次请求（谁负责"找到并调用"这个 Bean，我们到第 20 章 Spring MVC 全链路会详细讲），调用 `getUser(1L)`，方法内部又调用了已经注入好的 `userService.getUserName(1L)`。<br><span class="ja-inline">🇯🇵 その後ブラウザから `/users/1` にアクセスすると、Springはコンテナから出来上がった `UserController` のBeanを直接取り出してこのリクエストを処理します（誰が「見つけて呼び出す」役割を担うのかは、第20章のSpring MVC全体の流れで詳しく説明します）。`getUser(1L)` が呼び出され、メソッド内部ではすでに注入済みの `userService.getUserName(1L)` がさらに呼び出されます。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 启动报错 `NoSuchBeanDefinitionException` 或提示找不到某个类型的 Bean | 依赖的类没有贴 `@Service`/`@Component` 等注解，Spring 根本没把它当成 Bean 来创建<br><span class="ja-inline">🇯🇵 依存先のクラスに `@Service`/`@Component` などのアノテーションが付いておらず、Springがそもそもそれを Bean として作成していない </span>| 检查依赖的类上是否漏加了注解<br><span class="ja-inline">🇯🇵 依存先のクラスにアノテーションの付け忘れがないか確認する </span>|
| 启动报错，提示存在两个同类型的 Bean，不知道注入哪一个 | 容器里有两个 `UserService` 类型的 Bean（比如两个不同的实现类都贴了 `@Service`），按类型匹配时产生了歧义<br><span class="ja-inline">🇯🇵 コンテナ内に `UserService` 型のBeanが2つ存在する（例えば異なる2つの実装クラスにそれぞれ `@Service` が付いている）ため、型による照合の際に曖昧さが生じている </span>| 本教程阶段先保证每种类型只有一个 Bean；更复杂的多实现场景（用 `@Qualifier` 指定）不在本章范围<br><span class="ja-inline">🇯🇵 本チュートリアルの段階ではまず1つの型につきBeanを1つだけにしておく。より複雑な複数実装のシナリオ（`@Qualifier` で指定する）は本章の範囲外 </span>|
| 手写 `new UserController(new UserService())` 却发现依赖没有正确工作 | 混淆了"自己手动创建对象"和"让 Spring 容器创建 Bean"——一旦自己 `new`，这个对象就完全脱离了容器管理<br><span class="ja-inline">🇯🇵 「自分で手動でオブジェクトを作る」ことと「Springコンテナに Bean を作らせる」ことを混同している——自分で `new` した瞬間、そのオブジェクトはコンテナの管理から完全に外れてしまう </span>| 在 Spring 项目里，凡是要被容器管理的对象，一律让容器去创建，不要自己手动 `new`<br><span class="ja-inline">🇯🇵 Springプロジェクトでは、コンテナに管理させたいオブジェクトはすべてコンテナに作らせ、自分で手動 `new` しないようにする </span>|
| 把 `@Autowired` 加在了构造方法参数只有一个的类上，还以为"不加就不生效" | 多此一举，虽然不会报错，但没必要<br><span class="ja-inline">🇯🇵 余計な操作であり、エラーにはならないが不要 </span>| 单构造方法的类，Spring Boot 会自动识别并注入，不需要手动加 `@Autowired`<br><span class="ja-inline">🇯🇵 コンストラクタが1つだけのクラスは、Spring Bootが自動的に認識して注入するため、手動で `@Autowired` を付ける必要はない </span>|

## 动手练习 ／ 演習

1. 仿照本章示例，自己写一个 `ProductService`（贴 `@Service`）和 `ProductController`（贴 `@RestController`），用构造器注入的方式让 `ProductController` 使用 `ProductService`。<br><span class="ja-inline">🇯🇵 本章のサンプルを参考に、自分で `ProductService`（`@Service` を付ける）と `ProductController`（`@RestController` を付ける）を書き、コンストラクタインジェクションの方式で `ProductController` に `ProductService` を使わせてみましょう。</span>
2. 尝试把 `UserController` 里的 `private final` 改成普通的 `private`，思考一下：这样写还能不能正常工作？和加 `final` 相比，少了什么保障？<br><span class="ja-inline">🇯🇵 `UserController` の `private final` を普通の `private` に変えてみて、これでも正常に動くかどうか考えてみましょう。`final` を付けた場合と比べて、どんな保証が失われますか？</span>
3. 找一段网上看到的、用字段注入（`@Autowired private XxxService xxx;`）写的代码，把它改写成本教程推荐的构造器注入写法。<br><span class="ja-inline">🇯🇵 ネット上で見かけたフィールドインジェクション（`@Autowired private XxxService xxx;`）で書かれたコードを見つけ、本チュートリアルが推奨するコンストラクタインジェクションの書き方に書き換えてみましょう。</span>

## 小测验 ／ 小テスト

1. `@Service public class UserService {}` 这个对象是谁创建的？什么时候创建？<br><span class="ja-inline">🇯🇵 `@Service public class UserService {}` というオブジェクトは誰が作成しますか？いつ作成されますか？</span>
2. Spring 是怎么知道要把哪个 `UserService` 对象传给 `UserController` 构造方法的？<br><span class="ja-inline">🇯🇵 Springはどうやって、どの `UserService` オブジェクトを `UserController` のコンストラクタに渡すべきか分かるのですか？</span>
3. 为什么本教程推荐构造器注入而不是字段注入？<br><span class="ja-inline">🇯🇵 なぜ本チュートリアルはフィールドインジェクションではなくコンストラクタインジェクションを推奨するのですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 是 Spring 容器创建的，创建时机是程序启动阶段——Spring Boot 启动时扫描组件、依次创建 Bean，`UserService` 会在这个过程中被创建，之后一直存放在 ApplicationContext 里供整个程序运行期间使用。<br><span class="ja-inline">🇯🇵 Springコンテナが作成します。作成のタイミングはプログラム起動段階です——Spring Boot起動時にコンポーネントをスキャンし、順にBeanを生成する過程で `UserService` が作成され、その後はプログラムの実行期間中ずっとApplicationContextに格納されて使用されます。</span>
2. Spring 按**类型匹配**：`UserController` 构造方法的参数类型是 `UserService`，Spring 就去容器里找一个 `UserService` 类型的 Bean，找到后直接作为参数传入。<br><span class="ja-inline">🇯🇵 Springは**型による照合**を行います：`UserController` のコンストラクタの引数の型が `UserService` なので、Springはコンテナ内から `UserService` 型のBeanを探し、見つかったらそのまま引数として渡します。</span>
3. 构造器注入可以把依赖字段声明为 `final`，一旦赋值不能再改，代码更安全；同时更方便写单元测试——可以脱离 Spring 容器，直接 `new` 一个对象并手动传入依赖进行测试，而字段注入的类不方便这样做。<br><span class="ja-inline">🇯🇵 コンストラクタインジェクションは依存先のフィールドを `final` として宣言でき、一度代入したら変更できないためコードがより安全になります。また単体テストも書きやすく——Springコンテナから切り離して直接 `new` し、手動で依存関係を渡してテストできますが、フィールドインジェクションのクラスはこれがやりにくいです。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了 Bean 的产生流程（扫描组件 → 创建 Bean → 解决依赖 → 放入 ApplicationContext → 运行时使用），并学会了用构造器注入这种推荐写法来声明依赖。这些属于 Bean 生命周期更深入的机制（`BeanDefinition`、`@PostConstruct` 等）暂时不需要了解。下一章我们回过头补一块基础：Maven——搞清楚 pom.xml 里那些依赖到底是怎么被下载和管理的。

> 🇯🇵 これでBeanの生成の流れ（コンポーネントのスキャン → Bean生成 → 依存関係の解決 → ApplicationContextへの格納 → 実行時の使用）を理解し、依存関係を宣言する推奨方法であるコンストラクタインジェクションも学びました。Beanのライフサイクルに関わるより踏み込んだ仕組み（`BeanDefinition`、`@PostConstruct` など）は、今のところ理解する必要はありません。次章では基礎に立ち戻り、Maven——pom.xmlに書かれた依存関係が実際にどのようにダウンロードされ管理されているのかを明らかにします。
