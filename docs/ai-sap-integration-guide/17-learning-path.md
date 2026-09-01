# Part 17：学习路线（学習ロードマップ）

## 17.1 三个能力层级（3 つの能力レベル）

### Level 1：项目不懵（进入项目能听懂、能跟上讨论）（Level 1：プロジェクトで迷わない（参加してすぐ話についていける））

必须掌握：

必須の習得項目：

- SAP SD 核心概念（Part 3 全部）：Sales Order/Sales Area/BP 四种角色/Material/Pricing 基础<br>SAP SD の中核概念（Part 3 全体）：Sales Order/Sales Area/BP の 4 つのロール/Material/Pricing の基礎
- VA01/VA02/VA03 的屏幕结构和它们与数据模型的对应关系（Part 4）<br>VA01/VA02/VA03 の画面構造とデータモデルとの対応関係（Part 4）
- OData 基础概念（Entity/Metadata/CRUD/CSRF）（Part 5.3）<br>OData の基礎概念（Entity/Metadata/CRUD/CSRF）（Part 5.3）
- LLM Tool Calling 的基本工作原理（Part 7.1-7.2）<br>LLM Tool Calling の基本的な仕組み（Part 7.1-7.2）
- 整体架构分层（Part 1），能说清楚"LLM 负责什么、SAP 负责什么、中间层负责什么"<br>全体アーキテクチャの階層構造（Part 1）を理解し、「LLM は何を担当するか、SAP は何を担当するか、中間層は何を担当するか」を説明できること

### Level 2：能独立开发（能写 Tool、能接 SAP API、能处理错误）（Level 2：単独で開発できる（Tool を書ける、SAP API に接続できる、エラーを処理できる））

在 Level 1 基础上增加：

Level 1 に加えて：

- OData 写操作完整流程（CSRF Token、Deep Insert、错误响应解析）（Part 5）<br>OData 書き込み操作の完全なフロー（CSRF Token、Deep Insert、エラーレスポンスの解析）（Part 5）
- Destination/Connectivity 的配置和使用（Part 5.7）<br>Destination/Connectivity の設定と利用（Part 5.7）
- CAP 框架实操（能写 service/entity/action/handler）（Part 10.4）<br>CAP フレームワークの実践（service/entity/action/handler を書ける）（Part 10.4）
- Tool Abstraction Layer 设计（Part 7.4、Part 6.5）<br>Tool Abstraction Layer の設計（Part 7.4、Part 6.5）
- 幂等性设计与错误分类处理（Part 13）<br>べき等性設計とエラー分類処理（Part 13）
- 基础的鉴权知识（OAuth2 Client Credentials 至少要会用）（Part 9.4）<br>基本的な認可の知識（少なくとも OAuth2 Client Credentials を使えること）（Part 9.4）
- 能独立完成 Part 11 的 Demo 项目并替换为真实 SAP Sandbox<br>Part 11 の Demo プロジェクトを単独で完成させ、実際の SAP Sandbox に置き換えられること

### Level 3：能设计架构（能做技术选型、能评估安全和合规风险）（Level 3：アーキテクチャを設計できる（技術選定ができ、セキュリティとコンプライアンスのリスクを評価できる））

在 Level 2 基础上增加：

Level 2 に加えて：

- ECC/On-Prem/Private Cloud/Public Cloud 的集成差异及选型判断（Part 6）<br>ECC/On-Prem/Private Cloud/Public Cloud の統合の違いと選定判断（Part 6）
- Principal Propagation 的实现原理和适用场景判断（Part 9.5）<br>Principal Propagation の実装原理と適用シーンの判断（Part 9.5）
- Integration Suite/CPI 的编排能力，判断何时需要引入这一层（Part 10.3）<br>Integration Suite/CPI のオーケストレーション能力、この層をいつ導入すべきかの判断（Part 10.3）
- 安全设计全貌：Prompt Injection 防护、最小权限、密钥管理（Part 14）<br>セキュリティ設計の全体像：Prompt Injection 対策、最小権限、鍵管理（Part 14）
- 生产参考架构与 Trust Boundary 设计（Part 16）<br>本番参照アーキテクチャと Trust Boundary 設計（Part 16）
- 能主导审批流程、审计体系的设计决策（Part 9.3、Part 15）<br>承認フローや監査体系の設計決定を主導できること（Part 9.3、Part 15）

## 17.2 推荐学习顺序（六周计划，可按实际情况调整）（推奨学習順序（6 週間プラン、実情に応じて調整可能））

| 周次<br>週 | 主题<br>テーマ | 对应章节<br>対応章 | 产出<br>成果物 |
|---|---|---|---|
| 第一周<br>第 1 週 | SAP SD 基础 + Order-to-Cash + VA01/02/03<br>SAP SD 基礎 + Order-to-Cash + VA01/02/03 | Part 3、4 | 能用自己的话解释一遍"创建销售订单要填哪些东西、为什么"<br>「販売オーダーを作成する際に何を入力する必要があるか、なぜそうするのか」を自分の言葉で説明できる |
| 第二周<br>第 2 週 | OData 基础 + SAP API Business Accelerator Hub 实操<br>OData 基礎 + SAP API Business Accelerator Hub 実践 | Part 5 | 用 Postman/curl 对着一个 SAP 沙箱（或公开的 SAP Gateway Demo 系统）跑通一次 GET 查询和一次 POST 创建（如果有沙箱访问权限）<br>Postman/curl を使い、SAP サンドボックス（または公開されている SAP Gateway Demo システム）に対して GET クエリと POST 作成を 1 回ずつ実行する（サンドボックスへのアクセス権がある場合） |
| 第三周<br>第 3 週 | SAP BTP 全景 + Destination/Connectivity<br>SAP BTP の全体像 + Destination/Connectivity | Part 5.7、Part 10.1-10.2 | 在 BTP 试用账号里配置一个 Destination（即使指向的是测试端点）<br>BTP のトライアルアカウントで Destination を 1 つ設定する（テスト用エンドポイントを指す場合でも可） |
| 第四周<br>第 4 週 | LLM Tool Calling + Agent 设计原则<br>LLM Tool Calling + Agent 設計原則 | Part 7、8、9 | 设计并写出至少 3 个 Tool 的完整 JSON Schema，包括至少一个 READ 和一个 WRITE<br>少なくとも 3 つの Tool の完全な JSON Schema を設計・作成する（READ と WRITE を最低 1 つずつ含む） |
| 第五周<br>第 5 週 | CAP 实操 + Integration Suite 概念<br>CAP 実践 + Integration Suite の概念 | Part 10.3-10.4 | 用 CAP 写一个简化的 Business Service，能连接到（真实或 Mock 的）SAP OData<br>CAP を使って簡易的な Business Service を作成し、（実際または Mock の）SAP OData に接続できるようにする |
| 第六周<br>第 6 週 | 完整 Demo + 错误处理 + 安全 + 审计<br>完全な Demo + エラー処理 + セキュリティ + 監査 | Part 11-16 | 跑通 Part 11 的完整 Demo，覆盖至少 5 种错误场景的测试用例<br>Part 11 の完全な Demo を通し、少なくとも 5 種類のエラーシナリオのテストケースをカバーする |

## 17.3 学习建议（学習アドバイス）

- **不要跳过 SAP SD 基础直接学 API**：很多开发者急于写代码，跳过业务概念，结果在处理 Sales Area/伙伴角色这类"看起来简单实际有隐藏规则"的字段时反复踩坑。花一周打好业务基础，后面的开发效率会显著提高。

  **SAP SD の基礎を飛ばして API をいきなり学ばない**：多くの開発者はコードを書くことを急ぐあまり業務概念を飛ばしてしまい、その結果 Sales Area／パートナーロールのような「一見シンプルだが実は隠れたルールがある」フィールドで何度もつまずきます。1 週間かけて業務基礎を固めることで、その後の開発効率が大幅に向上します。

- **优先动手，不要只看文档**：SAP API Business Accelerator Hub 的 Try-out 功能、CAP 的 `cds watch` 本地开发体验，都值得亲自跑一遍，比反复读文档更有效。

  **文書を読むだけでなく、まず手を動かす**：SAP API Business Accelerator Hub の Try-out 機能や、CAP の `cds watch` によるローカル開発体験は、実際に自分で試す価値があり、ドキュメントを繰り返し読むより効果的です。

- **和 SAP 顾问建立共同语言**：学会用 VA01 的屏幕结构和 SD 术语跟顾问沟通，能大幅提升协作效率，减少"技术人员觉得顾问啰嗦、顾问觉得技术人员不懂业务"的沟通摩擦。

  **SAP コンサルタントと共通言語を築く**：VA01 の画面構造や SD 用語を使ってコンサルタントとコミュニケーションできるようになると、協業の効率が大幅に上がり、「技術者はコンサルタントを冗長だと感じ、コンサルタントは技術者が業務を理解していないと感じる」という摩擦を減らせます。

## 17.4 项目中你需要记住什么（プロジェクトで覚えておくべきこと）

- 三个 Level 是能力递进关系，不要跳级——尤其 Level 3 的架构决策能力，建立在对 Level 1/2 内容有扎实实操经验的基础上。

  3 つの Level は段階的に積み上がる能力関係であり、飛び級はしないでください——特に Level 3 のアーキテクチャ決定能力は、Level 1/2 の内容についての確かな実践経験の上に成り立っています。

- 六周计划是参考节奏，如果你已经有 SAP 或 LLM 任一方向的基础，可以压缩对应周次，把时间集中在你的知识盲区。

  6 週間プランはあくまで目安のペースです。すでに SAP または LLM のいずれかの分野で基礎がある場合は、該当する週を圧縮し、自分の知識の穴になっている部分に時間を集中させてください。
