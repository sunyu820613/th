# 第 36 章　基础自动化测试 ／ 第36章　基礎的な自動化テスト

## 本章目标 ／ 本章の目標
理解为什么不能永远只靠 Postman 手动测试；认识 JUnit 5 常用的注解和断言方法；清楚区分"普通单元测试"（`@Test`，不启动 Spring）和"Spring Boot 集成测试"（`@SpringBootTest`，启动整个 ApplicationContext），并各写一个最小例子。

> 🇯🇵 なぜ永遠に Postman による手動テストだけに頼ってはいけないのかを理解します。JUnit 5（Java でよく使われる単体テストフレームワーク）でよく使うアノテーションと断言（アサーション、assertion、結果が期待通りかを判定するメソッド）を把握します。「普通の単体テスト」（`@Test`、Spring を起動しない）と「Spring Boot 統合テスト」（`@SpringBootTest`、ApplicationContext（アプリケーションコンテキスト、Spring が管理する全ての Bean の入れ物）全体を起動する）をはっきり区別し、それぞれ最小限のサンプルを書きます。

## 一句话理解 ／ 一言で理解する
普通单元测试是"不惊动 Spring，只测一小段独立逻辑，跑得飞快"；Spring Boot 集成测试是"真的把整个 Spring 容器启动起来，Bean 之间真实地互相注入，更接近程序实际运行的样子，但速度慢一些"——这是两种目的不同的测试，不是同一回事。

> 🇯🇵 普通の単体テストは「Spring を煩わせず、独立した小さなロジックだけをテストし、非常に速く実行できる」もの。Spring Boot 統合テストは「実際に Spring コンテナ全体を起動し、Bean 同士が本当に注入し合い、プログラムが実際に動く様子に近いが、速度はやや遅い」もの——この2つは目的の異なるテストであり、同じものではありません。

## 为什么需要它 ／ なぜ必要なのか

到目前为止，验证一个接口写得对不对，我们一直依赖 Postman：改完代码，打开 Postman，手动点一下"发送"，肉眼看看返回结果对不对。这个方法在项目还小的时候够用，但会暴露出两个明显的问题：

> 🇯🇵 これまで、API が正しく書けているかを検証するために、私たちはずっと Postman に頼ってきました。コードを直したら Postman を開き、手動で「送信」をクリックし、目で返ってきた結果が正しいか確認する、というやり方です。この方法はプロジェクトがまだ小さいうちは十分ですが、2つの明らかな問題が露呈します。

1. **容易漏测。** `task-manager` 项目到最后至少有十几个接口，每次改完代码，理论上应该把所有可能受影响的接口都手动点一遍。人是会偷懒、会遗漏的，改了 `TaskService` 里的一行代码，你未必会记得去重新测一遍所有依赖它的接口。<br><span class="ja-inline">🇯🇵 **テスト漏れが起きやすい。** `task-manager` プロジェクトは最終的に少なくとも十数個の API を持つことになります。コードを直すたびに、理論上は影響を受ける可能性のある全ての API を手動でクリックするべきですが、人間は怠けたり見落としたりするものです。`TaskService` の1行を変更しても、それに依存する全ての API を再テストすることを覚えているとは限りません。</span>
2. **改坏了不容易第一时间发现。** 如果你今天改了代码，但没有测到某个受影响的接口，这个 Bug 可能要等到几天后别人（甚至是上线后的用户）踩到才会暴露，那时候排查成本比当场发现要高得多。<br><span class="ja-inline">🇯🇵 **壊してしまってもすぐには気づきにくい。** 今日コードを変更したのに、影響を受けるある API をテストし忘れた場合、そのバグは数日後に別の人（本番リリース後のユーザーですら）が踏んでから初めて表面化するかもしれません。そのときの調査コストは、その場で発見するよりずっと高くつきます。</span>

自动化测试解决的正是这个问题：把"验证代码对不对"这件事写成代码本身，以后每次改动，只需要重新跑一遍这些测试代码，几秒钟内就能知道有没有把之前能跑通的功能改坏。

> 🇯🇵 自動化テストが解決するのはまさにこの問題です。「コードが正しいかを検証する」こと自体をコードとして書いておけば、以降は変更のたびにこれらのテストコードを再実行するだけで、数秒以内に以前正常に動いていた機能を壊していないかが分かります。

## 核心概念 ／ コアコンセプト

| 概念 ／ 概念 | 含义 ／ 意味 |
|---|---|
| `@Test` | JUnit 5 提供的注解，贴在一个方法上，表示"这是一个测试方法"，测试框架会自动发现并执行它<br><span class="ja-inline">🇯🇵 JUnit 5 が提供するアノテーション。メソッドに付けて「これはテストメソッドである」ことを表し、テストフレームワークが自動的に発見して実行する </span>|
| 普通单元测试 | 只用 `@Test`，**不启动**整个 Spring 容器，测试对象通常是自己 `new` 出来的，或者只测一段不依赖 Spring、不依赖数据库的独立逻辑，速度非常快<br><span class="ja-inline">🇯🇵 普通の単体テスト：`@Test` だけを使い、Spring コンテナ全体を**起動しない**。テスト対象は通常自分で `new` して作るか、Spring やデータベースに依存しない独立したロジックのみをテストする。速度が非常に速い </span>|
| `@SpringBootTest` | 贴在测试类上，表示这个测试类需要启动**完整的** Spring ApplicationContext，测试方法里可以通过依赖注入拿到真实的 Bean（比如真正连接数据库的 `TaskService`），更接近程序实际运行时的状态，但因为要启动整个容器，速度比单元测试慢很多<br><span class="ja-inline">🇯🇵 テストクラスに付けて、そのテストクラスが**完全な** Spring ApplicationContext を起動する必要があることを表す。テストメソッド内では依存性注入（DI）を通じて本物の Bean（実際にデータベースへ接続する `TaskService` など）を取得でき、プログラムの実際の実行時の状態に近いが、コンテナ全体を起動する必要があるため単体テストよりずっと遅い </span>|
| Arrange-Act-Assert（AAA） | 一种常见的测试代码组织方式：**Arrange**（准备数据）→ **Act**（执行被测试的操作）→ **Assert**（断言结果是否符合预期）<br><span class="ja-inline">🇯🇵 テストコードのよくある構成方法：**Arrange**（データを準備する）→ **Act**（テスト対象の操作を実行する）→ **Assert**（結果が期待通りかを断言する） </span>|
| 断言（Assertion） | 类似 `assertEquals(期望值, 实际值)` 这样的方法，用来判断"实际结果是否和预期一致"，不一致时测试会失败并给出提示<br><span class="ja-inline">🇯🇵 断言（アサーション）：`assertEquals(期待値, 実際の値)` のようなメソッドで、「実際の結果が期待と一致するか」を判定する。一致しない場合はテストが失敗し、メッセージが表示される </span>|

### JUnit 5 详细介绍 ／ JUnit 5の詳しい紹介

前面提到的 `@Test`，其实只是 JUnit 5 众多功能里最基础的一个。既然本教程从这里开始要正式写测试代码，有必要把 JUnit 5 本身多介绍一点，不然只知道 `@Test`，遇到别的项目用到别的写法就会看不懂。

> 🇯🇵 先ほど触れた `@Test` は、実は JUnit 5 の数多くの機能の中で最も基礎的なものにすぎません。本チュートリアルはここから正式にテストコードを書き始めるので、JUnit 5 自体をもう少し詳しく紹介しておく必要があります。そうしないと `@Test` しか知らないまま、他のプロジェクトで別の書き方に出会ったときに理解できなくなってしまいます。

**JUnit 5 是什么**：目前 Java 生态里最主流的单元测试框架，本教程锁定的 `spring-boot-starter-test` 内部已经整合了它，不需要单独引入。JUnit 5 内部分成三部分（了解即可，不用深究）：JUnit Platform（负责发现和运行测试的底层机制）、JUnit Jupiter（我们平时写的 `@Test`、断言这些 API 的来源）、JUnit Vintage（用来兼容运行老版本 JUnit 4 的测试代码）。写测试代码时，我们基本只会接触到 Jupiter 提供的这一套。

> 🇯🇵 **JUnit 5とは**：現在 Java エコシステムで最も主流の単体テストフレームワークです。本チュートリアルで使う `spring-boot-starter-test` は内部にすでに JUnit 5 を組み込んでいるので、個別に導入する必要はありません。JUnit 5 の内部は3つの部分に分かれています（把握しておく程度でよく、深掘りは不要）：JUnit Platform（テストの発見と実行を担う下位の仕組み）、JUnit Jupiter（普段書く `@Test` や断言などの API の出どころ）、JUnit Vintage（旧バージョンの JUnit 4 のテストコードを互換実行するためのもの）。テストコードを書くときは、基本的に Jupiter が提供するこの一式にしか触れません。

**常用注解**：

> 🇯🇵 **よく使うアノテーション**：

| 注解 ／ アノテーション | 作用 ／ 作用 |
|---|---|
| `@Test` | 标记一个方法是测试方法<br><span class="ja-inline">🇯🇵 メソッドがテストメソッドであることを示す </span>|
| `@BeforeEach` | 标记一个方法在**每个** `@Test` 方法执行之前都会自动跑一次，常用来做重复的准备工作（比如创建一个新的测试对象）<br><span class="ja-inline">🇯🇵 **各** `@Test` メソッドの実行前に毎回自動的に実行されるメソッドを示す。繰り返しの準備作業（新しいテスト対象オブジェクトの作成など）によく使われる </span>|
| `@AfterEach` | 标记一个方法在**每个** `@Test` 方法执行之后都会自动跑一次，常用来做清理工作<br><span class="ja-inline">🇯🇵 **各** `@Test` メソッドの実行後に毎回自動的に実行されるメソッドを示す。後片付け作業によく使われる </span>|
| `@BeforeAll` | 标记一个方法在这个测试类**所有**测试方法开始之前只执行**一次**（必须是 `static` 方法），适合"整个类共用、代价较大"的准备工作<br><span class="ja-inline">🇯🇵 このテストクラスの**全ての**テストメソッドが始まる前に**一度だけ**実行されるメソッドを示す（`static` メソッドである必要がある）。「クラス全体で共有し、コストが大きい」準備作業に適している </span>|
| `@AfterAll` | 和 `@BeforeAll` 相对，在所有测试方法跑完之后只执行一次（同样必须是 `static`）<br><span class="ja-inline">🇯🇵 `@BeforeAll` と対をなし、全てのテストメソッドが実行し終わった後に一度だけ実行される（同様に `static` である必要がある） </span>|
| `@DisplayName("描述文字")` | 给测试方法起一个更易读的显示名称，测试报告里会显示这个名字而不是方法名<br><span class="ja-inline">🇯🇵 テストメソッドに読みやすい表示名を付ける。テストレポートにはメソッド名ではなくこの名前が表示される </span>|
| `@Disabled("原因")` | 暂时跳过这个测试，不参与执行，适合"这个功能还没写完，先别测"的场景<br><span class="ja-inline">🇯🇵 このテストを一時的にスキップし、実行対象から外す。「この機能はまだ書き終わっていないので、テストは後回し」という場面に適している </span>|

**常用断言方法**（都在 `org.junit.jupiter.api.Assertions` 里，通常用 `import static` 直接调用方法名）：

> 🇯🇵 **よく使う断言メソッド**（いずれも `org.junit.jupiter.api.Assertions` にあり、通常 `import static` してメソッド名を直接呼び出す）：

| 断言方法 ／ 断言メソッド | 作用 ／ 作用 |
|---|---|
| `assertEquals(期望值, 实际值)` | 判断两个值相等<br><span class="ja-inline">🇯🇵 2つの値が等しいことを判定する </span>|
| `assertTrue(条件)` / `assertFalse(条件)` | 判断一个布尔表达式为真/为假<br><span class="ja-inline">🇯🇵 ある論理式が真／偽であることを判定する </span>|
| `assertNull(对象)` / `assertNotNull(对象)` | 判断对象是否为 `null`<br><span class="ja-inline">🇯🇵 オブジェクトが `null` かどうかを判定する </span>|
| `assertThrows(异常类型.class, () -> { ... })` | 判断执行某段代码时，是否会抛出指定类型的异常——这是验证"错误处理逻辑对不对"的常用手段<br><span class="ja-inline">🇯🇵 あるコードを実行したときに指定した型の例外が投げられるかを判定する——「エラー処理ロジックが正しいか」を検証する際によく使う手段 </span>|
| `assertAll(...)` | 把多个断言打包在一起执行，即使前面某个断言失败，后面的断言依然会继续执行并一起报告，而不是像普通写法那样一失败就中断<br><span class="ja-inline">🇯🇵 複数の断言をまとめて実行する。前の断言が失敗しても後ろの断言はそのまま実行され続けてまとめて報告される。普通の書き方のように失敗した時点で中断することはない </span>|

**测试方法的执行顺序示例**（帮助理解 `@BeforeEach`/`@AfterEach` 什么时候跑）：

> 🇯🇵 **テストメソッドの実行順序の例**（`@BeforeEach`/`@AfterEach` がいつ実行されるかを理解する助けになる）：

```java
class OrderCalculatorTest {

    private OrderCalculator calculator;

    @BeforeEach
    void setUp() {
        // 每个 @Test 方法执行前都会先跑一遍这里，保证每个测试用到的都是"干净"的新对象
        calculator = new OrderCalculator();
    }

    @Test
    @DisplayName("数量为 0 时，总价应该是 0")
    void totalPrice_shouldBeZero_whenQuantityIsZero() {
        assertEquals(0, calculator.totalPrice(10, 0));
    }

    @Test
    @DisplayName("传入负数数量应该抛出异常")
    void totalPrice_shouldThrow_whenQuantityIsNegative() {
        assertThrows(IllegalArgumentException.class, () -> calculator.totalPrice(10, -1));
    }
}
```

如果 `OrderCalculatorTest` 里有 5 个 `@Test` 方法，`setUp()` 会在**每一个**方法执行前各跑一次，一共跑 5 次——这保证了测试之间互不干扰：上一个测试对 `calculator` 做的任何修改，都不会影响下一个测试，因为每次都是全新的对象。

> 🇯🇵 もし `OrderCalculatorTest` に5個の `@Test` メソッドがあれば、`setUp()` は**各**メソッドの実行前にそれぞれ一回ずつ、合計5回実行されます——これによりテスト同士が互いに干渉しないことが保証されます。前のテストが `calculator` に加えたどんな変更も、次のテストには影響しません。毎回全く新しいオブジェクトだからです。

**JUnit 5 是怎么被跑起来的**：在 IDEA 里，直接点测试方法左侧的运行按钮即可；命令行执行 `mvn test`（第 17 章学过的 Maven 命令）时，Maven 会调用一个叫 `maven-surefire-plugin` 的插件，自动扫描 `src/test/java` 下所有符合命名规则的测试类（比如以 `Test` 结尾），依次执行里面的 `@Test` 方法，最后在控制台汇总打印"运行了多少个、通过多少个、失败多少个"。

> 🇯🇵 **JUnit 5はどう実行されるか**：IDEA ではテストメソッドの左側にある実行ボタンをクリックするだけです。コマンドラインで `mvn test`（第17章で学んだ Maven のコマンド）を実行すると、Maven は `maven-surefire-plugin` というプラグインを呼び出し、`src/test/java` 以下の命名規則に合った（`Test` で終わるなど）全てのテストクラスを自動的にスキャンし、その中の `@Test` メソッドを順に実行し、最後にコンソールに「何個実行し、何個成功し、何個失敗したか」をまとめて表示します。

**必须明确的一点：单元测试和集成测试不是一回事。** 单元测试追求"快、独立、只测一个小单元"；集成测试追求"真实、贴近实际运行环境"，两者服务于不同的目的，一个项目里通常两种都会写，不能互相替代。

> 🇯🇵 **はっきりさせておくべき点：単体テストと統合テストは同じものではありません。** 単体テストは「速い、独立している、小さな単位だけをテストする」ことを追求し、統合テストは「本物である、実際の実行環境に近い」ことを追求します。両者は異なる目的に仕える存在であり、一つのプロジェクトでは通常両方とも書くことになり、互いに代替はできません。

对应的依赖，Spring Boot 项目用 Spring Initializr 创建时通常已经默认包含（`spring-boot-starter-test`，内部整合了 JUnit 5），版本由 Spring Boot 的依赖管理（BOM）统一控制，不需要手写具体版本号：

> 🇯🇵 対応する依存関係は、Spring Initializr で Spring Boot プロジェクトを作成した際に通常デフォルトで含まれています（`spring-boot-starter-test`、内部に JUnit 5 が統合されている）。バージョンは Spring Boot の依存管理（BOM）によって統一的に制御されるため、具体的なバージョン番号を手で書く必要はありません。

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
```

## 图解 ／ 図解

```
普通单元测试（@Test）
  测试方法 → 直接 new 对象 / 调用纯逻辑方法 → 断言结果
  （全程没有 Spring 容器参与，跑得很快）

Spring Boot 集成测试（@SpringBootTest）
  测试方法启动 ------> 整个 ApplicationContext 被启动
                            ↓
                  Bean 之间按真实依赖关系被创建、注入
                            ↓
                  测试方法里 @Autowired 拿到真实的 TaskService
                            ↓
                  调用真实方法（可能真的会访问数据库）
                            ↓
                        断言结果
  （更接近生产环境的运行方式，但启动过程比单元测试慢很多）
```

## 最小示例 ／ 最小限のサンプル

### ① 普通单元测试：测试一段不依赖数据库的纯逻辑 ／ ①普通の単体テスト：データベースに依存しない純粋なロジックをテストする

假设 `TaskService` 里有一个方法，用来判断一个状态字符串是否是合法的任务状态，这段逻辑本身不需要访问数据库，很适合写成单元测试：

> 🇯🇵 `TaskService` にあるステータス文字列が正当なタスクステータスかを判定するメソッドを例にします。このロジック自体はデータベースへのアクセスを必要とせず、単体テストにするのに適しています。

`service/TaskService.java`（新增一个纯逻辑方法）
> 🇯🇵 `service/TaskService.java`（純粋なロジックのメソッドを新規追加）
```java
package com.example.taskmanager.service;

import com.example.taskmanager.entity.Task;

import java.util.List;

public interface TaskService {

    Task create(Task task);

    // 纯逻辑判断，不依赖数据库，只判断传入的字符串是否是合法状态
    boolean isValidStatus(String status);
}
```

`service/impl/TaskServiceImpl.java`（实现该方法）
> 🇯🇵 `service/impl/TaskServiceImpl.java`（このメソッドを実装）
```java
@Override
public boolean isValidStatus(String status) {
    return "TODO".equals(status) || "IN_PROGRESS".equals(status) || "DONE".equals(status);
}
```

`src/test/java/com/example/taskmanager/TaskServiceUnitTest.java`
```java
package com.example.taskmanager;

import com.example.taskmanager.service.impl.TaskServiceImpl;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

// 注意：这个类没有 @SpringBootTest，也没有启动 Spring 容器
class TaskServiceUnitTest {

    @Test
    void isValidStatus_shouldReturnTrue_whenStatusIsTodo() {
        // Arrange：准备被测试的对象，这里直接 new，不需要 Spring 帮忙注入
        TaskServiceImpl taskService = new TaskServiceImpl(null); // 这个方法用不到 Mapper，可以先传 null

        // Act：执行被测试的方法
        boolean result = taskService.isValidStatus("TODO");

        // Assert：断言结果符合预期
        assertTrue(result);
    }

    @Test
    void isValidStatus_shouldReturnFalse_whenStatusIsUnknown() {
        TaskServiceImpl taskService = new TaskServiceImpl(null);

        boolean result = taskService.isValidStatus("UNKNOWN_STATUS");

        assertFalse(result);
    }
}
```

### ② Spring Boot 集成测试：真正启动容器，测试 create 方法 ／ ②Spring Boot統合テスト：実際にコンテナを起動し、createメソッドをテストする

`src/test/java/com/example/taskmanager/TaskServiceIntegrationTest.java`
```java
package com.example.taskmanager;

import com.example.taskmanager.entity.Task;
import com.example.taskmanager.service.TaskService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest // 启动完整的 Spring ApplicationContext
class TaskServiceIntegrationTest {

    @Autowired // 由 Spring 容器真实注入，内部的 TaskMapper 也是真实创建、真实连接数据库的
    private TaskService taskService;

    @Test
    void create_shouldReturnTaskWithGeneratedId() {
        // Arrange：准备一个待新建的任务
        Task task = new Task();
        task.setTitle("集成测试专用任务");
        task.setStatus("TODO");

        // Act：调用真实的 Service 方法，这一步会真的经过 Mapper，操作数据库
        Task saved = taskService.create(task);

        // Assert：新建成功后，数据库应该已经为它生成了主键 id
        assertNotNull(saved.getId());
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `TaskServiceUnitTest` 类上**没有**任何 Spring 相关注解，`new TaskServiceImpl(null)` 是自己手动创建对象——因为 `isValidStatus` 方法完全不涉及 `taskMapper`，传 `null` 也不会出问题。这个测试从头到尾，Spring 容器根本没有被启动，跑起来是毫秒级的。<br><span class="ja-inline">🇯🇵 `TaskServiceUnitTest` クラスには Spring 関連のアノテーションが**一切ありません**。`new TaskServiceImpl(null)` は自分で手動でオブジェクトを作成しています——`isValidStatus` メソッドは `taskMapper` を全く使わないため、`null` を渡しても問題は起きません。このテストは最初から最後まで Spring コンテナが全く起動されず、実行はミリ秒単位で終わります。</span>
- `TaskServiceIntegrationTest` 类上贴了 `@SpringBootTest`，测试运行时会真的启动整个 Spring Boot 应用（和你平时点"运行"启动项目做的事情基本一样），把所有 Bean 都创建好、注入好。<br><span class="ja-inline">🇯🇵 `TaskServiceIntegrationTest` クラスには `@SpringBootTest` が付いており、テスト実行時に実際に Spring Boot アプリケーション全体が起動します（普段「実行」をクリックしてプロジェクトを起動するのとほぼ同じことをします）。全ての Bean が作成され、注入されます。</span>
- `@Autowired private TaskService taskService;`：这里的 `taskService` 是 Spring 容器里**真实**创建、真实装配好依赖（包括内部的 `TaskMapper`）的对象，不是自己手动 `new` 出来的。<br><span class="ja-inline">🇯🇵 `@Autowired private TaskService taskService;`：ここでの `taskService` は Spring コンテナ内で**実際に**作成され、依存関係（内部の `TaskMapper` を含む）が本当に組み立てられたオブジェクトであり、自分で手動 `new` したものではありません。</span>
- `taskService.create(task)`：这一步会真正调用到 `TaskMapper`，执行真实的 `INSERT` 语句，所以这个测试需要有一个可连接的数据库环境，运行速度比单元测试明显慢。<br><span class="ja-inline">🇯🇵 `taskService.create(task)`：このステップは実際に `TaskMapper` を呼び出し、本物の `INSERT` 文を実行します。そのためこのテストには接続可能なデータベース環境が必要で、実行速度は単体テストより明らかに遅くなります。</span>
- 两个测试方法名都遵循"被测方法\_场景\_预期结果"这样的命名习惯，方便一眼看出这个测试在验证什么。<br><span class="ja-inline">🇯🇵 2つのテストメソッド名はいずれも「テスト対象メソッド_シナリオ_期待結果」という命名習慣に従っており、そのテストが何を検証しているか一目で分かるようになっています。</span>

## 程序运行过程 ／ プログラムの実行の流れ

**普通单元测试执行过程：**
> 🇯🇵 **普通の単体テストの実行の流れ：**

1. 测试框架（JUnit 5）扫描到 `TaskServiceUnitTest` 类里带 `@Test` 的方法。<br><span class="ja-inline">🇯🇵 テストフレームワーク（JUnit 5）が `TaskServiceUnitTest` クラスの `@Test` 付きメソッドをスキャンして見つけます。</span>
2. 直接调用这些方法，方法内部自己 `new` 出被测对象，全程不涉及 Spring 容器、DispatcherServlet、数据库连接。<br><span class="ja-inline">🇯🇵 これらのメソッドを直接呼び出します。メソッド内部で自ら `new` してテスト対象オブジェクトを作成し、全過程で Spring コンテナ、DispatcherServlet、データベース接続には一切関与しません。</span>
3. 方法执行完，断言通过则测试标记为"通过"（绿色），不通过则标记为"失败"并打印出期望值和实际值的差异。<br><span class="ja-inline">🇯🇵 メソッドの実行が終わり、断言が通ればテストは「合格」（緑色）とマークされ、通らなければ「失敗」とマークされて期待値と実際の値の差異が表示されます。</span>

**Spring Boot 集成测试执行过程：**
> 🇯🇵 **Spring Boot統合テストの実行の流れ：**

1. JUnit 5 扫描到 `TaskServiceIntegrationTest` 类，发现它带有 `@SpringBootTest`。<br><span class="ja-inline">🇯🇵 JUnit 5 が `TaskServiceIntegrationTest` クラスをスキャンし、`@SpringBootTest` が付いていることを発見します。</span>
2. 测试运行前，Spring 先完整启动一次 ApplicationContext——扫描组件、创建 Bean（包括 `TaskServiceImpl`、`TaskMapper` 对应的实现）、按依赖关系完成注入，这个过程和正常启动 `TaskManagerApplication` 基本一致。<br><span class="ja-inline">🇯🇵 テスト実行前に、Spring はまず ApplicationContext を一度完全に起動します——コンポーネントをスキャンし、Bean（`TaskServiceImpl`、`TaskMapper` に対応する実装を含む）を作成し、依存関係に従って注入を完了します。この過程は通常の `TaskManagerApplication` の起動とほぼ同じです。</span>
3. 容器启动完成后，`@Autowired` 把真实的 `TaskService` 注入到测试类的字段上。<br><span class="ja-inline">🇯🇵 コンテナの起動が完了した後、`@Autowired` が本物の `TaskService` をテストクラスのフィールドに注入します。</span>
4. 测试方法执行 `taskService.create(task)`，请求真实经过 `Service → Mapper → MySQL` 这条链路，数据库里真的会多出一条记录。<br><span class="ja-inline">🇯🇵 テストメソッドが `taskService.create(task)` を実行し、リクエストは本当に `Service → Mapper → MySQL` という経路を通り、データベースに実際にレコードが1件増えます。</span>
5. 断言 `saved.getId()` 不为 `null`，验证数据库确实生成了自增主键并正确返回。<br><span class="ja-inline">🇯🇵 `saved.getId()` が `null` でないことを断言し、データベースが確かに自動採番の主キーを生成し正しく返したことを検証します。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 单元测试里 `@Autowired` 报空指针 | 忘了单元测试没有启动 Spring 容器，`@Autowired` 根本不会生效<br><span class="ja-inline">🇯🇵 単体テストでは Spring コンテナが起動していないため `@Autowired` が全く機能しないことを忘れている </span>| 需要依赖注入的场景请用 `@SpringBootTest`，纯逻辑测试直接 `new` 对象即可<br><span class="ja-inline">🇯🇵 依存性注入が必要な場面では `@SpringBootTest` を使う。純粋なロジックのテストでは直接 `new` してオブジェクトを作ればよい </span>|
| 集成测试报连接数据库失败 | 运行测试的环境没有可用的 MySQL，或者测试用的数据库配置和开发环境冲突<br><span class="ja-inline">🇯🇵 テストを実行する環境に利用可能な MySQL がない、またはテスト用のデータベース設定が開発環境と衝突している </span>| 确认测试运行的机器上数据库可访问；实际项目里通常会为测试单独准备一份测试库，本教程不深入这部分配置<br><span class="ja-inline">🇯🇵 テストを実行するマシンでデータベースにアクセスできることを確認する。実際のプロジェクトでは通常テスト専用のデータベースを別途用意するが、本チュートリアルではこの設定には深入りしない </span>|
| 集成测试跑一次要好几秒，写单元测试一样的量级但明显更慢 | 这是正常现象，`@SpringBootTest` 每次都要启动完整容器<br><span class="ja-inline">🇯🇵 これは正常な現象で、`@SpringBootTest` は毎回完全なコンテナを起動する必要がある </span>| 优先用单元测试覆盖大量纯逻辑分支，只在必要处编写少量集成测试<br><span class="ja-inline">🇯🇵 純粋なロジックの分岐は単体テストで数多くカバーすることを優先し、必要な箇所にのみ少量の統合テストを書く </span>|

## 动手练习 ／ 演習

1. 给 `UserService` 也写一个类似 `isValidStatus` 的纯逻辑方法（比如"判断用户名长度是否在 3~20 之间"），并为它写一个普通单元测试。<br><span class="ja-inline">🇯🇵 `UserService` にも `isValidStatus` に似た純粋なロジックのメソッド（例えば「ユーザー名の長さが3〜20文字の間かを判定する」）を書き、それに対して普通の単体テストを書きましょう。</span>
2. 仿照 `TaskServiceIntegrationTest`，为 `UserService.create` 写一个集成测试，验证新建用户后 `id` 不为空。<br><span class="ja-inline">🇯🇵 `TaskServiceIntegrationTest` を真似て、`UserService.create` に対して統合テストを書き、ユーザーを新規作成した後 `id` が空でないことを検証しましょう。</span>
3. 故意让 `isValidStatus` 的实现出现一个 Bug（比如漏判断 `"DONE"`），重新运行单元测试，观察测试失败时的提示信息长什么样。<br><span class="ja-inline">🇯🇵 わざと `isValidStatus` の実装にバグを混入させ（例えば `"DONE"` の判定漏れ）、単体テストを再実行して、テストが失敗したときのメッセージがどのようなものか観察しましょう。</span>

## 小测验 ／ 小テスト

1. 普通单元测试和 Spring Boot 集成测试最核心的区别是什么？<br><span class="ja-inline">🇯🇵 普通の単体テストと Spring Boot 統合テストの最も核心的な違いは何ですか？</span>
2. Arrange-Act-Assert 三个步骤分别对应做什么？<br><span class="ja-inline">🇯🇵 Arrange-Act-Assert の3つのステップはそれぞれ何をすることに対応していますか？</span>
3. 为什么不能永远只靠 Postman 手动测试？<br><span class="ja-inline">🇯🇵 なぜ永遠に Postman による手動テストだけに頼ってはいけないのですか？</span>
4. 一个测试类里有 3 个 `@Test` 方法，`@BeforeEach` 标注的方法会被执行几次？如果换成 `@BeforeAll` 呢？<br><span class="ja-inline">🇯🇵 テストクラスに3つの `@Test` メソッドがある場合、`@BeforeEach` を付けたメソッドは何回実行されますか？`@BeforeAll` に変えるとどうなりますか？</span>
5. 如果想验证"传入非法参数时，方法应该抛出异常"，应该用哪个断言方法？<br><span class="ja-inline">🇯🇵 「不正なパラメータを渡したとき、メソッドは例外を投げるべきである」ことを検証したい場合、どの断言メソッドを使うべきですか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. 普通单元测试不启动 Spring 容器，只测一个独立的小单元，速度快；Spring Boot 集成测试用 `@SpringBootTest` 启动完整的 ApplicationContext，Bean 可以被真实注入，更接近实际运行环境，但速度更慢。<br><span class="ja-inline">🇯🇵 普通の単体テストは Spring コンテナを起動せず、独立した小さな単位だけをテストするので速いです。Spring Boot 統合テストは `@SpringBootTest` で完全な ApplicationContext を起動し、Bean が実際に注入され、実際の実行環境により近くなりますが、速度は遅くなります。</span>
2. Arrange 准备测试所需的数据和对象；Act 执行被测试的方法或操作；Assert 断言实际结果是否符合预期。<br><span class="ja-inline">🇯🇵 Arrange はテストに必要なデータとオブジェクトを準備します。Act はテスト対象のメソッドや操作を実行します。Assert は実際の結果が期待通りかを断言します。</span>
3. 手动测试每次改完代码都要重新点一遍，容易遗漏受影响的接口，而且改坏了不容易第一时间发现，问题可能要等很久之后才暴露。<br><span class="ja-inline">🇯🇵 手動テストはコードを直すたびに再度クリックし直す必要があり、影響を受ける API を見落としやすく、また壊してしまってもすぐには気づきにくく、問題がずっと後になってから表面化することがあるからです。</span>
4. `@BeforeEach` 会执行 3 次——每个 `@Test` 方法执行前都会跑一次；`@BeforeAll` 只会执行 1 次，在这个类所有测试方法开始之前统一跑一次。<br><span class="ja-inline">🇯🇵 `@BeforeEach` は3回実行されます——各 `@Test` メソッドの実行前に一回ずつ実行されます。`@BeforeAll` は1回だけ実行され、このクラスの全てのテストメソッドが始まる前にまとめて一回実行されます。</span>
5. `assertThrows(异常类型.class, () -> { ... })`。<br><span class="ja-inline">🇯🇵 `assertThrows(異常タイプ.class, () -> { ... })` です。</span>
</details>

## 本章总结 ／ 本章のまとめ
你理解了自动化测试相对手动测试的价值，学会了区分"不启动 Spring 的普通单元测试"和"启动完整容器的 Spring Boot 集成测试"，并用 Arrange-Act-Assert 结构分别写出了最小示例。下一章我们综合运用前面学过的全部知识，完成最终项目：Task 管理系统的完整 CRUD（含基础分页）。

> 🇯🇵 手動テストに対する自動化テストの価値を理解し、「Spring を起動しない普通の単体テスト」と「完全なコンテナを起動する Spring Boot 統合テスト」を区別できるようになり、Arrange-Act-Assert の構造でそれぞれ最小限のサンプルを書きました。次の章では、これまで学んだ知識を総合的に活用して、最終プロジェクトである Task 管理システムの一通りのCRUD（基礎的なページネーションを含む）を完成させます。
