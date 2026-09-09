// FinanceFree-XQ-Pub (Okinawa 2026 Glassmorphism Controller & AES-256 Vault)
// Client-Side Zero-Knowledge Decryption & Dynamic LINE 1-Click Access Engine

let currentRawData = null;

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initModal();
  initVaultUI();
  initDashboardAuth();
});

/* ==========================================
   1. Tabs & Scenario Preview Modal
   ========================================== */
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

/* ==========================================
   2. Web Crypto API: AES-256-GCM Engine
   ========================================== */
function base64ToUint8Array(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function deriveKeyFromPasskey(passkey) {
  const enc = new TextEncoder();
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', enc.encode(passkey.trim()));
  return await window.crypto.subtle.importKey(
    'raw',
    hashBuffer,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
}

async function decryptReportPayload(encObj, passkey) {
  if (!encObj || !encObj.encrypted) {
    return encObj; // Plaintext format
  }
  try {
    const cryptoKey = await deriveKeyFromPasskey(passkey);
    const iv = base64ToUint8Array(encObj.iv);
    const ciphertext = base64ToUint8Array(encObj.ciphertext);
    const decryptedBuf = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv, tagLength: 128 },
      cryptoKey,
      ciphertext
    );
    const dec = new TextDecoder('utf-8');
    return JSON.parse(dec.decode(decryptedBuf));
  } catch (err) {
    console.error('Decryption failed with provided passkey:', err);
    throw new Error('DECRYPTION_FAILED');
  }
}

/* ==========================================
   3. Security Vault Auth & Session Management
   ========================================== */
function initVaultUI() {
  // LINE Application Modal Handlers (方案 B)
  const openLineBtn = document.getElementById('btn-open-line-apply');
  const lineModal = document.getElementById('line-apply-modal');
  const closeLineBtn = document.getElementById('btn-close-line-modal');
  const cancelLineBtn = document.getElementById('btn-cancel-line-modal');

  if (openLineBtn && lineModal) {
    openLineBtn.addEventListener('click', () => {
      lineModal.style.display = 'flex';
    });
  }
  if (closeLineBtn && lineModal) {
    closeLineBtn.addEventListener('click', () => {
      lineModal.style.display = 'none';
    });
  }
  if (cancelLineBtn && lineModal) {
    cancelLineBtn.addEventListener('click', () => {
      lineModal.style.display = 'none';
    });
  }
  window.addEventListener('click', (e) => {
    if (e.target === lineModal) lineModal.style.display = 'none';
  });

  const unlockBtn = document.getElementById('btn-vault-unlock');
  const passInput = document.getElementById('vault-passkey-input');
  const toggleEye = document.getElementById('vault-toggle-visibility');

  if (toggleEye && passInput) {
    toggleEye.addEventListener('click', () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleEye.textContent = '🔒';
      } else {
        passInput.type = 'password';
        toggleEye.textContent = '👁️';
      }
    });
  }

  if (unlockBtn && passInput) {
    unlockBtn.addEventListener('click', () => {
      handleManualUnlock(passInput.value);
    });

    passInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handleManualUnlock(passInput.value);
      }
    });
  }
}

async function handleManualUnlock(passkey) {
  const errorMsg = document.getElementById('vault-error-msg');
  const passInput = document.getElementById('vault-passkey-input');
  if (!passkey || !passkey.trim()) {
    if (errorMsg) {
      errorMsg.textContent = '⚠️ 請輸入金庫通行密鑰！';
      errorMsg.style.display = 'block';
    }
    return;
  }

  try {
    if (!currentRawData) {
      currentRawData = await fetchReportJson();
    }

    const decrypted = await decryptReportPayload(currentRawData, passkey.trim());
    sessionStorage.setItem('ff_auth_key', passkey.trim());
    hideVaultModal();
    updateVaultStatusUI(true);
    renderAll(decrypted);
  } catch (err) {
    if (errorMsg) {
      errorMsg.textContent = '⚠️ 密鑰錯誤，無法解密資產金庫，請重新確認！';
      errorMsg.style.display = 'block';
    }
    if (passInput) {
      passInput.focus();
      passInput.select();
    }
  }
}

function showVaultModal(errorMessage = null) {
  const modal = document.getElementById('vault-modal');
  const errorMsg = document.getElementById('vault-error-msg');
  const passInput = document.getElementById('vault-passkey-input');

  if (errorMsg) {
    if (errorMessage) {
      errorMsg.textContent = errorMessage;
      errorMsg.style.display = 'block';
    } else {
      errorMsg.style.display = 'none';
    }
  }

  if (modal) {
    modal.style.display = 'flex';
  }
  if (passInput) {
    setTimeout(() => passInput.focus(), 100);
  }
  updateVaultStatusUI(false);
}

function hideVaultModal() {
  const modal = document.getElementById('vault-modal');
  if (modal) modal.style.display = 'none';
}

function updateVaultStatusUI(isUnlocked) {
  const badge = document.getElementById('vault-status-badge');
  if (!badge) return;

  if (isUnlocked) {
    badge.className = 'badge vault-badge-unlocked';
    badge.textContent = '🔐 金庫已解鎖';
    badge.setAttribute('title', '已通過身分驗證 · 點擊可重新鎖定');
  } else {
    badge.className = 'badge vault-badge-locked';
    badge.textContent = '🔒 金庫未解鎖';
    badge.setAttribute('title', '點擊可輸入密鑰解鎖');
  }
}

window.promptRelock = function() {
  const currentKey = sessionStorage.getItem('ff_auth_key');
  if (currentKey) {
    if (confirm('是否要重新鎖定安全金庫？\n鎖定後將清除本機暫存金鑰並返回密碼驗證畫面。')) {
      sessionStorage.removeItem('ff_auth_key');
      showVaultModal();
    }
  } else {
    showVaultModal();
  }
};

/* ==========================================
   4. Report Fetch & Decryption Pipeline
   ========================================== */
async function fetchReportJson() {
  const urlParams = new URLSearchParams(window.location.search);
  const archiveFile = urlParams.get('archive');
  let fetchUrl = './data/latest_report.json?t=' + Date.now();

  if (archiveFile) {
    fetchUrl = './data/archive/' + encodeURIComponent(archiveFile) + '?t=' + Date.now();
    const banner = document.createElement('div');
    banner.style.cssText = 'background: rgba(245, 158, 11, 0.2); border: 1px solid #fbbf24; color: #fbbf24; padding: 10px 20px; border-radius: 12px; margin-bottom: 20px; text-align: center; font-weight: 600; font-size: 0.9rem;';
    banner.innerHTML = `⚠️ 正在瀏覽歷史存檔報告：<strong>${archiveFile}</strong> · <a href="./" style="color:#38bdf8; text-decoration:underline; margin-left:10px;">返回最新即時體檢</a>`;
    const container = document.querySelector('.glass-container');
    if (container && !document.getElementById('archive-banner')) {
      banner.id = 'archive-banner';
      container.insertBefore(banner, container.firstChild.nextSibling);
    }
  }

  const res = await fetch(fetchUrl);
  if (!res.ok) throw new Error(`HTTP error ${res.status}`);
  return await res.json();
}

async function initDashboardAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('auth') || urlParams.get('key') || urlParams.get('token');

  // If token present in URL, cache it into sessionStorage & clean URL
  if (urlToken && urlToken.trim()) {
    sessionStorage.setItem('ff_auth_key', urlToken.trim());
    // Clean auth from URL query without reloading
    urlParams.delete('auth');
    urlParams.delete('key');
    urlParams.delete('token');
    const newQuery = urlParams.toString() ? '?' + urlParams.toString() : '';
    window.history.replaceState({}, document.title, window.location.pathname + newQuery + window.location.hash);
  }

  const sessionKey = sessionStorage.getItem('ff_auth_key');

  try {
    currentRawData = await fetchReportJson();

    if (!currentRawData.encrypted) {
      // Plaintext format
      renderAll(currentRawData);
      updateVaultStatusUI(true);
      return;
    }

    // Encrypted payload requires passkey
    if (sessionKey) {
      try {
        const decrypted = await decryptReportPayload(currentRawData, sessionKey);
        hideVaultModal();
        updateVaultStatusUI(true);
        renderAll(decrypted);
        return;
      } catch (e) {
        console.warn('Session passkey failed to decrypt, showing unlock dialog:', e);
        sessionStorage.removeItem('ff_auth_key');
        showVaultModal('⚠️ 上次儲存之密鑰已失效或有誤，請重新輸入！');
      }
    } else {
      // No key available -> Show Vault Unlock Modal
      showVaultModal();
    }
  } catch (err) {
    console.error('Failed to load report payload:', err);
    showVaultModal('❌ 無法連線載入報告數據，請稍後重試。');
  }
}

/* ==========================================
   5. Dashboard Component Renderers
   ========================================== */
function renderAll(data) {
  if (!data) return;

  // 1. Meta
  if (data.report_date) {
    const el = document.getElementById('meta-date');
    if (el) el.textContent = data.report_date;
  }
  if (data.macro_gate) {
    const el = document.getElementById('meta-gate');
    if (el) el.textContent = `${data.macro_gate} (${data.macro_gate_desc || '防禦加碼'})`;
  }
  if (data.market_regime) {
    const el = document.getElementById('meta-regime');
    if (el) el.textContent = `${data.market_regime} (${data.market_regime_desc || '高檔整理'})`;
  }

  // 2. KPIs
  if (data.kpis) {
    const k = data.kpis;
    const netWorthEl = document.getElementById('kpi-net-worth');
    if (netWorthEl) netWorthEl.textContent = `NT$ ${Number(k.net_worth || 8058475).toLocaleString()}`;
    
    const cov = Number(k.goal_coverage_pct || 32.23).toFixed(2);
    const covEl = document.getElementById('kpi-coverage');
    if (covEl) covEl.textContent = `${cov}%`;

    const progBar = document.getElementById('kpi-progress-bar');
    if (progBar) progBar.style.width = `${Math.min(100, cov)}%`;
    
    const pnlEl = document.getElementById('kpi-port-a-pnl');
    if (pnlEl) pnlEl.textContent = `+NT$ ${Number(k.port_a_pnl || 175527).toLocaleString()}`;

    const goldEl = document.getElementById('kpi-gold-pct');
    if (goldEl) goldEl.textContent = `${Number(k.gold_pct || 20.83).toFixed(2)}%`;

    const goalYearEl = document.getElementById('kpi-goal-year');
    if (goalYearEl) goalYearEl.textContent = `${k.estimated_goal_year || 2037} 年`;
  }

  // 3. CIO Summary
  if (data.cio_summary) {
    const cioEl = document.getElementById('cio-summary-text');
    if (cioEl) cioEl.textContent = data.cio_summary;
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
