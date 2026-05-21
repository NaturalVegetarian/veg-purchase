* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
body {
  font-family: 'Noto Sans TC', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f5f3ee;
  color: #2d3a2e;
  -webkit-font-smoothing: antialiased;
}
.app { min-height: 100vh; padding-bottom: 80px; }
.loading { padding: 60px; text-align: center; color: #6b7c6d; }
.page { animation: fadeIn 0.25s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

/* Header */
.app-header {
  background: linear-gradient(135deg, #4a6741, #5e7d52);
  color: white; padding: 18px 20px 22px;
  position: relative; overflow: hidden;
}
.app-header::before {
  content: '🥬'; position: absolute;
  right: -10px; top: -10px;
  font-size: 90px; opacity: 0.12; transform: rotate(15deg);
}
.app-title { font-size: 22px; font-weight: 700; }
.app-subtitle { font-size: 12px; opacity: 0.85; margin-top: 2px; }

/* Summary */
.summary {
  background: white; margin: 16px; padding: 16px;
  border-radius: 14px; border: 1px solid #e8e5dc;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.summary-title { font-size: 13px; color: #6b7c6d; margin-bottom: 10px; font-weight: 500; }
.summary-grid-4 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.summary-cell { text-align: center; padding: 10px 4px; background: #f5f3ee; border-radius: 10px; }
.summary-cell-label { font-size: 10.5px; color: #6b7c6d; margin-bottom: 4px; }
.summary-cell-value { font-size: 16px; font-weight: 800; font-variant-numeric: tabular-nums; }
.summary-cell-value.pending { color: #c2410c; }
.summary-cell-value.done { color: #4a6741; }
.summary-cell-value.driver { color: #7c3aed; }

/* Day Section */
.day-section { margin: 0 16px 16px; }
.day-header {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 4px 8px;
  font-size: 13px; font-weight: 600; color: #6b7c6d;
}
.day-header::before { content: ''; flex: 1; height: 1px; background: #d6d2c5; margin-left: 8px; }

/* Vendor Card */
.vendor-card {
  background: white; border-radius: 14px;
  margin-bottom: 10px;
  border: 1px solid #e8e5dc; overflow: hidden;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.vendor-head {
  background: linear-gradient(to right, #f0ede3, #f5f3ee);
  padding: 10px 14px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #e8e5dc;
}
.vendor-name { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
.vendor-name::before { content: '🏪'; }
.vendor-subtotal { font-size: 13px; font-weight: 700; color: #4a6741; font-variant-numeric: tabular-nums; }
.item-row { padding: 12px 14px; border-bottom: 1px solid #f0ede3; }
.item-row:last-child { border-bottom: none; }
.item-row-main { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.item-row-left { flex: 1; min-width: 0; }
.item-name-line { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; flex-wrap: wrap; }
.item-name { font-size: 15px; font-weight: 600; }
.badge { font-size: 11px; padding: 3px 9px; border-radius: 20px; font-weight: 600; white-space: nowrap; }
.badge.pending { background: #fed7aa; color: #9a3412; }
.badge.done { background: #d1fae5; color: #065f46; }
.item-calc { font-size: 12px; color: #6b7c6d; font-variant-numeric: tabular-nums; }
.item-shipping-note { font-size: 10.5px; color: #7c3aed; margin-top: 3px; font-variant-numeric: tabular-nums; }
.item-amount-right { text-align: right; }
.item-claim-amount { font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums; }
.item-claim-label { font-size: 9.5px; color: #6b7c6d; margin-top: 1px; }
.item-claim-date { font-size: 10px; color: #6b7c6d; margin-top: 4px; font-style: italic; }

/* Tabs */
.tabs {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: white; border-top: 1px solid #e8e5dc;
  display: flex; padding: 8px 0 max(8px, env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0,0,0,0.04); z-index: 100;
}
.tab { flex: 1; text-align: center; padding: 6px 2px; cursor: pointer; color: #9aa39b; transition: color 0.2s; }
.tab.active { color: #4a6741; }
.tab-icon { font-size: 19px; margin-bottom: 2px; }
.tab-label { font-size: 10.5px; font-weight: 600; }

/* Form */
.form-section { background: white; margin: 16px; padding: 18px; border-radius: 14px; border: 1px solid #e8e5dc; }
.form-group { margin-bottom: 14px; }
.form-label { display: block; font-size: 12px; color: #6b7c6d; margin-bottom: 6px; font-weight: 600; }
.form-input {
  width: 100%; padding: 10px 12px;
  border: 1.5px solid #d6d2c5; border-radius: 8px;
  font-size: 15px; font-family: inherit;
  background: #fafaf7; color: #2d3a2e;
  -webkit-appearance: none;
}
.form-input:focus { outline: none; border-color: #4a6741; background: white; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.pill-group { display: flex; gap: 6px; flex-wrap: wrap; }
.pill {
  padding: 8px 14px; border: 1.5px solid #d6d2c5; border-radius: 20px;
  font-size: 13px; cursor: pointer; background: white; color: #4a5a4b; font-weight: 500;
}
.pill.active { background: #4a6741; color: white; border-color: #4a6741; }
.hint-purple { font-size: 11px; color: #7c3aed; margin-top: -6px; }
.hint-green { font-size: 11px; color: #4d7c0f; margin-top: 6px; }

/* Vendor Dropdown */
.vendor-input-wrapper { position: relative; }
.vendor-dropdown-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: white;
  border: 1.5px solid #4a6741;
  border-radius: 6px;
  padding: 4px 12px;
  cursor: pointer;
  color: #4a6741;
  font-weight: 700;
  font-family: inherit;
  font-size: 13px;
}
.vendor-dropdown-btn:active { background: #4a6741; color: white; }
.vendor-dropdown {
  background: white;
  border: 1.5px solid #d6d2c5;
  border-radius: 8px;
  margin-top: 4px;
  max-height: 260px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.vendor-dropdown-item {
  padding: 12px 14px;
  border-bottom: 1px solid #f0ede3;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background 0.15s;
}
.vendor-dropdown-item:hover { background: #f0ede3; }
.vendor-dropdown-item:active { background: #4a6741; color: white; }
.vendor-dropdown-item:last-child { border-bottom: none; }

/* ABC Grade input */
.grade-row {
  display: grid; grid-template-columns: 40px 1fr 1fr;
  gap: 8px; align-items: center;
  margin-bottom: 8px; padding: 8px;
  background: #f5f3ee; border-radius: 8px;
  transition: background 0.2s;
}
.grade-row.has-value { background: #ecfccb; }
.grade-row.empty-row { opacity: 0.55; }
.grade-label { font-size: 13px; font-weight: 700; text-align: center; color: #4d7c0f; }
.grade-input { padding: 8px; border: 1.5px solid #d6d2c5; border-radius: 6px; font-size: 14px; background: white; -webkit-appearance: none; min-width: 0; width: 100%; }
.grade-input:focus { outline: none; border-color: #4a6741; }

/* Calc Display */
.calc-display { background: #f0ede3; padding: 14px; border-radius: 10px; margin-top: 8px; }
.calc-line { display: flex; justify-content: space-between; font-size: 12.5px; padding: 3px 0; color: #4a5a4b; font-variant-numeric: tabular-nums; }
.calc-line.driver-line { color: #7c3aed; }
.calc-divider { border-top: 1px dashed #d6d2c5; margin: 6px 0; }
.calc-claim-line { display: flex; justify-content: space-between; align-items: center; padding-top: 4px; }
.calc-claim-label { font-size: 12px; font-weight: 600; color: #2d3a2e; }
.calc-claim-value { font-size: 22px; font-weight: 800; color: #c2410c; font-variant-numeric: tabular-nums; }
.calc-total-line { font-size: 11px; text-align: right; color: #6b7c6d; margin-top: 2px; font-variant-numeric: tabular-nums; }

/* Primary Button */
.btn-primary {
  width: calc(100% - 32px); margin: 0 16px 16px;
  padding: 14px; background: #4a6741; color: white;
  border: none; border-radius: 10px;
  font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary:active:not(:disabled) { background: #3d5635; }

/* Claim Page */
.info-note {
  background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af;
  margin: 0 16px 12px; padding: 12px 14px; border-radius: 10px;
  font-size: 12px; line-height: 1.6;
}
.info-note b { color: #1e3a8a; }
.claim-vendor-card { background: white; border-radius: 14px; margin: 0 16px 12px; border: 1px solid #e8e5dc; overflow: hidden; }
.claim-vendor-head {
  background: linear-gradient(to right, #fff7ed, #fef3e2);
  padding: 12px 14px;
  display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid #fde68a;
}
.claim-vendor-name { font-size: 15px; font-weight: 700; }
.claim-vendor-meta { font-size: 11px; color: #92400e; margin-top: 2px; }
.select-all-btn {
  font-size: 11px; padding: 6px 12px; background: white;
  border: 1.5px solid #ea580c; color: #c2410c;
  border-radius: 20px; font-weight: 600; cursor: pointer;
}
.select-all-btn.active { background: #ea580c; color: white; }
.claim-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-bottom: 1px solid #f5f3ee; }
.claim-row:last-child { border-bottom: none; }
.checkbox {
  width: 22px; height: 22px;
  border: 2px solid #d6d2c5; border-radius: 6px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; background: white;
  color: white; font-size: 14px; font-weight: 700;
}
.checkbox.checked { background: #4a6741; border-color: #4a6741; }
.claim-info { flex: 1; }
.claim-title { font-size: 14px; font-weight: 600; }
.claim-meta { font-size: 11px; color: #6b7c6d; margin-top: 2px; }
.claim-amount { font-size: 15px; font-weight: 700; color: #c2410c; font-variant-numeric: tabular-nums; }
.claim-vendor-foot {
  background: #fafaf7; padding: 10px 14px;
  display: flex; justify-content: space-between; align-items: center;
  border-top: 1px solid #f0ede3;
}
.claim-vendor-foot-label { font-size: 12px; color: #6b7c6d; font-weight: 600; }
.claim-vendor-foot-val { font-size: 17px; font-weight: 800; color: #c2410c; font-variant-numeric: tabular-nums; }
.claim-summary {
  background: #4a6741; color: white;
  margin: 16px; padding: 16px; border-radius: 14px; text-align: center;
}
.claim-summary-label { font-size: 12px; opacity: 0.85; margin-bottom: 4px; }
.claim-summary-value { font-size: 26px; font-weight: 800; font-variant-numeric: tabular-nums; }
.claim-summary small { font-size: 11px; opacity: 0.75; display: block; margin-top: 4px; }
.empty-hint { text-align: center; padding: 50px 20px; color: #9aa39b; font-size: 13px; line-height: 2; }

/* Vendor Management */
.vendor-mgmt-card { background: white; margin: 0 16px 10px; padding: 14px; border-radius: 12px; border: 1px solid #e8e5dc; }
.vendor-mgmt-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.vendor-mgmt-name { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.vendor-mgmt-name::before { content: '🏪'; }
.vendor-mgmt-edit {
  color: #4a6741; font-size: 12px; font-weight: 600;
  cursor: pointer; padding: 5px 12px;
  border: 1.5px solid #4a6741; border-radius: 6px; background: white; font-family: inherit;
}
.vendor-mgmt-info { background: #f5f3ee; padding: 10px 12px; border-radius: 8px; font-size: 12px; line-height: 1.8; }
.vendor-mgmt-info .row { display: flex; }
.vendor-mgmt-info .label { color: #6b7c6d; min-width: 70px; }
.vendor-mgmt-info .val { color: #2d3a2e; font-weight: 500; font-variant-numeric: tabular-nums; }
.vendor-mgmt-incomplete {
  background: #fef3c7; color: #92400e;
  padding: 10px 12px; border-radius: 8px;
  font-size: 12px; text-align: center;
  border: 1px dashed #fbbf24;
}
.vendor-mgmt-status-ok {
  display: inline-block; font-size: 10px; padding: 2px 8px;
  background: #d1fae5; color: #065f46; border-radius: 20px;
  font-weight: 600; margin-left: 8px;
}
.vendor-mgmt-status-warn {
  display: inline-block; font-size: 10px; padding: 2px 8px;
  background: #fde68a; color: #92400e; border-radius: 20px;
  font-weight: 600; margin-left: 8px;
}
.add-vendor-btn {
  width: calc(100% - 32px); margin: 4px 16px 16px;
  padding: 14px; background: white; color: #4a6741;
  border: 2px dashed #4a6741; border-radius: 12px;
  font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
}

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 200; display: flex; align-items: flex-end; }
.modal {
  background: white; width: 100%;
  border-radius: 18px 18px 0 0;
  padding: 22px 20px max(20px, env(safe-area-inset-bottom));
  animation: slideUp 0.25s ease;
  max-height: 92vh; overflow-y: auto;
}
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
.modal-title { font-size: 17px; font-weight: 800; margin-bottom: 4px; }
.modal-sub { font-size: 12px; color: #6b7c6d; margin-bottom: 18px; }
.modal-section-label { font-size: 12px; color: #6b7c6d; font-weight: 600; margin-bottom: 6px; margin-top: 14px; }
.modal-actions { display: flex; gap: 10px; margin-top: 18px; }
.btn-cancel {
  flex: 1; padding: 12px;
  background: white; border: 1.5px solid #d6d2c5;
  color: #4a5a4b; border-radius: 10px;
  font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit;
}
.btn-confirm {
  flex: 2; padding: 12px;
  background: #4a6741; color: white;
  border: none; border-radius: 10px;
  font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit;
}
.btn-confirm:disabled, .btn-cancel:disabled { opacity: 0.6; cursor: not-allowed; }
.modal-preview-card { background: #f5f3ee; border-radius: 10px; padding: 12px; margin-bottom: 8px; font-size: 12px; line-height: 1.7; }
.modal-preview-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; display: flex; justify-content: space-between; }
.modal-preview-title .amt { color: #c2410c; font-variant-numeric: tabular-nums; }
.modal-preview-card .item-line { color: #4a5a4b; padding-left: 12px; position: relative; font-variant-numeric: tabular-nums; }
.modal-preview-card .item-line::before { content: '·'; position: absolute; left: 4px; }
.modal-grand-total { text-align: center; padding: 12px; background: #4a6741; color: white; border-radius: 10px; margin-top: 8px; }
.modal-grand-total .lbl { font-size: 11px; opacity: 0.85; }
.modal-grand-total .val { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; }
.modal-future-toggle {
  background: #f5f3ee; padding: 10px 12px; border-radius: 8px;
  font-size: 12px; color: #6b7c6d;
  margin-top: 14px;
  display: flex; align-items: center; gap: 8px;
}
.modal-future-toggle input { flex-shrink: 0; }
