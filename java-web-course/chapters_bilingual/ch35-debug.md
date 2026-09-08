# 第 35 章　Debug 与常见报错排查 ／ 第35章　デバッグとよくあるエラーのトラブルシューティング

## 本章目标 ／ 本章の目標
认识开发中最常遇到的一批报错（404、400、500、连接失败、Bean not found、Mapper not found 等），知道大概是什么原因、怎么排查；学会在 IDEA 里打断点、单步调试、查看变量、看懂 Stack Trace。

> 🇯🇵 開発でよく出会う一連のエラー（404、400、500、接続失敗、Bean not found、Mapper not found など）を知り、おおよその原因と調査方法を理解します。IDEA で断点（ブレークポイント、プログラムを一時停止させる位置）を打ち、ステップ実行し、変数を確認し、スタックトレース（Stack Trace、例外発生時の呼び出し経路を表示したもの）を読めるようになります。

## 一句话理解 ／ 一言で理解する
几乎所有报错信息里都藏着"问题出在哪"的线索——学会读懂这些线索，比死记"遇到 XX 错误就怎么改"更重要，因为同一句报错背后的具体原因，每个项目可能都不完全一样。

> 🇯🇵 ほぼ全てのエラー情報には「問題がどこにあるか」という手がかりが隠されています——これらの手がかりを読み解けるようになることは、「XX エラーが出たらこう直す」と丸暗記するよりずっと重要です。同じエラー文の裏にある具体的な原因は、プロジェクトごとに完全には一致しないことがあるからです。

## 为什么需要它 ／ なぜ必要なのか

从环境搭建到现在，你大概率已经踩过不少坑：程序跑不起来、接口调不通、页面报错。这些报错很多时候看起来很吓人（一大段红色文字、一堆看不懂的类名），但初学者常犯的错误是"看到报错就慌，直接把整段错误复制去搜索，别人怎么改就照抄怎么改"。这一章的目标，是让你学会自己先冷静读一遍报错信息，判断大致是哪个环节出了问题，再有针对性地去排查，而不是盲目试错。

> 🇯🇵 環境構築から今まで、おそらくすでに多くの落とし穴を踏んできたはずです。プログラムが動かない、API がつながらない、画面がエラーになる、といった具合に。これらのエラーは見た目がとても恐ろしいことが多い（大量の赤い文字、意味不明なクラス名の羅列）ですが、初心者がよく犯す間違いは「エラーを見ただけで慌て、エラー文をまるごとコピーして検索し、他人がどう直したかをそのまま真似する」ことです。この章の目標は、まず自分でエラー情報を落ち着いて一通り読み、おおよそどの部分に問題があるかを判断できるようになり、当てずっぽうで試すのではなく的を絞って調査できるようになることです。

## 核心概念 ／ コアコンセプト

### 5.1 常见 HTTP 状态码报错 ／ よくあるHTTPステータスコードのエラー

| 报错 ／ エラー | 大概是什么原因 ／ おおよその原因 | 怎么排查 ／ 調査方法 |
|---|---|---|
| **404 Not Found** | 请求的路径写错了；或者对应的接口方法没有写、注解没对齐；也可能是服务器压根没启动成功，用的还是旧的端口<br><span class="ja-inline">🇯🇵 リクエストしたパスが間違っている。対応する API メソッドが書かれていない、またはアノテーションが正しく対応していない。あるいはサーバーがそもそも起動に成功しておらず、古いポートを使い続けている </span>| 检查浏览器/Postman 里请求的 URL 和 Controller 上 `@RequestMapping`/`@GetMapping` 等注解声明的路径是否完全一致（包括大小写、有没有多打或少打斜杠）；确认服务确实已经启动<br><span class="ja-inline">🇯🇵 ブラウザ／Postman でリクエストした URL と、Controller の `@RequestMapping`/`@GetMapping` などのアノテーションで宣言されたパスが完全に一致しているか（大文字小文字、スラッシュの過不足を含む）を確認する。サービスが確実に起動しているか確認する </span>|
| **400 Bad Request** | 请求参数或请求体格式不对，比如漏传了必填字段、JSON 格式写错了、类型对不上（比如该传数字传了文字），或者是第 31 章讲的 `@Valid` 校验没通过<br><span class="ja-inline">🇯🇵 リクエストパラメータやリクエストボディの形式が正しくない。例えば必須フィールドの送信漏れ、JSON 形式の誤り、型の不一致（数値を送るべきところに文字列を送るなど）、あるいは第31章で説明した `@Valid` 検証が通らなかった場合 </span>| 打开 IDEA 控制台或浏览器 Network 面板，看返回的错误信息里具体提示哪个字段有问题；对照 Controller 方法参数和请求体逐个核对<br><span class="ja-inline">🇯🇵 IDEA コンソールやブラウザの Network パネルを開き、返されたエラー情報でどのフィールドに問題があるか確認する。Controller メソッドの引数とリクエストボディを一つ一つ照合する </span>|
| **500 Internal Server Error** | 服务器内部代码本身出了异常，比如空指针、类型转换失败、SQL 写错等，是最需要"看控制台堆栈"的一类错误<br><span class="ja-inline">🇯🇵 サーバー内部のコード自体で例外が発生している。ぬるぽ（null ポインタ）、型変換の失敗、SQL の書き間違いなど。最も「コンソールのスタックを見る」必要があるエラーの種類 </span>| 回到 IDEA 控制台，从上往下找到第一行属于**你自己代码包名**（比如 `com.example.taskmanager`）的那一行，通常那就是问题真正发生的位置<br><span class="ja-inline">🇯🇵 IDEA コンソールに戻り、上から順に**自分のコードのパッケージ名**（例えば `com.example.taskmanager`）に属する最初の行を探す。通常そこが問題の実際の発生箇所である </span>|

### 5.2 常见连接类报错 ／ よくある接続系のエラー

| 报错 ／ エラー | 大概是什么原因 ／ おおよその原因 | 怎么排查 ／ 調査方法 |
|---|---|---|
| **Connection refused** | 目标端口没有任何程序在监听，最常见的场景是 MySQL 服务没启动，或者 `application.yml` 里配置的端口和实际不一致<br><span class="ja-inline">🇯🇵 目的のポートで何のプログラムもリッスンしていない。最もよくあるのは MySQL サービスが起動していない、または `application.yml` の設定ポートが実際と一致していない場合 </span>| 检查 MySQL 服务是否已启动（命令行或系统服务列表里确认）；确认 `application.yml` 里的端口号和实际一致<br><span class="ja-inline">🇯🇵 MySQL サービスが起動しているか確認する（コマンドラインやシステムサービス一覧で確認）。`application.yml` のポート番号が実際と一致しているか確認する </span>|
| **Communications link failure** | 数据库连接的具体参数不对，比如 `url` 里数据库名拼错、用户名密码不对、防火墙拦截等，和 Connection refused 的区别在于"端口是通的，但连不上具体的数据库实例"<br><span class="ja-inline">🇯🇵 データベース接続の具体的なパラメータが正しくない。`url` のデータベース名の誤り、ユーザー名・パスワードの誤り、ファイアウォールによる遮断など。Connection refused との違いは「ポートは通っているが、具体的なデータベースインスタンスに接続できない」点である </span>| 逐项核对 `application.yml` 里 `datasource` 的 `url`、`username`、`password`；尝试用同样的用户名密码，通过命令行或数据库客户端工具直接连一次，确认凭据本身是对的<br><span class="ja-inline">🇯🇵 `application.yml` の `datasource` の `url`、`username`、`password` を一つずつ照合する。同じユーザー名・パスワードでコマンドラインやデータベースクライアントツールを使って直接接続し、認証情報自体が正しいことを確認する </span>|

### 5.3 常见 Spring / MyBatis 报错 ／ よくあるSpring / MyBatisのエラー

| 报错 ／ エラー | 大概是什么原因 ／ おおよその原因 | 怎么排查 ／ 調査方法 |
|---|---|---|
| **`No qualifying bean of type '...' found`**（Bean not found） | Spring 想要注入某个类型的 Bean，但容器里根本没有这个 Bean。通常是忘了在类上加 `@Service`/`@Component`/`@Repository` 之类的注解，或者这个类所在的包没有被 `@SpringBootApplication` 所在包及其子包覆盖（包扫描扫不到）<br><span class="ja-inline">🇯🇵 Spring がある型の Bean（Bean、Spring コンテナが一元管理するオブジェクト）を注入しようとしたが、コンテナ内にその Bean が存在しない。通常はクラスに `@Service`/`@Component`/`@Repository` などのアノテーションを付け忘れているか、そのクラスのパッケージが `@SpringBootApplication` のパッケージおよびそのサブパッケージの範囲外にある（パッケージスキャンが届かない）ことが原因 </span>| 检查报错提示缺少的是哪个类型的 Bean，去找到对应的类，确认注解齐全；确认类所在的包路径在启动类包路径之下<br><span class="ja-inline">🇯🇵 エラーが示す不足している Bean の型を確認し、対応するクラスを探してアノテーションが揃っているか確認する。クラスのパッケージパスが起動クラスのパッケージパスの下にあるか確認する </span>|
| **`Invalid bound statement (not found): xxx.Mapper.xxx`**（Mapper not found） | Java 里的 Mapper 接口方法，在 MyBatis 的 XML Mapper 文件里找不到对应的 SQL 语句，通常是 XML 文件路径没有正确配置到项目里，或者方法名/`namespace` 对不上<br><span class="ja-inline">🇯🇵 Java の Mapper インターフェースのメソッドが、MyBatis の XML Mapper ファイル内で対応する SQL 文が見つからない。通常は XML ファイルのパスがプロジェクトに正しく設定されていないか、メソッド名／`namespace` が一致していないことが原因 </span>| 确认 `application.yml` 里 `mybatis.mapper-locations` 指向的路径正确；确认 XML 文件里 `<mapper namespace="...">` 写的是完整、正确的 Mapper 接口全限定名；确认 `<select>`/`<insert>` 等标签的 `id` 和接口方法名一字不差（如果用的是 MyBatis-Plus 的 `BaseMapper` 自带方法，通常不会出现这个问题，只有自定义 XML 方法才需要这样排查）<br><span class="ja-inline">🇯🇵 `application.yml` の `mybatis.mapper-locations` が指すパスが正しいか確認する。XML ファイルの `<mapper namespace="...">` に完全かつ正確な Mapper インターフェースの完全修飾名が書かれているか確認する。`<select>`/`<insert>` などのタグの `id` がインターフェースのメソッド名と一字一句一致しているか確認する（MyBatis-Plus の `BaseMapper` 標準メソッドを使っている場合、通常この問題は起きず、カスタムの XML メソッドのみこの調査が必要） </span>|

## 图解 ／ 図解

```
看到一段报错，按这个顺序排查：

第一步：看状态码 / 异常类型是什么大类
   404 → 路径问题        400 → 参数问题
   500 → 代码内部异常      连接类报错 → 数据库/网络问题

第二步（针对 500 或未捕获异常）：从控制台堆栈里，
从上往下找第一行属于自己项目包名（com.example.taskmanager）的代码
   ↓
那一行，往往就是问题真正发生的位置

第三步：定位到具体代码后，用断点单步跟踪变量的实际值，
而不是"猜"哪里错了
```

## 最小示例 ／ 最小限のサンプル

一段典型的 500 异常堆栈（节选，实际会更长）：

> 🇯🇵 典型的な 500 例外のスタック（抜粋、実際にはもっと長くなります）。

```
java.lang.NullPointerException: Cannot invoke "String.length()" because "title" is null
    at com.example.taskmanager.service.impl.TaskServiceImpl.create(TaskServiceImpl.java:23)
    at com.example.taskmanager.controller.TaskController.create(TaskController.java:15)
    at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
    ...（后面一大段属于 Spring 框架内部调用，先不用管）
```

## 代码逐行解释（如何读这段堆栈） ／ コードの行ごとの解説（このスタックの読み方）

- 第一行 `java.lang.NullPointerException: ...`：异常类型和一句简短描述，这里说的是"想对一个值为 `null` 的 `title` 调用 `.length()`"——这句话本身已经告诉你问题大概是什么。<br><span class="ja-inline">🇯🇵 1行目 `java.lang.NullPointerException: ...`：例外の型と短い説明文で、ここでは「値が `null` である `title` に対して `.length()` を呼び出そうとした」ことを示しています——この一文自体がすでに問題のおおよその内容を教えてくれています。</span>
- 第二行 `at com.example.taskmanager.service.impl.TaskServiceImpl.create(TaskServiceImpl.java:23)`：这是堆栈的第一行，说明异常正是从这里抛出的——`TaskServiceImpl.java` 文件第 23 行。**这一行永远是最值得先看的一行。**<br><span class="ja-inline">🇯🇵 2行目 `at com.example.taskmanager.service.impl.TaskServiceImpl.create(TaskServiceImpl.java:23)`：これはスタックの1行目で、例外がまさにここから投げられたことを示しています——`TaskServiceImpl.java` ファイルの23行目です。**この行は常に真っ先に見るべき行です。**</span>
- 第三行 `at com.example.taskmanager.controller.TaskController.create(TaskController.java:15)`：说明是 `TaskController` 的第 15 行调用了刚才那个出问题的方法，往下看能帮你理解"这个调用是怎么发起的"。<br><span class="ja-inline">🇯🇵 3行目 `at com.example.taskmanager.controller.TaskController.create(TaskController.java:15)`：`TaskController` の15行目が先ほどの問題のあるメソッドを呼び出したことを示しています。下へ読み進めることで「この呼び出しがどのように発生したか」を理解できます。</span>
- 后面一大串 `at java.base/...`、`at org.springframework...`：属于 Java 标准库和 Spring 框架内部的调用过程，绝大多数情况下**可以直接跳过**，除非你怀疑是框架本身的问题（初学阶段基本不需要怀疑这一点，99% 的情况是自己代码的问题）。<br><span class="ja-inline">🇯🇵 その後に続く大量の `at java.base/...`、`at org.springframework...`：Java 標準ライブラリと Spring フレームワーク内部の呼び出し過程で、ほとんどの場合**そのまま読み飛ばして構いません**。フレームワーク自体の問題を疑う場合は別ですが（初心者の段階ではこれを疑う必要はほぼなく、99%は自分のコードの問題です）。</span>

## 程序运行过程（IDEA 断点调试操作步骤） ／ プログラムの実行の流れ（IDEAでの断点デバッグの手順）

用文字描述一次典型的断点调试过程，帮助你在 IDEA 里实际操作：

> 🇯🇵 典型的な断点デバッグの流れを文章で説明し、IDEA での実際の操作を助けます。

1. **打断点**：在 `TaskServiceImpl.java` 第 23 行（比如 `task.setTitle(request.getTitle().trim());` 这一行）的行号左侧空白处，鼠标点一下，会出现一个红色圆点，这就是"断点"，表示"程序执行到这一行时先暂停，别往下走"。<br><span class="ja-inline">🇯🇵 **断点を打つ**：`TaskServiceImpl.java` の23行目（例えば `task.setTitle(request.getTitle().trim());` の行）の行番号左側の空白部分をマウスでクリックすると、赤い丸印が現れます。これが「断点（ブレークポイント）」で、「プログラムがこの行まで実行されたら一旦停止し、先へ進まない」ことを意味します。</span>
2. **以 Debug 模式启动**：不要用普通的绿色三角"运行"按钮，而是点旁边的虫子形状图标（Debug 按钮）启动项目。<br><span class="ja-inline">🇯🇵 **Debugモードで起動**：普通の緑の三角形の「実行」ボタンを使わず、隣にある虫の形をしたアイコン（Debug ボタン）をクリックしてプロジェクトを起動します。</span>
3. **触发请求**：用 Postman 或浏览器发一个会执行到这段代码的请求，比如 `POST /tasks`。<br><span class="ja-inline">🇯🇵 **リクエストを発行する**：Postman やブラウザでこのコードが実行されるリクエスト、例えば `POST /tasks` を送ります。</span>
4. **程序在断点处暂停**：IDEA 界面下方会自动弹出一个调试面板，代码执行到断点那一行时停住，这一行会被高亮显示，说明"还没执行这一行，正准备执行"。<br><span class="ja-inline">🇯🇵 **プログラムが断点で停止する**：IDEA 画面下部にデバッグパネルが自動的に表示され、コードが断点のその行まで実行されると停止し、その行がハイライト表示されます。これは「まだこの行を実行しておらず、これから実行しようとしている」ことを意味します。</span>
5. **查看 Variables 面板**：调试面板左侧（或下方，视 IDEA 版本布局而定）有一个 "Variables" 面板，能看到当前方法里所有局部变量的实时值——比如这里能直接看到 `request` 对象里 `title` 字段到底是不是 `null`，不需要靠猜。<br><span class="ja-inline">🇯🇵 **Variablesパネルを確認する**：デバッグパネルの左側（または下側、IDEA のバージョンによってレイアウトが異なる）に "Variables" パネルがあり、現在のメソッド内の全てのローカル変数のリアルタイムの値を確認できます——例えば `request` オブジェクトの `title` フィールドが本当に `null` かどうかをここで直接確認でき、推測に頼る必要がありません。</span>
6. **Step Over（单步跳过）**：点击调试工具栏上那个"向下的箭头跨过一个小点"的图标（快捷键通常是 F8），程序会执行完当前这一行，然后停在下一行，但**不会**跳进这一行调用的方法内部——适合"我不关心这一行内部怎么实现，只想看执行完之后的结果"。<br><span class="ja-inline">🇯🇵 **Step Over（ステップオーバー）**：デバッグツールバーの「下向き矢印が小さな点をまたぐ」アイコン（ショートカットは通常 F8）をクリックすると、プログラムは現在の行を実行し終えて次の行で停止しますが、この行が呼び出しているメソッドの内部には**入りません**——「この行の内部でどう実装されているかは気にせず、実行後の結果だけを見たい」場合に適しています。</span>
7. **Step Into（单步进入）**：如果当前行调用了另一个自己写的方法，想看看那个方法内部具体怎么执行的，可以用"箭头指向下方一个点"的图标（快捷键通常是 F7），会跳转进入被调用方法的内部，从它的第一行开始单步执行。<br><span class="ja-inline">🇯🇵 **Step Into（ステップイン）**：現在の行が自分で書いた別のメソッドを呼び出していて、そのメソッド内部の具体的な実行を見たい場合は、「矢印が下方の点を指す」アイコン（ショートカットは通常 F7）を使うと、呼び出されたメソッドの内部にジャンプし、その最初の行からステップ実行を開始します。</span>
8. **观察问题根源**：结合 Variables 面板一步步往下走，直到看到某个变量的值和预期不一样（比如 `title` 果然是 `null`），这一步就找到了问题的真正原因，比如"上一步 `TaskCreateRequest` 里 `title` 字段确实没有被前端传过来"。<br><span class="ja-inline">🇯🇵 **問題の根本原因を観察する**：Variables パネルと組み合わせて一歩ずつ進み、ある変数の値が期待と異なることに気づくまで続けます（例えば `title` が本当に `null` である場合）。このステップで問題の本当の原因——例えば「一つ前のステップで `TaskCreateRequest` の `title` フィールドが確かにフロントエンドから渡されていなかった」——が見つかります。</span>
9. **停止调试**：确认问题原因后，点调试工具栏上的红色方块（Stop）结束调试，回去修改代码。<br><span class="ja-inline">🇯🇵 **デバッグを停止する**：問題の原因を確認したら、デバッグツールバーの赤い四角（Stop）をクリックしてデバッグを終了し、コードの修正に戻ります。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 打了断点，但程序完全不停 | 用了普通的"运行"而不是"Debug"模式启动；或者这段代码根本没有被执行到<br><span class="ja-inline">🇯🇵 普通の「実行」を使って「Debug」モードで起動していない。またはこのコードがそもそも実行されていない </span>| 确认用的是 Debug（虫子图标）启动；确认请求确实会触发到断点所在的方法<br><span class="ja-inline">🇯🇵 Debug（虫のアイコン）で起動しているか確認する。リクエストが断点のあるメソッドを確実にトリガーするか確認する </span>|
| 堆栈很长，不知道该看哪一行 | 不熟悉"从上往下找第一行自己项目包名"的方法<br><span class="ja-inline">🇯🇵 「上から自分のプロジェクトのパッケージ名を持つ最初の行を探す」方法に慣れていない </span>| 记住这条经验规则：先找包含你自己项目包名（如 `com.example.taskmanager`）的最上面那一行<br><span class="ja-inline">🇯🇵 この経験則を覚えておく：まず自分のプロジェクトのパッケージ名（`com.example.taskmanager` など）を含む一番上の行を探す </span>|
| Bean not found 报错，但类上明明加了注解 | 类所在的包不在启动类 `@SpringBootApplication` 所在包的子包范围内，Spring 扫描不到<br><span class="ja-inline">🇯🇵 クラスのパッケージが起動クラス `@SpringBootApplication` のパッケージのサブパッケージ範囲内になく、Spring がスキャンできない </span>| 检查项目目录结构，确认所有类都在启动类所在包（或其子包）下<br><span class="ja-inline">🇯🇵 プロジェクトのディレクトリ構造を確認し、全てのクラスが起動クラスのパッケージ（またはそのサブパッケージ）の下にあることを確認する </span>|

## 动手练习 ／ 演習

1. 故意在一个 Controller 方法上写错 URL 路径的大小写，用 Postman 请求原来的路径，观察得到什么状态码。<br><span class="ja-inline">🇯🇵 わざと Controller メソッドの URL パスの大文字小文字を間違えて書き、Postman で元のパスをリクエストして、どんなステータスコードが返るか観察しましょう。</span>
2. 故意让某个 `@Service` 类漏掉注解，启动项目，仔细阅读控制台报出的 `No qualifying bean` 错误，尝试只凭这段报错文字定位到是哪个类缺了注解。<br><span class="ja-inline">🇯🇵 わざとある `@Service` クラスのアノテーションを漏らして、プロジェクトを起動し、コンソールに出る `No qualifying bean` エラーを注意深く読み、このエラー文だけを頼りにどのクラスにアノテーションが欠けているか特定してみましょう。</span>
3. 在 `TaskServiceImpl` 里挑一个方法打上断点，故意发一个请求触发它，实际操作一遍 Step Over 和 Step Into，感受两者的区别。<br><span class="ja-inline">🇯🇵 `TaskServiceImpl` のいずれかのメソッドに断点を打ち、わざとそれをトリガーするリクエストを送って、Step Over と Step Into を実際に一通り操作し、両者の違いを体感しましょう。</span>

## 小测验 ／ 小テスト

1. 500 错误和 400 错误的本质区别是什么？<br><span class="ja-inline">🇯🇵 500 エラーと 400 エラーの本質的な違いは何ですか？</span>
2. 面对一段很长的异常堆栈，应该优先看哪一行？<br><span class="ja-inline">🇯🇵 長い例外スタックに直面したとき、優先して見るべきはどの行ですか？</span>
3. Step Over 和 Step Into 的区别是什么？<br><span class="ja-inline">🇯🇵 Step Over と Step Into の違いは何ですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 400 表示请求本身（参数、格式）有问题，责任通常在调用方；500 表示服务器代码内部执行出现了异常，责任在服务器这一端的代码。<br><span class="ja-inline">🇯🇵 400 はリクエスト自体（パラメータ、形式）に問題があることを示し、責任は通常呼び出し側にあります。500 はサーバーのコード内部の実行で例外が発生したことを示し、責任はサーバー側のコードにあります。</span>
2. 优先看堆栈里最上面那一行属于自己项目包名的代码，那通常就是异常真正发生的位置。<br><span class="ja-inline">🇯🇵 スタックの中で自分のプロジェクトのパッケージ名に属する一番上の行を優先して見ます。それが通常、例外が実際に発生した場所です。</span>
3. Step Over 会执行完当前行后停在下一行，不会进入当前行调用的方法内部；Step Into 则会跳进被调用方法内部，从其第一行开始继续单步执行。<br><span class="ja-inline">🇯🇵 Step Over は現在の行を実行し終えたら次の行で停止し、現在の行が呼び出しているメソッドの内部には入りません。Step Into は呼び出されたメソッドの内部にジャンプし、その最初の行からステップ実行を続けます。</span>
</details>

## 本章总结 ／ 本章のまとめ
你认识了开发中最常见的一批报错类型和大致排查思路，也学会了用 IDEA 的断点、Step Over、Step Into 和 Variables 面板去实际定位问题，而不是靠猜测改代码。下一章我们学习基础的自动化测试，把"手动一遍遍点 Postman"这件事逐步交给代码去做。

> 🇯🇵 開発でよく見られる一連のエラーの種類とおおよそのトラブルシューティングの考え方を理解し、IDEA の断点、Step Over、Step Into、Variables パネルを使って推測ではなく実際に問題を特定する方法も学びました。次の章では基礎的な自動化テストを学び、「手動で何度も Postman をクリックする」という作業を徐々にコードに任せていきます。
