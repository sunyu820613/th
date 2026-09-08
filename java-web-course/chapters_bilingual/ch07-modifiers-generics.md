# 第 7 章　修饰符与泛型 ／ 第7章　修飾子とジェネリクス

## 本章目标 ／ 本章の目標
理解 `public/private/protected/static/final` 各自的含义和使用场景；理解泛型解决了什么问题，能看懂并写出 `List<User>` 这样的写法。

> 🇯🇵 `public/private/protected/static/final` それぞれの意味と使用場面を理解します。ジェネリクス（泛型、Generics：型をパラメータ化してコンパイル時に型チェックできるようにする仕組み）がどんな問題を解決するのかを理解し、`List<User>` のような書き方を読み書きできるようになります。

## 一句话理解 ／ 一言で理解する
修饰符是给类、字段、方法"贴的权限标签和行为标签"（谁能访问？属不属于对象本身？能不能被改？）；泛型是"给容器规定好只能装哪一种类型的东西"，让很多本该在运行时才暴露的类型错误，提前在编译阶段就被拦下来。

> 🇯🇵 修飾子はクラス・フィールド・メソッドに貼る「権限ラベルと振る舞いラベル」です（誰がアクセスできるか？オブジェクト自身に属するか？変更できるか？）。ジェネリクスは「コンテナに入れられる型を1種類に限定する」仕組みであり、本来は実行時になって初めて表面化するはずの型エラーの多くを、事前にコンパイル段階で食い止めることができます。

## 为什么需要它 ／ なぜ必要なのか
如果所有字段和方法都是 `public`，任何代码都能随便改，第 6 章讲的封装就无从谈起；如果分不清一个方法到底属于类本身还是属于某个具体对象，代码组织会很混乱；如果一个"能装任何东西的容器"（比如不用泛型的 `List`）能同时装进 `User` 和 `String`，取出来再用错方式处理，程序运行到那一行才会崩溃——而这类错误本可以在写代码的时候就被发现。

> 🇯🇵 もしすべてのフィールドとメソッドが `public` であれば、どんなコードでも自由に変更できてしまい、第6章で説明したカプセル化は成り立ちません。もしあるメソッドがクラス自身に属するのか、それとも具体的なオブジェクトに属するのか区別がつかなければ、コードの構成は非常に混乱します。もし「何でも入れられるコンテナ」（例えばジェネリクスを使わない `List`）に `User` と `String` を同時に入れることができ、取り出して間違った方法で処理してしまうと、プログラムがその行を実行するまでクラッシュに気づけません——このような誤りは本来コードを書いている時点で発見できるはずのものです。

## 核心概念 ／ コアコンセプト

### 7.1 访问权限修饰符：public / private / protected（以及"默认"） ／ アクセス修飾子：public / private / protected（および「デフォルト」）

它们控制"谁能访问这个类/字段/方法"，范围从大到小：

> 🇯🇵 これらは「誰がこのクラス／フィールド／メソッドにアクセスできるか」を制御するもので、範囲は広い方から狭い方へ次のようになります。

| 修饰符 ／ 修飾子 | 同一个类内部 ／ 同じクラス内 | 同一个包内 ／ 同じパッケージ内 | 子类（即使不同包） ／ 子クラス（パッケージが異なっても） | 任何地方 ／ どこからでも |
|---|---|---|---|---|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| （不写，默认包级私有） ／ （記述なし、デフォルトのパッケージプライベート） | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

常见用法：
> 🇯🇵 よくある使い方：

- 类的字段一般用 `private`，配合第 6 章的 getter/setter 对外开放（封装）。<br><span class="ja-inline">🇯🇵 クラスのフィールドは通常 `private` にし、第6章のgetter/setterと組み合わせて外部に公開します（カプセル化）。</span>
- 想让子类能直接访问但外部不能访问的字段（比如第 6 章 `Person` 的 `name`、`age`），用 `protected`。<br><span class="ja-inline">🇯🇵 子クラスは直接アクセスできるが外部からはアクセスできないようにしたいフィールド（例えば第6章の `Person` の `name`、`age`）には `protected` を使います。</span>
- 对外提供的方法（比如一个类的核心功能方法）通常是 `public`，供其它类调用。<br><span class="ja-inline">🇯🇵 外部に提供するメソッド（例えばクラスの中核機能となるメソッド）は通常 `public` にし、他のクラスから呼び出せるようにします。</span>

### 7.2 static：属于类，还是属于对象？ ／ static：クラスに属するか、オブジェクトに属するか

不加 `static` 的字段/方法，属于**每一个具体对象**，每个对象各有一份；加了 `static` 的字段/方法，属于**类本身**，所有对象共享同一份，甚至不需要创建对象就能直接通过"类名.成员名"访问。

> 🇯🇵 `static` を付けないフィールド／メソッドは**それぞれの具体的なオブジェクト**に属し、各オブジェクトがそれぞれ独自の1つを持ちます。`static` を付けたフィールド／メソッドは**クラス自身**に属し、すべてのオブジェクトが同じ1つを共有します。オブジェクトを作成しなくても「クラス名.メンバー名」で直接アクセスすることさえできます。

```java
public class Counter {
    static int totalCount = 0; // 静态字段：所有对象共享同一份
    int id;                     // 实例字段：每个对象各有一份

    public Counter() {
        totalCount++;           // 每 new 一次，共享的计数就加 1
        this.id = totalCount;
    }
}
```

```java
Counter c1 = new Counter(); // totalCount 变成 1，c1.id = 1
Counter c2 = new Counter(); // totalCount 变成 2，c2.id = 2
System.out.println(Counter.totalCount); // 2，直接用类名访问静态字段
```

第 1 章的 `main` 方法为什么必须是 `static`？因为程序启动那一刻，JVM 还没创建任何对象，只有属于类本身的 `static` 方法才能在"没有对象"的情况下被直接调用。

> 🇯🇵 第1章の `main` メソッドはなぜ必ず `static` でなければならないのでしょうか？プログラム起動の瞬間、JVMはまだ何もオブジェクトを作成していないため、クラス自身に属する `static` メソッドだけが「オブジェクトが存在しない」状態で直接呼び出せるからです。

### 7.3 final：不许再变 ／ final：もう変更を許さない

`final` 修饰不同东西，含义略有差别，但核心思想都是"锁定，不可再改"：

> 🇯🇵 `final` は修飾する対象によって意味がやや異なりますが、核心となる考え方はすべて「ロックして、もう変更できないようにする」ことです。

| 修饰对象 ／ 修飾対象 | 含义 ／ 意味 |
|---|---|
| `final` 变量<br><span class="ja-inline">🇯🇵 `final` 変数 </span>| 赋值后不能再被重新赋值（相当于"常量"）<br><span class="ja-inline">🇯🇵 一度値を代入すると再代入できない（「定数」に相当する） </span>|
| `final` 方法<br><span class="ja-inline">🇯🇵 `final` メソッド </span>| 子类不能重写这个方法<br><span class="ja-inline">🇯🇵 子クラスはこのメソッドをオーバーライドできない </span>|
| `final` 类<br><span class="ja-inline">🇯🇵 `final` クラス </span>| 这个类不能被继承（比如 Java 标准库里的 `String` 类就是 `final` 的）<br><span class="ja-inline">🇯🇵 このクラスは継承できない（例えばJava標準ライブラリの `String` クラスは `final` である） </span>|

```java
final double TAX_RATE = 0.06; // 声明为常量，之后再写 TAX_RATE = 0.08; 会编译报错
```

### 7.4 泛型（Generics）解决了什么问题 ／ ジェネリクス（Generics、泛型）が解決する問題

**先看不用泛型会发生什么。** 假设有一个"万能容器" `List`（第 8 章会详细学，这里先只关注类型安全问题），如果它没有泛型：

> 🇯🇵 **まずジェネリクスを使わないとどうなるかを見てみましょう。** 「何でも入れられるコンテナ」である `List`（第8章で詳しく学びますが、ここでは型安全性の問題だけに注目します）があったとして、ジェネリクスがない場合：

```java
List list = new ArrayList(); // 没有指定类型，理论上什么都能往里放
list.add(new User("小明"));
list.add("这是一个字符串，不小心塞错了");

User user = (User) list.get(1); // 强制转换，编译能通过
user.getName();                  // 运行时才崩溃：ClassCastException！
```

这段代码**编译完全没问题**，但运行到 `(User) list.get(1)` 这一行会抛出 `ClassCastException`（类型转换异常），因为 `list.get(1)` 实际拿到的是一个 `String`，根本不能强转成 `User`。问题在于：**这种类型不匹配的错误，直到程序真正运行到那一行才会暴露**，而如果这行代码藏在某个不常触发的分支里，可能上线很久才会被用户触发出来。

> 🇯🇵 このコードは**コンパイルには全く問題がありません**が、`(User) list.get(1)` の行を実行すると `ClassCastException`（型変換例外）がスローされます。`list.get(1)` が実際に取得するのは `String` であり、`User` に強制変換できるものではないからです。問題は、**このような型の不一致によるエラーは、プログラムが実際にその行を実行するまで表面化しない**ことです。もしこの行があまり実行されない分岐の中に隠れていたら、リリース後かなり経ってからユーザーによって引き起こされるかもしれません。

**用泛型之后：**
> 🇯🇵 **ジェネリクスを使った後：**

```java
List<User> list = new ArrayList<User>(); // 明确规定：这个 List 只能装 User
list.add(new User("小明"));
list.add("这是一个字符串"); // 编译直接报错！根本不会让你写出这行代码

User user = list.get(1); // 不需要强制转换，取出来的直接就是 User 类型
```

`<User>` 就是泛型参数，含义是"这个 `List` 的元素类型被锁定为 `User`"。这样一来：

> 🇯🇵 `<User>` がジェネリクスの型引数であり、「この `List` の要素の型は `User` に固定されている」ことを意味します。こうすることで：

1. 想塞入不是 `User` 类型的数据，**编译阶段**就会报错，根本不用等到运行时。<br><span class="ja-inline">🇯🇵 `User` 型でないデータを入れようとすると、**コンパイル段階**でエラーになり、実行時まで待つ必要が全くありません。</span>
2. 从 `list` 里取元素时，取出来的直接就是 `User` 类型，不需要再手动强制转换。<br><span class="ja-inline">🇯🇵 `list` から要素を取り出すとき、取り出されるのはそのまま `User` 型であり、手動で強制変換する必要がありません。</span>

这就是泛型的核心价值：**把本来运行时才会暴露的类型错误，提前到编译阶段拦截**。第 8 章会大量使用 `List<User>`、`Map<String, User>` 这样的写法，都是同一个道理。

> 🇯🇵 これがジェネリクスの核心的な価値です。**本来実行時に表面化するはずの型エラーを、コンパイル段階で事前に食い止める**のです。第8章では `List<User>`、`Map<String, User>` のような書き方が大量に使われますが、すべて同じ考え方によるものです。

## 图解 ／ 図解

```
不用泛型：
List list = new ArrayList();
        │
        ├── add(User)     ┐
        ├── add(String)   ├─ 编译期都能通过，"箱子"里什么都能装
        └── add(...)      ┘
list.get(1) 取出来时类型是 Object，需要手动强转
        │
        ▼
   (User) list.get(1)  ──▶ 运行到这一行才发现装的是 String ──▶ ClassCastException

用泛型：
List<User> list = new ArrayList<User>();
        │
        ├── add(User)     ✅ 编译通过
        └── add(String)   ❌ 编译直接报错，压根不让你写出来
list.get(1) 取出来的类型已经明确是 User，不用强转
```

## 最小示例 ／ 最小限のサンプル

`GenericsDemo.java`
```java
import java.util.ArrayList;
import java.util.List;

public class GenericsDemo {
    public static void main(String[] args) {
        // 泛型写法：明确规定只能装 User
        List<User> users = new ArrayList<>();
        users.add(new User("小明"));
        users.add(new User("小红"));
        // users.add("字符串"); // 取消这行注释会直接编译报错，这正是泛型的价值

        for (User user : users) {
            System.out.println(user.getName()); // 不需要强制转换，直接就是 User
        }

        System.out.println("当前一共创建了 " + Counter.totalCount + " 个 Counter 对象");
    }
}

class User {
    private String name; // private 字段，封装

    public User(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

class Counter {
    static int totalCount = 0; // static 字段，所有对象共享

    public Counter() {
        totalCount++;
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `List<User> users = new ArrayList<>();`：声明一个泛型 `List`，尖括号里的 `User` 规定了这个容器只能存 `User` 类型的元素；右边 `new ArrayList<>()` 的尖括号可以留空（叫"钻石语法"），编译器会根据左边自动推断出类型也是 `User`。<br><span class="ja-inline">🇯🇵 `List<User> users = new ArrayList<>();`：ジェネリクスの `List` を宣言します。山括弧内の `User` は、このコンテナが `User` 型の要素しか保存できないことを規定します。右辺の `new ArrayList<>()` の山括弧は空にすることができ（「ダイヤモンド構文」と呼ばれる）、コンパイラは左辺から型が `User` であることを自動的に推論します。</span>
- `users.add(new User("小明"));`：往容器里添加一个 `User` 对象，类型匹配，编译通过。<br><span class="ja-inline">🇯🇵 `users.add(new User("小明"));`：コンテナに `User` オブジェクトを1つ追加します。型が一致しているのでコンパイルが通ります。</span>
- `// users.add("字符串");`：如果去掉注释，编译器会直接报错——因为 `String` 不是 `User`，这正是泛型在编译期做的类型检查。<br><span class="ja-inline">🇯🇵 `// users.add("字符串");`：コメントを外すと、コンパイラが直接エラーを出します——`String` は `User` ではないためで、これがまさにジェネリクスがコンパイル時に行う型チェックです。</span>
- `for (User user : users)`：遍历时，每一轮拿到的 `user` 变量类型直接就是 `User`，不需要像不用泛型时那样写 `(User) list.get(i)` 强制转换。<br><span class="ja-inline">🇯🇵 `for (User user : users)`：巡回する際、毎回取得する `user` 変数の型はそのまま `User` であり、ジェネリクスを使わない場合のように `(User) list.get(i)` と強制変換する必要がありません。</span>
- `class User { private String name; ... }`：`name` 字段用 `private` 封装，通过 `getName()` 对外提供只读访问（没有提供 setter，意味着这个字段一旦在构造方法里赋值就不能再改，这也是一种常见的设计习惯）。<br><span class="ja-inline">🇯🇵 `class User { private String name; ... }`：`name` フィールドは `private` でカプセル化され、`getName()` を通じて外部に読み取り専用のアクセスを提供します（setterを提供していないということは、このフィールドはコンストラクタで値を設定したら二度と変更できないことを意味し、これもよくある設計の習慣です）。</span>
- `class Counter { static int totalCount = 0; ... }`：`totalCount` 是静态字段，所有 `Counter` 对象共享同一份；每次执行构造方法 `totalCount++`，无论创建了多少个对象，这个数字都是全局唯一的一份计数。<br><span class="ja-inline">🇯🇵 `class Counter { static int totalCount = 0; ... }`：`totalCount` は静的フィールドで、すべての `Counter` オブジェクトが同じ1つを共有します。コンストラクタを実行するたびに `totalCount++` が行われ、いくつオブジェクトが作られても、この数値はグローバルに唯一のカウントです。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. JVM 执行 `new User("小明")`、`new User("小红")`，分别创建两个 `User` 对象，通过 `users.add(...)` 放入 `List`。<br><span class="ja-inline">🇯🇵 JVMが `new User("小明")`、`new User("小红")` を実行し、それぞれ2つの `User` オブジェクトを作成して `users.add(...)` により `List` に格納します。</span>
2. 因为泛型规定了 `List<User>`，编译器早在编译阶段就确认了这个 `List` 里只可能装 `User` 类型的元素，所以运行时遍历取出的每个元素，虚拟机都能安全地当作 `User` 处理，不需要额外的类型检查开销和强转代码。<br><span class="ja-inline">🇯🇵 ジェネリクスによって `List<User>` が規定されているため、コンパイラはコンパイル段階ですでにこの `List` に `User` 型の要素しか入らないことを確認済みです。そのため実行時に巡回して取り出す各要素は、仮想マシンが安全に `User` として扱うことができ、追加の型チェックのコストや強制変換のコードは不要です。</span>
3. `for` 循环依次打印每个 `User` 的 `name`。<br><span class="ja-inline">🇯🇵 `for` ループが各 `User` の `name` を順に出力します。</span>
4. `Counter` 这个类本身在这个程序里没有被 `new` 过，所以 `Counter.totalCount` 应该是 `0`——这里特意验证"不需要创建对象就能通过类名访问静态成员"这一点。<br><span class="ja-inline">🇯🇵 `Counter` クラス自体はこのプログラムでは `new` されていないため、`Counter.totalCount` は `0` のはずです——ここでは「オブジェクトを作成しなくてもクラス名を通じて静的メンバーにアクセスできる」ことをわざと確認しています。</span>

输出：
> 🇯🇵 出力：
```
小明
小红
当前一共创建了 0 个 Counter 对象
```

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| `users.add("字符串");` 编译报错 | 泛型 `List<User>` 已经规定死了元素类型，`String` 不匹配<br><span class="ja-inline">🇯🇵 ジェネリクス `List<User>` がすでに要素の型を固定しており、`String` は一致しない </span>| 这其实是泛型在"帮你"，说明写法用对了；如果确实想装不同类型，需要重新设计数据结构，而不是绕开泛型<br><span class="ja-inline">🇯🇵 これは実はジェネリクスが「助けてくれている」ものであり、書き方が正しいことを示しています。本当に異なる型を入れたい場合は、ジェネリクスを回避するのではなくデータ構造を再設計する必要がある </span>| 
| 用不加泛型的老写法 `List list = new ArrayList();` 编译器只给"未检查的原始类型"警告，不报错<br><span class="ja-inline">🇯🇵 ジェネリクスを使わない古い書き方 `List list = new ArrayList();` では、コンパイラは「未チェックの生の型」という警告を出すだけでエラーにはならない </span>| Java 为了兼容早期没有泛型的代码，允许这种"原始类型"写法，但完全失去了编译期类型检查的好处<br><span class="ja-inline">🇯🇵 Javaは初期のジェネリクスがなかったコードとの互換性のため、この「生の型」の書き方を許しているが、コンパイル時の型チェックの利点は完全に失われる </span>| 任何时候声明 `List`、`Map` 等容器都应该带上尖括号指定类型，本教程从这里开始统一要求带泛型<br><span class="ja-inline">🇯🇵 `List`、`Map` などのコンテナを宣言するときは常に山括弧で型を指定するべきであり、本チュートリアルではここから一律ジェネリクスを付けることを要求する </span>|
| `final` 变量声明后又想改值，编译报错 `cannot assign a value to final variable`<br><span class="ja-inline">🇯🇵 `final` 変数を宣言した後に値を変更しようとすると、コンパイルエラー `cannot assign a value to final variable` になる </span>| `final` 变量赋值后不能再赋值<br><span class="ja-inline">🇯🇵 `final` 変数は一度代入すると再代入できない </span>| 如果这个值确实需要变化，就不要加 `final`；确定是常量再加<br><span class="ja-inline">🇯🇵 その値が本当に変化する必要があるなら `final` を付けない。定数であると確定してから付ける </span>|
| 忘记 `static`，通过"类名.方法名"直接调用实例方法，编译报错<br><span class="ja-inline">🇯🇵 `static` を忘れて「クラス名.メソッド名」でインスタンスメソッドを直接呼び出そうとし、コンパイルエラーになる </span>| 实例方法必须先有具体对象才能调用，类名直接调用只对 `static` 成员有效<br><span class="ja-inline">🇯🇵 インスタンスメソッドは具体的なオブジェクトがあって初めて呼び出せる。クラス名での直接呼び出しは `static` メンバーにしか有効でない </span>| 要么创建对象再调用，要么确认这个方法本该是 `static` 的（不依赖任何具体对象状态）<br><span class="ja-inline">🇯🇵 オブジェクトを作成してから呼び出すか、そのメソッドが本来 `static` であるべきか（どの具体的なオブジェクトの状態にも依存しない）を確認する </span>|

## 动手练习 ／ 演習

1. 写一个 `Product` 类，`name` 和 `price` 字段用 `private` 封装并提供 getter；再写一个 `List<Product>`，装入 3 个商品，遍历打印每个商品的名字和价格。<br><span class="ja-inline">🇯🇵 `Product` クラスを書き、`name` と `price` フィールドを `private` でカプセル化してgetterを提供してみましょう。さらに `List<Product>` を書いて商品を3つ入れ、巡回して各商品の名前と価格を出力してみましょう。</span>
2. 给 `Counter` 类增加一个 `static` 方法 `getTotalCount()`，返回 `totalCount`，在 `main` 里不创建任何对象、直接通过类名调用它。<br><span class="ja-inline">🇯🇵 `Counter` クラスに `static` メソッド `getTotalCount()` を追加して `totalCount` を返すようにし、`main` の中でオブジェクトを一切作成せず、クラス名で直接呼び出してみましょう。</span>
3. 声明一个 `final` 常量 `MAX_SCORE = 100`，尝试在后面的代码里重新给它赋值，观察编译器报的错误信息。<br><span class="ja-inline">🇯🇵 `final` 定数 `MAX_SCORE = 100` を宣言し、後のコードでそれに再代入しようとして、コンパイラが出すエラーメッセージを観察してみましょう。</span>

## 小测验 ／ 小テスト

1. `protected` 和"默认（不写修饰符）"权限的核心区别是什么？<br><span class="ja-inline">🇯🇵 `protected` と「デフォルト（修飾子を書かない）」権限の核心的な違いは何ですか？</span>
2. 为什么 `main` 方法必须声明为 `static`？<br><span class="ja-inline">🇯🇵 なぜ `main` メソッドは必ず `static` として宣言しなければならないのですか？</span>
3. 下面代码有什么问题？<br><span class="ja-inline">🇯🇵 次のコードにはどんな問題がありますか？</span>
   ```java
   List list = new ArrayList();
   list.add("hello");
   list.add(123);
   ```
   泛型能怎样避免这类问题？<br><span class="ja-inline">🇯🇵 ジェネリクスはこの種の問題をどのように回避できますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. `protected` 允许**不同包中的子类**访问；"默认（包级私有）"只允许**同一个包**内的类访问，即使是子类，只要不在同一个包里就不能访问。<br><span class="ja-inline">🇯🇵 `protected` は**異なるパッケージにある子クラス**からのアクセスを許可します。「デフォルト（パッケージプライベート）」は**同じパッケージ**内のクラスからのアクセスしか許可せず、子クラスであっても同じパッケージ内になければアクセスできません。</span>
2. 因为程序启动时 JVM 还没有创建任何对象，只有 `static` 方法才能在没有对象的情况下被直接调用，所以入口方法必须是 `static` 的。<br><span class="ja-inline">🇯🇵 プログラム起動時、JVMはまだ何もオブジェクトを作成していないため、`static` メソッドだけがオブジェクトがない状態で直接呼び出せます。そのためエントリーポイントとなるメソッドは必ず `static` でなければなりません。</span>
3. 这段代码没有指定泛型，`list` 里可以同时装入 `String` 和 `Integer` 等任意类型的混合数据，取出来使用时容易因为类型不匹配在运行时抛出 `ClassCastException`。用泛型写成 `List<String> list = new ArrayList<>();` 后，`list.add(123);` 这行会在**编译阶段**直接报错，从源头避免了这种类型混乱的问题。<br><span class="ja-inline">🇯🇵 このコードはジェネリクスを指定していないため、`list` には `String` と `Integer` など任意の型の混在データを同時に入れることができ、取り出して使用する際に型の不一致によって実行時に `ClassCastException` をスローしやすくなります。ジェネリクスを使って `List<String> list = new ArrayList<>();` と書けば、`list.add(123);` の行は**コンパイル段階**で直接エラーになり、この種の型の混乱を根本から回避できます。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了 `public/private/protected/static/final` 各自的作用，也理解了泛型如何把类型错误从"运行时崩溃"提前到"编译时报错"。下一章将结合泛型实战 `List<User>`、`Map<String, User>` 这些集合类型，学习 `enum` 枚举，并掌握异常的 `throw/throws` 与 `try-catch-finally`。

> 🇯🇵 これで `public/private/protected/static/final` それぞれの役割を理解し、ジェネリクスがどのようにして型エラーを「実行時のクラッシュ」から「コンパイル時のエラー」へと前倒しするかも理解しました。次の章ではジェネリクスを活かして `List<User>`、`Map<String, User>` などのコレクション型を実践し、`enum`（列挙型、Enum）を学び、例外処理の `throw/throws` と `try-catch-finally` を習得します。
