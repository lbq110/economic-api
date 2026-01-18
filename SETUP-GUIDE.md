# MacroBet 经济数据 API 配置指南

## 项目信息

| 项目 | 值 |
|-----|-----|
| 项目名称 | macrobet-economic-data |
| 项目 ID | `whsyjoyuzuqzybyttxvm` |
| 区域 | West US (North California) |
| Dashboard | https://supabase.com/dashboard/project/whsyjoyuzuqzybyttxvm |

---

## 1. 设置定时任务 (pg_cron)

定时自动从 FRED API 拉取最新数据。

### 步骤 1.1: 启用 pg_cron 扩展

1. 打开 [Supabase Dashboard](https://supabase.com/dashboard/project/whsyjoyuzuqzybyttxvm)
2. 进入 **Database** → **Extensions**
3. 搜索 `pg_cron`
4. 点击 **Enable** 启用

### 步骤 1.2: 启用 pg_net 扩展 (用于 HTTP 请求)

1. 在同一页面搜索 `pg_net`
2. 点击 **Enable** 启用

### 步骤 1.3: 创建定时任务

进入 **SQL Editor**，运行以下 SQL：

```sql
-- 每小时整点执行数据拉取
SELECT cron.schedule(
  'fetch-fred-data-hourly',  -- 任务名称
  '0 * * * *',               -- Cron 表达式: 每小时的第0分钟
  $$
  SELECT net.http_post(
    url := 'https://whsyjoyuzuqzybyttxvm.supabase.co/functions/v1/fetch-fred-data',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3lqb3l1enVxenlieXR0eHZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMTg1MCwiZXhwIjoyMDg0Mjc3ODUwfQ.5mZ-NBG-vyDj_TV2j78F_-XlAsNNPvH1SLceYoQBM7U'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

### 常用 Cron 表达式

| 表达式 | 说明 |
|-------|------|
| `0 * * * *` | 每小时 |
| `*/30 * * * *` | 每30分钟 |
| `0 */4 * * *` | 每4小时 |
| `0 8 * * *` | 每天早上8点 (UTC) |
| `0 8 * * 1-5` | 工作日早上8点 |

### 管理定时任务

```sql
-- 查看所有定时任务
SELECT * FROM cron.job;

-- 查看任务执行历史
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- 删除定时任务
SELECT cron.unschedule('fetch-fred-data-hourly');

-- 暂停任务 (设置为无效的 cron 表达式)
-- 需要先删除再重新创建
```

---

## 2. 前端集成

### 步骤 2.1: 安装依赖

```bash
npm install @supabase/supabase-js
```

### 步骤 2.2: 配置环境变量

在你的前端项目根目录创建 `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://whsyjoyuzuqzybyttxvm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3lqb3l1enVxenlieXR0eHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDE4NTAsImV4cCI6MjA4NDI3Nzg1MH0.Z3UWIjdd1rga86ty-nqzbm4I-nELqYTrsjvrnHKh8Oc
```

### 步骤 2.3: 复制 Supabase 客户端代码

将以下文件复制到你的前端项目:

```
economic-api/src/
├── lib/
│   └── supabase.ts      → 你的项目/src/lib/supabase.ts
├── hooks/
│   └── useMacroData.ts  → 你的项目/src/hooks/useMacroData.ts
└── index.ts             → 你的项目/src/lib/economic-api.ts (可选)
```

### 步骤 2.4: 使用示例

#### 基础用法 - 获取所有数据

```tsx
import { useMacroData } from '@/hooks/useMacroData';

function Dashboard() {
  const { categories, latestValues, isLoading, error } = useMacroData();

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      <h1>宏观经济数据</h1>

      {/* 显示分类 */}
      <div className="categories">
        {categories.map(cat => (
          <span key={cat.id} style={{ color: cat.color }}>
            {cat.name}
          </span>
        ))}
      </div>

      {/* 显示指标数据 */}
      <table>
        <thead>
          <tr>
            <th>指标</th>
            <th>当前值</th>
            <th>变化</th>
            <th>日期</th>
          </tr>
        </thead>
        <tbody>
          {latestValues.map(item => (
            <tr key={item.indicator_id}>
              <td>{item.name}</td>
              <td>{item.value} {item.unit}</td>
              <td className={item.change_percent > 0 ? 'green' : 'red'}>
                {item.change_percent?.toFixed(2)}%
              </td>
              <td>{item.data_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### 按分类筛选数据

```tsx
import { useMacroData } from '@/hooks/useMacroData';

function TreasurySection() {
  // 只获取美债市场数据
  const { latestValues, isLoading } = useMacroData({
    categoryId: 'treasury'
  });

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      <h2>美债市场</h2>
      {latestValues.map(item => (
        <div key={item.indicator_id}>
          <span>{item.name}: </span>
          <strong>{item.value}%</strong>
        </div>
      ))}
    </div>
  );
}
```

#### 获取历史数据 (用于图表)

```tsx
import { useIndicatorHistory } from '@/hooks/useMacroData';

function TreasuryChart() {
  // 获取10年期美债最近30天数据
  const { history, isLoading } = useIndicatorHistory('treasury_10y', 30);

  if (isLoading) return <div>加载中...</div>;

  // 用于图表库 (如 recharts, chart.js)
  const chartData = history.map(item => ({
    date: item.data_date,
    value: item.value
  })).reverse(); // 按时间正序

  return (
    <div>
      {/* 使用你喜欢的图表库渲染 */}
    </div>
  );
}
```

#### 启用实时更新

```tsx
import { useMacroData } from '@/hooks/useMacroData';

function RealtimeDashboard() {
  // 启用实时订阅，数据变化时自动更新
  const { latestValues } = useMacroData({
    enableRealtime: true
  });

  return (
    <div>
      {latestValues.map(item => (
        <div key={item.indicator_id}>
          {item.name}: {item.value}
        </div>
      ))}
    </div>
  );
}
```

#### 手动刷新数据

```tsx
import { useRefreshFredData, useMacroData } from '@/hooks/useMacroData';

function AdminPanel() {
  const { refresh, isRefreshing, error } = useRefreshFredData();
  const { refetch } = useMacroData();

  const handleRefresh = async () => {
    try {
      // 调用 Edge Function 从 FRED 获取最新数据
      const result = await refresh();
      console.log('更新结果:', result);

      // 刷新本地数据
      await refetch();
    } catch (err) {
      console.error('刷新失败:', err);
    }
  };

  return (
    <button onClick={handleRefresh} disabled={isRefreshing}>
      {isRefreshing ? '刷新中...' : '刷新数据'}
    </button>
  );
}
```

#### 直接使用 API (不用 React Hooks)

```ts
import {
  getCategories,
  getLatestValues,
  getIndicatorHistory,
  getCategoriesWithIndicators
} from '@/lib/supabase';

// 获取所有分类
const categories = await getCategories();

// 获取所有最新值
const latestValues = await getLatestValues();

// 获取特定分类的最新值
const treasuryData = await getLatestValuesByCategory('treasury');

// 获取指标历史数据
const history = await getIndicatorHistory('treasury_10y', 30);

// 获取完整的分类+指标+最新值 (一次请求)
const data = await getCategoriesWithIndicators();
```

---

## 3. 更新前端项目 .env

### Next.js 项目

在项目根目录的 `.env.local` 文件中添加:

```env
# Supabase 经济数据 API
NEXT_PUBLIC_SUPABASE_URL=https://whsyjoyuzuqzybyttxvm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3lqb3l1enVxenlieXR0eHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDE4NTAsImV4cCI6MjA4NDI3Nzg1MH0.Z3UWIjdd1rga86ty-nqzbm4I-nELqYTrsjvrnHKh8Oc
```

### Vite 项目

```env
# Supabase 经济数据 API
VITE_SUPABASE_URL=https://whsyjoyuzuqzybyttxvm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3lqb3l1enVxenlieXR0eHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDE4NTAsImV4cCI6MjA4NDI3Nzg1MH0.Z3UWIjdd1rga86ty-nqzbm4I-nELqYTrsjvrnHKh8Oc
```

然后修改 `supabase.ts` 中的环境变量读取:

```ts
// Vite
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### Create React App

```env
# Supabase 经济数据 API
REACT_APP_SUPABASE_URL=https://whsyjoyuzuqzybyttxvm.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3lqb3l1enVxenlieXR0eHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MDE4NTAsImV4cCI6MjA4NDI3Nzg1MH0.Z3UWIjdd1rga86ty-nqzbm4I-nELqYTrsjvrnHKh8Oc
```

---

## 可用的分类 ID

| 分类 ID | 名称 | 指标数 |
|--------|------|-------|
| `us_economy` | 美国经济晴雨表 | 19 |
| `liquidity` | 美元流动性 | 3 |
| `treasury` | 美债市场 | 5 |
| `rates` | 利率市场 | 5 |
| `sentiment` | 预期与情绪 | 2 |
| `forex` | 外汇市场 | 6 |
| `market` | 市场指数 | 2 |
| `commodities` | 大宗商品 | 1 |

---

## API 端点参考

### REST API

| 端点 | 说明 |
|-----|------|
| `GET /rest/v1/macro_categories` | 获取所有分类 |
| `GET /rest/v1/macro_indicators` | 获取所有指标配置 |
| `GET /rest/v1/indicator_values` | 获取所有指标值 |
| `GET /rest/v1/latest_indicator_values` | 获取最新指标值 (视图) |

### Edge Functions

| 端点 | 说明 |
|-----|------|
| `POST /functions/v1/fetch-fred-data` | 从 FRED 拉取数据 |

### 查询参数示例

```bash
# 按分类筛选
?category_id=eq.treasury

# 按指标ID筛选
?indicator_id=eq.treasury_10y

# 排序
?order=data_date.desc

# 限制数量
?limit=10

# 选择字段
?select=name,value,data_date
```

---

## 故障排除

### 1. CORS 错误

确保请求头中包含 `apikey`:

```js
fetch(url, {
  headers: {
    'apikey': 'your-anon-key',
    'Authorization': 'Bearer your-anon-key' // 可选
  }
})
```

### 2. 数据未更新

手动触发刷新:

```bash
curl -X POST "https://whsyjoyuzuqzybyttxvm.supabase.co/functions/v1/fetch-fred-data" \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 3. 定时任务未执行

检查任务状态:

```sql
SELECT * FROM cron.job_run_details
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'fetch-fred-data-hourly')
ORDER BY start_time DESC
LIMIT 5;
```

---

## 相关链接

- [Supabase Dashboard](https://supabase.com/dashboard/project/whsyjoyuzuqzybyttxvm)
- [FRED API 文档](https://fred.stlouisfed.org/docs/api/fred/)
- [Supabase JS 文档](https://supabase.com/docs/reference/javascript)
- [数据映射文档](./FRED-API-Mapping.md)

---

## 4. BEA API 集成

BEA (Bureau of Economic Analysis) 提供 FRED 没有的详细 GDP 组成数据。

### 已配置的 BEA 数据

| 表 ID | 描述 | 系列数 |
|-------|------|--------|
| `gdp_nominal` | GDP (名义值) | 6 |
| `gdp_real` | Real GDP (实际值) | 1 |
| `gdp_percent_change` | GDP 增长率 | 1 |
| `personal_income` | 个人收入 | 3 |
| `pce` | 个人消费支出 | 3 |
| `pce_price` | PCE 价格指数 | 3 |
| `saving` | 个人储蓄 | 2 |
| `corporate_profits` | 企业利润 | 1 |

### BEA API 端点

```bash
# 获取所有 BEA 数据
curl -X POST "https://whsyjoyuzuqzybyttxvm.supabase.co/functions/v1/fetch-bea-data" \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# 获取特定表的数据
curl -X POST "https://whsyjoyuzuqzybyttxvm.supabase.co/functions/v1/fetch-bea-data" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"table_ids": ["gdp_nominal", "gdp_percent_change"]}'
```

### REST API 查询 BEA 数据

```bash
# 获取最新 BEA 数据
curl "https://whsyjoyuzuqzybyttxvm.supabase.co/rest/v1/latest_bea_values" \
  -H "apikey: YOUR_ANON_KEY"

# 获取 BEA 表配置
curl "https://whsyjoyuzuqzybyttxvm.supabase.co/rest/v1/bea_tables" \
  -H "apikey: YOUR_ANON_KEY"

# 获取特定系列的历史数据
curl "https://whsyjoyuzuqzybyttxvm.supabase.co/rest/v1/bea_values?series_id=eq.gdp_total&order=period_date.desc" \
  -H "apikey: YOUR_ANON_KEY"
```

### 前端使用 BEA 数据

```tsx
import { supabase } from '@/lib/supabase';

// 获取最新 BEA 数据
async function getLatestBeaData() {
  const { data, error } = await supabase
    .from('latest_bea_values')
    .select('*');
  return data;
}

// 获取 GDP 数据
async function getGdpData() {
  const { data, error } = await supabase
    .from('latest_bea_values')
    .select('*')
    .eq('category', 'GDP');
  return data;
}

// 获取 GDP 增长率历史
async function getGdpGrowthHistory(limit = 20) {
  const { data, error } = await supabase
    .from('bea_values')
    .select('value, time_period, period_date')
    .eq('series_id', 'gdp_growth')
    .order('period_date', { ascending: false })
    .limit(limit);
  return data;
}
```

### 定时刷新 BEA 数据

在 SQL Editor 中添加：

```sql
-- 每天 UTC 14:00 (美东 9:00) 刷新 BEA 数据
SELECT cron.schedule(
  'fetch-bea-data-daily',
  '0 14 * * *',
  $$
  SELECT net.http_post(
    url := 'https://whsyjoyuzuqzybyttxvm.supabase.co/functions/v1/fetch-bea-data',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3lqb3l1enVxenlieXR0eHZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODcwMTg1MCwiZXhwIjoyMDg0Mjc3ODUwfQ.5mZ-NBG-vyDj_TV2j78F_-XlAsNNPvH1SLceYoQBM7U'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## 数据源对比

| 数据 | FRED | BEA |
|-----|------|-----|
| GDP 总量 | ✅ | ✅ (更详细) |
| GDP 组成 (消费/投资/政府/净出口) | ❌ | ✅ |
| GDP 增长率 | ❌ | ✅ |
| 个人收入明细 | ❌ | ✅ |
| PCE 详细分类 | ❌ | ✅ |
| 储蓄率 | ❌ | ✅ |
| 企业利润 | ❌ | ✅ |
| 利率/收益率 | ✅ | ❌ |
| 就业数据 | ✅ | ❌ |
| CPI/PPI | ✅ | ❌ |
| 汇率 | ✅ | ❌ |
| 股指 | ✅ | ❌ |

**建议：** 同时使用 FRED 和 BEA，互补数据。

---

*最后更新: 2026-01-18*
