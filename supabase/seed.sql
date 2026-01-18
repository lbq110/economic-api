-- MacroBet Seed Data
-- Based on FRED-API-Mapping.md

-- 清空现有数据
TRUNCATE TABLE indicator_values CASCADE;
TRUNCATE TABLE macro_indicators CASCADE;
TRUNCATE TABLE macro_categories CASCADE;

-- ===========================================
-- 插入分类数据
-- ===========================================

INSERT INTO macro_categories (id, name, name_en, icon, color, sort_order) VALUES
  ('us_economy', '美国经济晴雨表', 'US Economic Barometer', 'TrendingUp', '#3B82F6', 1),
  ('liquidity', '美元流动性', 'USD Liquidity', 'Droplets', '#10B981', 2),
  ('treasury', '美债市场', 'Treasury Market', 'Landmark', '#8B5CF6', 3),
  ('rates', '利率市场', 'Interest Rates', 'Percent', '#F59E0B', 4),
  ('sentiment', '预期与情绪', 'Expectations & Sentiment', 'Brain', '#EC4899', 5),
  ('forex', '外汇市场', 'Forex Market', 'ArrowLeftRight', '#06B6D4', 6),
  ('market', '市场指数', 'Market Indices', 'BarChart3', '#EF4444', 7),
  ('commodities', '大宗商品', 'Commodities', 'Boxes', '#84CC16', 8);

-- ===========================================
-- 插入指标数据 - 美国经济晴雨表
-- ===========================================

INSERT INTO macro_indicators (id, category_id, fred_series_id, name, name_en, unit, frequency, sort_order) VALUES
  -- GDP & 产出
  ('gdp', 'us_economy', 'GDP', 'GDP', 'Gross Domestic Product', '十亿美元', 'quarterly', 1),
  ('industrial_production', 'us_economy', 'INDPRO', '工业产出', 'Industrial Production', '指数', 'monthly', 2),
  ('durable_goods', 'us_economy', 'DGORDER', '耐用品订单', 'Durable Goods Orders', '百万美元', 'monthly', 3),

  -- 就业数据
  ('nfp', 'us_economy', 'PAYEMS', '非农就业人数', 'Nonfarm Payrolls', '千人', 'monthly', 10),
  ('unemployment', 'us_economy', 'UNRATE', '失业率', 'Unemployment Rate', '%', 'monthly', 11),
  ('initial_claims', 'us_economy', 'ICSA', '初请失业金人数', 'Initial Jobless Claims', '人', 'weekly', 12),
  ('continuing_claims', 'us_economy', 'CCSA', '续请失业金人数', 'Continuing Claims', '人', 'weekly', 13),
  ('adp_employment', 'us_economy', 'ADPMNUSNERSA', 'ADP就业人数', 'ADP Employment', '千人', 'monthly', 14),
  ('jolts', 'us_economy', 'JTSJOL', 'JOLTs职位空缺', 'JOLTS Job Openings', '千个', 'monthly', 15),

  -- 通胀数据
  ('cpi', 'us_economy', 'CPIAUCSL', 'CPI', 'Consumer Price Index', '指数', 'monthly', 20),
  ('core_cpi', 'us_economy', 'CPILFESL', '核心CPI', 'Core CPI', '指数', 'monthly', 21),
  ('ppi', 'us_economy', 'PPIACO', 'PPI', 'Producer Price Index', '指数', 'monthly', 22),
  ('pce', 'us_economy', 'PCEPI', 'PCE物价指数', 'PCE Price Index', '指数', 'monthly', 23),
  ('core_pce', 'us_economy', 'PCEPILFE', '核心PCE', 'Core PCE', '指数', 'monthly', 24),

  -- 消费与零售
  ('retail_sales', 'us_economy', 'RSAFS', '零售销售', 'Retail Sales', '百万美元', 'monthly', 30),

  -- 房地产
  ('housing_starts', 'us_economy', 'HOUST', '新屋开工', 'Housing Starts', '千套', 'monthly', 40),
  ('existing_home_sales', 'us_economy', 'EXHOSLUSM495S', '成屋销售', 'Existing Home Sales', '百万套', 'monthly', 41),

  -- 消费者信心
  ('consumer_confidence', 'us_economy', 'USACSCICP02STSAM', '消费者信心指数', 'Consumer Confidence', '指数', 'monthly', 50),
  ('umich_sentiment', 'us_economy', 'UMCSENT', '密歇根消费者信心', 'Michigan Consumer Sentiment', '指数', 'monthly', 51);

-- ===========================================
-- 插入指标数据 - 美元流动性
-- ===========================================

INSERT INTO macro_indicators (id, category_id, fred_series_id, name, name_en, unit, frequency, sort_order) VALUES
  ('fed_balance_sheet', 'liquidity', 'WALCL', '美联储资产负债表', 'Fed Balance Sheet', '百万美元', 'weekly', 1),
  ('tga', 'liquidity', 'WDTGAL', '财政部一般账户', 'Treasury General Account', '百万美元', 'weekly', 2),
  ('rrp', 'liquidity', 'RRPONTSYD', '逆回购', 'Reverse Repo', '十亿美元', 'daily', 3);

-- ===========================================
-- 插入指标数据 - 美债市场
-- ===========================================

INSERT INTO macro_indicators (id, category_id, fred_series_id, name, name_en, unit, frequency, sort_order) VALUES
  ('treasury_2y', 'treasury', 'DGS2', '2年期美债收益率', '2-Year Treasury Yield', '%', 'daily', 1),
  ('treasury_5y', 'treasury', 'DGS5', '5年期美债收益率', '5-Year Treasury Yield', '%', 'daily', 2),
  ('treasury_10y', 'treasury', 'DGS10', '10年期美债收益率', '10-Year Treasury Yield', '%', 'daily', 3),
  ('treasury_30y', 'treasury', 'DGS30', '30年期美债收益率', '30-Year Treasury Yield', '%', 'daily', 4),
  ('yield_spread_2s10s', 'treasury', 'T10Y2Y', '2s10s利差', '10Y-2Y Yield Spread', '%', 'daily', 5);

-- ===========================================
-- 插入指标数据 - 利率市场
-- ===========================================

INSERT INTO macro_indicators (id, category_id, fred_series_id, name, name_en, unit, frequency, sort_order) VALUES
  ('fed_funds_rate', 'rates', 'DFF', '联邦基金利率', 'Fed Funds Rate', '%', 'daily', 1),
  ('sofr', 'rates', 'SOFR', 'SOFR', 'Secured Overnight Financing Rate', '%', 'daily', 2),
  ('iorb', 'rates', 'IORB', 'IORB', 'Interest on Reserve Balances', '%', 'daily', 3),
  ('discount_rate', 'rates', 'DPCREDIT', '贴现窗口利率', 'Discount Window Rate', '%', 'daily', 4),
  ('rrp_rate', 'rates', 'RRPONTSYAWARD', '隔夜逆回购利率', 'ON RRP Award Rate', '%', 'daily', 5);

-- ===========================================
-- 插入指标数据 - 预期与情绪
-- ===========================================

INSERT INTO macro_indicators (id, category_id, fred_series_id, name, name_en, unit, frequency, sort_order) VALUES
  ('inflation_expectation', 'sentiment', 'MICH', '通胀预期(密歇根)', 'Inflation Expectation (Michigan)', '%', 'monthly', 1),
  ('breakeven_5y', 'sentiment', 'T5YIFR', '5年期盈亏平衡通胀率', '5-Year Breakeven Inflation', '%', 'daily', 2);

-- ===========================================
-- 插入指标数据 - 外汇市场
-- ===========================================

INSERT INTO macro_indicators (id, category_id, fred_series_id, name, name_en, unit, frequency, sort_order) VALUES
  ('dollar_index', 'forex', 'DTWEXBGS', '美元指数', 'USD Index (Broad)', '指数', 'daily', 1),
  ('usd_cny', 'forex', 'DEXCHUS', 'USD/CNY', 'USD to Chinese Yuan', 'CNY', 'daily', 2),
  ('eur_usd', 'forex', 'DEXUSEU', 'EUR/USD', 'Euro to USD', 'USD', 'daily', 3),
  ('usd_jpy', 'forex', 'DEXJPUS', 'USD/JPY', 'USD to Japanese Yen', 'JPY', 'daily', 4),
  ('gbp_usd', 'forex', 'DEXUSUK', 'GBP/USD', 'British Pound to USD', 'USD', 'daily', 5),
  ('aud_usd', 'forex', 'DEXUSAL', 'AUD/USD', 'Australian Dollar to USD', 'USD', 'daily', 6);

-- ===========================================
-- 插入指标数据 - 市场指数
-- ===========================================

INSERT INTO macro_indicators (id, category_id, fred_series_id, name, name_en, unit, frequency, sort_order) VALUES
  ('sp500', 'market', 'SP500', 'S&P 500', 'S&P 500 Index', '点', 'daily', 1),
  ('vix', 'market', 'VIXCLS', 'VIX', 'CBOE Volatility Index', '点', 'daily', 2);

-- ===========================================
-- 插入指标数据 - 大宗商品
-- ===========================================

INSERT INTO macro_indicators (id, category_id, fred_series_id, name, name_en, unit, frequency, sort_order) VALUES
  ('wti_oil', 'commodities', 'DCOILWTICO', 'WTI原油', 'WTI Crude Oil', '美元/桶', 'daily', 1);

-- ===========================================
-- 验证插入的数据
-- ===========================================

-- SELECT 'Categories:' as info, count(*) as count FROM macro_categories;
-- SELECT 'Indicators:' as info, count(*) as count FROM macro_indicators;
-- SELECT category_id, count(*) FROM macro_indicators GROUP BY category_id ORDER BY category_id;
