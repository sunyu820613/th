# 第 28 章　MyBatis-Plus 入门 ／ 第28章　MyBatis-Plus入門

## 本章目标 ／ 本章の目標
理解 MyBatis-Plus 解决了什么问题；学会用 `BaseMapper<T>` 免去手写基础增删改查 SQL；能给一个 Entity 类加上 `@TableName`/`@TableId` 等基础注解；清楚知道本教程锁定的 MyBatis-Plus 依赖坐标和版本号。

> 🇯🇵 MyBatis-Plus（MyBatisの上に構築された拡張ツール）がどんな問題を解決するのかを理解します。`BaseMapper<T>`（MyBatis-Plusが提供する基底Mapperインターフェース）を使って基本的なCRUD SQLを手書きせずに済ませられるようになります。Entity（エンティティ、テーブルに対応するJavaクラス）クラスに `@TableName`/`@TableId` などの基本アノテーションを付けられるようになります。本チュートリアルが固定するMyBatis-Plusの依存座標とバージョン番号をはっきり把握します。

## 一句话理解 ／ 一言で理解する
MyBatis-Plus 是建立在 MyBatis 之上的增强工具，让你连最简单的"根据 id 查一条""插入一条""改一条""删一条"这种重复性 SQL 都不用再手写。

> 🇯🇵 MyBatis-Plusは MyBatis の上に構築された拡張ツールで、「idで1件検索する」「1件挿入する」「1件更新する」「1件削除する」といった最もシンプルで反復的なSQLでさえ、もう手書きしなくてよくなります。

## 为什么需要它 ／ なぜ必要なのか
上一章我们用 MyBatis 写了 `findById`，需要自己写 `@Select` 里的 SQL。但仔细想想：几乎每张表都需要"按 id 查""查全部""插入一条""按 id 改""按 id 删"这几个最基础的操作，SQL 写法几乎一模一样，只是表名和字段不同。如果每张表、每个项目都要重复写这些"万能模板 SQL"，还是一种不必要的体力劳动。MyBatis-Plus 就是为了解决这个问题而生的：**哪怕是最简单的增删改查，也不需要手写一行 SQL**。

> 🇯🇵 前章ではMyBatisで `findById` を書き、`@Select` の中のSQLを自分で書く必要がありました。しかしよく考えてみると、ほぼすべてのテーブルで「idで検索」「全件検索」「1件挿入」「idで更新」「idで削除」という最も基本的な操作が必要であり、SQLの書き方はほとんど同じで、テーブル名とフィールドが違うだけです。もしテーブルごと、プロジェクトごとにこれらの「万能テンプレートSQL」を繰り返し書かなければならないなら、それは不必要な単純作業です。MyBatis-Plusはまさにこの問題を解決するために生まれました。**最もシンプルなCRUDであっても、SQLを1行も手書きする必要がありません。**

## 核心概念 ／ コアコンセプト

### 28.1 `BaseMapper<T>`：继承即拥有 ／ 28.1 `BaseMapper<T>`：継承すれば手に入る

```java
package com.example.usercrud.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.usercrud.entity.User;

public interface UserMapper extends BaseMapper<User> {
}
```

注意这里连方法体都不用写，甚至连 `@Mapper` 注解在有些配置方式下都可以省略（MyBatis-Plus 提供了 `@MapperScan` 在启动类上统一扫描，本教程为了和上一章保持一致、且更直观，仍然建议显式加上 `@Mapper` 注解）。仅仅是"继承 `BaseMapper<User>`"这一个动作，`UserMapper` 就自动拥有了一批现成的方法，常用的包括：

> 🇯🇵 ここではメソッド本体すら書く必要がなく、設定方法によっては `@Mapper` アノテーションすら省略できることに注目してください（MyBatis-Plusは起動クラスに `@MapperScan` を付けて一括スキャンする方法も提供していますが、本チュートリアルでは前章との一貫性と分かりやすさのため、明示的に `@Mapper` アノテーションを付けることを引き続き推奨します）。単に「`BaseMapper<User>` を継承する」というこの1つの動作だけで、`UserMapper` は自動的に一連の既製のメソッドを手に入れます。よく使うものは以下の通りです。

| 方法 ／ メソッド | 作用 ／ 役割 |
|---|---|
| `selectById(Long id)` | 按主键查一条<br><span class="ja-inline">🇯🇵 主キーで1件検索する </span>|
| `selectList(Wrapper<T> queryWrapper)` | 按条件查多条（不传条件可查全部）<br><span class="ja-inline">🇯🇵 条件付きで複数件検索する（条件を渡さなければ全件検索できる） </span>|
| `insert(T entity)` | 插入一条<br><span class="ja-inline">🇯🇵 1件挿入する </span>|
| `updateById(T entity)` | 按主键更新（只更新非空字段）<br><span class="ja-inline">🇯🇵 主キーで更新する（NULLでないフィールドのみ更新） </span>|
| `deleteById(Long id)` | 按主键删除<br><span class="ja-inline">🇯🇵 主キーで削除する </span>|

这些方法背后对应的 SQL，MyBatis-Plus 会在运行时根据 Entity 类的信息（表名、主键列、字段列表）自动拼装出来，原理上和你自己写 `@Select`/`@Insert`/`@Update`/`@Delete` 得到的效果是一致的，只是这些"万能模板 SQL"不需要你再写一遍。

> 🇯🇵 これらのメソッドの背後にあるSQLは、MyBatis-Plusが実行時にEntityクラスの情報（テーブル名、主キー列、フィールド一覧）に基づいて自動的に組み立てます。原理的には自分で `@Select`/`@Insert`/`@Update`/`@Delete` を書いた場合と同じ効果ですが、これらの「万能テンプレートSQL」をもう一度書く必要がないだけです。

### 28.2 给 Entity 加注解 ／ 28.2 Entityにアノテーションを付ける

MyBatis-Plus 需要知道"这个 Java 类对应数据库的哪张表、哪一列是主键"，这就要靠几个注解：

> 🇯🇵 MyBatis-Plusは「このJavaクラスがデータベースのどのテーブルに対応し、どの列が主キーか」を知る必要があり、それはいくつかのアノテーションによって実現されます。

```java
package com.example.usercrud.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String name;
    private String email;
    private Integer age;

    // getter/setter 省略
}
```

- `@TableName("user")`：声明这个类对应数据库里的 `user` 表。如果类名（去掉大小写差异后）本来就和表名一致，这个注解甚至可以省略，但显式写出来更清晰，本教程统一显式声明。<br><span class="ja-inline">🇯🇵 `@TableName("user")`：このクラスがデータベース内の `user` テーブルに対応することを宣言します。クラス名（大文字小文字の違いを除いて）がもともとテーブル名と一致していれば、このアノテーションは省略することもできますが、明示的に書いた方が分かりやすいため、本チュートリアルでは一貫して明示的に宣言します。</span>
- `@TableId(type = IdType.AUTO)`：声明 `id` 是主键，`IdType.AUTO` 表示主键值由数据库自增生成（对应上一章建表 SQL 里的 `AUTO_INCREMENT`）。<br><span class="ja-inline">🇯🇵 `@TableId(type = IdType.AUTO)`：`id` が主キーであることを宣言し、`IdType.AUTO` は主キーの値がデータベースの自動採番によって生成されることを示します（前章のテーブル作成SQLにおける `AUTO_INCREMENT` に対応）。</span>
- `name`/`email`/`age`：没有额外注解的普通字段，MyBatis-Plus 默认按"属性名和列名相同"的规则自动对应到数据库的同名列。<br><span class="ja-inline">🇯🇵 `name`/`email`/`age`：追加のアノテーションがない普通のフィールドで、MyBatis-Plusはデフォルトで「プロパティ名と列名が同じ」というルールに従い、自動的にデータベースの同名の列に対応させます。</span>

### 28.3 版本坐标——务必看清楚 ／ 28.3 バージョン座標——必ずよく確認すること

**本教程锁定的 Maven 依赖如下**：

> 🇯🇵 **本チュートリアルが固定するMaven依存関係は以下の通りです。**

```xml
<dependency>
    <groupId>com.baomidou</groupId>
    <artifactId>mybatis-plus-spring-boot4-starter</artifactId>
    <version>3.5.17</version>
</dependency>
```

这里有两处必须特别注意：

> 🇯🇵 ここには特に注意すべき点が2つあります。

1. **artifactId 是 `mybatis-plus-spring-boot4-starter`**。这是 **Spring Boot 4 专用坐标**。如果你在网上搜到的教程或旧项目里用的是 `mybatis-plus-boot-starter` 或者 `mybatis-plus-spring-boot3-starter`，那些是给 **Spring Boot 3** 项目用的坐标，**不能直接照抄**到本教程的 Spring Boot 4.1.1 项目里——用错坐标轻则依赖冲突、重则启动直接报错。本教程从这一章开始统一使用 `mybatis-plus-spring-boot4-starter`。<br><span class="ja-inline">🇯🇵 **artifactIdは `mybatis-plus-spring-boot4-starter` です**。これは**Spring Boot 4専用の座標**です。ネットで見つけたチュートリアルや古いプロジェクトで `mybatis-plus-boot-starter` や `mybatis-plus-spring-boot3-starter` が使われていた場合、それらは**Spring Boot 3**プロジェクト用の座標であり、本チュートリアルのSpring Boot 4.1.1プロジェクトに**そのまま流用してはいけません**——座標を間違えると、軽ければ依存関係の衝突、重ければ起動時に直接エラーになります。本チュートリアルではこの章から一貫して `mybatis-plus-spring-boot4-starter` を使用します。</span>
2. **版本号统一写 `3.5.17`**。这是本教程锁定的版本号，从这一章到最终项目（第 37 章）全程使用这一个版本号，不要再纠结"是不是应该用最新版"，直接照抄本教程给出的版本号即可。<br><span class="ja-inline">🇯🇵 **バージョン番号は一律 `3.5.17` と書きます**。これは本チュートリアルが固定するバージョン番号で、この章から最終プロジェクト（第37章）まで一貫してこの1つのバージョン番号を使います。「最新版を使うべきではないか」と悩む必要はなく、本チュートリアルが示すバージョン番号をそのまま使えば十分です。</span>

加了 `mybatis-plus-spring-boot4-starter` 之后，它已经内部包含了 MyBatis 的能力，不需要再额外重复引入上一章的 `mybatis-spring-boot-starter`（两者选其一：只用 MyBatis 原生方式就只引 `mybatis-spring-boot-starter`；用 MyBatis-Plus 就只引 `mybatis-plus-spring-boot4-starter`，本教程 Project 3 及之后统一使用后者）。

> 🇯🇵 `mybatis-plus-spring-boot4-starter` を追加すると、その内部にはすでにMyBatisの機能が含まれているため、前章の `mybatis-spring-boot-starter` を重ねて追加する必要はありません（二者択一：素のMyBatis方式のみを使うなら `mybatis-spring-boot-starter` だけを導入し、MyBatis-Plusを使うなら `mybatis-plus-spring-boot4-starter` だけを導入します。本チュートリアルではProject 3以降は一貫して後者を使用します）。

## 图解 ／ 図解

```
MyBatis（第 27 章）
  └── 你自己写 @Select/@Insert/@Update/@Delete 里的 SQL

MyBatis-Plus（本章，建立在 MyBatis 之上）
  └── UserMapper extends BaseMapper<User>
        └── 自动获得 selectById / selectList / insert / updateById / deleteById
              （SQL 由 MyBatis-Plus 在运行时根据 @TableName/@TableId 自动拼装，你不用写）
```

## 最小示例 ／ 最小限のサンプル

```java
// User.java
package com.example.usercrud.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;

@TableName("user")
public class User {

    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String email;
    private Integer age;

    // getter/setter 省略
}
```

```java
// UserMapper.java
package com.example.usercrud.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.usercrud.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
```

在 Service 里直接使用这些自带方法：

> 🇯🇵 Service層でこれらの標準搭載メソッドを直接使います。

```java
package com.example.usercrud.service;

import com.example.usercrud.entity.User;
import com.example.usercrud.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }

    public User getUserById(Long id) {
        return userMapper.selectById(id);
    }

    public void createUser(User user) {
        userMapper.insert(user);
    }

    public void updateUser(User user) {
        userMapper.updateById(user);
    }

    public void deleteUser(Long id) {
        userMapper.deleteById(id);
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `userMapper.selectById(id)`：等价于第 27 章手写的 `@Select("select * from user where id = #{id}")`，但这里一行 SQL 都没写，`BaseMapper` 已经内置了这个方法。<br><span class="ja-inline">🇯🇵 `userMapper.selectById(id)`：第27章で手書きした `@Select("select * from user where id = #{id}")` と等価ですが、ここではSQLを1行も書いておらず、`BaseMapper` にすでにこのメソッドが組み込まれています。</span>
- `userMapper.insert(user)`：把 `user` 对象里非空的属性，自动拼装成一条 `INSERT INTO user (...) VALUES (...)` 并执行；如果 `id` 用了 `IdType.AUTO`，插入成功后 `user.id` 会被自动回填成数据库生成的自增值。<br><span class="ja-inline">🇯🇵 `userMapper.insert(user)`：`user` オブジェクトの中でNULLでないプロパティを自動的に `INSERT INTO user (...) VALUES (...)` に組み立てて実行します。`id` に `IdType.AUTO` を使っていれば、挿入成功後 `user.id` にはデータベースが生成した自動採番の値が自動的に書き戻されます。</span>
- `userMapper.updateById(user)`：要求 `user.id` 不能为空，MyBatis-Plus 会以 `id` 为条件，把 `user` 对象里其余非空字段更新到对应行。<br><span class="ja-inline">🇯🇵 `userMapper.updateById(user)`：`user.id` がNULLでないことが要求され、MyBatis-Plusは `id` を条件として、`user` オブジェクトのその他のNULLでないフィールドを対応する行に更新します。</span>
- `userMapper.deleteById(id)`：等价于 `DELETE FROM user WHERE id = ?`。<br><span class="ja-inline">🇯🇵 `userMapper.deleteById(id)`：`DELETE FROM user WHERE id = ?` と等価です。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. Service 调用 `userMapper.selectById(id)`。<br><span class="ja-inline">🇯🇵 Serviceが `userMapper.selectById(id)` を呼び出します。</span>
2. 和第 27 章一样，`userMapper` 实际是 MyBatis（被 MyBatis-Plus 增强后）动态生成的代理对象。<br><span class="ja-inline">🇯🇵 第27章と同様、`userMapper` は実際にはMyBatis（MyBatis-Plusによって拡張された後の）が動的に生成したプロキシオブジェクトです。</span>
3. MyBatis-Plus 根据 `User` 类上的 `@TableName("user")` 和 `@TableId` 信息，在运行时自动拼装出等价于 `SELECT * FROM user WHERE id = ?` 的 SQL。<br><span class="ja-inline">🇯🇵 MyBatis-Plusは `User` クラスの `@TableName("user")` と `@TableId` の情報に基づき、実行時に `SELECT * FROM user WHERE id = ?` と等価なSQLを自動的に組み立てます。</span>
4. 后续步骤（取连接、绑参数、执行、取结果、映射成 `User` 对象、归还连接）和第 27 章完全一样，只是这一次连"写 SQL"这一步都被自动化了。<br><span class="ja-inline">🇯🇵 以降のステップ（接続の取得、パラメータのバインド、実行、結果の取得、`User` オブジェクトへのマッピング、接続の返却）は第27章とまったく同じですが、今回は「SQLを書く」というステップまでもが自動化されています。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 启动报错，提示找不到 `mybatis-plus-boot-starter` 相关类，或依赖冲突<br><span class="ja-inline">🇯🇵 起動時にエラーが出て、`mybatis-plus-boot-starter` 関連のクラスが見つからない、または依存関係の衝突が発生する </span>| 照抄了网上 Spring Boot 3 教程的坐标 `mybatis-plus-boot-starter`/`mybatis-plus-spring-boot3-starter`<br><span class="ja-inline">🇯🇵 ネット上のSpring Boot 3チュートリアルの座標 `mybatis-plus-boot-starter`/`mybatis-plus-spring-boot3-starter` をそのまま流用した </span>| 本教程 Spring Boot 4 项目必须使用 `mybatis-plus-spring-boot4-starter`<br><span class="ja-inline">🇯🇵 本チュートリアルのSpring Boot 4プロジェクトでは必ず `mybatis-plus-spring-boot4-starter` を使用する </span>|
| `updateById` 执行后发现某些字段被清空了<br><span class="ja-inline">🇯🇵 `updateById` 実行後、いくつかのフィールドがクリアされていることに気づいた </span>| 误以为 `updateById` 会更新所有字段，但传入的对象里某些字段没赋值（为 `null`）<br><span class="ja-inline">🇯🇵 `updateById` がすべてのフィールドを更新すると誤解していたが、渡したオブジェクトのいくつかのフィールドに値が設定されていなかった（`null` のままだった） </span>| `updateById` 默认只更新非空字段；如果确实想清空某个字段，需要显式赋值再传入<br><span class="ja-inline">🇯🇵 `updateById` はデフォルトでNULLでないフィールドのみ更新する。あるフィールドを本当にクリアしたい場合は、明示的に値を設定してから渡す必要がある </span>|
| `Table 'usercrud_db.users' doesn't exist` | 类名是 `User`，MyBatis-Plus 按默认规则猜测表名为复数或下划线形式，和实际表名 `user` 不一致<br><span class="ja-inline">🇯🇵 クラス名が `User` で、MyBatis-Plusがデフォルトルールでテーブル名を複数形やアンダースコア形式と推測し、実際のテーブル名 `user` と一致しなかった </span>| 显式加 `@TableName("user")`，不要依赖默认猜测规则<br><span class="ja-inline">🇯🇵 明示的に `@TableName("user")` を付け、デフォルトの推測ルールに頼らない </span>|

## 动手练习 ／ 演習

1. 在 `UserService` 里新增一个方法，调用 `userMapper.selectList(null)` 查出所有用户，观察它和第 27 章手写 `findAll` 的效果是否一致。<br><span class="ja-inline">🇯🇵 `UserService` に新しいメソッドを追加し、`userMapper.selectList(null)` を呼び出してすべてのユーザーを検索し、第27章で手書きした `findAll` の効果と一致するか観察しましょう。</span>
2. 尝试去掉 `@TableId(type = IdType.AUTO)`，改成不写 `type`，查阅一下默认的 `IdType` 是什么（提示：默认是全局唯一 ID 生成策略，不一定是数据库自增，这里先了解即可，本教程统一显式使用 `IdType.AUTO`）。<br><span class="ja-inline">🇯🇵 `@TableId(type = IdType.AUTO)` を外し、`type` を書かないようにしてみて、デフォルトの `IdType` が何かを調べてみましょう（ヒント：デフォルトはグローバルに一意なID生成戦略で、必ずしもデータベースの自動採番ではありません。ここではまず理解するだけで十分です。本チュートリアルでは一貫して明示的に `IdType.AUTO` を使用します）。</span>
3. 说说看，为什么 Spring Boot 3 项目和 Spring Boot 4 项目的 MyBatis-Plus 依赖坐标不一样？如果照抄错了会有什么后果？<br><span class="ja-inline">🇯🇵 なぜSpring Boot 3プロジェクトとSpring Boot 4プロジェクトでMyBatis-Plusの依存座標が異なるのか説明してみましょう。もし間違って流用したらどんな結果になるでしょうか？</span>

## 小测验 ／ 小テスト

1. `UserMapper extends BaseMapper<User>` 之后，自动获得了哪些常用方法？<br><span class="ja-inline">🇯🇵 `UserMapper extends BaseMapper<User>` とした後、自動的にどんなよく使うメソッドが手に入りますか？</span>
2. 本教程锁定的 MyBatis-Plus 依赖 artifactId 和版本号分别是什么？<br><span class="ja-inline">🇯🇵 本チュートリアルが固定するMyBatis-Plus依存関係のartifactIdとバージョン番号はそれぞれ何ですか？</span>
3. 为什么不能直接把 Spring Boot 3 教程里的 `mybatis-plus-boot-starter` 坐标照抄到本教程项目里？<br><span class="ja-inline">🇯🇵 なぜSpring Boot 3チュートリアルの `mybatis-plus-boot-starter` 座標を本チュートリアルのプロジェクトにそのまま流用できないのですか？</span>
4. `@TableId(type = IdType.AUTO)` 是什么意思？<br><span class="ja-inline">🇯🇵 `@TableId(type = IdType.AUTO)` はどういう意味ですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 常见的有 `selectById`、`selectList`、`insert`、`updateById`、`deleteById` 等，不需要手写 SQL。<br><span class="ja-inline">🇯🇵 よく使うものには `selectById`、`selectList`、`insert`、`updateById`、`deleteById` などがあり、SQLを手書きする必要はありません。</span>
2. artifactId 为 `mybatis-plus-spring-boot4-starter`，版本号为 `3.5.17`。<br><span class="ja-inline">🇯🇵 artifactIdは `mybatis-plus-spring-boot4-starter`、バージョン番号は `3.5.17` です。</span>
3. 因为 `mybatis-plus-boot-starter`（以及 `mybatis-plus-spring-boot3-starter`）是给 Spring Boot 3 设计的坐标，和 Spring Boot 4 的兼容性、内部依赖版本不同，直接照抄可能导致依赖冲突或启动报错；Spring Boot 4 必须使用专门适配的 `mybatis-plus-spring-boot4-starter`。<br><span class="ja-inline">🇯🇵 `mybatis-plus-boot-starter`（および `mybatis-plus-spring-boot3-starter`）はSpring Boot 3向けに設計された座標であり、Spring Boot 4との互換性や内部の依存バージョンが異なるため、そのまま流用すると依存関係の衝突や起動エラーを招く可能性があります。Spring Boot 4では専用に適合させた `mybatis-plus-spring-boot4-starter` を使わなければなりません。</span>
4. 表示这个字段是主键，且主键值由数据库自增（`AUTO_INCREMENT`）生成，插入后 MyBatis-Plus 会自动把生成的主键值回填到对象里。<br><span class="ja-inline">🇯🇵 このフィールドが主キーであり、主キーの値がデータベースの自動採番（`AUTO_INCREMENT`）によって生成されることを表します。挿入後、MyBatis-Plusは生成された主キーの値を自動的にオブジェクトに書き戻します。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了 MyBatis-Plus 解决的痛点，学会了用 `BaseMapper<T>` 免去手写基础 SQL，并记住了本教程锁定的依赖坐标 `mybatis-plus-spring-boot4-starter:3.5.17`。下一章学习事务 `@Transactional`——保证一组数据库操作要么全部成功、要么全部撤销。

> 🇯🇵 これでMyBatis-Plusが解決する課題を理解し、`BaseMapper<T>` を使って基本SQLを手書きせずに済ませられるようになり、本チュートリアルが固定する依存座標 `mybatis-plus-spring-boot4-starter:3.5.17` を覚えました。次の章ではトランザクション（トランザクション、`@Transactional`）を学びます——一連のデータベース操作を全部成功させるか全部取り消すかのどちらかにすることを保証する仕組みです。
