# 第 31 章　参数校验 ／ 第31章　パラメータ検証（バリデーション）

## 本章目标 ／ 本章の目標
掌握 `@NotNull`、`@NotBlank`、`@Email`、`@Size`、`@Valid` 的用法；理解校验发生在 Controller 方法真正执行**之前**，为下一章的全局异常处理打基础。

> 🇯🇵 `@NotNull`、`@NotBlank`、`@Email`、`@Size`、`@Valid` の使い方を身につけます。検証（バリデーション、パラメータが妥当かどうかのチェック）が Controller メソッドが実際に実行される**前**に行われることを理解し、次章のグローバル例外処理（アプリケーション全体で共通化する例外処理）のための土台を築きます。

## 一句话理解 ／ 一言で理解する
在 `TaskCreateRequest` 的字段上贴几个校验注解，加上 `@Valid`，Spring 就会在你的方法真正执行之前，自动帮你检查这些字段是否合法，不合法就直接拦下来，不需要你在方法体里写一堆 `if (title == null) ...` 的判断。

> 🇯🇵 `TaskCreateRequest` のフィールドにいくつかの検証アノテーションを付け、`@Valid` を加えるだけで、Spring はメソッドが実際に実行される前に自動的にこれらのフィールドが妥当かどうかをチェックし、妥当でなければそこで直接せき止めてくれます。メソッド内に大量の `if (title == null) ...` という判定を書く必要はありません。

## 为什么需要它 ／ なぜ必要なのか

上一章的 `TaskCreateRequest` 只有 `title` 和 `description` 两个字段。如果前端不小心（或者恶意）传了一个空标题、甚至根本没传 `title` 字段，会发生什么？

> 🇯🇵 前章の `TaskCreateRequest` には `title` と `description` の2つのフィールドしかありませんでした。もしフロントエンドがうっかり（あるいは悪意を持って）空のタイトルを送ってきたり、`title` フィールドをそもそも送ってこなかったりしたら、何が起こるでしょうか。

如果没有任何校验，`title` 字段就是 `null` 或者空字符串，这个"脏数据"会一路畅通无阻地进入 Service、Mapper，最后存进数据库——数据库里出现一堆标题为空的任务。更糟的是，如果后面某段代码对 `title` 调用了 `.length()` 之类的方法，`title` 是 `null` 就会直接抛出 `NullPointerException`，导致程序在运行中途报错。

> 🇯🇵 何の検証もなければ、`title` フィールドは `null` か空文字列のまま、この「不正なデータ」は Service、Mapper へと何の妨げもなく流れ込み、最終的にデータベースに保存されてしまいます——データベースにタイトルが空のタスクが大量に発生します。さらに悪いことに、もし後続のコードが `title` に対して `.length()` のようなメソッドを呼び出していたら、`title` が `null` の場合は直接 `NullPointerException` が投げられ、プログラムが実行途中でエラーになってしまいます。

与其在方法体里到处写"防御性判断"，不如在字段上声明清楚"这个字段必须满足什么条件"，交给 Spring 在方法执行前统一检查。这样做的好处是：规则写在一个地方（字段声明处），一眼就能看出这个类对字段有什么要求，不用翻遍整个方法体去找校验逻辑。

> 🇯🇵 メソッド内のあちこちに「防御的な判定」を書くよりも、フィールド上に「このフィールドはどんな条件を満たさなければならないか」をはっきり宣言し、Spring にメソッド実行前にまとめてチェックしてもらう方がよいでしょう。こうすることの利点は、ルールが一箇所（フィールドの宣言部分）にまとまり、このクラスがフィールドにどんな要求をしているか一目で分かることです。メソッド全体を読み返して検証ロジックを探す必要がなくなります。

## 核心概念 ／ コアコンセプト

| 注解 ／ アノテーション | 作用 ／ 作用 | 最小示例 ／ 最小限のサンプル |
|---|---|---|
| `@NotNull` | 字段不能是 `null`（但空字符串 `""` 是允许的）<br><span class="ja-inline">🇯🇵 フィールドは `null` であってはならない（ただし空文字列 `""` は許可される） </span>| `@NotNull private Long userId;` |
| `@NotBlank` | 字段不能是 `null`，也不能是空字符串或全是空格（专用于 `String`）<br><span class="ja-inline">🇯🇵 フィールドは `null` であってはならず、空文字列や空白のみであってもならない（`String` 専用） </span>| `@NotBlank private String title;` |
| `@Email` | 字段必须符合邮箱格式<br><span class="ja-inline">🇯🇵 フィールドはメールアドレスの形式に従わなければならない </span>| `@Email private String email;` |
| `@Size` | 限制字符串长度或集合元素个数的范围<br><span class="ja-inline">🇯🇵 文字列の長さやコレクションの要素数の範囲を制限する </span>| `@Size(min = 1, max = 100) private String title;` |
| `@Valid` | 贴在 Controller 方法参数上，告诉 Spring "请对这个参数做校验"<br><span class="ja-inline">🇯🇵 Controller メソッドの引数に付け、Spring に「この引数を検証してください」と伝える </span>| `create(@Valid @RequestBody TaskCreateRequest request)` |

这些注解都来自 Jakarta Bean Validation 规范（`jakarta.validation.constraints` 包），Spring Boot 的 `spring-boot-starter-validation` 依赖里已经包含了具体实现，直接引入即可使用，不需要手写版本号（由 Spring Boot 的依赖管理统一控制）。

> 🇯🇵 これらのアノテーションはいずれも Jakarta Bean Validation 仕様（`jakarta.validation.constraints` パッケージ）に由来します。Spring Boot の `spring-boot-starter-validation` 依存関係にはすでに具体的な実装が含まれているため、そのまま導入すれば使えます。バージョン番号を手で書く必要はありません（Spring Boot の依存管理によって統一的に制御されます）。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## 图解 ／ 図解

```
浏览器提交请求
     ↓
DispatcherServlet 找到 TaskController.create
     ↓
Spring 先看方法参数上有没有 @Valid
     ↓ 有
按照 TaskCreateRequest 字段上的校验注解逐一检查
     ↓
   全部通过 ──────────────▶ 正常执行 create 方法体
     ↓ 有不满足的
抛出 MethodArgumentNotValidException（方法体一行代码都不会执行）
```

## 最小示例 ／ 最小限のサンプル

`dto/TaskCreateRequest.java`（在上一章基础上加上校验注解）
> 🇯🇵 `dto/TaskCreateRequest.java`（前章のコードに検証アノテーションを追加）
```java
package com.example.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class TaskCreateRequest {

    @NotBlank(message = "标题不能为空")
    @Size(max = 100, message = "标题长度不能超过 100 个字符")
    private String title;

    @Size(max = 500, message = "描述长度不能超过 500 个字符")
    private String description;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
```

`controller/TaskController.java`（只展示相关方法）
> 🇯🇵 `controller/TaskController.java`（関連するメソッドのみ表示）
```java
package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskCreateRequest;
import com.example.taskmanager.dto.TaskResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @PostMapping
    public TaskResponse create(@Valid @RequestBody TaskCreateRequest request) {
        // 能执行到这里，说明 title、description 已经通过了校验
        // 具体的转换、保存逻辑同上一章
        ...
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `@NotBlank(message = "标题不能为空")`：贴在 `title` 字段上，`message` 属性是校验失败时用来描述错误的文字，之后会被前端看到。<br><span class="ja-inline">🇯🇵 `@NotBlank(message = "标题不能为空")`：`title` フィールドに付けます。`message` 属性は検証失敗時にエラーを説明するための文字列で、後でフロントエンドに表示されます。</span>
- `@Size(max = 100, message = "...")`：限制字符串最长 100 个字符，也可以同时写 `min` 限制最短长度。<br><span class="ja-inline">🇯🇵 `@Size(max = 100, message = "...")`：文字列の最大長を100文字に制限します。`min` を同時に書いて最短の長さを制限することもできます。</span>
- `@Valid`：贴在 Controller 方法的参数前面，等于告诉 Spring："这个参数是需要校验的，请在调用方法体之前，按照它类里字段上的校验注解逐条检查一遍。"<br><span class="ja-inline">🇯🇵 `@Valid`：Controller メソッドの引数の前に付けます。これは Spring に「この引数は検証が必要です。メソッド本体を呼び出す前に、そのクラスのフィールドに付いた検証アノテーションを一つずつチェックしてください」と伝えるのと同じです。</span>
- `@RequestBody`：把 HTTP 请求体的 JSON 反序列化成 `TaskCreateRequest` 对象（第 21 章讲过），这一步发生在校验**之前**——先把 JSON 变成对象，再对这个对象做校验。<br><span class="ja-inline">🇯🇵 `@RequestBody`：HTTP リクエストボディの JSON を `TaskCreateRequest` オブジェクトにデシリアライズします（第21章で説明済み）。このステップは検証の**前**に行われます——先に JSON をオブジェクトに変換してから、そのオブジェクトを検証します。</span>

**关键点：`@Valid` 的校验发生在 Controller 方法真正执行之前。** 如果 `request` 里有任何字段不满足校验注解的要求，Spring 会直接抛出一个 `MethodArgumentNotValidException` 异常，`create` 方法体里的代码**一行都不会执行**。这个异常现在会导致什么样的 HTTP 响应？下一章"全局异常处理"会专门讲怎么把它转换成清晰的 400 错误信息，而不是让浏览器收到一个看不懂的默认报错页面。

> 🇯🇵 **重要な点：`@Valid` の検証は Controller メソッドが実際に実行される前に行われます。** もし `request` の中に検証アノテーションの要求を満たさないフィールドがあれば、Spring は直接 `MethodArgumentNotValidException` 例外を投げ、`create` メソッド本体のコードは**1行も実行されません**。この例外は今のところどんな HTTP レスポンスを引き起こすのでしょうか？次章の「グローバル例外処理（アプリケーション全体で共通化する例外処理）」では、それをどうやって分かりやすい 400 エラー情報に変換するかを専門に説明し、ブラウザが意味不明なデフォルトのエラーページを受け取らないようにします。

## 程序运行过程 ／ プログラムの実行の流れ

1. 浏览器发送 `POST /tasks`，请求体 JSON 里 `title` 是空字符串 `""`。<br><span class="ja-inline">🇯🇵 ブラウザが `POST /tasks` を送信し、リクエストボディの JSON の `title` は空文字列 `""` です。</span>
2. `DispatcherServlet` 根据 URL 和方法找到 `TaskController.create`（`HandlerMapping` 负责"找谁处理"）。<br><span class="ja-inline">🇯🇵 `DispatcherServlet` は URL とメソッドに基づいて `TaskController.create` を見つけます（`HandlerMapping` が「誰が処理するか」を探す役割を担います）。</span>
3. `HandlerAdapter` 准备调用 `create` 方法之前，先用 Jackson 把请求体反序列化成 `TaskCreateRequest` 对象。<br><span class="ja-inline">🇯🇵 `HandlerAdapter` が `create` メソッドを呼び出す準備をする前に、まず Jackson を使ってリクエストボディを `TaskCreateRequest` オブジェクトにデシリアライズします。</span>
4. `HandlerAdapter` 发现方法参数上有 `@Valid`，于是按照 `TaskCreateRequest` 类里字段上的校验注解逐一检查这个对象。<br><span class="ja-inline">🇯🇵 `HandlerAdapter` はメソッドの引数に `@Valid` があることを発見し、`TaskCreateRequest` クラスのフィールドに付いた検証アノテーションに従ってこのオブジェクトを一つずつチェックします。</span>
5. 检查到 `title` 字段是空字符串，不满足 `@NotBlank`，校验失败。<br><span class="ja-inline">🇯🇵 `title` フィールドが空文字列であることが分かり、`@NotBlank` を満たさないため検証が失敗します。</span>
6. Spring 抛出 `MethodArgumentNotValidException`，`create` 方法体不会被执行，请求处理流程被中断，转而进入异常处理环节（下一章内容）。<br><span class="ja-inline">🇯🇵 Spring は `MethodArgumentNotValidException` を投げ、`create` メソッド本体は実行されず、リクエスト処理の流れが中断されて例外処理の段階（次章の内容）に移ります。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 加了 `@NotBlank` 却完全没生效，脏数据照样进方法体 | Controller 方法参数上忘了加 `@Valid`<br><span class="ja-inline">🇯🇵 Controller メソッドの引数に `@Valid` を付け忘れている </span>| 校验注解只声明"规则"，必须配合 `@Valid` 才会真正触发检查<br><span class="ja-inline">🇯🇵 検証アノテーションは「ルール」を宣言するだけであり、`@Valid` と組み合わせて初めてチェックが実行される </span>|
| 校验失败后浏览器收到一大段看不懂的错误堆栈 | 还没做全局异常处理，Spring 默认返回的错误信息比较原始<br><span class="ja-inline">🇯🇵 まだグローバル例外処理を行っておらず、Spring がデフォルトで返すエラー情報が生の状態のまま </span>| 下一章会讲怎么统一转换成清晰的 JSON 错误信息<br><span class="ja-inline">🇯🇵 次章で分かりやすい JSON エラー情報に統一変換する方法を説明する </span>|
| `@Email` 校验一个 `null` 值也通过了 | `@Email` 本身不检查"是否为空"，只检查"格式是否正确"，`null` 被视为跳过检查<br><span class="ja-inline">🇯🇵 `@Email` 自体は「空かどうか」をチェックせず「形式が正しいかどうか」のみをチェックするため、`null` はチェックをスキップしたものとみなされる </span>| 需要同时加 `@NotBlank`（`String` 类型）或 `@NotNull`（其它类型）<br><span class="ja-inline">🇯🇵 `@NotBlank`（`String` 型の場合）または `@NotNull`（その他の型の場合）を同時に付ける必要がある </span>|

## 动手练习 ／ 演習

1. 给 `TaskCreateRequest` 的 `description` 也加上 `@NotBlank`，观察不传 `description` 时会不会被拦下。<br><span class="ja-inline">🇯🇵 `TaskCreateRequest` の `description` にも `@NotBlank` を付け、`description` を送らなかった場合に検証で止められるかどうか観察しましょう。</span>
2. 参照 `User` 相关的 Request，给邮箱字段加上 `@NotBlank` + `@Email` 两个注解，思考为什么两个要一起用。<br><span class="ja-inline">🇯🇵 `User` 関連の Request を参考に、メールアドレスのフィールドに `@NotBlank` と `@Email` の2つのアノテーションを付け、なぜ両方を一緒に使う必要があるのか考えてみましょう。</span>
3. 故意在 Controller 方法参数上去掉 `@Valid`，重新发一次带空标题的请求，观察是否还会被拦截，验证"注解本身不生效，必须配合 `@Valid`"这个结论。<br><span class="ja-inline">🇯🇵 わざと Controller メソッドの引数から `@Valid` を外し、空のタイトルを付けたリクエストを再度送って、まだ検証で止められるかどうかを観察し、「アノテーション単体では効かず、`@Valid` と組み合わせる必要がある」という結論を確かめましょう。</span>

## 小测验 ／ 小テスト

1. `@NotNull` 和 `@NotBlank` 的区别是什么？<br><span class="ja-inline">🇯🇵 `@NotNull` と `@NotBlank` の違いは何ですか？</span>
2. 校验失败会在 Controller 方法体执行**之前**还是**之后**发生？<br><span class="ja-inline">🇯🇵 検証失敗は Controller メソッド本体の実行の**前**と**後**のどちらに起こりますか？</span>
3. 只在字段上写了 `@NotBlank`，但方法参数上没写 `@Valid`，校验会生效吗？<br><span class="ja-inline">🇯🇵 フィールドに `@NotBlank` だけを書いて、メソッドの引数に `@Valid` を書かなかった場合、検証は有効になりますか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. `@NotNull` 只要求不是 `null`，空字符串 `""` 能通过；`@NotBlank` 专用于字符串，要求既不是 `null`，也不能是空字符串或全空格。<br><span class="ja-inline">🇯🇵 `@NotNull` は `null` でないことのみを要求し、空文字列 `""` は通過できます。`@NotBlank` は文字列専用で、`null` でも空文字列でも全て空白でもないことを要求します。</span>
2. 之前。`@Valid` 的校验发生在 Spring 调用 Controller 方法体之前，一旦校验失败会直接抛出异常，方法体不会被执行。<br><span class="ja-inline">🇯🇵 前です。`@Valid` の検証は Spring が Controller メソッド本体を呼び出す前に行われ、検証が失敗すると直接例外が投げられ、メソッド本体は実行されません。</span>
3. 不会生效。校验注解只是声明规则，必须在方法参数前加上 `@Valid`，Spring 才会真正去检查这个参数。<br><span class="ja-inline">🇯🇵 有効になりません。検証アノテーションはルールを宣言するだけであり、メソッドの引数の前に `@Valid` を付けて初めて、Spring が実際にその引数をチェックします。</span>
</details>

## 本章总结 ／ 本章のまとめ
你学会了用 `@NotBlank`、`@Size` 等注解声明字段规则，并用 `@Valid` 让 Spring 在方法执行前自动完成校验。校验失败目前会抛出一个不太友好的异常，下一章我们用全局异常处理，把它变成清晰的 400 错误响应。

> 🇯🇵 `@NotBlank`、`@Size` などのアノテーションでフィールドのルールを宣言し、`@Valid` を使って Spring にメソッド実行前の検証を自動的に行わせる方法を学びました。検証失敗は今のところあまり親切でない例外を投げますが、次章ではグローバル例外処理を使って、それを分かりやすい 400 エラーレスポンスに変えます。
