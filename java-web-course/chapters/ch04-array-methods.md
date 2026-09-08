# 第 4 章　数组与方法基础

## 本章目标
理解数组是什么、怎么声明和遍历，认识数组下标越界这个最常见的坑；理解方法的参数、返回值，以及"方法重载"的概念。

## 一句话理解
数组是"一排连续编号的盒子，每个盒子存同一种类型的数据"；方法是"把一段可能被反复用到的代码打包起来，起个名字，需要的时候直接叫它干活"。

## 为什么需要它
如果要存 100 个学生的分数，总不能声明 100 个变量 `score1, score2, ..., score100` 吧？数组解决了"批量存储同类型数据"的问题。而如果计算"两个数之和"这段逻辑在程序里要用 10 次，每次都重新写一遍既麻烦又容易出错，方法解决了"把逻辑封装、复用"的问题。

## 核心概念

### 4.1 数组的声明与初始化

```java
int[] scores = new int[5];          // 声明一个能存 5 个 int 的数组，默认值都是 0
int[] ages = {18, 20, 22, 19};      // 声明的同时直接赋值，长度由数据个数决定（这里是 4）
```

- 数组一旦创建，**长度固定，不能再变**（想要"可变长度"的容器，后面第 8 章会学到 `List`）。
- 数组里的每个位置叫一个"元素"，用**下标（索引）**访问，**下标从 0 开始**，最后一个元素的下标是"长度 - 1"。
- 用 `数组名.length`（注意没有括号，这是属性不是方法）获取数组长度。

```
下标：   0    1    2    3
数组：[ 18,  20,  22,  19 ]
长度是 4，合法下标范围是 0~3
```

### 4.2 遍历数组

最常见的写法是用 `for` 循环配合下标：

```java
for (int i = 0; i < ages.length; i++) {
    System.out.println(ages[i]);
}
```

Java 还提供一种"增强 for 循环"（也叫 for-each），当你只关心"每个元素的值"、不关心下标时更简洁：

```java
for (int age : ages) {
    System.out.println(age);
}
```

### 4.3 数组下标越界——最常见的坑

数组的合法下标是 `0` 到 `length - 1`。访问超出这个范围的下标（比如访问一个长度为 4 的数组的第 4 个元素 `ages[4]`，或者访问 `ages[-1]`），程序不会给你一个"空值"，而是会直接抛出异常并终止：

```
Exception in thread "main" java.lang.ArrayIndexOutOfBoundsException: Index 4 out of bounds for length 4
```

这是初学者最容易踩的坑，尤其是在写 `for` 循环时把条件写成 `i <= ages.length`（多了一个等号）。

### 4.4 方法的参数与返回值

方法的基本结构：

```java
修饰符 返回值类型 方法名(参数类型 参数名, ...) {
    // 方法体
    return 返回值; // 如果返回值类型是 void，可以不写 return，或者只写 return; 提前结束
}
```

- **参数**：调用方法时传进去的数据，方法内部用参数名直接使用。
- **返回值**：方法执行完之后"交还"给调用者的结果，类型必须和方法声明的返回值类型一致；如果方法不需要返回任何东西，返回值类型写 `void`。

```java
public static int add(int a, int b) {
    return a + b;
}
```

调用时：`int result = add(3, 5);`——`3` 和 `5` 分别传给参数 `a` 和 `b`，方法执行完把 `8` 返回，赋值给 `result`。

### 4.5 方法重载（Overload）

**方法重载**指的是：**在同一个类中，可以定义多个同名方法，只要它们的参数列表不同（参数个数不同，或参数类型不同，或参数顺序不同）**，编译器会根据你调用时传入的参数自动匹配到对应的那一个。

> 注意：方法重载和返回值类型无关，也和参数名无关——只看参数列表（个数、类型、顺序）。这一点在第 6 章会和"方法重写（Override）"放在一起对比，二者名字很像但完全是两回事。

```java
public static int add(int a, int b) {
    return a + b;
}

public static double add(double a, double b) {
    return a + b;
}

public static int add(int a, int b, int c) {
    return a + b + c;
}
```

上面三个方法名字都叫 `add`，但参数列表各不相同，这就是重载：调用 `add(1, 2)` 会匹配第一个，`add(1.5, 2.5)` 匹配第二个，`add(1, 2, 3)` 匹配第三个。

## 图解

```
数组内存示意（int[] ages = {18, 20, 22, 19};）：

下标        0     1     2     3
        ┌─────┬─────┬─────┬─────┐
数组     │ 18  │ 20  │ 22  │ 19  │
        └─────┴─────┴─────┴─────┘
          ▲                 ▲
      ages[0]           ages[3]（最后一个，length - 1）
                         ages[4] ← 越界！不存在这个盒子

方法调用示意：

调用方：int result = add(3, 5);
                          │  │
                          ▼  ▼
方法定义：public static int add(int a, int b) {
                                a=3  b=5
              return a + b;   // 计算 8
          }
调用方拿到返回值：result = 8
```

## 最小示例

`ArrayAndMethodDemo.java`
```java
public class ArrayAndMethodDemo {

    public static void main(String[] args) {
        int[] scores = {88, 92, 76, 60, 45};

        // 遍历数组，统计及格人数
        int passCount = 0;
        for (int i = 0; i < scores.length; i++) {
            if (isPass(scores[i])) {
                passCount++;
            }
        }
        System.out.println("及格人数：" + passCount);

        // 增强 for 循环，计算总分
        int total = 0;
        for (int score : scores) {
            total += score;
        }
        System.out.println("总分：" + total);

        // 方法重载示例
        System.out.println("两数之和：" + add(3, 5));
        System.out.println("三数之和：" + add(3, 5, 10));
        System.out.println("小数之和：" + add(1.5, 2.5));
    }

    // 判断是否及格，返回 boolean
    public static boolean isPass(int score) {
        return score >= 60;
    }

    // 重载：两个 int 相加
    public static int add(int a, int b) {
        return a + b;
    }

    // 重载：三个 int 相加
    public static int add(int a, int b, int c) {
        return a + b + c;
    }

    // 重载：两个 double 相加
    public static double add(double a, double b) {
        return a + b;
    }
}
```

## 代码逐行解释

- `int[] scores = {88, 92, 76, 60, 45};`：声明并初始化一个长度为 5 的数组。
- `for (int i = 0; i < scores.length; i++)`：用下标遍历，条件是 `i < scores.length` 而**不是** `i <= scores.length`——这是防止越界的关键写法，务必记住用 `<`。
- `if (isPass(scores[i]))`：`scores[i]` 取出下标为 `i` 的元素，作为参数传给 `isPass` 方法。
- `public static boolean isPass(int score)`：方法接收一个 `int` 参数，返回一个 `boolean`，方法体只有一行 `return score >= 60;`，直接把比较结果作为返回值。
- `for (int score : scores)`：增强 for 循环，每一轮 `score` 依次等于数组中的每一个元素，这里不需要也不能用下标。
- `add(3, 5)` / `add(3, 5, 10)` / `add(1.5, 2.5)`：三次调用分别匹配到三个不同的重载方法，编译器在**编译期**就已经根据参数类型和个数确定好具体调用哪一个，不是运行时才决定的。

## 程序运行过程

1. JVM 从 `main` 方法开始执行，创建数组 `scores` 并在内存中依次存入 5 个整数。
2. 进入第一个 `for` 循环，`i` 从 0 到 4 依次取值，每轮调用 `isPass(scores[i])`：
   - 调用 `isPass` 时，JVM 会为这次调用单独准备一块"方法执行空间"，把 `scores[i]` 的值拷贝给参数 `score`。
   - 方法执行完 `return score >= 60;` 后，把 `true` 或 `false` 交还给调用处，这块临时空间随之释放。
3. 根据每次调用的返回值，决定是否让 `passCount++`。
4. 第二个循环用增强 for 遍历数组求和。
5. 最后三次调用 `add`，编译器已经在编译时根据参数确定好每次具体走哪个重载版本，运行时依次执行、打印结果。

输出：
```
及格人数：4
总分：361
两数之和：8
三数之和：18
小数之和：4.0
```

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `ArrayIndexOutOfBoundsException` | 循环条件写成 `i <= scores.length`，或者手动访问了不存在的下标 | 遍历时始终用 `i < 数组.length`；牢记合法下标是 `0` 到 `length - 1` |
| `NullPointerException`（空指针异常） | 数组声明了但还没赋值就直接使用，比如 `int[] arr; System.out.println(arr[0]);` | 数组用之前必须先 `new` 出来或者直接赋初始值 |
| 编译报错，说找不到匹配的方法 `add(int, int, double)` | 调用方法时传入的参数类型和个数，没有任何一个重载版本能匹配 | 检查已定义的重载版本，确认参数个数和类型是否对得上，必要时新增一个重载 |
| 两个重载方法参数列表实际上"看起来不同、其实相同" | 比如把 `add(int a, int b)` 和 `add(int x, int y)` 当成是两个不同的重载，实际上参数名不算数，这两个签名完全一样，会直接编译报错"方法重复定义" | 记住重载只看参数的**类型、个数、顺序**，参数名无关紧要 |

## 动手练习

1. 声明一个存放 6 个学生成绩的 `int[]` 数组，用 `for` 循环找出其中的最高分和最低分并打印。
2. 写一个方法 `max(int a, int b)`，返回两者中较大的值；再重载一个 `max(int a, int b, int c)`，返回三者中最大的值。
3. 故意写一段访问越界下标的代码，运行观察控制台报什么异常，理解异常信息里的下标和长度分别指什么。

## 小测验

1. 一个长度为 10 的数组，合法下标范围是多少？
2. 方法重载看的是方法的哪几个方面？返回值类型算不算？
3. 下面代码有什么问题？
   ```java
   int[] arr = new int[3];
   for (int i = 0; i <= arr.length; i++) {
       System.out.println(arr[i]);
   }
   ```

<details>
<summary>参考答案</summary>

1. `0` 到 `9`（长度为 10，下标从 0 开始，最后一个是 `length - 1 = 9`）。
2. 看方法名 + 参数列表（参数的类型、个数、顺序）。返回值类型**不算**——两个方法如果参数列表完全相同，仅返回值类型不同，是不允许的，编译会报错。
3. 循环条件写成了 `i <= arr.length`，当 `i` 等于 `3`（也就是 `arr.length`）时，会尝试访问 `arr[3]`，但合法下标只到 `2`，会抛出 `ArrayIndexOutOfBoundsException`。正确写法是 `i < arr.length`。
</details>

## 本章总结
你已经学会了声明和遍历数组，理解了下标越界这个经典陷阱，并掌握了方法的参数、返回值和方法重载的概念。下一章开始学习"类与对象"——把数据和操作数据的方法真正组织在一起，写出更贴近真实业务的代码。
