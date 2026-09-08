# 第 14 章　MVC 模式（经典 + 现代分层） ／ 第14章　MVCパターン（古典＋現代の階層構造）

## 本章目标 ／ 本章の目標
理解经典 MVC 模式里 Model、View、Controller 三者各自的职责；理解现代 Spring Boot 项目里更细致的分层方式 Controller → Service → Mapper/Repository → Database；搞清楚经典 MVC 的 Model 并不等于一个单独的类，而是被进一步拆分成了 Service、Mapper、Entity/DTO。

> 🇯🇵 古典的なMVCパターンにおけるModel（モデル）、View（ビュー）、Controller（コントローラー）それぞれの責務を理解します。現代のSpring Bootプロジェクトにおける、より細かい階層構造 Controller → Service → Mapper/Repository → Database を理解します。古典的MVCのModelは1つの単独のクラスに相当するわけではなく、Service、Mapper、Entity/DTOにさらに分割されていることを明らかにします。

## 一句话理解 ／ 一言で理解する
MVC 就是"谁负责接请求、谁负责管数据和业务规则、谁负责组织展示"分得清清楚楚的一种代码组织方式；现代 Web 项目在这个基础上，把"管数据和业务规则"这一部分又拆得更细。

> 🇯🇵 MVCとは、「誰がリクエストを受け付け、誰がデータと業務ルールを管理し、誰が表示を組み立てるか」をはっきりと分けるコードの組織の仕方です。現代のWebプロジェクトはこれを基礎として、「データと業務ルールを管理する」部分をさらに細かく分割しています。

## 为什么需要它 ／ なぜ必要なのか
上一章我们看到了不分层带来的问题：一个方法里既取参数、又校验、又处理业务、又拼页面，改一处影响一片。MVC 就是解决这个问题的经典方案——它的核心思想很简单：**把不同职责的代码放到不同的地方，各自只关心自己该关心的事**。理解了 MVC，你才能理解为什么 Spring Boot 项目里代码要分成 `controller`、`service`、`mapper` 这几个包，而不是把所有代码堆在一个类里。

> 🇯🇵 前の章では、階層分けをしないことによる問題を見ました——1つのメソッドの中でパラメータを取得し、検証もし、業務処理もし、ページ組み立てもしていて、1箇所を変更すると広範囲に影響が及びます。MVCはこの問題を解決するための古典的な方法です——その核心的な考え方はシンプルです：**異なる責務のコードを異なる場所に置き、それぞれが自分が関心を持つべきことだけに集中する**。MVCを理解して初めて、なぜSpring Bootプロジェクトのコードが `controller`、`service`、`mapper` といったパッケージに分かれているのか、なぜすべてのコードを1つのクラスに積み上げないのかを理解できます。

## 核心概念 ／ コアコンセプト

### 经典 MVC 三要素 ／ 古典的MVCの3要素

| 角色 ／ 役割 | 职责 ／ 責務 | 类比 ／ たとえ |
|---|---|---|
| Model（模型） | 管理数据和业务规则：数据长什么样、业务逻辑该怎么处理<br><span class="ja-inline">🇯🇵 データと業務ルールを管理する：データがどんな形をしているか、業務ロジックをどう処理すべきか </span>| 后厨——准备食材、按菜谱做菜<br><span class="ja-inline">🇯🇵 厨房——食材を準備し、レシピ通りに料理を作る </span>|
| View（视图） | 负责把数据展示给用户看，只管"怎么呈现"，不管"数据从哪来、逻辑怎么算"<br><span class="ja-inline">🇯🇵 データをユーザーに表示する役割を担う。「どう見せるか」だけを考え、「データがどこから来るか、ロジックがどう計算されるか」は関知しない </span>| 摆盘——把做好的菜端上桌，摆得好看<br><span class="ja-inline">🇯🇵 盛り付け——出来上がった料理を食卓に運び、きれいに盛り付ける </span>|
| Controller（控制器） | 接收请求，决定调用 Model 的哪部分逻辑，再决定用哪个 View 展示结果<br><span class="ja-inline">🇯🇵 リクエストを受け取り、Modelのどの部分のロジックを呼び出すかを決め、さらにどのViewで結果を表示するかを決める </span>| 服务员——接收顾客点单，喊后厨做菜，再把菜端给顾客<br><span class="ja-inline">🇯🇵 店員——お客様の注文を受け、厨房に料理を頼み、できた料理をお客様に運ぶ </span>|

三者的协作关系：

> 🇯🇵 3者の連携関係は次の通りです。

```
用户操作
   │
   ▼
Controller（接收请求，决定找谁处理）
   │
   ▼
Model（执行业务逻辑，处理/获取数据）
   │
   ▼
Controller（拿到 Model 处理的结果）
   │
   ▼
View（把结果组织成用户能看懂的样子）
   │
   ▼
返回给用户
```

### 现代 Spring Boot 项目里的分层 ／ 現代のSpring Bootプロジェクトにおける階層構造

经典 MVC 提出的年代，"Model"这一层还比较笼统——业务逻辑、数据访问，甚至数据结构定义，都可能一股脑塞在这一层里。到了现代企业级 Spring Boot 项目，"Model"这一层被进一步拆细，形成了更常见的四层结构：

> 🇯🇵 古典的MVCが提唱された時代には、「Model」という層はまだかなり大まかなものでした——業務ロジック、データアクセス、さらにはデータ構造の定義までもが、まとめてこの層に詰め込まれることがありました。現代のエンタープライズ向けSpring Bootプロジェクトでは、「Model」層はさらに細かく分割され、より一般的な4層構造になっています。

| 层 ／ 層 | 对应经典 MVC 里的角色 ／ 古典的MVCでの対応する役割 | 职责 ／ 責務 |
|---|---|---|
| Controller | Controller | 接收 HTTP 请求，读取参数，调用 Service，把结果返回给客户端（通常是 JSON，不再是拼 HTML 页面）<br><span class="ja-inline">🇯🇵 HTTPリクエストを受け取り、パラメータを読み取り、Serviceを呼び出し、結果をクライアントに返す（通常はJSONであり、もうHTMLページを組み立てることはない） </span>|
| Service | Model 的一部分<br><span class="ja-inline">🇯🇵 Modelの一部分 </span>| 处理业务逻辑：这件事该怎么做、要做哪些判断、要按什么顺序调用哪些方法<br><span class="ja-inline">🇯🇵 業務ロジックを処理する：このことをどう行うべきか、どんな判断が必要か、どの順序でどのメソッドを呼ぶべきか </span>|
| Mapper / Repository | Model 的一部分<br><span class="ja-inline">🇯🇵 Modelの一部分 </span>| 负责和数据库打交道：执行 SQL、把数据库里的行数据变成 Java 对象<br><span class="ja-inline">🇯🇵 データベースとのやり取りを担当する：SQLを実行し、データベースの行データをJavaオブジェクトに変換する </span>|
| Entity / DTO | Model 的一部分<br><span class="ja-inline">🇯🇵 Modelの一部分 </span>| 定义数据的结构长什么样（Entity 对应数据库表结构，DTO 用于层与层之间传递数据）<br><span class="ja-inline">🇯🇵 データの構造がどんな形かを定義する（Entityはデータベースのテーブル構造に対応し、DTOは層と層の間でデータをやり取りするために使う） </span>|
| Database | —— | 真正存放数据的地方，MVC 模式本身不包含这一层，但现代 Web 项目几乎都离不开它<br><span class="ja-inline">🇯🇵 実際にデータを格納する場所。MVCパターン自体にはこの層は含まれないが、現代のWebプロジェクトはほぼ例外なくこれに頼っている </span>|

**关键结论：经典 MVC 的 Model 并不等于一个单独的 Service 类。** 现代企业项目会把 Model 这一层继续拆分为 **Service（业务逻辑）+ Mapper（数据库访问）+ Entity/DTO（数据结构）**——这三部分合起来，才对应经典 MVC 里"Model"这一个角色所承担的全部职责。至于 View，在现代前后端分离的项目里，后端通常不再负责拼页面，而是直接返回 JSON 数据，页面展示交给前端框架去做（这也是为什么第 10 章讲 HTTP 时，响应体举的例子是 JSON 而不是 HTML）。

> 🇯🇵 **重要な結論：古典的MVCのModelは、1つの単独のServiceクラスに相当するわけではありません。** 現代のエンタープライズプロジェクトでは、Model層をさらに **Service（業務ロジック）＋Mapper（データベースアクセス）＋Entity/DTO（データ構造）** に分割します——この3つの部分が合わさって初めて、古典的MVCの「Model」という1つの役割が担うすべての責務に対応します。Viewについては、現代のフロントエンド・バックエンド分離のプロジェクトでは、バックエンドは通常もうページを組み立てず、直接JSONデータを返し、ページ表示はフロントエンドのフレームワークに任せます（これが、第10章でHTTPを説明したときに、レスポンスボディの例としてHTMLではなくJSONを挙げた理由でもあります）。

## 图解 ／ 図解

先看完整的现代分层调用链（这张图和全教程的"调用链要求"是同一张图，本章只截取和分层相关的部分）：

> 🇯🇵 まず現代の一通りのレイヤー構成の呼び出し連鎖を見てみましょう（この図は本チュートリアル全体の「呼び出し連鎖の要求」と同じ図で、本章では階層構造に関連する部分だけを抜粋しています）。

```
Browser
  ↓ HTTP Request
Tomcat
  ↓
DispatcherServlet（后面第 20 章详细讲，先知道它是统一入口）
  ↓
Controller       ← 只做：接参数、调用 Service、返回结果
  ↓
Service          ← 只做：业务逻辑判断和处理
  ↓
Mapper           ← 只做：和数据库打交道
  ↓
MySQL
  ↓（结果原路返回）
Mapper → Service → Controller
  ↓
HttpMessageConverter / Jackson（Java 对象 → JSON，第 21 章详细讲）
  ↓ HTTP Response
Browser
```

再对比一下"该有的分层"和"塞满业务逻辑的 Controller"，看看为什么后者是一种不好的写法：

> 🇯🇵 さらに「あるべき階層構造」と「業務ロジックを詰め込みすぎたController」を比較して、後者がなぜ良くない書き方なのかを見てみましょう。

```
❌ 反例：所有逻辑都堆在 Controller 里
┌─────────────────────────────────────┐
│ UserController                       │
│  - 接收请求参数                       │
│  - 手动校验参数格式                    │
│  - 拼 SQL 语句                        │
│  - 直接操作数据库连接                  │
│  - 处理业务规则（比如"余额不足不能下单"）│
│  - 组装返回结果                        │
└─────────────────────────────────────┘
问题：这个类什么都干，改一处容易牵连全部，
     也没法把"业务逻辑"单独拿出来复用或测试。

✅ 正例：职责分给不同的层
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ UserController │──▶│  UserService   │──▶│  UserMapper    │
│ 接参数、调用     │   │ 业务逻辑判断     │   │  和数据库打交道 │
│ Service、返回   │   │ （比如余额校验） │   │  （执行 SQL）  │
└───────────────┘   └───────────────┘   └───────────────┘
```

## 最小示例 ／ 最小限のサンプル

这里只用没有具体框架注解的伪代码，展示"分层之后代码大概长什么样"，重点体会**每一层只关心自己该关心的事**（具体的 `@RestController`、`@Service`、`@Mapper` 等 Spring 注解会在第 15 章之后陆续学到，这里先不使用真实注解，避免提前引入尚未学习的概念）：

> 🇯🇵 ここでは具体的なフレームワークのアノテーションを使わない擬似コードで、「階層分けした後のコードがだいたいどんな形になるか」を示し、**各層が自分の関心事だけに集中する**ことを重点的に体感してもらいます（具体的な `@RestController`、`@Service`、`@Mapper` などのSpringアノテーションは第15章以降で順に学びます。ここではまだ学んでいない概念を先取りしないよう、実際のアノテーションは使いません）。

```java
// Controller 层：只负责接请求、调用 Service、返回结果
class UserController {
    UserService userService; // 从哪里来的，后面第 15、16 章讲 IoC/DI 时详细说明

    Object getUser(String id) {
        User user = userService.findById(id);
        return user; // 交给框架转成 JSON 返回，具体机制第 21 章讲
    }
}

// Service 层：只负责业务逻辑
class UserService {
    UserMapper userMapper;

    User findById(String id) {
        // 这里可以放业务判断，比如"id 格式是否合法"、"是否需要脱敏处理"等
        return userMapper.selectById(id);
    }
}

// Mapper 层：只负责和数据库打交道
interface UserMapper {
    User selectById(String id); // 具体怎么只写接口就能查数据库，第 27 章 MyBatis 会详细讲
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `UserController`：只做三件事——接收参数（这里是 `id`）、调用 `userService.findById(id)`、把结果返回。它完全不知道数据是从数据库查出来的，还是从内存缓存里拿的，这正是分层的意义：**Controller 不需要关心数据从哪来，只需要知道找 Service 要**。<br><span class="ja-inline">🇯🇵 `UserController`：3つのことしかしません——パラメータ（ここでは `id`）を受け取ること、`userService.findById(id)` を呼び出すこと、結果を返すことです。データがデータベースから検索されたものなのか、メモリキャッシュから取得されたものなのか、まったく関知しません。これこそが階層分けの意義です——**Controllerはデータがどこから来るか気にする必要はなく、Serviceに頼めばよいと分かっていればよいのです**。</span>
- `UserService`：这一层放的是"业务逻辑"，示例里只写了一句注释说明它可以放什么判断（真正的业务规则会随项目不同而不同）。它调用 `userMapper.selectById(id)` 来拿到原始数据，本身不关心 SQL 怎么写。<br><span class="ja-inline">🇯🇵 `UserService`：この層に置くのは「業務ロジック」です。サンプルではどんな判断を置けるかをコメントで1行示しているだけです（実際の業務ルールはプロジェクトによって異なります）。`userMapper.selectById(id)` を呼び出して元のデータを取得しますが、SQLがどう書かれているかは気にしません。</span>
- `UserMapper`：只是一个接口，声明了"能按 id 查用户"这个能力，具体怎么执行 SQL、怎么和数据库连接，它自己完全不管——这背后的原理（为什么只写 interface 就能工作）留到第 27 章 MyBatis 部分详细讲，这里先记住一句话："Mapper 层负责和数据库打交道，Service 不需要知道细节"。<br><span class="ja-inline">🇯🇵 `UserMapper`：単なるインターフェースであり、「idでユーザーを検索できる」という能力を宣言しているだけです。具体的にどうSQLを実行するか、どうデータベースと接続するかは、それ自身はまったく関知しません——この背後にある原理（なぜインターフェースだけ書けば動くのか）は第27章のMyBatisの部分で詳しく説明します。ここでは「Mapper層はデータベースとのやり取りを担当し、Serviceは詳細を知る必要がない」ということだけ覚えておいてください。</span>

本章示例刻意没有使用任何 Spring 注解（比如 `@RestController`、`@Autowired`），因为这些内容属于后面第 15～21 章的知识点，这里只是借用类名和调用关系来说明"分层"这个概念本身，不要把这段伪代码当作可以直接运行的完整项目。

> 🇯🇵 本章のサンプルは意図的にSpringのアノテーション（例えば `@RestController`、`@Autowired`）を一切使っていません。これらの内容は後の第15～21章の知識点に属するからです。ここではクラス名と呼び出し関係を借りて「階層分け」という概念自体を説明しているだけであり、この擬似コードをそのまま実行できる完全なプロジェクトとして扱わないでください。

## 程序运行过程 ／ プログラムの実行の流れ

结合上面的伪代码，按"调用链要求"里和本章相关的问题梳理一遍（完整版本的答案要等学完 Spring MVC、MyBatis 之后才能完全讲清楚，这里先建立整体印象）：

> 🇯🇵 上記の擬似コードと合わせて、「呼び出し連鎖の要求」の中で本章に関連する問いを整理してみましょう（完全な答えはSpring MVCとMyBatisを学び終えてから初めてはっきり説明できます。ここではまず全体的な印象を持っておきます）。

1. **请求怎么找到这个 Controller**：这是第 20 章 `DispatcherServlet` 要详细回答的问题，本章先只需要知道"分层之后，请求最终会被转交到 Controller 层的某个方法里"。<br><span class="ja-inline">🇯🇵 **リクエストはどうやってこのControllerを見つけるか**：これは第20章の `DispatcherServlet` で詳しく答える問題です。本章ではまず「階層分けした後、リクエストは最終的にControllerの層のあるメソッドに引き渡される」ということだけ知っておけば十分です。</span>
2. **Service 从哪里来的**：示例里 `UserController` 直接声明了一个 `UserService` 类型的字段，真正在 Spring 项目里，这个对象不是自己 `new` 出来的，而是由 Spring 容器创建并"注入"进来的——具体怎么做到，第 15、16 章会详细讲 IoC 和 DI。<br><span class="ja-inline">🇯🇵 **Serviceはどこから来るのか**：サンプルでは `UserController` が直接 `UserService` 型のフィールドを宣言していますが、実際のSpringプロジェクトでは、このオブジェクトは自分で `new` するのではなく、Springコンテナが作成して「注入」してくれます——具体的にどう実現するかは、第15、16章でIoC（Inversion of Control、制御の反転）とDI（Dependency Injection、依存性注入）を詳しく説明します。</span>
3. **Mapper 为什么只有 interface 也能工作**：这是第 27 章 MyBatis 部分才会揭晓的机制，这里只需要记住：Mapper 层对外表现为一个接口，Service 只管调用它声明的方法，不需要关心它内部是怎么实现的。<br><span class="ja-inline">🇯🇵 **Mapperがなぜinterfaceだけでも動作するのか**：これは第27章のMyBatisの部分で初めて明らかになる仕組みです。ここでは、Mapper層は外部からはインターフェースとして見え、Serviceはそれが宣言したメソッドを呼び出すだけで、内部でどう実装されているかを気にする必要はない、ということだけ覚えておいてください。</span>
4. 分层之后，一条请求的处理过程大致是：Controller 收到请求 → 调用 Service 处理业务 → Service 调用 Mapper 查数据 → 数据原路返回 → Controller 把结果交给框架转换和返回。<br><span class="ja-inline">🇯🇵 階層分けした後、1つのリクエストの処理の流れはおおよそ次のようになります：Controllerがリクエストを受け取る → Serviceを呼び出して業務を処理する → ServiceがMapperを呼び出してデータを検索する → データが元の経路で返ってくる → Controllerが結果をフレームワークに渡して変換・返却する。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| Controller 方法里直接写大段 `if-else` 业务判断<br><span class="ja-inline">🇯🇵 Controllerのメソッドに直接大量の `if-else` の業務判断を書く </span>| 没有把业务逻辑下沉到 Service 层，图省事直接写在 Controller 里<br><span class="ja-inline">🇯🇵 業務ロジックをService層に落とし込まず、手間を省くために直接Controllerに書いている </span>| 把判断逻辑移到 Service 方法里，Controller 只负责调用<br><span class="ja-inline">🇯🇵 判断ロジックをServiceのメソッドに移動し、Controllerは呼び出しだけを担当する </span>|
| Controller 直接拼 SQL 或直接操作数据库连接<br><span class="ja-inline">🇯🇵 Controllerが直接SQLを組み立てたり、データベース接続を直接操作したりする </span>| 跳过了 Mapper 层，Controller 承担了数据访问层的职责<br><span class="ja-inline">🇯🇵 Mapper層を飛ばしてしまい、Controllerがデータアクセス層の責務を負ってしまっている </span>| 数据访问统一放到 Mapper 层，Controller/Service 都不应该直接写 SQL<br><span class="ja-inline">🇯🇵 データアクセスは統一してMapper層に置き、Controller/Serviceはどちらも直接SQLを書くべきではない </span>|
| 认为 Model 就是"一个叫 Model 的类"<br><span class="ja-inline">🇯🇵 Modelとは「Modelという名前のクラス」のことだと考える </span>| 把经典 MVC 的术语直接照搬到现代项目里找同名类<br><span class="ja-inline">🇯🇵 古典的MVCの用語をそのまま現代のプロジェクトに当てはめ、同名のクラスを探そうとする </span>| 理解 Model 是一类职责的统称，现代项目里它被拆成了 Service + Mapper + Entity/DTO，不会有一个类真的叫 `Model`<br><span class="ja-inline">🇯🇵 Modelは一種の責務の総称であり、現代のプロジェクトではService＋Mapper＋Entity/DTOに分割されていて、`Model` という名前のクラスが実際に存在するわけではないと理解する </span>|
| 把所有数据结构都塞进同一个类里传来传去<br><span class="ja-inline">🇯🇵 すべてのデータ構造を同じクラスに詰め込んでやり取りする </span>| 没有区分数据库结构（Entity）和层间传递的数据结构（DTO）<br><span class="ja-inline">🇯🇵 データベース構造（Entity）と層間で受け渡しするデータ構造（DTO）を区別していない </span>| Entity 对应数据库表，DTO 用于对外传递数据，两者的区分和命名边界会在第 30 章详细展开<br><span class="ja-inline">🇯🇵 Entityはデータベースのテーブルに対応し、DTOは外部にデータを渡すために使う。両者の区別と命名の境界は第30章で詳しく展開する </span>|

## 动手练习 ／ 演習

1. 用自己的话解释一下："为什么现代 Spring Boot 项目不会有一个类叫 `Model.java`？"<br><span class="ja-inline">🇯🇵 自分の言葉で説明してみましょう：「なぜ現代のSpring Bootプロジェクトには `Model.java` という名前のクラスがないのか？」</span>
2. 参照本章"正例"分层图，给"查询商品详情"这个功能画出对应的 Controller/Service/Mapper 三层调用图。<br><span class="ja-inline">🇯🇵 本章の「正しい例」の階層図を参考に、「商品詳細の検索」機能に対応するController/Service/Mapperの3層の呼び出し図を描いてみましょう。</span>
3. 找一个你听说过的开源 Java Web 项目（或者回忆一下上一章的例子），思考：如果它没有做分层，会遇到哪些具体问题？<br><span class="ja-inline">🇯🇵 聞いたことのあるオープンソースのJava Webプロジェクトを1つ選ぶか（あるいは前章の例を思い出して）、もし階層分けをしていなかったら、どんな具体的な問題に直面するか考えてみましょう。</span>

## 小测验 ／ 小テスト

1. 经典 MVC 的三要素分别是什么，各自负责什么？<br><span class="ja-inline">🇯🇵 古典的MVCの3要素はそれぞれ何ですか、それぞれ何を担当していますか？</span>
2. 现代 Spring Boot 项目里，经典 MVC 的 Model 被拆成了哪几部分？<br><span class="ja-inline">🇯🇵 現代のSpring Bootプロジェクトでは、古典的MVCのModelはどのいくつかの部分に分割されていますか？</span>
3. Controller 层应不应该直接写大量业务判断逻辑？为什么？<br><span class="ja-inline">🇯🇵 Controller層は大量の業務判断ロジックを直接書くべきですか？それはなぜですか？</span>
4. 现代前后端分离项目里，View 这一层通常发生了什么变化？<br><span class="ja-inline">🇯🇵 現代のフロントエンド・バックエンド分離のプロジェクトでは、View層に通常どんな変化が起きていますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. Model 负责管理数据和业务规则，View 负责把数据展示给用户，Controller 负责接收请求并协调 Model 和 View。<br><span class="ja-inline">🇯🇵 Modelはデータと業務ルールの管理を担当し、Viewはデータをユーザーに表示することを担当し、Controllerはリクエストを受け取りModelとViewを調整することを担当します。</span>
2. 被拆成 Service（业务逻辑）+ Mapper/Repository（数据库访问）+ Entity/DTO（数据结构定义）。<br><span class="ja-inline">🇯🇵 Service（業務ロジック）＋Mapper/Repository（データベースアクセス）＋Entity/DTO（データ構造の定義）に分割されています。</span>
3. 不应该。Controller 应该只负责接收请求、调用 Service、返回结果，业务判断逻辑应该下沉到 Service 层，这样职责清晰，也方便复用和维护。<br><span class="ja-inline">🇯🇵 書くべきではありません。Controllerはリクエストの受け取り、Serviceの呼び出し、結果の返却だけを担当すべきで、業務判断ロジックはService層に落とし込むべきです。そうすることで責務が明確になり、再利用や保守もしやすくなります。</span>
4. 后端通常不再负责拼 HTML 页面，而是直接返回 JSON 数据，页面展示交给前端框架处理，"View"这一层的概念在前后端分离架构里更多体现在前端而不是后端代码中。<br><span class="ja-inline">🇯🇵 バックエンドは通常もうHTMLページを組み立てず、直接JSONデータを返し、ページ表示はフロントエンドのフレームワークが処理します。「View」層という概念は、フロントエンド・バックエンド分離のアーキテクチャでは、バックエンドのコードよりもむしろフロントエンドに多く反映されています。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了经典 MVC 的三要素，以及现代 Spring Boot 项目如何把 Model 进一步拆分为 Service、Mapper、Entity/DTO 这几层，也明白了 Controller 不应该塞入大量业务逻辑。至此，"Web 通信原理"这一阶段的核心概念都已经讲完，接下来的阶段复习会帮你把 HTTP、Servlet、Tomcat、MVC 这几块知识串成一张完整的地图。

> 🇯🇵 これで古典的MVCの3要素を理解し、現代のSpring Bootプロジェクトがどのように Modelを Service、Mapper、Entity/DTOといった層にさらに分割するかも理解し、Controllerに大量の業務ロジックを詰め込むべきではないことも分かりました。これで「Web通信の原理」というこの段階の核心的な概念はすべて説明し終えました。次の段階の復習では、HTTP、Servlet、Tomcat、MVCといった知識を1枚の完全な地図につなげる手助けをします。
