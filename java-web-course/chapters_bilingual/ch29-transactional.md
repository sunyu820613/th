# 第 29 章　事务 @Transactional ／ 第29章　トランザクション管理と @Transactional

## 本章目标 ／ 本章の目標
理解为什么"一组相关的数据库操作"要么全部成功、要么全部撤销；理解事务的 commit（提交）和 rollback（回滚）；学会在 Service 方法上使用 `@Transactional` 注解。

> 🇯🇵 なぜ「一連の関連するデータベース操作」は全部成功させるか全部取り消すかのどちらかでなければならないのかを理解します。トランザクション（トランザクション）の commit（コミット、確定）と rollback（ロールバック、取り消し）を理解します。Serviceのメソッドに `@Transactional` アノテーションを使えるようになります。

## 一句话理解 ／ 一言で理解する
事务就是把"好几步数据库操作"打包成一个不可分割的整体：要么这些步骤全部成功生效（commit），要么只要有一步失败，之前做过的所有步骤都会被撤销（rollback），就像什么都没发生过一样。

> 🇯🇵 トランザクション（トランザクション、Transaction）とは、「いくつものステップからなるデータベース操作」を1つの分割不可能な塊としてまとめることです。それらのステップがすべて成功して有効になる（commit）か、あるいは1つでも失敗すれば、それまでに行ったすべてのステップが取り消される（rollback）かのどちらかで、まるで何も起きなかったかのようになります。

## 为什么需要它 ／ なぜ必要なのか
想象一个转账场景：小明要给小红转 100 元。这个操作在数据库层面其实是两步：

1. 小明账户余额 `-100`
2. 小红账户余额 `+100`

> 🇯🇵 送金の場面を想像してみましょう。小明が小红に100元を送金します。この操作はデータベースのレベルでは実は2つのステップです。<br>1. 小明のアカウント残高を `-100`<br>2. 小红のアカウント残高を `+100`

如果第一步执行成功了，第二步却因为某个异常（比如程序崩溃、网络中断、代码里有 bug）没有执行，会发生什么？**小明的钱已经扣了，小红却没收到——100 元凭空消失了。** 这在真实的银行系统里是绝对不能接受的严重事故。

> 🇯🇵 もし1つ目のステップが成功したのに、2つ目のステップが何らかの異常（プログラムのクラッシュ、ネットワーク断絶、コードのバグなど）によって実行されなかったら、何が起こるでしょうか？**小明のお金はすでに引き落とされているのに、小红は受け取っていない——100元が跡形もなく消えてしまいます。** これは実際の銀行システムでは絶対に許されない重大な事故です。

我们需要一种机制，保证"这两步操作要么一起成功，要么一起失败"，这就是**事务**要解决的问题。

> 🇯🇵 私たちには「この2つの操作は一緒に成功するか、一緒に失敗するかのどちらかである」ことを保証する仕組みが必要です。これこそが**トランザクション**が解決する問題です。

## 核心概念 ／ コアコンセプト

### 29.1 commit 与 rollback ／ 29.1 commitとrollback

- **commit（提交）**：事务里的所有操作都执行成功后，把这些改动真正、永久地保存到数据库里。<br><span class="ja-inline">🇯🇵 **commit（コミット、提交）**：トランザクション内のすべての操作が実行に成功した後、それらの変更を実際に、永続的にデータベースに保存することです。</span>
- **rollback（回滚）**：只要事务里任意一步操作失败（比如抛出异常），数据库会把这个事务里**已经执行过的所有操作**全部撤销，让数据库状态恢复到事务开始之前的样子——就好像转账这件事完全没有发生过。<br><span class="ja-inline">🇯🇵 **rollback（ロールバック、回滚）**：トランザクション内のどの1ステップの操作でも失敗（例えば例外がスローされる）すると、データベースはこのトランザクション内で**すでに実行されたすべての操作**をすべて取り消し、データベースの状態をトランザクション開始前の姿に戻します——送金という出来事がまったく起きなかったかのようにです。</span>

回到转账的例子：把"扣小明的钱"和"加小红的钱"这两步包在同一个事务里。如果第二步失败，数据库会自动把第一步"扣钱"也撤销掉，小明的余额恢复原样——数据库里不会出现"钱已经扣了，但转账其实失败了"这种不一致状态。

> 🇯🇵 送金の例に戻りましょう。「小明のお金を引き落とす」ことと「小红のお金を増やす」ことの2つのステップを同じトランザクションにまとめます。もし2つ目のステップが失敗すれば、データベースは自動的に1つ目のステップ「引き落とし」も取り消し、小明の残高は元通りに戻ります——データベースの中に「お金はすでに引き落とされたが、送金自体は実は失敗していた」という不整合な状態が現れることはありません。

### 29.2 `@Transactional` 注解 ／ 29.2 `@Transactional` アノテーション

Spring 提供了 `@Transactional` 注解，加在 Service 方法上，就能让这个方法里的多个数据库操作自动组成一个事务：

> 🇯🇵 Springは `@Transactional` アノテーションを提供しており、Serviceのメソッドに付けるだけで、そのメソッド内の複数のデータベース操作を自動的に1つのトランザクションにまとめることができます。

```java
package com.example.usercrud.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AccountService {

    private final AccountMapper accountMapper;

    public AccountService(AccountMapper accountMapper) {
        this.accountMapper = accountMapper;
    }

    @Transactional
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        accountMapper.decreaseBalance(fromId, amount);
        accountMapper.increaseBalance(toId, amount);
    }
}
```

只要在 `transfer` 方法上加一行 `@Transactional`，Spring 就会保证：`decreaseBalance` 和 `increaseBalance` 这两步数据库操作，要么一起成功提交，要么只要有一步抛出异常，两步的改动都会被回滚。

> 🇯🇵 `transfer` メソッドに `@Transactional` を1行加えるだけで、Springは `decreaseBalance` と `increaseBalance` という2つのデータベース操作について、一緒に成功してコミットされるか、あるいはどちらか一方が例外をスローすれば両方の変更がロールバックされるかのどちらかであることを保証します。

### 29.3 背后原理：只提一句 AOP ／ 29.3 背後の原理：AOPについて一言だけ

`@Transactional` 是怎么做到"在方法执行前后自动处理事务"的？简单说一句：Spring 底层用了 **AOP（面向切面编程）动态代理** 技术——你调用的其实不是 `transfer` 方法本身，而是 Spring 生成的一个代理对象，代理对象在真正执行 `transfer` 方法之前先开启事务，方法正常执行完毕后提交事务，如果方法执行过程中抛出了异常，代理对象就捕获到这个异常并触发回滚。这背后具体怎么实现的，本教程不展开，你只需要记住"加了 `@Transactional`，Spring 会在方法前后自动帮你处理事务的开启、提交、回滚"就够用了。

> 🇯🇵 `@Transactional` はどうやって「メソッド実行の前後で自動的にトランザクションを処理する」ことを実現しているのでしょうか？簡単に言うと、Springの内部では **AOP（Aspect-Oriented Programming、アスペクト指向プログラミング）の動的プロキシ**技術が使われています——あなたが呼び出しているのは実は `transfer` メソッドそのものではなく、Springが生成したプロキシオブジェクトであり、プロキシオブジェクトは実際に `transfer` メソッドを実行する前にトランザクションを開始し、メソッドが正常に実行し終わった後にトランザクションをコミットし、メソッド実行中に例外がスローされれば、プロキシオブジェクトがその例外を捕捉してロールバックを起動します。これが具体的にどう実装されているかは本チュートリアルでは詳しく扱いません。「`@Transactional` を付ければ、Springがメソッドの前後で自動的にトランザクションの開始・コミット・ロールバックを処理してくれる」とだけ覚えておけば十分です。

**本章范围说明**：本章只讲 `@Transactional` 最基础的 commit/rollback 用法，**不深入**事务隔离级别（isolation level）、事务传播行为（propagation）等更高级的内容——这些属于进阶话题，会放到后续学习路线里（见第 38 章）。

> 🇯🇵 **本章の範囲についての説明**：本章では `@Transactional` の最も基本的なcommit/rollbackの使い方のみを説明し、トランザクションの分離レベル（isolation level）やトランザクションの伝播行動（propagation）といったより高度な内容には**踏み込みません**——これらは応用的な話題であり、今後の学習ロードマップに含まれます（第38章を参照）。

## 图解 ／ 図解

```
不加事务的转账（危险）：
  执行 decreaseBalance(小明, 100)  ✅ 成功，钱已经扣了
  执行 increaseBalance(小红, 100)  ❌ 抛异常，没执行成功
  ────────────────────────────────
  结果：小明少了 100，小红没多，钱凭空消失 ❌

加了 @Transactional 的转账（安全）：
  开启事务
    执行 decreaseBalance(小明, 100)  ✅
    执行 increaseBalance(小红, 100)  ❌ 抛异常
  检测到异常 → 自动 rollback
  ────────────────────────────────
  结果：两步操作全部撤销，小明的余额恢复原样 ✅

  （如果两步都成功）
  开启事务
    执行 decreaseBalance(小明, 100)  ✅
    执行 increaseBalance(小红, 100)  ✅
  两步都成功 → 自动 commit
  ────────────────────────────────
  结果：改动正式生效 ✅
```

## 最小示例 ／ 最小限のサンプル

```java
// AccountMapper.java
package com.example.usercrud.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Update;

import java.math.BigDecimal;

@Mapper
public interface AccountMapper {

    @Update("update account set balance = balance - #{amount} where id = #{id}")
    void decreaseBalance(@Param("id") Long id, @Param("amount") BigDecimal amount);

    @Update("update account set balance = balance + #{amount} where id = #{id}")
    void increaseBalance(@Param("id") Long id, @Param("amount") BigDecimal amount);
}
```

```java
// AccountService.java
package com.example.usercrud.service;

import com.example.usercrud.mapper.AccountMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class AccountService {

    private final AccountMapper accountMapper;

    public AccountService(AccountMapper accountMapper) {
        this.accountMapper = accountMapper;
    }

    @Transactional
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        accountMapper.decreaseBalance(fromId, amount);
        if (amount.compareTo(BigDecimal.valueOf(10000)) > 0) {
            throw new IllegalArgumentException("单笔转账金额不能超过 10000 元");
        }
        accountMapper.increaseBalance(toId, amount);
    }
}
```

## 代码逐行解释 ／ コードの行ごとの解説

- `@Param("id")` / `@Param("amount")`：当 Mapper 方法有多个参数时，需要用 `@Param` 给每个参数起一个名字，这样 `#{id}`/`#{amount}` 才能在 SQL 里正确对应到具体是哪个参数（只有一个参数时可以省略，但多参数时建议一律显式写明，避免歧义）。<br><span class="ja-inline">🇯🇵 `@Param("id")` / `@Param("amount")`：Mapperのメソッドに複数の引数がある場合、`@Param` を使って各引数に名前を付ける必要があります。そうすることで `#{id}`/`#{amount}` がSQLの中で具体的にどの引数に対応するかを正しく特定できます（引数が1つだけの場合は省略できますが、複数ある場合は曖昧さを避けるため一律明示的に書くことを推奨します）。</span>
- `@Transactional`：加在 `transfer` 方法上，声明这个方法内的数据库操作要作为一个事务整体执行。<br><span class="ja-inline">🇯🇵 `@Transactional`：`transfer` メソッドに付けて、このメソッド内のデータベース操作が1つのトランザクションとしてまとめて実行されることを宣言します。</span>
- 示例故意在两次数据库操作中间加了一段"金额超过 10000 抛异常"的校验逻辑：如果 `amount` 超过 10000，`decreaseBalance` 已经执行了，但代码会在执行 `increaseBalance` 之前抛出异常。因为整个方法被 `@Transactional` 包裹，Spring 会捕获到这个未被处理的运行时异常，自动把已经执行的 `decreaseBalance` 也回滚掉，数据库里不会留下"扣了钱但没转成功"的痕迹。<br><span class="ja-inline">🇯🇵 サンプルではわざと2回のデータベース操作の間に「金額が10000を超えたら例外をスローする」という検証ロジックを挟んでいます。もし `amount` が10000を超えていれば、`decreaseBalance` はすでに実行されていますが、コードは `increaseBalance` を実行する前に例外をスローします。メソッド全体が `@Transactional` に包まれているため、Springはこの未処理の実行時例外を捕捉し、すでに実行された `decreaseBalance` も自動的にロールバックします。データベースには「お金は引き落とされたが送金は成功しなかった」という痕跡は残りません。</span>

## 程序运行过程 ／ プログラムの実行の流れ

1. Controller/Service 调用方（本例简化，假设由某个上层方法直接调用）调用 `accountService.transfer(fromId, toId, amount)`。<br><span class="ja-inline">🇯🇵 Controller／Serviceの呼び出し元（本例では簡略化のため、何らかの上位のメソッドが直接呼び出すとします）が `accountService.transfer(fromId, toId, amount)` を呼び出します。</span>
2. 因为 `AccountService` 是被 Spring 管理的 Bean，且方法上有 `@Transactional`，Spring 实际拿到的是一个代理对象。<br><span class="ja-inline">🇯🇵 `AccountService` はSpringが管理するBeanであり、メソッドに `@Transactional` が付いているため、実際にSpringが手にしているのはプロキシオブジェクトです。</span>
3. 代理对象在真正执行 `transfer` 方法体之前，先向数据库开启一个事务。<br><span class="ja-inline">🇯🇵 プロキシオブジェクトは実際に `transfer` メソッドの本体を実行する前に、まずデータベースに対してトランザクションを開始します。</span>
4. 依次执行方法体里的代码：先调用 `accountMapper.decreaseBalance(...)`，如果金额校验不通过就抛出异常。<br><span class="ja-inline">🇯🇵 メソッド本体のコードを順に実行します。まず `accountMapper.decreaseBalance(...)` を呼び出し、金額のチェックが通らなければ例外をスローします。</span>
5. 代理对象捕获到这个异常，判断需要回滚，于是通知数据库把这个事务里已经执行过的所有改动撤销（`decreaseBalance` 造成的余额变化被撤销）。<br><span class="ja-inline">🇯🇵 プロキシオブジェクトはこの例外を捕捉し、ロールバックが必要だと判断して、データベースにこのトランザクション内で実行済みのすべての変更を取り消すよう通知します（`decreaseBalance` による残高の変化が取り消されます）。</span>
6. 如果没有异常，方法正常执行完 `increaseBalance` 后返回，代理对象通知数据库提交事务，两步改动正式生效。<br><span class="ja-inline">🇯🇵 もし例外がなければ、メソッドは `increaseBalance` を正常に実行し終えてから戻り、プロキシオブジェクトはデータベースにトランザクションのコミットを通知し、2つのステップの変更が正式に有効になります。</span>

## 常见错误 ／ よくあるエラー

| 现象 ／ 現象 | 原因 ／ 原因 | 解决 ／ 解決方法 |
|---|---|---|
| 加了 `@Transactional`，但异常发生后数据居然没回滚<br><span class="ja-inline">🇯🇵 `@Transactional` を付けたのに、例外発生後にデータがロールバックされない </span>| `@Transactional` 默认只对**运行时异常**（`RuntimeException` 及其子类）触发回滚，对受检异常（`Exception` 但不是 `RuntimeException`）默认不回滚<br><span class="ja-inline">🇯🇵 `@Transactional` はデフォルトでは**実行時例外**（`RuntimeException` およびそのサブクラス）に対してのみロールバックを起動し、チェック例外（`Exception` だが `RuntimeException` ではないもの）に対してはデフォルトでロールバックしない </span>| 本教程示例统一抛 `RuntimeException` 及其子类（如 `IllegalArgumentException`）；如果必须用受检异常触发回滚，需要显式配置 `@Transactional(rollbackFor = Exception.class)`，本教程不展开<br><span class="ja-inline">🇯🇵 本チュートリアルのサンプルでは一貫して `RuntimeException` およびそのサブクラス（`IllegalArgumentException` など）をスローする。チェック例外でロールバックを起動する必要がある場合は、明示的に `@Transactional(rollbackFor = Exception.class)` を設定する必要があるが、本チュートリアルでは詳しく扱わない </span>|
| 在同一个类里，一个普通方法内部调用了本类另一个加了 `@Transactional` 的方法，发现事务没生效<br><span class="ja-inline">🇯🇵 同じクラス内で、ある普通のメソッドが内部で同じクラスの別の `@Transactional` 付きメソッドを呼び出したところ、トランザクションが効いていないことに気づいた </span>| Spring 的 `@Transactional` 依赖代理对象生效，类内部直接调用（`this.xxx()`）不会经过代理，导致注解被"绕过"<br><span class="ja-inline">🇯🇵 Springの `@Transactional` はプロキシオブジェクトに依存して機能するため、クラス内部での直接呼び出し（`this.xxx()`）はプロキシを経由せず、アノテーションが「回避」されてしまう </span>| 这是一个进阶陷阱，本教程只需要知道"跨方法调用可能导致事务失效"，具体解决方案属于后续学习内容<br><span class="ja-inline">🇯🇵 これは応用的な落とし穴であり、本チュートリアルでは「メソッドをまたぐ呼び出しはトランザクションを無効にする可能性がある」と知っておくだけで十分。具体的な解決策は今後の学習内容に含まれる </span>|
| 忘记在方法上加 `@Transactional`，误以为多个 Mapper 调用会自动组成事务<br><span class="ja-inline">🇯🇵 メソッドに `@Transactional` を付け忘れ、複数のMapper呼び出しが自動的にトランザクションをなすと誤解していた </span>| `@Transactional` 是必须显式声明的，Spring 不会替普通方法自动加事务<br><span class="ja-inline">🇯🇵 `@Transactional` は明示的に宣言しなければならず、Springは普通のメソッドに自動でトランザクションを付けたりしない </span>| 涉及多步数据库操作、要求"要么全成功要么全撤销"的方法，必须显式加 `@Transactional`<br><span class="ja-inline">🇯🇵 複数ステップのデータベース操作が関わり、「全部成功か全部取り消しか」を要求するメソッドには、必ず明示的に `@Transactional` を付ける </span>|

## 动手练习 ／ 演習

1. 把示例代码里的金额上限从 `10000` 改成 `50`，故意触发异常，观察加了 `@Transactional` 和不加 `@Transactional` 时数据库里 `account` 表余额的变化差异。<br><span class="ja-inline">🇯🇵 サンプルコードの金額上限を `10000` から `50` に変え、わざと例外を起こして、`@Transactional` を付けた場合と付けない場合で `account` テーブルの残高の変化にどんな違いが出るか観察しましょう。</span>
2. 想一想：如果 `transfer` 方法里完全没有任何数据库写操作，只是查询数据，还有没有必要加 `@Transactional`？<br><span class="ja-inline">🇯🇵 考えてみましょう。もし `transfer` メソッドの中にデータベースへの書き込み操作がまったくなく、データの検索だけだったら、`@Transactional` を付ける必要はあるでしょうか？</span>
3. 用自己的话，向一个完全不懂技术的朋友解释一遍"为什么转账操作需要事务"。<br><span class="ja-inline">🇯🇵 自分の言葉で、技術をまったく知らない友人に「なぜ送金操作にトランザクションが必要なのか」を説明してみましょう。</span>

## 小测验 ／ 小テスト

1. 事务的 commit 和 rollback 分别是什么意思？<br><span class="ja-inline">🇯🇵 トランザクションのcommitとrollbackはそれぞれどういう意味ですか？</span>
2. `@Transactional` 注解加在哪里？它的作用是什么？<br><span class="ja-inline">🇯🇵 `@Transactional` アノテーションはどこに付けますか？その役割は何ですか？</span>
3. Spring 实现 `@Transactional` 的底层技术大致是什么（不要求展开细节）？<br><span class="ja-inline">🇯🇵 Springが `@Transactional` を実現している基盤技術はおおよそ何ですか（詳細を展開する必要はありません）？</span>
4. 本章是否讲解了事务隔离级别和传播行为？<br><span class="ja-inline">🇯🇵 本章ではトランザクションの分離レベルと伝播行動を説明しましたか？</span>

<details>
<summary>参考答案 ／ 解答</summary>

1. commit 是事务里所有操作都成功后，把改动真正、永久地保存到数据库；rollback 是事务里任意一步失败时，把这个事务里已经执行过的所有改动撤销，恢复到事务开始前的状态。<br><span class="ja-inline">🇯🇵 commitはトランザクション内のすべての操作が成功した後、変更を実際に、永続的にデータベースに保存することです。rollbackはトランザクション内のどれか1つのステップが失敗したときに、このトランザクション内ですでに実行されたすべての変更を取り消し、トランザクション開始前の状態に戻すことです。</span>
2. 加在 Service 层的方法上（本教程约定），作用是让这个方法内的多个数据库操作组成一个不可分割的事务整体。<br><span class="ja-inline">🇯🇵 Service層のメソッドに付けます（本チュートリアルの約束事）。役割は、このメソッド内の複数のデータベース操作を1つの分割不可能なトランザクションの塊にまとめることです。</span>
3. AOP（面向切面编程）动态代理——Spring 生成一个代理对象，在方法执行前后自动处理事务的开启、提交、回滚。<br><span class="ja-inline">🇯🇵 AOP（アスペクト指向プログラミング）の動的プロキシ——Springがプロキシオブジェクトを生成し、メソッド実行の前後で自動的にトランザクションの開始・コミット・ロールバックを処理します。</span>
4. 没有。本章明确只讲 commit/rollback 的基础用法，事务隔离级别和传播行为等高级内容留到后续学习路线。<br><span class="ja-inline">🇯🇵 説明していません。本章では明確にcommit/rollbackの基礎的な使い方のみを説明し、トランザクションの分離レベルや伝播行動といった高度な内容は今後の学習ロードマップに残しています。</span>
</details>

## 本章总结 ／ 本章のまとめ
你已经理解了为什么需要事务、`commit` 和 `rollback` 的含义，并学会了用 `@Transactional` 保护一组必须"同生共死"的数据库操作。下一章我们把本阶段学到的所有知识（数据库、SQL、连接、MyBatis、MyBatis-Plus、事务）综合起来，做一个真正连接 MySQL 的 Project 3：User CRUD。

> 🇯🇵 これでトランザクションがなぜ必要か、`commit` と `rollback` の意味を理解し、`@Transactional` を使って「運命を共にする」一連のデータベース操作を守る方法を学びました。次の章では、この段階で学んだすべての知識（データベース、SQL、接続、MyBatis、MyBatis-Plus、トランザクション）を統合して、実際にMySQLに接続するProject 3：User CRUDを作ります。
