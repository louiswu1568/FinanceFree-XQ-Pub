// FinanceFree-XQ Format 1 HTML Report Viewer Logic
let reportData = null;

const DEFAULT_ALERTS = [
  { cat: "💰 交易訊息", name: "🎯 場景 1：每日待確認委託與決策", timing: "每日 14:00 盤後分析產出", cond: "出現 STRONG_BUY / STRATEGIC_EXIT 或佇列有單", tab: "今日決策" },
  { cat: "💰 交易訊息", name: "🍯 場景 2：殖利率甜蜜點與目標價", timing: "盤中定時更新 或 盤後分析", cond: "現價距目標價 ≤ 3.0% 或殖利率 ≥ 6.0%", tab: "買入目標價" },
  { cat: "💰 交易訊息", name: "📅 場景 3：除息前夕與淡旺季佈局", timing: "除息日前 7 天 或 每月初切換", cond: "核心 ETF 進入除息前 7~10 天或季節淡季築底", tab: "進場時機" },
  { cat: "💰 交易訊息", name: "💵 場景 4：股息入帳與再投入通知", timing: "股息入帳日 或 現金累積達標", cond: "股息撥入銀行，或現金累積達 51.5萬 TopUp 目標", tab: "被動收入" },
  { cat: "📈 市場訊息", name: "🌡️ 場景 5：市場融資維持率極端預警", timing: "每日 15:30 交易所籌碼公佈", cond: "融資維持率 < 140% (撿鑽石) 或 > 175% (過熱警戒)", tab: "風控狀態" },
  { cat: "📈 市場訊息", name: "⚠️ 場景 6：槓桿壓力與負債水位警報", timing: "盤後結算 或 大盤單日重挫 ≥2%", cond: "房貸維持率逼近 130% 防線，或負債比率 (LTV) 超標", tab: "風控狀態" },
  { cat: "📈 市場訊息", name: "⚖️ 場景 7：投組偏離與黃金再平衡", timing: "每季末 (3/6/9/12月) 或即時", cond: "黃金 (AU9901) 佔比偏離 12% 閥值，或四大投組偏離 ±5%", tab: "四大投組" },
  { cat: "⚙️ 系統里程碑", name: "💎 場景 8：資產淨值新高與 Alpha 月報", timing: "淨值創新高當日 或 每月 1 號", cond: "個人總資產淨值創歷史新高 (ATH) 或超額回報 Alpha", tab: "績效追蹤" },
  { cat: "⚙️ 系統里程碑", name: "🎉 場景 9：4%提領率退休里程碑達成", timing: "每月月報結算 或 資本突破門檻", cond: "被動收入覆蓋率或退休達成率跨越 50%, 75%, 100%", tab: "退休規劃" },
  { cat: "⚙️ 系統里程碑", name: "📑 場景 10：完整投資分析報告產出", timing: "每日 14:00 或 週日 20:00", cond: "每日盤後分析完成、或週日全資產總體健康檢查產出", tab: "完整報告" }
];

function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
  const target = document.getElementById(tabId);
  if (target) target.style.display = 'block';

  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));
  const btn = Array.from(document.querySelectorAll('.nav-tab')).find(b => b.getAttribute('onclick')?.includes(tabId));
  if (btn) btn.classList.add('active');

  window.location.hash = tabId.replace('tab-', '');
}

function formatCurrency(num) {
  if (num === null || num === undefined || isNaN(num)) return 'NT$ 0';
  return 'NT$ ' + Number(num).toLocaleString('zh-TW', { maximumFractionDigits: 0 });
}

function formatPercent(num, withSign = false) {
  if (num === null || num === undefined || isNaN(num)) return '0.00%';
  const val = Number(num);
  const sign = withSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
}

function renderReport(data) {
  reportData = data;

  // Header & Meta
  if (data.report_date) {
    document.getElementById('headerDatePill').innerText = `📅 報告時間：${data.report_date}`;
  }
  if (data.macro_gate) {
    const macroPill = document.getElementById('headerMacroPill');
    macroPill.innerText = `🛡️ 風控狀態：${data.macro_gate}`;
    macroPill.className = `pill ${data.macro_gate === 'BLOCK' ? 'pill-red' : data.macro_gate === 'CAUTION' ? 'pill-yellow' : 'pill-green'}`;
  }

  // KPIs
  if (data.kpis) {
    const k = data.kpis;
    document.getElementById('kpiNetWorth').innerText = formatCurrency(k.net_worth || k.total_assets);
    document.getElementById('kpiYtdReturn').innerText = formatPercent(k.portfolio_ytd_pct, true);
    document.getElementById('kpiAlphaSub').innerText = `0050 同期 Alpha 超額: ${formatPercent(k.alpha_pct, true)}`;
    document.getElementById('kpiDividends').innerText = formatCurrency(k.ytd_dividends);
    document.getElementById('kpiTopUpSub').innerText = `年度 51.5 萬 TopUp 進度: ${formatPercent(k.topup_progress_pct)}`;
    document.getElementById('kpiRetirement').innerText = formatPercent(k.retirement_progress_pct);
  }

  // Manager Summary
  if (data.manager_summary) {
    document.getElementById('managerSummaryText').innerText = data.manager_summary;
  }

  // Actionable Orders Table
  const ordersBody = document.getElementById('ordersTableBody');
  const orders = data.actionable_orders || data.orders || [];
  document.getElementById('orderCountBadge').innerText = `共 ${orders.length} 筆委託單`;

  if (orders.length > 0) {
    ordersBody.innerHTML = orders.map(o => `
      <tr>
        <td><span class="pill ${o.action.includes('BUY') ? 'pill-green' : 'pill-red'}">${o.action}</span></td>
        <td><strong>${o.symbol}</strong> <span style="color:var(--text-muted)">${o.name || ''}</span></td>
        <td class="text-right mono">${formatCurrency(o.price || o.current_price)}</td>
        <td class="text-right mono" style="color:var(--green)">${formatCurrency(o.amount || o.suggested_amount)}</td>
        <td class="text-right mono">${(o.shares || o.suggested_shares || 0).toLocaleString()} 股</td>
        <td style="color:var(--text-muted);font-size:0.75rem">${o.reason || (o.reasons || []).join('、') || '經理人模型觸發'}</td>
      </tr>
    `).join('');
  } else {
    ordersBody.innerHTML = `<tr><td colspan="6" class="text-center" style="color:var(--text-muted);padding:24px;">今日無觸發實體買賣動作，維持現有高勝率持股配置。</td></tr>`;
  }

  // Portfolio Segments
  const segBody = document.getElementById('portfolioSegmentsBody');
  const segments = data.segments || [
    { name: "投組 A：核心被動高息", role: "高股息現金流錨定", value: 4500000, actual: 36.0, target: 35.0, diff: 1.0, status: "正常穩健" },
    { name: "投組 B：全球指數成長", role: "0050 / 006208 資本利得", value: 3800000, actual: 30.4, target: 30.0, diff: 0.4, status: "正常穩健" },
    { name: "投組 C：債券防禦資產", role: "美債 / 投資級債券保護", value: 2500000, actual: 20.0, target: 20.0, diff: 0.0, status: "防守就緒" },
    { name: "投組 D：黃金與流動性", role: "AU9901 實體避險錨", value: 1700000, actual: 13.6, target: 15.0, diff: -1.4, status: "適度配置" }
  ];
  segBody.innerHTML = segments.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td style="color:var(--text-muted)">${s.role || ''}</td>
      <td class="text-right mono">${formatCurrency(s.value)}</td>
      <td class="text-right mono">${formatPercent(s.actual)}</td>
      <td class="text-right mono" style="color:var(--text-muted)">${formatPercent(s.target)}</td>
      <td class="text-right mono ${s.diff >= 0 ? 'green' : 'yellow'}">${formatPercent(s.diff, true)}</td>
      <td class="text-center"><span class="pill pill-green">${s.status || '正常'}</span></td>
    </tr>
  `).join('');

  // Gold Status
  if (data.gold) {
    document.getElementById('goldPctText').innerText = formatPercent(data.gold.pct || 12.0);
    document.getElementById('goldActionText').innerText = data.gold.action || '維持現狀';
  }

  // Targets
  const targetsBody = document.getElementById('targetsTableBody');
  const targets = data.buy_targets || [];
  if (targets.length > 0) {
    targetsBody.innerHTML = targets.map(t => `
      <tr>
        <td><strong>${t.symbol}</strong> <span style="color:var(--text-muted)">${t.name || ''}</span></td>
        <td class="text-right mono">${formatCurrency(t.current_price)}</td>
        <td class="text-right mono yellow">${formatCurrency(t.target_price)}</td>
        <td class="text-right mono ${t.gap_pct <= 3 ? 'green' : 'yellow'}">${formatPercent(t.gap_pct)}</td>
        <td class="text-right mono green">${formatPercent(t.yield_pct)}</td>
        <td class="text-center"><span class="pill ${t.gap_pct <= 3 ? 'pill-green' : 'pill-blue'}">${t.gap_pct <= 3 ? '甜蜜點買進' : '觀察區間'}</span></td>
      </tr>
    `).join('');
  }

  // Alerts Table
  const alertsBody = document.getElementById('alertsTableBody');
  alertsBody.innerHTML = DEFAULT_ALERTS.map(a => `
    <tr>
      <td style="font-weight:600;color:var(--green)">${a.cat}</td>
      <td><strong>${a.name}</strong></td>
      <td style="color:#cbd5e1">${a.timing}</td>
      <td style="color:var(--text-muted)">${a.cond}</td>
      <td class="text-center"><span class="pill pill-blue">${a.tab}</span></td>
    </tr>
  `).join('');

  // Retirement
  if (data.retirement) {
    const r = data.retirement;
    document.getElementById('retireTargetCapital').innerText = formatCurrency(r.target_capital || 15000000);
    document.getElementById('retireCurrentCapital').innerText = formatCurrency(r.current_savings || data.kpis?.net_worth);
    document.getElementById('retireSWRPercent').innerText = formatPercent(r.coverage_pct || 93.8);
  }
}

// Check URL hash on load
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash.replace('#', '');
  if (hash) {
    switchTab(`tab-${hash}`);
  }

  // Load latest_report.json
  fetch('data/latest_report.json')
    .then(r => r.json())
    .then(data => renderReport(data))
    .catch(() => {
      // Fallback sample data if standalone
      renderReport({
        report_date: new Date().toISOString().split('T')[0],
        macro_gate: "SAFE_MODE",
        kpis: {
          net_worth: 12850000,
          portfolio_ytd_pct: 18.5,
          alpha_pct: 4.3,
          ytd_dividends: 425000,
          topup_progress_pct: 82.5,
          retirement_progress_pct: 85.6
        },
        manager_summary: "大盤維持多頭健康整理格局，總經風控處於安全模式 (SAFE_MODE)。建議維持金字塔定期定額紀律，鎖定高股息與指數型 ETF 穩健複利！",
        actionable_orders: [
          { action: "STRONG_BUY", symbol: "0050", name: "元大台灣50", price: 185.5, amount: 50000, shares: 269, reason: "60日負乖離率達 -8.2%，進入第一批金字塔買點" },
          { action: "WATCH_BUY", symbol: "00878", name: "國泰永續高股息", price: 22.5, amount: 30000, shares: 1333, reason: "預估年化殖利率 6.8%，進入甜蜜點區間" }
        ],
        gold: { pct: 12.0, action: "維持現狀" }
      });
    });
});
