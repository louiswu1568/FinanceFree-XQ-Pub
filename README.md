# FinanceFree-XQ-Pub · 全資產投資體檢與智能推播報告v1.0

> **專業量化全資產投資決策系統 · Format 1 HTML 渲染標準 · 智能推播中心 (Alert Hub 10 大場景) 雲端公開報告**

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-success?style=flat-square&logo=vercel)](https://financefree-xq-pub.vercel.app/)
[![GitHub Release](https://img.shields.io/badge/Release-v1.0-blue?style=flat-square)](https://github.com/louiswu1568/FinanceFree-XQ-Pub)
[![License: All Rights Reserved](https://img.shields.io/badge/License-All_Rights_Reserved-red?style=flat-square)](#-智慧財產權聲明與商業授權規範)

---

## 📌 系統簡介

**FinanceFree-XQ-Pub** 為 [FinanceFree-XQ 投資決策系統](https://github.com/louiswu1568/FinanceFree-XQ) 之公開靜態網頁前端，部署於 **Vercel.app** 雲端平台。每日透過自動化排程引擎，產出符合 **Format 1 標準格式** 之全資產投資體檢報告與 **10 大智能推播場景總覽表**，並在 LINE Official Bot / Email 推送通知中附帶此公開報告連結供點閱。

---

## 🔔 智能推播中心 (Alert Hub) · 10 大推播場景總覽

| 場景編號 | 場景名稱 | 觸發時機 | 觸發條件與指標 | 推播管道 | 優先級 |
|:---|:---|:---|:---|:---|:---:|
| **SCENARIO-01** | 盤前/盤中買賣決策與下單指令 | 每日 08:30 / 13:30 | 多因子評分達標 (Score >= 80) 或 60分K支撐加碼 | LINE Bot / Email | `HIGH` |
| **SCENARIO-02** | 高股息殖利率甜甜價與買點逼近 | 每日盤後 15:00 | 核心標的距買點價差 <= 2.5% 或 殖利率 >= 6.5% | LINE Bot / Email | `MEDIUM` |
| **SCENARIO-03** | 除權息旺季與季節性日曆提醒 | 除息日前 3 日 / 前 1 日 | 持股除息日倒數 <= 3 天，提示最後買進日與填息機率 | LINE Bot / Email | `MEDIUM` |
| **SCENARIO-04** | 股息入帳與自動再投資滾雪球 | 每月 10/25 股息發放日 | 股息入帳金額 >= 10,000 元，自動試算複利加碼標的 | LINE Bot / Email | `MEDIUM` |
| **SCENARIO-05** | 全市場融資維持率與情緒過熱/恐慌 | 每日盤後 17:30 | 大盤融資維持率 < 140% (斷頭買點) 或 > 175% (過熱) | LINE Bot / Email | `HIGH` |
| **SCENARIO-06** | 槓桿倍數壓力測試與質押維持率監控 | 每日收盤 / 大盤急跌 > 2% | 質押維持率 < 180% (預警) 或 負債比 > 35% | LINE (緊急) / Email | `URGENT` |
| **SCENARIO-07** | 股債金資產配置偏離與動態再平衡 | 每週日 20:00 / 偏離即時 | 核心配置 (股/債/金/現金) 偏離目標權重超過 ±5% | LINE Bot / Email | `MEDIUM` |
| **SCENARIO-08** | 總淨值創歷史新高 (ATH) 與 Alpha 超額報酬 | 每日盤後 16:30 | 總淨值突破歷史高點 或 YTD 超越 0050 基準 >= 3.0% | LINE Bot / Email | `INFO` |
| **SCENARIO-09** | 退休金達標里程碑與 4% 提領率進度 | 每月 1 日 09:00 | 退休金達標進度每提升 5% 觸發特別進度與 4% SWR 試算 | LINE Bot / Email | `INFO` |
| **SCENARIO-10** | 每日盤後定時自動分析報告產出 | 每日 16:30 (定時排程) | 定時分析排程完成全資產體檢、XQ 數據爬取與雲端發布 | LINE Bot / Email / Vercel | `INFO` |

---

## ⚖️ 智慧財產權聲明、商業授權規範與法律責任免責宣告

### 1. 智慧財產權與著作權歸屬聲明 (Intellectual Property & Copyright Notice)
本系統 **FinanceFree-XQ** 及前端 **FinanceFree-XQ-Pub** 所包含之全部演算法架構、多因子評分機制、量化模型、Format 1 前端渲染設計（HTML/CSS/JS）、視覺化圖表排版及數據分析成果，其著作權、商標權、營業秘密等全部智慧財產權，**均屬原作者 Louis Wu 依法獨立專屬享有**。版權所有，未經書面授權，翻印/抄襲/逆向工程必究。

### 2. 商業使用限制與強制引用告知規範 (Commercial Use Restriction & Attribution Policy)
* **嚴禁商業營利利用：** 嚴格禁止任何第三方未經事前正式書面授權，將本系統、HTML 渲染架構或數據分析成果用於商業營利、收費投顧服務、付費社群或轉售。
* **嚴禁 AI / LLM 爬蟲抓取：** 嚴禁使用爬蟲或自動化工具抓取本系統網頁與數據作為 AI/LLM 模型訓練資料集。
* **非營利引用規範：** 基於學術研究或非營利性引用時，**必須事前書面告知原作者**並於引用處顯著標註：
  ```
  引用自 FinanceFree-XQ 投資決策系統 (Author: Louis Wu / GitHub: louiswu1568/FinanceFree-XQ-Pub)
  ```

### 3. 專業金融投資與法律免責聲明 (Financial Non-Advisory & Risk Disclaimer)
本報告及網頁所有推播、數據與指標，純屬基於歷史數據與量化模型之**個人量化研究與演算法技術展示，絕不構成任何證券、期貨、基金、衍生性金融商品之買賣推薦、投資諮詢或獲利保證**。金融市場具高度波動風險，使用者應獨立審慎評估並自負盈虧。原作者對因參考或使用本系統所生之任何直接或間接損失概不承擔任何法律與賠償責任。

### 4. 侵權追訴與準據法管轄 (Trade Secrets, Infringement & Jurisdiction)
凡有侵權、違反營業秘密法、盜用 HTML 渲染架構或違法商業獲利者，原作者將依《中華民國著作權法》（第 84 條至第 90 條）、《營業秘密法》及相關民刑法規追究全數損害賠償與刑事責任。本條款以**中華民國法令**為準據法，並以**臺灣臺北地方法院**為第一審專屬管轄法院。

---

© 2026 **FinanceFree-XQ** · All Rights Reserved (Louis Wu).
