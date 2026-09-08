# 第 5 章　类与对象

## 本章目标
理解类和对象的关系；能用一个类描述一种业务数据结构（比如学生）；掌握字段、方法、构造方法（无参和多参）以及 `this` 关键字的用法。

## 一句话理解
类是"图纸"，对象是"按图纸造出来的具体产品"——`Student` 这个类描述"学生应该有哪些信息、能做哪些事"，而"小明"、"小红"则是根据这张图纸造出来的一个个具体学生对象。

## 为什么需要它
前面几章的数据都是零散的（一个个 `int`、一个个数组），但真实业务里的一个"学生"包含姓名、年龄、成绩等好几项信息，而且这些信息是"绑在一起"的——不能把小明的名字和小红的年龄搭配在一起。类把这些相关的数据（字段）和操作这些数据的行为（方法）打包成一个整体，对象就是这个整体的一份具体实例。这是面向对象编程的起点，也是后面 Controller、Service、Entity 等一切 Java Web 概念的基础。

## 核心概念

### 5.1 类和对象的关系

- **类（Class）**：一种数据类型的定义，描述"这类东西应该有哪些属性（字段）、能做哪些事（方法）"。
- **对象（Object）**：根据类创建出来的具体实例，也叫"实例（Instance）"。创建对象的过程叫"实例化"，用关键字 `new`。
- 一个类可以创建任意多个对象，每个对象的字段值可以各不相同，但它们的"结构"（有哪些字段、有哪些方法）是一样的。

### 5.2 字段（Field）

字段是类里声明的变量，用来描述这类对象"有什么"：

```java
public class Student {
    String name;
    int age;
    double score;
}
```

`name`、`age`、`score` 就是 `Student` 类的字段。每个 `Student` 对象都会拥有这三个字段各自的一份拷贝——小明的 `name` 是 "小明"，小红的 `name` 是 "小红"，互不影响。

### 5.3 方法（Method）

方法描述这类对象"能做什么"：

```java
public class Student {
    String name;
    int age;
    double score;

    void printInfo() {
        System.out.println(name + "，" + age + "岁，成绩" + score);
    }
}
```

`printInfo()` 就是一个方法，调用它可以打印这个具体学生对象的信息。

### 5.4 构造方法（Constructor）

**构造方法**是一个特殊的方法，专门在 `new` 创建对象的那一刻自动执行，通常用来给字段赋初始值。它有三个特点：

1. 方法名必须和类名完全一致；
2. 没有返回值类型，连 `void` 都不写；
3. 如果你一个构造方法都不写，Java 会自动提供一个"什么都不做"的**无参构造方法**；但只要你自己写了任意一个构造方法，这个自动提供的无参构造就不再存在，如果还想保留无参构造，需要自己显式写出来。

```java
public class Student {
    String name;
    int age;
    double score;

    // 无参构造方法
    public Student() {
    }

    // 多参构造方法，创建对象时直接把值传进来
    public Student(String name, int age, double score) {
        this.name = name;
        this.age = age;
        this.score = score;
    }
}
```

### 5.5 this 关键字

`this` 指的是"当前这个对象自己"。最常见的用法是在构造方法或普通方法里，**当参数名和字段名相同时**，用 `this.字段名` 明确表示"我说的是这个对象自己的字段"，而不是参数：

```java
public Student(String name, int age, double score) {
    this.name = name;   // 左边 this.name 是字段，右边 name 是参数
    this.age = age;
    this.score = score;
}
```

如果没有 `this`，写成 `name = name;`，Java 会认为这是"参数自己赋值给自己"，字段根本没有被赋值成功——这是初学者极易忽略的细节。

## 图解

```
类 Student（图纸）：
┌───────────────────────┐
│  字段：name, age, score │
│  方法：printInfo()      │
└───────────────────────┘
         │  new Student("小明", 18, 88.5)
         ▼
对象 stu1（小明的实例）        对象 stu2（小红的实例）
┌─────────────────┐          ┌─────────────────┐
│ name  = "小明"    │          │ name  = "小红"    │
│ age   = 18       │          │ age   = 19       │
│ score = 88.5     │          │ score = 92.0     │
└─────────────────┘          └─────────────────┘
同一张图纸，造出两个互不影响的具体对象
```

## 最小示例

`Student.java`
```java
public class Student {
    String name;
    int age;
    double score;

    // 无参构造方法：什么都不做，字段会是默认值（null / 0 / 0.0）
    public Student() {
    }

    // 多参构造方法：创建对象时直接初始化好所有字段
    public Student(String name, int age, double score) {
        this.name = name;
        this.age = age;
        this.score = score;
    }

    void printInfo() {
        System.out.println(name + "，" + age + "岁，成绩" + score);
    }
}
```

`StudentDemo.java`
```java
public class StudentDemo {
    public static void main(String[] args) {
        // 用多参构造方法创建对象，一次性初始化好所有字段
        Student stu1 = new Student("小明", 18, 88.5);
        stu1.printInfo();

        // 用无参构造方法创建对象，再手动一个个赋值
        Student stu2 = new Student();
        stu2.name = "小红";
        stu2.age = 19;
        stu2.score = 92.0;
        stu2.printInfo();
    }
}
```

## 代码逐行解释

- `String name; int age; double score;`：三个字段，注意它们没有像局部变量那样立即赋值——字段如果不赋值，会有默认值（`String` 等对象类型默认是 `null`，`int` 默认是 `0`，`double` 默认是 `0.0`）。
- `public Student() { }`：无参构造方法，方法体为空，创建出来的对象所有字段都是默认值。
- `public Student(String name, int age, double score)`：多参构造方法，注意参数名和字段名故意写成一样（这是常见习惯，方便阅读），所以方法体内必须用 `this.` 区分。
- `this.name = name;`：`this.name` 指"当前正在创建的这个对象的 name 字段"，等号右边的 `name` 指"传进来的参数"。
- `Student stu1 = new Student("小明", 18, 88.5);`：`new Student(...)` 触发多参构造方法执行，把三个参数分别赋给 `stu1` 的三个字段；`Student stu1 = ...` 把创建好的对象交给变量 `stu1` 保管。
- `Student stu2 = new Student();`：触发无参构造方法，`stu2` 的三个字段暂时都是默认值。
- `stu2.name = "小红";`：通过"对象.字段名"的方式，在对象创建之后再单独给字段赋值。
- `stu1.printInfo();`：调用 `stu1` 这个具体对象的方法，方法体里的 `name`、`age`、`score` 用的就是 `stu1` 自己的那份数据。

## 程序运行过程

1. JVM 执行 `new Student("小明", 18, 88.5)`：先在内存中开辟一块空间用来存放这个新对象的三个字段，然后调用匹配参数个数和类型的那个构造方法（这里是三参构造），把三个字面量依次赋给 `name`、`age`、`score`。
2. 构造方法执行完毕，这个新对象的引用（可以理解成"这块内存的地址"）被赋值给变量 `stu1`。
3. `stu1.printInfo();`：JVM 找到 `stu1` 指向的那个具体对象，执行它的 `printInfo` 方法，方法体里访问的 `name/age/score` 就是 `stu1` 自己的字段值。
4. `new Student()` 同理，但因为是无参构造，三个字段暂时是默认值，随后三行 `stu2.xxx = ...` 分别把值补上。
5. `stu2.printInfo();` 打印出 `stu2` 自己的字段值，和 `stu1` 完全独立、互不影响。

输出：
```
小明，18岁，成绩88.5
小红，19岁，成绩92.0
```

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| 构造方法里忘记写 `this.`，字段一直是默认值 | `name = name;` 被理解成参数自己赋值给自己，字段根本没被赋值 | 参数名和字段名相同时，字段前必须加 `this.` |
| 写了一个多参构造方法后，`new Student()` 报错说找不到无参构造 | 只要自定义了任意一个构造方法，Java 就不再提供默认的无参构造 | 如果还需要无参构造，必须自己显式写出来 |
| `NullPointerException`，调用 `stu2.name.length()` 之类的方法报错 | `Student stu2 = new Student();` 之后没有手动赋值就直接用字段的方法，`name` 还是默认值 `null`，对 `null` 调用方法会报空指针 | 用无参构造创建对象后，记得给必要字段赋值再使用 |
| 构造方法写成有返回值类型，比如 `public void Student(...)` | 这样它就不再是构造方法，而是一个普通方法，永远不会在 `new` 的时候自动执行 | 构造方法不能写任何返回值类型，连 `void` 都不能写 |

## 动手练习

1. 参照 `Student` 类，自己写一个 `Book` 类，包含字段 `title`（书名）、`price`（价格）、`stock`（库存），写一个无参构造和一个三参构造。
2. 给 `Student` 类新增一个方法 `boolean isPass()`，判断这个学生的 `score` 是否及格（大于等于 60），并在 `main` 方法里测试。
3. 创建 3 个 `Student` 对象放进一个数组 `Student[] students = new Student[3];`，用循环依次调用每个对象的 `printInfo()`。

## 小测验

1. 类和对象分别是什么？打个比方说明二者的关系。
2. 为什么构造方法里经常需要写 `this.name = name;` 而不是直接写 `name = name;`？
3. 如果一个类自己写了一个带参数的构造方法，但没写无参构造方法，`new 类名()` 会发生什么？

<details>
<summary>参考答案</summary>

1. 类是"图纸"（数据结构的定义），对象是"根据图纸造出来的具体实例"。比如 `Student` 类定义了"学生应该有姓名、年龄、成绩"，而"小明"这个具体的人就是一个 `Student` 对象。
2. 因为参数名和字段名相同时，直接写 `name = name;` 会被理解成"参数自己赋值给自己"，字段根本没有被赋值。加上 `this.` 明确表示左边是"当前对象的字段"。
3. 会编译报错，提示找不到无参构造方法——因为只要类里自定义了任意一个构造方法，Java 就不会再提供默认的无参构造。
</details>

## 本章总结
你已经理解了类和对象的关系，学会了用字段描述数据、用方法描述行为，掌握了构造方法（无参和多参）以及 `this` 的用法。下一章将学习面向对象的三大特性——封装、继承、多态，以及接口，进一步组织和复用你的代码。
