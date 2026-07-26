# 🖥️ 个人主页管理后台

## 快速启动

```bash
# 1. 安装依赖
cd admin
npm install

# 2. 启动服务
npm start

# 3. 浏览器访问
# 管理后台: http://localhost:3000/admin
# API 文档:  http://localhost:3000/api
# 主页:     http://localhost:3000/index.html
```

## 默认账号

| 用户名 | 密码 |
|--------|------|
| admin  | admin123 |

> ⚠️ 部署到公网前请务必修改默认密码！

## 功能一览

| 模块 | 功能 |
|------|------|
| 🔐 登录 | JWT 鉴权，24h 有效期 |
| 👤 个人资料 | 姓名/方向/城市/职业/爱好/头像/简介 |
| 🎯 技能管理 | 增删改 + 滑块调百分比 |
| 📁 项目管理 | 增删改 + 标签 |
| 🌈 生活碎片 | 增删改 + 图标选择 |
| 🔗 社交链接 | GitHub/邮箱/微信/IG/小红书 |
| 🎨 主题设置 | 6 套配色实时预览 |
| 🔒 安全设置 | 修改密码 |
| 💾 数据管理 | JSON 导入/导出/重置 |

## API 接口

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | ✗ | 登录 |
| POST | `/api/auth/change-password` | ✓ | 改密码 |
| GET  | `/api/profile` | ✗ | 读资料 |
| PUT  | `/api/profile` | ✓ | 写资料 |
| GET  | `/api/skills` | ✗ | 读技能 |
| PUT  | `/api/skills` | ✓ | 写技能 |
| GET  | `/api/projects` | ✗ | 读项目 |
| POST | `/api/projects` | ✓ | 新增项目 |
| PUT  | `/api/projects/:id` | ✓ | 改项目 |
| DELETE | `/api/projects/:id` | ✓ | 删项目 |
| GET  | `/api/life` | ✗ | 读生活碎片 |
| PUT  | `/api/life` | ✓ | 写生活碎片 |
| GET  | `/api/social` | ✗ | 读社交链接 |
| PUT  | `/api/social` | ✓ | 写社交链接 |
| GET  | `/api/theme` | ✗ | 读主题 |
| PUT  | `/api/theme` | ✓ | 写主题 |
| GET  | `/api/all` | ✗ | 读全部 |
| GET  | `/api/export` | ✓ | 导出 |
| POST | `/api/import` | ✓ | 导入 |

## 部署到服务器

```bash
# 1. 上传 admin 文件夹到服务器
# 2. 安装依赖
npm install --production

# 3. 设置环境变量（生产环境必须改 JWT_SECRET）
export JWT_SECRET=你的超长随机密钥

# 4. 用 pm2 守护进程
npm install -g pm2
pm2 start server.js --name "personal-admin"

# 5. Nginx 反向代理（可选）
# 把域名指向 localhost:3000
```

## 目录结构

```
admin/
├── server.js          # 服务端入口（331行）
├── package.json       # 依赖声明
├── data.json          # 数据文件（自动生成）
├── users.json         # 用户文件（自动生成）
├── README.md          # 本文件
└── public/
    └── index.html     # 管理页前端（1095行）
```

## 安全建议

1. **改默认密码**：登录后立即修改
2. **改 JWT_SECRET**：用环境变量设置强密钥
3. **HTTPS**：生产环境必须配 SSL
4. **限制端口**：3000 端口不要直接暴露公网，用 Nginx 反代
5. **定期备份**：导出 data.json 存到安全位置
