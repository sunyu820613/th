# 第 1 章　环境搭建与第一个程序 ／ 第1章　環境構築とはじめてのプログラム

## 本章目标 ／ 本章の目標
装好 JDK 21 和 IntelliJ IDEA；理解 Java 代码"编译再运行"的两步走；亲手跑通第一个 Java 程序。

> 🇯🇵 JDK 21とIntelliJ IDEAをインストールします。Javaコードの「コンパイルしてから実行する」という2つのステップを理解します。そして、自分の手で最初のJavaプログラムを実行します。

## 一句话理解 ／ 一言で理解する
Java 代码不能被电脑直接执行，必须先"翻译"成一种中间格式（字节码），再交给一个专门的"翻译官"（JVM）负责加载和执行。

> 🇯🇵 Javaのコードはパソコンが直接実行することはできません。まず中間形式（バイトコード）に「翻訳」し、それから専門の「通訳者」（JVM）が読み込んで実行します。

## 为什么需要它 ／ なぜ必要なのか
如果没有统一的运行环境，你写的代码在你电脑上能跑，换一台电脑可能就跑不了（缺少必要的运行时、版本不对等）。JDK 提供了写代码、编译代码所需的全部工具；JVM 则保证只要装了它，同一份程序在 Windows、Mac、Linux 上都能跑起来——这也是 Java 常被称为"一次编写，到处运行"的原因。

> 🇯🇵 統一された実行環境がなければ、自分のパソコンでは動くコードでも、別のパソコンでは動かないかもしれません（必要なランタイムが無い、バージョンが合わないなど）。JDK（Java Development Kit、Javaを書いてコンパイルするために必要な全ツールをまとめたキット）はコードを書いてコンパイルするために必要な全てのツールを提供します。JVM（Java Virtual Machine、Java仮想マシン）さえインストールしておけば、同じプログラムをWindows・Mac・Linuxのどれでも動かすことができます——これがJavaが「一度書けば、どこでも動く」と言われる理由です。

## 核心概念 ／ コアコンセプト

| 术语 ／ 用語 | 含义 ／ 意味 |
|---|---|
| JDK（Java Development Kit） | 开发工具包，包含编译器 `javac`、运行工具 `java`、标准类库等，写 Java 必装<br><span class="ja-inline">🇯🇵 開発キット。コンパイラ `javac`、実行ツール `java`、標準クラスライブラリなどを含み、Javaを書くには必ずインストールする必要があります </span>|
| JRE（Java Runtime Environment） | 只能运行 Java 程序，不能开发（现在很少单独安装，JDK 已包含它）<br><span class="ja-inline">🇯🇵 Javaプログラムを実行するだけのもので、開発はできません（今ではJDKに含まれているため、単独でインストールすることは少なくなりました） </span>|
| JVM（Java Virtual Machine） | Java 虚拟机，负责加载和执行字节码的"翻译官"。运行时它既可能逐条解释执行字节码，也可能通过 JIT（即时编译）把频繁执行的"热点代码"直接编译成机器码来提速——这部分原理比较深，零基础阶段只需要记住"JVM 负责执行字节码"即可，不用展开<br><span class="ja-inline">🇯🇵 Java仮想マシン。バイトコードを読み込んで実行する「通訳者」です。実行時には1行ずつバイトコードを解釈して実行することもあれば、JIT（Just-In-Time、実行時によく使われる「ホットコード」を機械語へ直接コンパイルして高速化する仕組み）を使うこともあります——この仕組みはやや深い内容なので、初心者の段階では「JVMがバイトコードを実行する」とだけ覚えておけば十分です </span>|
| 字节码（Bytecode） | `.java` 源文件编译后得到的 `.class` 文件内容，JVM 能看懂的中间格式<br><span class="ja-inline">🇯🇵 `.java` ソースファイルをコンパイルして得られる `.class` ファイルの内容で、JVMが理解できる中間形式です </span>|
| IDE | 集成开发环境，如 IntelliJ IDEA，把编辑、编译、运行、调试整合在一个界面里<br><span class="ja-inline">🇯🇵 統合開発環境（Integrated Development Environment）。IntelliJ IDEAのように、編集・コンパイル・実行・デバッグを一つの画面にまとめたツールです </span>|

本教程统一使用：**JDK 21（LTS 长期支持版）+ IntelliJ IDEA Community 版**。后续所有章节的代码，均可在此环境下直接运行。

> 🇯🇵 本チュートリアルでは **JDK 21（LTS、長期サポート版）+ IntelliJ IDEA Community版** に統一します。以降の全ての章のコードは、この環境でそのまま実行できます。

**下载地址** ／ **ダウンロード先**：

- JDK 21：推荐使用免费开源、无需注册账号的 Eclipse Temurin 构建版 → https://adoptium.net/temurin/releases/?version=21 （如果习惯用 Oracle 官方发行版，也可以从 https://www.oracle.com/java/technologies/downloads/#java21 下载）<br><span class="ja-inline">🇯🇵 JDK 21：無料でオープンソース、アカウント登録不要のEclipse Temurinビルド版をおすすめします → https://adoptium.net/temurin/releases/?version=21 （Oracle公式版に慣れている方は https://www.oracle.com/java/technologies/downloads/#java21 からダウンロードすることもできます）</span>
- IntelliJ IDEA Community 版（免费）：https://www.jetbrains.com/idea/download/ （页面上注意选择 **Community** 版本，不是收费的 Ultimate 版）<br><span class="ja-inline">🇯🇵 IntelliJ IDEA Community版（無料）：https://www.jetbrains.com/idea/download/ （ページ上で必ず **Community** 版を選んでください。有料の Ultimate 版ではありません）</span>

## 图解 ／ 図解

```
写代码            编译                运行
Hello.java  ──javac──▶  Hello.class  ──java──▶  控制台输出
（源代码，人能读懂）      （字节码，JVM 能读懂）    （JVM 加载并执行字节码）
```

对比一下：如果 Java 像"点菜直接上菜"（脚本语言，写完直接跑），那它更像"先把菜谱翻译成后厨看得懂的标准工序单（字节码），不管换哪个后厨（操作系统），只要有会看工序单的厨师（JVM），就能做出同一道菜"。

> 🇯🇵 例えるなら、もしJavaが「注文したらすぐ料理が出てくる」（スクリプト言語のように、書いたらすぐ実行できる）ようなものだとしたら、実際のJavaは「レシピを厨房が読める標準の作業手順書（バイトコード）に翻訳しておき、どの厨房（OS）に変わっても、その手順書を読める料理人（JVM）さえいれば、同じ料理を作れる」という仕組みに近いです。

## 最小示例 ／ 最小限のサンプル

`Hello.java`
```java
public class Hello {
    // main 方法是程序的入口，JVM 启动后第一个执行这里
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

命令行运行：
> 🇯🇵 コマンドラインでの実行：
```bash
javac Hello.java   # 第一步：编译，生成 Hello.class
java Hello          # 第二步：运行（注意这里不写 .class 后缀）
```

## 代码逐行解释 ／ コードの行ごとの解説

- `public class Hello`：声明一个名为 `Hello` 的类。`public` 表示这个类对外部完全可见。Java 规定：**文件名必须和 `public class` 后面的类名完全一致**（区分大小写），所以这段代码必须存在名为 `Hello.java` 的文件里。<br><span class="ja-inline">🇯🇵 `public class Hello`：`Hello` という名前のクラス（class、データと処理をまとめた設計図のような単位）を宣言します。`public` はこのクラスが外部から完全に見える（アクセスできる）ことを意味します。Javaのルールでは、**ファイル名は `public class` の後ろのクラス名と完全に一致させる必要があります**（大文字小文字も区別）。そのため、このコードは必ず `Hello.java` という名前のファイルに保存しなければなりません。</span>
- `public static void main(String[] args)`：这是程序的入口方法。本教程统一使用这个最标准、最常见的写法，初学阶段直接照这个形式写就行（以后你可能会在别的代码里看到 `String... args` 这种写法，那是同一个入口方法的另一种合法参数写法，不是错误代码，这里先不展开）。<br><span class="ja-inline">🇯🇵 `public static void main(String[] args)`：プログラムのエントリーポイント（入口）となるメソッドです。本チュートリアルでは、この最も標準的で一般的な書き方に統一します。初心者の段階ではこの形をそのまま書けば大丈夫です（今後 `String... args` という書き方を見かけるかもしれませんが、それは同じエントリーポイントの別の正しい書き方であり、間違いではありません。ここでは詳しく触れません）。</span>
  - `static` 表示这个方法属于类本身，不需要先创建对象就能调用——JVM 启动时还没有任何对象，所以入口方法必须是 `static`。<br><span class="ja-inline">🇯🇵 `static` は、このメソッドがクラス自体に属しており、オブジェクト（インスタンス）を作らなくても呼び出せることを意味します——JVM起動時にはまだオブジェクトが一つも存在しないため、エントリーポイントとなるメソッドは必ず `static` でなければなりません。</span>
  - `void` 表示这个方法不返回任何值。<br><span class="ja-inline">🇯🇵 `void` はこのメソッドが値を一切返さないことを意味します。</span>
  - `String[] args`：接收命令行传入的参数（本例暂不使用）。<br><span class="ja-inline">🇯🇵 `String[] args`：コマンドラインから渡される引数を受け取ります（このサンプルでは今のところ使用しません）。</span>
- `System.out.println("Hello, Java!");`：调用 Java 标准库里 `System` 类的 `out`（标准输出对象）的 `println` 方法，把字符串打印到控制台并换行。<br><span class="ja-inline">🇯🇵 `System.out.println("Hello, Java!");`：Java標準ライブラリの `System` クラスにある `out`（標準出力オブジェクト）の `println` メソッドを呼び出し、文字列をコンソールに出力して改行します。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. 你在 IDEA 中点击"运行"（或命令行执行 `javac` + `java`）。<br><span class="ja-inline">🇯🇵 IDEAで「実行」ボタンをクリックします（またはコマンドラインで `javac` + `java` を実行します）。</span>
2. `javac` 把 `Hello.java` 编译成 `Hello.class`（字节码），此时还没有任何输出。<br><span class="ja-inline">🇯🇵 `javac` が `Hello.java` を `Hello.class`（バイトコード）にコンパイルします。この時点ではまだ何も出力されません。</span>
3. `java Hello` 命令启动 JVM，JVM 加载 `Hello.class`，找到 `main` 方法开始逐行执行。<br><span class="ja-inline">🇯🇵 `java Hello` コマンドがJVMを起動し、JVMが `Hello.class` を読み込んで `main` メソッドを見つけ、1行ずつ実行を始めます。</span>
4. 执行到 `System.out.println(...)`，JVM 调用操作系统的输出功能，把文字显示在你的控制台窗口。<br><span class="ja-inline">🇯🇵 `System.out.println(...)` の実行に到達すると、JVMがOSの出力機能を呼び出し、文字をコンソールウィンドウに表示します。</span>
5. `main` 方法执行完毕，程序自动结束，JVM 退出。<br><span class="ja-inline">🇯🇵 `main` メソッドの実行が終わると、プログラムは自動的に終了し、JVMも終了します。</span>

输出 ／ 出力：
```
Hello, Java!
```

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| `错误: 找不到或无法加载主类 Hello` | 类名和文件名不一致，或者没有先执行 `javac`<br><span class="ja-inline">🇯🇵 クラス名とファイル名が一致していない、または `javac` を先に実行していない </span>| 检查文件名，确认已生成 `.class` 文件<br><span class="ja-inline">🇯🇵 ファイル名を確認し、`.class` ファイルが生成されているか確かめる </span>|
| `error: class Hello is public, should be declared in a file named Hello.java` | 编译器直接报错，同上<br><span class="ja-inline">🇯🇵 コンパイラが直接エラーを出す、原因は上と同じ </span>| 文件名必须和 `public class` 后的名字完全一致<br><span class="ja-inline">🇯🇵 ファイル名は `public class` の後ろの名前と完全に一致させる </span>|
| 编译通过但双击运行没反应 | 忘了先编译，或者路径不对<br><span class="ja-inline">🇯🇵 先にコンパイルするのを忘れた、またはパスが間違っている </span>| 确认在包含 `.class` 文件的目录下执行 `java Hello`<br><span class="ja-inline">🇯🇵 `.class` ファイルがあるディレクトリで `java Hello` を実行しているか確認する </span>|

## 动手练习 ／ 演習

1. 把打印内容改成你自己的名字，比如 `"Hello, 小明!"`，重新编译运行。<br><span class="ja-inline">🇯🇵 出力内容を自分の名前に変えてみましょう。例えば `"Hello, 太郎!"` にして、再コンパイルして実行します。</span>
2. 故意把类名改成 `hello`（小写），保持文件名 `Hello.java` 不变，观察编译器报什么错，理解这条规则。<br><span class="ja-inline">🇯🇵 わざとクラス名を `hello`（小文字）に変え、ファイル名は `Hello.java` のままにして、コンパイラがどんなエラーを出すか観察し、このルールを理解しましょう。</span>
3. 在 `main` 方法里再加一行 `System.out.println("这是我的第一个 Java 程序");`，观察输出顺序。<br><span class="ja-inline">🇯🇵 `main` メソッドにもう1行 `System.out.println("これは私の最初のJavaプログラムです");` を追加し、出力の順番を観察しましょう。</span>

## 小测验 ／ 小テスト

1. `javac` 和 `java` 分别负责什么？<br><span class="ja-inline">🇯🇵 `javac` と `java` はそれぞれ何を担当していますか？</span>
2. 为什么 `main` 方法必须是 `static` 的？<br><span class="ja-inline">🇯🇵 なぜ `main` メソッドは `static` でなければならないのですか？</span>
3. 如果文件名是 `App.java`，里面写 `public class Hello {...}`，编译会发生什么？<br><span class="ja-inline">🇯🇵 もしファイル名が `App.java` で、中身が `public class Hello {...}` だったら、コンパイル時に何が起こりますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. `javac` 负责把源代码编译成字节码（`.class` 文件）；`java` 负责启动 JVM 执行字节码。<br><span class="ja-inline">🇯🇵 `javac` はソースコードをバイトコード（`.class` ファイル）にコンパイルする役割を担い、`java` はJVMを起動してバイトコードを実行する役割を担います。</span>
2. 因为程序启动时 JVM 还没有创建任何对象，`static` 方法不依赖对象即可直接调用，所以入口方法必须是 `static`。<br><span class="ja-inline">🇯🇵 プログラム起動時にはJVMはまだ一つもオブジェクトを作成していないため、`static` メソッドはオブジェクトに依存せずに直接呼び出せます。そのため、エントリーポイントとなるメソッドは `static` でなければなりません。</span>
3. 编译报错：`class Hello is public, should be declared in a file named Hello.java`——public 类名必须和文件名一致。<br><span class="ja-inline">🇯🇵 コンパイルエラーが発生します：`class Hello is public, should be declared in a file named Hello.java`——publicなクラス名はファイル名と一致させる必要があります。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了 Java "先编译、后运行"的两步模型，装好了开发环境，并跑通了第一个程序。下一章开始学习变量和数据类型——真正开始"给程序数据去处理"。

> 🇯🇵 これでJavaの「まずコンパイル、それから実行」という2ステップのモデルを理解し、開発環境を構築して、最初のプログラムを実行できました。次の章からは変数とデータ型を学び、いよいよ「プログラムにデータを処理させる」段階に入ります。
