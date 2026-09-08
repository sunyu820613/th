# 第 2 章　变量、数据类型与运算符 ／ 第2章　変数・データ型・演算子

## 本章目标 ／ 本章の目標
理解"变量"是什么、为什么 Java 要求变量必须先声明类型；掌握常用基本数据类型；能用运算符做基本的算术、比较和条件判断。

> 🇯🇵 「変数」とは何か、なぜJavaでは変数を使う前に型を宣言しなければならないのかを理解します。よく使う基本データ型を習得し、演算子で基本的な算術・比較・条件判断ができるようになります。

## 一句话理解 ／ 一言で理解する
变量是"给一块内存空间起个名字，用来存一个值"；Java 要求你在起名字的同时，还要说清楚这块空间准备存什么类型的值（整数？小数？文字？）。

> 🇯🇵 変数とは「メモリ上の領域に名前を付けて、値を保存する」ものです。Javaでは名前を付けると同時に、その領域にどんな型の値（整数？小数？文字？）を保存するのかも明示しなければなりません。

## 为什么需要它 ／ なぜ必要なのか
如果不区分类型，`10` 到底是"十个苹果"还是"十块钱的小数部分"，计算机自己是分不清的。Java 是"强类型"语言：每个变量的类型在编译阶段就确定下来，编译器会替你提前检查"这个类型能不能这样用"，很多低级错误（比如把文字当数字加）在编译时就会被拦下，而不是等程序跑起来才出错。

> 🇯🇵 型を区別しなければ、`10` が「リンゴ10個」なのか「10円の小数部分」なのか、コンピュータ自身には判断できません。Javaは「強い型付け（strong typing）」言語であり、各変数の型はコンパイル時点で確定します。コンパイラが事前に「この型でこの使い方が可能か」をチェックしてくれるため、文字を数字として加算するような初歩的なミスの多くは、プログラムを実行する前のコンパイル時点で防ぐことができます。

## 核心概念 ／ コアコンセプト

### 2.1 基本数据类型 ／ 基本データ型

| 类型 ／ 种类 | 用途 ／ 用途 | 例子 ／ 例 |
|---|---|---|
| `int` | 整数（最常用）<br><span class="ja-inline">🇯🇵 整数（最もよく使う） </span>| `int age = 18;` |
| `long` | 更大的整数（超过约 21 亿时用）<br><span class="ja-inline">🇯🇵 より大きい整数（約21億を超える場合に使う） </span>| `long views = 3000000000L;` |
| `double` | 小数（最常用）<br><span class="ja-inline">🇯🇵 小数（最もよく使う） </span>| `double price = 9.9;` |
| `boolean` | 真 / 假，只有两个值<br><span class="ja-inline">🇯🇵 真／偽、値は2つだけ </span>| `boolean isVip = true;` |
| `char` | 单个字符<br><span class="ja-inline">🇯🇵 単一の文字 </span>| `char grade = 'A';` |
| `String` | 字符串（严格说这不是"基本类型"，是一个对象，但初学阶段先当成"文字"类型用即可）<br><span class="ja-inline">🇯🇵 文字列（厳密には「基本データ型」ではなくオブジェクトですが、初心者の段階では「文字」の型として使えば問題ありません） </span>| `String name = "小明";` |

`String` 和其它类型的一个明显区别：`String` 用双引号 `"..."`，`char` 用单引号 `'...'` 且只能放一个字符。

> 🇯🇵 `String` と他の型との明らかな違いは、`String` はダブルクォート `"..."` を使い、`char` はシングルクォート `'...'` を使って文字を1つだけ入れる点です。

### 2.2 常用运算符 ／ よく使う演算子

| 类别 ／ 分類 | 运算符 ／ 演算子 | 说明 ／ 説明 |
|---|---|---|
| 算术<br><span class="ja-inline">🇯🇵 算術 </span>| `+ - * / %` | `%` 是取余数，比如 `7 % 2` 结果是 `1`<br><span class="ja-inline">🇯🇵 `%` は剰余（余り）を求める演算子で、例えば `7 % 2` の結果は `1` です </span>|
| 比较<br><span class="ja-inline">🇯🇵 比較 </span>| `> < >= <= == !=` | 结果都是 `boolean`（true / false）<br><span class="ja-inline">🇯🇵 結果はすべて `boolean`（true / false）になります </span>|
| 逻辑<br><span class="ja-inline">🇯🇵 論理 </span>| `&& \|\| !` | "并且"、"或者"、"取反"<br><span class="ja-inline">🇯🇵 「かつ」「または」「否定」 </span>|
| 赋值<br><span class="ja-inline">🇯🇵 代入 </span>| `= += -= *= /=` | `score += 5` 等价于 `score = score + 5`<br><span class="ja-inline">🇯🇵 `score += 5` は `score = score + 5` と同じ意味です </span>|
| 三元<br><span class="ja-inline">🇯🇵 三項 </span>| `条件 ? 值A : 值B` | 条件为真取值 A，否则取值 B<br><span class="ja-inline">🇯🇵 条件が真なら値Aを、そうでなければ値Bを取ります </span>|

## 图解 ／ 図解

```
声明变量                        赋值
  int   score          ;            score = 88;
   ↑        ↑                          ↑
 类型      变量名                    存进这块内存空间的值

内存里大概长这样：
┌────────────┐
│ score = 88 │   ← 变量名和值绑在一起，类型是 int，只能存整数
└────────────┘
```

## 最小示例 ／ 最小限のサンプル

`VariableDemo.java`
```java
public class VariableDemo {
    public static void main(String[] args) {
        int score = 88;
        int bonus = 5;
        int total = score + bonus;      // 算术运算符

        boolean isPass = total >= 60;   // 比较运算符，得到一个布尔值
        String result = isPass ? "及格" : "不及格"; // 三元运算符

        System.out.println("总分：" + total);
        System.out.println("结果：" + result);
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `int score = 88;`：声明一个 `int` 类型的变量 `score`，并立即赋值为 `88`。声明和赋值可以写在一起（这里就是），也可以分两步写（先 `int score;` 再 `score = 88;`）。<br><span class="ja-inline">🇯🇵 `int score = 88;`：`int` 型の変数 `score` を宣言し、同時に `88` を代入します。宣言と代入は一緒に書くこともできますし（ここではその形）、2段階に分けて書く（先に `int score;`、次に `score = 88;`）こともできます。</span>
- `int total = score + bonus;`：`+` 在这里是算术加法，因为两边都是 `int`，结果也是 `int`。<br><span class="ja-inline">🇯🇵 `int total = score + bonus;`：ここでの `+` は算術加算です。両辺が `int` なので、結果も `int` になります。</span>
- `boolean isPass = total >= 60;`：`>=` 是比较运算符，比较的结果不是数字，而是一个 `boolean` 值（`true` 或 `false`），直接存进 `isPass`。<br><span class="ja-inline">🇯🇵 `boolean isPass = total >= 60;`：`>=` は比較演算子で、比較結果は数値ではなく `boolean` 値（`true` または `false`）になり、そのまま `isPass` に代入されます。</span>
- `String result = isPass ? "及格" : "不及格";`：三元运算符的读法是"如果 `isPass` 为真，取冒号前面的值；否则取冒号后面的值"。它是 `if-else` 的简写形式，专门用在"根据条件选一个值"的场景。<br><span class="ja-inline">🇯🇵 `String result = isPass ? "及格" : "不及格";`：三項演算子は「もし `isPass` が真ならコロンの前の値を、そうでなければコロンの後ろの値を取る」と読みます。これは `if-else` の省略形で、「条件によって値を1つ選ぶ」場面に特化して使われます。</span>
- `System.out.println("总分：" + total);`：这里的 `+` 不再是算术加法，而是"字符串拼接"——只要 `+` 两边有一个是 `String`，Java 就会自动把另一边转换成文字再拼起来。<br><span class="ja-inline">🇯🇵 `System.out.println("总分：" + total);`：ここでの `+` はもう算術加算ではなく「文字列連結」です。`+` の片方が `String` であれば、Javaはもう一方を自動的に文字に変換して連結します。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. JVM 执行到 `int score = 88;`，在内存里开辟一块空间存 `88`，贴上标签 `score`。<br><span class="ja-inline">🇯🇵 JVMが `int score = 88;` を実行すると、メモリ上に領域を確保して `88` を保存し、`score` というラベルを付けます。</span>
2. 依次执行后面几行，`total` 被计算为 `88 + 5 = 93`。<br><span class="ja-inline">🇯🇵 続けて次の数行を実行し、`total` は `88 + 5 = 93` として計算されます。</span>
3. `total >= 60` 被判断为 `true`，存入 `isPass`。<br><span class="ja-inline">🇯🇵 `total >= 60` は `true` と判定され、`isPass` に保存されます。</span>
4. 三元表达式根据 `isPass` 为 `true`，取值 `"及格"`，存入 `result`。<br><span class="ja-inline">🇯🇵 三項式は `isPass` が `true` であることに基づき、値 `"及格"` を取って `result` に保存します。</span>
5. 两条 `println` 依次把拼接好的字符串打印到控制台。<br><span class="ja-inline">🇯🇵 2つの `println` が、連結された文字列を順にコンソールへ出力します。</span>

输出：
> 🇯🇵 出力：
```
总分：93
结果：及格
```

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| `incompatible types: String cannot be converted to int` | 想把字符串直接赋给 `int` 变量，比如 `int age = "18";`<br><span class="ja-inline">🇯🇵 文字列を直接 `int` 変数に代入しようとした、例えば `int age = "18";` </span>| 类型要匹配：整数字面量不加引号，`int age = 18;`<br><span class="ja-inline">🇯🇵 型を一致させる必要があります。整数リテラルには引用符を付けず `int age = 18;` とする </span>|
| `1 + 1 + "个苹果"` 输出 `"2个苹果"`，但 `"苹果"+ 1 + 1` 输出 `"苹果11"` | `+` 运算是从左到右依次执行，一旦遇到字符串就全部变成拼接<br><span class="ja-inline">🇯🇵 `+` 演算は左から右へ順に実行され、一度文字列に出会うと以降はすべて連結になる </span>| 需要先算好数字部分，可以加括号：`"苹果" + (1 + 1)`<br><span class="ja-inline">🇯🇵 数値部分を先に計算する必要があり、括弧を付ければよい：`"苹果" + (1 + 1)` </span>|
| 除法结果和预期不一样，比如 `7 / 2` 得到 `3` 而不是 `3.5` | 两个 `int` 相除，结果自动截断为 `int`（整数除法）<br><span class="ja-inline">🇯🇵 `int` 同士の除算は、結果が自動的に `int`（整数除算）に切り捨てられる </span>| 想要小数结果，至少一边要是 `double`，如 `7.0 / 2`<br><span class="ja-inline">🇯🇵 小数の結果が欲しい場合は、少なくとも片方を `double` にする必要がある。例：`7.0 / 2` </span>|

## 动手练习 ／ 演習

1. 声明一个 `double` 类型的 `price` 和一个 `int` 类型的 `count`，计算总价 `total = price * count`，打印结果。<br><span class="ja-inline">🇯🇵 `double` 型の `price` と `int` 型の `count` を宣言し、合計金額 `total = price * count` を計算して出力してみましょう。</span>
2. 用三元运算符判断一个整数变量 `num` 是奇数还是偶数（提示：用 `%`）。<br><span class="ja-inline">🇯🇵 三項演算子を使って、整数変数 `num` が奇数か偶数かを判定してみましょう（ヒント：`%` を使う）。</span>
3. 故意写一行 `int x = "10";`，观察编译器报什么错，理解"强类型"的含义。<br><span class="ja-inline">🇯🇵 わざと `int x = "10";` という行を書いて、コンパイラがどんなエラーを出すか観察し、「強い型付け」の意味を理解しましょう。</span>

## 小测验 ／ 小テスト

1. `int a = 7 / 2;` 的结果是多少？为什么？<br><span class="ja-inline">🇯🇵 `int a = 7 / 2;` の結果はいくつですか？その理由も答えてください。</span>
2. `"分数：" + 60 + 5` 和 `"分数：" + (60 + 5)` 输出结果一样吗？<br><span class="ja-inline">🇯🇵 `"分数：" + 60 + 5` と `"分数：" + (60 + 5)` の出力結果は同じですか？</span>
3. `char` 类型的值要用什么引号包起来？<br><span class="ja-inline">🇯🇵 `char` 型の値はどんな引用符で囲む必要がありますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 结果是 `3`。两个 `int` 相除是"整数除法"，小数部分直接被舍弃，不会四舍五入。<br><span class="ja-inline">🇯🇵 結果は `3` です。`int` 同士の除算は「整数除算」であり、小数部分はそのまま切り捨てられ、四捨五入はされません。</span>
2. 不一样。前者从左到右依次拼接："分数：" + 60 → "分数：60"，再 + 5 → "分数：605"；后者括号里先算出 65，再拼接成 "分数：65"。<br><span class="ja-inline">🇯🇵 異なります。前者は左から右へ順に連結され、「分数：」+ 60 → 「分数：60」、さらに + 5 → 「分数：605」となります。後者は括弧内が先に計算されて65になり、「分数：65」と連結されます。</span>
3. 单引号，例如 `'A'`，且只能放恰好一个字符。<br><span class="ja-inline">🇯🇵 シングルクォートです。例えば `'A'` のように、必ずちょうど1文字だけを入れます。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经掌握了 Java 的基本数据类型和常用运算符，理解了"强类型"意味着什么。下一章学习分支和循环——让程序具备判断和重复执行的能力。

> 🇯🇵 これでJavaの基本データ型とよく使う演算子を習得し、「強い型付け」が何を意味するかを理解しました。次の章では分岐とループを学び、プログラムに判断力と繰り返し実行する能力を持たせます。
