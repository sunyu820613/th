# 第 27 章　JDBC 与 MyBatis 入门 ／ 第27章　JDBCとMyBatis入門

## 本章目标 ／ 本章の目標
理解 JDBC 是什么、原始 JDBC 代码为什么繁琐；学会用 MyBatis 写第一个 `@Mapper` 接口，理解 `@Select` 和 `#{}` 占位符的作用；理解"接口没有实现类，为什么也能被调用"。

> 🇯🇵 JDBCとは何か、素のJDBCコードがなぜ煩雑なのかを理解します。MyBatis（MyBatis、JDBCの上に構築されたSQLマッピングフレームワーク）で最初の `@Mapper` インターフェースを書けるようになり、`@Select` と `#{}` プレースホルダーの役割を理解します。「インターフェースに実装クラスがないのに、なぜ呼び出せるのか」を理解します。

## 一句话理解 ／ 一言で理解する
JDBC 是 Java 官方定义的"怎么访问数据库"的标准接口，但直接用它写代码非常繁琐；MyBatis 就是在 JDBC 之上做了一层封装，让你只需要写 SQL 和方法签名，剩下的样板代码它帮你搞定。

> 🇯🇵 JDBC（Java Database Connectivity、Java公式が定義した「データベースへのアクセス方法」の標準インターフェース）は、直接使ってコードを書くと非常に煩雑です。MyBatisはJDBCの上に一層のラッピングを施したもので、SQLとメソッドシグネチャさえ書けば、残りの定型的なコードは代わりに処理してくれます。

## 为什么需要它 ／ なぜ必要なのか
上一章我们让 Spring Boot 连上了 MySQL，但连上之后呢？总得有一种方式，让 Java 代码真正把 SQL 发出去、把结果取回来，还要转换成 Java 对象方便使用。这一层工作最早由 JDBC 承担，但写法太繁琐，于是有了 MyBatis 这样的框架来简化它。

> 🇯🇵 前章でSpring BootをMySQLに接続しましたが、接続した後はどうするのでしょうか？結局のところ、Javaコードが実際にSQLを送信し、結果を取り戻し、さらに使いやすいJavaオブジェクトに変換する何らかの方法が必要です。この層の作業は最初はJDBCが担っていましたが、書き方があまりに煩雑だったため、それを簡略化するMyBatisのようなフレームワークが登場しました。

## 核心概念 ／ コアコンセプト

### 27.1 JDBC 是什么 ／ 27.1 JDBCとは何か

**JDBC（Java Database Connectivity）** 是 Java 官方定义的一套"访问数据库"的标准接口。不管你用 MySQL、PostgreSQL 还是其它数据库，只要有对应的 JDBC 驱动（上一章提到的 `mysql-connector-j` 就是 MySQL 的 JDBC 驱动），Java 代码都可以用同一套 JDBC API 去操作它们。

> 🇯🇵 **JDBC（Java Database Connectivity）** は、Java公式が定義した「データベースにアクセスする」ための一連の標準インターフェースです。MySQL、PostgreSQL、あるいは他のデータベースを使うとしても、対応するJDBCドライバ（前章で触れた `mysql-connector-j` はMySQL用のJDBCドライバです）さえあれば、Javaコードは同じJDBC APIでそれらを操作できます。

来看一段最原始的 JDBC 代码，作用是"查出 `id = 1` 的用户"：

> 🇯🇵 最も素の状態のJDBCコードを見てみましょう。役割は「`id = 1` のユーザーを検索する」ことです。

```java
String url = "jdbc:mysql://localhost:3306/usercrud_db?useSSL=false&serverTimezone=Asia/Shanghai";
String username = "root";
String password = "your_password";

try (Connection conn = DriverManager.getConnection(url, username, password)) {
    String sql = "select id, name, email, age from user where id = ?";
    try (PreparedStatement stmt = conn.prepareStatement(sql)) {
        stmt.setLong(1, 1L);
        try (ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                Long id = rs.getLong("id");
                String name = rs.getString("name");
                String email = rs.getString("email");
                Integer age = rs.getInt("age");
                System.out.println(id + ", " + name + ", " + email + ", " + age);
            }
        }
    }
} catch (SQLException e) {
    e.printStackTrace();
}
```

感受一下：只是查一条数据，就要手动建立 `Connection`（连接）、拼 SQL 字符串、创建 `PreparedStatement`（预编译语句）、手动 `setLong` 绑定参数、执行查询拿到 `ResultSet`（结果集）、还要写一个 `while (rs.next())` 循环手动把每一列取出来、一个个赋值给 Java 变量……**每查一次表都要重复这一整套样板代码**，稍微多几张表、多几个查询方法，代码量会迅速膨胀，而且大量代码长得几乎一模一样，纯粹是体力劳动。

> 🇯🇵 感じてみてください。データを1件検索するだけなのに、`Connection`（接続）を手動で確立し、SQL文字列を組み立て、`PreparedStatement`（プリコンパイル済みステートメント）を作成し、`setLong` で手動でパラメータをバインドし、クエリを実行して `ResultSet`（結果セット）を取得し、さらに `while (rs.next())` というループを書いて各列を手動で取り出し1つずつJavaの変数に代入しなければなりません……**テーブルを検索するたびにこの一連の定型コードを繰り返す**必要があり、テーブルやクエリメソッドが少し増えただけでコード量は急速に膨れ上がり、しかも大量のコードがほとんど同じ見た目になる、まさに単純作業です。

这就是 MyBatis 出现的原因：**把"建连接、拼 SQL、绑参数、取结果、关资源"这些重复劳动自动化**，你只需要专注在"SQL 怎么写"和"结果映射成哪个 Java 类"上。

> 🇯🇵 これがMyBatisが登場した理由です。**「接続の確立、SQLの組み立て、パラメータのバインド、結果の取得、リソースのクローズ」といった繰り返し作業を自動化**し、あなたは「SQLをどう書くか」と「結果をどのJavaクラスにマッピングするか」だけに集中すればよくなります。

### 27.2 MyBatis 基础：`@Mapper` + `@Select` ／ 27.2 MyBatisの基礎：`@Mapper` + `@Select`

```java
package com.example.usercrud.mapper;

import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {

    @Select("select * from user where id = #{id}")
    User findById(Long id);
}
```

这几行代码做的事情，和上面那一大段原始 JDBC 代码完全等价——但你不需要手写 `Connection`/`PreparedStatement`/`ResultSet` 里的任何一行。

> 🇯🇵 このわずか数行のコードがやっていることは、上記の長い素のJDBCコードと完全に等価です——しかし `Connection`/`PreparedStatement`/`ResultSet` に関するコードは1行も手書きする必要がありません。

### 27.3 逐个注解拆解 ／ 27.3 アノテーションを一つずつ分解する

- **`@Mapper`**：这是 MyBatis 提供的注解，作用是"告诉 Spring：把这个接口注册成一个可以被注入使用的 Bean"。<br><span class="ja-inline">🇯🇵 **`@Mapper`**：これはMyBatisが提供するアノテーションで、「このインターフェースを、注入して使えるBean（Bean、Springコンテナが一元管理するオブジェクト）として登録するようSpringに伝える」役割を持ちます。</span>

  这里有一个初学者一定会疑惑的点：**`UserMapper` 只是一个 `interface`，连实现类都没写，凭什么能被创建成 Bean、被注入进 Service 里使用？**
<br><span class="ja-inline">🇯🇵 ここで初心者が必ず疑問に思う点があります。**`UserMapper` はただの `interface`（インターフェース）で、実装クラスすら書いていないのに、どうしてBeanとして作成され、Service（サービス、業務ロジックを担うクラス）に注入して使えるのか？**</span>

  答案是：**MyBatis 在背后用"动态代理"技术，在程序运行时自动帮你生成了这个接口的实现类**——你从来不需要自己写 `UserMapperImpl`。你可以把它想象成：MyBatis 拿到 `UserMapper` 接口后，"照着接口的样子"在内存里现造了一个类，这个类的每个方法内部，其实就是去执行你在 `@Select` 里写的那句 SQL、再把结果转换成方法声明的返回类型。对使用者（比如 Service 层）来说，感觉就是在正常调用一个接口方法，完全感知不到"背后其实是动态生成的代理对象"这件事。
<br><span class="ja-inline">🇯🇵 答えは、**MyBatisが裏側で「動的プロキシ」技術を使い、プログラム実行時に自動的にこのインターフェースの実装クラスを生成してくれている**からです——あなたが自分で `UserMapperImpl` を書く必要は一切ありません。イメージとしては、MyBatisは `UserMapper` インターフェースを受け取ると、「インターフェースの形をなぞって」メモリ上でその場でクラスを作り出し、そのクラスの各メソッドの内部では、実際には `@Select` に書かれたSQLを実行し、結果をメソッド宣言の戻り値の型に変換しているのです。利用する側（Service層など）から見れば、普通にインターフェースのメソッドを呼び出しているように感じられ、「実は裏側で動的に生成されたプロキシオブジェクトだ」ということはまったく意識しません。</span>

- **`@Select("select * from user where id = #{id}")`**：声明这个方法对应的 SQL 语句是什么。方法名 `findById` 本身对 MyBatis 没有任何魔法作用（不像有些框架靠方法名自动生成 SQL），SQL 完全是你在注解里显式写出来的。<br><span class="ja-inline">🇯🇵 **`@Select("select * from user where id = #{id}")`**：このメソッドに対応するSQL文を宣言します。メソッド名 `findById` 自体はMyBatisにとって何の魔法の効果もありません（メソッド名からSQLを自動生成するフレームワークとは違います）。SQLは完全にアノテーションの中に明示的に書いたものです。</span>

- **`#{id}` 占位符**：对应方法参数 `Long id`。MyBatis 执行时会把它替换成一个 JDBC 的 `?` 预编译占位符，再安全地把参数值绑定进去——效果上等同于上面原始 JDBC 代码里 `stmt.setLong(1, id)` 那一步，只是 MyBatis 帮你自动做了。<br><span class="ja-inline">🇯🇵 **`#{id}` プレースホルダー**：メソッドの引数 `Long id` に対応します。MyBatisは実行時にこれをJDBCの `?` プリコンパイル済みプレースホルダーに置き換え、パラメータの値を安全にバインドします——効果としては上記の素のJDBCコードにおける `stmt.setLong(1, id)` のステップと同じですが、MyBatisが自動的に代わりにやってくれます。</span>

  **为什么不直接用字符串拼接 `"select * from user where id = " + id`？** 因为字符串拼接存在 **SQL 注入**风险：如果 `id` 这个值来自用户输入，恶意用户可以构造出类似 `1 OR 1=1` 这样的内容，拼接后整条 SQL 的逻辑被彻底改变，可能导致查出所有数据甚至更严重的后果。而 `#{}` 占位符走的是预编译机制，参数值永远只会被当作"一个普通的值"处理，不会被解释成 SQL 的一部分，从根本上避免了这个问题。**结论：凡是涉及外部输入的 SQL 参数，一律用 `#{}` 占位符，绝不手动拼接字符串。**
<br><span class="ja-inline">🇯🇵 **なぜ直接文字列連結 `"select * from user where id = " + id` を使わないのか？** 文字列連結には **SQLインジェクション**（SQL Injection、悪意ある入力によってSQLの意味が改ざんされる攻撃）のリスクがあるからです。もし `id` の値がユーザーの入力に由来する場合、悪意あるユーザーは `1 OR 1=1` のような内容を作り出すことができ、連結後にSQL全体のロジックが完全に変わってしまい、全データが検索されたり、さらに深刻な結果を招いたりする可能性があります。一方、`#{}` プレースホルダーはプリコンパイル機構を使い、パラメータの値は常に「単なる普通の値」として扱われ、SQLの一部として解釈されることはなく、この問題を根本的に回避できます。**結論：外部入力が関わるSQLパラメータは、一律 `#{}` プレースホルダーを使い、決して文字列を手動で連結してはいけません。**</span>

**补充**：本教程简单场景统一用注解方式（`@Select`/`@Insert`/`@Update`/`@Delete` 写在接口方法上）。实际项目里如果 SQL 比较复杂（比如多表关联、动态拼接条件），通常会把 SQL 写在单独的 XML 文件里（俗称 "XML Mapper"），原理和注解方式完全一样，只是 SQL 存放的位置从注解变成了 XML 文件。本教程不展开完整的 XML Mapper 示例，遇到复杂场景时你已经理解了底层原理，学习 XML 写法不会有障碍。

> 🇯🇵 **補足**：本チュートリアルではシンプルな場面では一貫してアノテーション方式（`@Select`/`@Insert`/`@Update`/`@Delete` をインターフェースのメソッドに書く）を使います。実際のプロジェクトでSQLが比較的複雑な場合（複数テーブルの結合、動的な条件組み立てなど）、通常はSQLを単独のXMLファイルに書きます（俗に「XML Mapper」と呼ばれます）。原理はアノテーション方式とまったく同じで、SQLの置き場所がアノテーションからXMLファイルに変わるだけです。本チュートリアルでは完全なXML Mapperの例は扱いませんが、複雑な場面に出会ったときにはすでに根底の原理を理解しているので、XMLの書き方を学ぶのに支障はありません。

### 27.4 Maven 依赖（版本锁定） ／ 27.4 Maven依存関係（バージョン固定）

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>4.0.0</version>
</dependency>
```

**版本说明**：`mybatis-spring-boot-starter` 的 **4.0.0** 版本是官方明确兼容 Spring Boot 4.0 及以上、Java 17 及以上的版本，和本教程锁定的 Spring Boot 4.1.1 + Java 21 组合是合适的。**注意范围**：本章是为了单独学习"原生 MyBatis 怎么工作"才引入 `mybatis-spring-boot-starter:4.0.0`；从下一章（第 28 章）切换到 MyBatis-Plus 之后，`mybatis-plus-spring-boot4-starter` 内部已经包含了运行 MyBatis 所需的核心能力，Project 3 和最终项目都**不再单独引入**这个原生 Starter——不是"从这一章到最终项目一直用它"，而是只在这一章学原理时用一下。

> 🇯🇵 **バージョンの説明**：`mybatis-spring-boot-starter` の **4.0.0** バージョンは、公式が明確にSpring Boot 4.0以上、Java 17以上に対応すると表明しているバージョンで、本チュートリアルが固定するSpring Boot 4.1.1 + Java 21の組み合わせに適しています。**適用範囲に注意**：本章では「素のMyBatisがどう動くか」を単独で学ぶために `mybatis-spring-boot-starter:4.0.0` を導入しています。次章（第28章）でMyBatis-Plusに切り替えた後は、`mybatis-plus-spring-boot4-starter` の内部にすでにMyBatisを動かすために必要なコア機能が含まれているため、Project 3や最終プロジェクトでは**この素のStarterを単独で導入することはもうありません**——「この章から最終プロジェクトまでずっと使う」わけではなく、この章で原理を学ぶときだけ使うものです。

## 图解 ／ 図解

```
原始 JDBC 方式：
Java 代码
  → 手动 DriverManager.getConnection()
  → 手动拼 SQL 字符串 + PreparedStatement
  → 手动 setXxx() 绑定每个参数
  → 手动 executeQuery()
  → 手动 while(rs.next()) 逐列取值、逐个赋值
  → 手动关闭 Connection/Statement/ResultSet
（每次查询都要重复这一整套）

MyBatis 方式：
Java 代码
  → 只写一个 interface 方法 + @Select 注解里的 SQL
  → MyBatis 动态代理自动生成实现类
  → 调用方法时，MyBatis 自动完成"建连接→绑参数→执行→取结果→转成 Java 对象→关资源"
```

## 最小示例 ／ 最小限のサンプル

```java
package com.example.usercrud.entity;

public class User {
    private Long id;
    private String name;
    private String email;
    private Integer age;
    // getter/setter 省略
}
```

```java
package com.example.usercrud.mapper;

import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper {

    @Select("select * from user where id = #{id}")
    User findById(Long id);
}
```

在 Service 里像使用普通对象一样注入并调用它：

> 🇯🇵 Service層で、普通のオブジェクトを使うのと同じように注入して呼び出します。

```java
package com.example.usercrud.service;

// ...省略 import

@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public User getUserById(Long id) {
        return userMapper.findById(id);
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `private final UserMapper userMapper;` + 构造器注入：和之前章节讲过的构造器注入完全一样（第 16 章）。Spring 在创建 `UserService` 这个 Bean 时，发现构造器需要一个 `UserMapper` 类型的参数，就会去容器里找——而 `@Mapper` 标注的接口，正是因为被 MyBatis 动态代理生成了实现类并注册成 Bean，才能被这里成功注入。<br><span class="ja-inline">🇯🇵 `private final UserMapper userMapper;` ＋コンストラクタ注入：以前の章（第16章）で説明したコンストラクタ注入とまったく同じです。Springは `UserService` というBeanを作成する際、コンストラクタが `UserMapper` 型の引数を必要としていることを見つけ、コンテナ（IoCコンテナ、ApplicationContext）の中から探します——`@Mapper` が付いたインターフェースは、まさにMyBatisの動的プロキシによって実装クラスが生成されBeanとして登録されているからこそ、ここで正常に注入できるのです。</span>
- `userMapper.findById(id)`：从代码写法上看，这就是普通的接口方法调用；实际执行时，走的是 MyBatis 生成的代理对象，代理对象内部会执行 `@Select` 里的 SQL，并把查询结果（一行数据）自动映射成一个 `User` 对象返回。MyBatis 默认按"列名和 Java 属性名相同（不区分大小写）"的规则自动完成这个映射，比如查询结果的 `email` 列会自动赋值给 `User` 对象的 `email` 属性。<br><span class="ja-inline">🇯🇵 `userMapper.findById(id)`：コードの書き方だけ見れば、これは普通のインターフェースメソッド呼び出しです。実際に実行される際は、MyBatisが生成したプロキシオブジェクトが処理を行い、プロキシオブジェクトの内部で `@Select` に書かれたSQLが実行され、クエリ結果（1行のデータ）が自動的に `User` オブジェクトにマッピングされて返されます。MyBatisはデフォルトで「列名とJavaのプロパティ名が同じ（大文字小文字は区別しない）」というルールに従って自動的にこのマッピングを行います。例えばクエリ結果の `email` 列は自動的に `User` オブジェクトの `email` プロパティに代入されます。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. Service 方法调用 `userMapper.findById(id)`。<br><span class="ja-inline">🇯🇵 Serviceのメソッドが `userMapper.findById(id)` を呼び出します。</span>
2. 因为 `userMapper` 实际指向的是 MyBatis 动态生成的代理对象，代理对象接管这次调用。<br><span class="ja-inline">🇯🇵 `userMapper` が実際に指しているのはMyBatisが動的に生成したプロキシオブジェクトなので、プロキシオブジェクトがこの呼び出しを引き受けます。</span>
3. MyBatis 从上一章配置好的数据源（连接池）里取出一条数据库连接。<br><span class="ja-inline">🇯🇵 MyBatisは前章で設定済みのデータソース（コネクションプール）から1本のデータベース接続を取り出します。</span>
4. MyBatis 把 `@Select` 注解里的 SQL 和 `#{id}` 占位符转换成 JDBC 的 `PreparedStatement`，并把参数 `id` 安全绑定进去。<br><span class="ja-inline">🇯🇵 MyBatisは `@Select` アノテーションのSQLと `#{id}` プレースホルダーをJDBCの `PreparedStatement` に変換し、パラメータ `id` を安全にバインドします。</span>
5. 执行查询，MySQL 返回结果集。<br><span class="ja-inline">🇯🇵 クエリを実行し、MySQLが結果セットを返します。</span>
6. MyBatis 遍历结果集，按列名自动映射，把这一行数据封装成一个 `User` 对象。<br><span class="ja-inline">🇯🇵 MyBatisは結果セットを走査し、列名に従って自動的にマッピングし、この1行のデータを `User` オブジェクトにまとめます。</span>
7. MyBatis 把连接归还给连接池，把 `User` 对象作为方法返回值交还给 Service。<br><span class="ja-inline">🇯🇵 MyBatisは接続をコネクションプールに返却し、`User` オブジェクトをメソッドの戻り値としてServiceに渡します。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| `Invalid bound statement (not found)` | `UserMapper` 接口没有被 MyBatis 扫描到，或方法和 SQL 没对应上<br><span class="ja-inline">🇯🇵 `UserMapper` インターフェースがMyBatisにスキャンされていない、またはメソッドとSQLが対応していない </span>| 确认接口上有 `@Mapper` 注解，且方法名、参数没写错<br><span class="ja-inline">🇯🇵 インターフェースに `@Mapper` アノテーションが付いているか、メソッド名や引数が間違っていないか確認する </span>|
| 用 `+` 拼接 SQL 字符串，被认为存在安全隐患<br><span class="ja-inline">🇯🇵 `+` でSQL文字列を連結し、セキュリティ上のリスクがあると指摘された </span>| 没用 `#{}` 占位符，而是手动拼接参数值<br><span class="ja-inline">🇯🇵 `#{}` プレースホルダーを使わず、手動でパラメータの値を連結した </span>| 涉及外部输入的参数一律改用 `#{}` 占位符<br><span class="ja-inline">🇯🇵 外部入力が関わるパラメータは一律 `#{}` プレースホルダーに変更する </span>|
| 查询结果对象里某个字段一直是 `null`<br><span class="ja-inline">🇯🇵 クエリ結果のオブジェクトの中で、あるフィールドがずっと `null` になっている </span>| 数据库列名和 Java 属性名对不上（比如列名 `user_name`，属性名 `userName`）<br><span class="ja-inline">🇯🇵 データベースの列名とJavaのプロパティ名が一致していない（例：列名 `user_name`、プロパティ名 `userName`） </span>| 确认命名一致，或使用 `@Results`/XML `resultMap` 做映射（本教程暂不展开）<br><span class="ja-inline">🇯🇵 命名を一致させるか、`@Results`／XMLの `resultMap` でマッピングする（本チュートリアルでは詳しく扱わない） </span>|
| 依赖版本冲突或启动报错<br><span class="ja-inline">🇯🇵 依存関係のバージョンが衝突する、または起動時にエラーが出る </span>| 引入了和 Spring Boot 4 不兼容的 MyBatis Starter 版本<br><span class="ja-inline">🇯🇵 Spring Boot 4と互換性のないMyBatis Starterのバージョンを導入した </span>| 严格使用本章锁定的 `mybatis-spring-boot-starter:4.0.0`<br><span class="ja-inline">🇯🇵 本章で固定した `mybatis-spring-boot-starter:4.0.0` を厳守して使う </span>|

## 动手练习 ／ 演習

1. 在 `UserMapper` 里再加一个方法 `List<User> findAll();`，配上 `@Select("select * from user")`，查出所有用户。<br><span class="ja-inline">🇯🇵 `UserMapper` にもう1つメソッド `List<User> findAll();` を追加し、`@Select("select * from user")` を組み合わせて、すべてのユーザーを検索してみましょう。</span>
2. 尝试把 `#{id}` 改写成字符串拼接的写法（仅用于观察，不要在真实项目里这样做），思考如果 `id` 来自用户输入会有什么风险。<br><span class="ja-inline">🇯🇵 `#{id}` を文字列連結の書き方に書き換えてみましょう（観察目的のみで、実際のプロジェクトでは絶対にやらないでください）。もし `id` がユーザー入力に由来する場合、どんなリスクがあるか考えてみましょう。</span>
3. 想一想：为什么 `UserMapper` 明明只是一个 `interface`，你却能像调用普通对象方法一样调用 `userMapper.findById(id)`？试着自己复述一遍"动态代理"的原理。<br><span class="ja-inline">🇯🇵 考えてみましょう。なぜ `UserMapper` はただの `interface` なのに、`userMapper.findById(id)` を普通のオブジェクトのメソッドを呼ぶように呼び出せるのでしょうか？「動的プロキシ」の原理を自分の言葉でもう一度説明してみましょう。</span>

## 小测验 ／ 小テスト

1. 原始 JDBC 代码里，哪几个步骤是 MyBatis 帮你自动化掉的？<br><span class="ja-inline">🇯🇵 素のJDBCコードの中で、どのステップがMyBatisによって自動化されましたか？</span>
2. `@Mapper` 标注的接口没有写实现类，为什么还能正常工作？<br><span class="ja-inline">🇯🇵 `@Mapper` が付いたインターフェースは実装クラスを書いていないのに、なぜ正常に動作するのですか？</span>
3. `#{}` 占位符解决了什么安全问题？<br><span class="ja-inline">🇯🇵 `#{}` プレースホルダーはどんなセキュリティ上の問題を解決しますか？</span>
4. 本教程锁定的 MyBatis Spring Boot Starter 版本号是多少？<br><span class="ja-inline">🇯🇵 本チュートリアルが固定しているMyBatis Spring Boot Starterのバージョン番号はいくつですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 建立连接、拼装 `PreparedStatement`、绑定参数、执行 SQL、遍历 `ResultSet` 取值并转换成 Java 对象、关闭资源，这些都由 MyBatis 自动完成。<br><span class="ja-inline">🇯🇵 接続の確立、`PreparedStatement` の組み立て、パラメータのバインド、SQLの実行、`ResultSet` を走査して値を取り出しJavaオブジェクトに変換すること、リソースのクローズ——これらはすべてMyBatisが自動的に行います。</span>
2. 因为 MyBatis 在运行时用动态代理技术，根据接口定义自动生成了一个实现类，处理"建连接、执行 SQL、封装结果"这些工作，开发者不需要自己写实现类。<br><span class="ja-inline">🇯🇵 MyBatisが実行時に動的プロキシ技術を使い、インターフェースの定義に基づいて自動的に実装クラスを生成し、「接続の確立、SQLの実行、結果のカプセル化」といった作業を処理するため、開発者は自分で実装クラスを書く必要がないからです。</span>
3. 解决 SQL 注入问题。`#{}` 占位符通过预编译机制绑定参数，参数值永远只被当作普通数据处理，不会被解释成 SQL 语法的一部分。<br><span class="ja-inline">🇯🇵 SQLインジェクションの問題を解決します。`#{}` プレースホルダーはプリコンパイル機構を通じてパラメータをバインドし、パラメータの値は常に普通のデータとして扱われ、SQL構文の一部として解釈されることはありません。</span>
4. `org.mybatis.spring.boot:mybatis-spring-boot-starter:4.0.0`。
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了 JDBC 的繁琐之处，学会了用 `@Mapper` + `@Select` + `#{}` 写出第一个 MyBatis 查询方法，并理解了"接口为什么没有实现类也能工作"这个关键原理。下一章学习 MyBatis-Plus——它能让你连最基础的增删改查 SQL 都不用手写。

> 🇯🇵 これでJDBCの煩雑さを理解し、`@Mapper` + `@Select` + `#{}` を使って最初のMyBatisクエリメソッドを書けるようになり、「インターフェースになぜ実装クラスがなくても動作するのか」という重要な原理を理解しました。次の章ではMyBatis-Plusを学びます——最も基本的なCRUD（作成・読み取り・更新・削除）SQLさえも手書きする必要がなくなります。
