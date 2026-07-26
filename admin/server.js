// ============================================================
//   🖥️ 服务端入口（Express）
//   ------------------------------------------------------------
//   功能：
//   1. 静态托管管理页前端 (admin/index.html)
//   2. 提供 RESTful API 给前端调用
//   3. JWT 鉴权中间件保护写操作
//   4. JSON 文件持久化（data.json）
//   ------------------------------------------------------------
//   启动方式：
//   $ npm install
//   $ npm start
//   → 访问 http://localhost:3000/admin
//   ============================================================

/* 兼容全局/本地模块安装 */
try { require.resolve('express'); } catch(e) { require('module').globalPaths.push('/usr/local/lib/node_modules'); }
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');  // 文件上传中间件

// ---- 上传配置 ----
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = 'avatar-' + Date.now() + ext;
    cb(null, name);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },  // 5MB
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    cb(ok ? null : new Error('仅支持 JPG/PNG/WebP/GIF'), ok);
  },
});

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ---- 中间件 ----
app.use(cors());
app.use(bodyParser.json({ limit: '5mb' }));  // 支持 base64 图片

// ---- 数据文件路径 ----
const DATA_FILE = path.join(__dirname, 'data.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// ============================================================
//   📦 数据读写工具
// ============================================================

/* 读取数据（带默认值初始化） */
function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    // 首次运行：写入默认数据
    const defaults = {
      profile: {
        name: '你的名字',
        title: '// 你的方向',
        bio: '简单介绍自己\n生活化的描述',
        avatarText: 'YN',
        city: '厦门',
        job: '设计师',
        hobby: '摄影 · 旅行',
        heroGreeting: '— 你好，欢迎 —',
        heroName: '你的名字',
        heroDesc: '写一段关于自己的话，不需要太正式，就像和朋友聊天一样。',
      },
      skills: [
        { name: 'Photoshop', pct: 88 },
        { name: 'Figma', pct: 85 },
        { name: '摄影', pct: 80 },
        { name: '视频剪辑', pct: 70 },
      ],
      projects: [
        { id: 1, title: '项目一', desc: '简单描述这个项目做了什么，一两句话就够了。', tag: '标签' },
        { id: 2, title: '项目二', desc: '简单描述这个项目做了什么，一两句话就够了。', tag: '标签' },
      ],
      life: [
        { name: '摄影', icon: 'camera' },
        { name: '音乐', icon: 'music' },
        { name: '阅读', icon: 'book' },
        { name: '冥想', icon: 'lotus' },
      ],
      social: {
        github:    { url: '#', icon: 'github' },
        email:     { url: '#', icon: 'mail' },
        wechat:    { url: '#', icon: 'wechat' },
        instagram: { url: '#', icon: 'instagram' },
        xiaohongshu: { url: '#', icon: 'book' },
      },
      theme: 'neon',
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

/* 保存数据 */
function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

/* 读取用户（首次自动创建管理员） */
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    const defaultUser = {
      username: 'admin',
      // 默认密码: admin123 （bcrypt 哈希）
      passwordHash: bcrypt.hashSync('admin123', 10),
    };
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultUser], null, 2));
    return [defaultUser];
  }
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// ============================================================
//   🔐 JWT 鉴权中间件
//   ------------------------------------------------------------
//   前端登录后拿到 token，后续请求放在 Header:
//   Authorization: Bearer <token>
// ============================================================
function authMiddleware(req, res, next) {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ code: 401, msg: '未登录' });
  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(401).json({ code: 401, msg: 'Token 无效或已过期' });
  }
}

// ============================================================
//   🚪 认证路由
// ============================================================

/* POST /api/auth/login → 登录 */
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.json({ code: 403, msg: '用户名或密码错误' });
  }
  // 签发 token（有效期 24 小时）
  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ code: 200, msg: '登录成功', data: { token, username: user.username } });
});

/* POST /api/auth/change-password → 修改密码 */
app.post('/api/auth/change-password', authMiddleware, (req, res) => {
  const { oldPwd, newPwd } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === req.user.username);
  if (!bcrypt.compareSync(oldPwd, user.passwordHash)) {
    return res.json({ code: 403, msg: '原密码错误' });
  }
  user.passwordHash = bcrypt.hashSync(newPwd, 10);
  saveUsers(users);
  res.json({ code: 200, msg: '密码修改成功' });
});

// ============================================================
//   📡 数据 API（读操作公开，写操作需鉴权）
// ============================================================

/* GET /api/profile → 获取个人资料 */
app.get('/api/profile', (req, res) => {
  const data = loadData();
  res.json({ code: 200, msg: 'ok', data: data.profile });
});

/* PUT /api/profile → 更新个人资料 */
app.put('/api/profile', authMiddleware, (req, res) => {
  const data = loadData();
  data.profile = { ...data.profile, ...req.body };
  saveData(data);
  res.json({ code: 200, msg: '资料已更新' });
});

/* GET /api/skills → 获取技能 */
app.get('/api/skills', (req, res) => {
  const data = loadData();
  res.json({ code: 200, msg: 'ok', data: data.skills });
});

/* PUT /api/skills → 更新技能 */
app.put('/api/skills', authMiddleware, (req, res) => {
  const data = loadData();
  data.skills = req.body;
  saveData(data);
  res.json({ code: 200, msg: '技能已更新' });
});

/* GET /api/projects → 获取项目 */
app.get('/api/projects', (req, res) => {
  const data = loadData();
  res.json({ code: 200, msg: 'ok', data: data.projects });
});

/* POST /api/projects → 新增项目 */
app.post('/api/projects', authMiddleware, (req, res) => {
  const data = loadData();
  const newProject = { id: Date.now(), ...req.body };
  data.projects.push(newProject);
  saveData(data);
  res.json({ code: 200, msg: '项目已添加', data: newProject });
});

/* PUT /api/projects/:id → 更新项目 */
app.put('/api/projects/:id', authMiddleware, (req, res) => {
  const data = loadData();
  const idx = data.projects.findIndex(p => p.id == req.params.id);
  if (idx === -1) return res.json({ code: 404, msg: '项目不存在' });
  data.projects[idx] = { ...data.projects[idx], ...req.body };
  saveData(data);
  res.json({ code: 200, msg: '项目已更新' });
});

/* DELETE /api/projects/:id → 删除项目 */
app.delete('/api/projects/:id', authMiddleware, (req, res) => {
  const data = loadData();
  data.projects = data.projects.filter(p => p.id != req.params.id);
  saveData(data);
  res.json({ code: 200, msg: '项目已删除' });
});

/* GET /api/life → 获取生活碎片 */
app.get('/api/life', (req, res) => {
  const data = loadData();
  res.json({ code: 200, msg: 'ok', data: data.life });
});

/* PUT /api/life → 更新生活碎片 */
app.put('/api/life', authMiddleware, (req, res) => {
  const data = loadData();
  data.life = req.body;
  saveData(data);
  res.json({ code: 200, msg: '生活碎片已更新' });
});

/* GET /api/social → 获取社交链接 */
app.get('/api/social', (req, res) => {
  const data = loadData();
  res.json({ code: 200, msg: 'ok', data: data.social });
});

/* PUT /api/social → 更新社交链接 */
app.put('/api/social', authMiddleware, (req, res) => {
  const data = loadData();
  data.social = { ...data.social, ...req.body };
  saveData(data);
  res.json({ code: 200, msg: '社交链接已更新' });
});

/* GET /api/theme → 获取主题 */
app.get('/api/theme', (req, res) => {
  const data = loadData();
  res.json({ code: 200, msg: 'ok', data: data.theme });
});

/* PUT /api/theme → 设置主题 */
app.put('/api/theme', authMiddleware, (req, res) => {
  const data = loadData();
  data.theme = req.body.key;
  saveData(data);
  res.json({ code: 200, msg: '主题已更新' });
});

/* GET /api/all → 一次性获取所有数据（主页初始化用） */
app.get('/api/all', (req, res) => {
  const data = loadData();
  res.json({ code: 200, msg: 'ok', data });
});

/* POST /api/export → 导出数据 */
app.get('/api/export', authMiddleware, (req, res) => {
  const data = loadData();
  res.setHeader('Content-Disposition', 'attachment; filename=profile-backup.json');
  res.json(data);
});

/* POST /api/import → 导入数据 */
app.post('/api/import', authMiddleware, (req, res) => {
  saveData(req.body);
  res.json({ code: 200, msg: '数据已导入' });
});

/* POST /api/upload/avatar → 上传头像文件 */
app.post('/api/upload/avatar', authMiddleware, upload.single('avatar'), (req, res) => {
  if (!req.file) return res.json({ code: 400, msg: '未选择文件' });
  const url = '/uploads/' + req.file.filename;
  // 自动写入 profile.avatarUrl
  const data = loadData();
  data.profile.avatarUrl = url;
  saveData(data);
  res.json({ code: 200, msg: '头像已上传', data: { url } });
});

// ---- 托管上传目录 ----
app.use('/uploads', express.static(UPLOAD_DIR));

// ============================================================
//   📁 静态托管
// ============================================================

/* 管理页前端 */
app.use('/admin', express.static(path.join(__dirname, 'public')));

/* 主页也一起托管（同一个 server 可同时服务主页+管理端） */
app.use('/', express.static(path.join(__dirname, '..')));  // 上层目录的主页

/* API 文档首页 */
app.get('/api', (req, res) => {
  res.json({
    name: 'Personal Admin API',
    version: '1.0.0',
    endpoints: {
      'POST /api/auth/login': '登录',
      'POST /api/auth/change-password': '修改密码 (需登录)',
      'GET  /api/profile': '获取个人资料',
      'PUT  /api/profile': '更新个人资料 (需登录)',
      'GET  /api/skills': '获取技能',
      'PUT  /api/skills': '更新技能 (需登录)',
      'GET  /api/projects': '获取项目',
      'POST /api/projects': '新增项目 (需登录)',
      'PUT  /api/projects/:id': '更新项目 (需登录)',
      'DELETE /api/projects/:id': '删除项目 (需登录)',
      'GET  /api/life': '获取生活碎片',
      'PUT  /api/life': '更新生活碎片 (需登录)',
      'GET  /api/social': '获取社交链接',
      'PUT  /api/social': '更新社交链接 (需登录)',
      'GET  /api/theme': '获取主题',
      'PUT  /api/theme': '设置主题 (需登录)',
      'GET  /api/all': '获取全部数据',
      'GET  /api/export': '导出数据 (需登录)',
      'POST /api/import': '导入数据 (需登录)',
      'POST /api/upload/avatar': '上传头像 (需登录)',
    }
  });
});

// ---- 启动 ----
app.listen(PORT, () => {
  console.log(`\n🚀 管理端已启动: http://localhost:${PORT}/admin`);
  console.log(`📡 API 文档: http://localhost:${PORT}/api`);
  console.log(`🔑 默认账号: admin / admin123\n`);
});
