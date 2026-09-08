# 第 25 章　基础 SQL 实战

## 本章目标
掌握 SQL 里最常用的五个动作：查（`SELECT`）、增（`INSERT`）、改（`UPDATE`）、删（`DELETE`），以及配合查询使用的 `WHERE`、`ORDER BY`、`LIMIT`。

## 一句话理解
SQL（Structured Query Language，结构化查询语言）就是"跟数据库说话"的语言——你用它告诉数据库"给我查什么"、"帮我存什么"、"把什么改成什么"、"把什么删掉"。

## 为什么需要它
上一章我们已经建好了 `user` 表，但光有表没有数据，或者数据存进去了取不出来，那这张表毫无意义。SQL 就是操作表里数据的唯一入口，不管以后用什么 Java 框架连接数据库，最终发送给数据库的，本质上都是一句句 SQL。所以先把最基础的 SQL 语句练熟，是后面学 MyBatis 的地基。

## 核心概念

本章统一使用上一章建好的 `user` 表，并先插入几条初始数据：

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

此时表内容：

| id | name | email | age |
|---|---|---|---|
| 1 | 张三 | zhangsan@example.com | 25 |
| 2 | 李四 | lisi@example.com | 30 |
| 3 | 王五 | wangwu@example.com | 22 |

## 图解

```
SELECT   ──▶  从表里"读"数据，不改变表内容
INSERT   ──▶  往表里"加"一行新数据
UPDATE   ──▶  把已有的某些行"改"成新值
DELETE   ──▶  把已有的某些行"删"掉

WHERE     配合以上语句，指定"只对满足条件的行生效"
ORDER BY  配合 SELECT，指定查询结果按什么排序
LIMIT     配合 SELECT，指定最多返回几行
```

### SELECT——查询

```sql
SELECT * FROM user;
```
`*` 表示"所有列"，这句话的意思是"把 `user` 表的所有行、所有列都查出来"。

执行结果（即上面那张 3 行的表）：
```
id | name | email                 | age
1  | 张三  | zhangsan@example.com  | 25
2  | 李四  | lisi@example.com      | 30
3  | 王五  | wangwu@example.com    | 22
```

只查某几列：
```sql
SELECT name, age FROM user;
```
结果只有 `name` 和 `age` 两列：
```
name | age
张三  | 25
李四  | 30
王五  | 22
```

### WHERE——加条件

只查年龄大于 24 的用户：
```sql
SELECT * FROM user WHERE age > 24;
```
结果：
```
id | name | email                 | age
1  | 张三  | zhangsan@example.com  | 25
2  | 李四  | lisi@example.com      | 30
```
`WHERE` 后面跟的是判断条件，只有满足条件的行才会出现在结果里。`王五`（22 岁）不满足 `age > 24`，被过滤掉了。

按主键精确查一条：
```sql
SELECT * FROM user WHERE id = 2;
```
结果：
```
id | name | email             | age
2  | 李四  | lisi@example.com  | 30
```

### ORDER BY——排序

按年龄从大到小排序：
```sql
SELECT * FROM user ORDER BY age DESC;
```
结果：
```
id | name | email                 | age
2  | 李四  | lisi@example.com      | 30
1  | 张三  | zhangsan@example.com  | 25
3  | 王五  | wangwu@example.com    | 22
```
`DESC` 是降序（从大到小）；不写或写 `ASC` 是升序（从小到大）。

### LIMIT——限制条数

只取年龄最大的 1 个用户：
```sql
SELECT * FROM user ORDER BY age DESC LIMIT 1;
```
结果：
```
id | name | email             | age
2  | 李四  | lisi@example.com  | 30
```
`ORDER BY ... LIMIT ...` 是非常常见的组合写法："先排好序，再只要前几条"，后面第 37 章做分页时还会再用到类似思路。

### INSERT——新增

```sql
INSERT INTO user (name, email, age) VALUES ('赵六', 'zhaoliu@example.com', 28);
```
执行后，`user` 表多了一行 `id = 4` 的数据（`id` 自动生成）：
```
id | name | email                 | age
4  | 赵六  | zhaoliu@example.com   | 28
```

### UPDATE——修改

把张三的年龄改成 26 岁：
```sql
UPDATE user SET age = 26 WHERE id = 1;
```
执行后再查 `id = 1` 这一行：
```
id | name | email                 | age
1  | 张三  | zhangsan@example.com  | 26
```

> **`UPDATE` 一定要带 `WHERE`！** 如果漏写 `WHERE`，`UPDATE user SET age = 26;` 会把表里**所有行**的 `age` 都改成 26，这是最容易犯的低级错误之一。

### DELETE——删除

删除 `id = 4` 的这一行（也就是刚插入的赵六）：
```sql
DELETE FROM user WHERE id = 4;
```
执行后再查全表，赵六那一行消失了，表恢复成最初的 3 行。

> 和 `UPDATE` 同理，`DELETE FROM user;`（不带 `WHERE`）会把表里**所有数据**删光，务必小心。

## 最小示例

把本章用到的语句串成一个完整的小练习，按顺序执行：

```sql
-- 1. 建表 + 初始数据
CREATE TABLE user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    age INT
);
INSERT INTO user (name, email, age) VALUES ('张三', 'zhangsan@example.com', 25);
INSERT INTO user (name, email, age) VALUES ('李四', 'lisi@example.com', 30);
INSERT INTO user (name, email, age) VALUES ('王五', 'wangwu@example.com', 22);

-- 2. 查询：年龄大于 24，按年龄降序，只取第 1 条
SELECT * FROM user WHERE age > 24 ORDER BY age DESC LIMIT 1;

-- 3. 新增一条
INSERT INTO user (name, email, age) VALUES ('赵六', 'zhaoliu@example.com', 28);

-- 4. 修改：把李四的年龄改成 31
UPDATE user SET age = 31 WHERE id = 2;

-- 5. 删除：把赵六删掉
DELETE FROM user WHERE name = '赵六';
```

## 代码逐行解释

- `SELECT * FROM user WHERE age > 24 ORDER BY age DESC LIMIT 1;`：这句话可以这样拆读——"从 `user` 表里，先筛选出 `age > 24` 的行，再按 `age` 从大到小排序，最后只留下第 1 条"。SQL 的书写顺序是固定的（`SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...`），但数据库执行时的实际顺序是"先过滤，再排序，最后截取条数"。
- `UPDATE user SET age = 31 WHERE id = 2;`：`SET` 后面写"列名 = 新值"，可以用逗号分隔同时改多列，比如 `SET age = 31, email = 'new@example.com'`。
- `DELETE FROM user WHERE name = '赵六';`：`WHERE` 后面也可以用非主键的列做条件，但要注意如果 `name` 有重复值，会把所有同名的行一起删掉。

## 程序运行过程

以 `SELECT * FROM user WHERE age > 24 ORDER BY age DESC LIMIT 1;` 为例：

1. 你（或程序）把这句 SQL 发送给 MySQL 服务进程。
2. MySQL 先扫描 `user` 表的每一行，保留满足 `age > 24` 的行（张三 25、李四 30，过滤掉王五 22）。
3. 对剩下的行按 `age` 降序排列（李四 30 排第一，张三 25 排第二）。
4. `LIMIT 1` 截取排序后的第一条，也就是李四这一行。
5. MySQL 把这一行结果返回给发起查询的一方。

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `UPDATE`/`DELETE` 后发现表里的数据全变了/全没了 | 忘记写 `WHERE`，语句对全表所有行生效 | 执行 `UPDATE`/`DELETE` 前养成习惯，先用同样的 `WHERE` 条件跑一遍 `SELECT`，确认影响的行是自己想要的 |
| `Unknown column 'agee' in 'field list'` | 列名拼错了 | 检查建表语句里的真实列名，SQL 对列名拼写要求精确 |
| `ORDER BY` 之后加了 `WHERE`，报语法错误 | SQL 关键字顺序写反了 | 固定顺序：`SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ...`，`WHERE` 必须在 `ORDER BY` 前面 |

## 动手练习

1. 写一条 SQL，查出 `user` 表里 `age` 在 20~28 之间的用户（提示：可以用 `WHERE age >= 20 AND age <= 28`）。
2. 写一条 SQL，把邮箱以 `example.com` 结尾的用户的 `age` 统一改成 18（提示：这题只是练手，实际业务里几乎不会这样批量改真实数据）。
3. 写一条 SQL，查出 `user` 表里年龄最小的用户是谁。

## 小测验

1. `SELECT * FROM user;` 里的 `*` 代表什么？
2. 为什么执行 `UPDATE`/`DELETE` 前一定要先确认 `WHERE` 条件？
3. `ORDER BY age DESC LIMIT 1` 和 `LIMIT 1 ORDER BY age DESC`，哪一种写法是正确的 SQL 语法？

<details>
<summary>参考答案</summary>

1. 代表"所有列"，即把表里定义的每一列都查出来。
2. 因为不带 `WHERE` 的 `UPDATE`/`DELETE` 会对表里的**所有行**生效，很容易造成数据被误改或误删，且大多数情况下无法恢复。
3. `ORDER BY age DESC LIMIT 1` 是正确的。SQL 语句里 `LIMIT` 必须写在 `ORDER BY` 之后，顺序不能颠倒。
</details>

## 本章总结
你已经掌握了 `SELECT`/`INSERT`/`UPDATE`/`DELETE` 四大基础语句，以及配合它们使用的 `WHERE`/`ORDER BY`/`LIMIT`。下一章开始让 Spring Boot 程序连上 MySQL——把这些 SQL 能力真正接入到我们的 Java 项目里。
