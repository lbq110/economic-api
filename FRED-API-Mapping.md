# FRED API 数据映射文档

## API 信息

- **API Key**: `fe8031ab2d8be3df7f08c45173f19562`
- **Base URL**: `https://api.stlouisfed.org/fred/`
- **文档**: https://fred.stlouisfed.org/docs/api/fred/

---

## 一、FRED 可覆盖的数据（共 40+ 项）

### 1. 美国经济晴雨表 (18/21 项可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| GDP | `GDP` | Gross Domestic Product | Quarterly |
| ISM 制造业 PMI | - | **不可用** | - |
| ISM 服务业 PMI | - | **不可用** | - |
| 非农就业人数 (NFP) | `PAYEMS` / `PAYNSA` | All Employees, Total Nonfarm | Monthly |
| 失业率 | `UNRATE` | Unemployment Rate | Monthly |
| CPI (同比/环比) | `CPIAUCSL` | Consumer Price Index for All Urban Consumers | Monthly |
| 核心CPI | `CPILFESL` | CPI Less Food and Energy | Monthly |
| PPI | `PPIACO` | Producer Price Index: All Commodities | Monthly |
| PCE 物价指数 | `PCEPI` | Personal Consumption Expenditures: Chain-type Price Index | Monthly |
| 核心PCE | `PCEPILFE` | PCE Excluding Food and Energy | Monthly |
| 零售销售 | `RSAFS` | Advance Retail Sales: Retail Trade and Food Services | Monthly |
| 工业产出 | `INDPRO` | Industrial Production: Total Index | Monthly |
| 耐用品订单 | `DGORDER` | Manufacturers' New Orders: Durable Goods | Monthly |
| 成屋销售 | `EXHOSLUSM495S` | Existing Home Sales | Monthly |
| 新屋开工 | `HOUST` | Housing Units Started | Monthly |
| 消费者信心指数 | `USACSCICP02STSAM` | Consumer Confidence for US | Monthly |
| 密歇根大学消费者信心 | `UMCSENT` | University of Michigan: Consumer Sentiment | Monthly |
| 初请失业金人数 | `ICSA` | Initial Claims | Weekly |
| 续请失业金人数 | `CCSA` | Continued Claims | Weekly |
| ADP 就业人数 | `ADPMNUSNERSA` | ADP Total Nonfarm Private Payroll | Monthly |
| JOLTs 职位空缺 | `JTSJOL` | Job Openings: Total Nonfarm | Monthly |

### 2. 美元流动性 (4/4 项全部可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| 美联储资产负债表 | `WALCL` | Fed Total Assets | Weekly |
| 财政部一般账户 (TGA) | `WDTGAL` / `WTREGEN` | Treasury General Account | Weekly |
| 逆回购 (RRP) | `RRPONTSYD` | Overnight Reverse Repo | Daily |
| 净流动性 | **需计算** | = WALCL - TGA - RRP | - |

### 3. 美债市场 (5/5 项全部可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| 2年期美债收益率 | `DGS2` | 2-Year Treasury Constant Maturity | Daily |
| 5年期美债收益率 | `DGS5` | 5-Year Treasury Constant Maturity | Daily |
| 10年期美债收益率 | `DGS10` | 10-Year Treasury Constant Maturity | Daily |
| 30年期美债收益率 | `DGS30` | 30-Year Treasury Constant Maturity | Daily |
| 2s10s 利差 | `T10Y2Y` | 10Y minus 2Y Treasury | Daily |

### 4. 利率市场 (6/6 项全部可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| 联邦基金利率 | `DFF` / `FEDFUNDS` | Federal Funds Effective Rate | Daily/Monthly |
| SOFR | `SOFR` | Secured Overnight Financing Rate | Daily |
| EFFR | `DFF` | Federal Funds Effective Rate | Daily |
| IORB | `IORB` | Interest Rate on Reserve Balances | Daily |
| 贴现窗口利率 | `DPCREDIT` | Discount Window Primary Credit Rate | Daily |
| 隔夜逆回购利率 | `RRPONTSYAWARD` | Overnight Reverse Repo Award Rate | Daily |

### 5. 预期与情绪 (2/4 项可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| Fed Watch 加息概率 | - | **不可用** (需用 CME) | - |
| Fed Watch 降息概率 | - | **不可用** (需用 CME) | - |
| 鹰派/鸽派分析 | - | **不可用** | - |
| 通胀预期 | `MICH` / `T5YIFR` | Inflation Expectation | Monthly/Daily |

### 6. 独立指标 (2/4 项可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| 美元指数 (DXY) | `DTWEXBGS` | Nominal Broad U.S. Dollar Index | Daily |
| 黄金 (XAU/USD) | - | **不可用** (需用其他源) | - |
| VIX | `VIXCLS` | CBOE Volatility Index: VIX | Daily |
| MOVE | - | **不可用** | - |

### 7. 外汇 (5/5 项全部可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| USD/CNY | `DEXCHUS` | Chinese Yuan to USD | Daily |
| EUR/USD | `DEXUSEU` | USD to Euro | Daily |
| USD/JPY | `DEXJPUS` | Japanese Yen to USD | Daily |
| AUD/USD | `DEXUSAL` | USD to Australian Dollar | Daily |
| GBP/USD | `DEXUSUK` | USD to UK Pound | Daily |

### 8. 市场指数 (2/9 项可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| S&P 500 | `SP500` | S&P 500 | Daily |
| VIX | `VIXCLS` | CBOE Volatility Index | Daily |
| 道琼斯 | - | **不可用** | - |
| 纳斯达克100 | - | **不可用** | - |
| 罗素2000 | - | **不可用** | - |
| 恒生指数 | - | **不可用** | - |
| 日经225 | - | **不可用** | - |
| 中国A50 | - | **不可用** | - |
| 美元指数 | `DTWEXBGS` | Broad Dollar Index | Daily |

### 9. 大宗商品 (1/5 项可覆盖)

| MacroBet 需求 | FRED Series ID | FRED 名称 | 频率 |
|--------------|----------------|-----------|------|
| 黄金 | - | **不可用** | - |
| 白银 | - | **不可用** | - |
| 铂金 | - | **不可用** | - |
| 钯金 | - | **不可用** | - |
| 美国原油 (WTI) | `DCOILWTICO` | WTI Crude Oil Price | Daily |

---

## 二、FRED 无法覆盖的数据

### 完全不可用（需其他数据源）

| 类别 | 数据项 | 建议数据源 |
|------|-------|-----------|
| **加密货币** | BTC, ETH, SOL 价格 | Binance, CoinGecko |
| **美股** | NVDA, TSLA, AAPL 等 | Yahoo Finance, Alpha Vantage |
| **港股** | 腾讯, 阿里等 | Yahoo Finance |
| **指数** | 道琼斯, 纳斯达克, 恒生等 | Yahoo Finance, Polygon.io |
| **大宗商品** | 黄金, 白银, 铂金, 钯金 | Trading Economics, Quandl |
| **波动率** | MOVE Index | ICE, Bloomberg |
| **PMI** | ISM 制造业/服务业 PMI | ISM, Trading Economics |
| **Fed Watch** | 加息/降息概率 | CME FedWatch Tool |
| **期货数据** | BTC/ETH 未平仓合约 | Coinglass, Binance |
| **链上数据** | USDT/USDC 铸造, 稳定币市值 | Glassnode, DefiLlama |
| **ETF 数据** | BTC/ETH ETF 净流入 | SoSoValue, BitMEX Research |
| **全球央行** | ECB, BOE, BOJ 等利率 | Trading Economics |

---

## 三、FRED API 使用示例

### 获取单个系列数据

```bash
# 获取 CPI 数据
curl "https://api.stlouisfed.org/fred/series/observations?series_id=CPIAUCSL&api_key=fe8031ab2d8be3df7f08c45173f19562&file_type=json"

# 获取最近10条数据
curl "https://api.stlouisfed.org/fred/series/observations?series_id=DGS10&api_key=fe8031ab2d8be3df7f08c45173f19562&file_type=json&limit=10&sort_order=desc"

# 获取指定日期范围数据
curl "https://api.stlouisfed.org/fred/series/observations?series_id=GDP&api_key=fe8031ab2d8be3df7f08c45173f19562&file_type=json&observation_start=2020-01-01&observation_end=2024-12-31"
```

### 搜索系列

```bash
# 搜索包含关键词的系列
curl "https://api.stlouisfed.org/fred/series/search?search_text=unemployment&api_key=fe8031ab2d8be3df7f08c45173f19562&file_type=json"
```

### 获取系列信息

```bash
# 获取系列元数据
curl "https://api.stlouisfed.org/fred/series?series_id=UNRATE&api_key=fe8031ab2d8be3df7f08c45173f19562&file_type=json"
```

---

## 四、推荐的 FRED Series ID 汇总

### 核心经济数据

```json
{
  "GDP": "GDP",
  "CPI": "CPIAUCSL",
  "Core_CPI": "CPILFESL",
  "PCE": "PCEPI",
  "Core_PCE": "PCEPILFE",
  "PPI": "PPIACO",
  "NFP": "PAYEMS",
  "Unemployment": "UNRATE",
  "Retail_Sales": "RSAFS",
  "Industrial_Production": "INDPRO",
  "Durable_Goods": "DGORDER",
  "Housing_Starts": "HOUST",
  "Existing_Home_Sales": "EXHOSLUSM495S",
  "Initial_Claims": "ICSA",
  "Continuing_Claims": "CCSA",
  "ADP_Employment": "ADPMNUSNERSA",
  "JOLTS": "JTSJOL",
  "Consumer_Sentiment": "UMCSENT"
}
```

### 利率与流动性

```json
{
  "Fed_Funds_Rate": "DFF",
  "SOFR": "SOFR",
  "IORB": "IORB",
  "Discount_Rate": "DPCREDIT",
  "RRP_Rate": "RRPONTSYAWARD",
  "Fed_Balance_Sheet": "WALCL",
  "TGA": "WDTGAL",
  "RRP": "RRPONTSYD"
}
```

### 美债收益率

```json
{
  "Treasury_2Y": "DGS2",
  "Treasury_5Y": "DGS5",
  "Treasury_10Y": "DGS10",
  "Treasury_30Y": "DGS30",
  "Yield_Spread_2s10s": "T10Y2Y"
}
```

### 外汇

```json
{
  "USD_CNY": "DEXCHUS",
  "EUR_USD": "DEXUSEU",
  "USD_JPY": "DEXJPUS",
  "AUD_USD": "DEXUSAL",
  "GBP_USD": "DEXUSUK",
  "Dollar_Index": "DTWEXBGS"
}
```

### 市场指标

```json
{
  "SP500": "SP500",
  "VIX": "VIXCLS",
  "WTI_Oil": "DCOILWTICO",
  "Inflation_Expectation": "MICH"
}
```

---

## 五、覆盖率统计

| 类别 | MacroBet 需求 | FRED 可覆盖 | 覆盖率 |
|------|-------------|------------|--------|
| 美国经济数据 | 21 | 18 | 86% |
| 美元流动性 | 4 | 4 | 100% |
| 美债市场 | 5 | 5 | 100% |
| 利率市场 | 6 | 6 | 100% |
| 预期情绪 | 4 | 2 | 50% |
| 独立指标 | 4 | 2 | 50% |
| 外汇 | 5 | 5 | 100% |
| 市场指数 | 9 | 2 | 22% |
| 大宗商品 | 5 | 1 | 20% |
| 加密货币 | 3 | 0 | 0% |
| 美股 | 6 | 0 | 0% |
| 港股 | 4 | 0 | 0% |
| 期货/链上/ETF | 8 | 0 | 0% |
| 全球央行 | 7 | 0 | 0% |
| **总计** | **91** | **45** | **~49%** |

---

## 六、结论

FRED API 可以覆盖 MacroBet 约 **49%** 的数据需求，主要集中在：

**强项（100%覆盖）：**
- 美国经济核心数据（GDP, CPI, NFP, 失业率等）
- 美债收益率
- 利率市场
- 美元流动性
- 主要外汇汇率

**弱项（需要其他数据源）：**
- 加密货币价格 → Binance/CoinGecko
- 美股/港股/国际指数 → Yahoo Finance/Alpha Vantage
- 大宗商品（金银等）→ Trading Economics
- ISM PMI → ISM 官方
- Fed Watch 概率 → CME
- 链上数据/ETF 流入 → Glassnode/SoSoValue

---

*文档生成时间: 2026-01-17*
