# 第 18 章　创建你的第一个 Spring Boot 项目 ／ 第18章　はじめてのSpring Bootプロジェクトを作成する

## 本章目标 ／ 本章の目標
用 Spring Initializr 创建一个真实的 Spring Boot 项目（`hello-spring-boot`）；认清生成出来的目录结构里每一部分是做什么用的。本章重点是"认路"，先不写业务代码。

> 🇯🇵 Spring Initializr（Spring Bootプロジェクトの雛形を生成するWebツール）を使って、実際のSpring Bootプロジェクト（`hello-spring-boot`）を作成します。生成されたディレクトリ構造の各部分が何のためにあるのかを把握します。本章の重点は「道を知る」ことにあり、まだ業務コードは書きません。

## 一句话理解 ／ 一言で理解する
Spring Initializr 是一个"项目脚手架生成器"：你在网页上勾选几个选项，它就帮你生成一个配置好 `pom.xml`、目录结构齐全、开箱即用的 Spring Boot 项目骨架。

> 🇯🇵 Spring Initializrは「プロジェクトの雛形ジェネレーター」です。Webページ上でいくつかの選択肢にチェックを入れるだけで、`pom.xml`（Mavenの設定ファイル）が設定済みで、ディレクトリ構造も整った、すぐに使えるSpring Bootプロジェクトの骨組みを生成してくれます。

## 为什么需要它 ／ なぜ必要なのか

上一章我们知道了 `pom.xml` 长什么样，但如果每次都要自己从零手写这个文件、手动创建 `src/main/java` 这样的目录结构，既繁琐又容易出错（比如漏配了插件、目录结构不符合 Maven 的约定）。

> 🇯🇵 前章で `pom.xml` がどんな見た目かを学びましたが、もし毎回このファイルをゼロから自分で手書きし、`src/main/java` のようなディレクトリ構造を手動で作成しなければならないとしたら、面倒な上にミスも起きやすくなります（例えばプラグインの設定漏れや、Mavenの規約に合わないディレクトリ構造など）。

Spring 官方提供了一个网站 **Spring Initializr**（[start.spring.io](https://start.spring.io)），只要在网页上填几个信息、勾选需要的依赖，点一下按钮，就能下载到一个已经配置好、可以直接导入 IDEA 打开运行的项目骨架。这是业界创建 Spring Boot 项目最常见的方式。

> 🇯🇵 Spring公式は **Spring Initializr**（[start.spring.io](https://start.spring.io)）というWebサイトを提供しています。Webページ上でいくつかの情報を入力し、必要な依存関係にチェックを入れてボタンを押すだけで、すでに設定済みで、そのままIDEAにインポートして開き実行できるプロジェクトの骨組みをダウンロードできます。これは業界でSpring Bootプロジェクトを作成する最も一般的な方法です。

## 核心概念 ／ コアコンセプト

### 18.1 用 Spring Initializr 创建项目 ／ 18.1　Spring Initializrでプロジェクトを作成する

打开 `start.spring.io`，需要填写和选择的内容如下：

> 🇯🇵 `start.spring.io` を開いて、入力・選択する必要がある内容は以下の通りです。

| 选项 ／ 選択項目 | 本教程填写值 ／ 本教程での入力値 | 说明 ／ 説明 |
|---|---|---|
| Project | Maven | 选择用 Maven 作为构建工具（对应第 17 章学的内容）<br><span class="ja-inline">🇯🇵 ビルドツールとしてMavenを選択します（第17章で学んだ内容に対応） </span>|
| Language | Java | 项目使用的编程语言<br><span class="ja-inline">🇯🇵 プロジェクトで使用するプログラミング言語です </span>|
| Spring Boot | **4.1.1** | 本教程全程锁定的 Spring Boot 版本，不要选其他版本<br><span class="ja-inline">🇯🇵 本チュートリアルを通して固定するSpring Bootのバージョンです。他のバージョンを選ばないでください </span>|
| Group | `com.example` | 对应 `pom.xml` 里的 `groupId`<br><span class="ja-inline">🇯🇵 `pom.xml` の `groupId` に対応します </span>|
| Artifact | `hello-spring-boot` | 对应 `pom.xml` 里的 `artifactId`，也是本教程 Project 1 的项目名<br><span class="ja-inline">🇯🇵 `pom.xml` の `artifactId` に対応し、本チュートリアルのProject 1のプロジェクト名でもあります </span>|
| Package name | `com.example.hello` | 项目里 Java 类默认所在的包名，本教程 Project 1 统一使用这个包名<br><span class="ja-inline">🇯🇵 プロジェクト内のJavaクラスがデフォルトで属するパッケージ名です。本チュートリアルのProject 1ではこのパッケージ名を統一して使用します </span>|
| Packaging | Jar | 打包成 jar 包运行（Spring Boot 项目自带内嵌 Tomcat，不需要打成 war 包部署到外部服务器，具体原因第 19 章讲）<br><span class="ja-inline">🇯🇵 jarファイルとしてパッケージングして実行します（Spring Bootプロジェクトは内蔵Tomcatを持っているため、warファイルにパッケージングして外部サーバーにデプロイする必要はありません。詳しい理由は第19章で説明します） </span>|
| Java | **21** | 对应本教程锁定的 JDK 版本<br><span class="ja-inline">🇯🇵 本チュートリアルで固定しているJDKのバージョンに対応します </span>|
| Dependencies | Spring Web | 勾选这一项，项目就会自动引入 `spring-boot-starter-webmvc`，具备处理 HTTP 请求的能力<br><span class="ja-inline">🇯🇵 この項目にチェックを入れると、プロジェクトは自動的に `spring-boot-starter-webmvc` を導入し、HTTPリクエストを処理する能力を備えます </span>|

填好之后点击"GENERATE"，网站会下载一个压缩包，解压后就是一个完整的项目骨架，用 IDEA 的"Open"打开这个项目所在的文件夹即可。

> 🇯🇵 入力が終わったら「GENERATE」をクリックすると、サイトが圧縮ファイルをダウンロードします。解凍すると完全なプロジェクトの骨組みが手に入るので、IDEAの「Open」でこのプロジェクトのフォルダを開けばよいだけです。

### 18.2 生成的目录结构 ／ 18.2　生成されるディレクトリ構造

打开生成的项目，你会看到这样的结构（以 `hello-spring-boot` 为例）：

> 🇯🇵 生成されたプロジェクトを開くと、次のような構造が見えます（`hello-spring-boot` を例にします）。

```
hello-spring-boot/
├── pom.xml                                        # 项目坐标 + 依赖 + 插件配置（第 17 章学过）
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/example/hello/
│   │   │       └── HelloSpringBootApplication.java   # 程序入口
│   │   └── resources/
│   │       └── application.properties                 # 配置文件（本教程会改成 application.yml）
│   └── test/
│       └── java/
│           └── com/example/hello/
│               └── HelloSpringBootApplicationTests.java  # 自动生成的空测试（第 36 章会详细讲测试）
```

逐项说明：

> 🇯🇵 各項目を順に説明します。

- **`src/main/java`**：存放你写的所有正式 Java 源代码，之后的 `controller`、`service` 等包都会建在 `com.example.hello` 这个包下面。<br><span class="ja-inline">🇯🇵 **`src/main/java`**：あなたが書くすべての正式なJavaソースコードを置く場所です。今後の `controller`、`service` などのパッケージはすべて `com.example.hello` パッケージの下に作られます。</span>
- **`src/main/resources`**：存放配置文件、静态资源等非 Java 代码的内容。里面默认会生成一个 `application.properties`。<br><span class="ja-inline">🇯🇵 **`src/main/resources`**：設定ファイルや静的リソースなど、Javaコード以外の内容を置く場所です。デフォルトで `application.properties` が1つ生成されます。</span>
- **`pom.xml`**：项目的构建配置文件，内容和第 17 章讲的结构一致——已经自动帮你写好了 `spring-boot-starter-parent`、`spring-boot-starter-webmvc` 依赖、`spring-boot-maven-plugin` 插件，不需要再手动配置。<br><span class="ja-inline">🇯🇵 **`pom.xml`**：プロジェクトのビルド設定ファイルで、内容は第17章で説明した構造と一致します——すでに `spring-boot-starter-parent`、`spring-boot-starter-webmvc` の依存関係、`spring-boot-maven-plugin` プラグインが自動的に書き込まれており、手動で設定する必要はありません。</span>
- **`src/test/java`**：存放测试代码，Spring Initializr 会自动生成一个最基础的测试类，用来验证"Spring 容器能不能正常启动"，具体测试怎么写留到第 36 章讲。<br><span class="ja-inline">🇯🇵 **`src/test/java`**：テストコードを置く場所です。Spring Initializrは「Springコンテナが正常に起動できるか」を検証する最も基本的なテストクラスを自動生成します。具体的なテストの書き方は第36章で説明します。</span>

### 18.3 关于 application.properties 与 application.yml ／ 18.3　application.propertiesとapplication.ymlについて

Spring Initializr 默认生成的配置文件是 `application.properties`，格式是"一行一个配置项"，比如：

> 🇯🇵 Spring Initializrがデフォルトで生成する設定ファイルは `application.properties` で、「1行に1つの設定項目」という形式です。例えば次のようになります。

```properties
server.port=8080
```

本教程统一把它换成 **`application.yml`**（YAML 格式），写法是用缩进表达层级关系：

> 🇯🇵 本チュートリアルでは統一してこれを **`application.yml`**（YAML形式）に置き換えます。インデントで階層関係を表す書き方です。

```yaml
server:
  port: 8080
```

两种格式效果完全一样，Spring Boot 都能识别，选择哪种纯属项目约定。本教程统一用 `application.yml`，是因为等到后面章节配置项越来越多（数据库连接、日志、Profile 等），YAML 的层级缩进写法比一行一行平铺的 `.properties` 格式更清晰、更不容易重复输入前缀。做法很简单：把 `src/main/resources/application.properties` 删除（或者改名），新建一个 `application.yml` 文件即可。本章暂时不需要在里面写任何配置。

> 🇯🇵 2つの形式は効果が全く同じで、どちらもSpring Bootが認識できます。どちらを選ぶかは純粋にプロジェクトの取り決めです。本チュートリアルが `application.yml` に統一しているのは、後の章で設定項目がどんどん増えていく（データベース接続、ログ、Profileなど）につれて、YAMLの階層インデントによる書き方が、1行ずつ平坦に並べる `.properties` 形式よりも見やすく、接頭辞を繰り返し入力する手間も少なくなるためです。やり方は簡単で、`src/main/resources/application.properties` を削除（またはリネーム）し、新しく `application.yml` ファイルを作成するだけです。本章では今のところ中に何も設定を書く必要はありません。

## 图解 ／ 図解

```
浏览器打开 start.spring.io
       ↓ 填写 Group/Artifact/Package/Java 版本/Spring Boot 版本，勾选 Dependencies
点击 GENERATE，下载压缩包
       ↓ 解压
一个完整的 Maven 项目骨架（pom.xml + 目录结构齐全）
       ↓ 用 IDEA 打开这个文件夹
IDEA 自动识别为 Maven 项目，帮你下载 pom.xml 里声明的依赖
       ↓
项目准备就绪，可以开始写代码（下一章开始讲怎么让项目跑起来）
```

## 最小示例 ／ 最小限のサンプル

本章不写业务代码，这里给出的是上一节提到的、`pom.xml` 里 Initializr 自动生成的依赖片段，方便你和自己实际生成的项目做对照：

> 🇯🇵 本章では業務コードは書きません。ここでは前節で触れた、`pom.xml` にInitializrが自動生成した依存関係の断片を示します。実際に自分で生成したプロジェクトと見比べるのに役立ててください。

```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>

    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

## 代码逐行解释 ／ コードの行ごとの解説

- `spring-boot-starter-webmvc`：勾选 "Spring Web" 依赖后自动加入的，让项目具备处理 HTTP 请求、内嵌 Tomcat 等 Web 开发能力。<br><span class="ja-inline">🇯🇵 `spring-boot-starter-webmvc`："Spring Web" 依存関係にチェックを入れると自動的に追加されるもので、プロジェクトにHTTPリクエストの処理、Tomcatの組み込みといったWeb開発の能力を与えます。</span>
- `spring-boot-starter-test`：Spring Initializr 会自动帮每个项目加上这一个依赖，专门给测试代码用；注意它的 `<scope>test</scope>`，意思是这个依赖只在编译和运行测试代码的时候才会用到，正式打包运行时不会包含进去。具体怎么用留到第 36 章讲。<br><span class="ja-inline">🇯🇵 `spring-boot-starter-test`：Spring Initializrがすべてのプロジェクトに自動的に追加する依存関係で、テストコード専用です。`<scope>test</scope>` に注目してください。これはこの依存関係がテストコードのコンパイル・実行時にのみ使われ、正式なパッケージング・実行時には含まれないことを意味します。具体的な使い方は第36章で説明します。</span>

## 程序运行过程 ／ プログラムの実行の流れ

本章重点是"认路"，暂不涉及运行程序的具体过程（下一章讲清楚 `@SpringBootApplication` 之后，第 20 章会正式跑通第一个可访问的接口，Project 1 会完整走一遍运行流程）。这里先简单说明一下你打开项目后 IDEA 在后台做了什么：

> 🇯🇵 本章の重点は「道を知る」ことにあり、プログラムの実行過程には今のところ触れません（次章で `@SpringBootApplication` を説明したあと、第20章で初めてアクセス可能なエンドポイントを正式に動かし、Project 1で実行の流れを一通り体験します）。ここでは、プロジェクトを開いたあとにIDEAが裏で何をしているかを簡単に説明します。

1. IDEA 识别到项目根目录下有 `pom.xml`，把它当作一个 Maven 项目导入。<br><span class="ja-inline">🇯🇵 IDEAはプロジェクトのルートディレクトリに `pom.xml` があることを認識し、それをMavenプロジェクトとしてインポートします。</span>
2. IDEA（借助 Maven）读取 `pom.xml` 里声明的所有依赖，联网下载到本地缓存（如果本地还没有的话）。<br><span class="ja-inline">🇯🇵 IDEAは（Mavenを介して）`pom.xml` に宣言されたすべての依存関係を読み込み、ネットに接続してローカルキャッシュにダウンロードします（ローカルにまだない場合）。</span>
3. 依赖下载完成后，IDEA 建立好项目的类路径（classpath），此时项目里的 `import org.springframework...` 等语句才能被正确识别，不会报红。<br><span class="ja-inline">🇯🇵 依存関係のダウンロードが完了すると、IDEAはプロジェクトのクラスパス（classpath）を構築します。この時点でプロジェクト内の `import org.springframework...` などの文が正しく認識されるようになり、赤いエラー表示が出なくなります。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| IDEA 打开项目后，代码里的 Spring 相关类一直标红 | Maven 依赖还没有下载完成，或者网络问题导致下载失败<br><span class="ja-inline">🇯🇵 Mavenの依存関係のダウンロードがまだ完了していない、またはネットワークの問題でダウンロードに失敗している </span>| 等待 IDEA 右下角的进度条走完；确认网络畅通，必要时手动触发"重新导入 Maven 项目"<br><span class="ja-inline">🇯🇵 IDEA右下のプログレスバーが終わるのを待つ。ネットワークが正常か確認し、必要であれば手動で「Mavenプロジェクトの再インポート」を実行する </span>|
| 在 Spring Initializr 页面选错了 Spring Boot 版本 | 网页默认可能不是 4.1.1<br><span class="ja-inline">🇯🇵 ページのデフォルトが4.1.1でない可能性がある </span>| 重新生成一次，确认 Spring Boot 版本下拉框里选中的是本教程锁定的 4.1.1<br><span class="ja-inline">🇯🇵 もう一度生成し直し、Spring Bootバージョンのプルダウンで本チュートリアルが固定している4.1.1が選ばれているか確認する </span>|
| Package name 和后续章节示例代码里的包名对不上，导致代码报错 | 手误填错，或者没有按本教程统一约定填写<br><span class="ja-inline">🇯🇵 入力ミス、または本チュートリアルの統一された取り決めに従って入力していない </span>| Project 1 统一使用 `com.example.hello`，检查生成时填写的 Package name 是否一致<br><span class="ja-inline">🇯🇵 Project 1では `com.example.hello` を統一して使用するので、生成時に入力したPackage nameが一致しているか確認する </span>|
| 忘记删除 `application.properties`，又新建了 `application.yml`，导致两个文件同时存在 | 没有清理旧文件<br><span class="ja-inline">🇯🇵 古いファイルを整理していない </span>| 本教程统一只保留 `application.yml`，删除 `application.properties`，避免配置分散在两个文件里造成混淆<br><span class="ja-inline">🇯🇵 本チュートリアルでは `application.yml` のみを残すことに統一しているので、`application.properties` を削除し、設定が2つのファイルに分散して混乱するのを避ける </span>|

## 动手练习 ／ 演習

1. 实际打开 `start.spring.io`，按本章表格里的配置生成一次 `hello-spring-boot` 项目，下载并用 IDEA 打开。<br><span class="ja-inline">🇯🇵 実際に `start.spring.io` を開き、本章の表の設定に従って `hello-spring-boot` プロジェクトを一度生成し、ダウンロードしてIDEAで開いてみましょう。</span>
2. 对照本章"生成的目录结构"部分，在自己生成的项目里逐一找到对应的文件和目录，确认理解每一部分的作用。<br><span class="ja-inline">🇯🇵 本章の「生成されるディレクトリ構造」の部分と照らし合わせて、自分が生成したプロジェクトの中で対応するファイルとディレクトリを一つずつ見つけ、各部分の役割を理解できているか確認しましょう。</span>
3. 把项目里的 `application.properties` 删除，新建一个空的 `application.yml`，先不写任何内容，确认项目依然能被 IDEA 正常识别（不报错）。<br><span class="ja-inline">🇯🇵 プロジェクト内の `application.properties` を削除し、空の `application.yml` を新規作成します。まだ何も内容を書かず、プロジェクトが依然としてIDEAに正常に認識される（エラーが出ない）ことを確認しましょう。</span>

## 小测验 ／ 小テスト

1. Spring Initializr 网页上的 Group、Artifact、Package name 分别对应项目里的什么？<br><span class="ja-inline">🇯🇵 Spring InitializrのWebページ上のGroup、Artifact、Package nameは、それぞれプロジェクト内の何に対応していますか？</span>
2. 为什么本教程的 Packaging 选择 Jar 而不是 War？（提示：下一章会详细讲原因，这里先记住结论）<br><span class="ja-inline">🇯🇵 なぜ本チュートリアルのPackagingはWarではなくJarを選ぶのですか？（ヒント：詳しい理由は次章で説明します。ここでは結論だけ覚えておきましょう）</span>
3. 本教程为什么统一使用 `application.yml` 而不是 `application.properties`？<br><span class="ja-inline">🇯🇵 本チュートリアルはなぜ `application.properties` ではなく `application.yml` を統一して使うのですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. Group 对应 `pom.xml` 里的 `groupId`；Artifact 对应 `artifactId`（同时也是项目文件夹和最终生成的 jar 包的名字）；Package name 是项目里 Java 类默认所在的包路径。<br><span class="ja-inline">🇯🇵 Groupは `pom.xml` の `groupId` に対応します。Artifactは `artifactId`（同時にプロジェクトフォルダと最終的に生成されるjarファイルの名前でもあります）に対応します。Package nameはプロジェクト内のJavaクラスがデフォルトで属するパッケージパスです。</span>
2. Spring Boot 项目自带内嵌 Tomcat，可以直接打包成一个独立运行的 jar 包，用 `java -jar` 就能启动，不需要像传统 Java Web 项目那样打成 war 包再部署到外部的 Tomcat 服务器里。<br><span class="ja-inline">🇯🇵 Spring Bootプロジェクトは内蔵Tomcatを持っているため、直接独立して実行できるjarファイルにパッケージングでき、`java -jar` で起動できます。従来のJava Webプロジェクトのようにwarファイルにパッケージングして外部のTomcatサーバーにデプロイする必要はありません。</span>
3. 两者效果一样，纯粹是项目约定；本教程统一用 YAML 格式，是因为它用缩进表达配置项之间的层级关系，等后续配置项变多（数据库、日志、Profile 等）时会比一行一行平铺的 `.properties` 格式更清晰。<br><span class="ja-inline">🇯🇵 両者の効果は同じで、純粋にプロジェクトの取り決めです。本チュートリアルがYAML形式を統一して使うのは、インデントで設定項目間の階層関係を表現できるためで、今後設定項目が増えていく（データベース、ログ、Profileなど）につれて、1行ずつ平坦に並べる `.properties` 形式よりも見やすくなります。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经用 Spring Initializr 生成了本教程 Project 1（`hello-spring-boot`）的项目骨架，认清了 `pom.xml`、`src/main/java`、`src/main/resources` 等各部分的作用，并把配置文件统一成了 `application.yml`。下一章我们来搞清楚项目里那个贴着 `@SpringBootApplication` 注解的入口类到底做了什么，为什么这个项目能够"自己跑起来"。

> 🇯🇵 これでSpring Initializrを使って本チュートリアルのProject 1（`hello-spring-boot`）のプロジェクトの骨組みを生成し、`pom.xml`、`src/main/java`、`src/main/resources` などの各部分の役割を理解し、設定ファイルを `application.yml` に統一しました。次章では、プロジェクト内の `@SpringBootApplication` アノテーションが付いたエントリークラスが一体何をしているのか、なぜこのプロジェクトが「自分で動き出す」のかを明らかにしていきます。
