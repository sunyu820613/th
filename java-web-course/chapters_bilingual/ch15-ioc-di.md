# 第 15 章　为什么需要 Spring：IoC 与 DI ／ 第15章　なぜSpringが必要なのか：IoCとDI

## 本章目标 ／ 本章の目標
从"到处 `new` 对象"的真实痛点出发，理解 Spring 容器要解决的问题；掌握 IoC（控制反转）、DI（依赖注入）、Bean、ApplicationContext 这几个核心概念的含义和相互关系。本章只讲思路，不写完整 Spring Boot 项目代码，具体怎么落地放在下一章。

> 🇯🇵 「あちこちで `new` してオブジェクトを作る」という実際の悩みから出発して、Springコンテナが解決しようとしている問題を理解します。IoC（Inversion of Control、制御の反転）、DI（Dependency Injection、依存性の注入）、Bean（Springコンテナが一元管理するオブジェクト）、ApplicationContext（Springコンテナの実体）といった中心概念の意味と相互関係を押さえます。本章では考え方だけを扱い、完全なSpring Bootプロジェクトのコードは書きません。具体的な実装方法は次章に回します。

## 一句话理解 ／ 一言で理解する
以前是你自己 `new` 对象、自己维护对象之间的关系；用了 Spring 之后，这些"造对象、配对象"的脏活累活都交给一个叫"容器"的东西去做，你只管"要来用"。

> 🇯🇵 以前は自分でオブジェクトを `new` し、オブジェクト同士の関係も自分で維持していました。Springを使うと、この「オブジェクトを作る、組み合わせる」という面倒な作業を「コンテナ」と呼ばれるものに任せることができ、あなたは「受け取って使う」だけで済みます。

## 为什么需要它 ／ なぜ必要なのか

先别急着看概念，我们从一个真实场景开始。

> 🇯🇵 概念を先に見る前に、まず実際のシナリオから始めましょう。

假设你在写一个电商网站的后台，有一个 `UserController`，负责处理和用户相关的请求。它需要调用 `UserService` 来完成具体的业务逻辑（比如查询用户信息）。按照阶段 0 学过的写法，你大概率会这样写：

> 🇯🇵 あるECサイトのバックエンドを開発しているとして、ユーザー関連のリクエストを処理する `UserController` があるとします。具体的な業務ロジック（例えばユーザー情報の検索）を実行するには `UserService` を呼び出す必要があります。ステージ0で学んだ書き方に従うと、おそらく次のように書くでしょう。

```java
public class UserController {
    private UserService userService = new UserService();

    public User getUser(Long id) {
        return userService.getById(id);
    }
}
```

看起来没什么问题。但项目会一直长大。过不了多久，你可能又写了 `OrderController`（需要 `OrderService`）、`ProductController`（需要 `ProductService`），而 `OrderService` 内部可能又需要用到 `UserService`、`ProductService`……于是代码里到处都是这样的 `new`：

> 🇯🇵 一見問題なさそうです。しかしプロジェクトはどんどん大きくなっていきます。そのうち `OrderController`（`OrderService` が必要）や `ProductController`（`ProductService` が必要）を書くことになり、さらに `OrderService` の内部でも `UserService` や `ProductService` が必要になるかもしれません……こうしてコードのあちこちにこのような `new` が現れます。

```java
public class OrderService {
    private UserService userService = new UserService();
    private ProductService productService = new ProductService();
    // ...
}

public class OrderController {
    private OrderService orderService = new OrderService();
    // ...
}
```

现在停下来想一想，这样写下去会遇到什么问题：

> 🇯🇵 ここで一度立ち止まって、このまま書き続けるとどんな問題が起きるか考えてみましょう。

1. **对象无法复用、到处重复创建**：`UserController` 里 `new` 了一个 `UserService`，`OrderService` 里又 `new` 了一个新的 `UserService`。它们是两个不同的对象，明明逻辑上应该共用同一个"用户服务"，却各建各的。<br><span class="ja-inline">🇯🇵 **オブジェクトを再利用できず、あちこちで重複して生成される**：`UserController` の中で `UserService` を `new` し、`OrderService` の中でも別の `UserService` を `new` しています。これらは異なる2つのオブジェクトであり、論理的には同じ「ユーザーサービス」を共有すべきなのに、それぞれが個別に作られています。</span>
2. **依赖关系混乱，牵一发动全身**：如果哪天 `UserService` 的构造方法要求传入一个数据库连接参数，那所有 `new UserService(...)` 的地方都要跟着改。项目越大，这种"到处修改"的成本越高。<br><span class="ja-inline">🇯🇵 **依存関係が混乱し、一箇所を変えると全体に影響する**：もしある日 `UserService` のコンストラクタがデータベース接続のパラメータを要求するようになったら、`new UserService(...)` と書いているすべての箇所を修正しなければなりません。プロジェクトが大きくなるほど、この「あちこち修正する」コストは高くなります。</span>
3. **想换个实现类，要改很多地方**：假如 `UserService` 从"直接查数据库"改成"先查缓存再查数据库"，你希望只改一个地方就切换实现，但如果所有地方都是写死的 `new UserService()`，那就无法在不改动大量代码的前提下替换实现。<br><span class="ja-inline">🇯🇵 **実装クラスを差し替えたいとき、多くの箇所を修正する必要がある**：もし `UserService` が「直接データベースを検索する」から「まずキャッシュを検索してからデータベースを検索する」に変わったとき、本来なら1箇所を変えるだけで実装を切り替えたいはずです。しかしすべての箇所が `new UserService()` と直書きされていると、大量のコードを変更せずに実装を差し替えることができません。</span>
4. **无法统一管理对象的创建时机和数量**：这些对象什么时候创建？创建几个？谁负责在用完后处理它们？在到处 `new` 的写法里，这些问题根本没人统一管它。<br><span class="ja-inline">🇯🇵 **オブジェクトの生成タイミングと数を一元管理できない**：これらのオブジェクトはいつ作られるのか？いくつ作られるのか？使い終わったあとの後始末は誰が担当するのか？あちこちで `new` する書き方では、これらの問題を統一的に管理する人が誰もいません。</span>

说白了，问题的根源在于：**创建对象的责任，和使用对象的地方，绑在了一起**。`UserController` 既要负责"使用" `UserService`，又要负责"创建" `UserService`。这两件事本该分开。

> 🇯🇵 端的に言えば、問題の根本原因は**「オブジェクトを作る責任」と「オブジェクトを使う場所」が結びついてしまっている**ことにあります。`UserController` は `UserService` を「使う」責任だけでなく、「作る」責任まで負っています。本来この2つは分離されるべきです。

## 核心概念 ／ コアコンセプト

Spring 给出的解决方案，就是把"创建对象、管理对象之间关系"这件事，从你的业务代码里剥离出来，交给一个专门的"管家"去做。这个思路涉及几个核心概念：

> 🇯🇵 Springが提示する解決策は、「オブジェクトを作り、オブジェクト同士の関係を管理する」という作業を、あなたの業務コードから切り離し、専門の「執事」に任せることです。この考え方にはいくつかの中心概念が関わってきます。

| 概念 ／ 概念 | 含义 ／ 意味 |
|---|---|
| **Spring 容器（Container）** ／ **Springコンテナ（Container）** | 一个在程序启动时创建出来、贯穿程序整个运行期的"大管家"。它负责创建对象、维护对象之间的依赖关系、在你需要的时候把对象给你<br><span class="ja-inline">🇯🇵 プログラム起動時に生成され、プログラムの実行期間全体を通して存在する「大執事」です。オブジェクトの生成、オブジェクト同士の依存関係の維持、必要なときにオブジェクトを渡すことを担当します </span>|
| **Bean** ／ **Bean** | 交给 Spring 容器管理的对象，就叫一个 Bean。你不再自己 `new UserService()`，而是告诉 Spring"请帮我管理一个 `UserService` 类型的对象"，这个对象就成了一个 Bean<br><span class="ja-inline">🇯🇵 Springコンテナに管理を任せたオブジェクトのことをBeanと呼びます。自分で `new UserService()` するのではなく、Springに「`UserService` 型のオブジェクトを1つ管理してください」と伝えると、そのオブジェクトがBeanになります </span>|
| **IoC（Inversion of Control，控制反转）** ／ **IoC（Inversion of Control、制御の反転）** | 一种设计思想：对象的创建权，从"你自己控制"，反转成"交给容器控制"。以前是你主动 `new`，现在是容器主动帮你创建，你被动接收<br><span class="ja-inline">🇯🇵 設計思想の一つで、オブジェクトの生成権が「自分で制御する」から「コンテナに制御を任せる」へと反転することです。以前は自分から `new` していましたが、今はコンテナが自ら生成してくれて、あなたは受け取る側になります </span>|
| **DI（Dependency Injection，依赖注入）** ／ **DI（Dependency Injection、依存性の注入）** | IoC 这个思想的具体实现方式：容器在创建一个 Bean 的时候，发现它依赖另一个 Bean（比如 `UserController` 依赖 `UserService`），就会主动把已经造好的 `UserService` "喂"给 `UserController`，而不需要 `UserController` 自己去找、去 `new`<br><span class="ja-inline">🇯🇵 IoCという思想の具体的な実現方法です。コンテナはあるBeanを生成する際、それが別のBeanに依存していること（例えば `UserController` が `UserService` に依存している）を検知すると、すでに作られている `UserService` を自ら `UserController` に「渡し」ます。`UserController` 自身が探したり `new` したりする必要はありません </span>|
| **ApplicationContext** ／ **ApplicationContext** | Spring 容器在代码里的具体体现（一个 Java 接口/对象）。程序启动后，Spring 会创建一个 `ApplicationContext` 实例，所有的 Bean 都存放在里面，需要的时候可以从中取出来<br><span class="ja-inline">🇯🇵 Springコンテナがコード上で具現化したもの（Javaのインターフェース／オブジェクト）です。プログラム起動後、Springは `ApplicationContext` のインスタンスを1つ生成し、すべてのBeanがその中に格納されます。必要なときにはそこから取り出すことができます </span>|

它们之间的关系可以这样理解：**IoC 是一种思想（"权力交出去"），DI 是实现这种思想的手段（"容器主动喂给你"），Bean 是被交出去管理的对象本身，ApplicationContext 是装着所有 Bean、负责完成"喂"这个动作的容器实体。**

> 🇯🇵 これらの関係は次のように理解できます。**IoCは思想（「権限を手放す」）であり、DIはその思想を実現する手段（「コンテナが自ら渡してくれる」）であり、Beanは管理を任されたオブジェクトそのものであり、ApplicationContextはすべてのBeanを収め「渡す」という動作を実行するコンテナの実体です。**

提前打个招呼：Spring Boot 项目里，你会看到 `@Service`、`@Controller`、`@RestController` 这样的注解。它们的作用之一，就是告诉 Spring："这个类的对象，请你帮我创建成一个 Bean。" 具体怎么写、怎么运作，我们放到下一章详细讲，这里只需要知道有这么回事。

> 🇯🇵 先に一言触れておきます：Spring Bootプロジェクトでは、`@Service`、`@Controller`、`@RestController` といったアノテーションを目にします。これらの役割の一つが、Springに「このクラスのオブジェクトをBeanとして作成してください」と伝えることです。具体的な書き方や仕組みは次章で詳しく説明するので、ここではそういうものがあると知っておくだけで十分です。

## 图解 ／ 図解

先看"没有 Spring"时的写法（控制权在你手里）：

> 🇯🇵 まず「Springを使わない」場合の書き方（制御権があなたの手にある）を見てみましょう。

```
你的代码：
  UserController ──自己 new──▶ UserService 实例 A
  OrderService   ──自己 new──▶ UserService 实例 B（又造了一个，浪费且不统一）
```

再看"用了 Spring"之后（控制权交给容器）：

> 🇯🇵 次に「Springを使った」あと（制御権をコンテナに渡した）を見てみましょう。

```
程序启动
  ↓
Spring 容器（ApplicationContext）
  ↓ 创建
UserService 实例（只造一份，作为一个 Bean 放进容器）
  ↓ 需要用到 UserService 的地方，容器主动"喂"给它
UserController（拿到同一个 UserService 实例，不用自己 new）
OrderService（也拿到同一个 UserService 实例，不用自己 new）
```

对比一下会发现，核心变化就一句话：**以前是"你去找对象"，现在是"对象找上门来"**——这也是"控制反转"这个名字的由来：主动权从你手里，反转到了容器手里。

> 🇯🇵 比べてみると、核心となる変化は一言でまとめられます。**以前は「あなたがオブジェクトを探しに行く」でしたが、今は「オブジェクトの方からやって来る」**のです——これが「制御の反転」という名前の由来でもあります。主導権があなたの手からコンテナの手に反転したのです。

## 最小示例 ／ 最小限のサンプル

本章还没有学 Maven、还没有创建真正的 Spring Boot 项目（这些留到接下来两章），所以这里先用伪代码演示 Spring 容器"大概会怎么做"，帮你建立直观印象，不要求现在能跑起来：

> 🇯🇵 本章ではまだMavenを学んでおらず、実際のSpring Bootプロジェクトもまだ作成していません（これらは次の2章で扱います）。そのため、ここでは擬似コードでSpringコンテナが「だいたいどのように動くか」を示し、直感的なイメージをつかんでもらいます。今動かせる必要はありません。

```java
// 告诉 Spring："这个类的对象请你帮我管理"
@Service
public class UserService {
    public User getById(Long id) {
        // 业务逻辑（示意，具体查数据库的写法后面章节讲）
        return new User(id, "小明");
    }
}

// 告诉 Spring："这个类的对象也请你帮我管理"
@RestController
public class UserController {
    // 不再自己 new，而是"等着容器把 UserService 喂给我"
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

## 代码逐行解释 ／ コードの行ごとの解説

- `@Service`：一个 Spring 注解，贴在类上，意思是"请把这个类的对象创建成一个 Bean，交给容器管理"。你在阶段 0 第 9 章已经知道注解是给代码"贴标签"，这里的标签是给 Spring 看的。<br><span class="ja-inline">🇯🇵 `@Service`：Springのアノテーションで、クラスに付けます。「このクラスのオブジェクトをBeanとして作成し、コンテナに管理を任せてください」という意味です。ステージ0の第9章で、アノテーションはコードに「ラベルを貼る」ものだと学びましたが、ここでのラベルはSpringに向けたものです。</span>
- `@RestController`：同样是告诉 Spring"这个类也要交给容器管理"，此外它还表示这个类专门用来处理 HTTP 请求（具体细节留到第 20 章讲）。<br><span class="ja-inline">🇯🇵 `@RestController`：同じくSpringに「このクラスもコンテナに管理を任せる」ことを伝えますが、それに加えてこのクラスがHTTPリクエストを処理する専用のクラスであることも示します（詳細は第20章で説明します）。</span>
- `UserController` 的构造方法 `public UserController(UserService userService)`：这就是"依赖注入"发生的地方——Spring 在创建 `UserController` 这个 Bean 的时候，发现它的构造方法需要一个 `UserService`，于是会自动去容器里找一个已经造好的 `UserService` Bean，把它作为参数传进来。这种写法叫"构造器注入"，是本教程接下来会重点使用、也是官方推荐的写法，下一章会详细展开。<br><span class="ja-inline">🇯🇵 `UserController` のコンストラクタ `public UserController(UserService userService)`：これこそが「依存性の注入」が起こる場所です——Springは `UserController` というBeanを生成するとき、そのコンストラクタが `UserService` を必要としていることを見つけると、コンテナ内からすでに作られている `UserService` のBeanを自動的に探し出し、引数として渡します。この書き方は「コンストラクタインジェクション」と呼ばれ、本チュートリアルが今後中心的に使い、公式でも推奨されている書き方です。次章で詳しく展開します。</span>
- `this.userService = userService;`：把传进来的 `UserService` 对象保存到字段里，后面方法里就能用了。注意：**这个对象从头到尾，`UserController` 自己一次都没有 `new` 过**。<br><span class="ja-inline">🇯🇵 `this.userService = userService;`：渡された `UserService` オブジェクトをフィールドに保存し、以降のメソッドで使えるようにします。注意してほしいのは、**このオブジェクトを `UserController` 自身は一度も `new` していない**という点です。</span>

## 程序运行过程 ／ プログラムの実行の流れ

这里只讲思路（不涉及真实 Spring Boot 启动细节，那是后面几章的内容）：

> 🇯🇵 ここでは考え方だけを説明します（実際のSpring Boot起動の詳細には触れません。それは後の章の内容です）。

1. 程序启动，Spring 创建出容器（`ApplicationContext`）。<br><span class="ja-inline">🇯🇵 プログラムが起動し、Springがコンテナ（`ApplicationContext`）を生成します。</span>
2. 容器发现 `UserService` 类上贴了 `@Service`，于是创建一个 `UserService` 对象，作为 Bean 放进容器里。<br><span class="ja-inline">🇯🇵 コンテナは `UserService` クラスに `@Service` が付いていることを見つけ、`UserService` オブジェクトを1つ生成してBeanとしてコンテナに入れます。</span>
3. 容器发现 `UserController` 类上贴了 `@RestController`，准备创建它的对象时，看到构造方法需要一个 `UserService` 类型的参数。<br><span class="ja-inline">🇯🇵 コンテナは `UserController` クラスに `@RestController` が付いていることを見つけ、そのオブジェクトを生成しようとする際、コンストラクタが `UserService` 型の引数を必要としていることに気づきます。</span>
4. 容器去自己管理的 Bean 里找类型匹配的 `UserService`——刚好第 2 步已经造好了一个，直接拿来用，"喂"给 `UserController` 的构造方法。<br><span class="ja-inline">🇯🇵 コンテナは自分が管理しているBeanの中から型が一致する `UserService` を探します——ちょうど手順2ですでに1つ作られているので、それをそのまま使い、`UserController` のコンストラクタに「渡し」ます。</span>
5. `UserController` 对象创建完成，也作为 Bean 放进容器。<br><span class="ja-inline">🇯🇵 `UserController` オブジェクトの生成が完了し、これもBeanとしてコンテナに入れられます。</span>
6. 此后只要有请求需要用到 `UserController`，容器里已经有现成的实例，直接使用，不需要重新创建。<br><span class="ja-inline">🇯🇵 これ以降、`UserController` を必要とするリクエストが来ても、コンテナにはすでに出来上がったインスタンスがあるため、そのまま使えばよく、新たに生成する必要はありません。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 误以为"用了 Spring 就不需要写 `new` 关键字了" | 理解有偏差<br><span class="ja-inline">🇯🇵 理解にずれがある </span>| Spring 不是消灭了 `new`，而是把"什么时候 `new`、`new` 几次"这件事，从你的业务代码里挪到了容器内部统一管理<br><span class="ja-inline">🇯🇵 Springは `new` を無くしたわけではなく、「いつ `new` するか、何回 `new` するか」を業務コードからコンテナ内部の一元管理へ移しただけです </span>|
| 把 IoC 和 DI 当成两个毫无关系的独立概念死记硬背 | 没有理清"思想"和"实现手段"的关系<br><span class="ja-inline">🇯🇵 「思想」と「実現手段」の関係を整理できていない </span>| 记住一句话：IoC 是理念（"别自己控制对象创建"），DI 是这套理念在 Spring 里具体的落地方式（"容器主动把依赖喂给你"）<br><span class="ja-inline">🇯🇵 一言で覚えましょう：IoCは理念（「自分でオブジェクト生成を制御しない」）であり、DIはこの理念をSpringで具体的に実現する方式（「コンテナが自ら依存関係を渡してくれる」）です </span>|
| 以为 Bean 是某种特殊的 Java 语法 | 混淆概念<br><span class="ja-inline">🇯🇵 概念の混同 </span>| Bean 只是一个"身份"——一个普通的 Java 对象，只要被交给 Spring 容器管理，就可以被称为一个 Bean，它本身的类不需要继承任何特殊父类<br><span class="ja-inline">🇯🇵 Beanはあくまで「立場」にすぎません——普通のJavaオブジェクトが、Springコンテナに管理を任されればBeanと呼ばれるようになるだけで、そのクラス自体が特別な親クラスを継承する必要はありません </span>|

## 动手练习 ／ 演習

1. 找一段你自己以前写过的（或者本教程前面章节练习里的）代码，看看里面有没有"一个类里 `new` 另一个类"的写法，思考一下：如果用 Spring 容器接管，会变成什么样？<br><span class="ja-inline">🇯🇵 自分が以前書いたコード（または本チュートリアルの前の章の演習）の中から、「あるクラスの中で別のクラスを `new` する」書き方がないか探し、もしSpringコンテナに任せるとどうなるか考えてみましょう。</span>
2. 假设项目里有 `OrderService` 依赖 `UserService` 和 `ProductService`，画一张类似"图解"部分的示意图，表示 Spring 容器创建这三个 Bean、并把依赖关系"喂"进去的过程。<br><span class="ja-inline">🇯🇵 プロジェクト内で `OrderService` が `UserService` と `ProductService` に依存していると仮定し、「図解」部分のような概念図を描いて、Springコンテナがこの3つのBeanを生成し依存関係を「渡す」過程を表現してみましょう。</span>
3. 用自己的话，向一个完全没学过 Spring 的朋友解释一遍"控制反转"，尽量不用英文缩写。<br><span class="ja-inline">🇯🇵 Springを全く学んだことのない友人に、自分の言葉で「制御の反転」を説明してみましょう。できるだけ英語の略語を使わないようにします。</span>

## 小测验 ／ 小テスト

1. "控制反转"里，反转的到底是什么"控制权"？<br><span class="ja-inline">🇯🇵 「制御の反転」において、反転しているのは一体どんな「制御権」ですか？</span>
2. Bean 和普通 Java 对象有什么区别？<br><span class="ja-inline">🇯🇵 BeanとふつうのJavaオブジェクトには、どんな違いがありますか？</span>
3. ApplicationContext 和 IoC、DI、Bean 分别是什么关系？<br><span class="ja-inline">🇯🇵 ApplicationContextとIoC、DI、Beanは、それぞれどのような関係にありますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 反转的是"对象创建的控制权"。以前由使用对象的那个类自己控制（自己 `new`），现在这个控制权交给了 Spring 容器，由容器统一创建和管理。<br><span class="ja-inline">🇯🇵 反転しているのは「オブジェクト生成の制御権」です。以前はオブジェクトを使うクラス自身が制御していました（自分で `new` する）が、今はこの制御権がSpringコンテナに渡され、コンテナが一元的に生成・管理します。</span>
2. 没有本质区别——Bean 就是一个普通的 Java 对象，唯一的不同是它被交给了 Spring 容器管理（容器负责创建它、维护它和其他 Bean 的依赖关系）。一个类本身不需要做任何特殊改造就能成为 Bean。<br><span class="ja-inline">🇯🇵 本質的な違いはありません——Beanはただの普通のJavaオブジェクトであり、唯一の違いはSpringコンテナに管理を任されている点です（コンテナがその生成と、他のBeanとの依存関係の維持を担います）。クラス自体は特別な改造をしなくてもBeanになれます。</span>
3. ApplicationContext 是 IoC 这个思想在代码里的具体实现——它是一个实实在在的容器对象，负责保存所有的 Bean，并且在创建 Bean 时执行 DI（把依赖注入进去）。可以说 IoC 是理念，DI 是手段，Bean 是被管理的对象，ApplicationContext 是承载这一切、真正干活的那个容器。<br><span class="ja-inline">🇯🇵 ApplicationContextはIoCという思想をコード上で具現化したものです——実体を持つコンテナオブジェクトであり、すべてのBeanを保持し、Bean生成時にDI（依存性を注入する処理）を実行します。IoCは理念、DIは手段、Beanは管理される対象、ApplicationContextはこれらすべてを担い実際に動くコンテナだと言えます。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了为什么不能到处 `new` 对象，也知道了 Spring 用"容器统一创建和管理对象（IoC），并在需要时把依赖对象喂给你（DI）"的方式解决了这个问题。Bean 就是被容器管理的对象，ApplicationContext 就是那个容器本身。下一章开始，我们正式落地：搞清楚 Bean 到底是怎么被创建出来的，以及本教程主推的"构造器注入"具体怎么写。

> 🇯🇵 これで、なぜあちこちでオブジェクトを `new` してはいけないのかを理解し、Springが「コンテナがオブジェクトを一元的に生成・管理し（IoC）、必要なときに依存オブジェクトを渡してくれる（DI）」という方法でこの問題を解決したことも分かりました。Beanはコンテナに管理されるオブジェクトであり、ApplicationContextはそのコンテナ自身です。次章からいよいよ実装に入ります：Beanが実際にどのように生成されるのか、そして本チュートリアルが推す「コンストラクタインジェクション」を具体的にどう書くのかを明らかにしていきます。
