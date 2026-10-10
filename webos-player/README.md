# LAN Player — LG webOS TV 局域网视频 / 直播播放器

面向 LG webOS 电视的网页应用(HTML/JS,无框架),用来播放**内网视频**,也能像 Allok Player 那样导入 **M3U 直播列表**看直播。

## 功能

| 类别 | 支持 |
|---|---|
| 内网来源 | HTTP 目录(nginx/Apache autoindex、nginx JSON 索引)、WebDAV、DLNA/UPnP MediaServer |
| 直播 | M3U/M3U8 频道列表(分组、`名称,地址` 文本格式)、HLS(.m3u8)、HTTP-FLV、MPEG-TS |
| 播放 | 自动选解码引擎(系统原生 / hls.js / mpegts.js)并在失败时自动回退;断点续播;自动连播 |
| 字幕 | 同目录同名 `.srt/.ass/.ssa/.vtt` 自动加载(UTF-8 / UTF-16 / GBK 自动识别);内嵌字幕轨 |
| 其他 | 音轨切换、倍速、画面比例、直播换台(上下键/频道列表)、列表筛选、继续观看 |

## 遥控器按键

| 按键 | 首页 / 列表 | 播放中 |
|---|---|---|
| 方向键 / OK | 移动 / 打开 | 左右 快退快进(连按加速);上下 呼出控制栏(直播:换台);OK 暂停(直播:频道列表) |
| 返回 | 上一级 / 退出 | 关控制栏 → 退出播放 |
| 红 | 添加来源 / 刷新列表 | 字幕 |
| 绿 | — | 音轨 |
| 黄 | 编辑/删除来源 | 倍速 |
| 蓝 | 筛选(列表里,频道多时很好用) | 画面比例 |
| ▶ ⏸ ⏹ ⏪ ⏩ / CH± | — | 播放 / 暂停 / 停止 / 快退 / 快进 / 上下一个 |

桌面浏览器调试:方向键、Enter、Esc(返回)、`R/G/Y/B`(红绿黄蓝)。

## 运行

```bash
# 桌面浏览器试用(Chrome)
node tools/serve.js            # http://localhost:8080

# 单元测试(M3U / 字幕转换 / 工具函数)
npm test
```

### 安装到电视

1. 电视上安装 **Developer Mode** 应用并开启(LG Developer 官网有说明),记下电视 IP 和 passphrase。
2. 电脑安装 CLI:`npm i -g @webos-tools/cli`
3. 添加设备并打包安装:
   ```bash
   ares-setup-device --add tv -i "host=<电视IP>" -i "port=9922" -i "username=prisoner"
   ares-novacom --device tv --getkey        # 输入 passphrase
   npm run package                          # → dist/com.sunyu.lanplayer_0.1.0_all.ipk
   npm run install-tv
   npm run launch
   ```

兼容目标:webOS 4.0(2018 款,Chromium 53)及以上。代码刻意避开 `async/await`、`padStart` 等新语法。

## 添加来源

在首页选「添加来源」,按类型填写:

| 类型 | 地址示例 | 说明 |
|---|---|---|
| HTTP 目录 | `http://192.168.1.10:8080/movies/` | 解析目录索引页里的链接;直链 mp4/mkv 也行 |
| WebDAV | `http://192.168.1.10:5244/dav/` | 用 PROPFIND 列目录 |
| DLNA / UPnP | `http://192.168.1.2:8200/rootDesc.xml` | 填设备描述 xml,或直接填 ContentDirectory 的 control URL |
| 直播列表 | `http://192.168.1.10/iptv.m3u` | 有多个 `group-title` 时按分组显示,另有「全部频道」 |

「快速播放地址」可直接粘贴一个 `.m3u8` / `.flv` / `.ts` / `.mp4` 地址播放。

### SMB / NFS 怎么办?

网页应用不能直接访问 SMB。在 NAS 或电脑上用下面任一方式转成 **WebDAV** 再添加即可:

```bash
rclone serve webdav //nas/share --addr :8080 --read-only   # 把 SMB/本地目录等暴露成 WebDAV
# 或使用 Alist、nginx(dav 模块)等
```

### DLNA 说明

网页没有 UDP 组播能力,**不能自动发现** DLNA 设备,需要手动填地址。MiniDLNA 的描述地址通常是 `http://<IP>:8200/rootDesc.xml`。

### 遇到 CORS(列表加载失败 / HLS、FLV 无法播放)

应用读取目录、播放列表,以及 hls.js / mpegts.js 拉流都走 XHR,服务器要允许跨域。MiniDLNA、简单的 nginx autoindex 通常没开。解决:在内网任一台机器上跑自带网关,再到「设置 → CORS 网关地址」填 `http://<那台机器IP>:8787`:

```bash
node tools/gateway.js 8787
```

网关把 `http://host:port/path` 映射为 `<网关>/http/host:port/path`(目标写在路径里,所以 HLS 清单里的相对地址依然有效),并补上 CORS 头、转发 Range / PROPFIND。**只在可信内网运行**:它会代理任何被请求的 http(s) 地址。

## 已知限制

- **能不能播取决于电视的硬解码**:H.264/AAC 基本都行;HEVC、AV1、MKV 里的 DTS/TrueHD/部分 PGS 字幕,看机型。
- **不支持 RTMP / RTSP / UDP 组播**(浏览器内核不支持);需要的话用 ffmpeg 或 nginx-rtmp 转成 HLS / HTTP-FLV。
- **带账号密码的来源**:目录请求用 Basic Auth 没问题,但视频地址只能把账号密码内嵌进 URL(`http://user:pass@host/…`),部分 Chromium 版本会拦截。更稳的做法是给播放用的服务做 IP 白名单/免密只读。
- 内嵌的图形字幕(PGS/VobSub)无法显示;`.ass` 会被转成纯文本字幕,特效样式会丢失。
- DLNA 只做 ContentDirectory 浏览,不做 DLMS 推送(电视当 DMR 被投屏)。

## 测试情况

- `npm test`:M3U 解析、SRT/ASS→VTT、编码识别等 8 项单元测试。
- 在桌面 Chromium 里做过端到端冒烟测试(HTTP 目录 → 播放 → 字幕 → 跳转 → 续播 → WebDAV → M3U 分组 → hls.js 播放 → 直播换台 → 频道抽屉 → 表单),全部通过且无控制台错误。
- **尚未在真实电视上验证**:硬件解码、遥控器真实键码(代码已覆盖 LG 标准键码 461/415/19/413/417/412/403–406)、老机型的性能,需要你装机后确认。

## 目录结构

```
app/                 # 打包进 ipk 的内容
  appinfo.json
  index.html
  css/app.css
  js/
    util.js m3u.js subtitle.js   # 纯逻辑,可在 node 下测试
    storage.js net.js            # 本地存储、XHR/网关
    sources/                     # http / webdav / dlna / playlist(m3u)
    nav.js ui.js                 # 遥控器焦点导航、弹窗
    player.js app.js             # 播放器、界面与按键路由
  lib/                           # hls.js 1.5.17、mpegts.js 1.7.3(各自许可证见 lib/LICENSE.*)
tools/gateway.js     # 可选 CORS 网关
tools/serve.js       # 桌面调试用静态服务器
test/                # 单元测试
```
