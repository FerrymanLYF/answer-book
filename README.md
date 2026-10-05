# Answer Book

> 一本电子版《答案之书》。静心，默念问题，翻开，得到答案。

Answer Book 是一个**零依赖、零构建、可离线**的电子版《答案之书》。它用密码学安全随机数（CSPRNG）保证答案不可预测，用翻页动画和单次不可逆的交互，复刻纸质书的仪式感。

## 特性

- **真随机**：基于 `crypto.getRandomValues`，配合拒绝采样，无模偏差
- **不可预览**：答案在翻页动画结束的最后一刻才生成
- **纸质仪式**：静心 → 翻开 → 答案 → 合上，单次不可逆
- **零依赖**：纯 HTML / CSS / JS，双击即用
- **可离线**：无任何网络请求
- **易部署**：扔到 GitHub Pages 即可上线

## 快速开始

### 本地运行

直接双击 `index.html` 即可。

如果你想用本地服务器：

```bash
python3 -m http.server 8000
# 访问 http://localhost:8000
```

### 部署到 GitHub Pages

```bash
git init
git add index.html style.css script.js README.md LICENSE
git commit -m "init: answer book"
git branch -M main
git remote add origin https://github.com/你的用户名/answer-book.git
git push -u origin main
```

然后进入仓库 **Settings → Pages**，Source 选择 `main` 分支，保存。

等约 1 分钟，访问：

```
https://你的用户名.github.io/answer-book/
```

## 文件结构

```
answer-book/
├── index.html    # 三屏结构：静心 / 翻页 / 答案
├── style.css     # 样式与翻页动画
├── script.js     # 随机引擎、状态机、交互逻辑
├── README.md
└── LICENSE
```

## 核心设计

### 1. 随机引擎

使用 `crypto.getRandomValues` 配合**拒绝采样**，避免模偏差：

```js
function secureRandomInt(n) {
  const buf = new Uint32Array(1);
  const max = 0x100000000;
  const limit = Math.floor(max / n) * n;
  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % n;
}
```

### 2. 不可预览

答案**不在点击时生成**，而是在翻页动画结束的最后一刻才调用 `secureRandomInt`。用户无法通过 DevTools 提前看到答案。

### 3. 状态机

三个屏幕互斥切换：

```
idle（静心）→ flip（翻页）→ answer（答案）→ idle
```

动画过程中禁止重复点击，避免状态错乱。

### 4. 纸质仪式

- 静心页：提示用户默念问题
- 翻页页：1.2 秒 CSS 3D 翻页动画
- 答案页：只显示答案，点击"合上"才回到起点
- 无历史记录，无分享按钮，无重抽

## 技术栈

- 原生 HTML / CSS / JavaScript
- `crypto.getRandomValues`（Web Crypto API）
- CSS 3D Transform

无框架、无构建、无依赖。

## 路线图

- [x] 三屏状态机
- [x] CSPRNG 随机引擎
- [x] 翻页动画
- [ ] 翻页音效
- [ ] 震动反馈
- [ ] PWA 可安装
- [ ] 多语言答案
- [ ] 自定义答案集

## License

MIT
