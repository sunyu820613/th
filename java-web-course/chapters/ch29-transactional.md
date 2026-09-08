# 第 29 章　事务 @Transactional

## 本章目标
理解为什么"一组相关的数据库操作"要么全部成功、要么全部撤销；理解事务的 commit（提交）和 rollback（回滚）；学会在 Service 方法上使用 `@Transactional` 注解。

## 一句话理解
事务就是把"好几步数据库操作"打包成一个不可分割的整体：要么这些步骤全部成功生效（commit），要么只要有一步失败，之前做过的所有步骤都会被撤销（rollback），就像什么都没发生过一样。

## 为什么需要它
想象一个转账场景：小明要给小红转 100 元。这个操作在数据库层面其实是两步：

1. 小明账户余额 `-100`
2. 小红账户余额 `+100`

如果第一步执行成功了，第二步却因为某个异常（比如程序崩溃、网络中断、代码里有 bug）没有执行，会发生什么？**小明的钱已经扣了，小红却没收到——100 元凭空消失了。** 这在真实的银行系统里是绝对不能接受的严重事故。

我们需要一种机制，保证"这两步操作要么一起成功，要么一起失败"，这就是**事务**要解决的问题。

## 核心概念

### 29.1 commit 与 rollback

- **commit（提交）**：事务里的所有操作都执行成功后，把这些改动真正、永久地保存到数据库里。
- **rollback（回滚）**：只要事务里任意一步操作失败（比如抛出异常），数据库会把这个事务里**已经执行过的所有操作**全部撤销，让数据库状态恢复到事务开始之前的样子——就好像转账这件事完全没有发生过。

回到转账的例子：把"扣小明的钱"和"加小红的钱"这两步包在同一个事务里。如果第二步失败，数据库会自动把第一步"扣钱"也撤销掉，小明的余额恢复原样——数据库里不会出现"钱已经扣了，但转账其实失败了"这种不一致状态。

### 29.2 `@Transactional` 注解

Spring 提供了 `@Transactional` 注解，加在 Service 方法上，就能让这个方法里的多个数据库操作自动组成一个事务：

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

### 29.3 背后原理：只提一句 AOP

`@Transactional` 是怎么做到"在方法执行前后自动处理事务"的？简单说一句：Spring 底层用了 **AOP（面向切面编程）动态代理** 技术——你调用的其实不是 `transfer` 方法本身，而是 Spring 生成的一个代理对象，代理对象在真正执行 `transfer` 方法之前先开启事务，方法正常执行完毕后提交事务，如果方法执行过程中抛出了异常，代理对象就捕获到这个异常并触发回滚。这背后具体怎么实现的，本教程不展开，你只需要记住"加了 `@Transactional`，Spring 会在方法前后自动帮你处理事务的开启、提交、回滚"就够用了。

> **本章范围说明**：本章只讲 `@Transactional` 最基础的 commit/rollback 用法，**不深入**事务隔离级别（isolation level）、事务传播行为（propagation）等更高级的内容——这些属于进阶话题，会放到后续学习路线里（见第 38 章）。

## 图解

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

## 最小示例

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

## 代码逐行解释

- `@Param("id")` / `@Param("amount")`：当 Mapper 方法有多个参数时，需要用 `@Param` 给每个参数起一个名字，这样 `#{id}`/`#{amount}` 才能在 SQL 里正确对应到具体是哪个参数（只有一个参数时可以省略，但多参数时建议一律显式写明，避免歧义）。
- `@Transactional`：加在 `transfer` 方法上，声明这个方法内的数据库操作要作为一个事务整体执行。
- 示例故意在两次数据库操作中间加了一段"金额超过 10000 抛异常"的校验逻辑：如果 `amount` 超过 10000，`decreaseBalance` 已经执行了，但代码会在执行 `increaseBalance` 之前抛出异常。因为整个方法被 `@Transactional` 包裹，Spring 会捕获到这个未被处理的运行时异常，自动把已经执行的 `decreaseBalance` 也回滚掉，数据库里不会留下"扣了钱但没转成功"的痕迹。

## 程序运行过程

1. Controller/Service 调用方（本例简化，假设由某个上层方法直接调用）调用 `accountService.transfer(fromId, toId, amount)`。
2. 因为 `AccountService` 是被 Spring 管理的 Bean，且方法上有 `@Transactional`，Spring 实际拿到的是一个代理对象。
3. 代理对象在真正执行 `transfer` 方法体之前，先向数据库开启一个事务。
4. 依次执行方法体里的代码：先调用 `accountMapper.decreaseBalance(...)`，如果金额校验不通过就抛出异常。
5. 代理对象捕获到这个异常，判断需要回滚，于是通知数据库把这个事务里已经执行过的所有改动撤销（`decreaseBalance` 造成的余额变化被撤销）。
6. 如果没有异常，方法正常执行完 `increaseBalance` 后返回，代理对象通知数据库提交事务，两步改动正式生效。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 加了 `@Transactional`，但异常发生后数据居然没回滚 | `@Transactional` 默认只对**运行时异常**（`RuntimeException` 及其子类）触发回滚，对受检异常（`Exception` 但不是 `RuntimeException`）默认不回滚 | 本教程示例统一抛 `RuntimeException` 及其子类（如 `IllegalArgumentException`）；如果必须用受检异常触发回滚，需要显式配置 `@Transactional(rollbackFor = Exception.class)`，本教程不展开 |
| 在同一个类里，一个普通方法内部调用了本类另一个加了 `@Transactional` 的方法，发现事务没生效 | Spring 的 `@Transactional` 依赖代理对象生效，类内部直接调用（`this.xxx()`）不会经过代理，导致注解被"绕过" | 这是一个进阶陷阱，本教程只需要知道"跨方法调用可能导致事务失效"，具体解决方案属于后续学习内容 |
| 忘记在方法上加 `@Transactional`，误以为多个 Mapper 调用会自动组成事务 | `@Transactional` 是必须显式声明的，Spring 不会替普通方法自动加事务 | 涉及多步数据库操作、要求"要么全成功要么全撤销"的方法，必须显式加 `@Transactional` |

## 动手练习

1. 把示例代码里的金额上限从 `10000` 改成 `50`，故意触发异常，观察加了 `@Transactional` 和不加 `@Transactional` 时数据库里 `account` 表余额的变化差异。
2. 想一想：如果 `transfer` 方法里完全没有任何数据库写操作，只是查询数据，还有没有必要加 `@Transactional`？
3. 用自己的话，向一个完全不懂技术的朋友解释一遍"为什么转账操作需要事务"。

## 小测验

1. 事务的 commit 和 rollback 分别是什么意思？
2. `@Transactional` 注解加在哪里？它的作用是什么？
3. Spring 实现 `@Transactional` 的底层技术大致是什么（不要求展开细节）？
4. 本章是否讲解了事务隔离级别和传播行为？

<details>
<summary>参考答案</summary>

1. commit 是事务里所有操作都成功后，把改动真正、永久地保存到数据库；rollback 是事务里任意一步失败时，把这个事务里已经执行过的所有改动撤销，恢复到事务开始前的状态。
2. 加在 Service 层的方法上（本教程约定），作用是让这个方法内的多个数据库操作组成一个不可分割的事务整体。
3. AOP（面向切面编程）动态代理——Spring 生成一个代理对象，在方法执行前后自动处理事务的开启、提交、回滚。
4. 没有。本章明确只讲 commit/rollback 的基础用法，事务隔离级别和传播行为等高级内容留到后续学习路线。
</details>

## 本章总结
你已经理解了为什么需要事务、`commit` 和 `rollback` 的含义，并学会了用 `@Transactional` 保护一组必须"同生共死"的数据库操作。下一章我们把本阶段学到的所有知识（数据库、SQL、连接、MyBatis、MyBatis-Plus、事务）综合起来，做一个真正连接 MySQL 的 Project 3：User CRUD。
