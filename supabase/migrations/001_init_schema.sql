-- MacroBet Economic Data Schema
-- Migration: 001_init_schema

-- 分类表
CREATE TABLE macro_categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 指标配置表
CREATE TABLE macro_indicators (
  id TEXT PRIMARY KEY,
  category_id TEXT REFERENCES macro_categories(id) ON DELETE CASCADE,
  fred_series_id TEXT,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  unit TEXT,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  source TEXT DEFAULT 'fred',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 指标数值表
CREATE TABLE indicator_values (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  indicator_id TEXT REFERENCES macro_indicators(id) ON DELETE CASCADE,
  value DECIMAL,
  previous_value DECIMAL,
  change_percent DECIMAL,
  data_date DATE NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(indicator_id, data_date)
);

-- 索引优化查询性能
CREATE INDEX idx_indicator_values_indicator_id ON indicator_values(indicator_id);
CREATE INDEX idx_indicator_values_data_date ON indicator_values(data_date DESC);
CREATE INDEX idx_indicator_values_fetched_at ON indicator_values(fetched_at DESC);
CREATE INDEX idx_macro_indicators_category_id ON macro_indicators(category_id);
CREATE INDEX idx_macro_indicators_fred_series_id ON macro_indicators(fred_series_id);

-- 启用 Row Level Security
ALTER TABLE macro_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE macro_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicator_values ENABLE ROW LEVEL SECURITY;

-- 公开读取策略（任何人都可以读取）
CREATE POLICY "Allow public read access on macro_categories"
  ON macro_categories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on macro_indicators"
  ON macro_indicators FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on indicator_values"
  ON indicator_values FOR SELECT
  USING (true);

-- 服务角色可以写入（用于 Edge Function）
CREATE POLICY "Allow service role to insert macro_categories"
  ON macro_categories FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update macro_categories"
  ON macro_categories FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to insert macro_indicators"
  ON macro_indicators FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update macro_indicators"
  ON macro_indicators FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to insert indicator_values"
  ON indicator_values FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Allow service role to update indicator_values"
  ON indicator_values FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Allow service role to delete indicator_values"
  ON indicator_values FOR DELETE
  TO service_role
  USING (true);

-- 创建获取最新指标值的视图
CREATE OR REPLACE VIEW latest_indicator_values AS
SELECT DISTINCT ON (indicator_id)
  iv.id,
  iv.indicator_id,
  mi.name,
  mi.name_en,
  mi.unit,
  mi.frequency,
  mc.id as category_id,
  mc.name as category_name,
  mc.name_en as category_name_en,
  iv.value,
  iv.previous_value,
  iv.change_percent,
  iv.data_date,
  iv.fetched_at
FROM indicator_values iv
JOIN macro_indicators mi ON iv.indicator_id = mi.id
JOIN macro_categories mc ON mi.category_id = mc.id
WHERE mi.is_active = TRUE
ORDER BY iv.indicator_id, iv.data_date DESC;

-- 创建获取分类及其指标的函数
CREATE OR REPLACE FUNCTION get_categories_with_indicators()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN (
    SELECT json_agg(
      json_build_object(
        'id', mc.id,
        'name', mc.name,
        'name_en', mc.name_en,
        'icon', mc.icon,
        'color', mc.color,
        'indicators', (
          SELECT json_agg(
            json_build_object(
              'id', mi.id,
              'name', mi.name,
              'name_en', mi.name_en,
              'unit', mi.unit,
              'frequency', mi.frequency,
              'latest_value', (
                SELECT json_build_object(
                  'value', iv.value,
                  'previous_value', iv.previous_value,
                  'change_percent', iv.change_percent,
                  'data_date', iv.data_date,
                  'fetched_at', iv.fetched_at
                )
                FROM indicator_values iv
                WHERE iv.indicator_id = mi.id
                ORDER BY iv.data_date DESC
                LIMIT 1
              )
            )
            ORDER BY mi.sort_order
          )
          FROM macro_indicators mi
          WHERE mi.category_id = mc.id AND mi.is_active = TRUE
        )
      )
      ORDER BY mc.sort_order
    )
    FROM macro_categories mc
  );
END;
$$;
