# 第 17 章　Maven 基础 ／ 第17章　Mavenの基礎

## 本章目标 ／ 本章の目標
理解 Maven 是做什么用的；读懂一个最小 `pom.xml` 里 dependency、plugin、repository 各自的作用；掌握 `mvn clean`、`mvn test`、`mvn package` 三个常用命令分别做了什么；理解 `target` 目录和最终 jar 包是怎么来的。

> 🇯🇵 Maven（Javaプロジェクト向けのビルド・依存関係管理ツール）が何をするためのものか理解します。最小構成の `pom.xml`（Project Object Model、プロジェクト設定ファイル）の中で dependency（依存関係）、plugin（プラグイン）、repository（リポジトリ）がそれぞれどんな役割を果たしているか読み解けるようになります。よく使う `mvn clean`、`mvn test`、`mvn package` の3つのコマンドがそれぞれ何をするのかを把握し、`target` ディレクトリと最終的なjarファイルがどのように生成されるのかを理解します。

## 一句话理解 ／ 一言で理解する
Maven 是 Java 项目的"项目管理 + 自动装依赖"工具：你只需要在一个叫 `pom.xml` 的文件里写清楚"我要用哪些外部代码库"，Maven 就会自动帮你下载、管理版本，并且能一条命令帮你编译、测试、打包整个项目。

> 🇯🇵 Mavenは、Javaプロジェクト向けの「プロジェクト管理＋依存関係の自動導入」ツールです。`pom.xml` というファイルに「どの外部ライブラリを使うか」を書いておくだけで、Mavenが自動的にダウンロードしバージョンを管理してくれます。さらにコマンド1つでプロジェクト全体のコンパイル・テスト・パッケージングまでできます。

小提醒：如果你用 IntelliJ IDEA 创建 Spring Boot 项目（本教程第 18 章开始就是这样做的），IDEA 会自带一份 Maven，不需要你额外安装。如果你想在命令行独立使用 `mvn` 命令，官方下载地址是 https://maven.apache.org/download.cgi （下载 Binary zip/tar.gz，解压后把 `bin` 目录加进系统 `PATH` 环境变量即可）。

> 🇯🇵 補足：もしIntelliJ IDEAでSpring Bootプロジェクトを作成する場合（本チュートリアルでは第18章からこの方法を使います）、IDEAにはMavenが同梱されているため、別途インストールする必要はありません。コマンドラインで単独で `mvn` コマンドを使いたい場合は、公式ダウンロード先 https://maven.apache.org/download.cgi （Binary zip/tar.gzをダウンロードし、解凍後 `bin` ディレクトリをシステムの `PATH` 環境変数に追加するだけです）から入手できます。

## 为什么需要它 ／ なぜ必要なのか

回忆一下第 1 章：写一个 `Hello.java`，用 `javac` 编译、`java` 运行，两条命令就够了。但 Spring Boot 项目会用到大量别人写好的代码库（比如处理 Web 请求的库、操作数据库的库），这些库本身可能又依赖其他更底层的库。如果全靠你自己手动下载 `.jar` 文件、手动配置到项目里、还要留意版本会不会互相冲突，这件事很快就会变得不可维护。

> 🇯🇵 第1章を思い出してください。`Hello.java` を書いて `javac` でコンパイルし、`java` で実行する、2つのコマンドだけで済みました。しかしSpring Bootプロジェクトでは、他人が書いた大量のライブラリ（Webリクエストを処理するライブラリ、データベースを操作するライブラリなど）を使うことになり、これらのライブラリ自体がさらに別のより低レイヤーのライブラリに依存していることもあります。もしすべて自分で手動で `.jar` ファイルをダウンロードし、プロジェクトに手動で設定し、バージョンの衝突にも気を配るとなると、あっという間に手に負えなくなります。

Maven 解决的正是这个问题：

> 🇯🇵 Mavenはまさにこの問題を解決します。

- 你只需要在 `pom.xml` 里声明"我要用 Spring Web，版本随 Spring Boot 走"，Maven 会自动去网上把它和它依赖的所有库都下载下来。<br><span class="ja-inline">🇯🇵 `pom.xml` に「Spring Webを使う、バージョンはSpring Bootに合わせる」と宣言するだけで、Mavenが自動的にネット上からそれと、それが依存するすべてのライブラリをダウンロードしてくれます。</span>
- 项目"怎么编译""怎么测试""怎么打包"这些流程，Maven 也提供了统一的命令，不需要你自己手写一长串编译命令。<br><span class="ja-inline">🇯🇵 プロジェクトの「どうコンパイルするか」「どうテストするか」「どうパッケージングするか」といった一連の流れについても、Mavenは統一されたコマンドを提供しており、自分で長いコンパイルコマンドを書く必要はありません。</span>

## 核心概念 ／ コアコンセプト

### 17.1 pom.xml 是什么 ／ 17.1　pom.xmlとは何か

`pom.xml`（Project Object Model，项目对象模型）是 Maven 项目的核心配置文件，放在项目根目录下。它至少要说明这个项目自己是谁（坐标：groupId/artifactId/version）、依赖哪些外部库（dependency）、要用哪些构建工具（plugin），以及去哪里下载这些东西（repository）。

> 🇯🇵 `pom.xml`（Project Object Model、プロジェクトオブジェクトモデル）は、Mavenプロジェクトの中心となる設定ファイルで、プロジェクトのルートディレクトリに置かれます。少なくとも、このプロジェクト自身が何者か（座標：groupId/artifactId/version）、どの外部ライブラリに依存するか（dependency）、どのビルドツールを使うか（plugin）、そしてこれらをどこからダウンロードするか（repository）を記述する必要があります。

| 元素 ／ 要素 | 作用 ／ 役割 |
|---|---|
| `groupId` | 项目所属组织/公司的标识，类似 Java 的包名风格，比如 `com.example`<br><span class="ja-inline">🇯🇵 プロジェクトが属する組織・会社の識別子で、Javaのパッケージ名のようなスタイルを取ります。例えば `com.example` </span>|
| `artifactId` | 项目自己的名字，比如 `hello-spring-boot`<br><span class="ja-inline">🇯🇵 プロジェクト自身の名前です。例えば `hello-spring-boot` </span>|
| `version` | 项目自己的版本号<br><span class="ja-inline">🇯🇵 プロジェクト自身のバージョン番号です </span>|
| `<dependency>` | 声明这个项目需要用到的**外部代码库**，Maven 会自动下载它和它依赖的其他库<br><span class="ja-inline">🇯🇵 このプロジェクトが必要とする**外部ライブラリ**を宣言します。Mavenがそれと、それが依存する他のライブラリを自動的にダウンロードします </span>|
| `<plugin>` | 声明构建过程中需要用到的**工具**，比如"怎么把 Spring Boot 项目打成一个可直接运行的 jar 包"就是靠一个插件完成的<br><span class="ja-inline">🇯🇵 ビルド過程で必要となる**ツール**を宣言します。例えば「Spring Bootプロジェクトを直接実行可能なjarファイルにパッケージングする方法」は、プラグインによって実現されています </span>|
| `<repository>` | 声明去**哪里**下载依赖，默认是 Maven 中央仓库（Maven Central），大多数项目不需要额外配置这一项<br><span class="ja-inline">🇯🇵 依存関係を**どこから**ダウンロードするかを宣言します。デフォルトはMaven中央リポジトリ（Maven Central）で、ほとんどのプロジェクトではこの項目を追加で設定する必要はありません </span>|

### 17.2 常用命令 ／ 17.2　よく使うコマンド

| 命令 ／ コマンド | 做什么 ／ 何をするか |
|---|---|
| `mvn clean` | 清空 `target` 目录，把上一次编译、打包留下的文件全部删除，保证这次是"干净"地重新构建<br><span class="ja-inline">🇯🇵 `target` ディレクトリを空にし、前回のコンパイルやパッケージングで残ったファイルをすべて削除して、今回は「クリーンな」状態で再ビルドすることを保証します </span>|
| `mvn test` | 编译源代码和测试代码，然后运行 `src/test/java` 下的所有测试（测试相关内容在第 36 章详细讲，这里先知道这条命令的作用）<br><span class="ja-inline">🇯🇵 ソースコードとテストコードをコンパイルし、`src/test/java` 下のすべてのテストを実行します（テストに関する内容は第36章で詳しく説明します。ここではこのコマンドの役割だけ知っておけば十分です） </span>|
| `mvn package` | 编译、运行测试，然后把整个项目打包成一个 `.jar` 文件（放在 `target` 目录下），这个 jar 包就是可以交付、可以直接运行的成果物<br><span class="ja-inline">🇯🇵 コンパイルとテストの実行を行ったあと、プロジェクト全体を1つの `.jar` ファイル（`target` ディレクトリに置かれる）にパッケージングします。このjarファイルは納品可能で、直接実行できる成果物です </span>|

实际开发中经常把它们连起来用，比如 `mvn clean package`，表示"先清空旧的构建结果，再重新完整构建一次"。

> 🇯🇵 実際の開発では、これらをつなげて使うことがよくあります。例えば `mvn clean package` は「まず古いビルド結果をクリアし、それから完全に再ビルドする」ことを意味します。

### 17.3 target 目录和 jar 包是怎么来的 ／ 17.3　targetディレクトリとjarファイルはどのように生成されるのか

Maven 项目有一套约定俗成的目录结构：源代码放在 `src/main/java`，配置文件放在 `src/main/resources`，测试代码放在 `src/test/java`。当你执行 `mvn package` 时：

> 🇯🇵 Mavenプロジェクトには慣例となっているディレクトリ構造があります：ソースコードは `src/main/java`、設定ファイルは `src/main/resources`、テストコードは `src/test/java` に置かれます。`mvn package` を実行すると、次のことが起こります。

1. Maven 先把 `src/main/java` 下的 `.java` 源文件编译成 `.class` 字节码文件。<br><span class="ja-inline">🇯🇵 まずMavenが `src/main/java` 下の `.java` ソースファイルを `.class` バイトコードファイルにコンパイルします。</span>
2. 把编译结果和 `src/main/resources` 下的配置文件一起，按规则整理到项目根目录下自动生成的 `target` 目录里。<br><span class="ja-inline">🇯🇵 コンパイル結果と `src/main/resources` 下の設定ファイルを、規則に従ってプロジェクトのルートディレクトリに自動生成される `target` ディレクトリにまとめます。</span>
3. 借助 Spring Boot 提供的打包插件（`spring-boot-maven-plugin`），把这些内容连同项目依赖的所有第三方库，一起打包成一个"胖 jar"（Fat Jar）——之所以叫"胖"，是因为它不仅包含你自己写的代码，还把所有依赖的库也一起打包了进去，所以这一个 jar 包可以直接用 `java -jar` 运行，不需要额外配置任何依赖。<br><span class="ja-inline">🇯🇵 Spring Bootが提供するパッケージング用プラグイン（`spring-boot-maven-plugin`）を使って、これらの内容とプロジェクトが依存するすべてのサードパーティライブラリをまとめて1つの「Fat Jar（太ったjar）」にパッケージングします——「太った」と呼ばれるのは、自分で書いたコードだけでなく、依存するすべてのライブラリも一緒に詰め込まれているからです。そのためこの1つのjarファイルは `java -jar` で直接実行でき、追加で依存関係を設定する必要がありません。</span>

`target` 目录本身**不需要**手动创建，也不需要提交到 Git 仓库（它是构建过程中自动生成的产物，`mvn clean` 会把它清空）。

> 🇯🇵 `target` ディレクトリ自体は手動で作成する**必要はなく**、Gitリポジトリにコミットする必要もありません（これはビルド過程で自動生成される成果物であり、`mvn clean` で空にできます）。

## 图解 ／ 図解

```
pom.xml（声明依赖、插件）
   ↓ mvn clean
清空 target 目录
   ↓ mvn test（编译 + 跑测试）
target/classes（编译出的 .class 文件）
   ↓ mvn package（在 test 基础上继续打包）
target/hello-spring-boot-0.0.1-SNAPSHOT.jar
   ↓ java -jar
程序运行起来
```

## 最小示例 ／ 最小限のサンプル

一个最小的 `pom.xml`（对应下一章将要创建的 `hello-spring-boot` 项目，Spring Boot 4.1.1，Java 21）：

> 🇯🇵 最小構成の `pom.xml`（次章で作成する `hello-spring-boot` プロジェクトに対応、Spring Boot 4.1.1、Java 21）です。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                              https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 项目自身的坐标 -->
    <groupId>com.example</groupId>
    <artifactId>hello-spring-boot</artifactId>
    <version>0.0.1-SNAPSHOT</version>

    <!-- 继承 Spring Boot 官方提供的父项目，统一管理各依赖的版本号，
         这样下面写依赖时大多不需要再手写版本号 -->
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>4.1.1</version>
    </parent>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <!-- Spring Web：让项目具备处理 HTTP 请求的能力，
             版本号由上面的 parent 统一管理，这里不需要手写 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webmvc</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <!-- 这个插件负责把项目打包成可直接用 java -jar 运行的胖 jar -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

## 代码逐行解释 ／ コードの行ごとの解説

- `<modelVersion>4.0.0</modelVersion>`：固定写法，表示使用哪个版本的 pom 格式规范，几乎所有 Maven 项目都写 `4.0.0`。<br><span class="ja-inline">🇯🇵 `<modelVersion>4.0.0</modelVersion>`：固定の書き方で、どのバージョンのpom形式仕様を使うかを示します。ほとんどすべてのMavenプロジェクトが `4.0.0` と書きます。</span>
- `<groupId>`/`<artifactId>`/`<version>`：这个项目自己的坐标，唯一标识"这是谁的、哪个项目、哪个版本"。<br><span class="ja-inline">🇯🇵 `<groupId>`/`<artifactId>`/`<version>`：このプロジェクト自身の座標で、「誰の、どのプロジェクトの、どのバージョンか」を一意に識別します。</span>
- `<parent>` 里的 `spring-boot-starter-parent`：这是 Spring Boot 官方提供的一个"父项目"，作用是统一管理一大批常用依赖的版本号。有了它，下面写 `spring-boot-starter-webmvc` 时就不需要再纠结版本号写多少——它会自动和 Spring Boot 4.1.1 匹配一套经过官方验证、互相兼容的版本组合。<br><span class="ja-inline">🇯🇵 `<parent>` の中の `spring-boot-starter-parent`：Spring Boot公式が提供する「親プロジェクト」で、多数のよく使われる依存関係のバージョン番号を統一的に管理する役割を担います。これがあることで、下で `spring-boot-starter-webmvc` を書く際にバージョン番号に悩む必要がなくなります——公式が検証済みで互いに互換性のあるバージョンの組み合わせが、Spring Boot 4.1.1に自動的に対応付けられます。</span>
- `<properties><java.version>21</java.version></properties>`：告诉 Maven 用 Java 21 的语法标准来编译这个项目，对应本教程锁定的 JDK 21。<br><span class="ja-inline">🇯🇵 `<properties><java.version>21</java.version></properties>`：Mavenに対してJava 21の構文標準でこのプロジェクトをコンパイルするよう指示します。本チュートリアルが固定しているJDK 21に対応します。</span>
- `<dependency>` 块：声明了一个依赖——`spring-boot-starter-webmvc`，这是 Spring Boot 提供的"起步依赖"（Starter），引入它，项目就自动具备了处理 HTTP 请求、内嵌 Tomcat 等一整套 Web 开发相关的能力（这些能力具体怎么用，第 18～20 章会陆续讲到）。注意这里没有写 `<version>`，因为版本已经由上面的 `parent` 统一管理了。<br><span class="ja-inline">🇯🇵 `<dependency>` ブロック：`spring-boot-starter-webmvc` という依存関係を1つ宣言しています。これはSpring Bootが提供する「スターター依存関係」（Starter）で、これを導入するだけで、プロジェクトはHTTPリクエストの処理、Tomcatの組み込みなど、Web開発に関する一連の機能を自動的に備えます（これらの機能の具体的な使い方は第18〜20章で順に説明します）。ここに `<version>` が書かれていないのは、バージョンがすでに上の `parent` によって統一管理されているためです。</span>

  小提醒：如果你在 Spring Boot 3 或者更早的教程/资料里看到的是 `spring-boot-starter-web`（没有 `mvc` 三个字母），那不是打错字——`spring-boot-starter-web` 在 Spring Boot 4 里仍然保留、可以正常使用，但官方已经把它标记为 deprecated（不推荐继续使用），推荐新项目统一使用 `spring-boot-starter-webmvc`。本教程从这里开始统一用后者，你不需要自己去改老资料，只要知道"看到 `-web` 结尾的是旧写法，`-webmvc` 是 Boot 4 推荐写法"就行。

  > 🇯🇵 補足：もしSpring Boot 3以前の教材や資料で `spring-boot-starter-web`（`mvc` の3文字がない）を見かけても、それは誤記ではありません——`spring-boot-starter-web` はSpring Boot 4でも引き続き保持されており正常に使用できますが、公式はすでにdeprecated（非推奨）とマークしています。新規プロジェクトでは `spring-boot-starter-webmvc` を統一して使うことが推奨されています。本チュートリアルはここから後者を統一して使うので、古い資料を自分で書き換える必要はなく、「`-web` で終わっているものは古い書き方、`-webmvc` がBoot 4推奨の書き方」と知っておけば十分です。

- `<build><plugins>` 里的 `spring-boot-maven-plugin`：一个构建插件，专门负责把项目和它的所有依赖一起打成一个可以直接运行的胖 jar 包，`mvn package` 时会用到它。<br><span class="ja-inline">🇯🇵 `<build><plugins>` の中の `spring-boot-maven-plugin`：ビルド用プラグインの一つで、プロジェクトとそのすべての依存関係を一緒に、直接実行可能な太ったjarファイルにパッケージングする専用の役割を担います。`mvn package` の際に使用されます。</span>

## 程序运行过程 ／ プログラムの実行の流れ

以执行 `mvn clean package` 为例：

> 🇯🇵 `mvn clean package` を実行する場合を例に説明します。

1. `clean` 阶段：Maven 删除项目根目录下的 `target` 目录（如果存在），保证接下来是一次干净的构建。<br><span class="ja-inline">🇯🇵 `clean` フェーズ：Mavenがプロジェクトのルートディレクトリ下の `target` ディレクトリ（存在する場合）を削除し、これから行うビルドがクリーンな状態であることを保証します。</span>
2. Maven 读取 `pom.xml`，根据 `<dependency>` 里声明的坐标，检查本地是否已经缓存了对应的库；没有的话，就联网去仓库（默认 Maven Central）下载，存放到本地的一个仓库缓存目录里。<br><span class="ja-inline">🇯🇵 Mavenが `pom.xml` を読み込み、`<dependency>` に宣言された座標に基づいて、対応するライブラリがすでにローカルにキャッシュされているか確認します。なければネットに接続してリポジトリ（デフォルトはMaven Central）からダウンロードし、ローカルのリポジトリキャッシュディレクトリに保存します。</span>
3. 编译阶段：把 `src/main/java` 下的源代码编译成字节码，连同 `src/main/resources` 的配置文件，一起整理到 `target/classes` 目录。<br><span class="ja-inline">🇯🇵 コンパイルフェーズ：`src/main/java` 下のソースコードをバイトコードにコンパイルし、`src/main/resources` の設定ファイルとあわせて `target/classes` ディレクトリにまとめます。</span>
4. 测试阶段（`mvn package` 内部会先执行测试）：编译并运行 `src/test/java` 下的测试代码，如果有测试失败，默认会中断构建（不会继续打包）。<br><span class="ja-inline">🇯🇵 テストフェーズ（`mvn package` の内部では先にテストが実行されます）：`src/test/java` 下のテストコードをコンパイルして実行し、テストが失敗した場合はデフォルトでビルドが中断されます（パッケージングは続行されません）。</span>
5. 打包阶段：`spring-boot-maven-plugin` 把 `target/classes` 里的内容，连同所有依赖的第三方库，一起打进一个 jar 文件，生成在 `target/hello-spring-boot-0.0.1-SNAPSHOT.jar`。<br><span class="ja-inline">🇯🇵 パッケージングフェーズ：`spring-boot-maven-plugin` が `target/classes` 内の内容と、依存するすべてのサードパーティライブラリを1つのjarファイルにまとめ、`target/hello-spring-boot-0.0.1-SNAPSHOT.jar` として生成します。</span>
6. 之后执行 `java -jar target/hello-spring-boot-0.0.1-SNAPSHOT.jar` 就能直接运行这个项目，不需要额外配置任何依赖——因为所有依赖都已经打进这一个文件里了。<br><span class="ja-inline">🇯🇵 その後 `java -jar target/hello-spring-boot-0.0.1-SNAPSHOT.jar` を実行すればこのプロジェクトを直接実行でき、追加で依存関係を設定する必要はありません——すべての依存関係がすでにこの1つのファイルに詰め込まれているためです。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 第一次执行 Maven 命令特别慢，卡在下载依赖上 | Maven 第一次运行需要联网下载 `pom.xml` 里声明的所有依赖到本地缓存<br><span class="ja-inline">🇯🇵 Mavenを初めて実行する際、`pom.xml` に宣言されたすべての依存関係をネットからダウンロードしてローカルキャッシュに保存する必要がある </span>| 属于正常现象，保持网络畅通，等待下载完成即可；之后同样的依赖会直接用本地缓存，不会重复下载<br><span class="ja-inline">🇯🇵 正常な現象なので、ネットワーク接続を維持してダウンロードの完了を待てばよい。以降は同じ依存関係はローカルキャッシュがそのまま使われ、再ダウンロードされない </span>|
| `mvn package` 报错提示测试失败，导致打包中断 | Spring Boot 默认在打包前会先跑一遍测试，测试没通过就不会继续生成 jar 包<br><span class="ja-inline">🇯🇵 Spring Bootはデフォルトでパッケージングの前にテストを一度実行し、テストが通らないとjarファイルの生成に進まない </span>| 修复测试失败的问题，或者临时用 `mvn package -DskipTests` 跳过测试（不建议长期这样做）<br><span class="ja-inline">🇯🇵 テスト失敗の問題を修正するか、一時的に `mvn package -DskipTests` でテストをスキップする（長期的にこうすることは推奨しない） </span>|
| pom.xml 里依赖没写版本号，报错找不到版本 | 忘记引入 `spring-boot-starter-parent`，导致 Maven 不知道该用哪个版本<br><span class="ja-inline">🇯🇵 `spring-boot-starter-parent` の導入を忘れたため、Mavenがどのバージョンを使うべきか分からなくなっている </span>| 检查是否正确配置了 `<parent>`；如果确实不用 parent 管理版本，则必须自己在 `<dependency>` 里手写 `<version>`<br><span class="ja-inline">🇯🇵 `<parent>` が正しく設定されているか確認する。もし本当にparentでバージョンを管理しないなら、`<dependency>` の中に自分で `<version>` を手書きする必要がある </span>|
| `target` 目录被误提交到了 Git 仓库 | 没有配置忽略规则<br><span class="ja-inline">🇯🇵 無視ルールが設定されていない </span>| `target` 是自动生成的构建产物，应该加入 `.gitignore`，不需要提交到版本库<br><span class="ja-inline">🇯🇵 `target` は自動生成されるビルド成果物なので、`.gitignore` に追加すべきで、バージョン管理リポジトリにコミットする必要はない </span>|

## 动手练习 ／ 演習

1. 打开本章示例的 `pom.xml`，尝试指出里面哪些内容是"项目自己的坐标"，哪些是"外部依赖"，哪些是"构建插件"。<br><span class="ja-inline">🇯🇵 本章のサンプルの `pom.xml` を開き、その中のどの内容が「プロジェクト自身の座標」で、どれが「外部依存関係」で、どれが「ビルドプラグイン」かを指摘してみましょう。</span>
2. 思考一下：如果没有 `<parent>` 统一管理版本号，`spring-boot-starter-webmvc` 这个依赖需要自己写版本号，会带来什么麻烦？<br><span class="ja-inline">🇯🇵 考えてみましょう：もし `<parent>` によるバージョンの統一管理がなく、`spring-boot-starter-webmvc` という依存関係のバージョン番号を自分で書く必要があったら、どんな面倒が生じるでしょうか？</span>
3. 想一想 `mvn clean`、`mvn test`、`mvn package` 三个命令的关系——`mvn package` 是不是相当于把前两个命令的效果都包含了？<br><span class="ja-inline">🇯🇵 `mvn clean`、`mvn test`、`mvn package` の3つのコマンドの関係を考えてみましょう——`mvn package` は前の2つのコマンドの効果を両方含んでいると言えるでしょうか？</span>

## 小测验 ／ 小テスト

1. `pom.xml` 里的 `<dependency>` 和 `<plugin>` 分别负责什么？<br><span class="ja-inline">🇯🇵 `pom.xml` の中の `<dependency>` と `<plugin>` はそれぞれ何を担当していますか？</span>
2. `mvn clean` 具体做了什么事？<br><span class="ja-inline">🇯🇵 `mvn clean` は具体的に何をしますか？</span>
3. 最终生成的那个"胖 jar"为什么可以直接用 `java -jar` 运行，不需要额外配置依赖？<br><span class="ja-inline">🇯🇵 最終的に生成される「太ったjar」は、なぜ `java -jar` で直接実行でき、追加で依存関係を設定する必要がないのですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. `<dependency>` 声明项目需要用到的外部代码库，Maven 会自动下载并管理它们的版本；`<plugin>` 声明构建过程中要用到的工具，比如把项目打包成可运行 jar 包的插件。<br><span class="ja-inline">🇯🇵 `<dependency>` はプロジェクトが必要とする外部ライブラリを宣言し、Mavenがそれらのバージョンを自動的にダウンロード・管理します。`<plugin>` はビルド過程で使用するツールを宣言します。例えばプロジェクトを実行可能なjarファイルにパッケージングするプラグインなどです。</span>
2. 删除项目根目录下的 `target` 目录，清空上一次构建留下的所有产物，保证接下来重新构建时不会受到旧文件的干扰。<br><span class="ja-inline">🇯🇵 プロジェクトのルートディレクトリ下の `target` ディレクトリを削除し、前回のビルドで残ったすべての成果物をクリアして、次に再ビルドする際に古いファイルの影響を受けないようにします。</span>
3. 因为打包时，`spring-boot-maven-plugin` 把项目自身的代码和它依赖的所有第三方库，全部打进了同一个 jar 文件里，运行时不需要再去别处查找任何依赖，所以是"自带全部家当"的一个完整包。<br><span class="ja-inline">🇯🇵 パッケージング時に `spring-boot-maven-plugin` がプロジェクト自身のコードと依存するすべてのサードパーティライブラリを、すべて同じjarファイルに詰め込むためです。実行時に他の場所で依存関係を探す必要がなく、「すべての持ち物を自分で持っている」完全なパッケージだからです。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了 Maven 用 `pom.xml` 声明依赖、用统一命令完成编译测试打包的基本思路，也知道了 `target` 目录和最终 jar 包是怎么一步步生成的。下一章我们就正式用 Spring Initializr 创建属于你的第一个 Spring Boot 项目——`hello-spring-boot`。

> 🇯🇵 これでMavenが `pom.xml` で依存関係を宣言し、統一されたコマンドでコンパイル・テスト・パッケージングを行うという基本的な考え方を理解し、`target` ディレクトリと最終的なjarファイルがどのように段階を経て生成されるかも分かりました。次章ではいよいよSpring Initializrを使って、あなた自身の最初のSpring Bootプロジェクト——`hello-spring-boot`——を作成します。
