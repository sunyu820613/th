# 中日双语对照版 — 翻译规范

本文档是翻译任务的共享规范，翻译前请先读一遍。

## 输入 / 输出

- 输入：`/tmp/claude-0/-home-user-th/fc11efe4-58ae-5bcb-b38b-1cec944b2fd8/scratchpad/chapters/` 目录下的中文 Markdown 章节文件（已经定稿，不要改动中文原意）。
- 输出：把每个分配到的文件，翻译成"中日对照"版本，写入 `/tmp/claude-0/-home-user-th/fc11efe4-58ae-5bcb-b38b-1cec944b2fd8/scratchpad/chapters_bilingual/` 目录下，**文件名完全相同**。

## 对照格式（逐段落对照，不是整篇分两半）

对每一个 Markdown 块（标题、段落、列表项、表格行、图解框），采用"中文紧跟日文"的方式：

### 标题（`#`/`##`/`###`）
写成一行，中文和日文之间用全角斜杠隔开：
```
## 核心概念 ／ コアコンセプト
```

### 普通段落
中文段落后面紧跟一行日文翻译，中间用一个空行分隔，日文整段前面加 `> ` 引用符号并配合 HTML 注释标记语言（方便后续用 CSS 区分样式），格式固定如下：
```
这是中文段落内容。

> 🇯🇵 これは日本語の段落内容です。
```

### 列表（`-`/`1.`）
每一条列表项，中文后面紧跟一条日文翻译（用同样的 `> 🇯🇵` 前缀），保持在列表结构内：
```
- 第一条中文
  > 🇯🇵 一つ目の日本語訳
- 第二条中文
  > 🇯🇵 二つ目の日本語訳
```

### 表格
在原表格的每一个中文单元格内容后面，用 `<br>🇯🇵` 换行追加日文翻译，表头也要翻译：
```
| 类型 ／ 种类 | 用途 ／ 用途 |
|---|---|
| `int` | 整数（最常用）<br>🇯🇵 整数（最もよく使う） |
```

### 代码块（```java、```xml、```sql、```bash、```yaml 等）
**代码块本身不翻译**（保留原样，包括代码里的中文字符串字面量、中文注释——那是代码内容，不是教学文字）。但如果代码块前面有一句引导语（比如"`HelloController.java`"这种文件名标注行），也按段落规则加一行日文。

### `<details><summary>参考答案</summary>...</details>` 折叠块
`summary` 里的文字翻译成"参考答案 ／ 解答"。里面的每一条答案按普通段落/列表规则处理（中文后跟日文）。

## 重要名词注释规则

**每一章内**，重要的技术名词第一次出现时，在中文文本里用括号加一个简短的中文注释（如果原文已经解释过含义，不用再加），**并且在对应的日文翻译句子里，也用括号加一个简短的日文注释**。同一章内，同一个名词不需要重复加注释。

需要加注释的名词类型包括但不限于：
```
JDK / JRE / JVM
IDE / IntelliJ IDEA
Maven / pom.xml
Bean / IoC / DI / ApplicationContext
Servlet / Tomcat / DispatcherServlet / HandlerMapping / HandlerAdapter
Controller / Service / Mapper / Repository / Entity / DTO / VO
Spring Boot / Spring MVC / @SpringBootApplication
MyBatis / MyBatis-Plus / BaseMapper
JSON / Jackson / 序列化 / 反序列化
RESTful / HTTP Method / 状态码
事务 / @Transactional / commit / rollback
DTO / 参数校验 / @Valid
异常处理 / @RestControllerAdvice
日志 / SLF4J / Logback
JUnit / 单元测试 / 集成测试 / Mock
分页 / Page / PaginationInnerInterceptor
```

示例（中文里首次出现 Bean 时）：
```
Spring 会自动创建这个对象（Bean，交给 Spring 容器统一管理的对象），并在需要时注入给别的类。

> 🇯🇵 Springはこのオブジェクト（Bean、Springコンテナが一元管理するオブジェクト）を自動的に作成し、必要な時に他のクラスに注入します。
```

之后这一章后面再出现"Bean"这个词，就不用再加括号注释了，直接写"Bean"即可（中日文都一样）。

## 翻译质量要求

1. **日语要准确、地道、符合技术文档的书面语体**（です・ます体或である体均可，但同一份文件内保持一致，推荐です・ます体，更适合教程）。
2. **专有名词、类名、方法名、注解名、URL、HTTP 方法名一律保留英文原文不翻译**（比如 `@RestController`、`GET /users`、`TaskService`、`selectById`）。
3. 不要逐字直译导致日语生硬，要按照日语技术文章的自然表达方式组织句子。
4. 每章的 12 段式结构（本章目标/一句话理解/为什么需要它/核心概念/图解/最小示例/代码逐行解释/程序运行过程/常见错误/动手练习/小测验/本章总结）标题本身也要翻译成日文，格式为"中文标题 ／ 日本語タイトル"，例如：
```
## 本章目标 ／ 本章の目標
```

## 输出要求

直接用 Write 工具把翻译结果写入指定路径，不要输出到对话里（避免浪费上下文）。写完后只需简短列出翻译了哪些文件。
