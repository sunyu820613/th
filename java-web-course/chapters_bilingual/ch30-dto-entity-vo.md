# 第 30 章　DTO / Entity / VO 边界 ／ 第30章　DTO / Entity / VO の境界

## 本章目标 ／ 本章の目標
理解为什么不能永远把数据库 Entity 直接返回给前端；认识 `Entity`、`DTO`、`Request`、`Response`、`VO` 这几个常见命名各自大致的分工；明确这些命名不是 Java 或 Spring 的官方规定，只是企业里常见的约定。

> 🇯🇵 データベースの Entity（エンティティ、データベーステーブルに対応するクラス）をなぜ永遠にそのままフロントエンドへ返してはいけないのかを理解します。`Entity`、`DTO`（Data Transfer Object、データ転送オブジェクト）、`Request`、`Response`、`VO`（Value Object、値オブジェクト）といったよく使われる命名がそれぞれどんな役割を担うのかを把握します。そして、これらの命名は Java や Spring の公式ルールではなく、企業でよく使われる慣習にすぎないことを明確にします。

## 一句话理解 ／ 一言で理解する
数据库表长什么样，和前端页面需要看到什么、前端提交上来什么，是三件不完全一样的事情，所以企业项目里通常会分别用不同的类来表示它们，而不是自始至终只用一个类。

> 🇯🇵 データベーステーブルの形、フロントエンド画面が表示したい内容、フロントエンドが送信してくる内容——この三つは完全には一致しません。そのため企業のプロジェクトでは、最初から最後まで一つのクラスだけを使うのではなく、それぞれ別のクラスで表現するのが一般的です。

## 为什么需要它 ／ なぜ必要なのか

从第 24 章到现在，我们的例子里经常是"Controller 收到请求 → 直接用 Entity 接收参数 → 直接把 Entity 返回给前端"。这种写法能跑通，但放到真实项目里会有两个明显的问题。

> 🇯🇵 第24章から今まで、私たちの例では「Controller がリクエストを受け取る → 直接 Entity でパラメータを受け取る → Entity をそのままフロントエンドへ返す」というやり方をよく使ってきました。この書き方でも動作はしますが、実際のプロジェクトに持ち込むと2つの明らかな問題が出てきます。

**问题一：安全风险。** 假设 `User` 这个 Entity 对应数据库里的 `user` 表，表里有一列 `password`（哪怕是加密后的密码）。如果 Controller 里直接把查出来的 `User` 对象返回给前端：

> 🇯🇵 **問題1：セキュリティリスク。** `User` という Entity がデータベースの `user` テーブルに対応していて、テーブルに `password` という列がある（暗号化されたパスワードであっても）と仮定します。もし Controller で取得した `User` オブジェクトをそのままフロントエンドへ返すと——

```java
@GetMapping("/{id}")
public User getUser(@PathVariable Long id) {
    return userService.getById(id);
}
```

Jackson 会把 `User` 对象的**所有字段**都序列化成 JSON，包括 `password`。也就是说，密码的密文会原样出现在浏览器能看到的响应里——这是一个真实存在的安全隐患，不只是"不好看"的问题。类似的还有一些内部状态字段，比如"账号是否被后台标记为风控中"这种字段，也不适合让前端看到。

> 🇯🇵 Jackson（Java オブジェクトと JSON を相互変換するライブラリ）は `User` オブジェクトの**全てのフィールド**を JSON にシリアライズ（オブジェクトを文字列などの形式に変換すること）してしまい、`password` も含まれます。つまり、暗号化されたパスワードがそのままブラウザが見えるレスポンスに現れてしまいます——これは「見た目が良くない」というだけでなく、実在する深刻なセキュリティリスクです。同様に「アカウントが裏でリスク管理対象としてマークされているか」といった内部状態のフィールドも、フロントエンドに見せるべきではありません。

**问题二：字段不一定对得上。** 数据库表结构和前端页面需要的数据，很多时候并不是一一对应的。比如：

> 🇯🇵 **問題2：フィールドが必ずしも一致しない。** データベースのテーブル構造とフロントエンド画面が必要とするデータは、多くの場合1対1で対応しているわけではありません。例えば——

- 新建一个任务时，前端只需要传 `title`（标题）和 `description`（描述），不应该、也不能传 `id`（数据库自增主键，还没生成）或 `createTime`（创建时间，应该由服务器自己填）。<br><span class="ja-inline">🇯🇵 新しいタスクを作成するとき、フロントエンドは `title`（タイトル）と `description`（説明）だけを送ればよく、`id`（データベースの自動採番される主キー、まだ生成されていない）や `createTime`（作成日時、サーバー自身が設定すべき）を送るべきではなく、また送ることもできません。</span>
- 返回给前端展示的任务列表，可能需要把 `userId` 换算成 `username`（负责人的名字），而这在 `Task` 表里本身只存了一个数字 `userId`，并不存 `username`。<br><span class="ja-inline">🇯🇵 フロントエンドに表示するために返すタスク一覧では、`userId` を `username`（担当者の名前）に変換する必要があるかもしれませんが、`Task` テーブル自体には数字の `userId` しか保存されておらず、`username` は保存されていません。</span>

正因为"数据库要存什么"和"前端要看什么/传什么"经常不是同一件事，所以企业项目通常会用**不同的类**分别表示这几种场景，而不是让一个 Entity 类身兼数职。

> 🇯🇵 「データベースが何を保存すべきか」と「フロントエンドが何を見たいか／送りたいか」はしばしば別々の事柄であるため、企業のプロジェクトでは通常、一つの Entity クラスに複数の役割を兼任させるのではなく、**別々のクラス**でこれらの場面を表現します。

## 核心概念 ／ コアコンセプト

下面这套命名，以本教程最终项目 `task-manager` 里的 `Task` 为例：

> 🇯🇵 以下の命名は、本チュートリアルの最終プロジェクト `task-manager` の `Task` を例にしています。

| 类名 ／ クラス名 | 用途 ／ 用途 |
|---|---|
| `TaskEntity`（本教程简写为 `Task`） | 和数据库 `task` 表一一对应，字段是数据库有什么这里就有什么，交给 MyBatis-Plus 做数据库映射用<br><span class="ja-inline">🇯🇵 データベースの `task` テーブルと1対1で対応し、フィールドはデータベースにあるものがそのまま存在します。MyBatis-Plus（MyBatis を拡張したライブラリ）のデータベースマッピングに使われます</span> |
| `TaskDTO` | 业务逻辑层内部流转用的对象（可选，很多小项目会省略这一层，直接用 Entity 在 Service 内部传递）<br><span class="ja-inline">🇯🇵 ビジネスロジック層の内部でやり取りされるオブジェクト（任意。小規模プロジェクトの多くはこの層を省略し、Entity を Service 内部でそのまま受け渡しします） </span>|
| `TaskCreateRequest` | 前端"新建任务"时提交上来的数据，只包含新建需要的字段（比如 `title`、`description`）<br><span class="ja-inline">🇯🇵 フロントエンドが「タスクを新規作成」する際に送信するデータで、新規作成に必要なフィールド（`title`、`description` など）のみを含みます</span> |
| `TaskUpdateRequest` | 前端"更新任务"时提交上来的数据，字段可能和创建时不完全一样（比如允许单独改 `status`）<br><span class="ja-inline">🇯🇵 フロントエンドが「タスクを更新」する際に送信するデータで、フィールドは作成時と完全に同じとは限りません（例えば `status` だけ個別に変更できる場合など） </span>|
| `TaskResponse` | 返回给前端的数据，只包含前端需要展示、且可以公开的字段<br><span class="ja-inline">🇯🇵 フロントエンドに返すデータで、フロントエンドが表示する必要があり、かつ公開してよいフィールドのみを含みます </span>|
| `TaskVO` | 有些项目里，`VO`（Value Object，值对象）代替 `Response` 承担同样的角色——"给前端/给视图层展示用的对象"<br><span class="ja-inline">🇯🇵 一部のプロジェクトでは、`VO`（Value Object、値オブジェクト）が `Response` の代わりに同じ役割——「フロントエンド／ビュー層に表示するためのオブジェクト」——を担います </span>|

**必须特别强调的一点：以上这套命名没有全行业统一的标准。** 不同公司、不同团队、甚至同一家公司的不同项目组，都可能有自己的一套约定：有的项目把 `Response` 和 `VO` 当成完全相同的东西混着用；有的项目干脆不分 DTO 和 Entity；有的项目把"前端传入的数据"统一叫 `Form` 而不是 `Request`。本章教你这套命名，**目的是让你以后接触企业项目时，看到 `xxxEntity`、`xxxDTO`、`xxxRequest`、`xxxResponse`、`xxxVO` 这些类名，能大致猜出它们在整个流程里扮演什么角色**，而不是要求你把这套命名当成必须死记硬背、放之四海而皆准的规则。换一家公司，你完全可能看到不一样的叫法，理解"为什么要拆分"比记住"具体叫什么"重要得多。

> 🇯🇵 **特に強調しておきたいのは、以上の命名は業界全体で統一された標準ではないということです。** 会社やチームが違えば、あるいは同じ会社の異なるプロジェクトチームでも、独自の約束事を持っていることがあります。`Response` と `VO` を完全に同じものとして混用しているプロジェクトもあれば、そもそも DTO と Entity を分けていないプロジェクトもあり、「フロントエンドから渡されるデータ」を `Request` ではなく統一して `Form` と呼ぶプロジェクトもあります。本章がこの命名を教える**目的は、今後企業のプロジェクトに触れたときに `xxxEntity`、`xxxDTO`、`xxxRequest`、`xxxResponse`、`xxxVO` といったクラス名を見て、それが全体の流れの中でどんな役割を果たしているかをおおよそ推測できるようになることであり**、この命名を丸暗記すべき万能ルールとして覚えることを求めているわけではありません。会社が変われば全く違う呼び方に出会うこともあり得ます。「なぜ分割するのか」を理解することの方が、「具体的に何と呼ぶか」を覚えるよりずっと重要です。

## 图解 ／ 図解

```
前端提交数据                        Controller 内部转换                    返回给前端
TaskCreateRequest   ──转换为──▶   Task（Entity，存入数据库）  ──转换为──▶   TaskResponse
（只有 title、description）        （补上 id、createTime 等）             （只挑前端需要展示的字段）
```

## 最小示例 ／ 最小限のサンプル

`dto/TaskCreateRequest.java`
```java
package com.example.taskmanager.dto;

// 前端"新建任务"时提交的数据：只需要标题和描述，不需要 id、创建时间这些由服务器生成的字段
public class TaskCreateRequest {

    private String title;
    private String description;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
```

`entity/Task.java`
```java
package com.example.taskmanager.entity;

import java.time.LocalDateTime;

// 和数据库 task 表一一对应
public class Task {

    private Long id;
    private String title;
    private String description;
    private String status;       // 比如 "TODO"、"DONE"
    private Long userId;         // 这个任务属于哪个用户
    private LocalDateTime createTime;

    // getter/setter 省略（实际项目中请补全，或用 Lombok 的 @Data 自动生成）
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
```

`dto/TaskResponse.java`
```java
package com.example.taskmanager.dto;

import java.time.LocalDateTime;

// 返回给前端的数据：只挑前端需要看到的字段，不暴露内部实现细节
public class TaskResponse {

    private Long id;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createTime;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getCreateTime() { return createTime; }
    public void setCreateTime(LocalDateTime createTime) { this.createTime = createTime; }
}
```

`controller/TaskController.java`（只展示和转换相关的部分）
> 🇯🇵 `controller/TaskController.java`（変換に関係する部分のみ表示）
```java
package com.example.taskmanager.controller;

import com.example.taskmanager.dto.TaskCreateRequest;
import com.example.taskmanager.dto.TaskResponse;
import com.example.taskmanager.entity.Task;
import com.example.taskmanager.service.TaskService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public TaskResponse create(@RequestBody TaskCreateRequest request) {
        // 第一步：Request → Entity，补上服务器要负责生成的字段
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus("TODO");                 // 新建任务默认状态
        task.setCreateTime(LocalDateTime.now()); // 创建时间由服务器决定，不能由前端传

        Task saved = taskService.save(task);

        // 第二步：Entity → Response，只挑前端需要的字段返回
        TaskResponse response = new TaskResponse();
        response.setId(saved.getId());
        response.setTitle(saved.getTitle());
        response.setDescription(saved.getDescription());
        response.setStatus(saved.getStatus());
        response.setCreateTime(saved.getCreateTime());
        return response;
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `TaskCreateRequest` 只有 `title` 和 `description` 两个字段——因为新建任务时，前端也只应该能传这两个字段。如果直接用 `Task` Entity 接收请求体，前端理论上就能在 JSON 里塞一个 `id` 或者 `status` 进来，绕过服务器本该有的控制。<br><span class="ja-inline">🇯🇵 `TaskCreateRequest` には `title` と `description` の2つのフィールドしかありません——タスクを新規作成する際、フロントエンドはこの2つのフィールドしか送れないようにすべきだからです。もし `Task` Entity で直接リクエストボディを受け取ってしまうと、理論上フロントエンドは JSON に `id` や `status` を紛れ込ませることができ、サーバーが本来持つべき制御を回避できてしまいます。</span>
- Controller 里先把 `request` 的字段一个个搬到新建的 `Task` 对象上，同时把 `status`、`createTime` 这些"不该由前端决定"的字段在服务器这一侧填好——这一步就是本章说的"转换"。<br><span class="ja-inline">🇯🇵 Controller ではまず `request` のフィールドを一つずつ新しく作った `Task` オブジェクトに移し、同時に `status`、`createTime` といった「フロントエンドが決めるべきでない」フィールドをサーバー側で設定します——このステップが本章で言う「変換」です。</span>
- `taskService.save(task)` 保存后返回的 `saved` 是完整的 `Task`（这时候已经有数据库生成的 `id` 了）。<br><span class="ja-inline">🇯🇵 `taskService.save(task)` が保存後に返す `saved` は完全な `Task` です（この時点でデータベースが生成した `id` がすでに設定されています）。</span>
- 最后再把 `saved` 里前端需要的字段一个个搬到 `TaskResponse` 上返回——这一步同样是"转换"，作用是"只暴露该暴露的字段"。<br><span class="ja-inline">🇯🇵 最後に `saved` からフロントエンドが必要とするフィールドを一つずつ `TaskResponse` に移して返します——このステップも同じく「変換」であり、「公開すべきフィールドだけを公開する」ことが目的です。</span>

这里为了讲清楚"转换"的过程，是手写的字段搬运代码；实际项目中字段一多，手写会很啰嗦，很多团队会引入 MapStruct 之类的工具自动生成这部分代码，这属于本教程之后可以自行拓展的内容，不在正文展开。

> 🇯🇵 ここでは「変換」の流れを分かりやすく示すため、フィールドを手作業でコピーするコードにしています。実際のプロジェクトではフィールドが多くなると手書きは非常に冗長になるため、多くのチームは MapStruct のようなツールを導入してこの部分のコードを自動生成します。これは本チュートリアルの範囲を超えて各自で発展させられる内容なので、本文では詳しく扱いません。

## 程序运行过程 ／ プログラムの実行の流れ

1. 前端发送 `POST /tasks`，请求体是 JSON，只包含 `title` 和 `description`。<br><span class="ja-inline">🇯🇵 フロントエンドが `POST /tasks` を送信します。リクエストボディは JSON で、`title` と `description` のみを含みます。</span>
2. Spring MVC 的 `HandlerAdapter` 调用 `TaskController.create` 方法之前，会先用 Jackson 把请求体 JSON 反序列化成一个 `TaskCreateRequest` 对象（这一步和 Java 对象转 JSON 是反方向的操作，第 21 章讲过 JSON 与 Jackson 的互转原理）。<br><span class="ja-inline">🇯🇵 Spring MVC の `HandlerAdapter` は `TaskController.create` メソッドを呼び出す前に、まず Jackson を使ってリクエストボディの JSON を `TaskCreateRequest` オブジェクトにデシリアライズ（逆シリアライズ、JSON をオブジェクトへ戻すこと）します（これは Java オブジェクトを JSON に変換するのと逆方向の操作で、第21章で JSON と Jackson の相互変換の仕組みを説明しました）。</span>
3. 方法体内手动把 `TaskCreateRequest` 转成 `Task` Entity，交给 Service 保存到数据库。<br><span class="ja-inline">🇯🇵 メソッド内では手動で `TaskCreateRequest` を `Task` Entity に変換し、Service に渡してデータベースに保存します。</span>
4. Service/Mapper 把新建好的 `Task`（带上数据库生成的 `id`）返回给 Controller。<br><span class="ja-inline">🇯🇵 Service/Mapper は新規作成された `Task`（データベースが生成した `id` 付き）を Controller に返します。</span>
5. Controller 再把 `Task` 转成 `TaskResponse`，作为方法返回值。<br><span class="ja-inline">🇯🇵 Controller はさらに `Task` を `TaskResponse` に変換し、メソッドの戻り値とします。</span>
6. Spring MVC 用 `HttpMessageConverter`（底层是 Jackson）把 `TaskResponse` 对象序列化成 JSON，作为 HTTP 响应体返回给浏览器。<br><span class="ja-inline">🇯🇵 Spring MVC は `HttpMessageConverter`（内部は Jackson）を使って `TaskResponse` オブジェクトを JSON にシリアライズし、HTTP レスポンスボディとしてブラウザへ返します。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 前端返回的 JSON 里出现了 `password` 等敏感字段 | Controller 直接把 Entity 序列化返回，没有转换成 Response<br><span class="ja-inline">🇯🇵 Controller が Entity をそのままシリアライズして返し、Response に変換していない </span>| 单独定义 `xxxResponse`，只把需要暴露的字段搬过去<br><span class="ja-inline">🇯🇵 `xxxResponse` を別途定義し、公開が必要なフィールドだけを移す </span>|
| 新建数据时前端传的 `id` / `status` 生效了，被恶意篡改 | Controller 直接用 Entity 接收请求体，前端能传任意字段<br><span class="ja-inline">🇯🇵 Controller が Entity で直接リクエストボディを受け取り、フロントエンドが任意のフィールドを送信できてしまう </span>| 单独定义 `xxxCreateRequest`，只暴露允许前端填写的字段<br><span class="ja-inline">🇯🇵 `xxxCreateRequest` を別途定義し、フロントエンドが入力してよいフィールドだけを公開する </span>|
| 团队里对 DTO/VO/Request/Response 命名吵不出统一意见 | 这套命名本来就没有行业标准<br><span class="ja-inline">🇯🇵 この命名にはそもそも業界標準が存在しない </span>| 团队内部约定一套并保持一致即可，不必强求和其他项目完全一样<br><span class="ja-inline">🇯🇵 チーム内で一つのルールを決めて統一すればよく、他のプロジェクトと完全に同じにする必要はない </span>|

## 动手练习 ／ 演習

1. 参照 `TaskCreateRequest` / `TaskResponse`，为 `User` 也写一套 `UserCreateRequest` 和 `UserResponse`，确保 `UserResponse` 不包含 `password` 字段。<br><span class="ja-inline">🇯🇵 `TaskCreateRequest` / `TaskResponse` を参考にして、`User` 用にも `UserCreateRequest` と `UserResponse` を書き、`UserResponse` に `password` フィールドが含まれないことを確認しましょう。</span>
2. 尝试写一个 `TaskUpdateRequest`，思考它和 `TaskCreateRequest` 字段是否应该完全一样（提示：更新时可能需要单独传 `status`，但不需要重新传 `title`）。<br><span class="ja-inline">🇯🇵 `TaskUpdateRequest` を書いてみて、`TaskCreateRequest` とフィールドが完全に同じであるべきかどうか考えてみましょう（ヒント：更新時は `status` を個別に送る必要があるかもしれませんが、`title` を再度送る必要はないかもしれません）。</span>
3. 想一想：如果不做任何转换，直接把 Entity 当 Request 和 Response 用，除了本章提到的安全问题，还可能带来什么维护上的麻烦（提示：数据库表结构一旦改动，会不会直接影响到前端接口？）。<br><span class="ja-inline">🇯🇵 考えてみましょう：もし一切変換をせず、Entity を Request と Response としてそのまま使ったら、本章で述べたセキュリティの問題以外に、どんな保守上の問題が起こり得るでしょうか（ヒント：データベースのテーブル構造が変わったら、フロントエンドの API に直接影響しないでしょうか）。</span>

## 小测验 ／ 小テスト

1. 为什么不能把数据库查出来的 `User` Entity 直接返回给前端？<br><span class="ja-inline">🇯🇵 なぜデータベースから取得した `User` Entity をそのままフロントエンドに返してはいけないのですか？</span>
2. `TaskCreateRequest` 和 `Task` Entity 的字段为什么不完全一样？<br><span class="ja-inline">🇯🇵 なぜ `TaskCreateRequest` と `Task` Entity のフィールドは完全には一致しないのですか？</span>
3. `VO`、`DTO`、`Response` 这几个命名是不是 Java 或 Spring 的官方规定？<br><span class="ja-inline">🇯🇵 `VO`、`DTO`、`Response` といった命名は Java や Spring の公式ルールなのですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. Entity 里可能包含密码等敏感字段、内部状态字段，直接返回存在安全风险；而且 Entity 结构和前端需要的字段不一定完全一致。<br><span class="ja-inline">🇯🇵 Entity にはパスワードなどの機密フィールドや内部状態のフィールドが含まれている可能性があり、そのまま返すとセキュリティリスクがあります。また Entity の構造とフロントエンドが必要とするフィールドが必ずしも一致しないためです。</span>
2. 因为新建任务时，`id`、`createTime` 这些字段应该由服务器生成，不应该由前端提交；而更新时候的可选字段也可能和创建时不同。<br><span class="ja-inline">🇯🇵 タスクを新規作成する際、`id` や `createTime` といったフィールドはサーバーが生成すべきであり、フロントエンドが送信すべきではないからです。また更新時の任意フィールドも作成時とは異なる場合があります。</span>
3. 不是。这是企业项目里约定俗成的命名习惯，不同公司、不同项目可能有各自的叫法，没有统一标准；理解"为什么要拆分"比记住具体命名更重要。<br><span class="ja-inline">🇯🇵 いいえ。これは企業のプロジェクトで慣習的に使われている命名であり、会社やプロジェクトによって独自の呼び方があり、統一された標準はありません。「なぜ分割するのか」を理解することの方が、具体的な命名を覚えることより重要です。</span>
</details>

## 本章总结 ／ 本章のまとめ
你理解了为什么不能一直用同一个 Entity 打天下，认识了 `Entity`、`DTO`、`Request`、`Response`、`VO` 这几种常见角色的大致分工，并且清楚这套命名只是企业习惯而非行业标准。下一章我们给 `TaskCreateRequest` 这类"前端传入的数据"加上参数校验，避免脏数据流入系统。

> 🇯🇵 なぜ一つの Entity だけで全てを済ませてはいけないのかを理解し、`Entity`、`DTO`、`Request`、`Response`、`VO` といったよく使われる役割の大まかな分担を把握し、この命名が業界標準ではなく企業の慣習にすぎないことを理解しました。次の章では `TaskCreateRequest` のような「フロントエンドから渡されるデータ」にパラメータ検証（バリデーション）を追加し、不正なデータがシステムに流れ込むのを防ぎます。
