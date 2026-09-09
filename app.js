// FinanceFree-XQ-Pub Frontend Controller
// Handles Tab Navigation, JSON Fetching, and Dynamic Rendering of Format 1 & 10 Scenarios

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  loadReportData();
  initModal();
});

// Tab Switcher
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const contents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      contents.forEach(c => c.classList.remove('active'));

      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      const el = document.getElementById(target);
      if (el) el.classList.add('active');
    });
  });
}

// Modal Preview
function initModal() {
  const modal = document.getElementById('preview-modal');
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
}

window.showScenarioPreview = function(title, channel, previewText) {
  const modal = document.getElementById('preview-modal');
  const modalTitle = document.getElementById('modal-title');
  const modalChannel = document.getElementById('modal-channel');
  const modalContent = document.getElementById('modal-content');
  if (modal && modalTitle && modalChannel && modalContent) {
    modalTitle.textContent = title;
    modalChannel.textContent = channel;
    modalContent.textContent = previewText;
    modal.style.display = 'flex';
  }
};

// Fetch Latest Report Data
async function loadReportData() {
  try {
    const res = await fetch('./data/latest_report.json?t=' + Date.now());
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    renderReport(data);
  } catch (err) {
    console.warn('Failed to fetch latest_report.json, falling back to embedded defaults:', err);
    renderReport(getFallbackData());
  }
}

// Render Data onto DOM
function renderReport(data) {
  // 1. Meta
  if (data.report_date) {
    document.getElementById('report-date').textContent = data.report_date;
  }
  if (data.macro_gate) {
    const gateEl = document.getElementById('macro-gate');
    gateEl.textContent = data.macro_gate;
    gateEl.className = data.macro_gate === 'SAFE_MODE' ? 'badge badge-safe' : 'badge badge-warn';
  }

  // 2. KPIs
  if (data.kpis) {
    const k = data.kpis;
    document.getElementById('kpi-net-worth').textContent = `NT$ ${Number(k.net_worth || 12850000).toLocaleString()}`;
    document.getElementById('kpi-ytd').textContent = `YTD: +${k.portfolio_ytd_pct || 18.5}%`;
    document.getElementById('kpi-alpha').textContent = `+${(k.alpha_pct || 4.3).toFixed(1)}%`;
    document.getElementById('kpi-benchmark').textContent = `0050 YTD: +${k.benchmark_0050_ytd_pct || 14.2}%`;
    document.getElementById('kpi-dividends').textContent = `NT$ ${Number(k.ytd_dividends || 425000).toLocaleString()}`;
    document.getElementById('kpi-topup').textContent = `加碼金進度: ${(k.topup_progress_pct || 82.5).toFixed(1)}%`;
    document.getElementById('kpi-retirement').textContent = `${(k.retirement_progress_pct || 93.8).toFixed(1)}%`;
  }

  // 3. Manager Summary
  if (data.manager_summary) {
    document.getElementById('manager-summary').textContent = data.manager_summary;
  }

  // 4. 10 Alert Scenarios Table
  renderScenariosTable(data.alert_scenarios || getFallbackScenarios());

  // 5. Orders Table
  renderOrdersTable(data.actionable_orders || []);

  // 6. Buy Targets Table
  renderTargetsTable(data.buy_targets || []);

  // 7. Segments Table
  renderSegmentsTable(data.segments || []);
}

function renderScenariosTable(scenarios) {
  const tbody = document.getElementById('scenarios-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  scenarios.forEach((s) => {
    const tr = document.createElement('tr');
    
    // Priority badge
    let priorityBadge = '<span class="badge badge-info">INFO</span>';
    if (s.priority === 'HIGH') priorityBadge = '<span class="badge badge-warn">HIGH</span>';
    if (s.priority === 'URGENT') priorityBadge = '<span class="badge badge-danger">URGENT</span>';
    if (s.priority === 'MEDIUM') priorityBadge = '<span class="badge badge-primary">MEDIUM</span>';

    // Status badge
    const statusBadge = s.enabled ? '<span class="status-dot online"></span> 啟用中' : '<span class="status-dot offline"></span> 停用';

    const cleanPreview = (s.preview || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    tr.innerHTML = `
      <td><span class="scenario-id">${s.id}</span></td>
      <td><strong>${s.name}</strong></td>
      <td><span class="timing-badge">⏰ ${s.timing}</span></td>
      <td>
        <div class="condition-box">${s.trigger_condition}</div>
        <div class="metrics-sub">📊 ${s.metrics}</div>
      </td>
      <td>
        <div class="channel-text">${s.channel}</div>
        <div>${priorityBadge}</div>
      </td>
      <td><span class="status-pill">${statusBadge}</span></td>
      <td>
        <button class="btn-preview" onclick="showScenarioPreview('${s.id} · ${s.name}', '${s.channel}', '${cleanPreview}')">
          🔍 預覽
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderOrdersTable(orders) {
  const tbody = document.getElementById('orders-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">目前無待執行之下單指令 (持股續抱中)</td></tr>';
    return;
  }

  orders.forEach(o => {
    const tr = document.createElement('tr');
    const isBuy = o.action.toUpperCase() === 'BUY';
    tr.innerHTML = `
      <td><span class="badge ${isBuy ? 'badge-buy' : 'badge-sell'}">${o.action}</span></td>
      <td><strong>${o.symbol}</strong> <span class="stock-name">${o.name || ''}</span></td>
      <td>NT$ ${Number(o.price || 0).toFixed(2)}</td>
      <td>${Number(o.shares || 0).toLocaleString()} 股</td>
      <td>NT$ ${Number(o.amount || 0).toLocaleString()}</td>
      <td class="text-reason">${o.reason || '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

function renderTargetsTable(targets) {
  const tbody = document.getElementById('targets-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  targets.forEach(t => {
    const tr = document.createElement('tr');
    const gap = Number(t.gap_pct || 0);
    const gapClass = gap <= 2.0 ? 'gap-near' : 'gap-normal';
    tr.innerHTML = `
      <td><strong>${t.symbol}</strong></td>
      <td>${t.name}</td>
      <td>NT$ ${Number(t.current_price || 0).toFixed(2)}</td>
      <td>NT$ ${Number(t.target_price || 0).toFixed(2)}</td>
      <td class="${gapClass}">${gap.toFixed(2)}%</td>
      <td>${Number(t.yield_pct || 0).toFixed(2)}%</td>
      <td><span class="badge badge-watch">${t.zone || 'WATCH'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderSegmentsTable(segments) {
  const tbody = document.getElementById('segments-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  segments.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.name}</strong></td>
      <td>${s.role}</td>
      <td>NT$ ${Number(s.value || 0).toLocaleString()}</td>
      <td>${Number(s.actual || 0).toFixed(1)}%</td>
      <td>${Number(s.target || 0).toFixed(1)}%</td>
      <td class="${Math.abs(s.diff || 0) > 3.0 ? 'text-warn' : ''}">${Number(s.diff || 0) > 0 ? '+' : ''}${Number(s.diff || 0).toFixed(1)}%</td>
      <td><span class="badge badge-normal">${s.status || '穩定'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function getFallbackScenarios() {
  return [
    {
      "id": "SCENARIO-01",
      "name": "盤前/盤中買賣決策與下單指令",
      "timing": "每日 08:30 盤前 / 13:30 盤後",
      "trigger_condition": "多因子評分達標 (Score >= 80) 或 60分K回檔觸及支撐",
      "metrics": "進場價、停損價、建議股數、加碼金 (0050/006208/個股)",
      "channel": "LINE Official Bot / Email (SMTP)",
      "priority": "HIGH",
      "enabled": true,
      "preview": "【盤前下單指令】0050 觸發 60分K 加碼訊號，建議買進 269 股，目標價 185.5 元。"
    },
    {
      "id": "SCENARIO-02",
      "name": "高股息殖利率甜甜價與買點逼近",
      "timing": "每日盤後 15:00 / 股價回檔時",
      "trigger_condition": "核心高股息標的現價距目標買點差距 <= 2.5% 或 殖利率 >= 6.5%",
      "metrics": "現價 vs 目標價價差 %、預估年化殖利率、分批進場階梯",
      "channel": "LINE Official Bot / Email",
      "priority": "MEDIUM",
      "enabled": true,
      "preview": "【甜甜價預警】00878 現價 21.8 元，距超值買點僅差 1.2%，預估殖利率達 6.8%！"
    },
    {
      "id": "SCENARIO-03",
      "name": "除權息旺季與季節性日曆提醒",
      "timing": "除息前 3 日 / 前 1 日",
      "trigger_condition": "持股除息日倒數 <= 3 天，提示最後買進日與填息歷史機率",
      "metrics": "除息日、每股配息金額、單次殖利率、填息平均天數",
      "channel": "LINE Official Bot / Email",
      "priority": "MEDIUM",
      "enabled": true,
      "preview": "【除息提醒】00919 將於 3 日後除息，每股配發 0.72 元，年化殖利率 10.5%。"
    },
    {
      "id": "SCENARIO-04",
      "name": "股息入帳與自動再投資滾雪球",
      "timing": "每月 10 日 / 25 日 股息發放日",
      "trigger_condition": "股息入帳現金達門檻 (>= 10,000 元)，自動試算最佳再投資配置",
      "metrics": "累計入帳金額、推薦加碼標的 (0050 / 00713)、複利效益",
      "channel": "LINE Official Bot / Email",
      "priority": "MEDIUM",
      "enabled": true,
      "preview": "【股息再投資】本月股息入帳 $42,500 元，建議全數再投資滾入 006208 擴大複利。"
    },
    {
      "id": "SCENARIO-05",
      "name": "全市場融資維持率與情緒過熱/恐慌",
      "timing": "每日盤後 17:30 (三大法人與融資券數據更新)",
      "trigger_condition": "大盤融資維持率 < 140% (恐慌斷頭買點) 或 > 175% (過熱警戒)",
      "metrics": "全市場融資餘額增減、融資維持率%、外資期貨淨未平倉口數",
      "channel": "LINE Official Bot / Email",
      "priority": "HIGH",
      "enabled": true,
      "preview": "【市場情緒預警】大盤融資維持率降至 138.5% 進入恐慌斷頭區，浮現中長線右側買點！"
    },
    {
      "id": "SCENARIO-06",
      "name": "槓桿倍數壓力測試與質押維持率監控",
      "timing": "每日收盤 / 大盤急跌 > 2%",
      "trigger_condition": "質押維持率 < 180% (預警) 或 槓桿負債比 > 35%",
      "metrics": "當前維持率%、追繳緩衝價位、極端壓力測試最大跌幅承受度",
      "channel": "LINE (高優先緊急通知) / Email",
      "priority": "URGENT",
      "enabled": true,
      "preview": "【槓桿安全監控】目前質押維持率 245.8% (安全線以上)，具備承受大盤回檔 42% 之安全邊際。"
    },
    {
      "id": "SCENARIO-07",
      "name": "股債金資產配置偏離與動態再平衡",
      "timing": "每週日 20:00 / 偏離度超標即時",
      "trigger_condition": "核心配置 (股/債/金/現金) 任一比例偏離目標權重超過 ±5%",
      "metrics": "實際權重 vs 目標權重 (股65%/債20%/金15%)、需平衡調整金額",
      "channel": "LINE Official Bot / Email",
      "priority": "MEDIUM",
      "enabled": true,
      "preview": "【再平衡提醒】黃金 (AU9901) 因金價大漲占比達 18.2% (偏離 +3.2%)，建議調節轉入美債。"
    },
    {
      "id": "SCENARIO-08",
      "name": "總淨值創歷史新高 (ATH) 與 Alpha 超額報酬",
      "timing": "每日盤後淨值結算 16:30",
      "trigger_condition": "總資產淨值突破歷史高點 或 YTD 報酬超越 0050 基準 >= 3.0%",
      "metrics": "最新總淨值、歷史新高幅度%、YTD 績效 vs 0050 Benchmark、Alpha %",
      "channel": "LINE Official Bot / Email",
      "priority": "INFO",
      "enabled": true,
      "preview": "【資產里程碑】總淨值達 NT$ 12,850,000 創歷史新高！YTD +18.5% 擊敗大盤 +4.3% Alpha！"
    },
    {
      "id": "SCENARIO-09",
      "name": "退休金達標里程碑與 4% 提領率進度",
      "timing": "每月 1 日 09:00",
      "trigger_condition": "每月定期檢視財務自由金達標率 (進度每提升 5% 觸發特別推播)",
      "metrics": "目標退休金 NT$ 15,000,000、當前覆蓋率 93.8%、SWR 安全提領金額",
      "channel": "LINE Official Bot / Email",
      "priority": "INFO",
      "enabled": true,
      "preview": "【退休進度報告】財務自由基金已達 93.8%，按 4% 提領法則預估每年可產生 $51.4 萬被動現金流！"
    },
    {
      "id": "SCENARIO-10",
      "name": "每日盤後定時自動分析報告產出 (Format 1)",
      "timing": "每日 16:30 (定時排程)",
      "trigger_condition": "定時自動分析排程完成全資產體檢、XQ 數據爬取與回測驗證",
      "metrics": "完整 Format 1 HTML 報告、Vercel 公開部署 URL、推播執行日誌",
      "channel": "LINE Official Bot / Email / Vercel Web",
      "priority": "INFO",
      "enabled": true,
      "preview": "【每日體檢完成】今日全資產 Format 1 報告已更新發布至 Vercel 雲端，請點擊連結查閱完整圖表。"
    }
  ];
}

function getFallbackData() {
  return {
    "report_date": new Date().toLocaleString('zh-TW', { hour12: false }),
    "macro_gate": "SAFE_MODE",
    "kpis": {
      "net_worth": 12850000,
      "portfolio_ytd_pct": 18.5,
      "benchmark_0050_ytd_pct": 14.2,
      "alpha_pct": 4.3,
      "ytd_dividends": 425000,
      "topup_progress_pct": 82.5,
      "retirement_progress_pct": 93.8
    },
    "manager_summary": "多頭格局持續，總體經濟處於安全模式 (SAFE_MODE)。建議維持加碼核心高股息與美股指數，把握回檔甜甜價分批建立部位。",
    "actionable_orders": [
      {
        "action": "BUY",
        "symbol": "0050",
        "name": "元大台灣50",
        "price": 185.5,
        "shares": 269,
        "amount": 50000,
        "reason": "60分K回檔支撐加碼"
      }
    ],
    "buy_targets": [
      {
        "symbol": "00878",
        "name": "國泰永續高股息",
        "current_price": 21.8,
        "target_price": 21.5,
        "gap_pct": 1.4,
        "yield_pct": 6.8,
        "zone": "甜甜價區間"
      },
      {
        "symbol": "00713",
        "name": "元大台灣高息低波",
        "current_price": 54.2,
        "target_price": 53.0,
        "gap_pct": 2.2,
        "yield_pct": 6.5,
        "zone": "觀察名單"
      }
    ],
    "segments": [
      {
        "name": "核心被動收息 (Segment A)",
        "role": "穩定現金流引擎",
        "value": 4500000,
        "actual": 35.0,
        "target": 35.0,
        "diff": 0.0,
        "status": "穩定"
      },
      {
        "name": "市值成長型 (Segment B)",
        "role": "0050/006208 資本利得",
        "value": 3850000,
        "actual": 30.0,
        "target": 30.0,
        "diff": 0.0,
        "status": "穩定"
      },
      {
        "name": "避險防禦資產 (Segment C)",
        "role": "美債/現金流保護",
        "value": 2600000,
        "actual": 20.2,
        "target": 20.0,
        "diff": 0.2,
        "status": "微幅超標"
      },
      {
        "name": "抗通膨黃金 (Segment D)",
        "role": "AU9901 實體金避險",
        "value": 1900000,
        "actual": 14.8,
        "target": 15.0,
        "diff": -0.2,
        "status": "適當配置"
      }
    ]
  };
}
