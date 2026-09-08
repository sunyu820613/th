# 第 33 章　前后端交互与 CORS ／ 第33章　フロントエンドとバックエンドのやり取りとCORS

## 本章目标 ／ 本章の目標
学会用浏览器原生 `fetch()` 调用自己写的 Spring Boot API；理解 AJAX、JSON、API 这几个词在前后端交互场景下具体指什么；理解跨域（CORS）问题是什么，学会用 `@CrossOrigin` 或全局配置解决它。

> 🇯🇵 ブラウザネイティブの `fetch()` を使って自分で書いた Spring Boot の API（Application Programming Interface、プログラミング用インターフェース）を呼び出せるようになります。AJAX、JSON、API といった言葉がフロントエンドとバックエンドのやり取りの場面で具体的に何を指すのかを理解します。クロスオリジン（CORS）問題とは何かを理解し、`@CrossOrigin` またはグローバル設定でそれを解決する方法を学びます。

## 一句话理解 ／ 一言で理解する
`fetch()` 是浏览器提供的一个"发请求"的工具，让网页可以在不刷新整个页面的情况下，向服务器要数据、发数据；但浏览器出于安全考虑，默认不允许网页向"不是同一个来源"的服务器发请求，这就是跨域问题，需要服务器主动声明"允许谁来访问我"。

> 🇯🇵 `fetch()` はブラウザが提供する「リクエストを送る」ためのツールで、ウェブページがページ全体をリロードすることなくサーバーにデータを要求したり送信したりできるようにします。しかしブラウザはセキュリティ上の理由から、デフォルトではウェブページが「同じオリジン（オリジン、送信元）ではない」サーバーへリクエストを送ることを許可しません。これがクロスオリジン（CORS）問題であり、サーバー側が「誰にアクセスを許可するか」を自ら宣言する必要があります。

## 为什么需要它 ／ なぜ必要なのか

前面几十章我们一直在用 Postman 测试接口——Postman 是一个专门的测试工具，本身不受浏览器的跨域限制。但真实项目里，接口最终是要被一个网页（前端页面）调用的。本章不深入 Vue、React 这类前端框架（那是另一门课的内容），只讲最基础的：一个普通的 HTML 页面，怎么用浏览器自带的 JavaScript 能力去访问我们写的 Spring Boot 接口，以及这中间会遇到的第一个坑——跨域。

> 🇯🇵 これまでの数十章では、ずっと Postman を使って API をテストしてきました——Postman は専用のテストツールであり、それ自体はブラウザのクロスオリジン制限を受けません。しかし実際のプロジェクトでは、API は最終的にウェブページ（フロントエンド画面）から呼び出されることになります。本章では Vue や React といったフロントエンドフレームワークには踏み込まず（それは別の講座の内容です）、最も基礎的な内容——普通の HTML ページが、ブラウザ標準の JavaScript の機能を使って私たちが書いた Spring Boot の API にどうアクセスするか、そしてその過程で最初に出会う落とし穴であるクロスオリジンについてのみ説明します。

## 核心概念 ／ コアコンセプト

| 名词 ／ 用語 | 在本章场景下的含义 ／ 本章での意味 |
|---|---|
| API（Application Programming Interface） | 我们用 Spring Boot 写的那些 `/tasks`、`/users` 接口，就是给前端调用的"编程接口"<br><span class="ja-inline">🇯🇵 Spring Boot で書いた `/tasks`、`/users` などの API が、フロントエンドが呼び出す「プログラミングインターフェース」に当たる </span>|
| JSON | 前后端之间传递数据用的通用文本格式，之前章节返回的 `TaskResponse` 最终就是被序列化成 JSON 传给前端的<br><span class="ja-inline">🇯🇵 フロントエンドとバックエンドの間でデータをやり取りするための汎用テキスト形式。前章までに登場した `TaskResponse` は最終的に JSON にシリアライズされてフロントエンドへ送られる </span>|
| AJAX（Asynchronous JavaScript and XML） | 一种"网页在不重新加载整个页面的情况下，偷偷在后台发请求、拿数据、再更新页面局部内容"的技术统称。名字里虽然有 XML，但现在几乎都是用 JSON，不是真的用 XML<br><span class="ja-inline">🇯🇵 「ウェブページがページ全体を再読み込みすることなく、裏でこっそりリクエストを送ってデータを取得し、ページの一部を更新する」技術の総称。名前に XML とあるが、現在ではほぼ JSON が使われ、実際に XML を使うことはほとんどない </span>|
| `fetch()` | 浏览器原生提供的、用来发起 AJAX 请求的 JavaScript 函数，不需要额外安装任何库<br><span class="ja-inline">🇯🇵 ブラウザがネイティブに提供する、AJAX リクエストを発行するための JavaScript 関数。追加のライブラリをインストールする必要がない </span>|
| 同源（Same Origin） | 协议、域名、端口三者都相同，才算"同一个来源"。比如 `http://localhost:5500` 和 `http://localhost:8080` 端口不同，就不是同源<br><span class="ja-inline">🇯🇵 プロトコル、ドメイン名、ポートの3つが全て同じであって初めて「同一オリジン」と見なされる。例えば `http://localhost:5500` と `http://localhost:8080` はポートが異なるため同一オリジンではない </span>|
| CORS（Cross-Origin Resource Sharing，跨域资源共享） | 浏览器的一种安全机制：默认禁止网页向非同源的服务器发请求，除非服务器明确表示"允许"<br><span class="ja-inline">🇯🇵 ブラウザのセキュリティ機構の一つ。デフォルトでは、サーバーが明確に「許可する」と示さない限り、ウェブページが非同一オリジンのサーバーへリクエストを送ることを禁止する </span>|

## 图解 ／ 図解

```
你双击打开的 HTML 页面                    Spring Boot 后端
http://localhost:5500/index.html         http://localhost:8080/tasks
       │                                          │
       │  fetch('http://localhost:8080/tasks')    │
       ├─────────────────────────────────────────▶│
       │                                          │
       │        浏览器先检查：这是跨域请求吗？        │
       │        端口 5500 ≠ 端口 8080，是跨域       │
       │                                          │
       │   服务器有没有声明"允许 5500 这个来源访问"？  │
       │        没有 ──▶ 浏览器直接拦截，报错        │
       │        有  ──▶ 放行，正常拿到 JSON 数据      │
```

## 最小示例 ／ 最小限のサンプル

### fetch() 调用 API ／ fetch() でAPIを呼び出す

`index.html`
```html
<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <title>任务列表</title>
</head>
<body>
    <h1>我的任务</h1>
    <ul id="task-list"></ul>

    <script>
        // 用 fetch 发一个 GET 请求，访问我们自己的 Spring Boot 接口
        fetch('http://localhost:8080/tasks')
            .then(response => response.json())   // 把响应体解析成 JSON 对象
            .then(data => {
                const ul = document.getElementById('task-list');
                data.forEach(task => {
                    const li = document.createElement('li');
                    li.textContent = task.title;
                    ul.appendChild(li);
                });
            })
            .catch(error => console.error('请求失败：', error));
    </script>
</body>
</html>
```

把这个文件用浏览器直接打开（或者用 IDEA/VS Code 自带的静态页面服务功能打开），此时页面的地址和 `http://localhost:8080` 不是同一个来源，这就是接下来要解决的跨域问题。

> 🇯🇵 このファイルをブラウザで直接開く（あるいは IDEA/VS Code 付属の静的ページサーバー機能で開く）と、このページのアドレスは `http://localhost:8080` と同一オリジンではありません。これがこれから解決するクロスオリジン問題です。

### 解决跨域：方式一，单个 Controller 加 `@CrossOrigin` ／ クロスオリジンの解決：方法1、個々のControllerに`@CrossOrigin`を追加する

```java
package com.example.taskmanager.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
@CrossOrigin(origins = "http://localhost:5500")   // 只允许这个来源访问
public class TaskController {
    // ... 方法不变
}
```

### 解决跨域：方式二，全局配置（推荐，一次配置对所有 Controller 生效） ／ クロスオリジンの解決：方法2、グローバル設定（推奨、一度設定すれば全てのControllerに有効）

`config/CorsConfig.java`
```java
package com.example.taskmanager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")                          // 对所有接口路径生效
                .allowedOrigins("http://localhost:5500")     // 允许的前端来源
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("*");
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `fetch('http://localhost:8080/tasks')`：向指定 URL 发起一个默认的 GET 请求，返回一个 `Promise`（可以先简单理解成"一个会在将来某个时刻完成的操作"）。<br><span class="ja-inline">🇯🇵 `fetch('http://localhost:8080/tasks')`：指定した URL にデフォルトの GET リクエストを送り、`Promise`（プロミス、「将来のある時点で完了する処理」と簡単に理解しておけばよい）を返します。</span>
- `.then(response => response.json())`：请求返回后，把响应体（原始是文本）解析成 JSON 对象，这一步同样返回一个 `Promise`。<br><span class="ja-inline">🇯🇵 `.then(response => response.json())`：リクエストが返ってきた後、レスポンスボディ（元はテキスト）を JSON オブジェクトに解析します。このステップも同様に `Promise` を返します。</span>
- `.then(data => {...})`：拿到解析后的 JSON 数据（这里是任务数组），遍历并动态创建 `<li>` 标签插入页面——**整个过程页面没有刷新**，这正是 AJAX 名字里"Asynchronous（异步）"的体现。<br><span class="ja-inline">🇯🇵 `.then(data => {...})`：解析された JSON データ（ここではタスクの配列）を受け取り、繰り返し処理をして `<li>` タグを動的に作成しページに挿入します——**この過程でページは一切リロードされません**。これがまさに AJAX の名前にある「Asynchronous（非同期）」の表れです。</span>
- `@CrossOrigin(origins = "...")`：贴在 Controller 类或方法上，告诉 Spring MVC"这个接口允许指定来源的跨域请求"。只在小范围试验或个别接口需要单独配置时使用。<br><span class="ja-inline">🇯🇵 `@CrossOrigin(origins = "...")`：Controller クラスまたはメソッドに付け、Spring MVC に「この API は指定したオリジンからのクロスオリジンリクエストを許可する」と伝えます。小規模な試験や個別の API だけ設定が必要な場合に使います。</span>
- `WebMvcConfigurer` + `addCorsMappings`：更推荐的做法，写一次全局配置，对整个项目所有接口统一生效，不用每个 Controller 都加一遍 `@CrossOrigin`。<br><span class="ja-inline">🇯🇵 `WebMvcConfigurer` + `addCorsMappings`：より推奨されるやり方で、一度グローバル設定を書けばプロジェクト全体の全ての API に統一的に適用され、各 Controller に毎回 `@CrossOrigin` を付ける必要がありません。</span>
- `allowedOrigins("http://localhost:5500")`：生产环境要写具体的、可信的域名，不建议图省事写成 `"*"`（允许任何来源），那样等于关掉了这层安全保护。<br><span class="ja-inline">🇯🇵 `allowedOrigins("http://localhost:5500")`：本番環境では具体的で信頼できるドメイン名を書くべきで、手間を省くために `"*"`（任意のオリジンを許可）と書くのは推奨されません。それではこのセキュリティ保護層を無効にしてしまうのと同じです。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. 浏览器打开 `index.html`，执行到 `fetch(...)`，向 `http://localhost:8080/tasks` 发起 GET 请求。<br><span class="ja-inline">🇯🇵 ブラウザが `index.html` を開き、`fetch(...)` の箇所を実行し、`http://localhost:8080/tasks` へ GET リクエストを発行します。</span>
2. 浏览器发现当前页面的来源（`http://localhost:5500`）和目标地址的来源（`http://localhost:8080`）不同，判定为跨域请求。<br><span class="ja-inline">🇯🇵 ブラウザは現在のページのオリジン（`http://localhost:5500`）と目的地のオリジン（`http://localhost:8080`）が異なることを検知し、クロスオリジンリクエストと判定します。</span>
3. 请求依然会被发出（浏览器不会连请求都不发），但浏览器会检查服务器返回的响应头里有没有 `Access-Control-Allow-Origin` 这类字段，判断是否"允许"这次跨域。<br><span class="ja-inline">🇯🇵 リクエストは依然として送信されます（ブラウザはリクエスト自体を送らないわけではありません）が、ブラウザはサーバーが返すレスポンスヘッダーに `Access-Control-Allow-Origin` のようなフィールドがあるかを確認し、今回のクロスオリジンを「許可」するかどうかを判断します。</span>
4. 如果 Spring Boot 配置了 CORS（本章的 `@CrossOrigin` 或 `CorsConfig`），响应头里会带上允许的来源信息，浏览器放行，`fetch` 的 `.then` 正常拿到数据。<br><span class="ja-inline">🇯🇵 もし Spring Boot が CORS を設定していれば（本章の `@CrossOrigin` または `CorsConfig`）、レスポンスヘッダーに許可されたオリジンの情報が付き、ブラウザは通過させ、`fetch` の `.then` が正常にデータを取得します。</span>
5. 如果没有配置，浏览器会拦截这次响应，`fetch` 的 `.catch` 会捕获到一个跨域相关的错误，`Network` 面板里能看到请求实际上发出去了、服务器也确实返回了数据，只是被浏览器挡在了 JavaScript 代码能读取的范围之外。<br><span class="ja-inline">🇯🇵 設定していない場合、ブラウザはこのレスポンスを遮断し、`fetch` の `.catch` がクロスオリジンに関するエラーを捕捉します。`Network` パネルではリクエストが実際に送信され、サーバーも確かにデータを返していることが確認できますが、JavaScript コードが読み取れる範囲の外でブラウザにブロックされているだけです。</span>
6. Controller → Service → Mapper → MySQL 这条链路和之前章节完全一样，本章新增的只是"响应最终能不能被浏览器里的网页代码读取"这一层。<br><span class="ja-inline">🇯🇵 Controller → Service → Mapper → MySQL という一連の流れは前章までと全く同じで、本章で新たに加わったのは「レスポンスが最終的にブラウザ内のウェブページコードから読み取れるかどうか」という層だけです。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 浏览器控制台报 `Access to fetch at ... has been blocked by CORS policy` | 服务器没有配置允许该来源的跨域访问<br><span class="ja-inline">🇯🇵 サーバーがそのオリジンからのクロスオリジンアクセスを許可する設定をしていない </span>| 用 `@CrossOrigin` 或全局 `CorsConfig` 声明允许的来源<br><span class="ja-inline">🇯🇵 `@CrossOrigin` またはグローバルな `CorsConfig` で許可するオリジンを宣言する </span>|
| Network 面板显示接口确实返回了 200 和数据，但页面上什么都没显示 | 跨域被浏览器拦截，`.then` 逻辑没有真正执行，只是走到了 `.catch`<br><span class="ja-inline">🇯🇵 クロスオリジンがブラウザにブロックされ、`.then` のロジックは実際には実行されず `.catch` に入っている </span>| 检查是否配置了 CORS；打开浏览器控制台看具体报错信息<br><span class="ja-inline">🇯🇵 CORS が設定されているか確認する。ブラウザのコンソールで具体的なエラー情報を確認する </span>|
| 本地文件直接双击打开（`file://` 协议）调用接口，报错更奇怪 | `file://` 协议本身和 `http://` 不是同源，情况更特殊<br><span class="ja-inline">🇯🇵 `file://` プロトコル自体が `http://` と同一オリジンではなく、状況がより特殊である </span>| 用 IDEA/VS Code 的本地静态服务器功能以 `http://localhost:xxxx` 方式打开页面，而不是直接双击文件<br><span class="ja-inline">🇯🇵 IDEA/VS Code のローカル静的サーバー機能を使い、ファイルを直接ダブルクリックするのではなく `http://localhost:xxxx` の形でページを開く </span>|

## 动手练习 ／ 演習

1. 把 `index.html` 中的 `fetch` 改成调用 `/tasks/1`（假设存在 id 为 1 的任务），把返回结果的标题显示在页面上。<br><span class="ja-inline">🇯🇵 `index.html` の `fetch` を `/tasks/1`（id が 1 のタスクが存在すると仮定）を呼び出すように変更し、返ってきた結果のタイトルをページに表示しましょう。</span>
2. 故意先不加 `@CrossOrigin` 或 `CorsConfig`，用浏览器打开页面观察控制台报什么错误，再加上配置观察区别。<br><span class="ja-inline">🇯🇵 わざと `@CrossOrigin` や `CorsConfig` を付けずに、ブラウザでページを開いてコンソールにどんなエラーが出るか観察し、その後設定を加えて違いを観察しましょう。</span>
3. 尝试用 `fetch` 发一个 `POST` 请求（配合 `method: 'POST'`、`headers: {'Content-Type': 'application/json'}`、`body: JSON.stringify({...})`），调用第 30 章的新建任务接口。<br><span class="ja-inline">🇯🇵 `fetch` を使って `POST` リクエスト（`method: 'POST'`、`headers: {'Content-Type': 'application/json'}`、`body: JSON.stringify({...})` を組み合わせる）を送り、第30章のタスク新規作成 API を呼び出してみましょう。</span>

## 小测验 ／ 小テスト

1. AJAX 这个词的核心含义是什么？<br><span class="ja-inline">🇯🇵 AJAX という言葉の核心的な意味は何ですか？</span>
2. 什么情况下算作"跨域"？<br><span class="ja-inline">🇯🇵 どんな場合に「クロスオリジン」と見なされますか？</span>
3. `@CrossOrigin` 应该写在哪里？<br><span class="ja-inline">🇯🇵 `@CrossOrigin` はどこに書くべきですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 网页在不重新加载整个页面的情况下，在后台发起请求、获取数据并局部更新页面内容。<br><span class="ja-inline">🇯🇵 ウェブページがページ全体を再読み込みすることなく、裏でリクエストを発行してデータを取得し、ページの一部を更新することです。</span>
2. 请求发起页面的协议、域名、端口，只要有一个和目标服务器不同，就算跨域。<br><span class="ja-inline">🇯🇵 リクエストを発行するページのプロトコル、ドメイン名、ポートのうち、一つでも目的のサーバーと異なればクロスオリジンと見なされます。</span>
3. 贴在 Controller 类或具体方法上，也可以通过全局的 `WebMvcConfigurer` 配置一次对所有接口生效。<br><span class="ja-inline">🇯🇵 Controller クラスまたは具体的なメソッドに付けます。またグローバルな `WebMvcConfigurer` で一度設定すれば全ての API に有効にすることもできます。</span>
</details>

## 本章总结 ／ 本章のまとめ
你学会了用浏览器原生 `fetch()` 调用自己的 Spring Boot 接口，理解了 AJAX/JSON/API 这几个常见词的含义，也解决了前后端分开部署时必然会遇到的跨域问题。下一章我们学习 Git 基础，为团队协作开发做准备。

> 🇯🇵 ブラウザネイティブの `fetch()` を使って自分の Spring Boot API を呼び出す方法を学び、AJAX/JSON/API といったよく使われる言葉の意味を理解し、フロントエンドとバックエンドを分離してデプロイする際に必ず出会うクロスオリジン問題も解決しました。次の章では Git（バージョン管理ツール）の基礎を学び、チーム開発への準備を進めます。
