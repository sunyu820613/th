# 第 24 章　数据库基础概念

## 本章目标
理解数据库、表、行、列这几个最基础的概念；理解主键（Primary Key）的作用；对外键（Foreign Key）有一个初步的印象。

## 一句话理解
数据库就是一个"专门用来长期保存数据、并且能被程序方便地查询和修改"的仓库，最常见的组织方式是"表格"——一张表就是一个 Excel 工作表那样的东西。

## 为什么需要它
到目前为止，我们写的 Project 2（内存版 User API）把用户数据存在一个 `List<User>` 里。这样做有个致命问题：**程序一重启，数据就没了**——因为内存里的数据只存在于程序运行期间。

如果想让数据"永久保存"，并且支持多个程序、多个人同时安全地读写，就需要一个专门的软件来做这件事——数据库（本教程用 **MySQL 8.x**）。数据库把数据整理成一张一张的"表"，这也是本章要学的内容。

**下载地址**：MySQL Community Server（免费社区版）→ https://dev.mysql.com/downloads/mysql/ ，选择对应操作系统的安装包，按向导安装即可（Windows 也可以直接下载 MySQL Installer 一键安装）。本章和下一章只需要装好 MySQL 服务本身，能跑一些 SQL 语句练手；真正在 Spring Boot 项目里连接它是第 26 章的内容。

## 核心概念

### 24.1 表（Table）、行（Row）、列（Column）

一张表长得就像一个 Excel 表格：

- **表（Table）**：一类数据的集合，比如"所有用户"就可以放在一张叫 `user` 的表里。
- **列（Column）**：表里的"竖着的一栏"，代表这类数据的某一个属性，比如姓名、年龄。每一列都有固定的名字和固定的数据类型。
- **行（Row）**：表里的"横着的一条记录"，代表一条具体的数据，比如某一个具体用户。

拿一张 `user` 表举例，它有 `id`、`name`、`email`、`age` 四列：

| id | name | email | age |
|---|---|---|---|
| 1 | 张三 | zhangsan@example.com | 25 |
| 2 | 李四 | lisi@example.com | 30 |
| 3 | 王五 | wangwu@example.com | 22 |

- 这张表叫 `user`。
- `id`、`name`、`email`、`age` 是它的 4 个列。
- "1，张三，zhangsan@example.com，25" 是其中一行，代表用户张三这一条具体记录。

### 24.2 主键（Primary Key）

观察上面的表，`id` 列有个特殊之处：每一行的 `id` 都不一样，而且一旦确定就不会再变。这样的列适合用来做**主键**——数据库里"唯一标识一行数据"的列。

主键有两个硬性要求：

1. **唯一**：表里不能有两行的主键值相同。
2. **不能为空**：每一行必须有一个主键值。

`user` 表里我们把 `id` 定为主键，意味着"只要给我一个 `id`，我就能唯一确定是哪个用户"，这比用 `name` 去找一个人靠谱得多——现实中同名同姓太常见了，而 `id` 保证不会重复。

在建表的 SQL 里，主键通常这样声明（`AUTO_INCREMENT` 表示这一列的值由数据库自动生成，每插入一行自动加 1，不用你手动指定）：

```sql
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT
);
```

### 24.3 外键（Foreign Key）——先混个脸熟

真实项目里，数据往往不是孤立的一张表，而是"表和表之间有关联"。举个例子：本教程最终项目（第 37 章的 Task 管理系统）里，除了 `user` 表，还会有一张 `task`（任务）表，每个任务都属于某一个用户。这时 `task` 表里会有一列 `user_id`，专门存"这个任务属于哪个用户的 `id`"：

| id | title | user_id |
|---|---|---|
| 1 | 完成周报 | 1 |
| 2 | 修复 Bug | 1 |
| 3 | 写测试用例 | 2 |

`task.user_id` 里的值，实际上就是 `user.id` 的值。像这种"一张表里的某一列，指向另一张表的主键"的设计，就叫**外键（Foreign Key）**。它的作用是让数据库能"知道"这两张表之间的对应关系，防止出现"任务的 `user_id` 指向一个根本不存在的用户"这种脏数据。

> 外键涉及的多表关联查询（比如"查出张三的所有任务"要把两张表联合起来查）本章不展开，后面用到时再讲。这里你只需要记住一句话：**外键就是一张表里存了另一张表主键的值，用来表示"谁属于谁"这种关系**。

## 图解

```
数据库（MySQL 8.x）
  └── 表 user
        ├── 列：id  name  email  age
        ├── 行 1：1, 张三, zhangsan@example.com, 25
        ├── 行 2：2, 李四, lisi@example.com, 30
        └── 行 3：3, 王五, wangwu@example.com, 22

主键：id  ← 每一行唯一，不能重复、不能为空

（后面章节会用到）
表 task
  └── 列 user_id ──外键──▶ 指向 user 表的 id
```

## 最小示例

用 SQL 建一张最基础的 `user` 表（下一章会详细讲 SQL 语句的具体用法，这里先感受一下"建表"长什么样）：

```sql
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT
);

INSERT INTO user (name, email, age) VALUES ('张三', 'zhangsan@example.com', 25);
INSERT INTO user (name, email, age) VALUES ('李四', 'lisi@example.com', 30);
INSERT INTO user (name, email, age) VALUES ('王五', 'wangwu@example.com', 22);
```

## 代码逐行解释

- `CREATE TABLE user (...)`：创建一张名为 `user` 的表，括号里定义它有哪些列。
- `id INT PRIMARY KEY AUTO_INCREMENT`：`id` 列，类型是整数（`INT`），`PRIMARY KEY` 声明它是主键，`AUTO_INCREMENT` 表示插入新行时不用手动指定 `id`，数据库自动从 1 开始往上加。
- `name VARCHAR(50) NOT NULL`：`name` 列，类型是"最多 50 个字符的字符串"（`VARCHAR(50)`），`NOT NULL` 表示这一列不允许为空——建表时就规定"每个用户必须有名字"。
- `email VARCHAR(100) NOT NULL`：邮箱列，同理不能为空。
- `age INT`：年龄列，没写 `NOT NULL`，意味着允许这一列暂时不填（为空）。
- `INSERT INTO user (...) VALUES (...)`：往 `user` 表里插入一行数据。注意没有传 `id`，因为它是 `AUTO_INCREMENT`，数据库会自动生成 1、2、3。

## 程序运行过程

1. 执行 `CREATE TABLE` 语句，MySQL 在数据库里创建一张空的 `user` 表（0 行数据，但列的结构已经定好）。
2. 依次执行 3 条 `INSERT` 语句，MySQL 每次往表里追加一行，`id` 自动生成为 1、2、3。
3. 此时这张表就有了本章开头展示的那 3 行数据，之后可以被任何连接了这个数据库的程序查询到——哪怕程序重启，数据依然还在（这就是数据库和"内存 List"的本质区别）。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `Duplicate entry '1' for key 'PRIMARY'` | 试图插入一个已经存在的主键值 | 主键必须唯一；如果是 `AUTO_INCREMENT` 列，不要手动指定重复的值 |
| `Field 'name' doesn't have a default value` | `name` 列是 `NOT NULL`，但插入时没给这一列赋值 | 插入时必须给所有 `NOT NULL` 且没有默认值的列传值 |
| 把 `name` 当成主键，结果两个用户都叫"张三"导致数据混乱 | 用业务字段（姓名）做唯一标识，现实里容易重复 | 主键应该用一个能保证唯一、且和业务含义无关的列，如自增 `id` |

## 动手练习

1. 在纸上（或脑子里）设计一张 `book`（图书）表，至少包含 `id`、`title`（书名）、`price`（价格）三列，指出哪一列适合做主键。
2. 想一想：如果 `email` 列也要求"不能有两个用户用同一个邮箱注册"，这该用什么约束来实现？（提示：搜索 `UNIQUE` 约束，本教程不展开，但可以先猜一猜）
3. 说说看，如果 `task` 表里的 `user_id` 指向了一个 `user` 表里根本不存在的 `id`，会出现什么问题。

## 小测验

1. 一张表里的"列"和"行"分别对应 Excel 表格里的什么？
2. 主键必须满足哪两个条件？
3. `task.user_id` 是什么？它和 `user.id` 是什么关系？

<details>
<summary>参考答案</summary>

1. "列"对应 Excel 里竖着的一栏（字段），"行"对应横着的一条记录（一条具体数据）。
2. 唯一（不能重复）、不能为空。
3. `task.user_id` 是 `task` 表里的一个外键列，它存的值就是某个用户的 `user.id`，用来表示"这个任务属于哪个用户"。
</details>

## 本章总结
你已经理解了数据库、表、行、列、主键这几个最基础的概念，并对外键有了初步印象。下一章开始动手写 SQL，真正对 `user` 表做增删改查。
