# LAN Player 设计文档

状态:v0.1 已实现(桌面 Chromium 验证,未上真机)。本文说明"为什么这样做",与代码保持对应。

## 1. 目标与非目标

**目标**
- 在 LG webOS 电视上播放内网视频(HTTP / WebDAV / DLNA),以及 Allok Player 式的直播(M3U 频道列表、HLS、HTTP-FLV、MPEG-TS)。
- 只靠遥控器完成全部操作;断点续播、外挂字幕、音轨切换、直播换台。
- 零构建:源码即发布物,可直接用桌面浏览器调试。

**非目标**
- 不做 SMB/NFS 直连(网页沙箱做不到,用 WebDAV 网关)。
- 不做 DLNA 自动发现(没有 UDP 组播)、不做 DMR 被投屏。
- 不支持 RTMP / RTSP / UDP 组播(浏览器内核不支持,需服务端转封装)。
- 不自带转码。能不能播由电视硬解码决定。

## 2. 平台约束(决定了设计)

| 约束 | 影响 |
|---|---|
| webOS 4.0 内核是 Chromium 53 | 不用 async/await、padStart、AbortController、fetch 之外的新 API;网络用 XHR |
| 应用只是网页,无原生代码 | 解码全靠 `<video>` 的硬件解码器;软解(WASM)在电视 CPU 上不可行 |
| 无 UDP / 无 socket | DLNA 只能手填地址;SMB 需网关 |
| 跨域限制 | 读目录/播放列表、hls.js、mpegts.js 都走 XHR,需服务器允许 CORS,否则走自带网关 |
| 只有遥控器 | 自写空间焦点导航;所有交互必须可用方向键 + OK + 返回 + 彩键完成 |
| 1920×1080 画布 | UI 固定按 1080p 设计(`appinfo.resolution`),视频层不受此限制,见 §7 |

## 3. 总体架构

```
                    ┌──────────────────────── app.js ────────────────────────┐
 遥控器键码 ──────► │ 键映射 → 路由(弹窗层 > 播放器 > 浏览页 > 首页)         │
                    └───┬───────────────┬───────────────────┬────────────────┘
                        │               │                   │
                   首页/浏览页        ui.js(弹窗)        player.js
                        │            nav.js(焦点)         │
          ┌─────────────┴───────┐                  ┌───────┴────────────────┐
          │ sources/*           │                  │ 引擎: native / hls.js  │
          │  http  webdav       │                  │       / mpegts.js      │
          │  dlna  playlist     │                  │ 字幕 · 音轨 · 续播     │
          └──────┬──────────────┘                  └───────┬────────────────┘
                 │                                         │
              net.js (XHR + 可选网关) ◄────────────────────┘
              storage.js (localStorage: 来源/历史/设置)
              util.js  m3u.js  subtitle.js   ← 纯函数,node 下单测
```

分层原则:**纯逻辑**(util / m3u / subtitle)不碰 DOM,可在 node 测试;**来源适配器**只负责"给我一个位置,返回条目列表";**播放器**只关心"一组可播放项 + 当前下标"。

## 4. 来源适配器

统一接口:`list(source, loc) → Promise<{title, entries[]}>`,`rootLoc(source)` 给出起点。

条目:`{name, isDir, loc|url, kind: dir|video|audio|sub|playlist, size?, live?, subs?}`

| 适配器 | loc 含义 | 实现要点 |
|---|---|---|
| http | 目录 URL | 解析 `<a href>`;过滤 `?` 排序链接、父目录、站外链接;支持 nginx JSON 索引 |
| webdav | 目录 URL | `PROPFIND Depth:1`,按 `*` 命名空间解析;自身条目按路径去重 |
| dlna | ContainerID | 描述 xml → ContentDirectory controlURL → SOAP `Browse`,分页至 5000 条;`res` 优先选 video/audio |
| playlist | `''` / `g:<组>` | M3U 解析并缓存 5 分钟;多分组时按分组做文件夹;扩展名 mp4/mkv 等视为点播,其余视为直播 |

新增来源类型只需实现这两个函数并注册进 `Sources`。

## 5. 播放引擎选择与回退

`engineOrder(item)` 返回按优先级排序的引擎列表,失败(`error` 事件 / hls.js fatal / mpegts ERROR)就换下一个,耗尽后显示错误。

| 输入 | 顺序 | 理由 |
|---|---|---|
| `.m3u8` | webOS: native → hls.js;其他: hls.js → native(设置可改) | LG 原生 HLS 走硬件管线、省内存;hls.js 容错更好 |
| `.flv` | mpegts.js | 浏览器原生不支持 FLV |
| `.ts` 直播 | mpegts.js → native | 低延迟追帧 |
| 未知扩展名的直播 | native → hls.js → mpegts.js | 可能是 HLS 也可能是裸 TS |
| 其他(mp4/mkv/…) | native | 最大化硬解、可 seek |

## 6. 关键流程

**续播**:`loadedmetadata` 时读 `Store.getPosition(url)`;每 5 秒和退出时保存;距结尾不足 `min(20s, 时长×5%)` 视为看完并清零(短视频不会误判)。

**字幕**:浏览页给播放项附上同目录同名字幕 → `Net` 下载 → `Subtitle.decode`(UTF-8 严格解码失败则 GB18030)→ SRT/ASS 转 WebVTT → Blob URL → `<track>`。含 `zh/chs/中/简` 的优先并默认开启。

**直播换台**:上下键(OSD 隐藏时)上一个/下一个;OK 打开频道抽屉;`CH±` 同效果。

**按键路由**(`app.js`):弹窗层优先(返回=取消);其次当前屏幕。输入框内左右/退格交给系统,上下才做焦点移动。

**焦点导航**(`nav.js`):以 `.focusable` 为候选,按方向取"主轴距离 + 3×副轴偏移"最小者;长列表(`data-list`)上下键走相邻节点的快路径,避免上千频道时逐个量尺寸。

## 7. 4K 与高码率

- UI 画布是 1080p,**视频层独立**:`<video>` 由电视硬件解码并输出原生分辨率,与 `appinfo.resolution` 无关。代码没有分辨率上限。
- 是否能播 4K 取决于**机型的硬解码能力**,而不是本应用:4K 机型通常硬解 HEVC 4K60;H.264 常见上限 4K30(或 1080p60);VP9 / AV1 看年份与机型。HDR10 / Dolby Vision 由电视在原生播放时处理。
- **走原生路径最稳**(mp4/mkv 直链、LG 原生 HLS)。走 MSE 的路径(hls.js、mpegts.js)能否喂 4K 取决于机型的 MSE 实现,且 hls.js 缓冲在内存里,高码率(>50 Mbps)下需控制缓冲:当前 `maxBufferLength=30s`,若实机出现内存问题应改用 `maxBufferSize` 限制字节数。
- mpegts.js 对 HEVC 的支持有限(1.7.x 以 H.264 为主),**4K HEVC 的 FLV/裸 TS 直播不保证可播**,建议服务端转成 HLS(fMP4/HEVC)走原生。
- 网络:4K 原盘/高码率 remux 常 50–100+ Mbps,电视需有线或 5GHz 稳定连接;HTTP 服务需支持 Range。
- 本项目**尚未在 4K 电视上验证**,上述结论来自平台能力而非实测。

## 8. 数据与存储

`localStorage`(前缀 `lp.`):`sources`(含明文账号密码)、`history`(按 URL 键,最多 200 条,LRU)、`settings`(hls 引擎偏好、自动字幕、网关地址)。密码明文存于电视本地,属于家庭内网场景的取舍,不要用于公网凭据。

## 9. 网络与 CORS 网关

`Net.request` 基于 XHR,可选经网关改写 URL:`http://h:p/x → <gw>/http/h:p/x`。目标写在**路径**而非查询串,因此 HLS 清单与 WebDAV href 中的相对地址仍能解析到网关。网关转发 Range / PROPFIND / SOAP 头,去掉上游 CORS 头后统一加自己的,并把重定向改写回网关内。原生 `<video src>` 不需要 CORS,直连。

## 10. 测试策略

- **单元**(`npm test`):M3U 多格式、SRT/ASS→VTT、GB18030 解码、工具函数。
- **端到端**:桌面 Chromium + 模拟局域网服务器(autoindex / WebDAV / HLS / 字幕),键盘模拟遥控器,覆盖全部来源与播放器操作。Playwright 自带 Chromium 无 H.264,故用 VP8/VP9 素材。
- **缺口(需真机)**:硬件解码与 4K、LG 实际键码、低端机性能、Developer Mode 安装流程。

## 11. 风险

| 风险 | 缓解 |
|---|---|
| 老机型 Chromium 53 对 hls.js/mpegts.js 兼容性 | 引擎自动回退;设置里可强制原生 |
| 目录页格式千奇百怪 | HTTP 适配器只依赖 `<a href>`;不行就走 WebDAV/Alist |
| 账号密码内嵌 URL 被 Chromium 拦截 | 文档建议只读免密 + IP 白名单;后续可经网关注入 Authorization |
| 大 M3U(数千频道)渲染/导航卡顿 | 列表快路径导航 + 筛选;必要时做虚拟列表 |

## 12. 路线图(未实现)

1. 真机验证 4K / HDR / 各机型引擎偏好,据此调整默认顺序。
2. 经网关注入 Basic Auth,解决带密码视频直链。
3. EPG(XMLTV)与台标;收藏频道。
4. 虚拟列表;搜索支持拼音首字母。
5. 播放失败时显示诊断信息(引擎、HTTP 状态、编码)便于排错。
