# 第 9 章　Lambda、Stream、Optional 与注解入门 ／ 第9章　Lambda・Stream・Optionalとアノテーション入門

## 本章目标 ／ 本章の目標
理解 Lambda 表达式的基础写法（对比匿名内部类）；掌握 Stream 的 `filter/map/collect` 最基础用法；理解 `Optional` 解决的"到底要不要判空"问题；最重要的是理解**注解（Annotation）到底是什么**，并认识 `@Service`、`@RestController`、`@GetMapping`、`@PostMapping`、`@Mapper` 这几个后面会反复出现的标签。

> 🇯🇵 Lambda式の基本的な書き方を理解します（匿名内部クラスとの比較）。Streamの `filter/map/collect` の最も基本的な使い方を習得します。`Optional` が解決する「結局nullチェックをすべきかどうか」という問題を理解します。そして最も重要なのは、**アノテーション（Annotation、注解）とは一体何かを理解する**ことです。また `@Service`、`@RestController`、`@GetMapping`、`@PostMapping`、`@Mapper` という、後で繰り返し登場するいくつかのタグ（印）を知ります。

## 一句话理解 ／ 一言で理解する
Lambda 是"把一小段行为当成参数传来传去"的简写方式；Stream 是"把集合的处理过程写成一条流水线"；Optional 是"明确告诉你这个值可能没有，逼你处理一下"；注解就是**贴在代码上的标签**，本身不是魔法，只是框架在特定时机会去读这些标签，然后决定做什么事。

> 🇯🇵 Lambdaは「小さな振る舞いを引数として渡す」ための省略記法です。Streamは「コレクションの処理過程を1本の流れ作業として書く」ものです。Optionalは「この値がないかもしれないことを明確に伝え、対処せざるを得なくする」ものです。アノテーションは**コードに貼るタグ（印）**であり、それ自体は魔法ではなく、フレームワークが特定のタイミングでこれらのタグを読み取り、何をするか決めるだけです。

## 为什么需要它 ／ なぜ必要なのか
第 6 章的接口已经让你看到"把行为当参数传递"的影子（比如 `sayHello(Greetable g)`），但每次都要单独写一个实现类有点啰嗦，Lambda 提供了更简洁的写法。第 8 章操作 `List` 时，经常要做"筛选一批、转换一批、再收集起来"这类操作，一层套一层的 `for` 循环写起来啰嗦又难读，Stream 把这类操作写成清晰的链式调用。而"某个值到底存不存在"是几乎所有业务代码都会遇到的问题，`Optional` 把这件事变得更明确。至于注解——从下一阶段开始，你会看到代码里到处都是 `@XxxYyy` 这种写法，如果不先搞懂它的本质，很容易把它当成"看不懂但能跑就行"的黑箱，这一节要把这层迷雾先捅破。

> 🇯🇵 第6章のインターフェースですでに「振る舞いを引数として渡す」ことの片鱗（`sayHello(Greetable g)` など）を見てきましたが、毎回わざわざ実装クラスを1つ書くのは少し冗長です。Lambdaはより簡潔な書き方を提供します。第8章で `List` を操作する際、「一部を絞り込んで、変換して、また集める」といった操作をよく行いますが、`for` ループを何重にも重ねる書き方は冗長で読みにくいものです。Streamはこうした操作をわかりやすい連鎖呼び出しとして書けるようにします。そして「ある値が実際に存在するかどうか」はほぼすべての業務コードで遭遇する問題であり、`Optional` はこれをより明確にします。アノテーションについては——次の段階からコードのあちこちに `@XxxYyy` という書き方が出てくるようになります。その本質を先に理解しておかないと、簡単に「わからないけど動けばいい」というブラックボックス扱いにしてしまいがちです。この節ではまずこの霧を晴らします。

## 核心概念 ／ コアコンセプト

### 9.1 Lambda 表达式：对比匿名内部类 ／ Lambda式：匿名内部クラスとの比較

回忆第 6 章的接口写法：想传一段"行为"给别的方法，通常需要专门写一个实现类。如果这个接口只有**一个**方法（这种接口有个专门名字，叫"函数式接口"），Java 允许用更简洁的写法。

> 🇯🇵 第6章のインターフェースの書き方を思い出してください。「振る舞い」を別のメソッドに渡したい場合、通常は専用の実装クラスを書く必要があります。もしこのインターフェースが**1つだけ**のメソッドを持つ場合（この種のインターフェースには専用の名前があり、「関数型インターフェース」と呼ばれます）、Javaはより簡潔な書き方を許します。

先看"匿名内部类"写法（不用单独定义一个 `.java` 文件，直接在需要的地方"就地"实现接口）：

> 🇯🇵 まず「匿名内部クラス」の書き方を見てみましょう（`.java` ファイルを別途定義する必要はなく、必要な場所で直接「その場で」インターフェースを実装します）。

```java
Greetable g1 = new Greetable() {
    @Override
    public void greet() {
        System.out.println("老师好！（匿名内部类写法）");
    }
};
g1.greet();
```

同样的效果，用 Lambda 表达式写：
> 🇯🇵 同じ効果を、Lambda式で書くと：

```java
Greetable g2 = () -> System.out.println("老师好！（Lambda 写法）");
g2.greet();
```

`() -> System.out.println(...)` 就是一个 Lambda 表达式，读法是"括号里是参数列表（这里没有参数），箭头后面是方法体要执行的内容"。它和上面的匿名内部类**效果完全一样**，只是省去了 `new Greetable() { @Override public void greet() {...} }` 这一大堆固定格式，只留下真正有意义的那一行逻辑。

> 🇯🇵 `() -> System.out.println(...)` がLambda式であり、「括弧内は引数リスト（ここでは引数なし）、矢印の後ろがメソッド本体で実行する内容」と読みます。これは上の匿名内部クラスと**全く同じ効果**ですが、`new Greetable() { @Override public void greet() {...} }` という大量の決まり切った書式を省略し、本当に意味のある1行のロジックだけを残しています。

Lambda 的通用格式：
> 🇯🇵 Lambdaの一般的な書式：

```java
(参数列表) -> { 方法体（可以多行） }
```

如果方法体只有一行，还可以省略大括号和 `return`（如果这行是表达式而不是语句）：

> 🇯🇵 メソッド本体が1行だけの場合、波括弧と `return` を省略することもできます（この1行が文ではなく式である場合）。

```java
// 假设有个接口 Calculator，里面有个方法 int calc(int a, int b);
Calculator add = (a, b) -> a + b;
System.out.println(add.calc(3, 5)); // 8
```

### 9.2 Stream 基础：filter / map / collect ／ Streamの基礎：filter / map / collect

`Stream` 提供了一套"链式"处理集合的方式。先看不用 Stream，用传统 `for` 循环筛选并转换数据：

> 🇯🇵 `Stream` はコレクションを「連鎖的に」処理する方法を提供します。まずStreamを使わず、従来の `for` ループでデータを絞り込み変換する場合を見てみましょう。

```java
List<String> longNames = new ArrayList<>();
for (User user : users) {
    if (user.getName().length() >= 2) {   // 筛选
        longNames.add(user.getName());     // 转换（取出名字）并收集
    }
}
```

用 Stream 写同样的逻辑：
> 🇯🇵 同じロジックをStreamで書くと：

```java
List<String> longNames = users.stream()
        .filter(user -> user.getName().length() >= 2) // 筛选：只留下满足条件的
        .map(user -> user.getName())                   // 转换：把 User 对象变成它的名字（String）
        .collect(Collectors.toList());                 // 收集：把结果重新装回一个 List
```

三个方法各自的职责：
> 🇯🇵 3つのメソッドそれぞれの役割：

- `filter(条件)`：只留下满足条件（返回 `true`）的元素，条件写成一个 Lambda。<br><span class="ja-inline">🇯🇵 `filter(条件)`：条件を満たす（`true` を返す）要素だけを残します。条件はLambdaとして書きます。</span>
- `map(转换规则)`：把每个元素按规则转换成另一种形式（这里从 `User` 变成 `String`）。<br><span class="ja-inline">🇯🇵 `map(変換ルール)`：各要素をルールに従って別の形式に変換します（ここでは `User` から `String` へ）。</span>
- `collect(Collectors.toList())`：把处理完的结果重新收集成一个 `List`。<br><span class="ja-inline">🇯🇵 `collect(Collectors.toList())`：処理し終えた結果を1つの `List` に再び収集します。</span>

本教程只在这里做最基础的介绍，`filter/map/collect` 这三个方法足够应付后面大部分场景，暂不展开更复杂的链式组合（比如排序、分组、统计），需要时再单独学习即可。

> 🇯🇵 本チュートリアルではここでは最も基本的な紹介にとどめます。`filter/map/collect` の3つのメソッドは以降のほとんどの場面に十分対応でき、より複雑な連鎖の組み合わせ（ソート、グループ化、集計など）はここでは扱いません。必要になったときに個別に学習すればよいでしょう。

### 9.3 Optional：把"要不要判空"说清楚 ／ Optional：「nullチェックをすべきかどうか」を明確にする

第 8 章提到过 `Map.get(key)` 在 key 不存在时会返回 `null`，取到 `null` 之后忘记判断就直接调用方法，会抛出 `NullPointerException`。`Optional` 就是 Java 专门用来"明确表达一个值可能不存在"的容器：

> 🇯🇵 第8章で述べたように、`Map.get(key)` はkeyが存在しない場合 `null` を返します。`null` を取得した後、判定を忘れて直接メソッドを呼び出すと `NullPointerException` がスローされます。`Optional` はJavaが「ある値が存在しない可能性がある」ことを明確に表現するために専用に用意したコンテナです。

```java
Optional<User> maybeUser = Optional.ofNullable(userMap.get("xiaowang")); // 可能为 null，包装成 Optional

if (maybeUser.isPresent()) {
    System.out.println(maybeUser.get().getName());
} else {
    System.out.println("用户不存在");
}
```

更常见、更简洁的写法：
> 🇯🇵 より一般的で簡潔な書き方：

```java
String name = maybeUser
        .map(User::getName)      // 如果存在，转换成名字
        .orElse("匿名用户");       // 如果不存在，用默认值兜底
System.out.println(name);
```

`Optional` 的价值不在于"消灭了判空"，而在于**强迫写代码的人和看代码的人，都清楚意识到"这里的值可能不存在"**，比一个可能悄悄返回 `null` 却没有任何提示的方法安全得多。

> 🇯🇵 `Optional` の価値は「nullチェックをなくす」ことではなく、**コードを書く人と読む人の両方に「ここの値は存在しないかもしれない」ことをはっきり意識させる**ことにあります。何の予告もなくこっそり `null` を返す可能性のあるメソッドよりもずっと安全です。

### 9.4 注解（Annotation）到底是什么 ／ アノテーション（Annotation、注解）とは一体何か

**这是本章最重要的一节。** 从下一阶段开始，你会看到大量 `@` 开头的写法，比如 `@Service`、`@RestController`。很多初学者第一次看到这些会觉得"这是什么魔法语法"，但其实：

> 🇯🇵 **これが本章で最も重要な節です。** 次の段階から、`@Service`、`@RestController` のような `@` で始まる書き方をたくさん目にすることになります。多くの初心者は初めてこれを見たとき「これは何の魔法の構文だろう」と感じますが、実際には：

**`@` 开头的东西不是魔法，它就是一种给代码"打标签"的方式。** 你贴上标签之后，代码本身该怎么执行，逻辑并没有变化；但是有一些"框架"（比如后面会学的 Spring）在启动的时候，会专门去扫描代码里贴了哪些标签，然后根据标签的种类，决定要不要对这段代码做点额外的事情。

> 🇯🇵 **`@` で始まるものは魔法ではなく、コードに「タグ（印）を貼る」ための方法にすぎません。** タグを貼った後も、コード自体がどう実行されるかというロジックは変わりません。しかし一部の「フレームワーク」（例えば後で学ぶSpring）は起動時に、コードにどんなタグが貼られているかを専用にスキャンし、タグの種類に応じてそのコードに対して追加の処理をするかどうかを決めます。

打个类比：注解就像给快递包裹贴的标签——"易碎品"、"加急"、"生鲜"。包裹本身该怎么运输，物理上没有任何变化；但快递公司的分拣系统会读这些标签，看到"易碎品"就多裹一层泡沫，看到"加急"就优先处理。**标签本身不会自己做任何事，是"读标签的人"（分拣系统 / 框架）根据标签采取了行动。**

> 🇯🇵 例えるなら、アノテーションは宅配便の荷物に貼るタグのようなものです——「割れ物注意」「速達」「生鮮品」。荷物自体がどう運ばれるかは物理的には何も変わりません。しかし宅配会社の仕分けシステムがこれらのタグを読み取り、「割れ物注意」を見たら緩衝材を1枚多く巻き、「速達」を見たら優先的に処理します。**タグ自体は何もしません。「タグを読む人」（仕分けシステム／フレームワーク）がタグに基づいて行動を起こすのです。**

Java 里最简单的注解你其实早就用过——第 6 章的 `@Override`。它贴在方法上，告诉**编译器**"这个方法应该是在重写父类或实现接口的方法"，编译器读到这个标签后，会去做一次额外的检查：如果发现这个方法根本没有正确重写任何东西，就报错提醒你。这就是注解最朴素的工作方式：**贴标签 → 有人在特定时机读取这个标签 → 根据标签做一件事**（这里"读标签的人"是编译器，"做的事"是做检查）。

> 🇯🇵 実はJavaで最も単純なアノテーションはすでに使ったことがあります——第6章の `@Override` です。これはメソッドに貼られ、**コンパイラ**に「このメソッドは親クラスをオーバーライドしているか、インターフェースを実装しているはずだ」と伝えます。コンパイラはこのタグを読み取ると、追加のチェックを行います。もしこのメソッドが実際には何も正しくオーバーライドしていないと分かれば、エラーを出して知らせます。これがアノテーションの最も素朴な動作方式です。**タグを貼る → 誰かが特定のタイミングでこのタグを読み取る → タグに基づいて何かをする**（ここでは「タグを読む人」はコンパイラで、「する事」はチェックです）。

后面从第 15 章开始，你会正式学习 Spring 框架，届时会看到一大批注解，Spring 容器启动时会扫描这些标签，来决定"这个类要不要交给容器管理"、"这个方法应该在什么样的请求进来时被调用"等等。这里先建立最初步的印象，认识这几个后面反复出现的注解——**此时只需要知道"这是什么标签、大概是干什么用的"，具体 Spring 怎么处理它们，后面第 15 章开始会详细讲**：

> 🇯🇵 後で第15章から正式にSpringフレームワークを学びます。その時には大量のアノテーションを目にすることになり、Springコンテナは起動時にこれらのタグをスキャンして、「このクラスをコンテナに管理させるべきか」「このメソッドはどんなリクエストが来たときに呼び出されるべきか」などを決定します。ここではまず最初の印象を持ち、後で繰り返し登場するこれらのアノテーションを知っておきましょう——**今は「これがどんなタグで、大体何に使うのか」だけを知っていれば十分で、Springが具体的にどう処理するかは第15章から詳しく説明します**。

| 注解 ／ アノテーション | 大概是什么标签 ／ 大体どんなタグか |
|---|---|
| `@Service` | 贴在一个类上，表示"这是一个业务逻辑类，交给框架统一管理"。<br><span class="ja-inline">🇯🇵 クラスに貼り、「これは業務ロジックのクラスであり、フレームワークに一元管理させる」ことを表す。 </span>|
| `@RestController` | 贴在一个类上，表示"这是一个专门处理网页请求、并且直接返回数据（比如 JSON）的类"。<br><span class="ja-inline">🇯🇵 クラスに貼り、「これはWebリクエストを専門に処理し、データ（例えばJSON）を直接返すクラスである」ことを表す。 </span>|
| `@GetMapping` | 贴在一个方法上，表示"当有人用 GET 方式访问某个网址时，就调用这个方法"。<br><span class="ja-inline">🇯🇵 メソッドに貼り、「誰かがGET方式であるURLにアクセスしたときに、このメソッドを呼び出す」ことを表す。 </span>|
| `@PostMapping` | 贴在一个方法上，表示"当有人用 POST 方式访问某个网址时，就调用这个方法"。<br><span class="ja-inline">🇯🇵 メソッドに貼り、「誰かがPOST方式であるURLにアクセスしたときに、このメソッドを呼び出す」ことを表す。 </span>|
| `@Mapper` | 贴在一个接口上，表示"这个接口是用来操作数据库的，框架会自动帮它生成具体的实现"。<br><span class="ja-inline">🇯🇵 インターフェースに貼り、「このインターフェースはデータベース操作用であり、フレームワークが自動的に具体的な実装を生成してくれる」ことを表す。 </span>|

现在不需要理解这些注解具体是怎么"被框架读取并生效"的，只需要记住一句话：**看到 `@XxxYyy`，先把它当成一个标签，大致猜它想表达什么意思，具体谁在什么时候读它、读了之后做什么，后面学到对应章节自然会讲清楚。**

> 🇯🇵 今はこれらのアノテーションが具体的にどのように「フレームワークに読み取られて機能する」のか理解する必要はなく、次の一言だけ覚えておけば十分です。**`@XxxYyy` を見たら、まずそれをタグとみなし、大体どんな意味を表したいのか推測すればよい。具体的に誰がいつそれを読み、読んだ後に何をするのかは、後で対応する章を学べば自然にわかるようになる。**

## 图解 ／ 図解

```
Lambda：把"一段行为"简化成一行代码传递

匿名内部类：new Greetable() { public void greet() {...} }   ← 啰嗦但等价
Lambda：                   () -> System.out.println(...)     ← 简洁

Stream：像流水线一样处理集合

users.stream()
     │
     ▼
  filter(条件)   ── 只留下满足条件的
     │
     ▼
  map(转换规则)   ── 把每个元素变成另一种形式
     │
     ▼
  collect(...)    ── 收集成最终结果（比如 List）

Optional：明确表达"可能没有值"

Optional<User> ──▶ isPresent()? ──是──▶ get()
                        │
                        否
                        ▼
                    orElse(默认值)

注解：贴标签，框架在特定时机读取
   @Override
      │
      ▼
   编译器在编译阶段读取这个标签
      │
      ▼
   检查这个方法是否真的重写了父类/接口的方法
```

## 最小示例 ／ 最小限のサンプル

`LambdaStreamOptionalDemo.java`
```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

public class LambdaStreamOptionalDemo {
    public static void main(String[] args) {
        // ---------- Lambda ----------
        Greetable g1 = new Greetable() { // 匿名内部类写法
            @Override
            public void greet() {
                System.out.println("老师好！（匿名内部类写法）");
            }
        };
        Greetable g2 = () -> System.out.println("老师好！（Lambda 写法）"); // Lambda 写法，效果一样
        g1.greet();
        g2.greet();

        // ---------- Stream ----------
        List<User> users = new ArrayList<>();
        users.add(new User("小明"));
        users.add(new User("阿"));  // 只有一个字，长度不足 2，会被 filter 过滤掉
        users.add(new User("小红"));

        List<String> longNames = users.stream()
                .filter(user -> user.getName().length() >= 2)
                .map(user -> user.getName())
                .collect(Collectors.toList());
        System.out.println("名字长度 >= 2 的用户：" + longNames);

        // ---------- Optional ----------
        Map<String, User> userMap = new HashMap<>();
        userMap.put("xiaoming", users.get(0));

        Optional<User> maybeUser = Optional.ofNullable(userMap.get("xiaowang")); // 这个 key 不存在
        String name = maybeUser.map(User::getName).orElse("匿名用户");
        System.out.println("查询结果：" + name);
    }
}

interface Greetable {
    void greet();
}

class User {
    private String name;

    public User(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `Greetable g1 = new Greetable() { @Override public void greet() {...} };`：匿名内部类写法，在 `new` 接口的同时直接把实现写在大括号里，不需要单独声明一个 `class XxxImpl implements Greetable`。<br><span class="ja-inline">🇯🇵 `Greetable g1 = new Greetable() { @Override public void greet() {...} };`：匿名内部クラスの書き方です。インターフェースを `new` すると同時に実装を波括弧内に直接書き、`class XxxImpl implements Greetable` を別途宣言する必要がありません。</span>
- `Greetable g2 = () -> System.out.println(...);`：Lambda 写法，因为 `Greetable` 接口只有一个抽象方法 `greet()`（没有参数），所以 Lambda 的括号里是空的，箭头后面的语句就是 `greet()` 方法体要执行的内容。<br><span class="ja-inline">🇯🇵 `Greetable g2 = () -> System.out.println(...);`：Lambdaの書き方です。`Greetable` インターフェースには抽象メソッド `greet()`（引数なし）が1つしかないため、Lambdaの括弧内は空であり、矢印の後ろの文が `greet()` メソッド本体で実行する内容になります。</span>
- `users.stream()`：把 `List` 转换成一个 `Stream`，开始链式处理。<br><span class="ja-inline">🇯🇵 `users.stream()`：`List` を `Stream` に変換し、連鎖処理を開始します。</span>
- `.filter(user -> user.getName().length() >= 2)`：Lambda 参数是 `user`（类型由编译器自动推断为 `User`），返回值是 `boolean`，只有返回 `true` 的元素才会留下来进入下一步。<br><span class="ja-inline">🇯🇵 `.filter(user -> user.getName().length() >= 2)`：Lambdaの引数は `user`（型はコンパイラが自動的に `User` と推論）で、戻り値は `boolean` です。`true` を返す要素だけが残り、次のステップに進みます。</span>
- `.map(user -> user.getName())`：把每个还留在流水线里的 `User` 对象转换成它的 `name`（`String`）。<br><span class="ja-inline">🇯🇵 `.map(user -> user.getName())`：流れ作業の中にまだ残っている各 `User` オブジェクトをその `name`（`String`）に変換します。</span>
- `.collect(Collectors.toList())`：把流水线处理完的结果重新收集成一个 `List<String>`。<br><span class="ja-inline">🇯🇵 `.collect(Collectors.toList())`：流れ作業で処理し終えた結果を1つの `List<String>` に再び収集します。</span>
- `Optional.ofNullable(userMap.get("xiaowang"))`：`userMap.get("xiaowang")` 因为 key 不存在会返回 `null`，`ofNullable` 把这个可能是 `null` 的值包装成一个 `Optional`，无论里面到底是不是 `null`，都统一用 `Optional` 的方式来处理。<br><span class="ja-inline">🇯🇵 `Optional.ofNullable(userMap.get("xiaowang"))`：`userMap.get("xiaowang")` はkeyが存在しないため `null` を返します。`ofNullable` はこの `null` かもしれない値を `Optional` に包み、中身が実際に `null` かどうかにかかわらず、統一的に `Optional` の方式で処理できるようにします。</span>
- `.map(User::getName)`：`User::getName` 是"方法引用"，等价于写 `user -> user.getName()`，是 Lambda 的一种更简洁的写法，专门用在"直接调用某个已有方法"的场景。<br><span class="ja-inline">🇯🇵 `.map(User::getName)`：`User::getName` は「メソッド参照」であり、`user -> user.getName()` と書くのと同等です。Lambdaのさらに簡潔な書き方で、「既存のメソッドを直接呼び出す」場面に特化して使われます。</span>
- `.orElse("匿名用户")`：如果 `Optional` 里确实有值，取出转换后的结果；如果没有值（本例就是这种情况，因为 `"xiaowang"` 这个 key 不存在），就用 `"匿名用户"` 作为兜底默认值。<br><span class="ja-inline">🇯🇵 `.orElse("匿名用户")`：もし `Optional` に本当に値があれば、変換後の結果を取り出します。値がない場合（本例がこのケースで、`"xiaowang"` というkeyが存在しないため）は、`"匿名用户"` をデフォルト値として使います。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. `g1.greet()` 和 `g2.greet()` 分别执行匿名内部类和 Lambda 定义的 `greet()` 方法，虽然写法不同，但从 JVM 的角度看，效果是等价的——两者都是 `Greetable` 接口的一个具体实现，只是写法上 Lambda 更简洁。<br><span class="ja-inline">🇯🇵 `g1.greet()` と `g2.greet()` はそれぞれ匿名内部クラスとLambdaで定義された `greet()` メソッドを実行します。書き方は異なりますが、JVMの観点から見ると効果は同等です——どちらも `Greetable` インターフェースの具体的な実装であり、書き方の面でLambdaがより簡潔なだけです。</span>
2. `users.stream()` 开始，`filter` 依次检查每个 `User` 的名字长度，"阿"（长度 1）被过滤掉，"小明"、"小红"留下。<br><span class="ja-inline">🇯🇵 `users.stream()` が始まり、`filter` は各 `User` の名前の長さを順にチェックします。「阿」（長さ1）はフィルタで除外され、「小明」「小红」が残ります。</span>
3. `map` 把留下的两个 `User` 对象分别转换成字符串 `"小明"`、`"小红"`。<br><span class="ja-inline">🇯🇵 `map` は残った2つの `User` オブジェクトをそれぞれ文字列 `"小明"`、`"小红"` に変換します。</span>
4. `collect` 把这两个字符串收集进一个新的 `List<String>`，赋给 `longNames`。<br><span class="ja-inline">🇯🇵 `collect` はこの2つの文字列を新しい `List<String>` に収集し、`longNames` に代入します。</span>
5. `userMap.get("xiaowang")` 因为这个 key 没有被 `put` 过，返回 `null`；`Optional.ofNullable(null)` 得到一个"空的" `Optional`。<br><span class="ja-inline">🇯🇵 `userMap.get("xiaowang")` はこのkeyが `put` されたことがないため `null` を返します。`Optional.ofNullable(null)` は「空の」`Optional` を得ます。</span>
6. `.map(User::getName)` 发现 `Optional` 是空的，直接跳过转换（不会因为里面是 `null` 而抛异常）。<br><span class="ja-inline">🇯🇵 `.map(User::getName)` は `Optional` が空であることを検知し、変換を直接スキップします（中身が `null` であるために例外がスローされることはありません）。</span>
7. `.orElse("匿名用户")` 因为前面是空的，返回默认值 `"匿名用户"`。<br><span class="ja-inline">🇯🇵 `.orElse("匿名用户")` は前段が空であるため、デフォルト値 `"匿名用户"` を返します。</span>

输出：
> 🇯🇵 出力：
```
老师好！（匿名内部类写法）
老师好！（Lambda 写法）
名字长度 >= 2 的用户：[小明, 小红]
查询结果：匿名用户
```

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| Lambda 写法编译报错，提示接口不是"函数式接口"<br><span class="ja-inline">🇯🇵 Lambdaの書き方でコンパイルエラーになり、インターフェースが「関数型インターフェース」ではないと表示される </span>| Lambda 只能用来实现**只有一个抽象方法**的接口，如果接口里有两个及以上抽象方法，不能用 Lambda 简写<br><span class="ja-inline">🇯🇵 Lambdaは**抽象メソッドが1つだけ**のインターフェースの実装にしか使えない。インターフェースに2つ以上の抽象メソッドがある場合、Lambdaで省略記法を使うことはできない </span>| 检查目标接口是否只有一个抽象方法；如果有多个，只能用匿名内部类或普通实现类<br><span class="ja-inline">🇯🇵 対象のインターフェースが抽象メソッドを1つだけ持つか確認する。複数ある場合は匿名内部クラスか通常の実装クラスを使うしかない </span>|
| `Stream` 处理完之后忘记 `collect`，编译报错或者根本没拿到想要的结果<br><span class="ja-inline">🇯🇵 `Stream` を処理した後に `collect` を忘れ、コンパイルエラーになるか、そもそも欲しい結果が得られない </span>| `filter`/`map` 都只是"描述流水线该怎么走"，不会立即执行也不会自动产出 `List`，必须用 `collect` 之类的操作触发并收集结果<br><span class="ja-inline">🇯🇵 `filter`/`map` はいずれも「流れ作業がどう進むか」を記述するだけで、即座に実行されるわけでも自動的に `List` を生成するわけでもない。`collect` のような操作で結果をトリガーし収集する必要がある </span>| 记住 Stream 操作分两类："中间操作"（如 `filter`/`map`，可以链式叠加）和"终止操作"（如 `collect`，触发整条流水线真正执行并给出结果），一条链最后必须有一个终止操作<br><span class="ja-inline">🇯🇵 Stream操作は2種類に分かれることを覚えておく。「中間操作」（`filter`/`map` など、連鎖して重ねられる）と「終端操作」（`collect` など、流れ作業全体を実際に実行させて結果を出す）。1つの連鎖の最後には必ず終端操作が必要である </span>|
| 对 `Optional.get()` 直接调用，结果还是抛出异常<br><span class="ja-inline">🇯🇵 `Optional.get()` を直接呼び出したところ、やはり例外がスローされる </span>| `Optional` 本身不是"绝对安全"的，如果明知道可能没有值却直接调用 `.get()`（而不是先判断 `isPresent()` 或使用 `orElse`），一样会抛出 `NoSuchElementException`<br><span class="ja-inline">🇯🇵 `Optional` 自体は「絶対に安全」というわけではない。値がないかもしれないと分かっていながら（先に `isPresent()` を判定したり `orElse` を使ったりせずに）直接 `.get()` を呼び出すと、同様に `NoSuchElementException` がスローされる </span>| 优先使用 `orElse`/`orElseGet`/`isPresent()` 判断之后再取值，避免在不确定的情况下直接 `.get()`<br><span class="ja-inline">🇯🇵 `orElse`/`orElseGet`/`isPresent()` を優先して使い、判定してから値を取得する。不確実な状況で直接 `.get()` するのは避ける </span>|
| 看到 `@Service`、`@RestController` 就以为"这行代码有特殊的运行逻辑，语法上跟别的不一样"<br><span class="ja-inline">🇯🇵 `@Service`、`@RestController` を見て「この行のコードには特殊な実行ロジックがあり、構文上他と違う」と思ってしまう </span>| 混淆了"注解"和"普通程序逻辑"——注解本身只是元数据（标签），不会改变被标注的代码的执行逻辑<br><span class="ja-inline">🇯🇵 「アノテーション」と「通常のプログラムロジック」を混同している——アノテーション自体はメタデータ（タグ）にすぎず、注釈が付けられたコードの実行ロジックを変えることはない </span>| 记住注解只是标签，是否有效果、有什么效果，取决于有没有框架在读取并处理它；具体到 Spring 怎么处理这些注解，后面第 15 章开始会详细讲<br><span class="ja-inline">🇯🇵 アノテーションは単なるタグであり、効果があるかどうか、どんな効果があるかは、フレームワークがそれを読み取って処理するかどうかにかかっていることを覚えておく。Springが具体的にこれらのアノテーションをどう処理するかは、後で第15章から詳しく説明する </span>|

## 动手练习 ／ 演習

1. 定义一个函数式接口 `Calculator`，里面有个方法 `int calc(int a, int b);`，分别用匿名内部类和 Lambda 写出"求两数之和"和"求两数之差"两个实现，调用并对比。<br><span class="ja-inline">🇯🇵 関数型インターフェース `Calculator` を定義し、`int calc(int a, int b);` というメソッドを持たせ、匿名内部クラスとLambdaでそれぞれ「2つの数の和を求める」「2つの数の差を求める」実装を書いて、呼び出して比較してみましょう。</span>
2. 用 Stream 对一个 `List<Integer>` 做处理：先 `filter` 出所有偶数，再 `map` 把每个数平方，最后 `collect` 成一个新的 `List<Integer>` 并打印。<br><span class="ja-inline">🇯🇵 Streamを使って `List<Integer>` を処理してみましょう。まず `filter` ですべての偶数を絞り込み、次に `map` で各数を2乗し、最後に `collect` で新しい `List<Integer>` にまとめて出力しましょう。</span>
3. 写一个方法 `Optional<User> findUserByName(List<User> users, String name)`，遍历 `users` 找到名字匹配的第一个用户，找到就用 `Optional.of(...)` 包装返回，找不到就返回 `Optional.empty()`；调用时用 `orElse` 处理"找不到"的情况。<br><span class="ja-inline">🇯🇵 `Optional<User> findUserByName(List<User> users, String name)` というメソッドを書き、`users` を巡回して名前が一致する最初のユーザーを見つけ、見つかれば `Optional.of(...)` で包んで返し、見つからなければ `Optional.empty()` を返してみましょう。呼び出すときは `orElse` で「見つからない」場合を処理しましょう。</span>
4. 找一段包含 `@Override` 的代码（比如第 6 章你写的重写方法），向自己复述一遍："这个标签是谁在读？读了之后做了什么事？"<br><span class="ja-inline">🇯🇵 `@Override` を含むコード（例えば第6章で書いたオーバーライドメソッド）を探し、自分自身に「このタグは誰が読んでいるのか？読んだ後に何をしたのか？」と説明してみましょう。</span>

## 小测验 ／ 小テスト

1. Lambda 表达式能用在任意接口上吗？为什么？<br><span class="ja-inline">🇯🇵 Lambda式はどんなインターフェースにも使えますか？その理由も答えてください。</span>
2. Stream 的 `filter` 和 `map` 分别是干什么的？<br><span class="ja-inline">🇯🇵 Streamの `filter` と `map` はそれぞれ何をするものですか？</span>
3. `Optional.ofNullable(x).orElse(默认值)` 和直接判断 `if (x == null) { ... } else { ... }` 相比，好处是什么？<br><span class="ja-inline">🇯🇵 `Optional.ofNullable(x).orElse(デフォルト値)` は、直接 `if (x == null) { ... } else { ... }` で判定するのと比べて、どんなメリットがありますか？</span>
4. 用自己的话说说："注解到底是什么？"<br><span class="ja-inline">🇯🇵 自分の言葉で「アノテーションとは一体何か」を説明してください。</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 不能，只能用在**函数式接口**（只有一个抽象方法的接口）上。因为 Lambda 表达式本身没有显式写方法名，编译器需要根据"这个接口只有一个方法"来推断这段 Lambda 到底是在实现哪个方法；如果接口里有多个抽象方法，编译器无法判断该实现哪一个，所以不允许用 Lambda。<br><span class="ja-inline">🇯🇵 使えません。**関数型インターフェース**（抽象メソッドが1つだけのインターフェース）にしか使えません。Lambda式自体はメソッド名を明示的に書かないため、コンパイラは「このインターフェースにはメソッドが1つしかない」ことに基づいて、このLambdaが実際にどのメソッドを実装しているのかを推論する必要があります。インターフェースに複数の抽象メソッドがある場合、コンパイラはどれを実装すべきか判断できないため、Lambdaを使うことは許されません。</span>
2. `filter` 负责"筛选"，根据一个返回 `boolean` 的条件，只留下满足条件的元素；`map` 负责"转换"，把每个元素按规则变成另一种形式（可能是不同的类型）。<br><span class="ja-inline">🇯🇵 `filter` は「絞り込み」を担当し、`boolean` を返す条件に基づいて条件を満たす要素だけを残します。`map` は「変換」を担当し、各要素をルールに従って別の形式（異なる型かもしれない）に変えます。</span>
3. 好处是把"这个值可能不存在"这件事，用类型（`Optional`）明确表达出来，写代码的人在拿到 `Optional` 时会更容易意识到需要处理"没有值"的情况；同时 `.orElse(...)` 这种链式写法比 `if-else` 更简洁。功能上二者能达到类似的效果，但 `Optional` 更强调"提醒开发者不要忘记处理空值"。<br><span class="ja-inline">🇯🇵 メリットは、「この値は存在しないかもしれない」ということを型（`Optional`）で明確に表現できる点にあります。コードを書く人は `Optional` を受け取った際に「値がない」場合を処理する必要があることをより意識しやすくなります。同時に `.orElse(...)` のような連鎖的な書き方は `if-else` よりも簡潔です。機能的には両者とも似た効果を達成できますが、`Optional` は「開発者がnull値の処理を忘れないよう促す」ことをより強調しています。</span>
4. 注解就是贴在代码（类、方法、字段等）上的一种标签，本身不会改变代码的执行逻辑；有没有实际效果，取决于是否有相应的工具或框架（比如编译器、Spring 容器）在特定时机去读取这个标签，并根据标签的类型采取对应的行动。比如 `@Override` 是编译器在编译时读取并做检查；后面会学到的 `@Service`、`@RestController` 等则是 Spring 容器在启动时读取并做相应处理（具体机制第 15 章开始详细讲）。<br><span class="ja-inline">🇯🇵 アノテーションはコード（クラス、メソッド、フィールドなど）に貼るタグの一種で、それ自体はコードの実行ロジックを変えません。実際に効果があるかどうかは、対応するツールやフレームワーク（例えばコンパイラ、Springコンテナ）が特定のタイミングでこのタグを読み取り、タグの種類に応じて対応する行動を取るかどうかにかかっています。例えば `@Override` はコンパイラがコンパイル時に読み取ってチェックを行うものです。後で学ぶ `@Service`、`@RestController` などはSpringコンテナが起動時に読み取って対応する処理を行うものです（具体的な仕組みは第15章から詳しく説明します）。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经掌握了 Lambda 表达式和匿名内部类的关系，学会了 Stream 最基础的 `filter/map/collect`，理解了 `Optional` 如何让"可能没有值"这件事更明确，最重要的是理解了**注解本质上是贴在代码上的标签，框架会在特定时机读取它并采取行动**——这个心智模型会贯穿后面整个教程。到这里，Java 基础阶段全部学完了，下一步先做一次"阶段复习 1"，梳理知识地图并厘清几个容易混淆的概念，然后正式进入 Web 通信原理的学习。

> 🇯🇵 これでLambda式と匿名内部クラスの関係を習得し、Streamの最も基本的な `filter/map/collect` を学び、`Optional` がどのように「値がないかもしれない」ことをより明確にするかを理解しました。そして最も重要なこととして、**アノテーションは本質的にコードに貼られたタグであり、フレームワークが特定のタイミングでそれを読み取って行動を起こす**ということを理解しました——このメンタルモデルは以降のチュートリアル全体を貫くことになります。ここまででJavaの基礎段階はすべて終わりました。次はまず「ステージ復習1」を行い、知識マップを整理していくつかの混同しやすい概念を明確にしてから、正式にWeb通信の原理の学習に進みます。
