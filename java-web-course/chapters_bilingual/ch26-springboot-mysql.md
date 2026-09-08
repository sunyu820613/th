# 第 26 章　Spring Boot 连接 MySQL ／ 第26章　Spring BootでMySQLに接続する

## 本章目标 ／ 本章の目標
理解"Java 程序连接数据库"到底是什么意思；能读懂并配置 `application.yml` 里 `spring.datasource` 下的 `url`/`username`/`password`/`driver-class-name`；亲手让一个 Spring Boot 项目连上本地 MySQL。

> 🇯🇵 「Javaプログラムがデータベースに接続する」とは具体的にどういうことかを理解します。`application.yml` の `spring.datasource` 配下にある `url`/`username`/`password`/`driver-class-name` を読み取って設定できるようになります。実際にSpring Bootプロジェクトをローカルの MySQL に接続します。

## 一句话理解 ／ 一言で理解する
"Java 程序连接数据库"，说白了就是 Java 程序通过一个叫 JDBC 驱动的"翻译官"，像打电话一样跟 MySQL 服务进程建立一条网络连接，之后就通过这条连接不断地"发送 SQL、接收结果"。

> 🇯🇵 「Javaプログラムがデータベースに接続する」とは、簡単に言えば、JavaプログラムがJDBC（Java Database Connectivity、Java標準のデータベースアクセスインターフェース）ドライバという「通訳者」を通じて、電話をかけるようにMySQLサービスプロセスとネットワーク接続を確立し、その後はこの接続を通じて絶えず「SQLを送信し、結果を受け取る」ということです。

## 为什么需要它 ／ なぜ必要なのか
前两章我们在数据库客户端（比如命令行或图形化工具）里手动敲 SQL，这没问题，但我们真正的目标是：让 Java 程序自己去查询、修改数据库，而不是靠人工敲命令。要做到这一点，第一步就是让 Java 程序"知道"数据库在哪里、怎么登录进去——这就是本章要解决的"连接"问题。注意：本章**还不会**用到 MyBatis，先把"连接"这一层单独讲透。

> 🇯🇵 前の2つの章ではデータベースクライアント（コマンドラインやGUIツールなど）で手動でSQLを打ち込んできましたが、これでも問題ありません。しかし本当の目標は、人がコマンドを打つのではなく、Javaプログラム自身にデータベースを検索・変更させることです。これを実現する第一歩は、Javaプログラムに「データベースがどこにあり、どうやってログインするか」を知らせることです——これが本章で解決する「接続」の問題です。注意：本章では**まだ** MyBatis（本チュートリアルで使用するSQLマッピングフレームワーク）を使いません。まず「接続」というこの層を単独で徹底的に説明します。

## 核心概念 ／ コアコンセプト

### 26.1 "连接数据库"到底在做什么 ／ 26.1 「データベースに接続する」とは実際に何をしているのか

MySQL 本质上是一个一直在后台运行的**服务进程**，它监听某个网络端口（默认 `3306`），等着别的程序来"敲门"。

> 🇯🇵 MySQLは本質的に、常にバックグラウンドで動いている**サービスプロセス**であり、あるネットワークポート（デフォルトは `3306`）を監視して、他のプログラムが「ノックしてくる」のを待っています。

Java 程序要用数据库，流程是这样的：

> 🇯🇵 Javaプログラムがデータベースを使う流れは次の通りです。

1. Java 程序里加载一个专门为 MySQL 写的 **JDBC 驱动**（一个 jar 包，相当于"懂得怎么和 MySQL 服务进程对话"的翻译官）。<br><span class="ja-inline">🇯🇵 Javaプログラム内でMySQL専用に書かれた **JDBC ドライバ**（jarパッケージの一つで、「MySQLサービスプロセスとの会話の仕方を知っている」通訳者に相当する）を読み込みます。</span>
2. 通过这个驱动，Java 程序向 MySQL 所在的地址和端口发起一条**网络连接**——这一步就跟打电话拨号很像：你要知道对方的"号码"（IP 地址 + 端口）,还要"验证身份"（用户名 + 密码）,对方接通了才能继续说话。<br><span class="ja-inline">🇯🇵 このドライバを通じて、JavaプログラムはMySQLがあるアドレスとポートに向けて**ネットワーク接続**を開始します——このステップは電話をかけるのによく似ています。相手の「番号」（IPアドレス＋ポート）を知っている必要があり、「本人確認」（ユーザー名＋パスワード）も必要で、相手がつながって初めて話を続けられます。</span>
3. 连接建立成功后，Java 程序就可以通过这条连接反复发送 SQL 语句（"帮我查一下 user 表"），MySQL 执行完把结果通过同一条连接传回来。<br><span class="ja-inline">🇯🇵 接続が確立されると、Javaプログラムはこの接続を通じて繰り返しSQL文（「userテーブルを検索してほしい」）を送信でき、MySQLは実行後に結果を同じ接続経由で返します。</span>
4. 用完之后，连接可以关闭（实际项目中通常用"连接池"复用连接，避免每次都重新建立，这个概念本教程不展开）。<br><span class="ja-inline">🇯🇵 使い終わったら接続を閉じることができます（実際のプロジェクトでは通常「コネクションプール」で接続を再利用し、毎回新しく確立するのを避けます。この概念は本チュートリアルでは詳しく扱いません）。</span>

### 26.2 `spring.datasource` 四大配置项 ／ 26.2 `spring.datasource` の4大設定項目

Spring Boot 项目里，数据库连接信息统一写在 `application.yml` 的 `spring.datasource` 下面：

> 🇯🇵 Spring Bootプロジェクトでは、データベース接続情報は `application.yml` の `spring.datasource` の下にまとめて記述します。

| 配置项 ／ 設定項目 | 含义 ／ 意味 |
|---|---|
| `url` | 数据库的"地址"，包含协议、主机、端口、库名以及一些连接参数<br><span class="ja-inline">🇯🇵 データベースの「アドレス」。プロトコル、ホスト、ポート、データベース名、いくつかの接続パラメータを含む </span>|
| `username` | 登录数据库用的用户名<br><span class="ja-inline">🇯🇵 データベースにログインするためのユーザー名 </span>|
| `password` | 登录数据库用的密码<br><span class="ja-inline">🇯🇵 データベースにログインするためのパスワード </span>|
| `driver-class-name` | JDBC 驱动的类全名，告诉 Spring Boot "用哪个翻译官去连"<br><span class="ja-inline">🇯🇵 JDBCドライバの完全修飾クラス名。Spring Bootに「どの通訳者を使って接続するか」を伝える </span>|

### 26.3 真实配置示例（MySQL 8.x） ／ 26.3 実際の設定例（MySQL 8.x）

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/usercrud_db?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

逐段拆解 `url`：

> 🇯🇵 `url` を段落ごとに分解します。

- `jdbc:mysql://`：固定前缀，告诉 JDBC 框架"接下来是一个 MySQL 数据库地址"。<br><span class="ja-inline">🇯🇵 `jdbc:mysql://`：固定の接頭辞で、JDBCフレームワークに「この後に続くのはMySQLデータベースのアドレスだ」と伝えます。</span>
- `localhost:3306`：MySQL 服务所在的主机地址和端口。`localhost` 表示"就在本机"，`3306` 是 MySQL 默认端口。<br><span class="ja-inline">🇯🇵 `localhost:3306`：MySQLサービスがあるホストアドレスとポートです。`localhost` は「同じマシン上にある」ことを意味し、`3306` はMySQLのデフォルトポートです。</span>
- `/usercrud_db`：要连接的具体数据库名（一个 MySQL 服务里可以有很多个数据库，得指明用哪一个）。<br><span class="ja-inline">🇯🇵 `/usercrud_db`：接続する具体的なデータベース名です（1つのMySQLサービスの中には複数のデータベースが存在し得るため、どれを使うか明示する必要があります）。</span>
- `?useSSL=false`：**为什么需要它**——MySQL 8 默认会检查 SSL 加密连接的证书，本地开发环境一般没有配置证书，加上 `useSSL=false` 明确告诉驱动"不需要 SSL 加密"，避免因为证书问题连接失败或疯狂打印警告（生产环境通常会启用更完善的 SSL 配置，这里只是本地开发的简化写法）。<br><span class="ja-inline">🇯🇵 `?useSSL=false`：**なぜ必要か**——MySQL 8はデフォルトでSSL暗号化接続の証明書をチェックしますが、ローカル開発環境では通常証明書が設定されていません。`useSSL=false` を付けることでドライバに「SSL暗号化は不要」だと明確に伝え、証明書の問題による接続失敗や大量の警告出力を避けられます（本番環境では通常より完全なSSL設定を有効にします。これはあくまでローカル開発向けの簡略化した書き方です）。</span>
- `&serverTimezone=Asia/Shanghai`：**为什么需要它**——MySQL 8 的 JDBC 驱动要求明确指定时区，否则处理日期时间字段时可能会出现"差 8 小时"这种时区错位问题。写成你实际所在的时区（这里以上海/北京时间为例）。<br><span class="ja-inline">🇯🇵 `&serverTimezone=Asia/Shanghai`：**なぜ必要か**——MySQL 8のJDBCドライバはタイムゾーンを明示的に指定することを要求します。指定しないと、日時型のフィールドを処理する際に「8時間ずれる」といったタイムゾーンのずれが発生することがあります。実際に自分が所在するタイムゾーンを書いてください（ここでは上海／北京時間を例にしています）。</span>
- `&characterEncoding=UTF-8`：指定字符编码为 UTF-8，避免中文（比如用户名"张三"）存进数据库后变成乱码。<br><span class="ja-inline">🇯🇵 `&characterEncoding=UTF-8`：文字コードをUTF-8に指定し、中国語（例えばユーザー名「张三」）がデータベースに保存された後に文字化けするのを防ぎます。</span>

### 26.4 需要额外添加的依赖 ／ 26.4 追加で必要な依存関係

想让 Spring Boot 项目具备连接 MySQL 的能力，`pom.xml` 里需要加两个依赖：

> 🇯🇵 Spring BootプロジェクトにMySQLへ接続する能力を持たせるには、`pom.xml`（Maven、Javaプロジェクトのビルド・依存管理ツールの設定ファイル）に2つの依存関係を追加する必要があります。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-jdbc</artifactId>
</dependency>
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

`spring-boot-starter-jdbc` 版本由 Spring Boot 4.1.1 的 BOM 统一管理，无需手写版本号；`mysql-connector-j` 就是上面说的 MySQL JDBC 驱动 jar 包，`scope` 设为 `runtime` 表示"只在程序运行时需要，编译代码时不需要直接引用它的类"。

> 🇯🇵 `spring-boot-starter-jdbc` のバージョンはSpring Boot 4.1.1のBOM（Bill of Materials、依存バージョンを一括管理する仕組み）によって統一管理されるため、バージョン番号を手書きする必要はありません。`mysql-connector-j` は上で説明したMySQL JDBCドライバのjarパッケージそのもので、`scope` を `runtime` に設定するのは「プログラム実行時にのみ必要で、コードのコンパイル時にはそのクラスを直接参照する必要がない」ことを意味します。

## 图解 ／ 図解

```
Java 程序（Spring Boot）
     │
     │ 1. 读取 application.yml 里的 url / username / password
     ▼
JDBC 驱动（mysql-connector-j）
     │
     │ 2. 按 url 里的主机+端口，向 MySQL 服务进程发起网络连接
     ▼
MySQL 服务进程（监听 3306 端口）
     │
     │ 3. 校验 username/password，通过后建立连接
     ▼
连接建立成功 ──▶ 之后 Java 程序通过这条连接发送 SQL、接收结果
```

## 最小示例 ／ 最小限のサンプル

一个完整的 `application.yml`（放在 `src/main/resources/` 下）：

> 🇯🇵 完全な `application.yml`（`src/main/resources/` に配置）：

```yaml
spring:
  application:
    name: user-crud-mysql
  datasource:
    url: jdbc:mysql://localhost:3306/usercrud_db?useSSL=false&serverTimezone=Asia/Shanghai&characterEncoding=UTF-8
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver
```

启动项目后，如果配置正确，控制台日志会看到类似 `HikariPool-1 - Start completed` 的字样（Spring Boot 内置的连接池叫 HikariCP，本教程不展开它的细节，这里只需要知道"看到这行日志说明连接池启动成功，数据库连上了"）。

> 🇯🇵 プロジェクトを起動した後、設定が正しければ、コンソールログに `HikariPool-1 - Start completed` のような文字列が表示されます（Spring Bootに組み込まれているコネクションプールはHikariCPと呼ばれます。本チュートリアルではその詳細には踏み込みません。ここでは「このログが出れば、コネクションプールの起動に成功し、データベースにつながった」と理解しておけば十分です）。

## 代码逐行解释 ／ コードの行ごとの解説

- `url` 一行：这是唯一一行信息量最大的配置，前面已经逐段拆解过：协议 + 主机 + 端口 + 库名 + 连接参数。<br><span class="ja-inline">🇯🇵 `url` の行：これは情報量が最も多い唯一の設定行で、前段ですでに分解した通り、プロトコル＋ホスト＋ポート＋データベース名＋接続パラメータで構成されています。</span>
- `username` / `password`：就是你登录 MySQL 时用的账号密码，和你在命令行 `mysql -u root -p` 里输入的是同一套。<br><span class="ja-inline">🇯🇵 `username` / `password`：MySQLにログインする際に使うアカウントとパスワードで、コマンドラインの `mysql -u root -p` で入力するものと同じです。</span>
- `driver-class-name: com.mysql.cj.jdbc.Driver`：这是 `mysql-connector-j` 这个 jar 包里提供的驱动类的完整路径。Spring Boot 实际上大多数情况下能自动根据 `url` 猜出驱动类，但显式写出来更清晰、不容易出问题，本教程统一显式配置。<br><span class="ja-inline">🇯🇵 `driver-class-name: com.mysql.cj.jdbc.Driver`：これは `mysql-connector-j` というjarパッケージが提供するドライバクラスの完全なパスです。Spring Bootは実際にはほとんどの場合 `url` から自動的にドライバクラスを推測できますが、明示的に書いた方がわかりやすく問題も起きにくいため、本チュートリアルでは一貫して明示的に設定します。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. Spring Boot 应用启动时，读取 `application.yml` 里 `spring.datasource` 下的配置。<br><span class="ja-inline">🇯🇵 Spring Bootアプリケーション起動時に、`application.yml` の `spring.datasource` 配下の設定を読み込みます。</span>
2. Spring Boot 自动配置（`@EnableAutoConfiguration`，第 19 章讲过）检测到 classpath 里有 `mysql-connector-j` 和 `spring-boot-starter-jdbc`，于是自动创建一个数据源（DataSource）Bean，并用配置里的 `url`/`username`/`password` 初始化连接池。<br><span class="ja-inline">🇯🇵 Spring Bootの自動設定（`@EnableAutoConfiguration`、第19章で説明済み）は、クラスパス上に `mysql-connector-j` と `spring-boot-starter-jdbc` があることを検出し、自動的にデータソース（DataSource）Bean（Springコンテナが一元管理するオブジェクト）を作成し、設定内の `url`/`username`/`password` でコネクションプールを初期化します。</span>
3. 连接池按需向 MySQL 服务进程建立若干条网络连接，放在池子里备用。<br><span class="ja-inline">🇯🇵 コネクションプールは必要に応じてMySQLサービスプロセスに複数のネットワーク接続を確立し、プール内に控えとして保持します。</span>
4. 只要连接池启动成功，说明"Java 程序能连上数据库"这件事已经打通了——接下来的章节会讲怎么用 MyBatis 通过这些连接真正发送 SQL。<br><span class="ja-inline">🇯🇵 コネクションプールの起動に成功しさえすれば、「Javaプログラムがデータベースに接続できる」ことがすでに実現できたことになります——続く章では、これらの接続を通じてMyBatisで実際にSQLを送信する方法を説明します。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| `Communications link failure` | MySQL 服务没启动，或者 `url` 里的主机/端口写错<br><span class="ja-inline">🇯🇵 MySQLサービスが起動していない、または `url` のホスト／ポートが間違っている </span>| 确认本地 MySQL 服务已启动，检查 `localhost:3306` 是否正确<br><span class="ja-inline">🇯🇵 ローカルのMySQLサービスが起動しているか確認し、`localhost:3306` が正しいかチェックする </span>|
| `Access denied for user 'root'@'localhost'` | 用户名或密码错误<br><span class="ja-inline">🇯🇵 ユーザー名またはパスワードが間違っている </span>| 核对 `username`/`password` 是否和实际 MySQL 账号一致<br><span class="ja-inline">🇯🇵 `username`/`password` が実際のMySQLアカウントと一致しているか確認する </span>|
| `Unknown database 'usercrud_db'` | `url` 里指定的数据库名在 MySQL 里还不存在<br><span class="ja-inline">🇯🇵 `url` で指定したデータベース名がMySQLにまだ存在しない </span>| 先手动执行 `CREATE DATABASE usercrud_db;` 创建这个库，再启动项目<br><span class="ja-inline">🇯🇵 先に手動で `CREATE DATABASE usercrud_db;` を実行してこのデータベースを作成してから、プロジェクトを起動する </span>|
| 时间字段查出来差 8 小时<br><span class="ja-inline">🇯🇵 日時型のフィールドを検索すると8時間ずれている </span>| 没有配置 `serverTimezone`，或时区配置和实际不符<br><span class="ja-inline">🇯🇵 `serverTimezone` を設定していない、またはタイムゾーン設定が実際と合っていない </span>| 在 `url` 里加上正确的 `serverTimezone` 参数<br><span class="ja-inline">🇯🇵 `url` に正しい `serverTimezone` パラメータを追加する </span>|

## 动手练习 ／ 演習

1. 在本地安装的 MySQL 里手动创建一个数据库 `usercrud_db`，然后按本章的 `application.yml` 配置一个 Spring Boot 项目，启动后观察控制台日志有没有出现连接池启动成功的字样。<br><span class="ja-inline">🇯🇵 ローカルにインストールしたMySQLで手動でデータベース `usercrud_db` を作成し、本章の `application.yml` に従ってSpring Bootプロジェクトを設定して、起動後にコンソールログにコネクションプール起動成功の文字列が出るか観察しましょう。</span>
2. 故意把 `password` 改错，重新启动项目，观察报错信息，理解这条错误对应哪一步失败了。<br><span class="ja-inline">🇯🇵 わざと `password` を間違ったものに変えて、プロジェクトを再起動し、エラーメッセージを観察して、このエラーがどのステップの失敗に対応しているか理解しましょう。</span>
3. 试着去掉 `url` 里的 `serverTimezone` 参数，看看是否还能正常启动（不同 MySQL 驱动版本表现可能不同，体会一下这个参数的作用）。<br><span class="ja-inline">🇯🇵 `url` から `serverTimezone` パラメータを外してみて、正常に起動できるか試してみましょう（MySQLドライバのバージョンによって挙動が異なる場合があります。このパラメータの役割を体感してみてください）。</span>

## 小测验 ／ 小テスト

1. "Java 程序连接数据库"这句话具体指的是什么过程？<br><span class="ja-inline">🇯🇵 「Javaプログラムがデータベースに接続する」とは具体的にどんな過程を指しますか？</span>
2. `spring.datasource.url` 里的 `useSSL=false` 和 `serverTimezone` 分别是为了解决什么问题？<br><span class="ja-inline">🇯🇵 `spring.datasource.url` の `useSSL=false` と `serverTimezone` は、それぞれどんな問題を解決するためのものですか？</span>
3. `driver-class-name` 配置的是什么？<br><span class="ja-inline">🇯🇵 `driver-class-name` は何を設定するものですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 指 Java 程序通过 JDBC 驱动，按照配置的地址、端口、用户名、密码，向 MySQL 服务进程发起网络连接并完成身份校验，之后就能通过这条连接发送 SQL、接收结果。<br><span class="ja-inline">🇯🇵 Javaプログラムが JDBCドライバを通じて、設定されたアドレス、ポート、ユーザー名、パスワードに従ってMySQLサービスプロセスにネットワーク接続を開始し、本人確認を完了させることを指します。その後はこの接続を通じてSQLを送信し、結果を受け取れるようになります。</span>
2. `useSSL=false` 是为了避免本地开发环境因缺少 SSL 证书配置而连接失败或报警告；`serverTimezone` 是为了明确时区，避免日期时间字段出现时区错位（比如差 8 小时）。<br><span class="ja-inline">🇯🇵 `useSSL=false` は、ローカル開発環境でSSL証明書が未設定なために接続失敗や警告が出るのを避けるためのものです。`serverTimezone` はタイムゾーンを明確にし、日時型フィールドでタイムゾーンのずれ（8時間ずれるなど）が発生するのを避けるためのものです。</span>
3. 配置 JDBC 驱动类的完整类路径，告诉 Spring Boot 用哪个"翻译官"（驱动实现）去连接对应类型的数据库。<br><span class="ja-inline">🇯🇵 JDBCドライバクラスの完全なクラスパスを設定し、Spring Bootにどの「通訳者」（ドライバの実装）を使って対応する種類のデータベースに接続するかを伝えます。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了"连接数据库"背后的网络连接本质，并学会了配置 `spring.datasource` 让 Spring Boot 项目连上本地 MySQL。下一章开始学习 JDBC 和 MyBatis——真正通过 Java 代码发送 SQL、拿到结果。

> 🇯🇵 これで「データベースに接続する」ことの背後にあるネットワーク接続の本質を理解し、`spring.datasource` を設定してSpring BootプロジェクトをローカルのMySQLに接続できるようになりました。次の章からはJDBCとMyBatisを学び、実際にJavaコードでSQLを送信して結果を取得します。
