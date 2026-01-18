# MacroBet Economic API

基于 Supabase 的宏观经济数据 API，从 FRED 和 BEA 获取美国经济数据，供 [MacroBet](https://macro-bet.vercel.app/) 前端使用。

## 架构

```
FRED API ─┐
          ├─→ Supabase Edge Functions ─→ PostgreSQL ─→ 前端直连
BEA API  ─┘
```

## 数据覆盖

| 数据源 | 指标数 | 内容 |
|-------|-------|------|
| **FRED** | 43 | 利率、国债收益率、CPI、失业率、汇率、VIX 等 |
| **BEA** | 20 | GDP 详细组成、个人收入、PCE、储蓄率等 |

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/lbq110/economic-api.git
cd economic-api
```

### 2. 获取 API Keys

#### Supabase (数据库托管)

1. 访问 [Supabase](https://supabase.com/) 并注册账号
2. 点击 "New Project" 创建新项目
3. 选择区域（推荐选择离你近的）
4. 等待项目创建完成（约2分钟）
5. 进入 **Settings** → **API**，获取：
   - `Project URL` → 用于 `SUPABASE_URL`
   - `anon public` key → 用于 `SUPABASE_ANON_KEY`
   - `service_role` key → 用于 `SUPABASE_SERVICE_ROLE_KEY`（注意保密）

#### FRED API Key (美联储经济数据)

1. 访问 [FRED API Keys](https://fred.stlouisfed.org/docs/api/api_key.html)
2. 点击 "Request or view your API keys"
3. 使用邮箱注册账号
4. 创建后即可获取 API Key

#### BEA API Key (美国经济分析局)

1. 访问 [BEA API Registration](https://apps.bea.gov/api/signup/)
2. 填写邮箱和姓名
3. API Key 会发送到你的邮箱

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的 API Keys：

```env
FRED_API_KEY=your_fred_api_key_here
BEA_API_KEY=your_bea_api_key_here
```

### 4. 本地开发

需要 Docker 运行 Supabase 本地环境。

```bash
# 下载 Supabase CLI (如果没有)
curl -sL https://github.com/supabase/cli/releases/latest/download/supabase_darwin_arm64.tar.gz | tar -xz
mv supabase supabase-cli

# 启动本地 Supabase
./supabase-cli start

# 初始化数据库
./supabase-cli db reset

# 启动 Edge Functions
./supabase-cli functions serve --no-verify-jwt --env-file .env.local
```

### 5. 测试 API

```bash
# 获取 FRED 数据
curl -X POST "http://127.0.0.1:54321/functions/v1/fetch-fred-data"

# 获取 BEA 数据
curl -X POST "http://127.0.0.1:54321/functions/v1/fetch-bea-data"

# 查询数据
curl "http://127.0.0.1:54321/rest/v1/latest_indicator_values" \
  -H "apikey: YOUR_LOCAL_ANON_KEY"
```

## 项目结构

```
economic-api/
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 001_init_schema.sql      # FRED 数据表
│   │   └── 002_bea_schema.sql       # BEA 数据表
│   ├── functions/
│   │   ├── fetch-fred-data/         # FRED 数据拉取
│   │   └── fetch-bea-data/          # BEA 数据拉取
│   └── seed.sql                     # 种子数据
├── src/
│   ├── lib/supabase.ts              # Supabase 客户端
│   ├── hooks/useMacroData.ts        # React Hooks
│   └── index.ts
├── .env.local.example               # 环境变量模板
├── SETUP-GUIDE.md                   # 详细配置指南
├── FRED-API-Mapping.md              # FRED 数据映射
└── README.md
```

## 数据库表

### FRED 数据

| 表 | 说明 |
|---|------|
| `macro_categories` | 数据分类 (利率、美债、外汇等) |
| `macro_indicators` | 指标配置 (FRED Series ID 映射) |
| `indicator_values` | 指标数值 |
| `latest_indicator_values` | 最新值视图 |

### BEA 数据

| 表 | 说明 |
|---|------|
| `bea_tables` | BEA 表配置 |
| `bea_series` | 数据系列配置 |
| `bea_values` | 数据值 |
| `latest_bea_values` | 最新值视图 |

## API 端点

### Edge Functions

| 端点 | 说明 |
|-----|------|
| `POST /functions/v1/fetch-fred-data` | 从 FRED 拉取数据 |
| `POST /functions/v1/fetch-bea-data` | 从 BEA 拉取数据 |

### REST API

| 端点 | 说明 |
|-----|------|
| `GET /rest/v1/macro_categories` | 获取分类 |
| `GET /rest/v1/macro_indicators` | 获取指标配置 |
| `GET /rest/v1/latest_indicator_values` | 获取 FRED 最新数据 |
| `GET /rest/v1/latest_bea_values` | 获取 BEA 最新数据 |

## 前端集成

```tsx
import { useMacroData } from './src/hooks/useMacroData';

function Dashboard() {
  const { categories, latestValues, isLoading } = useMacroData();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {latestValues.map(item => (
        <div key={item.indicator_id}>
          {item.name}: {item.value} ({item.change_percent?.toFixed(2)}%)
        </div>
      ))}
    </div>
  );
}
```

详细集成指南请参考 [SETUP-GUIDE.md](./SETUP-GUIDE.md)

## 部署

详细部署步骤请参考 [SETUP-GUIDE.md](./SETUP-GUIDE.md)

## 数据源文档

- [FRED API 文档](https://fred.stlouisfed.org/docs/api/fred/)
- [BEA API 文档](https://apps.bea.gov/api/)
- [Supabase 文档](https://supabase.com/docs)

## License

MIT
