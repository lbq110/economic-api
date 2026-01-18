# MacroBet 金融数据需求文档

## 项目概述

MacroBet 是一个**宏观事件预测市场平台**，利用30年历史数据预测经济公告后的资产价格反应。

- **网站**: https://macro-bet.vercel.app/
- **代码仓库**: https://github.com/lbq110/MacroBet

---

## 一、核心功能模块

### 1. 三种投注模式

| 模式 | 英文名 | 描述 |
|------|--------|------|
| 数据狙击手 | Data Sniper | 预测经济数据相对预期值的结果（超预期/符合/低于预期） |
| 波动猎人 | Volatility Hunter | 预测价格波动幅度（如 +0~1%, +1~3%, >+3%） |
| 头彩 | Jackpot | 锁定特定价格区间，最高100倍回报 |

### 2. 支持的经济事件

- CPI（消费者物价指数）
- 非农就业数据 (NFP)
- GDP（国内生产总值）
- 美联储利率决议 (FOMC)
- 日本央行利率决议 (BOJ)

---

## 二、资产价格数据需求

### 需要的资产类别（30+种）

#### 1. 加密货币
| 代码 | 名称 | 说明 |
|------|------|------|
| BTC | Bitcoin | 比特币 |
| ETH | Ethereum | 以太坊 |
| SOL | Solana | 索拉纳 |

#### 2. 美股
| 代码 | 名称 |
|------|------|
| NVDA | NVIDIA |
| TSLA | Tesla |
| AAPL | Apple |
| GOOGL | Google |
| MSFT | Microsoft |
| AMZN | Amazon |

#### 3. 指数
| 代码 | 名称 |
|------|------|
| SPX | S&P 500 |
| DJI | 道琼斯工业指数 |
| NDX | 纳斯达克100 |
| RUT | 罗素2000 |
| A50 | 中国A50指数 |
| HSI | 恒生指数 |
| N225 | 日经225 |
| VIX | 恐慌指数 |
| DXY | 美元指数 |

#### 4. 港股
| 代码 | 名称 |
|------|------|
| 0700.HK | 腾讯控股 |
| 9988.HK | 阿里巴巴 |
| 1810.HK | 小米集团 |
| 2727.HK | 上海电气 |

#### 5. 大宗商品
| 代码 | 名称 |
|------|------|
| XAU | 黄金 |
| XAG | 白银 |
| XPT | 铂金 |
| XPD | 钯金 |
| CL | 美国原油 |

#### 6. 外汇
| 代码 | 名称 |
|------|------|
| USD/CNY | 美元/人民币 |
| EUR/USD | 欧元/美元 |
| USD/JPY | 美元/日元 |
| AUD/USD | 澳元/美元 |
| GBP/USD | 英镑/美元 |

### 每种资产需要的数据字段

```typescript
interface Asset {
  id: string;           // 资产ID
  symbol: string;       // 代码
  name: string;         // 名称
  category: string;     // 分类
  currentPrice: number; // 当前价格
  change24h: number;    // 24小时涨跌幅
  lastUpdated: string;  // 最后更新时间
}
```

---

## 三、宏观经济指标数据需求（59项）

### 1. 独立指标 (4项)
| 指标 | 说明 |
|------|------|
| 美元指数 (DXY) | 衡量美元对一篮子货币的汇率 |
| 黄金 (XAU/USD) | 黄金现货价格 |
| VIX | 标普500波动率指数 |
| MOVE | 债券市场波动率指数 |

### 2. 美国经济晴雨表 (21项)
| 指标 | 频率 |
|------|------|
| GDP | 季度 |
| ISM 制造业 PMI | 月度 |
| ISM 服务业 PMI | 月度 |
| 非农就业人数 (NFP) | 月度 |
| 失业率 | 月度 |
| CPI (同比/环比) | 月度 |
| 核心CPI (同比/环比) | 月度 |
| PPI | 月度 |
| PCE 物价指数 | 月度 |
| 核心PCE | 月度 |
| 零售销售 | 月度 |
| 工业产出 | 月度 |
| 耐用品订单 | 月度 |
| 成屋销售 | 月度 |
| 新屋开工 | 月度 |
| 消费者信心指数 | 月度 |
| 密歇根大学消费者信心 | 月度 |
| 初请失业金人数 | 周度 |
| 续请失业金人数 | 周度 |
| ADP 就业人数 | 月度 |
| JOLTs 职位空缺 | 月度 |

### 3. 美元流动性 (4项)
| 指标 | 说明 |
|------|------|
| 美联储资产负债表 | Fed Balance Sheet |
| 财政部一般账户 (TGA) | Treasury General Account |
| 逆回购 (RRP) | Reverse Repo |
| 净流动性 | Net Liquidity = Fed BS - TGA - RRP |

### 4. 美债市场 (5项)
| 指标 | 说明 |
|------|------|
| 2年期美债收益率 | US 2Y Yield |
| 5年期美债收益率 | US 5Y Yield |
| 10年期美债收益率 | US 10Y Yield |
| 30年期美债收益率 | US 30Y Yield |
| 2s10s 利差 | 2Y-10Y Spread |

### 5. 利率市场 (6项)
| 指标 | 说明 |
|------|------|
| 联邦基金利率 | Federal Funds Rate |
| SOFR | 担保隔夜融资利率 |
| EFFR | 有效联邦基金利率 |
| IORB | 准备金余额利率 |
| 贴现窗口利率 | Discount Rate |
| 隔夜逆回购利率 | ON RRP Rate |

### 6. 预期与情绪 (4项)
| 指标 | 说明 |
|------|------|
| Fed Watch 加息概率 | CME FedWatch Tool |
| Fed Watch 降息概率 | CME FedWatch Tool |
| 鹰派/鸽派分析 | Fed Hawk/Dove Score |
| 通胀预期 | Inflation Expectations |

### 7. 全球央行 (7项)
| 央行 | 指标 |
|------|------|
| 欧洲央行 (ECB) | 利率决议 |
| 英国央行 (BOE) | 利率决议 |
| 日本央行 (BOJ) | 利率决议 |
| 中国人民银行 (PBOC) | LPR利率 |
| 澳大利亚央行 (RBA) | 利率决议 |
| 加拿大央行 (BOC) | 利率决议 |
| 瑞士央行 (SNB) | 利率决议 |

### 8. 期货数据 (3项)
| 指标 | 说明 |
|------|------|
| BTC 未平仓合约 | BTC Open Interest |
| ETH 未平仓合约 | ETH Open Interest |
| 资金费率 | Funding Rate |

### 9. 链上数据 (3项)
| 指标 | 说明 |
|------|------|
| USDT 铸造/销毁 | USDT Mint/Burn |
| USDC 铸造/销毁 | USDC Mint/Burn |
| 稳定币总市值 | Stablecoin Market Cap |

### 10. ETF 数据 (2项)
| 指标 | 说明 |
|------|------|
| BTC ETF 净流入 | BTC Spot ETF Net Flows |
| ETH ETF 净流入 | ETH Spot ETF Net Flows |

---

## 四、历史价格反应数据

### 数据结构

```typescript
interface PriceReaction {
  label: 'Above Expectation' | 'In Line' | 'Below Expectation';
  avgChange: number;        // 平均涨跌幅
  medianChange: number;     // 中位数涨跌幅
  upCount: number;          // 上涨次数
  downCount: number;        // 下跌次数
  upProbability: number;    // 上涨概率
  downProbability: number;  // 下跌概率
  volatilityAmplitude: number; // 波动幅度
  sampleSize: number;       // 样本数量
  history: Array<{
    date: string;
    actual: number;         // 实际值
    forecast: number;       // 预期值
    priceChange: number;    // 价格变化
  }>;
}
```

### 需要的历史数据

- **时间跨度**: 30年（1994年至今）
- **经济指标**: CPI, NFP, GDP, FOMC 等
- **资产**: 30+ 种资产在每次经济数据发布后的价格反应
- **分类维度**: 超预期/符合预期/低于预期

---

## 五、实时事件数据

### 事件状态流转

```
UPCOMING → BETTING → LOCKED → LIVE → SETTLING → SETTLED
                                          ↓
                                      CANCELLED
```

### 事件数据结构

```typescript
interface ShockwaveEvent {
  id: string;
  indicatorName: string;     // 指标名称
  releaseTime: string;       // 发布时间
  expectedValue: number;     // 预期值
  actualValue?: number;      // 实际值（发布后）
  status: EventStatus;
  eventType: 'REGULAR' | 'SHOCKWAVE';
  basePrice?: number;        // 基准价格
  settlePrice?: number;      // 结算价格
  options: BetOption[];      // 投注选项
}
```

---

## 六、数据源建议

### 经济数据
| 数据类型 | 建议数据源 |
|---------|-----------|
| 美国经济数据 | FRED API, BLS API, BEA API |
| 全球央行数据 | Trading Economics, Investing.com |
| 经济日历 | Forex Factory, Investing.com |

### 市场数据
| 数据类型 | 建议数据源 |
|---------|-----------|
| 加密货币 | Binance API, CoinGecko, CryptoCompare |
| 美股/指数 | Alpha Vantage, Yahoo Finance, Polygon.io |
| 外汇 | OANDA, Forex API |
| 大宗商品 | Quandl, Trading Economics |

### 链上数据
| 数据类型 | 建议数据源 |
|---------|-----------|
| 稳定币数据 | Glassnode, DefiLlama |
| 期货数据 | Coinglass, Binance Futures API |
| ETF 流入 | BitMEX Research, SoSoValue |

### 利率/流动性
| 数据类型 | 建议数据源 |
|---------|-----------|
| 美联储数据 | FRED API |
| Fed Watch | CME FedWatch Tool |
| 美债收益率 | Treasury Direct, FRED |

---

## 七、API 开发优先级

### P0 - 核心功能（必须）
1. 实时资产价格 API（30+ 资产）
2. 经济日历 API（事件时间、预期值）
3. 经济数据发布 API（实际值推送）

### P1 - 重要功能
4. 历史价格反应数据 API
5. 宏观指标实时数据 API（59项）

### P2 - 增强功能
6. 链上数据 API
7. ETF 流入数据 API
8. Fed Watch 概率 API

---

## 八、数据更新频率

| 数据类型 | 更新频率 |
|---------|---------|
| 资产价格 | 实时 / 1秒 |
| VIX/MOVE | 实时 |
| 美债收益率 | 实时 |
| 经济数据 | 按发布时间 |
| 链上数据 | 1小时 |
| ETF 流入 | 每日 |
| 美联储资产负债表 | 每周 |

---

*文档生成时间: 2026-01-17*
