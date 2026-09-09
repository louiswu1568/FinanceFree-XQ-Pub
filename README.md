# FinanceFree-XQ-Pub · 全資產投資體檢與智能推播報告 (Format 1)

[![Version](https://img.shields.io/badge/Release-v3.1-blue)](https://github.com/louiswu1568/FinanceFree-XQ)
[![Intellectual Property](https://img.shields.io/badge/IP%20Protection-All%20Rights%20Reserved-red)](https://github.com/louiswu1568/FinanceFree-XQ-Pub#%EF%B8%8F-%E5%95%86%E6%A5%AD%E6%99%BA%E6%85%A7%E8%B2%A1%E7%94%A2%E6%AC%8A%E8%81%B2%E6%98%8E%E5%BC%95%E7%94%A8%E8%A6%8F%E7%AF%84%E8%88%87%E6%B3%95%E5%BE%8B%E5%85%8D%E8%B2%AC%E6%A2%9D%E6%AC%BE)
[![Deployment](https://img.shields.io/badge/Vercel-Hosted-black?logo=vercel)](https://financefree-xq-pub.vercel.app/)

本倉庫為 **[FinanceFree-XQ](https://github.com/louiswu1568/FinanceFree-XQ)** 投資決策系統之公開靜態報告發布端（Public Report Mirror），專為 **Vercel** 全球 Edge CDN 靜態網站託管打造。

---

## ⚖️ 商業智慧財產權聲明、引用規範與法律免責條款
*(Commercial Intellectual Property, Mandatory Citation Policy & Legal Disclaimer)*

> **特別聲明**：本專案所包含之演算法架構、資料視覺化模型、前端 HTML/CSS/JS 介面渲染結構、量化分析指標及報告內容，均屬原創作者所有，受相關智慧財產權法規之嚴密保護。

### 一、 智慧財產權與著作權所有權利保留 (Proprietary IP & Copyright All Rights Reserved)
1. **專有權利範圍**：本系統（包含但不限於 **FinanceFree-XQ** 之量化投資決策模型、Format 1 前端 HTML/CSS/JS 渲染架構、金字塔分批加碼演算法、高股息殖利率甜蜜點模型、多重風控閘門邏輯及所有產出之分析報告內容），其全部智慧財產權、著作權、商標權及營業秘密均專屬於原作者所有。
2. **禁止擅自重製與抄襲**：非經原創作者事前正式書面授權，任何人不得以任何形式（包括但不限於重製、改作、公開播送、公開傳輸、散布、發行、銷售、再授權、反向工程、抓取 (Scraping) 或作為人工智慧 AI / LLM 訓練模型資料集）進行全部或部分之複製或商業營利利用。

### 二、 商業使用限制與強制引用告知規範 (Commercial Restriction & Mandatory Citation)
1. **商業營利利用**：嚴禁任何未經事前正式書面簽約授權之商業營利利用。
2. **學術與非營利引用規範**：若因學術研究、個人技術交流需引用本專案之架構、圖表或報告，**必須事前主動告知原作者**，並於引用處之顯著位置明確標註完整出處：
   ```text
   引用來源：FinanceFree-XQ 全自動化投資決策系統 (Author: Louis Wu / GitHub: https://github.com/louiswu1568/FinanceFree-XQ-Pub)
   ```
   任何未經告知之引用、斷章取義或未具名轉載，均構成對著作權之直接侵害。

### 三、 專業金融投資風險揭露與免責條款 (Financial Disclaimer & Risk Disclosure)
1. **非證券投資顧問建議**：本平台及產出報告所揭露之所有量化數據、指標推估、買入目標價、進場時機提醒、風控狀態與經理人決策摘要，均係基於歷史數據、量化模型與公開資訊之自動化運算結果，**僅供個人資產配置技術研究與決策流程演示之用，絕不構成任何形式之證券、期貨、基金或衍生性金融商品之投資顧問、買賣推薦、獲利保證、要約或招攬**。
2. **投資風險與盈虧自負**：金融市場具有高度波動性與不確定性，歷史績效絕不保證未來表現。任何投資行為均具有本金虧損之風險（包括市場波動、流動性風險、信用風險及匯率風險等）。投資人應獨立審慎評估自身財務狀況與風險承受能力，並**自行承擔所有投資交易之盈虧結果與法律責任**。
3. **無瑕疵擔保責任**：本系統力求數據之正確性，但對於第三方資料源之延遲、中斷、遺漏或錯誤，以及因網路傳輸或系統維護所生之任何直接、間接、附帶或衍生性損害，作者及開發團隊概不承擔任何賠償責任。

### 四、 侵權究責與準據法管轄 (Legal Recourse & Governing Law)
凡未經許可擅自抄襲、未告知引用、商業剽竊本系統專利架構、HTML/CSS 渲染版型或專有量化模型者，著作權人將依法委任律師保全證據，並提出包括《著作權法》之排除侵害、銷毀重製物、民事損害賠償訴訟（最高按法定最高額追賠）及相關法令之法律追訴。本條款之解釋與適用均以**中華民國法律**為準據法，如有爭議，合意以**臺灣臺北地方法院**為第一審專屬管轄法院。

---

## 🌟 系統功能與架構亮點

1. **Format 1 全面投資體檢報告**：
   - **今日決策與委託單**：展示經理人模型分析與待確認買賣單（`STRONG_BUY` / `STRATEGIC_EXIT`）。
   - **四大子投組配置**：A/B/C/D 四大模組損益與資產分佈。
   - **買入目標價追蹤 (≤3%)**：核心標的殖利率甜蜜點與金字塔加碼雷達。
   - **10 大智能推播預警矩陣**：涵蓋交易訊息、市場訊息與系統里程碑三大維度。
   - **4% SWR 退休進度**：安全提領率與財務自由達成進度條。
2. **LINE / Email 智能推播直達**：
   - 收到推播通知時，手機點擊專屬連結即可秒開最新 Format 1 HTML 報告。

---

© 2026 FinanceFree-XQ. All Rights Reserved. 版權所有 · 翻印侵權必究。
