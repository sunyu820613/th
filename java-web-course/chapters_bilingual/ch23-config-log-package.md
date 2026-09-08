# 第 23 章　配置、日志与打包运行 ／ 第23章　設定・ログ・パッケージング実行

## 本章目标 ／ 本章の目標
理解 `application.yml` 的作用，以及为什么要区分开发环境和生产环境的配置（Spring Profile）；认识 SLF4J 和 Logback，学会用日志替代 `System.out.println()`；理解 `mvn package` 打包和 `java -jar` 运行的原理，知道为什么一个 jar 包就能跑起整个 Web 服务。

> 🇯🇵 `application.yml` の役割と、なぜ開発環境と本番環境の設定を分ける必要があるのか（Spring Profile、環境ごとの設定切り替え機構）を理解します。SLF4J（ログ出力のための統一インターフェース仕様）と Logback（そのデフォルト実装）を知り、`System.out.println()` の代わりにログを使えるようになります。`mvn package` によるパッケージングと `java -jar` による実行の仕組みを理解し、なぜ一つのjarファイルだけでWebサービス全体を動かせるのかを知ります。

## 一句话理解 ／ 一言で理解する
配置文件负责"把会变的东西挪到代码外面"，日志负责"给程序留一份可以分级查看的运行记录"，打包负责"把整个项目压缩成一个能独立运行的文件"。

> 🇯🇵 設定ファイルは「変化しうるものをコードの外に出す」役割を担い、ログは「プログラムにレベル分けして見られる実行記録を残す」役割を担い、パッケージングは「プロジェクト全体を単独で実行できる一つのファイルに圧縮する」役割を担います。

## 为什么需要它 ／ なぜ必要なのか
到目前为止，我们的项目里数据库密码（还没学到）、端口号这些信息，理论上都可以直接写死在 Java 代码里，程序照样能跑。但设想这样一个场景：你在自己电脑上开发时用的是本地环境，上线时要换成公司服务器的环境，两边的端口、以后要用到的数据库地址、密码完全不同。如果这些信息都写死在 `.java` 文件里，每次切换环境都要改代码、重新编译、重新打包——不仅麻烦，还容易改漏、改错，而且修改配置这种"运维层面的事情"要经过"改代码"这道门槛，对不熟悉这段代码的人来说很不友好。配置文件和 Profile 机制，就是用来解决这个问题的。

> 🇯🇵 これまでのところ、プロジェクトの中のデータベースパスワード（まだ学んでいません）やポート番号といった情報は、理論上はJavaコードに直接書き込んでしまっても、プログラムは変わらず動きます。しかし、こんな場面を想像してみてください。自分のパソコンで開発するときはローカル環境を使い、本番公開するときは会社のサーバー環境に切り替える必要があり、両者のポートや、今後使うことになるデータベースのアドレス・パスワードはまったく異なります。もしこれらの情報がすべて `.java` ファイルに書き込まれていたら、環境を切り替えるたびにコードを変更し、再コンパイルし、再パッケージングする必要があります——面倒なだけでなく、変更漏れや変更ミスも起きやすく、しかも設定変更という「運用レベルの作業」が「コードを変更する」というハードルを通らなければならず、このコードに詳しくない人には非常に不親切です。設定ファイルとProfile（プロファイル）の仕組みは、まさにこの問題を解決するためのものです。

日志和打包也是同样的道理：`System.out.println()` 能凑合用来调试，但没法支撑一个真实运行的项目；写好的代码总要变成一个能在服务器上跑起来的东西，这就要靠打包。

> 🇯🇵 ログとパッケージングも同じ理屈です。`System.out.println()` はデバッグには何とか使えますが、実際に稼働するプロジェクトを支えることはできません。書き上げたコードは最終的にサーバー上で動かせるものにする必要があり、それを実現するのがパッケージングです。

## 核心概念 ／ コアコンセプト

### 23.1 application.yml 是干什么的 ／ application.ymlは何をするものか

从第 18 章开始，我们的 Spring Boot 项目里就有一个 `src/main/resources/application.yml` 文件，之前主要用来配置端口号之类的简单信息。它的本质作用是：**把项目运行时需要、但又容易变化的信息，从 Java 代码里搬出来，集中放在一个配置文件里**。

> 🇯🇵 第18章から、私たちのSpring Bootプロジェクトには `src/main/resources/application.yml` というファイルがあり、これまでは主にポート番号のような簡単な情報を設定するために使ってきました。その本質的な役割は、**プロジェクトの実行時に必要だが変化しやすい情報を、Javaコードから取り出して、一つの設定ファイルにまとめて置く**ことです。

一个最基础的例子：

> 🇯🇵 最も基本的な例です。

```yaml
server:
  port: 8080
```

这行配置告诉 Spring Boot"用 8080 端口启动内嵌的 Tomcat"。如果哪天要换成 9090 端口，只需要改这一行配置，完全不用碰任何 `.java` 文件，也不需要重新编译代码。

> 🇯🇵 この設定行はSpring Bootに「8080ポートで内蔵Tomcatを起動する」ことを伝えています。いつか9090ポートに変える必要が出てきたら、この1行の設定を変更するだけでよく、`.java` ファイルには一切触れる必要がなく、コードを再コンパイルする必要もありません。

**反面例子**：假如你在代码里这样写：

> 🇯🇵 **反対の例**：もしコードの中に次のように書いていたとします。

```java
// 不推荐的写法：把配置写死在代码里
int port = 8080;
String dbPassword = "123456";
```

一旦要切换环境（比如上线到生产服务器，端口和密码都不一样），就得改这两行 Java 代码，重新 `javac` 编译、重新打包，才能生效。配置写死在代码里，"改配置"这件事就被绑架成了"改代码 + 重新编译"，这在真实项目里是不可接受的。

> 🇯🇵 いったん環境を切り替える必要が出てきたら（例えば本番サーバーに公開する際、ポートとパスワードが両方異なる）、このJavaコードの2行を変更し、再度 `javac` でコンパイルし、再パッケージングしなければ有効になりません。設定がコードに直接書き込まれていると、「設定を変更する」ことが「コードを変更して再コンパイルする」ことに縛り付けられてしまい、これは実際のプロジェクトでは受け入れられません。

### 23.2 Spring Profile：区分开发环境和生产环境 ／ Spring Profile：開発環境と本番環境の区別

真实项目至少要区分"开发环境（dev）"和"生产环境（prod）"——开发时连的是本地测试数据，上线后连的是真实数据库，两边配置必然不同。Spring Boot 提供了 **Profile（环境）** 机制来解决这个问题，做法是拆成多个配置文件：

> 🇯🇵 実際のプロジェクトでは少なくとも「開発環境（dev）」と「本番環境（prod）」を区別する必要があります——開発時に接続するのはローカルのテストデータで、公開後に接続するのは実際のデータベースであり、両者の設定は必然的に異なります。Spring Bootはこの問題を解決するために **Profile（環境）** の仕組みを提供しており、複数の設定ファイルに分割するというやり方を取ります。

```
application.yml         # 公共配置，所有环境都生效
application-dev.yml     # 开发环境专属配置
application-prod.yml    # 生产环境专属配置
```

在 `application.yml` 里指定当前激活哪个 Profile：

> 🇯🇵 `application.yml` の中で現在どのProfileを有効にするかを指定します。

```yaml
spring:
  profiles:
    active: dev
```

比如：

> 🇯🇵 例えば：

`application-dev.yml`
```yaml
server:
  port: 8080
```

`application-prod.yml`
```yaml
server:
  port: 80
```

把 `active` 改成 `prod`（或者启动时用参数 `--spring.profiles.active=prod` 覆盖），Spring Boot 就会去读 `application-prod.yml` 里的配置，其余代码完全不用动。**这正好解决了上面那个反例的问题**：环境要切换，只改一行配置或者启动参数即可，不需要重新编译代码。

> 🇯🇵 `active` を `prod` に変更すれば（または起動時にパラメータ `--spring.profiles.active=prod` で上書きすれば）、Spring Bootは `application-prod.yml` の設定を読みに行き、残りのコードは一切変更する必要がありません。**これはまさに上の反対例の問題を解決しています**：環境を切り替えたいときは、設定1行か起動パラメータを変更するだけでよく、コードを再コンパイルする必要はありません。

提前说一句：数据库密码、第三方服务的 API Key 这类真正敏感的信息，正式项目里通常还会用环境变量或者专门的配置中心来管理，不会直接明文写进 `application-prod.yml` 提交到代码仓库。这属于更进阶的实践，本教程后面涉及数据库配置时会再简单提一句，这里先理解"配置和代码分离""不同环境用不同配置文件"这两个核心思想即可。

> 🇯🇵 先に一言：データベースパスワードやサードパーティサービスのAPI Keyといった本当に機微な情報は、正式なプロジェクトでは通常、環境変数や専用の設定センターで管理し、平文のまま `application-prod.yml` に書いてコードリポジトリにコミットすることはしません。これはより進んだプラクティスであり、本チュートリアルでは後ほどデータベース設定に触れる際に改めて簡単に触れます。ここではまず「設定とコードの分離」「環境ごとに異なる設定ファイルを使う」という2つの核心的な考え方を理解しておけば十分です。

### 23.3 日志：SLF4J 与 Logback ／ ログ：SLF4JとLogback

到目前为止，我们调试代码基本靠 `System.out.println()`。这在小实验里没问题，但正式项目不会这么干，原因有几个：

> 🇯🇵 これまでのところ、私たちがコードをデバッグするのは基本的に `System.out.println()` に頼っていました。小さな実験ではこれで問題ありませんが、正式なプロジェクトではこうしません。理由がいくつかあります。

- **不能分级**：`println` 打印出来的所有内容长得都一样，分不清哪些是"仅供调试看看"的信息，哪些是"出大问题了"的报错。<br><span class="ja-inline">🇯🇵 **レベル分けができない**：`println` で出力される内容はすべて同じように見え、「デバッグのために見るだけ」の情報なのか、「大問題が起きた」というエラーなのかを区別できません。</span>
- **不好定位输出位置**：一堆 `println` 混在控制台里，很难一眼看出这行输出是哪个类、哪一行代码打的。<br><span class="ja-inline">🇯🇵 **出力箇所を特定しにくい**：大量の `println` がコンソールに混ざっていると、この出力行がどのクラスの、どの行のコードが出したものか一目で分かりにくいです。</span>
- **无法灵活开关**：想在生产环境只看警告和错误、不看调试信息，`println` 做不到"按级别过滤"这件事，只能一个个删掉或者注释掉代码。<br><span class="ja-inline">🇯🇵 **柔軟にオン/オフできない**：本番環境では警告とエラーだけ見て、デバッグ情報は見たくないと思っても、`println` は「レベルでフィルタリングする」ことができず、一つずつコードを削除するかコメントアウトするしかありません。</span>
- **生产环境不便管理**：正式的日志框架能做到"自动按天分文件、自动删旧日志、同时输出到控制台和文件"这些能力，`println` 完全没有。<br><span class="ja-inline">🇯🇵 **本番環境での管理が不便**：正式なログフレームワークは「日ごとに自動でファイルを分ける」「古いログを自動で削除する」「コンソールとファイルの両方に同時出力する」といった能力を持っていますが、`println` にはそれらがまったくありません。</span>

Spring Boot 里日志分成两部分：

> 🇯🇵 Spring Bootの中では、ログは2つの部分に分かれています。

- **SLF4J**：一套"接口规范"，定义了 `logger.debug(...)`、`logger.info(...)` 这些统一的写法，本身不负责真正把日志写出来。<br><span class="ja-inline">🇯🇵 **SLF4J**：「インターフェース仕様」の一式であり、`logger.debug(...)`、`logger.info(...)` といった統一された書き方を定めていますが、それ自体は実際にログを出力する責任を負いません。</span>
- **Logback**：Spring Boot 默认使用的日志"实现"，真正负责把日志格式化并输出到控制台或文件。<br><span class="ja-inline">🇯🇵 **Logback**：Spring Bootがデフォルトで使うログの「実装」であり、実際にログをフォーマットしてコンソールやファイルに出力する役割を担います。</span>

你在代码里只需要面向 SLF4J 的接口写代码，Spring Boot 已经帮你把 Logback 配好了，开箱即用，不需要额外引入依赖。

> 🇯🇵 コードの中ではSLF4Jのインターフェースに向けてコードを書くだけでよく、Spring Bootはすでに Logback を設定済みなので、そのまますぐに使え、追加で依存関係を導入する必要もありません。

日志分为四个常用级别，从"最不严重"到"最严重"：

> 🇯🇵 ログには4つのよく使うレベルがあり、「最も軽い」ものから「最も重い」ものへと並んでいます。

| 级别 ／ レベル | 含义 ／ 意味 | 典型用途 ／ 典型的な用途 |
|---|---|---|
| `DEBUG` | 调试信息<br><span class="ja-inline">🇯🇵 デバッグ情報 </span>| 开发阶段想看的细节，比如某个变量的具体值，生产环境通常关闭<br><span class="ja-inline">🇯🇵 開発段階で見たい詳細情報。例えばある変数の具体的な値など。本番環境では通常無効にする </span>|
| `INFO` | 正常的关键流程信息<br><span class="ja-inline">🇯🇵 正常な重要フローの情報 </span>| 比如"服务启动成功""用户下单成功"，记录系统正常运行的关键节点<br><span class="ja-inline">🇯🇵 例えば「サービス起動成功」「ユーザーの注文成功」など、システムが正常に稼働している重要なポイントを記録する </span>|
| `WARN` | 警告，还没出错但值得注意<br><span class="ja-inline">🇯🇵 警告。まだエラーではないが注意すべきもの </span>| 比如"这个接口用了过时的旧版本参数"，程序还能继续跑，但有隐患<br><span class="ja-inline">🇯🇵 例えば「このインターフェースは古いバージョンのパラメータを使っている」など、プログラムはまだ動き続けられるが潜在的なリスクがある </span>|
| `ERROR` | 出错了<br><span class="ja-inline">🇯🇵 エラーが発生した </span>| 比如捕获到一个异常，需要人工关注和排查<br><span class="ja-inline">🇯🇵 例えば例外を捕捉した場合など、人が注目して調査する必要がある </span>|

最小示例：

> 🇯🇵 最小限のサンプル：

```java
package com.example.userapi.service;

import com.example.userapi.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    // 面向 SLF4J 接口编程，Logback 是背后真正干活的实现
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    public User create(User user) {
        logger.info("准备新增用户，姓名：{}", user.getName());
        // ... 实际创建逻辑
        logger.debug("用户详细数据：{}", user);
        return user;
    }
}
```

- `LoggerFactory.getLogger(UserService.class)`：创建一个和当前类绑定的 `Logger`，日志输出时会自动带上类名，这就解决了"不好定位输出位置"的问题——一看日志就知道是哪个类打的。<br><span class="ja-inline">🇯🇵 `LoggerFactory.getLogger(UserService.class)`：現在のクラスに紐づいた `Logger` を作成します。ログ出力時に自動的にクラス名が付くようになり、これが「出力箇所を特定しにくい」という問題を解決します——ログを見ればどのクラスが出力したものかすぐに分かります。</span>
- `logger.info("...：{}", user.getName())`：`{}` 是占位符，会被后面的参数依次替换，效果类似字符串拼接，但性能更好、写法更清晰。<br><span class="ja-inline">🇯🇵 `logger.info("...：{}", user.getName())`：`{}` はプレースホルダーで、後ろに続く引数によって順に置き換えられます。効果としては文字列連結に似ていますが、性能が良く、書き方もより明快です。</span>
- 生产环境可以只开 `INFO` 及以上级别（`INFO`、`WARN`、`ERROR`），`DEBUG` 不会输出，不需要删代码，只改配置即可——这就是"能灵活开关"的体现。<br><span class="ja-inline">🇯🇵 本番環境では `INFO` 以上のレベル（`INFO`、`WARN`、`ERROR`）だけを有効にすることができ、`DEBUG` は出力されません。コードを削除する必要はなく、設定を変更するだけでよいです——これが「柔軟にオン/オフできる」ことの表れです。</span>

### 23.4 打包与运行：mvn package 和 java -jar ／ パッケージングと実行：mvn package と java -jar

写完代码只是第一步，最终要让程序在服务器上真正跑起来，这一步靠 Maven 打包完成。

> 🇯🇵 コードを書き終えるのは最初のステップに過ぎず、最終的にはプログラムをサーバー上で実際に動かす必要があります。このステップは Maven のパッケージングによって完了します。

**打包过程**：在项目根目录执行

> 🇯🇵 **パッケージングの過程**：プロジェクトのルートディレクトリで実行します。

```bash
mvn package
```

Maven 会依次做这些事：编译所有 `.java` 源文件成 `.class` 字节码、运行测试（如果有的话）、把编译好的字节码、`resources` 目录下的配置文件、以及项目依赖的所有第三方库，全部打进一个文件里，生成在 `target/` 目录下，比如 `user-api-memory-0.0.1-SNAPSHOT.jar`。

> 🇯🇵 Mavenは順に以下のことを行います：すべての `.java` ソースファイルを `.class` バイトコードにコンパイルする、テストを実行する（あれば）、コンパイル済みのバイトコード、`resources` ディレクトリ下の設定ファイル、そしてプロジェクトが依存するすべてのサードパーティライブラリを、すべて一つのファイルにまとめて `target/` ディレクトリの下に生成します。例えば `user-api-memory-0.0.1-SNAPSHOT.jar` のようにです。

**运行方式**：

> 🇯🇵 **実行方法**：

```bash
java -jar target/user-api-memory-0.0.1-SNAPSHOT.jar
```

这一条命令就能把整个 Web 服务跑起来，控制台会打印出 Spring Boot 的启动日志，最后看到类似"Started ... in ... seconds"就说明启动成功了，可以直接用浏览器或 Postman 访问。

> 🇯🇵 この1つのコマンドだけでWebサービス全体を起動できます。コンソールにはSpring Bootの起動ログが表示され、最後に「Started ... in ... seconds」のようなメッセージが見えれば起動成功で、そのままブラウザやPostmanでアクセスできます。

**为什么一个 jar 包就能启动整个 Web 服务？** 关键在于"内嵌 Tomcat"这个设计。传统 Java Web 项目要先装一个独立的 Tomcat 服务器，再把项目打成 `.war` 包扔进 Tomcat 的目录里，由外部 Tomcat 来启动它——这意味着服务器上要单独安装、配置、维护一个 Tomcat。而 Spring Boot 项目里已经通过 `spring-boot-starter-webmvc` 依赖，把 Tomcat 作为一个普通的 Java 库打包进了同一个 jar 包里（这就是"内嵌 Tomcat"的含义）。`java -jar` 启动时，Spring Boot 会在程序内部用代码的方式创建并启动这个内嵌的 Tomcat，不需要你在服务器上单独部署一个外部 Tomcat——这也是"能不能把整个应用打成一个文件、丢到任何装了 Java 的机器上直接跑"这个能力的关键。

> 🇯🇵 **なぜ一つのjarファイルだけでWebサービス全体を起動できるのか？** 鍵となるのは「内蔵Tomcat」という設計です。従来のJava Webプロジェクトはまず独立したTomcatサーバーをインストールし、それからプロジェクトを `.war` パッケージにしてTomcatのディレクトリに投げ入れ、外部のTomcatに起動してもらう必要がありました——これはサーバー上に個別にTomcatをインストール・設定・保守する必要があることを意味します。一方Spring Bootプロジェクトでは、すでに `spring-boot-starter-webmvc` の依存を通じて、Tomcatを普通のJavaライブラリとして同じjarファイルにパッケージング済みです（これが「内蔵Tomcat」の意味です）。`java -jar` で起動すると、Spring Bootはプログラム内部でコードによってこの内蔵Tomcatを作成・起動します。サーバー上に外部のTomcatを個別にデプロイする必要はありません——これが「アプリケーション全体を一つのファイルにまとめて、Javaがインストールされているどんなマシンにでも投げ込んでそのまま動かせる」という能力の鍵でもあります。

## 图解 ／ 図解

```
源代码 + 配置文件 + 依赖库
        │  mvn package
        ▼
   xxx.jar（一个文件，包含代码 + 依赖 + 内嵌 Tomcat）
        │  java -jar xxx.jar
        ▼
JVM 启动
  → Spring Boot 启动流程开始
  → 内部代码创建并启动内嵌 Tomcat
  → Tomcat 监听配置文件里指定的端口（如 8080）
  → 控制台打印 "Started ... in ... seconds"
        ▼
   服务已就绪，可以接收浏览器 / Postman 的请求
```

## 最小示例 ／ 最小限のサンプル

`application.yml`：
```yaml
server:
  port: 8080

spring:
  application:
    name: user-api-memory
  profiles:
    active: dev
```

`application-dev.yml`：
```yaml
server:
  port: 8080

logging:
  level:
    com.example.userapi: debug
```

`application-prod.yml`：
```yaml
server:
  port: 80

logging:
  level:
    com.example.userapi: info
```

## 代码逐行解释 ／ コードの行ごとの解説

- `spring.application.name`：给应用起个名字，会出现在启动日志里，方便区分多个服务。<br><span class="ja-inline">🇯🇵 `spring.application.name`：アプリケーションに名前を付けます。起動ログに表示され、複数のサービスを区別しやすくなります。</span>
- `spring.profiles.active: dev`：告诉 Spring Boot 当前激活 `dev` 这个 Profile，启动时会自动去读 `application-dev.yml`，和公共的 `application.yml` 合并生效。<br><span class="ja-inline">🇯🇵 `spring.profiles.active: dev`：Spring Bootに現在 `dev` というProfileが有効であることを伝えます。起動時に自動的に `application-dev.yml` を読みに行き、共通の `application.yml` とマージして有効になります。</span>
- `logging.level.com.example.userapi: debug`：设置 `com.example.userapi` 这个包下所有类的日志级别为 `debug`，也就是 `DEBUG`/`INFO`/`WARN`/`ERROR` 都会输出——开发阶段想看细节，级别放宽一些。<br><span class="ja-inline">🇯🇵 `logging.level.com.example.userapi: debug`：`com.example.userapi` パッケージ配下のすべてのクラスのログレベルを `debug` に設定します。つまり `DEBUG`/`INFO`/`WARN`/`ERROR` がすべて出力されます——開発段階では詳細を見たいので、レベルを緩めにします。</span>
- `application-prod.yml` 里把日志级别改成 `info`：生产环境只输出 `INFO` 及以上级别，`DEBUG` 信息不会打印，减少不必要的日志量。<br><span class="ja-inline">🇯🇵 `application-prod.yml` ではログレベルを `info` に変更しています：本番環境では `INFO` 以上のレベルだけが出力され、`DEBUG` 情報は出力されず、不必要なログ量を減らします。</span>
- 两份环境配置的 `server.port` 不同：开发用 `8080`，生产假设用标准的 `80` 端口，切换只需要改 `active` 的值。<br><span class="ja-inline">🇯🇵 2つの環境設定の `server.port` は異なります：開発では `8080`、本番では標準の `80` ポートを使うと仮定しています。切り替えは `active` の値を変更するだけで済みます。</span>

## 程序运行过程 ／ プログラムの実行の流れ

以"打包并运行"为例，串一遍完整过程：

> 🇯🇵 「パッケージングして実行する」を例に、完全な流れを一通り追ってみましょう。

1. 开发者在项目根目录执行 `mvn package`。<br><span class="ja-inline">🇯🇵 開発者がプロジェクトのルートディレクトリで `mvn package` を実行します。</span>
2. Maven 依次编译 `src/main/java` 下所有 `.java` 文件成字节码，并把 `src/main/resources` 下的 `application.yml` 等配置文件一起收集起来。<br><span class="ja-inline">🇯🇵 Mavenは `src/main/java` 下のすべての `.java` ファイルを順にバイトコードにコンパイルし、`src/main/resources` 下の `application.yml` などの設定ファイルも一緒に収集します。</span>
3. Maven 把编译产物、配置文件，连同项目依赖的所有第三方库（包括内嵌 Tomcat 相关的库），一起打进 `target/xxx.jar`。<br><span class="ja-inline">🇯🇵 Mavenはコンパイル成果物、設定ファイル、そしてプロジェクトが依存するすべてのサードパーティライブラリ（内蔵Tomcat関連のライブラリを含む）を、一緒に `target/xxx.jar` にまとめます。</span>
4. 运维或开发者在目标机器上执行 `java -jar target/xxx.jar`。<br><span class="ja-inline">🇯🇵 運用担当者または開発者が目的のマシン上で `java -jar target/xxx.jar` を実行します。</span>
5. JVM 启动，加载这个 jar 包，找到 `main` 方法（也就是 `@SpringBootApplication` 标注的启动类里的 `main`）开始执行。<br><span class="ja-inline">🇯🇵 JVMが起動し、このjarファイルを読み込んで、`main` メソッド（つまり `@SpringBootApplication` が付いた起動クラスの中の `main`）を見つけて実行を始めます。</span>
6. Spring Boot 启动流程开始：扫描组件、创建各个 Bean（Controller、Service 等）、读取 `application.yml` 及当前激活 Profile 对应的配置文件。<br><span class="ja-inline">🇯🇵 Spring Bootの起動プロセスが始まります：コンポーネントをスキャンし、各Bean（Controller、Serviceなど）を作成し、`application.yml` と現在有効なProfileに対応する設定ファイルを読み込みます。</span>
7. Spring Boot 用代码的方式创建并启动内嵌 Tomcat，绑定配置文件里指定的端口。<br><span class="ja-inline">🇯🇵 Spring Bootはコードによって内蔵Tomcatを作成・起動し、設定ファイルで指定されたポートにバインドします。</span>
8. 控制台打印启动成功的日志，服务正式对外提供访问。<br><span class="ja-inline">🇯🇵 コンソールに起動成功のログが表示され、サービスが正式に外部からのアクセスを受け付けるようになります。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| `java -jar xxx.jar` 提示找不到主清单属性（no main manifest attribute） | 打包时没有用 `spring-boot-maven-plugin`，生成的是普通 jar 而不是可执行 jar<br><span class="ja-inline">🇯🇵 パッケージング時に `spring-boot-maven-plugin` を使っておらず、生成されたのが実行可能jarではなく普通のjarである </span>| 确认 `pom.xml` 里 `<build><plugins>` 有配置 `spring-boot-maven-plugin`<br><span class="ja-inline">🇯🇵 `pom.xml` の `<build><plugins>` に `spring-boot-maven-plugin` が設定されているか確認する </span>|
| 改了 `application-prod.yml` 但不生效 | `spring.profiles.active` 没有切成 `prod`，还在用 `dev`<br><span class="ja-inline">🇯🇵 `spring.profiles.active` が `prod` に切り替わっておらず、まだ `dev` を使っている </span>| 检查启动时激活的 Profile 是不是对的<br><span class="ja-inline">🇯🇵 起動時に有効になっているProfileが正しいか確認する </span>|
| 日志一行都没输出 | 级别设置得太高（比如设成了只有更严重的级别才输出），或者代码里根本没调用 logger<br><span class="ja-inline">🇯🇵 レベルが高く設定されすぎている（より重大なレベルしか出力されない設定になっているなど）、またはコードの中でloggerがそもそも呼び出されていない </span>| 检查 `logging.level` 配置，确认调用了对应的 `logger.xxx(...)`<br><span class="ja-inline">🇯🇵 `logging.level` の設定を確認し、対応する `logger.xxx(...)` を呼び出しているか確かめる </span>|
| 项目里到处都是 `System.out.println` | 早期为了图方便直接用，习惯没改过来<br><span class="ja-inline">🇯🇵 初期に手軽さのために直接使っていて、習慣が変わっていない </span>| 逐步替换成 SLF4J 的 `logger.info/debug/warn/error`，本章讲的正是原因<br><span class="ja-inline">🇯🇵 徐々にSLF4Jの `logger.info/debug/warn/error` に置き換えていく。この章で説明したのがまさにその理由 </span>|
| 端口冲突，启动报 `Port 8080 already in use` | 本地已经有别的程序占用了这个端口（比如上一次启动的项目还没关掉）<br><span class="ja-inline">🇯🇵 ローカルですでに別のプログラムがこのポートを占有している（例えば前回起動したプロジェクトがまだ閉じられていないなど） </span>| 换一个端口，或者先关掉占用端口的进程<br><span class="ja-inline">🇯🇵 別のポートに変更するか、先にポートを占有しているプロセスを終了する </span>|

## 动手练习 ／ 演習

1. 给 `user-api-memory` 项目补上 `application-dev.yml` 和 `application-prod.yml`，分别设置不同的端口，切换 `active` 的值，观察启动日志里实际使用的端口是否跟着变化。<br><span class="ja-inline">🇯🇵 `user-api-memory` プロジェクトに `application-dev.yml` と `application-prod.yml` を追加し、それぞれ異なるポートを設定して、`active` の値を切り替え、起動ログの中で実際に使われるポートが連動して変わるかを観察しましょう。</span>
2. 在 `UserService` 的每个方法里加上 `logger.info(...)`，把关键操作（新增、删除等）记录下来，重新调用几个接口，观察控制台输出。<br><span class="ja-inline">🇯🇵 `UserService` の各メソッドに `logger.info(...)` を追加し、重要な操作（新規追加、削除など）を記録するようにして、いくつかのインターフェースを呼び出し直し、コンソールの出力を観察しましょう。</span>
3. 执行 `mvn package`，找到生成的 jar 包，用 `java -jar` 启动它，用 Postman 验证之前写的接口依然可以正常访问。<br><span class="ja-inline">🇯🇵 `mvn package` を実行し、生成されたjarファイルを見つけて `java -jar` で起動し、Postmanで以前書いたインターフェースが依然として正常にアクセスできることを確認しましょう。</span>

## 小测验 ／ 小テスト

1. 如果把数据库密码直接写死在 Java 代码里，切换开发/生产环境会遇到什么麻烦？<br><span class="ja-inline">🇯🇵 もしデータベースパスワードをJavaコードに直接書き込んでしまったら、開発/本番環境を切り替える際にどんな面倒に遭遇しますか？</span>
2. `DEBUG`、`INFO`、`WARN`、`ERROR` 分别在什么场景下使用？<br><span class="ja-inline">🇯🇵 `DEBUG`、`INFO`、`WARN`、`ERROR` はそれぞれどんな場面で使いますか？</span>
3. 为什么一个 Spring Boot 打出来的 jar 包，不需要额外部署到外部 Tomcat 就能提供 Web 服务？<br><span class="ja-inline">🇯🇵 なぜSpring Bootが生成したjarファイルは、外部のTomcatに追加でデプロイしなくてもWebサービスを提供できるのですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 每次切换环境都要修改这部分 Java 代码，然后重新编译、重新打包才能生效，操作繁琐且容易改错，配置这种"运维层面的信息"和代码耦合在了一起。<br><span class="ja-inline">🇯🇵 環境を切り替えるたびにこの部分のJavaコードを変更し、再コンパイル・再パッケージングしなければ有効になりません。操作が煩雑でミスが起きやすく、設定という「運用レベルの情報」がコードと結合してしまいます。</span>
2. `DEBUG` 用于开发阶段查看细节，生产环境通常关闭；`INFO` 记录正常的关键运行节点；`WARN` 表示程序还能运行但有潜在问题，需要留意；`ERROR` 表示确实出错了，需要人工排查。<br><span class="ja-inline">🇯🇵 `DEBUG` は開発段階で詳細を見るために使い、本番環境では通常無効にします。`INFO` は正常な重要な稼働ポイントを記録します。`WARN` はプログラムがまだ動作できるが潜在的な問題があり、注意が必要であることを示します。`ERROR` は実際にエラーが発生し、人による調査が必要であることを示します。</span>
3. 因为 Spring Boot 项目通过 `spring-boot-starter-webmvc` 已经把 Tomcat 作为普通依赖库打包进了同一个 jar 包（内嵌 Tomcat），`java -jar` 启动时程序内部会用代码方式创建并启动这个 Tomcat，不依赖外部单独安装、配置的 Tomcat 服务器。<br><span class="ja-inline">🇯🇵 Spring Bootプロジェクトは `spring-boot-starter-webmvc` を通じて、すでにTomcatを普通の依存ライブラリとして同じjarファイルにパッケージング済みだからです（内蔵Tomcat）。`java -jar` で起動すると、プログラム内部でコードによってこのTomcatを作成・起動し、外部に個別にインストール・設定されたTomcatサーバーに依存しません。</span>
</details>

## 本章总结 ／ 本章のまとめ
你现在知道了怎么用 `application.yml` 和 Profile 机制把易变的配置从代码里分离出来、按环境切换；知道了为什么正式项目要用 SLF4J + Logback 而不是 `println`；也理解了 `mvn package` 打包和 `java -jar` 运行背后"内嵌 Tomcat"的原理。到这里，Spring 核心与 Spring Boot 这一阶段的内容就学完了，下一步进入阶段复习 3，然后正式开始数据库与持久层的学习。

> 🇯🇵 これで `application.yml` とProfileの仕組みを使って、変化しやすい設定をコードから分離し、環境ごとに切り替える方法が分かりました。正式なプロジェクトでなぜ `println` ではなく SLF4J + Logback を使うのかも分かりました。`mvn package` によるパッケージングと `java -jar` による実行の背後にある「内蔵Tomcat」の仕組みも理解できました。ここまでで、Springコアと Spring Boot のこの段階の内容は学び終わりました。次はステージ復習3に進み、その後いよいよデータベースと永続化層の学習を正式に始めます。
