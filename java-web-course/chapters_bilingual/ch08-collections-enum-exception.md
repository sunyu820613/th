# 第 8 章　集合、枚举与异常 ／ 第8章　コレクション・列挙型・例外処理

## 本章目标 ／ 本章の目標
掌握 `List/ArrayList` 和 `Map/HashMap` 的基础用法（包括 `List<User>`、`Map<String, User>` 这样的泛型写法）；理解 `enum` 的定义和使用场景；掌握异常的 `throw/throws` 和 `try-catch-finally`。

> 🇯🇵 `List/ArrayList` と `Map/HashMap` の基本的な使い方（`List<User>`、`Map<String, User>` のようなジェネリクスの書き方を含む）を習得します。`enum`（列挙型、Enum）の定義と使用場面を理解します。例外処理の `throw/throws` と `try-catch-finally` を習得します。

## 一句话理解 ／ 一言で理解する
集合是"能自动伸缩长度的容器"，比数组灵活；枚举是"把一组固定不变的选项提前列举出来，给它们起好名字"；异常是"程序遇到没法正常往下走的情况时，喊一声"救命"，让别的代码来处理"。

> 🇯🇵 コレクション（集合、Collection）は「長さが自動的に伸縮できるコンテナ」であり、配列より柔軟です。列挙型（enum）は「変化しない固定の選択肢のセットを事前に列挙し、それぞれに名前を付けておく」ものです。例外（Exception）は「プログラムが正常に処理を続けられない状況に遭遇したときに『助けて』と叫び、他のコードに処理を任せる」仕組みです。

## 为什么需要它 ／ なぜ必要なのか
第 4 章学的数组长度一旦定好就不能变，但真实业务里"要存多少个用户"往往是运行时才知道的，集合正好解决这个问题。而像"订单状态"这种只可能是几个固定值之一的数据，如果用普通的 `String`（比如 `"PENDING"`、"pending"、"Pending"）容易写错、拼错，枚举把这些固定选项收敛成一个类型，编译器帮你把关。异常则是 Java 处理"出错了怎么办"的标准机制——没有异常机制，一旦某一步出错，程序要么直接崩溃，要么需要写一堆 `if` 层层判断"是否出错了"，代码会变得很难看。

> 🇯🇵 第4章で学んだ配列は、一度長さが決まると変更できませんが、実際の業務では「ユーザーを何人保存するか」は実行時になって初めてわかることが多く、コレクションはまさにこの問題を解決します。また「注文ステータス」のように、いくつかの固定値のうちの1つにしかならないデータについて、普通の `String`（例えば `"PENDING"`、"pending"、"Pending"）を使うと書き間違いやスペルミスが起きやすくなります。列挙型はこうした固定の選択肢を1つの型に収束させ、コンパイラがチェックしてくれます。例外はJavaが「エラーが起きたらどうするか」を扱う標準的な仕組みです——例外処理の仕組みがなければ、どこかのステップでエラーが起きたとき、プログラムは直接クラッシュするか、大量の `if` を重ねて「エラーが起きたかどうか」を判定しなければならず、コードが非常に見苦しくなります。

## 核心概念 ／ コアコンセプト

### 8.1 List / ArrayList

`List` 是一个**接口**（回忆第 6 章），`ArrayList` 是它最常用的一个**实现类**。`List` 可以理解成"长度可以自动伸缩的数组"：

> 🇯🇵 `List` は**インターフェース**（第6章を思い出してください）であり、`ArrayList` はその最もよく使われる**実装クラス**です。`List` は「長さが自動的に伸縮できる配列」と理解すればよいでしょう。

```java
List<User> users = new ArrayList<>(); // 左边写接口类型，右边写具体实现类型，这是推荐写法
users.add(new User("小明"));
users.add(new User("小红"));

System.out.println(users.size());     // 元素个数，注意是方法 size()，不是属性 length
User first = users.get(0);            // 按下标取元素，下标同样从 0 开始
users.remove(0);                       // 按下标删除元素
```

常用方法：`add()` 增加、`get(下标)` 取值、`remove(下标)` 删除、`size()` 获取当前元素个数、`contains(元素)` 判断是否包含。

> 🇯🇵 よく使うメソッド：`add()`（追加）、`get(添字)`（値の取得）、`remove(添字)`（削除）、`size()`（現在の要素数を取得）、`contains(要素)`（含まれているか判定）。

为什么左边写 `List<User>` 而不是 `ArrayList<User>`？这是"面向接口编程"的一种习惯：调用方只关心"这是一个 List，能增删查"，不关心具体是哪种实现。这个习惯在后面 Spring 里会反复出现（比如 `UserService` 接口 + `UserServiceImpl` 实现类）。

> 🇯🇵 なぜ左辺に `ArrayList<User>` ではなく `List<User>` と書くのでしょうか？これは「インターフェース指向プログラミング」の1つの習慣です。呼び出す側は「これはListであり、追加・削除・検索ができる」ことだけに関心を持ち、具体的にどの実装かは気にしません。この習慣は後でSpringにおいて繰り返し登場します（例えば `UserService` インターフェース + `UserServiceImpl` 実装クラス）。

### 8.2 Map / HashMap

`Map` 用来存**一对一对的"键值对"**（key-value），根据 key 能快速找到对应的 value，key 不能重复。`HashMap` 是最常用的实现类：

> 🇯🇵 `Map` は**「キーと値のペア」**（key-value）を保存するために使い、keyに基づいて対応するvalueを素早く見つけることができます。keyは重複できません。`HashMap` は最もよく使われる実装クラスです。

```java
Map<String, User> userMap = new HashMap<>(); // key 是 String（比如用户名），value 是 User 对象
userMap.put("xiaoming", new User("小明"));
userMap.put("xiaohong", new User("小红"));

User user = userMap.get("xiaoming"); // 根据 key 取 value
boolean exists = userMap.containsKey("xiaohong"); // 判断 key 是否存在
userMap.remove("xiaoming"); // 按 key 删除
```

常用方法：`put(key, value)` 存入、`get(key)` 取值（key 不存在时返回 `null`）、`containsKey(key)` 判断、`remove(key)` 删除、`size()` 获取键值对个数。

> 🇯🇵 よく使うメソッド：`put(key, value)`（格納）、`get(key)`（値の取得、keyが存在しない場合は `null` を返す）、`containsKey(key)`（判定）、`remove(key)`（削除）、`size()`（キーと値のペアの数を取得）。

### 8.3 enum 枚举 ／ enum（列挙型）

当一个变量的取值只可能是几个固定选项之一时（比如订单状态只可能是"待支付、已支付、已发货、已完成、已取消"），用 `enum` 定义：

> 🇯🇵 ある変数の値がいくつかの固定された選択肢のうちの1つにしかならない場合（例えば注文ステータスは「未払い、支払い済み、発送済み、完了、キャンセル」のいずれかにしかならない）、`enum` で定義します。

```java
public enum OrderStatus {
    PENDING,   // 待支付
    PAID,      // 已支付
    SHIPPED,   // 已发货
    COMPLETED, // 已完成
    CANCELLED  // 已取消
}
```

使用方式：
> 🇯🇵 使い方：

```java
OrderStatus status = OrderStatus.PENDING;

if (status == OrderStatus.PAID) {
    System.out.println("已支付，可以发货了");
}
```

相比用 `String` 表示状态，`enum` 的好处是：**编译器会帮你检查**，你只能取 `OrderStatus` 里已经列出的这几个值，不可能写出 `OrderStatus.paid`（大小写拼错）或者 `OrderStatus.WHATEVER`（凭空捏造一个不存在的状态）这类错误，而如果用 `String` 存状态，这类拼写错误编译器根本发现不了，只能等运行时业务逻辑判断失败才发现。

> 🇯🇵 `String` でステータスを表すのと比べて、`enum` のメリットは：**コンパイラがチェックしてくれる**ことです。取れる値は `OrderStatus` にすでに列挙されているものだけであり、`OrderStatus.paid`（大文字小文字の書き間違い）や `OrderStatus.WHATEVER`（存在しないステータスをでっち上げる）のようなミスは起こり得ません。一方 `String` でステータスを保存すると、こうしたスペルミスをコンパイラは全く発見できず、実行時に業務ロジックの判定が失敗して初めて気づくことになります。

### 8.4 异常：throw / throws / try-catch-finally ／ 例外処理：throw / throws / try-catch-finally

**异常（Exception）**是程序运行中出现的"没法正常继续往下走"的情况，比如除数为 0、数组越界、传入了不合法的参数等。

> 🇯🇵 **例外（Exception）**とは、プログラムの実行中に「正常に処理を続けられない」状況が発生することです。例えば除数が0、配列の添字が範囲外、不正な引数が渡された、などです。

- `throw`：**主动**在代码里抛出一个异常对象，通知调用者"这里出问题了"。<br><span class="ja-inline">🇯🇵 `throw`：コード内で**能動的に**例外オブジェクトをスローし、呼び出し元に「ここで問題が発生した」と通知します。</span>
- `throws`：写在方法签名上，**声明**这个方法内部可能会抛出某种异常，提醒调用者要处理。<br><span class="ja-inline">🇯🇵 `throws`：メソッドのシグネチャに書き、このメソッド内部である種の例外がスローされる可能性があることを**宣言**し、呼び出し元に処理するよう促します。</span>
- `try-catch-finally`：**捕获并处理**异常的标准结构。<br><span class="ja-inline">🇯🇵 `try-catch-finally`：例外を**捕捉して処理する**標準的な構造です。</span>

```java
public class OrderService {

    // 方法签名上用 throws 声明：调用这个方法的人需要注意可能抛出这个异常
    public void pay(double amount) throws IllegalArgumentException {
        if (amount <= 0) {
            throw new IllegalArgumentException("支付金额必须大于 0"); // 主动抛出异常
        }
        System.out.println("支付成功，金额：" + amount);
    }
}
```

调用方用 `try-catch` 捕获处理：
> 🇯🇵 呼び出し側は `try-catch` で捕捉して処理します。

```java
OrderService service = new OrderService();
try {
    service.pay(-100); // 会抛出异常
    System.out.println("这一行不会被执行"); // try 块里，异常抛出点之后的代码会被跳过
} catch (IllegalArgumentException e) {
    System.out.println("支付失败：" + e.getMessage()); // 捕获异常，e.getMessage() 拿到异常信息
} finally {
    System.out.println("不管成功还是失败，这里都会执行"); // finally 块无论是否发生异常都会执行
}
```

`finally` 块常用来做"收尾"的工作（比如关闭文件、释放资源），它的特点是**无论 try 块是否抛出异常，都一定会执行**。

> 🇯🇵 `finally` ブロックはよく「後始末」の作業（ファイルを閉じる、リソースを解放するなど）に使われ、その特徴は**tryブロックが例外をスローするかどうかにかかわらず、必ず実行される**ことです。

`RuntimeException`（比如本例的 `IllegalArgumentException`）属于"运行时异常"，Java 不强制要求调用方必须写 `try-catch`（这类异常也叫"非受检异常"）；而另一类"受检异常"（比如涉及文件操作的 `IOException`）编译器会强制要求调用方要么 `try-catch`，要么在方法签名上继续 `throws` 往外抛。本教程后续示例以 `RuntimeException` 及其子类为主，这个区分先有印象即可。

> 🇯🇵 `RuntimeException`（例えば本例の `IllegalArgumentException`）は「実行時例外」に属し、Javaは呼び出し側に必ず `try-catch` を書くことを強制しません（この種の例外は「非検査例外」とも呼ばれます）。一方もう1つの「検査例外」（例えばファイル操作に関わる `IOException`）は、コンパイラが呼び出し側に `try-catch` するか、メソッドシグネチャで引き続き `throws` して外に投げるかのどちらかを強制します。本チュートリアルの以降のサンプルは `RuntimeException` とそのサブクラスを中心に扱うので、この区別はまず印象として持っておけば十分です。

## 图解 ／ 図解

```
List：能自动伸缩长度的"数组"
┌─────┬─────┬─────┐
│ 小明 │ 小红 │ ... │  size() 会随 add/remove 自动变化
└─────┴─────┴─────┘
  [0]   [1]

Map：key → value 的映射
"xiaoming" ──▶ User(小明)
"xiaohong" ──▶ User(小红)

enum：把可能的取值锁死成有限的几个
OrderStatus 只能是：
PENDING | PAID | SHIPPED | COMPLETED | CANCELLED
（不可能出现列表之外的值）

异常处理流程：
try {
    可能出问题的代码
    ──throw 一个异常──┐
}                     │
catch (对应类型) {  ◀──┘ 跳过 try 块剩余代码，直接跳到匹配的 catch
    处理异常
}
finally {
    无论是否异常，都会执行
}
```

## 最小示例 ／ 最小限のサンプル

`CollectionsEnumExceptionDemo.java`
```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CollectionsEnumExceptionDemo {
    public static void main(String[] args) {
        // ---------- List ----------
        List<User> users = new ArrayList<>();
        users.add(new User("小明"));
        users.add(new User("小红"));
        System.out.println("用户数量：" + users.size());
        for (User user : users) {
            System.out.println("- " + user.getName());
        }

        // ---------- Map ----------
        Map<String, User> userMap = new HashMap<>();
        userMap.put("xiaoming", users.get(0));
        userMap.put("xiaohong", users.get(1));
        User found = userMap.get("xiaoming");
        System.out.println("根据 key 查到：" + found.getName());

        // ---------- enum ----------
        OrderStatus status = OrderStatus.PAID;
        if (status == OrderStatus.PAID) {
            System.out.println("订单状态：已支付，可以安排发货");
        }

        // ---------- 异常 ----------
        OrderService service = new OrderService();
        try {
            service.pay(-100);
            System.out.println("这一行不会被执行");
        } catch (IllegalArgumentException e) {
            System.out.println("支付失败：" + e.getMessage());
        } finally {
            System.out.println("本次支付流程结束");
        }
    }
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

enum OrderStatus {
    PENDING,
    PAID,
    SHIPPED,
    COMPLETED,
    CANCELLED
}

class OrderService {
    public void pay(double amount) throws IllegalArgumentException {
        if (amount <= 0) {
            throw new IllegalArgumentException("支付金额必须大于 0");
        }
        System.out.println("支付成功，金额：" + amount);
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `List<User> users = new ArrayList<>();`：声明一个只能装 `User` 的 `List`，`<>` 里可以留空由编译器推断。<br><span class="ja-inline">🇯🇵 `List<User> users = new ArrayList<>();`：`User` しか入れられない `List` を宣言します。`<>` の中は空にしてコンパイラに推論させることができます。</span>
- `users.size()`：注意集合用的是方法 `size()`（有括号），而不是数组的属性 `length`（无括号），这是初学者极易搞混的地方。<br><span class="ja-inline">🇯🇵 `users.size()`：コレクションはメソッド `size()`（括弧あり）を使うのであって、配列の属性 `length`（括弧なし）ではない点に注意してください。これは初心者が非常に混同しやすい部分です。</span>
- `Map<String, User> userMap = new HashMap<>();`：泛型有两个类型参数，第一个是 key 的类型，第二个是 value 的类型。<br><span class="ja-inline">🇯🇵 `Map<String, User> userMap = new HashMap<>();`：ジェネリクスには2つの型引数があり、1つ目はkeyの型、2つ目はvalueの型です。</span>
- `userMap.put("xiaoming", users.get(0));`：把 key `"xiaoming"` 和 value（`users` 里下标 0 的那个 `User` 对象）存成一对。<br><span class="ja-inline">🇯🇵 `userMap.put("xiaoming", users.get(0));`：key `"xiaoming"` と value（`users` の添字0の `User` オブジェクト）を1組として格納します。</span>
- `OrderStatus status = OrderStatus.PAID;`：`PAID` 是 `OrderStatus` 枚举里预先定义好的一个固定值，写法是"枚举类型名.某个值"。<br><span class="ja-inline">🇯🇵 `OrderStatus status = OrderStatus.PAID;`：`PAID` は `OrderStatus` 列挙型の中で事前に定義された固定値の1つで、書き方は「列挙型名.値」です。</span>
- `if (status == OrderStatus.PAID)`：枚举值之间可以直接用 `==` 比较（因为每个枚举值在整个程序里都是唯一的一份），不需要像比较字符串内容那样用 `.equals()`。<br><span class="ja-inline">🇯🇵 `if (status == OrderStatus.PAID)`：列挙値同士は直接 `==` で比較できます（各列挙値はプログラム全体で唯一のインスタンスであるため）。文字列の内容を比較するときのように `.equals()` を使う必要はありません。</span>
- `throw new IllegalArgumentException("支付金额必须大于 0");`：主动创建一个异常对象并抛出，程序会立刻停止执行 `pay` 方法里剩下的代码，转而去调用方寻找能处理这个异常的 `catch`。<br><span class="ja-inline">🇯🇵 `throw new IllegalArgumentException("支付金额必须大于 0");`：能動的に例外オブジェクトを作成してスローします。プログラムは即座に `pay` メソッド内の残りのコードの実行を止め、呼び出し元でこの例外を処理できる `catch` を探しに行きます。</span>
- `catch (IllegalArgumentException e)`：捕获类型必须能匹配抛出的异常类型（这里完全一致），`e` 是捕获到的异常对象，`e.getMessage()` 能拿到抛出时传入的那句提示信息。<br><span class="ja-inline">🇯🇵 `catch (IllegalArgumentException e)`：捕捉する型はスローされた例外の型に一致する必要があります（ここでは完全に一致しています）。`e` は捕捉された例外オブジェクトで、`e.getMessage()` でスロー時に渡されたメッセージを取得できます。</span>
- `finally { ... }`：无论 `try` 块是正常执行完还是中途被异常打断，`finally` 里的代码都会被执行一次。<br><span class="ja-inline">🇯🇵 `finally { ... }`：`try` ブロックが正常に実行し終えても、途中で例外によって中断されても、`finally` 内のコードは必ず1回実行されます。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. 依次执行 `List` 相关代码：创建、添加、遍历打印，`size()` 会随着 `add` 操作自动增加，不需要像数组那样提前声明长度。<br><span class="ja-inline">🇯🇵 `List` 関連のコードが順に実行されます。作成、追加、巡回して出力する流れで、`size()` は `add` 操作に伴って自動的に増え、配列のように事前に長さを宣言する必要はありません。</span>
2. 执行 `Map` 相关代码：`put` 存入两对键值对，`get("xiaoming")` 根据 key 找到对应的 `User` 对象。<br><span class="ja-inline">🇯🇵 `Map` 関連のコードを実行します。`put` で2組のキーと値のペアを格納し、`get("xiaoming")` でkeyに基づいて対応する `User` オブジェクトを見つけます。</span>
3. 执行 `enum` 相关代码：`status` 被赋值为 `OrderStatus.PAID`，`==` 比较成立，打印提示。<br><span class="ja-inline">🇯🇵 `enum` 関連のコードを実行します。`status` に `OrderStatus.PAID` が代入され、`==` の比較が成立し、メッセージが出力されます。</span>
4. 执行到 `service.pay(-100);`：<br><span class="ja-inline">🇯🇵 `service.pay(-100);` の実行に到達します。</span>
   - 进入 `pay` 方法，`amount` 为 `-100`，满足 `amount <= 0`，执行 `throw new IllegalArgumentException(...)`。<br><span class="ja-inline">🇯🇵 `pay` メソッドに入り、`amount` は `-100` で `amount <= 0` を満たすため、`throw new IllegalArgumentException(...)` が実行されます。</span>
   - `pay` 方法内部剩下的代码（`System.out.println("支付成功...")`）不会被执行。<br><span class="ja-inline">🇯🇵 `pay` メソッド内の残りのコード（`System.out.println("支付成功...")`）は実行されません。</span>
   - 异常沿着调用链"冒泡"回到调用它的地方，也就是 `try` 块里 `service.pay(-100);` 这一行。<br><span class="ja-inline">🇯🇵 例外は呼び出しチェーンを「バブルアップ」して、それを呼び出した場所、つまり `try` ブロック内の `service.pay(-100);` の行に戻ります。</span>
   - Java 发现这里被 `try` 包裹，且紧跟的 `catch (IllegalArgumentException e)` 类型匹配，于是执行 `catch` 块，`try` 块里 `service.pay(-100);` 之后的代码（"这一行不会被执行"）被跳过。<br><span class="ja-inline">🇯🇵 Javaはここが `try` に包まれており、後に続く `catch (IllegalArgumentException e)` の型が一致することを発見し、`catch` ブロックを実行します。`try` ブロック内の `service.pay(-100);` より後のコード（「この行は実行されません」）はスキップされます。</span>
5. 无论上一步是走了 `catch` 还是没有异常直接走完 `try`，`finally` 块都会被执行。<br><span class="ja-inline">🇯🇵 前のステップが `catch` を通ったか、例外なしに `try` を最後まで実行したかにかかわらず、`finally` ブロックは実行されます。</span>

输出：
> 🇯🇵 出力：
```
用户数量：2
- 小明
- 小红
根据 key 查到：小明
订单状态：已支付，可以安排发货
支付失败：支付金额必须大于 0
本次支付流程结束
```

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| `userMap.get("xiaowang")` 返回 `null`，后面代码报 `NullPointerException` | key 不存在时 `get` 不会报错，而是安静地返回 `null`<br><span class="ja-inline">🇯🇵 keyが存在しない場合、`get` はエラーを出さず静かに `null` を返す </span>| 取值后先判断是否为 `null`，或者先用 `containsKey` 检查<br><span class="ja-inline">🇯🇵 値を取得した後にまず `null` かどうか判定するか、先に `containsKey` でチェックする </span>|
| 用 `list.length` 报编译错误 | 集合用的是方法 `size()`，数组才用属性 `length`<br><span class="ja-inline">🇯🇵 コレクションはメソッド `size()` を使い、配列だけが属性 `length` を使う </span>| 集合统一用 `.size()`，数组统一用 `.length`，两者语法不同<br><span class="ja-inline">🇯🇵 コレクションは一律 `.size()`、配列は一律 `.length` を使う。両者の構文は異なる </span>|
| 枚举值比较用了 `.equals()` 却总觉得"应该没问题但习惯上更常见 `==`"<br><span class="ja-inline">🇯🇵 列挙値の比較に `.equals()` を使ったが、「問題ないはずだが慣習的には `==` の方が一般的」と感じる </span>| 二者其实都能正确工作，因为每个枚举常量在 JVM 里是唯一实例，但社区更推荐直接用 `==`，可读性更好也不用担心为 `null` 时的空指针<br><span class="ja-inline">🇯🇵 実はどちらも正しく動作します。各列挙定数はJVM内で唯一のインスタンスだからです。しかしコミュニティでは `==` を直接使うことが推奨されており、可読性が良く `null` の場合の空ポインタも心配する必要がない </span>| 枚举比较优先用 `==`<br><span class="ja-inline">🇯🇵 列挙値の比較は `==` を優先して使う </span>|
| `catch` 块类型和抛出的异常类型对不上，异常没有被捕获，程序仍然崩溃并打印异常堆栈<br><span class="ja-inline">🇯🇵 `catch` ブロックの型とスローされた例外の型が合わず、例外が捕捉されず、プログラムはクラッシュして例外スタックが出力される </span>| `catch` 只能捕获它声明的类型（及其子类型），类型不匹配就不会进入这个 `catch`<br><span class="ja-inline">🇯🇵 `catch` は宣言された型（およびそのサブタイプ）しか捕捉できず、型が一致しなければこの `catch` には入らない </span>| 检查抛出的具体是什么异常类型，`catch` 里写对应类型，或者写更通用的 `Exception` 兜底（仅调试阶段使用，实际项目要精确捕获）<br><span class="ja-inline">🇯🇵 スローされている具体的な例外の型を確認し、`catch` に対応する型を書くか、より汎用的な `Exception` で受け止める（デバッグ段階のみ使用し、実際のプロジェクトでは正確に捕捉すべき） </span>|
| 以为 `finally` 里的代码"出了异常就不执行了"<br><span class="ja-inline">🇯🇵 `finally` 内のコードは「例外が起きたら実行されない」と思ってしまう </span>| 恰恰相反，`finally` 的设计目的就是"不管有没有异常都要执行"<br><span class="ja-inline">🇯🇵 それどころか、`finally` の設計目的はまさに「例外の有無にかかわらず実行される」ことである </span>| 记住 `finally` 是收尾专用，正常情况和异常情况都会跑到这里<br><span class="ja-inline">🇯🇵 `finally` は後始末専用であり、正常な場合も例外の場合もここに到達することを覚えておく </span>|

## 动手练习 ／ 演習

1. 创建一个 `List<User>`，添加 5 个用户，写一个循环找出并打印"名字长度最长"的那个用户。<br><span class="ja-inline">🇯🇵 `List<User>` を作成して5人のユーザーを追加し、ループで「名前の長さが最も長い」ユーザーを見つけて出力してみましょう。</span>
2. 创建一个 `Map<String, Integer>` 表示"商品名 -> 库存数量"，实现"查询某个商品库存，不存在则打印提示"的逻辑。<br><span class="ja-inline">🇯🇵 「商品名 -> 在庫数」を表す `Map<String, Integer>` を作成し、「ある商品の在庫を検索し、存在しなければメッセージを出力する」というロジックを実装してみましょう。</span>
3. 定义一个 `enum Weekday`（周一到周日），写一个方法根据传入的 `Weekday` 判断是不是"周末"（周六或周日）。<br><span class="ja-inline">🇯🇵 `enum Weekday`（月曜日から日曜日）を定義し、渡された `Weekday` が「週末」（土曜日または日曜日）かどうかを判定するメソッドを書いてみましょう。</span>
4. 写一个方法 `divide(int a, int b)`，当 `b` 为 0 时主动 `throw` 一个 `ArithmeticException`，调用方用 `try-catch-finally` 处理并观察三种块各自的执行时机。<br><span class="ja-inline">🇯🇵 `divide(int a, int b)` というメソッドを書き、`b` が0のときに `ArithmeticException` を能動的に `throw` するようにしてみましょう。呼び出し側は `try-catch-finally` で処理し、3種類のブロックそれぞれの実行タイミングを観察しましょう。</span>

## 小测验 ／ 小テスト

1. `List` 和数组的核心区别是什么？（这个问题在阶段复习里也会再次出现，这里先自己想一遍）<br><span class="ja-inline">🇯🇵 `List` と配列の核心的な違いは何ですか？（この問題はステージ復習でも再び出てきます。ここでまず自分で考えてみましょう）</span>
2. `Map.get(key)` 在 key 不存在时会抛出异常吗？<br><span class="ja-inline">🇯🇵 `Map.get(key)` はkeyが存在しない場合に例外をスローしますか？</span>
3. 为什么枚举比直接用字符串表示状态更安全？<br><span class="ja-inline">🇯🇵 なぜ列挙型は文字列で直接ステータスを表すよりも安全なのですか？</span>
4. `throw` 和 `throws` 分别用在什么地方？<br><span class="ja-inline">🇯🇵 `throw` と `throws` はそれぞれどこで使われますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 数组长度一旦创建就固定不能变，`List` 的长度可以随着 `add`/`remove` 自动伸缩；此外数组访问下标越界会抛异常且没有内置的增删方法，而 `List` 提供了一整套增删查的方法。<br><span class="ja-inline">🇯🇵 配列は一度作成すると長さが固定され変更できませんが、`List` の長さは `add`/`remove` に伴って自動的に伸縮できます。さらに配列は添字が範囲外だと例外をスローし、組み込みの追加・削除メソッドを持ちませんが、`List` は追加・削除・検索の一連のメソッドを提供します。</span>
2. 不会抛出异常，`get(key)` 在 key 不存在时安静地返回 `null`，需要调用方自己判断。<br><span class="ja-inline">🇯🇵 例外はスローされません。`get(key)` はkeyが存在しない場合、静かに `null` を返すので、呼び出し側が自分で判定する必要があります。</span>
3. 因为枚举的取值范围在编译期就被限定死了，不可能出现拼写错误或者凭空多出一个不存在的值；而字符串没有这种约束，`"PAID"`、`"paid"`、`"Paid"` 编译器都不会拦截，容易埋下低级 bug。<br><span class="ja-inline">🇯🇵 列挙型は値の範囲がコンパイル時にすでに固定されており、スペルミスや存在しない値が勝手に増えることはあり得ないからです。一方文字列にはこのような制約がなく、`"PAID"`、`"paid"`、`"Paid"` はどれもコンパイラに阻止されないため、初歩的なバグの元になりやすいです。</span>
4. `throw` 写在方法体内部，用来主动抛出一个具体的异常对象；`throws` 写在方法签名上，用来声明"这个方法可能会抛出某种异常"，提醒调用者注意处理。<br><span class="ja-inline">🇯🇵 `throw` はメソッド本体の中に書き、具体的な例外オブジェクトを能動的にスローするために使います。`throws` はメソッドシグネチャに書き、「このメソッドはある種の例外をスローする可能性がある」ことを宣言し、呼び出し元に処理するよう注意を促すために使います。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经掌握了 `List/ArrayList`、`Map/HashMap` 的基础用法，理解了枚举如何把"有限选项"变成编译期就能检查的类型，也学会了用异常机制处理程序运行中的错误情况。下一章将学习 Lambda 表达式、Stream 基础、Optional，以及一个非常重要的概念——注解（Annotation）到底是什么，为后面大量出现的 `@Service`、`@RestController` 等打好基础。

> 🇯🇵 これで `List/ArrayList`、`Map/HashMap` の基本的な使い方を習得し、列挙型がどのように「有限の選択肢」をコンパイル時にチェックできる型に変えるかを理解し、例外処理の仕組みでプログラム実行中のエラー状況を扱う方法も学びました。次の章ではLambda式、Streamの基礎、Optional、そして非常に重要な概念——アノテーション（Annotation、注解）とは一体何かを学び、後で大量に登場する `@Service`、`@RestController` などのための基礎を固めます。
