# 个人主页 — GitHub Pages 纯静态版

## 📁 文件结构

```
Sere1n/
├── index.html    ← 主页（访客看到的部分）
├── admin.html    ← 管理后台（你改内容的地方）
├── data.json     ← 数据文件（主页从这里读数据）
└── README.md     ← 本文件
```

## 🚀 部署步骤

### 1. 把文件放到 GitHub 仓库

将 `index.html`、`admin.html`、`data.json` 三个文件放在仓库根目录。

### 2. 开启 GitHub Pages

Settings → Pages → Source 选 `main` 分支 → Save

等待约 1 分钟，访问 `https://你的用户名.github.io/仓库名/`

### 3. 修改 `index.html` 中的 basePath

打开 `index.html`，找到第 270 行附近：

```javascript
const SITE = {
  basePath: '/Sere1n',  // ← 改成你的仓库名
  dataFile: 'data.json',
};
```

如果仓库名是 `Sere1n`，就不用改。如果是其他名字，改成对应的。

### 4. 访问管理后台

打开 `https://你的用户名.github.io/仓库名/admin.html`

## 🔑 管理后台使用说明

### 首次登录

1. 在 GitHub 创建一个 Personal Access Token：
   - 路径：Settings → Developer settings → Personal access tokens → Tokens (classic)
   - 勾选 `repo` 权限（读写仓库）
   - 生成后**复制保存**（只显示一次）

2. 打开 admin.html 登录页：
   - 用户名：你的 GitHub 用户名
   - Token：刚才复制的那串
   - 仓库名：`你的用户名/仓库名`（如 `aldrchen/Sere1n`）

3. 点击登录 → 进入管理界面

### 日常使用

- 改完内容 → 点对应区域的「保存」按钮
- 数据会**直接写入仓库的 `data.json`**
- 主页**约 30 秒内自动更新**（GitHub Pages CDN 缓存）
- 刷新主页即可看到效果

## 🎨 自定义指南

| 想改什么 | 怎么改 |
|---|---|
| 姓名/方向/城市/职业 | 管理后台 → 个人资料 |
| 头像 | 上传图片到仓库，填图片 URL（如 `avatar.png`） |
| 技能圆环 | 管理后台 → 技能管理 |
| 项目卡片 | 管理后台 → 项目管理 |
| 生活碎片 | 管理后台 → 生活碎片 |
| 社交链接 | 管理后台 → 社交链接 |
| 主题色 | 管理后台 → 主题色 或 主页左下角抽屉 |
| 样式/动画 | 直接编辑 `index.html` 中的 CSS |

## ⚠️ 注意事项

- GitHub Pages **不支持 Node.js / PHP / 任何服务端代码**，所以不需要 `npm install`
- 所有数据存在 `data.json` 这个文件里
- 管理后台通过 GitHub API 直接修改这个文件
- Token 存在浏览器 localStorage，不会上传到任何地方
- 如果改坏了，可以手动编辑 `data.json` 恢复
- 免费版 GitHub 有 API 调用限制（5000次/小时），正常使用不会超

## 🆓 费用

全程免费：
- GitHub Pages：免费
- GitHub API：免费（5000次/小时）
- 无服务器、无数据库、无域名费用（可用 GitHub 自带域名）
