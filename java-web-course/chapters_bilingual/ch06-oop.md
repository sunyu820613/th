# 第 6 章　封装 · 继承 · 多态 · 接口 ／ 第6章　カプセル化・継承・多態性・インターフェース

## 本章目标 ／ 本章の目標
理解面向对象四个核心概念：用 `private + getter/setter` 实现封装；用 `extends` 实现继承；理解方法重写 `@Override` 和多态；理解 `interface` 接口的作用。每个概念都配一个独立可运行的最小例子。

> 🇯🇵 オブジェクト指向の4つの核心概念を理解します。`private + getter/setter` によるカプセル化（封装）の実現、`extends` による継承の実現、`@Override` によるメソッドオーバーライド（重写）と多態性（多態、ポリモーフィズム）の理解、`interface`（インターフェース、接口）の役割の理解です。各概念にはそれぞれ独立して実行できる最小限のサンプルを用意します。

## 一句话理解 ／ 一言で理解する
封装是"把数据藏起来，只留规规矩矩的门（方法）给外面用"；继承是"儿子自动拥有爸爸的东西，还能加点自己的"；多态是"同一句话，不同对象执行起来效果不一样"；接口是"一份行为清单，只规定要做什么，不规定怎么做"。

> 🇯🇵 カプセル化とは「データを隠し、外部にはきちんと管理されたドア（メソッド）だけを使わせる」ことです。継承とは「息子が自動的に父のものを引き継ぎ、さらに自分独自のものも加えられる」ことです。多態性とは「同じ呼び出しでも、オブジェクトによって実行結果が異なる」ことです。インターフェースとは「何をすべきかだけを決め、どうやるかは決めない行動リスト」です。

## 为什么需要它 ／ なぜ必要なのか
第 5 章你已经会用类描述数据了，但如果字段谁都能随便改（比如把学生成绩直接改成 -100），数据的合法性就没有保障；如果每种业务对象都要从零写一遍相似的字段和方法，代码会大量重复；如果调用方需要针对每一种具体类型分别写处理逻辑，代码会越来越难维护。封装保护数据安全，继承减少重复代码，多态和接口让代码"面向能力编程"而不是"面向具体类型编程"——这是后面理解 Spring 里"面向接口注入"的重要基础。

> 🇯🇵 第5章ですでにクラスでデータを表現できるようになりましたが、もしフィールドを誰でも自由に変更できてしまうと（例えば学生の成績を直接 -100 に変更されてしまうと）、データの正当性が保証されません。もし業務オブジェクトごとに似たフィールドやメソッドをゼロから毎回書くとしたら、コードの重複が大量に発生します。もし呼び出し側が具体的な型ごとに個別の処理ロジックを書かなければならないなら、コードはどんどんメンテナンスしにくくなります。カプセル化はデータの安全性を保護し、継承は重複コードを減らし、多態性とインターフェースはコードを「具体的な型に向けたプログラミング」ではなく「能力に向けたプログラミング」にしてくれます——これは後でSpringの「インターフェースに対する注入」を理解する上での重要な基礎になります。

## 核心概念 ／ コアコンセプト

### 6.1 封装（Encapsulation）：private + getter/setter ／ カプセル化（Encapsulation）：private + getter/setter

把字段声明为 `private`，意味着**这个字段只能在类自己内部直接访问，外部想读或改，必须通过这个类主动提供的方法**——这些方法通常叫 `getXxx()`（读，叫 getter）和 `setXxx()`（改，叫 setter）。这样类就可以在 setter 里加上合法性校验，杜绝外部塞入不合法的数据。

> 🇯🇵 フィールドを `private` と宣言することは、**このフィールドがクラス自身の内部でしか直接アクセスできず、外部から読み書きしたい場合は、このクラスが主体的に提供するメソッドを経由しなければならない**ことを意味します——これらのメソッドは通常 `getXxx()`（読み取り用、getterと呼ぶ）と `setXxx()`（変更用、setterと呼ぶ）という名前になります。こうすることで、クラスはsetterの中で正当性チェックを追加でき、外部から不正なデータが入り込むのを防げます。

```java
public class Student {
    private String name;
    private int score;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        if (score < 0 || score > 100) {
            System.out.println("成绩必须在 0~100 之间，赋值被拒绝");
            return;
        }
        this.score = score;
    }
}
```

外部代码不能再写 `student.score = -100;`（编译直接报错，因为 `score` 是 `private`），只能写 `student.setScore(-100);`，而这次赋值会被 setter 里的校验拦下。

> 🇯🇵 外部のコードはもう `student.score = -100;` と書くことはできません（`score` は `private` なのでコンパイル時に直接エラーになります）。書けるのは `student.setScore(-100);` だけであり、この代入はsetter内のチェックで阻止されます。

### 6.2 继承（Inheritance）：extends ／ 継承（Inheritance）：extends

当多个类之间存在"是一种"的关系（比如"学生是一种人"、"老师也是一种人"），可以把公共的字段和方法提取到一个更通用的**父类（超类/基类）**里，其它类用 `extends` 继承它，自动拥有父类的字段和方法，同时还能新增自己独有的部分。

> 🇯🇵 複数のクラス間に「〜の一種である」という関係がある場合（例えば「学生は人間の一種である」「教師も人間の一種である」）、共通のフィールドとメソッドをより汎用的な**親クラス（スーパークラス／基底クラス）**にまとめることができます。他のクラスは `extends` でそれを継承し、親クラスのフィールドとメソッドを自動的に持ちつつ、自分独自の部分を追加できます。

```java
public class Person {
    protected String name;
    protected int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void introduce() {
        System.out.println("我叫" + name + "，今年" + age + "岁");
    }
}

public class Student extends Person {
    private double score;

    public Student(String name, int age, double score) {
        super(name, age); // 调用父类的构造方法，初始化 name 和 age
        this.score = score;
    }
}
```

- `Student extends Person` 表示 `Student` 是 `Person` 的**子类**，自动拥有 `Person` 的 `name`、`age` 字段和 `introduce()` 方法。<br><span class="ja-inline">🇯🇵 `Student extends Person` は `Student` が `Person` の**子クラス**であることを表し、`Person` の `name`、`age` フィールドと `introduce()` メソッドを自動的に持ちます。</span>
- `super(name, age);` 是调用父类构造方法的固定写法，**必须写在子类构造方法的第一行**，用来初始化继承自父类的那部分字段。<br><span class="ja-inline">🇯🇵 `super(name, age);` は親クラスのコンストラクタを呼び出す決まった書き方で、**必ず子クラスのコンストラクタの1行目に書く必要があります**。親クラスから継承したフィールド部分を初期化するために使います。</span>
- 这里字段用了 `protected` 而不是 `private`——`protected` 表示"子类可以直接访问，但类外部不行"，这是本章 6.4 会讲到的修饰符之一。<br><span class="ja-inline">🇯🇵 ここではフィールドに `private` ではなく `protected` を使っています——`protected` は「子クラスは直接アクセスできるが、クラスの外部からはできない」ことを表します。これは本章6.4で説明する修飾子の1つです。</span>

### 6.3 方法重写（Override）与多态（Polymorphism） ／ メソッドオーバーライド（Override、重写）と多態性（Polymorphism、多態）

子类可以**重新实现**从父类继承来的方法，让它表现出不同的行为，这叫**方法重写**，写的时候在方法上加 `@Override` 注解（不是必须写，但强烈建议写，编译器会帮你检查是不是真的重写对了，比如方法签名拼错时能第一时间报错）：

> 🇯🇵 子クラスは親クラスから継承したメソッドを**再実装**して、異なる振る舞いをさせることができます。これを**メソッドオーバーライド**と呼びます。書く際にはメソッドに `@Override` 注釈（アノテーション、annotation：コードに付加情報を与える印）を付けます（必須ではありませんが強く推奨されます。コンパイラが本当に正しくオーバーライドできているかをチェックしてくれるため、メソッドシグネチャを書き間違えた場合などにすぐエラーとして検出できます）。

```java
public class Student extends Person {
    // ... 字段和构造方法同上

    @Override
    public void introduce() {
        System.out.println("我叫" + name + "，今年" + age + "岁，是一名学生");
    }
}
```

**多态**指的是：用父类类型的变量指向一个子类对象，调用方法时，实际执行的是这个对象**真正的类型**所重写的那个版本，而不是变量声明时写的那个类型的版本。

> 🇯🇵 **多態性**とは、親クラスの型の変数で子クラスのオブジェクトを指し、メソッドを呼び出したときに、実際に実行されるのはそのオブジェクトの**真の型**がオーバーライドしたバージョンであり、変数を宣言したときの型のバージョンではない、というものです。

```java
Person p = new Student("小明", 18, 88.5); // 变量声明为 Person，但实际指向 Student 对象
p.introduce(); // 实际执行 Student 重写后的版本，而不是 Person 原始的版本
```

方法重载（Overload，第 4 章学过）和方法重写（Override，本章）名字很像，本质完全不同，第 7 章末的"阶段复习"会专门列表对比二者的区别。

> 🇯🇵 メソッドオーバーロード（Overload、多重定義、第4章で学習）とメソッドオーバーライド（Override、本章）は名前がよく似ていますが、本質は全く異なります。第7章末の「ステージ復習」で両者の違いを専用の表で対比します。

### 6.4 接口（Interface） ／ インターフェース（Interface）

接口用 `interface` 关键字定义，**只规定"必须有哪些方法"（方法签名），不提供具体实现**。一个类用 `implements` 实现某个接口，就必须把接口里的方法逐一具体实现，否则编译不通过。

> 🇯🇵 インターフェースは `interface` キーワードで定義され、**「どんなメソッドを持たなければならないか」（メソッドシグネチャ）だけを規定し、具体的な実装は提供しません**。クラスが `implements` であるインターフェースを実装する場合、インターフェース内のメソッドを1つずつ具体的に実装しなければならず、そうしなければコンパイルが通りません。

```java
public interface Greetable {
    void greet(); // 接口里的方法默认是 public abstract，不用也不能写方法体
}

public class Student extends Person implements Greetable {
    // ...

    @Override
    public void greet() {
        System.out.println(name + "：老师好！");
    }
}
```

接口的意义在于：调用方只需要认"有没有实现这个接口"，完全不用关心具体是哪个类、内部怎么实现的。比如一个方法参数写成 `Greetable g`，那么任何实现了 `Greetable` 接口的对象都可以传进来，方法内部统一调用 `g.greet();`，具体执行哪个类的 `greet()` 逻辑，由传进来的实际对象决定——这也是一种多态。这个思想在后面 Spring 里"面向接口编程"（比如 `UserService` 接口 + `UserServiceImpl` 实现类）会反复用到，这里先建立最初步的印象即可，后面第 15 章开始会结合 Spring 详细展开。

> 🇯🇵 インターフェースの意義は次の点にあります。呼び出し側は「このインターフェースを実装しているかどうか」だけを認識すればよく、具体的にどのクラスか、内部でどう実装されているかを気にする必要が全くありません。例えば、あるメソッドの引数を `Greetable g` とすれば、`Greetable` インターフェースを実装したどんなオブジェクトでも渡すことができ、メソッド内部では一律に `g.greet();` を呼び出すだけで、実際にどのクラスの `greet()` ロジックが実行されるかは渡された実際のオブジェクトによって決まります——これも多態性の一種の現れです。この考え方は後でSpringの「インターフェース指向プログラミング」（例えば `UserService` インターフェース + `UserServiceImpl` 実装クラス）で繰り返し使われます。ここではまず最初の印象を持てば十分で、第15章からSpringと組み合わせて詳しく展開します。

## 图解 ／ 図解

```
封装：
外部代码 ──✗ 直接改字段──▶ [ private score ]
外部代码 ──✓ 调用方法────▶ setScore(int) ──校验──▶ [ private score ]

继承与重写：
        Person（父类）
     ┌──────────────────┐
     │ name, age         │
     │ introduce()       │
     └──────────────────┘
              ▲ extends
     ┌──────────────────┐
     │ Student（子类）    │
     │ score（新增字段）   │
     │ introduce()（重写）│  implements Greetable
     │ greet()（接口实现） │
     └──────────────────┘

多态：
Person p = new Student(...);
p.introduce();
      │
      └── 变量类型是 Person，但实际对象是 Student
          调用时执行 Student 重写后的 introduce()
```

## 最小示例 ／ 最小限のサンプル

### 示例一：封装（独立可运行） ／ 例1：カプセル化（独立して実行可能）

`EncapsulationDemo.java`
```java
public class EncapsulationDemo {
    public static void main(String[] args) {
        Student student = new Student();
        student.setName("小明");
        student.setScore(150); // 非法值，会被 setter 拦截
        student.setScore(88);  // 合法值

        System.out.println(student.getName() + " 的成绩是 " + student.getScore());
    }
}

class Student {
    private String name;
    private int score;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        if (score < 0 || score > 100) {
            System.out.println("成绩必须在 0~100 之间，赋值被拒绝：" + score);
            return;
        }
        this.score = score;
    }
}
```

### 示例二：继承 + 重写 + 多态（独立可运行） ／ 例2：継承 + オーバーライド + 多態性（独立して実行可能）

`PolymorphismDemo.java`
```java
public class PolymorphismDemo {
    public static void main(String[] args) {
        Person p1 = new Person("老王", 40);
        Person p2 = new Student("小明", 18, 88.5); // 多态：父类型变量指向子类对象

        p1.introduce();
        p2.introduce(); // 实际执行 Student 重写后的版本
    }
}

class Person {
    protected String name;
    protected int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public void introduce() {
        System.out.println("我叫" + name + "，今年" + age + "岁");
    }
}

class Student extends Person {
    private double score;

    public Student(String name, int age, double score) {
        super(name, age);
        this.score = score;
    }

    @Override
    public void introduce() {
        System.out.println("我叫" + name + "，今年" + age + "岁，是一名学生，成绩" + score);
    }
}
```

### 示例三：接口（独立可运行） ／ 例3：インターフェース（独立して実行可能）

`InterfaceDemo.java`
```java
public class InterfaceDemo {
    public static void main(String[] args) {
        Greetable student = new StudentGreeter("小明");
        Greetable teacher = new TeacherGreeter("王老师");

        sayHello(student);
        sayHello(teacher);
    }

    // 参数是接口类型，任何实现了 Greetable 的对象都能传进来
    public static void sayHello(Greetable g) {
        g.greet();
    }
}

interface Greetable {
    void greet();
}

class StudentGreeter implements Greetable {
    private String name;

    public StudentGreeter(String name) {
        this.name = name;
    }

    @Override
    public void greet() {
        System.out.println(name + "：老师好！");
    }
}

class TeacherGreeter implements Greetable {
    private String name;

    public TeacherGreeter(String name) {
        this.name = name;
    }

    @Override
    public void greet() {
        System.out.println(name + "：同学们好！");
    }
}
```

说明：为了让每个示例能独立成一个文件直接运行，这里把多个类写在同一个 `.java` 文件里（只有一个类能是 `public`，其余不加修饰符即可，这在教学示例里很常见；实际项目中通常一个文件只放一个类）。

> 🇯🇵 補足：各サンプルを独立した1つのファイルとしてそのまま実行できるようにするため、ここでは複数のクラスを同じ `.java` ファイルにまとめて書いています（`public` にできるクラスは1つだけで、残りは修飾子を付けなければよく、これは教材のサンプルではよくあることです。実際のプロジェクトでは通常1つのファイルに1つのクラスだけを置きます）。

## 代码逐行解释 ／ コードの行ごとの解説

**示例一（封装）**
> 🇯🇵 **例1（カプセル化）**

- `private String name; private int score;`：字段设为私有，外部无法直接访问。<br><span class="ja-inline">🇯🇵 `private String name; private int score;`：フィールドをプライベートに設定し、外部から直接アクセスできないようにします。</span>
- `setScore(int score)` 内部先校验范围，不合法就打印提示并 `return;` 提前结束方法，不执行赋值。<br><span class="ja-inline">🇯🇵 `setScore(int score)` は内部でまず範囲をチェックし、不正な場合はメッセージを出力して `return;` でメソッドを早期終了し、代入を実行しません。</span>
- `student.setScore(150);`：调用会被校验拦截，字段值不会被改成 150。<br><span class="ja-inline">🇯🇵 `student.setScore(150);`：この呼び出しはチェックに阻止され、フィールドの値は150に変更されません。</span>
- `student.setScore(88);`：合法值，正常赋值。<br><span class="ja-inline">🇯🇵 `student.setScore(88);`：正当な値なので、正常に代入されます。</span>

**示例二（继承与多态）**
> 🇯🇵 **例2（継承と多態性）**

- `class Student extends Person`：`Student` 继承 `Person`，自动拥有 `name`、`age` 字段和 `introduce()` 方法。<br><span class="ja-inline">🇯🇵 `class Student extends Person`：`Student` は `Person` を継承し、`name`、`age` フィールドと `introduce()` メソッドを自動的に持ちます。</span>
- `super(name, age);`：子类构造方法第一行调用父类构造方法，初始化继承来的字段。<br><span class="ja-inline">🇯🇵 `super(name, age);`：子クラスのコンストラクタの1行目で親クラスのコンストラクタを呼び出し、継承したフィールドを初期化します。</span>
- `@Override public void introduce()`：子类重新实现 `introduce()`，方法签名（方法名+参数列表）必须和父类完全一致，`@Override` 让编译器帮忙检查这一点。<br><span class="ja-inline">🇯🇵 `@Override public void introduce()`：子クラスが `introduce()` を再実装します。メソッドシグネチャ（メソッド名＋引数リスト）は親クラスと完全に一致させる必要があり、`@Override` はこの点をコンパイラにチェックさせます。</span>
- `Person p2 = new Student(...);`：变量声明类型是 `Person`，但 `new` 出来的实际对象是 `Student`——这在 Java 里是合法的，因为 `Student` "是一种" `Person`。<br><span class="ja-inline">🇯🇵 `Person p2 = new Student(...);`：変数の宣言型は `Person` ですが、`new` で作られる実際のオブジェクトは `Student` です——これはJavaでは正当です。`Student` は `Person` の「一種」だからです。</span>
- `p2.introduce();`：Java 在**运行时**才决定调用哪个版本的 `introduce()`——它看的是 `p2` 实际指向的对象类型（`Student`），而不是变量声明的类型（`Person`），所以打印的是 `Student` 重写后的内容。这就是多态。<br><span class="ja-inline">🇯🇵 `p2.introduce();`：Javaは**実行時**になって初めてどのバージョンの `introduce()` を呼び出すか決定します——それは `p2` が実際に指し示すオブジェクトの型（`Student`）を見るのであり、変数の宣言型（`Person`）ではありません。そのため出力されるのは `Student` がオーバーライドした内容です。これが多態性です。</span>

**示例三（接口）**
> 🇯🇵 **例3（インターフェース）**

- `interface Greetable { void greet(); }`：只声明方法签名，没有方法体。<br><span class="ja-inline">🇯🇵 `interface Greetable { void greet(); }`：メソッドシグネチャだけを宣言し、メソッド本体はありません。</span>
- `class StudentGreeter implements Greetable`：实现接口，必须把 `greet()` 具体实现出来，否则编译报错。<br><span class="ja-inline">🇯🇵 `class StudentGreeter implements Greetable`：インターフェースを実装し、`greet()` を具体的に実装しなければならず、そうしないとコンパイルエラーになります。</span>
- `sayHello(Greetable g)`：方法参数是接口类型，调用时传入 `StudentGreeter` 或 `TeacherGreeter` 的实例都合法，方法体内 `g.greet();` 会根据传入的实际对象执行对应的实现——这也是多态的一种体现。<br><span class="ja-inline">🇯🇵 `sayHello(Greetable g)`：メソッドの引数はインターフェース型であり、呼び出す際に `StudentGreeter` や `TeacherGreeter` のインスタンスを渡してもどちらも正当です。メソッド本体の `g.greet();` は渡された実際のオブジェクトに応じて対応する実装を実行します——これも多態性の現れの1つです。</span>

## 程序运行过程 ／ プログラムの実行の流れ

以示例二为例：

> 🇯🇵 例2を例にします。

1. JVM 执行 `new Person("老王", 40)`，创建一个 `Person` 对象并赋给 `p1`。<br><span class="ja-inline">🇯🇵 JVMが `new Person("老王", 40)` を実行し、`Person` オブジェクトを1つ作成して `p1` に代入します。</span>
2. 执行 `new Student("小明", 18, 88.5)`：先执行 `Student` 构造方法第一行 `super(name, age)`，跳转执行 `Person` 的构造方法完成 `name`、`age` 赋值，再返回 `Student` 构造方法继续执行 `this.score = score;`。创建好的对象赋给声明类型为 `Person` 的变量 `p2`。<br><span class="ja-inline">🇯🇵 `new Student("小明", 18, 88.5)` を実行します。まず `Student` コンストラクタの1行目 `super(name, age)` を実行し、`Person` のコンストラクタにジャンプして `name`、`age` の代入を完了させ、`Student` のコンストラクタに戻って `this.score = score;` を続けて実行します。作成されたオブジェクトは宣言型が `Person` の変数 `p2` に代入されます。</span>
3. 执行 `p1.introduce();`：`p1` 实际指向一个纯 `Person` 对象，没有被重写过，执行 `Person` 自己的 `introduce()`。<br><span class="ja-inline">🇯🇵 `p1.introduce();` を実行します。`p1` は実際には純粋な `Person` オブジェクトを指しており、オーバーライドされていないため、`Person` 自身の `introduce()` が実行されます。</span>
4. 执行 `p2.introduce();`：JVM 检查 `p2` 实际指向的对象类型是 `Student`，`Student` 重写过 `introduce()`，所以执行的是 `Student` 版本的实现，即使 `p2` 声明类型是 `Person`。<br><span class="ja-inline">🇯🇵 `p2.introduce();` を実行します。JVMは `p2` が実際に指すオブジェクトの型が `Student` であることを確認し、`Student` は `introduce()` をオーバーライドしているため、`p2` の宣言型が `Person` であっても実行されるのは `Student` バージョンの実装です。</span>

输出：
> 🇯🇵 出力：
```
我叫老王，今年40岁
我叫小明，今年18岁，是一名学生，成绩88.5
```

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| `student.score = 100;` 编译报错 | `score` 是 `private`，类外部不能直接访问字段<br><span class="ja-inline">🇯🇵 `score` は `private` であり、クラスの外部からフィールドに直接アクセスできない </span>| 通过 `setScore(100)` 这样的公开方法间接修改<br><span class="ja-inline">🇯🇵 `setScore(100)` のような公開メソッドを通じて間接的に変更する </span>|
| 子类构造方法报错，提示找不到父类的无参构造<br><span class="ja-inline">🇯🇵 子クラスのコンストラクタでエラーが出て、親クラスの引数なしコンストラクタが見つからないと表示される </span>| 子类构造方法里没写 `super(...)` 时，Java 会自动帮你在第一行插入一个无参的 `super()`；但如果父类没有无参构造（比如父类只写了带参构造），就会找不到而报错<br><span class="ja-inline">🇯🇵 子クラスのコンストラクタで `super(...)` を書かない場合、Javaは自動的に1行目に引数なしの `super()` を挿入する。しかし親クラスに引数なしコンストラクタがない場合（例えば引数ありコンストラクタしか書いていない場合）、見つからずエラーになる </span>| 显式写出 `super(参数...)`，调用父类那个真正存在的构造方法，且必须放在子类构造方法第一行<br><span class="ja-inline">🇯🇵 `super(引数...)` を明示的に書いて、親クラスに実際に存在するコンストラクタを呼び出す。必ず子クラスのコンストラクタの1行目に置く </span>|
| 写了 `@Override` 却编译报错"方法未覆盖或未实现父类型的方法"<br><span class="ja-inline">🇯🇵 `@Override` を書いたのにコンパイルエラー「メソッドが親の型のメソッドをオーバーライドまたは実装していません」が出る </span>| 重写时方法名、参数列表和父类不完全一致（比如参数类型写错、方法名多打一个字母）<br><span class="ja-inline">🇯🇵 オーバーライド時にメソッド名・引数リストが親クラスと完全に一致していない（例えば引数の型を間違えた、メソッド名の文字を1つ多く打った） </span>| `@Override` 的价值正在于此：它会强制编译器检查，出现这种报错说明"重写"根本没生效，仔细核对方法签名<br><span class="ja-inline">🇯🇵 `@Override` の価値はまさにここにあります。コンパイラに強制的にチェックさせるものであり、このエラーが出るのは「オーバーライド」がそもそも成立していないことを意味します。メソッドシグネチャを注意深く確認する </span>|
| 接口里的方法忘记实现<br><span class="ja-inline">🇯🇵 インターフェース内のメソッドの実装を忘れる </span>| 类实现了接口但没有把接口里声明的方法全部具体实现<br><span class="ja-inline">🇯🇵 クラスがインターフェースを実装したが、インターフェース内で宣言されたメソッドをすべて具体的に実装していない </span>| 编译器会直接报错并指出缺哪个方法，按提示补全实现<br><span class="ja-inline">🇯🇵 コンパイラが直接エラーを出し、どのメソッドが不足しているか指摘してくれるので、指示に従って実装を補う </span>|
| 混淆"重载"和"重写"<br><span class="ja-inline">🇯🇵 「オーバーロード」と「オーバーライド」を混同する </span>| 以为改改参数类型也叫"重写"<br><span class="ja-inline">🇯🇵 引数の型を変えるだけでも「オーバーライド」だと思ってしまう </span>| 重载发生在**同一个类**里，靠参数列表区分；重写发生在**父子类之间**，方法签名必须完全相同，靠 `@Override` 标记，第 7 章后的阶段复习会有专门对照表<br><span class="ja-inline">🇯🇵 オーバーロードは**同じクラス内**で発生し、引数リストで区別する。オーバーライドは**親子クラス間**で発生し、メソッドシグネチャは完全に同じでなければならず、`@Override` で印を付ける。第7章後のステージ復習で専用の対照表がある </span>|

## 动手练习 ／ 演習

1. 给 `Student` 类的 `score` 字段配上封装（`private` + getter/setter），setter 里加上"成绩不能为负数"的校验。<br><span class="ja-inline">🇯🇵 `Student` クラスの `score` フィールドにカプセル化（`private` + getter/setter）を施し、setterに「成績は負数にできない」というチェックを追加してみましょう。</span>
2. 再写一个 `Teacher` 类继承 `Person`，重写 `introduce()`，然后用一个 `Person[]` 数组同时存 `Student` 和 `Teacher` 对象，循环调用 `introduce()`，观察多态效果。<br><span class="ja-inline">🇯🇵 さらに `Person` を継承する `Teacher` クラスを書いて `introduce()` をオーバーライドし、`Person[]` 配列に `Student` と `Teacher` の両方のオブジェクトを格納して、ループで `introduce()` を呼び出し、多態性の効果を観察してみましょう。</span>
3. 定义一个接口 `Payable`，包含方法 `double calculatePay()`，分别用 `FullTimeEmployee` 和 `PartTimeEmployee` 两个类实现（各自的计算方式不同），写一个方法统一接收 `Payable` 类型参数并打印计算结果。<br><span class="ja-inline">🇯🇵 `double calculatePay()` メソッドを含むインターフェース `Payable` を定義し、`FullTimeEmployee` と `PartTimeEmployee` の2つのクラスでそれぞれ実装してみましょう（計算方法はそれぞれ異なる）。そして `Payable` 型の引数を統一的に受け取り、計算結果を出力するメソッドを1つ書いてみましょう。</span>

## 小测验 ／ 小テスト

1. `private` 字段配合 `getter/setter` 的好处是什么？<br><span class="ja-inline">🇯🇵 `private` フィールドと `getter/setter` を組み合わせることのメリットは何ですか？</span>
2. 子类构造方法里的 `super(...)` 必须写在第一行吗？如果不写会发生什么？<br><span class="ja-inline">🇯🇵 子クラスのコンストラクタの `super(...)` は必ず1行目に書かなければなりませんか？書かない場合はどうなりますか？</span>
3. 下面这段代码的输出是什么？为什么？<br><span class="ja-inline">🇯🇵 次のコードの出力は何ですか？その理由も答えてください。</span>
   ```java
   Person p = new Student("小红", 20, 95.0);
   p.introduce();
   ```
   （假设 `Student` 重写了 `introduce()`）<br><span class="ja-inline">🇯🇵 （`Student` が `introduce()` をオーバーライドしていると仮定します）</span>

4. 接口里的方法能有方法体吗？类实现接口后必须做什么？<br><span class="ja-inline">🇯🇵 インターフェース内のメソッドはメソッド本体を持てますか？クラスがインターフェースを実装した後、何をしなければなりませんか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 可以在 setter 里对赋值做合法性校验，防止外部塞入不合法的数据；同时把内部实现细节隐藏起来，外部只能通过约定好的方法交互，即使以后内部实现变了，只要方法签名不变，外部代码不用跟着改。<br><span class="ja-inline">🇯🇵 setter内で代入時の正当性チェックができ、外部から不正なデータが入り込むのを防げます。同時に内部の実装の詳細を隠蔽し、外部は決められたメソッドを通じてのみやり取りできるため、後で内部実装が変わっても、メソッドシグネチャさえ変わらなければ外部のコードを変更する必要はありません。</span>
2. 不是必须手写，如果不写，Java 会自动在第一行插入一个无参的 `super()`；但如果父类没有无参构造方法，这时就会编译报错，必须显式写出调用父类真正存在的那个构造方法，并且必须放在子类构造方法的第一行（这一点是强制的，只是"不写"时由编译器自动补一个默认调用，而不是"可以写在其它位置"）。<br><span class="ja-inline">🇯🇵 必ず手で書かなければならないわけではありません。書かない場合、Javaは自動的に1行目に引数なしの `super()` を挿入します。しかし親クラスに引数なしコンストラクタがない場合はコンパイルエラーとなり、親クラスに実際に存在するコンストラクタを明示的に呼び出す必要があり、必ず子クラスのコンストラクタの1行目に置かなければなりません（この点は強制であり、「書かない」場合にコンパイラが自動的にデフォルトの呼び出しを補うだけで、「他の場所に書いてよい」わけではありません）。</span>
3. 输出的是 `Student` 重写后 `introduce()` 里的内容，而不是 `Person` 原始的内容。因为 Java 在运行时是根据变量**实际指向的对象类型**（这里是 `Student`）决定调用哪个版本的方法，这就是多态。<br><span class="ja-inline">🇯🇵 出力されるのは `Student` がオーバーライドした `introduce()` の内容であり、`Person` のオリジナルの内容ではありません。Javaは実行時に変数が**実際に指すオブジェクトの型**（ここでは `Student`）に基づいてどのバージョンのメソッドを呼び出すか決めるためで、これが多態性です。</span>
4. 接口里的方法默认没有方法体（只是方法签名），类实现接口后必须把接口里声明的所有方法都具体实现出来，否则编译不通过。<br><span class="ja-inline">🇯🇵 インターフェース内のメソッドはデフォルトではメソッド本体を持たず（シグネチャのみ）、クラスがインターフェースを実装した後は、インターフェース内で宣言されたすべてのメソッドを具体的に実装しなければならず、そうしないとコンパイルが通りません。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经掌握了封装、继承、多态、接口这四个面向对象核心概念，并且看到了它们各自独立可运行的最小例子。下一章将学习 `public/private/protected/static/final` 等修饰符的完整含义，以及泛型如何让代码在编译期就能做类型检查。

> 🇯🇵 これでカプセル化・継承・多態性・インターフェースというオブジェクト指向の4つの核心概念を習得し、それぞれ独立して実行できる最小限のサンプルを見てきました。次の章では `public/private/protected/static/final` など修飾子の完全な意味と、ジェネリクス（泛型、Generics：型をパラメータ化してコンパイル時に型チェックできるようにする仕組み）がどのようにコンパイル時の型チェックを可能にするかを学びます。
