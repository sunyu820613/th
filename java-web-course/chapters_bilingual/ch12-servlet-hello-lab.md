# 第 12 章　Servlet Hello 小实验 ／ 第12章　Servlet Hello 実習

## 本章目标 ／ 本章の目標
亲手写一个最原始的 `HttpServlet`，用 `@WebServlet("/hello")` 声明它处理哪个路径，在 `doGet` 里输出一段 HTML；真正建立起"请求路径 → `doGet` 方法"这条最小调用链的体感，为后面理解 DispatcherServlet 打基础。

> 🇯🇵 最も原始的な `HttpServlet` を自分の手で書き、`@WebServlet("/hello")` でどのパスを処理するかを宣言し、`doGet` の中でHTMLを出力します。「リクエストパス → `doGet` メソッド」という最小限の呼び出し連鎖を実際に体感し、この先DispatcherServlet（ディスパッチャーサーブレット、統一入口となるServlet）を理解するための土台を作ります。

## 一句话理解 ／ 一言で理解する
这一章不讲新概念，只做一件事：把上一章讲的"URL 映射到 Servlet"这套原理，变成你亲手敲出来、能跑起来的几行代码。

> 🇯🇵 この章では新しい概念は説明せず、1つのことだけをやります——前の章で説明した「URLがServletにマッピングされる」という原理を、あなた自身の手で打ち込んで動かせる数行のコードに変換します。

## 为什么需要它 ／ なぜ必要なのか
光看图解、看别人的代码示例，很容易有一种"我好像懂了"的错觉。但"请求怎么找到方法"这件事，只有自己亲手写一遍、看着浏览器地址栏敲下 URL、亲眼看到自己写的那句 `println` 打印出来的内容，才会真正在脑子里扎根。这条最原始的调用链——**一个 URL 对应一个方法**——之后会在 Spring MVC 里以更强大的形式（`@GetMapping`）再次出现，到时候你会一眼认出："这不就是当年 `@WebServlet` 那一套嘛，只是换了个更好用的写法。"

> 🇯🇵 図解や他人のコード例を見るだけでは、「なんとなく分かった気になる」という錯覚に陥りがちです。しかし「リクエストがどうやってメソッドを見つけるのか」ということは、自分の手で一度書いてみて、ブラウザのアドレスバーにURLを打ち込み、自分の書いた `println` の内容が実際に表示されるのを目にして初めて、本当に頭の中に定着します。この最も原始的な呼び出し連鎖——**1つのURLが1つのメソッドに対応する**——は、この後Spring MVCの中でより強力な形（`@GetMapping`）で再び登場します。そのとき、あなたは一目で気づくはずです。「これはあの頃の `@WebServlet` の仕組みと同じじゃないか、もっと便利な書き方に変わっただけだ」と。

## 核心概念 ／ コアコンセプト

本章不引入新概念，只复习并动手实践第 11 章讲过的几个角色：

> 🇯🇵 本章では新しい概念は導入せず、第11章で説明したいくつかの役割を復習しながら、実際に手を動かします。

| 术语 ／ 用語 | 在本章实验里对应什么 ／ 本章の実習での対応 |
|---|---|
| `@WebServlet("/hello")` | 声明"我要处理 `/hello` 这个路径的请求"<br><span class="ja-inline">🇯🇵 「`/hello` というパスのリクエストを処理する」ことを宣言する </span>|
| `HttpServlet` | 我们要继承的父类<br><span class="ja-inline">🇯🇵 私たちが継承する親クラス </span>|
| `doGet` | 浏览器直接在地址栏访问时，发出的就是 `GET` 请求，会调用这个方法<br><span class="ja-inline">🇯🇵 ブラウザのアドレスバーから直接アクセスすると発行されるのは `GET` リクエストであり、このメソッドが呼び出される </span>|
| `HttpServletResponse` | 用来把 HTML 内容写回浏览器<br><span class="ja-inline">🇯🇵 HTMLの内容をブラウザに書き戻すために使う </span>|

关于运行环境，需要说明一句：真正独立部署一个 Servlet 项目，传统上需要搭好 Tomcat 服务器、配置 `web.xml` 或部署描述，这一整套环境搭建过程比较繁琐，而且是"传统部署方式"——本教程后续统一使用 Spring Boot（内嵌 Tomcat，直接运行 `main` 方法就能启动服务器，不需要你自己装 Tomcat、配 `web.xml`）。**这里只需要理解原理，第 18 章开始 Spring Boot 会内嵌 Tomcat，不需要你自己搭。** 所以本章的示例代码，重点是让你看懂"这几行代码为什么能让 `/hello` 触发到 `doGet`"，而不是要求你现在就搭一套完整的传统 Servlet 部署环境。

> 🇯🇵 実行環境について一言補足しておきます。実際にServletプロジェクトを単独でデプロイするには、伝統的にはTomcatサーバーを構築し、`web.xml` やデプロイ記述を設定する必要があり、この一連の環境構築はかなり煩雑で、いわゆる「伝統的なデプロイ方式」です——本チュートリアルではこの先、Spring Boot（内蔵Tomcatを使い、`main` メソッドを実行するだけでサーバーを起動でき、自分でTomcatをインストールしたり `web.xml` を設定したりする必要がない）に統一します。**ここでは原理を理解するだけでよく、第18章からのSpring Bootが内蔵Tomcatを使うので、自分で構築する必要はありません。** そのため本章のサンプルコードは、「これらの数行のコードがなぜ `/hello` から `doGet` をトリガーできるのか」を理解してもらうことに重点を置いており、今すぐ完全な伝統的Servletデプロイ環境を構築することを求めているわけではありません。

小提醒：本教程统一使用 **Jakarta 命名空间**（`jakarta.servlet.*`），这是因为后面第 18 章开始使用的 Spring Boot 4，其底层就是基于 Jakarta 命名空间的 Servlet 规范（区别于早期教程里常见的 `javax.servlet.*`）。这里提前用 `jakarta.servlet.*` 写法，是为了和后面章节保持一致，不需要现在纠结这个历史原因，只需要记住：**本教程全程使用 `jakarta.servlet.*`，不使用 `javax.servlet.*`**。

> 🇯🇵 補足：本チュートリアルでは **Jakarta 名前空間**（`jakarta.servlet.*`）で統一します。これは、この先第18章から使うSpring Boot 4が、その基盤としてJakarta名前空間のServlet仕様に基づいているためです（初期の教材でよく見られる `javax.servlet.*` とは区別されます）。ここで先に `jakarta.servlet.*` の書き方を使うのは、この先の章と一貫性を保つためであり、今この歴史的な経緯にこだわる必要はありません。ただ次のことだけ覚えておいてください——**本チュートリアルでは一貫して `jakarta.servlet.*` を使用し、`javax.servlet.*` は使いません**。

## 图解 ／ 図解

```
浏览器地址栏输入：http://localhost:8080/hello
      │
      │ 发出 GET /hello HTTP/1.1
      ▼
   Tomcat
      │ 查"URL → Servlet"登记表
      │ /hello → HelloServlet（来自 @WebServlet("/hello") 注解）
      ▼
new HelloServlet()（由容器创建）
      │ 因为是 GET 请求，调用：
      ▼
HelloServlet.doGet(req, resp)
      │ resp.getWriter().println("<h1>Hello, Servlet!</h1>");
      ▼
   Tomcat 把 resp 内容封装成 HTTP 响应
      ▼
浏览器显示：Hello, Servlet!
```

这就是本教程要你建立的第一条、也是最原始的一条"调用链"：**一个 URL 路径，最终精确对应到某个类的某个方法**。

> 🇯🇵 これが本チュートリアルであなたに構築してほしい、最初の、そして最も原始的な「呼び出し連鎖」です——**1つのURLパスが、最終的にあるクラスのあるメソッドに正確に対応する**。

## 最小示例 ／ 最小限のサンプル

`HelloServlet.java`：

> 🇯🇵 `HelloServlet.java`：

```java
package com.example.servletdemo;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

@WebServlet("/hello")
public class HelloServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().println("<h1>Hello, Servlet!</h1>");
        resp.getWriter().println("<p>这是我亲手写的第一个 Servlet。</p>");
    }
}
```

要让这段代码能被编译，项目需要引入 Servlet API 依赖（Maven 坐标示例）：

> 🇯🇵 このコードをコンパイルできるようにするには、プロジェクトにServlet APIの依存関係を導入する必要があります（Mavenの座標の例）。

```xml
<dependency>
    <groupId>jakarta.servlet</groupId>
    <artifactId>jakarta.servlet-api</artifactId>
    <version>6.0.0</version>
    <scope>provided</scope>
</dependency>
```

`scope` 设为 `provided` 是因为：真正运行时，Servlet API 由 Tomcat 容器本身提供，我们的项目只是在**编译期**需要用到这些接口和注解，不需要把它打进最终的部署包里。这是传统 Servlet 项目的写法；等第 18 章用 Spring Boot 时，这类底层依赖会由 Spring Boot Starter 自动帮我们管理好，不需要手动引入这个坐标。

> 🇯🇵 `scope` を `provided` に設定する理由は次の通りです。実際の実行時には、Servlet APIはTomcatコンテナ自身が提供します。私たちのプロジェクトは**コンパイル時**にこれらのインターフェースやアノテーションを使う必要があるだけで、最終的なデプロイパッケージに含める必要はありません。これは伝統的なServletプロジェクトの書き方です。第18章でSpring Bootを使うようになると、こうした低レベルの依存関係はSpring Boot Starterが自動的に管理してくれるので、この座標を手動で導入する必要はなくなります。

## 代码逐行解释 ／ コードの行ごとの解説

- `package com.example.servletdemo;`：这只是本章实验用的临时包名，不属于本教程后面统一命名的四个正式项目（`hello-spring-boot`、`user-api-memory`、`user-crud-mysql`、`task-manager`），纯粹用来做这次最小实验。<br><span class="ja-inline">🇯🇵 `package com.example.servletdemo;`：これは本章の実習用の一時的なパッケージ名にすぎず、本チュートリアルで後に統一して命名する4つの正式なプロジェクト（`hello-spring-boot`、`user-api-memory`、`user-crud-mysql`、`task-manager`）には属しません。純粋に今回の最小限の実習のために使うものです。</span>
- `import jakarta.servlet.annotation.WebServlet;` 等：注意这里全部使用 `jakarta.servlet.*` 包路径，而不是老教程里常见的 `javax.servlet.*`。<br><span class="ja-inline">🇯🇵 `import jakarta.servlet.annotation.WebServlet;` など：ここではすべて `jakarta.servlet.*` というパッケージパスを使っており、古い教材でよく見られる `javax.servlet.*` ではないことに注意してください。</span>
- `@WebServlet("/hello")`：声明"这个类处理 `/hello` 路径的请求"，这就是第 11 章讲过的 URL 映射机制，容器启动扫描时会把它登记进"URL → Servlet"表。<br><span class="ja-inline">🇯🇵 `@WebServlet("/hello")`：「このクラスが `/hello` パスのリクエストを処理する」ことを宣言します。これは第11章で説明したURLマッピングの仕組みで、コンテナが起動時にスキャンする際に「URL → Servlet」表に登録されます。</span>
- `public class HelloServlet extends HttpServlet`：继承 `HttpServlet`，表明这是一个标准的 Servlet，容器才能识别并调用它统一约定的方法。<br><span class="ja-inline">🇯🇵 `public class HelloServlet extends HttpServlet`：`HttpServlet` を継承し、これが標準的なServletであることを示します。こうして初めてコンテナはこれを認識し、統一的に規定されたメソッドを呼び出せます。</span>
- `protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException`：重写 `doGet` 方法。方法签名是固定的，必须原样照写（参数类型、抛出的异常类型都不能随便改），因为容器就是按照这个固定签名去调用它的。<br><span class="ja-inline">🇯🇵 `protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException`：`doGet` メソッドをオーバーライドします。メソッドシグネチャは固定されており、そのまま書く必要があります（引数の型や投げる例外の型を勝手に変えてはいけません）。コンテナはこの固定されたシグネチャに従って呼び出しているからです。</span>
- `resp.setContentType("text/html;charset=UTF-8")`：设置响应头的 `Content-Type`，告诉浏览器"接下来的内容按 HTML、UTF-8 编码解析"。<br><span class="ja-inline">🇯🇵 `resp.setContentType("text/html;charset=UTF-8")`：レスポンスヘッダーの `Content-Type` を設定し、ブラウザに「これから続く内容はHTML、UTF-8エンコードで解析してほしい」と伝えます。</span>
- `resp.getWriter().println(...)`：`getWriter()` 拿到一个可以往响应体里写字符内容的对象，`println` 把 HTML 文本写进去（这里"写"的意思是写进响应体 Body，不是打印到控制台）。写了两行，浏览器会把这两行 HTML 拼在一起渲染显示。<br><span class="ja-inline">🇯🇵 `resp.getWriter().println(...)`：`getWriter()` はレスポンスボディに文字内容を書き込めるオブジェクトを取得し、`println` はHTMLテキストをその中に書き込みます（ここでの「書く」とはレスポンスボディ（Body）に書き込むという意味で、コンソールに出力することではありません）。2行書いているので、ブラウザはこの2行のHTMLをつなげてレンダリングし表示します。</span>

## 程序运行过程 ／ プログラムの実行の流れ

针对这个最小示例，逐条回答"程序运行过程"要关注的问题：

> 🇯🇵 この最小限のサンプルについて、「プログラムの実行の流れ」で注目すべき問いに1つずつ答えていきます。

1. **谁调用了这个方法**：不是我们自己的代码调用 `doGet`，而是 Tomcat 容器在收到匹配 `/hello` 路径的 `GET` 请求后主动调用的。<br><span class="ja-inline">🇯🇵 **誰がこのメソッドを呼び出したか**：私たち自身のコードが `doGet` を呼び出すのではなく、Tomcatコンテナが `/hello` パスに一致する `GET` リクエストを受け取った後に自発的に呼び出します。</span>
2. **这个对象是谁创建的**：`HelloServlet` 的实例由容器负责创建，`HttpServletRequest`/`HttpServletResponse` 两个参数对象也是容器构造好、并把这次请求的具体数据填充进去之后，才作为参数传给 `doGet` 的。<br><span class="ja-inline">🇯🇵 **このオブジェクトは誰が作成したか**：`HelloServlet` のインスタンスはコンテナが作成を担当します。`HttpServletRequest`/`HttpServletResponse` という2つの引数オブジェクトも、コンテナが構築し、今回のリクエストの具体的なデータを詰め込んだ後に、引数として `doGet` に渡されます。</span>
3. **请求怎么找到这个类**：容器启动时扫描到 `@WebServlet("/hello")` 注解，把 `"/hello" → HelloServlet` 这条映射记进内部的登记表；浏览器访问 `http://localhost:8080/hello` 时，容器解析出路径 `/hello`，拿它去登记表里查，命中 `HelloServlet`。<br><span class="ja-inline">🇯🇵 **リクエストはどうやってこのクラスを見つけるか**：コンテナは起動時に `@WebServlet("/hello")` アノテーションをスキャンし、`"/hello" → HelloServlet` というマッピングを内部の登録表に記録します。ブラウザが `http://localhost:8080/hello` にアクセスすると、コンテナはパス `/hello` を解析し、それを使って登録表を調べ、`HelloServlet` にヒットします。</span>
4. `doGet` 方法体开始执行：先设置响应的 `Content-Type`，再往响应体里写两行 HTML。<br><span class="ja-inline">🇯🇵 `doGet` メソッドの本体が実行を始めます。まずレスポンスの `Content-Type` を設定し、次にレスポンスボディに2行のHTMLを書き込みます。</span>
5. `doGet` 执行完毕后，容器把 `resp` 里积累的内容按 HTTP 响应报文的格式封装好，通过网络发回浏览器。<br><span class="ja-inline">🇯🇵 `doGet` の実行が完了すると、コンテナは `resp` に蓄積された内容をHTTPレスポンスメッセージの形式に組み立て、ネットワーク経由でブラウザに送り返します。</span>
6. 浏览器收到响应，识别出 `Content-Type` 是 HTML，于是把 Body 内容渲染成页面，最终你在浏览器里看到"Hello, Servlet!"和下面那行说明文字。<br><span class="ja-inline">🇯🇵 ブラウザはレスポンスを受け取り、`Content-Type` がHTMLであると識別し、Bodyの内容をページとしてレンダリングします。最終的にブラウザの中で「Hello, Servlet!」とその下の説明文が表示されます。</span>

完整链路串起来就是：

> 🇯🇵 完全な流れをつなげると次のようになります。

```
浏览器输入 URL
  → Tomcat 接收请求，解析出路径 /hello
  → 查"URL → Servlet"登记表，命中 HelloServlet
  → 容器创建 HelloServlet 实例 + 构造 req/resp
  → 调用 doGet(req, resp)
  → doGet 往 resp 里写 HTML
  → Tomcat 把 resp 封装成 HTTP 响应发回
  → 浏览器渲染显示
```

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 访问 `http://localhost:8080/hello` 报 `404`<br><span class="ja-inline">🇯🇵 `http://localhost:8080/hello` にアクセスすると `404` が出る </span>| `@WebServlet` 注解里的路径和访问路径不一致，或者项目根本没有正确部署到容器里<br><span class="ja-inline">🇯🇵 `@WebServlet` アノテーションのパスとアクセスパスが一致していない、あるいはプロジェクトがそもそもコンテナに正しくデプロイされていない </span>| 检查注解里的字符串是否严格等于 `/hello`；确认项目已经被容器扫描到（本章重点是理解原理，实际部署配置从第 18 章 Spring Boot 开始会大幅简化）<br><span class="ja-inline">🇯🇵 アノテーション内の文字列が厳密に `/hello` と一致しているか確認する。プロジェクトがすでにコンテナにスキャンされているか確認する（本章の重点は原理の理解であり、実際のデプロイ設定は第18章のSpring Bootから大幅に簡略化される） </span>|
| import 报错，找不到 `jakarta.servlet.*`<br><span class="ja-inline">🇯🇵 importでエラーが出て `jakarta.servlet.*` が見つからない </span>| 没有正确引入 `jakarta.servlet-api` 依赖，或者错误地引入了 `javax.servlet-api`<br><span class="ja-inline">🇯🇵 `jakarta.servlet-api` 依存関係を正しく導入していない、あるいは誤って `javax.servlet-api` を導入している </span>| 确认 `pom.xml` 里引入的是 `jakarta.servlet:jakarta.servlet-api`，本教程全程使用 Jakarta 命名空间<br><span class="ja-inline">🇯🇵 `pom.xml` に導入されているのが `jakarta.servlet:jakarta.servlet-api` であることを確認する。本チュートリアルでは一貫してJakarta名前空間を使う </span>|
| 页面显示乱码<br><span class="ja-inline">🇯🇵 ページが文字化けして表示される </span>| 没有设置 `Content-Type` 里的字符编码<br><span class="ja-inline">🇯🇵 `Content-Type` の中で文字エンコードを設定していない </span>| 用 `resp.setContentType("text/html;charset=UTF-8")` 明确指定编码<br><span class="ja-inline">🇯🇵 `resp.setContentType("text/html;charset=UTF-8")` を使ってエンコードを明確に指定する </span>|
| 重写 `doGet` 时方法签名写错（比如漏写 `throws` 或参数类型不对）<br><span class="ja-inline">🇯🇵 `doGet` をオーバーライドする際にメソッドシグネチャを書き間違える（例えば `throws` を書き忘れる、引数の型が違うなど） </span>| 没有严格按照 `HttpServlet` 规定的方法签名重写<br><span class="ja-inline">🇯🇵 `HttpServlet` が規定するメソッドシグネチャに厳密に従ってオーバーライドしていない </span>| 用 IDE 的"重写方法"功能（IntelliJ 里可以用 `Alt+Insert` → Override Methods）自动生成正确的签名，避免手写出错<br><span class="ja-inline">🇯🇵 IDEの「メソッドのオーバーライド」機能（IntelliJでは `Alt+Insert` → Override Methods）を使って正しいシグネチャを自動生成し、手書きによるミスを避ける </span>|

## 动手练习 ／ 演習

1. 把 `doGet` 里输出的内容改成包含你自己名字的一句话，比如 `"<h1>你好，我是小明写的 Servlet</h1>"`。<br><span class="ja-inline">🇯🇵 `doGet` の出力内容を、自分の名前を含む一文に変えてみましょう。例えば `"<h1>こんにちは、太郎が書いたServletです</h1>"` のようにします。</span>
2. 再加一个 `@WebServlet("/hi")` 的新 Servlet 类，输出不同的内容，体会"一个 URL 对应一个处理方法"这个规则。<br><span class="ja-inline">🇯🇵 `@WebServlet("/hi")` という新しいServletクラスをもう1つ追加し、異なる内容を出力してみて、「1つのURLが1つの処理メソッドに対応する」というルールを体感しましょう。</span>
3. 想一想：如果这个网站要做 50 个不同的页面，按现在这种写法，你大概需要写多少个 Servlet 类？每个类里都要重复哪些代码（提示：设置 Content-Type、拼 HTML 字符串）？把你的想法记下来，下一章会专门讨论这个问题。<br><span class="ja-inline">🇯🇵 考えてみましょう：もしこのサイトで50個の異なるページを作るとしたら、今のこの書き方では、おおよそいくつのServletクラスを書く必要があるでしょうか？各クラスの中でどんなコードが繰り返し必要になるでしょうか（ヒント：Content-Typeの設定、HTML文字列の組み立て）。自分の考えをメモしておきましょう。次の章でこの問題を専門的に議論します。</span>

## 小测验 ／ 小テスト

1. 本章示例里，`doGet` 方法是被谁调用的？<br><span class="ja-inline">🇯🇵 本章のサンプルにおいて、`doGet` メソッドは誰に呼び出されますか？</span>
2. 为什么本教程要用 `jakarta.servlet.*` 而不是 `javax.servlet.*`？<br><span class="ja-inline">🇯🇵 なぜ本チュートリアルでは `javax.servlet.*` ではなく `jakarta.servlet.*` を使うのですか？</span>
3. 如果要访问 `/hi` 却触发到了 `HelloServlet` 的 `doGet`，最可能的原因是什么？<br><span class="ja-inline">🇯🇵 `/hi` にアクセスしたいのに `HelloServlet` の `doGet` がトリガーされてしまった場合、最も考えられる原因は何ですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 是 Tomcat 容器在收到匹配的请求后主动调用的，不是我们自己的代码调用它。<br><span class="ja-inline">🇯🇵 Tomcatコンテナが一致するリクエストを受け取った後に自発的に呼び出すものであり、私たち自身のコードが呼び出すわけではありません。</span>
2. 因为本教程后面第 18 章开始使用的 Spring Boot 4，底层基于 Jakarta 命名空间的 Servlet 规范，为了保持前后一致，本章提前统一使用 `jakarta.servlet.*`。<br><span class="ja-inline">🇯🇵 本チュートリアルではこの先第18章から使うSpring Boot 4が、基盤としてJakarta名前空間のServlet仕様に基づいているためです。前後の一貫性を保つために、本章では先に `jakarta.servlet.*` に統一して使っています。</span>
3. 最可能是 `@WebServlet` 注解写错了路径（比如把 `/hi` 误写成了 `/hello`），或者两个 Servlet 的路径映射弄反了。<br><span class="ja-inline">🇯🇵 最も考えられるのは、`@WebServlet` アノテーションのパスを書き間違えた（例えば `/hi` を誤って `/hello` と書いてしまった）、あるいは2つのServletのパスマッピングが逆になっている、というケースです。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经亲手写出并理解了一个最原始的 `HttpServlet`，真实建立起"URL 路径 → `doGet` 方法"这条最小调用链的体感。下一章我们会讨论：如果一个网站有几十上百个页面，还按这种"一个类对应一个 URL"的写法，会遇到什么问题——由此引出对"统一分发入口"的需求。

> 🇯🇵 これで最も原始的な `HttpServlet` を実際に自分の手で書いて理解し、「URLパス → `doGet` メソッド」という最小限の呼び出し連鎖を実際に体感できました。次の章では、もしあるサイトに数十から百のページがあり、依然として「1つのクラスが1つのURLに対応する」という書き方をしていたら、どんな問題に遭遇するかを議論します——ここから「統一された振り分けの入口」の必要性が導き出されます。
