# 第 1 章　环境搭建与第一个程序

## 本章目标
装好 JDK 21 和 IntelliJ IDEA；理解 Java 代码"编译再运行"的两步走；亲手跑通第一个 Java 程序。

## 一句话理解
Java 代码不能被电脑直接执行，必须先"翻译"成一种中间格式（字节码），再交给一个专门的"翻译官"（JVM）负责加载和执行。

## 为什么需要它
如果没有统一的运行环境，你写的代码在你电脑上能跑，换一台电脑可能就跑不了（缺少必要的运行时、版本不对等）。JDK 提供了写代码、编译代码所需的全部工具；JVM 则保证只要装了它，同一份程序在 Windows、Mac、Linux 上都能跑起来——这也是 Java 常被称为"一次编写，到处运行"的原因。

## 核心概念

| 术语 | 含义 |
|---|---|
| JDK（Java Development Kit） | 开发工具包，包含编译器 `javac`、运行工具 `java`、标准类库等，写 Java 必装 |
| JRE（Java Runtime Environment） | 只能运行 Java 程序，不能开发（现在很少单独安装，JDK 已包含它） |
| JVM（Java Virtual Machine） | Java 虚拟机，负责加载和执行字节码的"翻译官"。运行时它既可能逐条解释执行字节码，也可能通过 JIT（即时编译）把频繁执行的"热点代码"直接编译成机器码来提速——这部分原理比较深，零基础阶段只需要记住"JVM 负责执行字节码"即可，不用展开 |
| 字节码（Bytecode） | `.java` 源文件编译后得到的 `.class` 文件内容，JVM 能看懂的中间格式 |
| IDE | 集成开发环境，如 IntelliJ IDEA，把编辑、编译、运行、调试整合在一个界面里 |

本教程统一使用：**JDK 21（LTS 长期支持版）+ IntelliJ IDEA Community 版**。后续所有章节的代码，均可在此环境下直接运行。

**下载地址**：

- JDK 21：推荐使用免费开源、无需注册账号的 Eclipse Temurin 构建版 → https://adoptium.net/temurin/releases/?version=21 （如果习惯用 Oracle 官方发行版，也可以从 https://www.oracle.com/java/technologies/downloads/#java21 下载）
- IntelliJ IDEA Community 版（免费）：https://www.jetbrains.com/idea/download/ （页面上注意选择 **Community** 版本，不是收费的 Ultimate 版）

## 图解

```
写代码            编译                运行
Hello.java  ──javac──▶  Hello.class  ──java──▶  控制台输出
（源代码，人能读懂）      （字节码，JVM 能读懂）    （JVM 加载并执行字节码）
```

对比一下：如果 Java 像"点菜直接上菜"（脚本语言，写完直接跑），那它更像"先把菜谱翻译成后厨看得懂的标准工序单（字节码），不管换哪个后厨（操作系统），只要有会看工序单的厨师（JVM），就能做出同一道菜"。

## 最小示例

`Hello.java`
```java
public class Hello {
    // main 方法是程序的入口，JVM 启动后第一个执行这里
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}
```

命令行运行：
```bash
javac Hello.java   # 第一步：编译，生成 Hello.class
java Hello          # 第二步：运行（注意这里不写 .class 后缀）
```

## 代码逐行解释

- `public class Hello`：声明一个名为 `Hello` 的类。`public` 表示这个类对外部完全可见。Java 规定：**文件名必须和 `public class` 后面的类名完全一致**（区分大小写），所以这段代码必须存在名为 `Hello.java` 的文件里。
- `public static void main(String[] args)`：这是程序的入口方法。本教程统一使用这个最标准、最常见的写法，初学阶段直接照这个形式写就行（以后你可能会在别的代码里看到 `String... args` 这种写法，那是同一个入口方法的另一种合法参数写法，不是错误代码，这里先不展开）。
  - `static` 表示这个方法属于类本身，不需要先创建对象就能调用——JVM 启动时还没有任何对象，所以入口方法必须是 `static`。
  - `void` 表示这个方法不返回任何值。
  - `String[] args`：接收命令行传入的参数（本例暂不使用）。
- `System.out.println("Hello, Java!");`：调用 Java 标准库里 `System` 类的 `out`（标准输出对象）的 `println` 方法，把字符串打印到控制台并换行。

## 程序运行过程

1. 你在 IDEA 中点击"运行"（或命令行执行 `javac` + `java`）。
2. `javac` 把 `Hello.java` 编译成 `Hello.class`（字节码），此时还没有任何输出。
3. `java Hello` 命令启动 JVM，JVM 加载 `Hello.class`，找到 `main` 方法开始逐行执行。
4. 执行到 `System.out.println(...)`，JVM 调用操作系统的输出功能，把文字显示在你的控制台窗口。
5. `main` 方法执行完毕，程序自动结束，JVM 退出。

输出：
```
Hello, Java!
```

## 常见错误

| 现象 | 原因 | 解决 |
|---|---|---|
| `错误: 找不到或无法加载主类 Hello` | 类名和文件名不一致，或者没有先执行 `javac` | 检查文件名，确认已生成 `.class` 文件 |
| `error: class Hello is public, should be declared in a file named Hello.java` | 编译器直接报错，同上 | 文件名必须和 `public class` 后的名字完全一致 |
| 编译通过但双击运行没反应 | 忘了先编译，或者路径不对 | 确认在包含 `.class` 文件的目录下执行 `java Hello` |

## 动手练习

1. 把打印内容改成你自己的名字，比如 `"Hello, 小明!"`，重新编译运行。
2. 故意把类名改成 `hello`（小写），保持文件名 `Hello.java` 不变，观察编译器报什么错，理解这条规则。
3. 在 `main` 方法里再加一行 `System.out.println("这是我的第一个 Java 程序");`，观察输出顺序。

## 小测验

1. `javac` 和 `java` 分别负责什么？
2. 为什么 `main` 方法必须是 `static` 的？
3. 如果文件名是 `App.java`，里面写 `public class Hello {...}`，编译会发生什么？

<details>
<summary>参考答案</summary>

1. `javac` 负责把源代码编译成字节码（`.class` 文件）；`java` 负责启动 JVM 执行字节码。
2. 因为程序启动时 JVM 还没有创建任何对象，`static` 方法不依赖对象即可直接调用，所以入口方法必须是 `static`。
3. 编译报错：`class Hello is public, should be declared in a file named Hello.java`——public 类名必须和文件名一致。
</details>

## 本章总结
你已经理解了 Java "先编译、后运行"的两步模型，装好了开发环境，并跑通了第一个程序。下一章开始学习变量和数据类型——真正开始"给程序数据去处理"。
