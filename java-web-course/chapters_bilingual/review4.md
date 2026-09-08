# 阶段复习 4：数据库与持久层 ／ ステージ復習4：データベースと永続化層

## 知识地图 ／ 知識マップ

本阶段（第 24～29 章 + Project 3）按依赖顺序学习了以下内容：

> 🇯🇵 この段階（第24〜29章＋Project 3）では、依存関係の順序に従って以下の内容を学びました。

```
数据库基础概念（表/行/列/主键/外键，第 24 章）
    ↓
基础 SQL 实战（SELECT/INSERT/UPDATE/DELETE/WHERE/ORDER BY/LIMIT，第 25 章）
    ↓
Spring Boot 连接 MySQL（spring.datasource：url/username/password/driver-class-name，第 26 章）
    ↓
JDBC 是什么、为什么繁琐 → MyBatis 出现
  → @Mapper + @Select + #{} 占位符（防 SQL 注入）
  → 接口没有实现类也能工作：MyBatis 动态代理自动生成实现类
  （第 27 章）
    ↓
MyBatis-Plus：BaseMapper<T> 免去手写基础增删改查 SQL
  → @TableName / @TableId
  → 依赖坐标 mybatis-plus-spring-boot4-starter:3.5.17
  （第 28 章）
    ↓
事务 @Transactional：commit / rollback，转账例子，背后是 AOP 动态代理
  （第 29 章）
    ↓
Project 3：User CRUD 从内存版升级为 MySQL 版
  Controller → Service → Mapper → MySQL
```

## 易混概念对照 ／ 混同しやすい概念の対照

| 概念 A ／ 概念A | 概念 B ／ 概念B | 一句话区别 ／ 一言での違い |
|---|---|---|
| JDBC | MyBatis | JDBC 是 Java 官方定义的数据库访问标准接口，写法繁琐（手动建连接、拼 SQL、取结果）；MyBatis 是建立在 JDBC 之上的框架，把这些重复劳动自动化，开发者只需要写 SQL 和方法签名<br><span class="ja-inline">🇯🇵 JDBCはJava公式が定義したデータベースアクセスの標準インターフェースで、書き方が煩雑（手動で接続を確立し、SQLを組み立て、結果を取得する）。MyBatisはJDBCの上に構築されたフレームワークで、これらの繰り返し作業を自動化し、開発者はSQLとメソッドシグネチャを書くだけでよい </span>|
| MyBatis | MyBatis-Plus | MyBatis 需要你自己在 `@Select`/`@Insert` 等注解（或 XML）里手写每一条 SQL；MyBatis-Plus 建立在 MyBatis 之上，通过 `BaseMapper<T>` 把最基础的增删改查 SQL 自动生成，你可以不用再手写这些"万能模板 SQL"<br><span class="ja-inline">🇯🇵 MyBatisは `@Select`/`@Insert` などのアノテーション（またはXML）で1つ1つのSQLを自分で手書きする必要がある。MyBatis-PlusはMyBatisの上に構築されており、`BaseMapper<T>` によって最も基本的なCRUD SQLを自動生成し、これらの「万能テンプレートSQL」をもう手書きしなくてよい </span>|
| `@Select`（MyBatis 原生） | `BaseMapper`（MyBatis-Plus） | 前者需要显式写出 SQL 字符串；后者继承即拥有 `selectById`/`insert` 等方法，SQL 由框架在运行时自动拼装，不需要显式写出来<br><span class="ja-inline">🇯🇵 前者は明示的にSQL文字列を書く必要がある。後者は継承するだけで `selectById`/`insert` などのメソッドを持ち、SQLはフレームワークが実行時に自動的に組み立てるため、明示的に書く必要がない </span>|
| commit | rollback | commit 是事务里所有操作都成功后，把改动永久保存到数据库；rollback 是事务里任意一步失败时，把已执行的操作全部撤销，恢复到事务开始前的状态<br><span class="ja-inline">🇯🇵 commitはトランザクション内のすべての操作が成功した後、変更を永続的にデータベースに保存すること。rollbackはトランザクション内のどれか1つのステップが失敗したときに、実行済みの操作をすべて取り消し、トランザクション開始前の状態に戻すこと </span>|
| `#{}` 占位符 | 字符串拼接 SQL | `#{}` 走预编译机制，参数值只会被当作普通数据处理，能防止 SQL 注入；字符串拼接直接把外部输入拼进 SQL 文本，存在被恶意篡改 SQL 逻辑的风险<br><span class="ja-inline">🇯🇵 `#{}` はプリコンパイル機構を使い、パラメータの値は普通のデータとしてのみ扱われ、SQLインジェクションを防げる。文字列連結は外部入力を直接SQL文に組み込むため、SQLロジックを悪意を持って改ざんされるリスクがある </span>|
| 主键（Primary Key） | 外键（Foreign Key） | 主键是一张表里唯一标识一行数据的列（唯一、不为空）；外键是一张表里的某一列，存的是另一张表的主键值，用来表示"谁属于谁"的关系<br><span class="ja-inline">🇯🇵 主キーは1枚のテーブルの中で1行のデータを一意に識別する列（一意、NULL不可）。外部キーは1枚のテーブルのある列で、別のテーブルの主キーの値を保存しており、「誰が誰に属するか」という関係を表す </span>|

## 测试题 ／ テスト問題

1. 为什么原始 JDBC 代码里"每查一次表就要重复一整套样板代码"？<br><span class="ja-inline">🇯🇵 なぜ素のJDBCコードでは「テーブルを検索するたびに一連の定型コードを繰り返さなければならない」のですか？</span>
2. `@Mapper` 标注的接口没有实现类，为什么依然能被 Spring 注入使用？<br><span class="ja-inline">🇯🇵 `@Mapper` が付いたインターフェースには実装クラスがないのに、なぜそれでもSpringに注入されて使えるのですか？</span>
3. `#{id}` 占位符相比字符串拼接，安全性上的核心区别是什么？<br><span class="ja-inline">🇯🇵 `#{id}` プレースホルダーは文字列連結と比べて、安全性の面でのコアな違いは何ですか？</span>
4. `UserMapper extends BaseMapper<User>` 之后，不写任何方法，能直接调用哪些常见方法？<br><span class="ja-inline">🇯🇵 `UserMapper extends BaseMapper<User>` とした後、メソッドを一切書かずに、どんなよく使うメソッドを直接呼び出せますか？</span>
5. Spring Boot 3 项目和 Spring Boot 4 项目使用的 MyBatis-Plus Starter 坐标分别是什么？<br><span class="ja-inline">🇯🇵 Spring Boot 3プロジェクトとSpring Boot 4プロジェクトで使うMyBatis-Plus Starterの座標はそれぞれ何ですか？</span>
6. 转账场景里，为什么"扣钱"和"加钱"必须放在同一个事务里？<br><span class="ja-inline">🇯🇵 送金の場面で、なぜ「引き落とし」と「入金」は同じトランザクションにまとめなければならないのですか？</span>
7. `spring.datasource.url` 里的 `useSSL=false` 和 `serverTimezone` 分别解决什么问题？<br><span class="ja-inline">🇯🇵 `spring.datasource.url` の `useSSL=false` と `serverTimezone` は、それぞれどんな問題を解決しますか？</span>
8. Project 3 相比 Project 2，最本质的变化是什么？<br><span class="ja-inline">🇯🇵 Project 3はProject 2と比べて、最も本質的な変化は何ですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 因为原始 JDBC 需要手动完成建立连接、拼装 `PreparedStatement`、绑定参数、执行查询、遍历 `ResultSet` 逐列取值并手动赋值给 Java 对象、关闭资源这一整套流程，且这套流程在几乎每一次查询里都要重复一遍。<br><span class="ja-inline">🇯🇵 素のJDBCでは、接続の確立、`PreparedStatement` の組み立て、パラメータのバインド、クエリの実行、`ResultSet` を走査して各列の値を取り出しJavaオブジェクトに手動で代入すること、リソースのクローズという一連の流れを手動で完了させる必要があり、この流れをほぼすべてのクエリで繰り返さなければならないからです。</span>
2. 因为 MyBatis 会在程序运行时用动态代理技术，根据接口的方法签名和注解里的 SQL，自动生成一个实现类，处理实际的数据库访问逻辑，Spring 把这个动态生成的实现类注册成 Bean 供注入使用。<br><span class="ja-inline">🇯🇵 MyBatisがプログラム実行時に動的プロキシ技術を使い、インターフェースのメソッドシグネチャとアノテーションの中のSQLに基づいて自動的に実装クラスを生成し、実際のデータベースアクセスロジックを処理するからです。Springはこの動的生成された実装クラスをBeanとして登録し、注入して使えるようにします。</span>
3. `#{id}` 走 JDBC 预编译机制，参数值永远只被当作普通数据绑定进 SQL，不会被解释成 SQL 语法的一部分；字符串拼接则是把外部输入直接拼进 SQL 文本，恶意输入可能篡改整条 SQL 的逻辑，造成 SQL 注入。<br><span class="ja-inline">🇯🇵 `#{id}` はJDBCのプリコンパイル機構を使い、パラメータの値は常に普通のデータとしてSQLにバインドされ、SQL構文の一部として解釈されることはありません。文字列連結は外部入力を直接SQL文に組み込むため、悪意ある入力がSQL全体のロジックを改ざんし、SQLインジェクションを引き起こす可能性があります。</span>
4. `selectById`、`selectList`、`insert`、`updateById`、`deleteById` 等 `BaseMapper` 内置的基础增删改查方法。<br><span class="ja-inline">🇯🇵 `selectById`、`selectList`、`insert`、`updateById`、`deleteById` など、`BaseMapper` に組み込まれた基本的なCRUDメソッドです。</span>
5. Spring Boot 3：`mybatis-plus-boot-starter` 或 `mybatis-plus-spring-boot3-starter`；Spring Boot 4：`mybatis-plus-spring-boot4-starter`（本教程锁定版本 `3.5.17`）。<br><span class="ja-inline">🇯🇵 Spring Boot 3：`mybatis-plus-boot-starter` または `mybatis-plus-spring-boot3-starter`。Spring Boot 4：`mybatis-plus-spring-boot4-starter`（本チュートリアルはバージョン `3.5.17` に固定）。</span>
6. 因为这两步是一个不可分割的业务整体：如果只有第一步成功、第二步失败，就会出现"钱已经扣了但没有转到对方账户"这种数据不一致，甚至导致资金凭空消失，所以必须要求两步要么一起成功（commit），要么一起撤销（rollback）。<br><span class="ja-inline">🇯🇵 この2つのステップは分割不可能な業務の一体だからです。もし1つ目のステップだけが成功して2つ目が失敗すれば、「お金はすでに引き落とされたが相手の口座に振り込まれていない」というデータの不整合が生じ、資金が跡形もなく消えることさえあります。そのため2つのステップは一緒に成功する（commit）か、一緒に取り消す（rollback）かのどちらかでなければなりません。</span>
7. `useSSL=false` 避免本地开发环境因缺少 SSL 证书配置导致连接失败或反复报警告；`serverTimezone` 明确时区，避免日期时间字段出现"差 8 小时"这类时区错位问题。<br><span class="ja-inline">🇯🇵 `useSSL=false` はローカル開発環境でSSL証明書が未設定なために接続失敗や繰り返しの警告が出るのを避けるためのものです。`serverTimezone` はタイムゾーンを明確にし、日時型フィールドで「8時間ずれる」といったタイムゾーンのずれの問題が起きるのを避けるためのものです。</span>
8. 数据存储从内存 `List<User>`（程序重启数据即丢失）变成了真正的 MySQL 数据库持久化存储（程序重启数据依然存在），整体结构也从"Controller → Service → List"变成了"Controller → Service → Mapper → MySQL"。<br><span class="ja-inline">🇯🇵 データストレージがメモリ上の `List<User>`（プログラムを再起動するとデータが消える）から、実際のMySQLデータベースによる永続化ストレージ（プログラムを再起動してもデータが残る）に変わりました。全体構造も「Controller → Service → List」から「Controller → Service → Mapper → MySQL」に変わりました。</span>
</details>

## 小项目回顾 ／ ミニプロジェクトの振り返り

Project 3（User CRUD MySQL）综合运用了本阶段的全部知识点：

> 🇯🇵 Project 3（User CRUD MySQL）はこの段階のすべての知識ポイントを総合的に活用しています。

- **第 24 章（数据库基础）**：设计并理解 `user` 表的结构——`id`/`name`/`email`/`age` 四列，`id` 作为主键。<br><span class="ja-inline">🇯🇵 **第24章（データベースの基礎）**：`user` テーブルの構造——`id`/`name`/`email`/`age` の4列、`id` を主キーとする——を設計し理解する。</span>
- **第 25 章（基础 SQL）**：项目背后 `BaseMapper` 自动生成的 SQL，本质上就是本章练过的 `SELECT`/`INSERT`/`UPDATE`/`DELETE`。<br><span class="ja-inline">🇯🇵 **第25章（基礎SQL）**：プロジェクトの裏で `BaseMapper` が自動生成するSQLは、本質的にはこの章で練習した `SELECT`/`INSERT`/`UPDATE`/`DELETE` である。</span>
- **第 26 章（连接 MySQL）**：`application.yml` 里配置 `spring.datasource` 的 `url`/`username`/`password`/`driver-class-name`，让项目真正连上本地 MySQL。<br><span class="ja-inline">🇯🇵 **第26章（MySQLへの接続）**：`application.yml` で `spring.datasource` の `url`/`username`/`password`/`driver-class-name` を設定し、プロジェクトを実際にローカルのMySQLに接続する。</span>
- **第 27 章（JDBC 与 MyBatis）**：理解了 `UserMapper` 这个 interface 为什么不写实现类也能工作（MyBatis 动态代理），为后面直接使用 `BaseMapper` 打下基础。<br><span class="ja-inline">🇯🇵 **第27章（JDBCとMyBatis）**：`UserMapper` という interface がなぜ実装クラスを書かなくても動作するのか（MyBatisの動的プロキシ）を理解し、後で `BaseMapper` を直接使うための土台を築く。</span>
- **第 28 章（MyBatis-Plus）**：`UserMapper extends BaseMapper<User>`，`User` 类加上 `@TableName`/`@TableId`，不手写一行 SQL 就实现了完整的增删改查。<br><span class="ja-inline">🇯🇵 **第28章（MyBatis-Plus）**：`UserMapper extends BaseMapper<User>`、`User` クラスに `@TableName`/`@TableId` を付け、SQLを1行も手書きせずに一通りのCRUDを実現する。</span>
- **第 29 章（事务）**：`UserServiceImpl` 的写操作方法上加 `@Transactional`，保证写入过程中出现异常时能正确回滚，不留下脏数据。<br><span class="ja-inline">🇯🇵 **第29章（トランザクション）**：`UserServiceImpl` の書き込み操作のメソッドに `@Transactional` を付け、書き込みの過程で例外が発生しても正しくロールバックでき、不正なデータを残さないことを保証する。</span>
- **第 16、20、21、22 章（前一阶段已学内容的复用）**：构造器注入、Controller-Service 分层、RESTful 路由设计、Jackson 自动序列化，全部原样复用到 Project 3 里，没有引入任何本阶段之前没学过的新概念。<br><span class="ja-inline">🇯🇵 **第16、20、21、22章（前段階で学んだ内容の再利用）**：コンストラクタ注入、Controller-Serviceの階層分け、RESTfulルーティング設計、Jacksonによる自動シリアライズ——これらすべてをそのままProject 3に流用しており、この段階以前に学んでいない新しい概念は一切導入していない。</span>

至此，你已经具备了"从浏览器发一个请求，到数据真正写进 MySQL、再原路返回浏览器"的完整能力。下一阶段将学习 DTO、参数校验、全局异常处理等工程化内容，为最终的 Task 管理系统项目做准备。

> 🇯🇵 ここまでで、「ブラウザから1つのリクエストを送信し、データが実際にMySQLに書き込まれ、そして元の経路でブラウザに戻ってくる」という一連の能力を完全に身につけました。次の段階ではDTO、パラメータ検証（validation）、グローバル例外処理といったエンジニアリング的な内容を学び、最終的なタスク管理システムのプロジェクトに向けて準備を進めます。
