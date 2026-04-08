# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **AI**: coze-coding-dev-sdk (LLM + TTS)

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
├── src/
│   ├── app/                # 页面路由与布局
│   │   ├── api/            # API 路由
│   │   │   ├── auth/       # 认证相关 API
│   │   │   │   ├── login/  # 登录
│   │   │   │   ├── logout/ # 登出
│   │   │   │   ├── me/     # 获取当前用户
│   │   │   │   └── register/ # 注册
│   │   │   ├── game/       # 游戏记录 API
│   │   │   │   ├── save/   # 保存游戏记录
│   │   │   │   └── records/ # 获取游戏记录列表
│   │   │   ├── generate/   # LLM 生成 API
│   │   │   └── tts/        # TTS 语音合成 API
│   │   ├── profile/        # 用户个人页面
│   │   └── page.tsx        # 主页面
│   ├── components/         # 组件
│   │   ├── auth/           # 认证组件
│   │   ├── game/           # 游戏组件
│   │   └── ui/             # Shadcn UI 组件库
│   ├── contexts/           # React Context
│   │   └── AuthContext.tsx # 认证状态管理
│   ├── hooks/              # 自定义 Hooks
│   ├── lib/                # 工具库
│   │   ├── auth.ts         # 认证工具（密码哈希、Session 管理）
│   │   └── utils.ts        # 通用工具函数
│   └── storage/            # 数据存储
│       └── database/       # 数据库相关
│           ├── supabase-client.ts # Supabase 客户端
│           └── shared/     # 共享模型
│               └── schema.ts # 数据库表结构定义
├── next.config.ts          # Next.js 配置
├── package.json            # 项目依赖管理
└── tsconfig.json           # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- **项目理解加速**：初始可以依赖项目下`package.json`文件理解项目类型，如果没有或无法理解退化成阅读其他文件。
- **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。

## 数据库规范

- **表结构定义**：使用 Drizzle ORM 定义表结构，位于 `src/storage/database/shared/schema.ts`
- **数据操作**：使用 Supabase SDK 进行 CRUD 操作
- **字段命名**：统一使用 snake_case（如 `created_at`）
- **RLS 策略**：所有新建表必须配置 RLS 策略

### 数据库表

#### users 表
- `id`: 自增主键
- `username`: 用户名（唯一）
- `password`: 密码（哈希加密）
- `created_at`: 创建时间

#### game_records 表
- `id`: 自增主键
- `user_id`: 用户 ID（外键关联 users.id）
- `scenario`: 场景名称
- `final_score`: 最终好感度得分
- `result`: 游戏结果（success/failed）
- `played_at`: 游戏时间

## 认证系统

- **密码加密**：使用 Node.js crypto 模块的 scrypt 算法进行密码哈希
- **Session 管理**：使用 HTTP-only Cookie 存储用户 ID
- **API 接口**：
  - POST /api/auth/register - 注册用户
  - POST /api/auth/login - 用户登录
  - POST /api/auth/logout - 用户登出
  - GET /api/auth/me - 获取当前登录用户

## 游戏记录系统

- **自动保存**：登录用户完成游戏后自动保存记录
- **记录提示**：
  - 已登录：显示"您的游戏记录已保存"
  - 未登录：显示"登录后可保存您的游戏记录"
- **API 接口**：
  - POST /api/game/save - 保存游戏记录
  - GET /api/game/records - 获取游戏记录列表
- **个人页面**：/profile 页面展示用户历史游戏记录和统计数据

## 排行榜系统

- **排行榜页面**：/leaderboard 展示前20名最高分
- **排名规则**：按好感度分数降序排列，分数相同时按达成时间排序
- **高亮显示**：当前登录用户在榜上时会高亮显示
- **API 接口**：
  - GET /api/leaderboard - 获取排行榜数据

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**
