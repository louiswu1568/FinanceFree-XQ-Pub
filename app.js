// FinanceFree-XQ-Pub (Okinawa 2026 Glassmorphism Controller)
// Renders Real Financial Data, 4 Accounts, 10 Scenarios & Live KPIs

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModal();
  loadReportData();
});

function initTabs() {
  const pills = document.querySelectorAll('.nav-pill');
  const panes = document.querySelectorAll('.tab-pane');

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      panes.forEach(pane => pane.classList.remove('active'));

      pill.classList.add('active');
      const target = pill.getAttribute('data-tab');
      const targetEl = document.getElementById(target);
      if (targetEl) targetEl.classList.add('active');
    });
  });
}

function initModal() {
  const modal = document.getElementById('preview-modal');
  const closeBtn = document.getElementById('modal-close');
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => {
      if (e.target === modal) modal.style.display = 'none';
    });
  }
}

window.showScenarioPreview = function(id, name, channel, previewText) {
  const modal = document.getElementById('preview-modal');
  const idEl = document.getElementById('modal-id');
  const titleEl = document.getElementById('modal-title');
  const channelEl = document.getElementById('modal-channel');
  const contentEl = document.getElementById('modal-content');
  if (modal && idEl && titleEl && channelEl && contentEl) {
    idEl.textContent = id;
    titleEl.textContent = name;
    channelEl.textContent = channel;
    contentEl.textContent = previewText;
    modal.style.display = 'flex';
  }
};

async function loadReportData() {
  try {
    const res = await fetch('./data/latest_report.json?t=' + Date.now());
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    renderAll(data);
  } catch (err) {
    console.warn('Loading latest_report.json failed, using real embedded fallback:', err);
    renderAll(getRealFallbackData());
  }
}

function renderAll(data) {
  // 1. Meta
  if (data.report_date) document.getElementById('meta-date').textContent = data.report_date;
  if (data.macro_gate) document.getElementById('meta-gate').textContent = `${data.macro_gate} (防禦加碼)`;
  if (data.market_regime) document.getElementById('meta-regime').textContent = `${data.market_regime} (高檔整理)`;

  // 2. KPIs
  if (data.kpis) {
    const k = data.kpis;
    document.getElementById('kpi-net-worth').textContent = `NT$ ${Number(k.net_worth || 8058475).toLocaleString()}`;
    const cov = Number(k.goal_coverage_pct || 32.23).toFixed(2);
    document.getElementById('kpi-coverage').textContent = `${cov}%`;
    document.getElementById('kpi-progress-bar').style.width = `${Math.min(100, cov)}%`;
    
    document.getElementById('kpi-port-a-pnl').textContent = `+NT$ ${Number(k.port_a_pnl || 175527).toLocaleString()}`;
    document.getElementById('kpi-gold-pct').textContent = `${Number(k.gold_pct || 20.83).toFixed(2)}%`;
    document.getElementById('kpi-goal-year').textContent = `${k.estimated_goal_year || 2037} 年`;
  }

  // 3. CIO Summary
  if (data.cio_summary) {
    document.getElementById('cio-summary-text').textContent = data.cio_summary;
  }

  // 4. Accounts Overview Table
  renderAccountsTable(data.portfolios_overview || []);

  // 5. Scenarios Table (10 Scenarios)
  renderScenariosTable(data.alert_scenarios || []);

  // 6. Buy Targets Table
  renderTargetsTable(data.buy_targets || []);

  // 7. Holdings in Portfolio A Table
  renderHoldingsTable(data.holdings_a || []);
}

function renderAccountsTable(accounts) {
  const tbody = document.getElementById('accounts-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  accounts.forEach(a => {
    const tr = document.createElement('tr');
    const isGain = (a.pnl || 0) >= 0;
    tr.innerHTML = `
      <td><span class="scenario-tag">${a.code}</span></td>
      <td><strong>${a.name}</strong></td>
      <td><span class="sub-metrics">${a.role}</span></td>
      <td><strong>NT$ ${Number(a.value || 0).toLocaleString()}</strong></td>
      <td>${Number(a.weight_pct || 0).toFixed(1)}%</td>
      <td class="${isGain ? 'positive' : 'warning'}">
        <strong>${isGain ? '+' : ''}NT$ ${Number(a.pnl || 0).toLocaleString()}</strong> 
        (${Number(a.pnl_pct || 0) > 0 ? '+' : ''}${Number(a.pnl_pct || 0).toFixed(2)}%)
      </td>
      <td><span class="badge ${isGain ? 'badge-safe' : 'badge-caution'}">${a.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderScenariosTable(scenarios) {
  const tbody = document.getElementById('scenarios-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  scenarios.forEach(s => {
    const tr = document.createElement('tr');
    let priorityBadge = '<span class="badge badge-safe">INFO</span>';
    if (s.priority === 'HIGH') priorityBadge = '<span class="badge badge-warn">HIGH</span>';
    if (s.priority === 'URGENT') priorityBadge = '<span class="badge badge-warn">URGENT</span>';
    if (s.priority === 'MEDIUM') priorityBadge = '<span class="badge badge-caution">MEDIUM</span>';

    const cleanPreview = (s.preview || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    tr.innerHTML = `
      <td><span class="scenario-tag">${s.id}</span></td>
      <td><strong>${s.name}</strong></td>
      <td><span class="time-tag">⏰ ${s.timing}</span></td>
      <td>
        <div class="cond-text">${s.trigger_condition}</div>
        <div class="sub-metrics">📊 ${s.metrics}</div>
      </td>
      <td>
        <div style="font-size:0.8rem; margin-bottom:3px;">${s.channel}</div>
        <div>${priorityBadge}</div>
      </td>
      <td><span class="pulse-badge"><span class="pulse-dot"></span> 監控中</span></td>
      <td>
        <button class="btn-preview" onclick="showScenarioPreview('${s.id}', '${s.name}', '${s.channel}', '${cleanPreview}')">
          🔍 預覽
        </button>
      </td>
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
    tr.innerHTML = `
      <td><strong>${t.symbol}</strong></td>
      <td>${t.name}</td>
      <td><strong>NT$ ${Number(t.current_price || 0).toFixed(2)}</strong></td>
      <td>NT$ ${Number(t.target_price || 0).toFixed(2)}</td>
      <td class="${gap <= 5.0 ? 'warning' : ''}">${gap.toFixed(2)}%</td>
      <td class="positive"><strong>${Number(t.yield_pct || 0).toFixed(2)}%</strong></td>
      <td><span class="badge badge-safe">${t.zone}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function renderHoldingsTable(holdings) {
  const tbody = document.getElementById('holdings-table-body');
  if (!tbody) return;
  tbody.innerHTML = '';

  holdings.forEach(h => {
    const tr = document.createElement('tr');
    const isGain = (h.pnl || 0) >= 0;
    tr.innerHTML = `
      <td><strong>${h.symbol}</strong></td>
      <td>${h.name}</td>
      <td>${Number(h.shares || 0).toLocaleString()} ${h.unit || '股'}</td>
      <td>NT$ ${Number(h.price || 0).toFixed(2)}</td>
      <td>NT$ ${Number(h.cost_basis || 0).toFixed(2)}</td>
      <td><strong>NT$ ${Number(h.market_value || 0).toLocaleString()}</strong></td>
      <td class="${isGain ? 'positive' : 'warning'}">
        ${isGain ? '+' : ''}NT$ ${Number(h.pnl || 0).toLocaleString()}
      </td>
      <td class="${isGain ? 'positive' : 'warning'}">
        <strong>${isGain ? '+' : ''}${Number(h.pnl_pct || 0).toFixed(2)}%</strong>
      </td>
      <td><span class="badge badge-safe">${h.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function getRealFallbackData() {
  return {
    "report_date": "2026-09-09 18:34",
    "macro_gate": "CAUTION",
    "market_regime": "OVERVALUED",
    "kpis": {
      "net_worth": 8058475,
      "asset_goal": 25000000,
      "gap_to_goal": 16941525,
      "goal_coverage_pct": 32.23,
      "estimated_goal_year": 2037,
      "gold_pct": 20.83,
      "port_a_pnl": 175527,
      "port_a_pnl_pct": 13.57
    },
    "cio_summary": "總體經濟維持 CAUTION 謹慎防禦模式。主力帳戶 A 獲利 +13.57%（0050 獲利 +17.7%、正2 獲利 +17.4%）。實體黃金因金價大漲現值達 20.83% 超過 12% 配置上限，觸發 REBALANCE_SELL 再平衡調節訊號。",
    "portfolios_overview": [
      {
        "code": "PORT-A",
        "name": "永豐金證券主力帳戶",
        "role": "台股核心指數與實體黃金",
        "value": 1469468,
        "pnl": 175527,
        "pnl_pct": 13.57,
        "weight_pct": 18.2,
        "status": "強勢獲利 (+13.6%)"
      },
      {
        "code": "PORT-B",
        "name": "基富通基金專戶",
        "role": "全球基金定期定額儲蓄",
        "value": 114230,
        "pnl": -159,
        "pnl_pct": -0.14,
        "weight_pct": 1.4,
        "status": "持平穩定"
      },
      {
        "code": "PORT-C",
        "name": "第一銀行海外複委託",
        "role": "美股大盤指數成長",
        "value": 162458,
        "pnl": 13355,
        "pnl_pct": 8.96,
        "weight_pct": 2.0,
        "status": "穩健成長 (+9.0%)"
      },
      {
        "code": "PORT-D",
        "name": "加密貨幣與衛星實驗",
        "role": "高波動衛星避險",
        "value": 17521,
        "pnl": -13814,
        "pnl_pct": -44.08,
        "weight_pct": 0.2,
        "status": "整理回檔"
      }
    ],
    "holdings_a": [
      {
        "symbol": "0050",
        "name": "元大台灣50",
        "shares": 8000,
        "unit": "股",
        "price": 109.65,
        "cost_basis": 93.15,
        "market_value": 877200,
        "pnl": 132000,
        "pnl_pct": 17.71,
        "status": "核心持股續抱"
      },
      {
        "symbol": "00403A",
        "name": "富邦台50正2",
        "shares": 28000,
        "unit": "股",
        "price": 10.47,
        "cost_basis": 8.92,
        "market_value": 293160,
        "pnl": 43400,
        "pnl_pct": 17.38,
        "status": "槓桿波段獲利中"
      },
      {
        "symbol": "AU9901",
        "name": "台銀實體黃金條塊",
        "shares": 18,
        "unit": "台錢",
        "price": 16610,
        "cost_basis": 16610.06,
        "market_value": 298980,
        "pnl": -1,
        "pnl_pct": 0.0,
        "status": "實體金避險 (超標需再平衡)"
      }
    ],
    "buy_targets": [
      { "symbol": "0056", "name": "元大高股息", "current_price": 55.75, "target_price": 52.0, "gap_pct": 7.21, "yield_pct": 6.85, "zone": "觀察名單" },
      { "symbol": "00878", "name": "國泰永續高股息", "current_price": 34.08, "target_price": 32.5, "gap_pct": 4.86, "yield_pct": 6.42, "zone": "觀察名單" },
      { "symbol": "00918", "name": "大華優利高填息30", "current_price": 35.44, "target_price": 33.8, "gap_pct": 4.85, "yield_pct": 7.15, "zone": "觀察名單" },
      { "symbol": "00919", "name": "群益台灣精選高息", "current_price": 32.70, "target_price": 31.0, "gap_pct": 5.48, "yield_pct": 8.81, "zone": "觀察名單" },
      { "symbol": "0050", "name": "元大台灣50", "current_price": 109.65, "target_price": 95.0, "gap_pct": 15.42, "yield_pct": 3.20, "zone": "續抱中 (+17.7%)" },
      { "symbol": "AU9901", "name": "台銀實體黃金條塊", "current_price": 16610.0, "target_price": 15000.0, "gap_pct": 10.73, "yield_pct": 0.0, "zone": "獲利再平衡" }
    ],
    "alert_scenarios": []
  };
}
