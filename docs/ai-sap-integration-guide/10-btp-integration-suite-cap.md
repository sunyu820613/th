# Part 10：SAP BTP 全景 + Integration Suite + CAP 教程

## 10.1 SAP BTP 基础概念

## 10.1 SAP BTP の基礎概念

| 概念<br>概念 | 说明<br>説明 |
|---|---|
| SAP BTP (Business Technology Platform) | SAP 的统一云平台，承载集成、扩展、数据分析、AI 等能力，是"AI+SAP"项目里除 S/4HANA 本身之外最重要的技术底座<br>SAP の統合クラウドプラットフォームであり、統合・拡張・データ分析・AI などの機能を担う。「AI+SAP」プロジェクトにおいて S/4HANA 自体を除けば最も重要な技術基盤である |
| Global Account | BTP 租户的最顶层账户，对应企业与 SAP 的商务合同关系<br>BTP テナントの最上位アカウントであり、企業と SAP の商契約関係に対応する |
| Subaccount | Global Account 下的子账户，通常按环境（开发/测试/生产）或业务单元划分，实际的服务实例、应用部署都在 Subaccount 层级<br>Global Account 配下のサブアカウントであり、通常は環境（開発／テスト／本番）または業務単位で分割される。実際のサービスインスタンスやアプリのデプロイはすべて Subaccount レベルで行われる |
| Space（Cloud Foundry） | Cloud Foundry 环境下 Subaccount 内的进一步隔离单元，应用和服务实例部署在 Space 里<br>Cloud Foundry 環境における Subaccount 内のさらなる分離単位であり、アプリとサービスインスタンスは Space の中にデプロイされる |
| Cloud Foundry | BTP 上的一种运行时环境（PaaS），支持多语言（Node.js/Java/Python等）应用部署<br>BTP 上のランタイム環境の一つ（PaaS）であり、多言語（Node.js／Java／Python など）のアプリデプロイをサポートする |
| Kyma | BTP 上基于 Kubernetes 的运行时环境，适合容器化、微服务架构、需要更细粒度基础设施控制的场景<br>BTP 上の Kubernetes ベースのランタイム環境であり、コンテナ化、マイクロサービスアーキテクチャ、よりきめ細かいインフラ制御が必要なシナリオに適している |

## 10.2 与本项目相关的 BTP 服务/产品，各自负责哪一层

## 10.2 本プロジェクトに関連する BTP サービス／製品、それぞれが担う層

| 服务/产品<br>サービス／製品 | 一句话<br>一言で | 在本项目里可能负责哪一层<br>本プロジェクトでどの層を担当しうるか |
|---|---|---|
| Destination Service | 统一管理目标系统的连接信息（URL/认证方式），见 Part 5.7<br>接続先システムの接続情報（URL／認証方式）を一元管理する。Part 5.7 参照 | SAP Integration Layer：解耦连接配置<br>SAP Integration Layer：接続設定の分離 |
| Connectivity Service | 提供到 On-Premise 系统的安全连接通道（配合 Cloud Connector），支持 Principal Propagation<br>On-Premise システムへの安全な接続チャネルを提供する（Cloud Connector と連携）。Principal Propagation をサポートする | SAP Integration Layer：网络与身份透传<br>SAP Integration Layer：ネットワークとアイデンティティの透過伝播 |
| SAP Integration Suite | 一站式集成平台，包含 Cloud Integration (CPI)、API Management、Integration Advisor 等能力<br>ワンストップの統合プラットフォームであり、Cloud Integration (CPI)、API Management、Integration Advisor などの機能を含む | SAP Integration Layer：协议转换、路由、编排、监控<br>SAP Integration Layer：プロトコル変換、ルーティング、オーケストレーション、監視 |
| Cloud Integration (CPI) | Integration Suite 里的集成流程引擎，用可视化 iFlow 编排消息路由/转换/协议适配<br>Integration Suite 内の統合フローエンジンであり、ビジュアルな iFlow でメッセージのルーティング／変換／プロトコル適合をオーケストレーションする | 具体承担"AI Backend 输出 JSON → SAP 所需结构"的转换与编排<br>具体的には「AI Backend が出力する JSON → SAP が必要とする構造」の変換とオーケストレーションを担う |
| SAP API Management | API 网关能力，负责限流、鉴权代理、API 生命周期管理、开发者门户<br>API ゲートウェイ機能であり、レート制限、認可プロキシ、API ライフサイクル管理、開発者ポータルを担う | Tool Layer 与 SAP 之间的网关/限流/鉴权代理，也可作为对外暴露 API 的门面<br>Tool Layer と SAP の間のゲートウェイ／レート制限／認可プロキシ。対外的に API を公開するファサードとしても機能しうる |
| SAP Build Process Automation | 低代码的流程自动化和审批工作流工具<br>ローコードのプロセス自動化・承認ワークフローツール | Approval / Confirmation 层：实现审批流程编排<br>Approval／Confirmation 層：承認フローのオーケストレーションを実装する |
| SAP AI Core | 托管 AI/ML 模型训练与推理的基础设施服务<br>AI／ML モデルの訓練と推論をホストするインフラストラクチャサービス | 如果企业需要自己训练/托管专用模型（而非直接调用第三方 LLM API），归属这一层；对多数"调用现成 LLM API 做 Tool Calling"的项目不是必需<br>企業が独自にモデルを訓練・ホストする必要がある場合（サードパーティの LLM API を直接呼び出すのではなく）、この層に属する。既存の LLM API を呼び出して Tool Calling を行う多くのプロジェクトでは必須ではない |
| Generative AI Hub（AI Core 的一部分能力）<br>Generative AI Hub（AI Core の一部の機能） | 提供统一接口调用多种大模型（含第三方模型），并附带企业级治理（审计、内容过滤等）能力<br>複数の大規模モデル（サードパーティモデルを含む）を統一インターフェースで呼び出せるようにし、エンタープライズ級のガバナンス（監査、コンテンツフィルタリングなど）機能を備える | 可以作为 LLM 调用的统一入口/网关层，尤其当企业要求所有 LLM 调用经过统一治理时<br>LLM 呼び出しの統一エントリーポイント／ゲートウェイ層として使用できる。特に企業がすべての LLM 呼び出しを統一ガバナンスの下に置くことを求める場合に有効 |
| Joule | SAP 官方的生成式 AI 助手产品，内嵌在 SAP 应用（如 S/4HANA、SuccessFactors）中提供对话式体验<br>SAP 公式の生成 AI アシスタント製品であり、SAP アプリ（S/4HANA、SuccessFactors など）に組み込まれて対話型体験を提供する | ⚠️ 如果企业已采购并启用 Joule，本项目描述的"自建 Chat+Agent"能力，部分可能与 Joule 的能力重叠或可以通过 Joule 的扩展机制实现，需要在项目立项时明确"自建 Agent" vs "基于 Joule 扩展"的选型<br>⚠️ 企業がすでに Joule を購入・有効化している場合、本プロジェクトで説明する「自前で構築する Chat＋Agent」機能の一部は Joule の機能と重複するか、Joule の拡張メカニズムで実現できる可能性がある。プロジェクト立ち上げ時に「自前 Agent の構築」か「Joule 拡張ベース」かの選定を明確にする必要がある |
| Joule Studio | ⚠️ SAP 用于配置/扩展 Joule 能力（如自定义 Skill）的工具（具体功能边界和产品成熟度需按当前版本核实）<br>⚠️ SAP が Joule の機能（カスタム Skill など）を設定・拡張するために用意しているツール（具体的な機能範囲と製品の成熟度は現行バージョンで確認する必要がある） | 如果选择"基于 Joule 扩展"路线，Tool/Skill 的定义和编排可能在这里完成，而不是自建 Agent Backend<br>「Joule 拡張ベース」の路線を選択した場合、Tool／Skill の定義とオーケストレーションはここで完結する可能性があり、自前で Agent Backend を構築する必要がなくなる |
| CAP (Cloud Application Programming Model) | SAP 官方推荐的应用开发框架（Node.js/Java），内置对 OData、SAP 系统集成、鉴权的最佳实践支持<br>SAP 公式が推奨するアプリ開発フレームワーク（Node.js／Java）であり、OData、SAP システム連携、認可のベストプラクティスが組み込まれている | Business Service 层：用来实现 Tool 背后真正的业务逻辑代码<br>Business Service 層：Tool の背後にある実際の業務ロジックコードを実装するために使用する |
| SAP Build Code | ⚠️ SAP 面向 CAP/Fiori 开发的云端 IDE 和 AI 辅助编码工具（具体能力边界需按当前版本核实）<br>⚠️ SAP が CAP／Fiori 開発向けに提供するクラウド IDE と AI 支援コーディングツール（具体的な機能範囲は現行バージョンで確認する必要がある） | 开发工具层，不直接参与运行时架构<br>開発ツール層であり、ランタイムアーキテクチャには直接関与しない |

**重要提醒**：Joule、Joule Studio、Generative AI Hub、AI Core 这几项是 SAP 生成式 AI 产品线里变化最快的部分（2024-2026 期间持续快速迭代），本节只给出"架构定位"层面的认知（"它大概负责哪一层"），具体的功能边界、是否需要额外许可证、当前 UI 操作方式，**必须在项目启动时查阅 SAP 官方最新文档核实**，不要以本教程的描述作为实施依据。

**重要な注意**：Joule、Joule Studio、Generative AI Hub、AI Core は SAP の生成 AI 製品ラインの中で最も変化が速い部分です（2024〜2026年の間、継続的に急速なイテレーションが行われています）。本節では「アーキテクチャ上の位置づけ」レベルの理解（「おおよそどの層を担当するか」）のみを示しています。具体的な機能範囲、追加ライセンスの要否、現行の UI 操作方法については、**プロジェクト開始時に SAP の最新公式ドキュメントを参照して確認する必要があります**。本チュートリアルの記述を実装の根拠としないでください。

## 10.3 Integration Suite / CPI 详解

## 10.3 Integration Suite / CPI 詳解

### 10.3.1 能力清单

### 10.3.1 機能一覧

| 能力<br>機能 | 说明<br>説明 |
|---|---|
| Routing | 根据消息内容/头信息，把请求路由到不同的目标系统或不同的处理分支<br>メッセージの内容／ヘッダー情報に基づき、リクエストを異なる接続先システムや異なる処理分岐にルーティングする |
| Mapping | 字段级映射（如把 `customer` 映射到 SAP 的 `SoldToParty`）<br>フィールドレベルのマッピング（`customer` を SAP の `SoldToParty` にマッピングするなど） |
| Transformation | 更复杂的数据结构转换（如把扁平 JSON 转成 OData Deep Insert 需要的嵌套结构）<br>より複雑なデータ構造の変換（フラットな JSON を OData Deep Insert が必要とするネスト構造に変換するなど） |
| Authentication | 集中管理到目标系统的认证方式（可配合 BTP Destination/Credential Store）<br>接続先システムへの認証方式を一元管理する（BTP Destination／Credential Store と連携可能） |
| Error Handling | 定义异常分支（比如目标系统返回 4xx/5xx 时的处理逻辑：重试、告警、写入死信队列）<br>例外分岐を定義する（接続先システムが 4xx／5xx を返した場合の処理ロジック：リトライ、アラート、デッドレターキューへの書き込みなど） |
| Retry | 对瞬时性故障（网络抖动、目标系统短暂不可用）做自动重试，需配合幂等设计<br>一時的な障害（ネットワークの揺らぎ、接続先システムの一時的な利用不可）に対して自動リトライを行う。冪等設計との組み合わせが必要 |
| Monitoring | 提供消息处理的可视化监控、消息追踪、告警<br>メッセージ処理のビジュアルな監視、メッセージトレース、アラートを提供する |
| API Integration | 把内部流程封装成标准 REST/OData 接口对外暴露，供 AI Backend 调用<br>内部フローを標準の REST／OData インターフェースとしてカプセル化し、AI Backend が呼び出せるように対外公開する |

### 10.3.2 一个具体例子

### 10.3.2 具体例

AI Backend 输入（业务语义层）：

AI Backend の入力（業務セマンティクス層）：

```json
{
  "customer": "ABC",
  "customerId": "0010001234",
  "material": "M100",
  "qty": 100,
  "unit": "EA",
  "deliveryDate": "2026-09-11"
}
```

在 Integration Suite 的 iFlow 中做映射转换后，变成 SAP OData 所需的结构（示意，⚠️字段名需以实际 metadata 为准）：

Integration Suite の iFlow でマッピング変換を行うと、SAP OData が必要とする構造になります（イメージ。⚠️フィールド名は実際の metadata に従ってください）。

```json
{
  "SalesOrderType": "OR",
  "SalesOrganization": "1000",
  "DistributionChannel": "10",
  "OrganizationDivision": "00",
  "SoldToParty": "0010001234",
  "RequestedDeliveryDate": "/Date(1789084800000)/",
  "to_Item": [
    { "Material": "M100", "RequestedQuantity": "100", "RequestedQuantityUnit": "EA" }
  ]
}
```

iFlow 在这个过程里做的事：字段名映射（`customerId`→`SoldToParty`）、日期格式转换（ISO 字符串→OData `/Date()/`）、补充固定/推导值（`SalesOrderType`/`SalesOrganization` 这些如果是租户级固定配置，也可以在这一层通过查表补充）、加上认证头、发送请求、处理响应/错误并回传。

iFlow がこの過程で行うこと：フィールド名のマッピング（`customerId`→`SoldToParty`）、日付形式の変換（ISO 文字列→OData の `/Date()/`）、固定値／導出値の補完（`SalesOrderType`／`SalesOrganization` がテナントレベルの固定設定であれば、この層でルックアップにより補完することも可能）、認証ヘッダーの付与、リクエストの送信、レスポンス／エラーの処理と返却。

### 10.3.3 Mapping 应该放在哪一层：Integration Suite？Backend？SAP？

### 10.3.3 Mapping をどの層に置くべきか：Integration Suite？ Backend？ SAP？

| Mapping 类型<br>Mapping のタイプ | 建议归属<br>推奨される所属先 | 原因<br>理由 |
|---|---|---|
| 业务语义解析（"ABC"→客户编号，"下周五"→日期）<br>業務セマンティクスの解析（「ABC」→顧客番号、「来週金曜日」→日付） | **Backend / LLM 协作层**<br>**Backend／LLM 協調層** | 需要模糊匹配、对话交互、追问逻辑，Integration Suite 不擅长这类"智能"处理<br>あいまい一致、対話的なやり取り、聞き返しロジックが必要であり、Integration Suite はこの種の「知的」処理を得意としない |
| 业务规则前置校验（数量合法性、日期合法性）<br>業務ルールの事前検証（数量の妥当性、日付の妥当性） | **Backend** | 属于应用逻辑，且往往需要结合多个数据源做判断，放在应用代码里更灵活、更易测试<br>アプリケーションロジックに属し、しばしば複数のデータソースを組み合わせて判断する必要がある。アプリケーションコードに置く方が柔軟でテストしやすい |
| 协议级字段映射与格式转换（日期格式、Deep Insert 结构拼装）<br>プロトコルレベルのフィールドマッピングと形式変換（日付形式、Deep Insert 構造の組み立て） | **Integration Suite（如果架构中有这一层）**<br>**Integration Suite（アーキテクチャにこの層がある場合）** | 这是 CPI 的核心能力，用可视化 iFlow 维护，非开发人员（集成顾问）也能调整，且天然带监控/重试/错误处理<br>これは CPI のコア機能であり、ビジュアルな iFlow で保守でき、非開発者（インテグレーションコンサルタント）でも調整可能で、監視／リトライ／エラー処理が本来的に備わっている |
| Sales Area 组合校验、Credit Check、ATP、Pricing<br>Sales Area の組み合わせ検証、Credit Check、ATP、Pricing | **SAP 自身**<br>**SAP 自身** | 权威业务规则，任何中间层都不应重新实现<br>権威的な業務ルールであり、いかなる中間層も再実装すべきではない |

**架构选择提示**：不是所有项目都需要引入 Integration Suite/CPI 这一层——如果集成场景简单（点对点、单一 SAP 系统、无需复杂路由/多系统编排），Backend 直接通过 Destination Service 调用 SAP OData 也是完全合理的选择，能省掉一层运维和学习成本。**Integration Suite 更适合"多系统集成、需要专职集成团队维护、需要非开发人员可配置"的场景**。

**アーキテクチャ選定のヒント**：すべてのプロジェクトが Integration Suite/CPI の層を導入する必要があるわけではありません――統合シナリオがシンプル（ポイントツーポイント、単一 SAP システム、複雑なルーティング／複数システムのオーケストレーションが不要）であれば、Backend が Destination Service を介して直接 SAP OData を呼び出すのも完全に合理的な選択であり、運用と学習のコストを1層分省くことができます。**Integration Suite は「複数システム統合、専任の統合チームによる保守が必要、非開発者による設定が必要」なシナリオにより適しています**。

## 10.4 CAP (Cloud Application Programming Model) 教程

## 10.4 CAP (Cloud Application Programming Model) チュートリアル

### 10.4.1 CAP 是什么

### 10.4.1 CAP とは何か

CAP 是 SAP 官方推荐的应用开发框架，核心思想是"领域驱动 + 声明式"：你用 CDS（Core Data Services）语言定义数据模型和服务，框架自动生成 OData/REST 端点、处理 SAP 系统集成的样板代码（认证、Destination 解析、协议转换），你只需要写业务逻辑（Handler）。支持 Node.js 和 Java 两种运行时，本教程用 Node.js。

CAP は SAP 公式が推奨するアプリ開発フレームワークであり、そのコアとなる考え方は「ドメイン駆動＋宣言的」です。CDS（Core Data Services）言語でデータモデルとサービスを定義すると、フレームワークが OData／REST エンドポイントを自動生成し、SAP システム連携のボイラープレートコード（認証、Destination の解決、プロトコル変換）を処理してくれるため、あなたは業務ロジック（Handler）を書くだけで済みます。Node.js と Java の2つのランタイムをサポートしており、本チュートリアルでは Node.js を使用します。

### 10.4.2 核心概念

### 10.4.2 コア概念

| 概念<br>概念 | 说明<br>説明 |
|---|---|
| `cds` | CAP 的核心工具/运行时命令（CDS = Core Data Services），`cds watch` 本地起服务、`cds deploy` 部署等<br>CAP のコアツール／ランタイムコマンド（CDS = Core Data Services）。`cds watch` でローカルにサービスを起動、`cds deploy` でデプロイなど |
| service | 用 CDS 语言定义的一组对外暴露的操作（Entity 的 CRUD + 自定义 Action/Function）<br>CDS 言語で定義された、対外公開される一連の操作（Entity の CRUD + カスタム Action／Function） |
| entity | 数据模型定义，类似数据库表结构，也可以是"虚拟实体"（不落库，仅作为 API 契约）<br>データモデルの定義であり、データベースのテーブル構造に似ている。「仮想エンティティ」（DB に永続化されず、API 契約としてのみ存在する）である場合もある |
| action | 自定义的、有副作用的操作（对应我们的 `createSalesOrder`）<br>カスタムの、副作用を伴う操作（本書の `createSalesOrder` に対応する） |
| handler | 用 JS/TS 写的实际业务逻辑，绑定到某个 entity 的 CRUD 事件或某个 action 上<br>JS／TS で書かれた実際の業務ロジックであり、ある entity の CRUD イベントやある action に紐づけられる |
| destination | CAP 通过 `cds.connect.to()` 结合 `cds.requires` 配置，自动读取 BTP Destination 完成到远程系统（SAP）的连接<br>CAP は `cds.connect.to()` と `cds.requires` の設定を組み合わせ、BTP Destination を自動的に読み取ってリモートシステム（SAP）への接続を完了する |
| remote service | CAP 对"外部系统的 OData 服务"的抽象，可以直接把 SAP 的 OData 服务导入为 CAP 里的一个 remote service，像调用本地服务一样调用远程 SAP<br>CAP における「外部システムの OData サービス」の抽象化であり、SAP の OData サービスを CAP 内の remote service としてそのままインポートし、ローカルサービスを呼び出すのと同じように遠隔の SAP を呼び出せる |
| credentials | 敏感连接信息，本地开发用 `.env`/`default-env.json`（不进版本库），云端部署用 BTP Destination + Credential Store，不应硬编码<br>機密性の高い接続情報。ローカル開発では `.env`／`default-env.json`（バージョン管理には含めない）を使用し、クラウドデプロイでは BTP Destination + Credential Store を使用する。ハードコーディングすべきではない |
| deployment | 通常打包为 MTA (Multi-Target Application)，部署到 Cloud Foundry 或 Kyma<br>通常 MTA (Multi-Target Application) としてパッケージ化され、Cloud Foundry または Kyma にデプロイされる |

### 10.4.3 简化项目目录结构

### 10.4.3 簡略化したプロジェクトディレクトリ構造

```
ai-sap-sales-order-srv/
├── app/                      # 前端/Fiori UI（本项目可选，Chat UI 通常独立部署）
├── srv/                      # 服务层：CDS 服务定义 + Handler 实现
│   ├── sales-order-service.cds
│   ├── sales-order-service.js
│   └── external/
│       └── API_SALES_ORDER_SRV.edmx   # 从 SAP 导入的远程服务定义
├── db/                       # 数据模型（本项目主要是"透传型"服务，db 可能很薄，甚至只放本地缓存/日志表）
│   └── schema.cds
├── package.json
├── .cdsrc.json / cds.requires 配置（也可能写在 package.json 的 cds 字段里）
└── mta.yaml                  # 部署描述（可选，视部署方式而定）
```

### 10.4.4 `cds.requires` 配置示例（`package.json` 片段）

### 10.4.4 `cds.requires` の設定例（`package.json` の抜粋）

```json
{
  "cds": {
    "requires": {
      "S4_SALES_ORDER_API": {
        "kind": "odata-v2",
        "model": "srv/external/API_SALES_ORDER_SRV",
        "credentials": {
          "destination": "S4HANA_SALES_ORDER_API"
        }
      }
    }
  }
}
```

这里的 `destination` 名字对应 BTP Destination Service 里配置好的目标（Part 5.7），本地开发时可以用 `default-env.json` 模拟这个 Destination 的连接信息，部署到云端后由平台自动注入真实凭据——**代码本身完全不感知实际的 URL/密码**。

ここでの `destination` の名前は、BTP Destination Service に設定済みの接続先（Part 5.7）に対応します。ローカル開発時には `default-env.json` を使ってこの Destination の接続情報をシミュレートでき、クラウドにデプロイした後はプラットフォームが自動的に実際の資格情報を注入します――**コード自体は実際の URL／パスワードをまったく意識しません**。

### 10.4.5 CDS 服务定义：`sales-order-service.cds`

### 10.4.5 CDS サービス定義：`sales-order-service.cds`

```cds
using { API_SALES_ORDER_SRV as external } from './external/API_SALES_ORDER_SRV';

service SalesOrderService {

  // 只读：给 AI Tool 层调用的查询接口
  entity Customers as projection on external.A_BusinessPartner {
    key BusinessPartner as id,
    BusinessPartnerFullName as name
  };

  // 自定义 action：对应 create_sales_order 这个 Tool
  action createSalesOrder(
    customerId          : String,
    materialId           : String,
    quantity              : Decimal,
    unit                  : String,
    requestedDeliveryDate : Date,
    idempotencyKey         : String
  ) returns {
    success        : Boolean;
    salesOrder     : String;
    errorCode      : String;
    errorMessage   : String;
  };
}
```

### 10.4.6 Handler 实现：`sales-order-service.js`

### 10.4.6 Handler の実装：`sales-order-service.js`

```javascript
const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
  const { createSalesOrder } = this.actions;

  // 简化的幂等存储，生产环境应使用持久化存储（如 Redis/数据库表）
  const idempotencyStore = new Map();

  this.on(createSalesOrder, async (req) => {
    const { customerId, materialId, quantity, unit, requestedDeliveryDate, idempotencyKey } = req.data;

    // 1. 幂等检查：同一 key 的重复调用直接返回上次结果，不重复创建
    if (idempotencyStore.has(idempotencyKey)) {
      return idempotencyStore.get(idempotencyKey);
    }

    // 2. 前置业务校验（示例，实际项目应更完善）
    if (!(quantity > 0)) {
      return req.error(400, 'QUANTITY_INVALID', 'quantity 必须大于 0');
    }
    if (new Date(requestedDeliveryDate) < new Date()) {
      return req.error(400, 'DELIVERY_DATE_IN_PAST', '交货日期不能是过去时间');
    }

    // 3. 连接远程 S/4HANA Sales Order 服务（凭据由 destination 自动解析，代码不感知）
    const s4 = await cds.connect.to('S4_SALES_ORDER_API');

    try {
      const result = await s4.send({
        method: 'POST',
        path: '/A_SalesOrder',
        data: {
          SalesOrderType: 'OR',
          SalesOrganization: '1000',      // ⚠️ 真实项目中应从客户主数据/租户配置推导，而非写死
          DistributionChannel: '10',
          OrganizationDivision: '00',
          SoldToParty: customerId,
          RequestedDeliveryDate: requestedDeliveryDate,
          to_Item: [
            {
              Material: materialId,
              RequestedQuantity: String(quantity),
              RequestedQuantityUnit: unit || 'EA',
            },
          ],
        },
      });

      const response = {
        success: true,
        salesOrder: result.SalesOrder,
        errorCode: null,
        errorMessage: null,
      };
      idempotencyStore.set(idempotencyKey, response);
      return response;

    } catch (err) {
      // 区分业务错误 vs 系统错误，供上层决定是否可重试、如何转述给用户
      const response = {
        success: false,
        salesOrder: null,
        errorCode: err.code || 'SAP_UNKNOWN_ERROR',
        errorMessage: err.message,
      };
      // 注意：系统性错误（超时/5xx）不应写入幂等缓存为"最终失败"，
      // 应该走单独的"状态不确定，需要核实"分支（见 Part 13 幂等性设计）
      if (!isTransientError(err)) {
        idempotencyStore.set(idempotencyKey, response);
      }
      return response;
    }
  });
});

function isTransientError(err) {
  return err.code === 'ETIMEDOUT' || (err.status && err.status >= 500);
}
```

### 10.4.7 要点说明

### 10.4.7 要点の説明

- CAP 的 `cds.connect.to('S4_SALES_ORDER_API')` 会自动：读取 `cds.requires` 配置 → 解析对应的 BTP Destination → 处理认证（Basic/OAuth2/Principal Propagation，取决于 Destination 配置）→ 返回一个可直接调用的 remote service 客户端。这就是 CAP 相比"自己手写 HTTP Client + Token 管理"的最大价值：**大量样板代码被框架吸收，业务代码只关注业务逻辑**。

- CAP の `cds.connect.to('S4_SALES_ORDER_API')` は自動的に、`cds.requires` の設定を読み取り → 対応する BTP Destination を解決し → 認証を処理し（Basic／OAuth2／Principal Propagation。Destination の設定による）→ 直接呼び出せる remote service クライアントを返します。これこそが、CAP が「自分で HTTP Client + トークン管理を書く」ことに比べて持つ最大の価値です。**大量のボイラープレートコードがフレームワークに吸収され、業務コードは業務ロジックだけに集中できます**。

- 上面的代码是"接近真实项目结构"的教学示例，生产代码还需要补充：完整的输入 Schema 校验（用 CDS 的 `@assert` 注解或独立校验库）、结构化日志、RBAC 检查（CAP 有内置的 `@requires`/`@restrict` 注解机制做授权）、更完善的幂等存储（用持久化存储而非内存 Map）。

- 上記のコードは「実際のプロジェクト構造に近い」教育用サンプルであり、本番コードにはさらに以下を補う必要があります。完全な入力 Schema 検証（CDS の `@assert` アノテーションまたは独立した検証ライブラリを使用）、構造化ログ、RBAC チェック（CAP には認可を行う組み込みの `@requires`／`@restrict` アノテーションメカニズムがあります）、より完備した冪等性ストア（インメモリ Map ではなく永続化ストレージを使用）。

## 10.5 项目中你需要记住什么

## 10.5 プロジェクトで覚えておくべきこと

- BTP 是一个"能力集合"，不是单一产品；本项目最常用到的是 Destination/Connectivity（连接层）、Integration Suite/CPI（如果需要复杂集成编排）、CAP（写 Business Service 层代码）。

- BTP は「機能の集合体」であり、単一の製品ではありません。本プロジェクトで最もよく使うのは Destination／Connectivity（接続層）、Integration Suite／CPI（複雑な統合オーケストレーションが必要な場合）、CAP（Business Service 層のコードを書く）です。

- Joule/AI Core/Generative AI Hub 这类生成式 AI 产品线变化快，只建立架构定位认知，具体细节按需在项目启动时核实最新文档。

- Joule／AI Core／Generative AI Hub といった生成 AI 製品ラインは変化が速いため、アーキテクチャ上の位置づけのみを把握しておき、具体的な詳細は必要に応じてプロジェクト開始時に最新のドキュメントで確認してください。

- Integration Suite 不是必需品，简单集成场景 Backend 直接连 SAP OData 也完全合理，团队规模和集成复杂度决定是否引入。

- Integration Suite は必須ではありません。シンプルな統合シナリオでは Backend が直接 SAP OData に接続するのも完全に合理的であり、チーム規模と統合の複雑さが導入の是非を決めます。

- CAP 的核心价值是把"连接 SAP、认证、协议细节"的样板代码框架化，让你专注业务逻辑；`cds.requires` + Destination 的组合，是"不硬编码连接信息"这条原则在 CAP 里的具体落地方式。

- CAP のコアとなる価値は、「SAP への接続、認証、プロトコルの詳細」というボイラープレートコードをフレームワーク化し、業務ロジックに集中できるようにすることです。`cds.requires` + Destination の組み合わせは、「接続情報をハードコーディングしない」という原則を CAP の中で具体的に実装したものです。
