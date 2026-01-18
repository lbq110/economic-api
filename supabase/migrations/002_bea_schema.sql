-- BEA (Bureau of Economic Analysis) Data Schema
-- Migration: 002_bea_schema

-- BEA 数据表配置
CREATE TABLE bea_tables (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,           -- BEA 表名 (如 T10105)
  description TEXT NOT NULL,          -- 表描述
  frequency TEXT CHECK (frequency IN ('A', 'Q', 'M')), -- A=Annual, Q=Quarterly, M=Monthly
  category TEXT,                      -- 分类
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- BEA 数据系列配置 (表中的具体指标)
CREATE TABLE bea_series (
  id TEXT PRIMARY KEY,
  table_id TEXT REFERENCES bea_tables(id) ON DELETE CASCADE,
  series_code TEXT NOT NULL,          -- BEA SeriesCode
  line_number INTEGER,                -- 行号
  line_description TEXT NOT NULL,     -- 指标描述
  unit TEXT,                          -- 单位
  unit_mult INTEGER,                  -- 单位乘数 (6 = millions)
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(table_id, series_code)
);

-- BEA 数据值
CREATE TABLE bea_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id TEXT REFERENCES bea_series(id) ON DELETE CASCADE,
  value DECIMAL,
  previous_value DECIMAL,
  change_percent DECIMAL,
  time_period TEXT NOT NULL,          -- 时间周期 (如 2024Q1, 2024)
  period_date DATE,                   -- 转换后的日期
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(series_id, time_period)
);

-- 索引
CREATE INDEX idx_bea_values_series_id ON bea_values(series_id);
CREATE INDEX idx_bea_values_time_period ON bea_values(time_period DESC);
CREATE INDEX idx_bea_values_period_date ON bea_values(period_date DESC);
CREATE INDEX idx_bea_series_table_id ON bea_series(table_id);

-- RLS 策略
ALTER TABLE bea_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bea_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE bea_values ENABLE ROW LEVEL SECURITY;

-- 公开读取
CREATE POLICY "Allow public read on bea_tables" ON bea_tables FOR SELECT USING (true);
CREATE POLICY "Allow public read on bea_series" ON bea_series FOR SELECT USING (true);
CREATE POLICY "Allow public read on bea_values" ON bea_values FOR SELECT USING (true);

-- 服务角色写入
CREATE POLICY "Allow service role insert on bea_tables" ON bea_tables FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service role update on bea_tables" ON bea_tables FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service role insert on bea_series" ON bea_series FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service role update on bea_series" ON bea_series FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service role insert on bea_values" ON bea_values FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "Allow service role update on bea_values" ON bea_values FOR UPDATE TO service_role USING (true);
CREATE POLICY "Allow service role delete on bea_values" ON bea_values FOR DELETE TO service_role USING (true);

-- 最新 BEA 数据视图
CREATE OR REPLACE VIEW latest_bea_values AS
SELECT DISTINCT ON (bs.id)
  bv.id,
  bs.id as series_id,
  bs.series_code,
  bs.line_description as name,
  bs.unit,
  bt.id as table_id,
  bt.description as table_description,
  bt.category,
  bv.value,
  bv.previous_value,
  bv.change_percent,
  bv.time_period,
  bv.period_date,
  bv.fetched_at
FROM bea_values bv
JOIN bea_series bs ON bv.series_id = bs.id
JOIN bea_tables bt ON bs.table_id = bt.id
WHERE bs.is_active = TRUE
ORDER BY bs.id, bv.period_date DESC;

-- 插入 BEA 表配置
INSERT INTO bea_tables (id, table_name, description, frequency, category, sort_order) VALUES
  ('gdp_nominal', 'T10105', 'Gross Domestic Product (Current Dollars)', 'Q', 'GDP', 1),
  ('gdp_real', 'T10106', 'Real GDP (Chained Dollars)', 'Q', 'GDP', 2),
  ('gdp_percent_change', 'T10101', 'Percent Change in Real GDP', 'Q', 'GDP', 3),
  ('gdp_contributions', 'T10102', 'Contributions to Percent Change in Real GDP', 'Q', 'GDP', 4),
  ('personal_income', 'T20100', 'Personal Income and Its Disposition', 'Q', 'Income', 10),
  ('pce', 'T20301', 'Personal Consumption Expenditures', 'Q', 'Consumption', 20),
  ('pce_price', 'T20304', 'Price Indexes for PCE', 'Q', 'Prices', 21),
  ('saving', 'T20600', 'Personal Saving', 'Q', 'Saving', 30),
  ('corporate_profits', 'T60100', 'Corporate Profits', 'Q', 'Corporate', 40),
  ('govt_receipts', 'T30100', 'Government Current Receipts and Expenditures', 'Q', 'Government', 50);

-- 插入核心 BEA 系列配置
INSERT INTO bea_series (id, table_id, series_code, line_number, line_description, unit, unit_mult, sort_order) VALUES
  -- GDP 名义值
  ('gdp_total', 'gdp_nominal', 'A191RC', 1, 'Gross Domestic Product', 'Billions of dollars', 9, 1),
  ('gdp_pce', 'gdp_nominal', 'DPCERC', 2, 'Personal Consumption Expenditures', 'Billions of dollars', 9, 2),
  ('gdp_gpdi', 'gdp_nominal', 'A006RC', 6, 'Gross Private Domestic Investment', 'Billions of dollars', 9, 3),
  ('gdp_exports', 'gdp_nominal', 'A020RC', 14, 'Exports', 'Billions of dollars', 9, 4),
  ('gdp_imports', 'gdp_nominal', 'A021RC', 15, 'Imports', 'Billions of dollars', 9, 5),
  ('gdp_govt', 'gdp_nominal', 'A822RC', 21, 'Government Consumption and Investment', 'Billions of dollars', 9, 6),

  -- Real GDP
  ('gdp_real_total', 'gdp_real', 'A191RX', 1, 'Real Gross Domestic Product', 'Billions of chained dollars', 9, 1),

  -- GDP 增长率
  ('gdp_growth', 'gdp_percent_change', 'A191RL', 1, 'Real GDP Growth Rate', 'Percent', 0, 1),

  -- 个人收入
  ('personal_income_total', 'personal_income', 'A065RC', 1, 'Personal Income', 'Billions of dollars', 9, 1),
  ('wages_salaries', 'personal_income', 'A034RC', 3, 'Wages and Salaries', 'Billions of dollars', 9, 2),
  ('disposable_income', 'personal_income', 'A067RC', 26, 'Disposable Personal Income', 'Billions of dollars', 9, 3),

  -- PCE
  ('pce_total', 'pce', 'DPCERC', 1, 'Personal Consumption Expenditures', 'Billions of dollars', 9, 1),
  ('pce_goods', 'pce', 'DGDSRC', 2, 'Goods', 'Billions of dollars', 9, 2),
  ('pce_services', 'pce', 'DSERRC', 9, 'Services', 'Billions of dollars', 9, 3),

  -- PCE 价格指数
  ('pce_price_index', 'pce_price', 'DPCERD', 1, 'PCE Price Index', 'Index', 0, 1),
  ('pce_price_goods', 'pce_price', 'DGDSRD', 2, 'PCE Price Index: Goods', 'Index', 0, 2),
  ('pce_price_services', 'pce_price', 'DSERRD', 9, 'PCE Price Index: Services', 'Index', 0, 3),

  -- 储蓄
  ('personal_saving', 'saving', 'A071RC', 34, 'Personal Saving', 'Billions of dollars', 9, 1),
  ('saving_rate', 'saving', 'A072RC', 35, 'Personal Saving Rate', 'Percent', 0, 2),

  -- 企业利润
  ('corp_profits_total', 'corporate_profits', 'A055RC', 1, 'Corporate Profits with IVA and CCAdj', 'Billions of dollars', 9, 1);
