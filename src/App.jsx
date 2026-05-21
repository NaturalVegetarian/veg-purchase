import { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

// ════════════════════════════════════════════════════════════════
// 常數設定
// ════════════════════════════════════════════════════════════════
const ITEMS = ['高麗菜', '青江菜', '大白菜', '有機高麗菜'];
const DRIVER_SHIPPING = 30;   // 一般品項：每件 $30，給司機
const ORGANIC_SHIPPING = 3;   // 有機高麗菜：每公斤 $3，給菜商

// ════════════════════════════════════════════════════════════════
// 工具函式
// ════════════════════════════════════════════════════════════════
const fmt = n => '$' + (Math.round((Number(n) || 0) * 10) / 10).toLocaleString();
const today = () => new Date().toISOString().slice(0, 10);
const fmtDate = d => {
  if (!d) return '';
  const dt = new Date(d);
  const wk = ['日','一','二','三','四','五','六'][dt.getDay()];
  return `${dt.getMonth()+1}/${dt.getDate()}（週${wk}）`;
};
const fmtShort = d => {
  if (!d) return '';
  const dt = new Date(d);
  return `${dt.getMonth()+1}/${dt.getDate()}`;
};
const genClaimNo = (i = 0) => {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `VEG-${String(d.getFullYear()).slice(2)}${p(d.getMonth()+1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}${p(i)}`;
};

// ════════════════════════════════════════════════════════════════
// 主元件
// ════════════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState('list');
  const [purchases, setPurchases] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    const [p, v] = await Promise.all([
      supabase.from('veg_purchases').select('*').order('purchase_date', { ascending: false }).order('created_at', { ascending: false }),
      supabase.from('veg_vendors').select('*').order('name'),
    ]);
    setPurchases(p.data || []);
    setVendors(v.data || []);
    setLoading(false);
  }

  if (loading) return <div className="loading">載入中...</div>;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">菜商採購</div>
        <div className="app-subtitle">{new Date().getFullYear()} 年 {new Date().getMonth()+1} 月</div>
      </header>

      {page === 'list'    && <ListPage purchases={purchases} />}
      {page === 'add'     && <AddPage vendors={vendors} onSave={loadAll} setPage={setPage} />}
      {page === 'claim'   && <ClaimPage purchases={purchases} vendors={vendors} onSubmit={loadAll} />}
      {page === 'vendors' && <VendorsPage vendors={vendors} onSave={loadAll} />}

      <nav className="tabs">
        <TabBtn icon="📋" label="採購列表" active={page==='list'}    onClick={() => setPage('list')} />
        <TabBtn icon="➕" label="新增採購" active={page==='add'}     onClick={() => setPage('add')} />
        <TabBtn icon="💰" label="請款管理" active={page==='claim'}   onClick={() => setPage('claim')} />
        <TabBtn icon="🏪" label="菜商管理" active={page==='vendors'} onClick={() => setPage('vendors')} />
      </nav>
    </div>
  );
}

function TabBtn({ icon, label, active, onClick }) {
  return (
    <div className={`tab ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="tab-icon">{icon}</div>
      <div className="tab-label">{label}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 採購列表頁
// ════════════════════════════════════════════════════════════════
function ListPage({ purchases }) {
  // 本月小計
  const monthStats = useMemo(() => {
    const now = new Date();
    const month = purchases.filter(p => {
      const d = new Date(p.purchase_date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    return {
      claim: month.reduce((s, p) => s + Number(p.claim_amount || 0), 0),
      driver: month.reduce((s, p) => s + Number(p.driver_shipping || 0), 0),
      pending: month.filter(p => p.claim_status === 'pending').reduce((s, p) => s + Number(p.claim_amount || 0), 0),
      done: month.filter(p => p.claim_status === 'claimed').reduce((s, p) => s + Number(p.claim_amount || 0), 0),
    };
  }, [purchases]);

  // 按日期分組 → 再按菜商分組
  const grouped = useMemo(() => {
    const byDate = {};
    purchases.forEach(p => {
      if (!byDate[p.purchase_date]) byDate[p.purchase_date] = {};
      const v = p.vendor_name;
      if (!byDate[p.purchase_date][v]) byDate[p.purchase_date][v] = [];
      byDate[p.purchase_date][v].push(p);
    });
    return Object.keys(byDate).sort().reverse().map(date => ({
      date,
      vendors: Object.keys(byDate[date]).map(v => ({
        name: v,
        items: byDate[date][v],
        subtotal: byDate[date][v].reduce((s, p) => s + Number(p.claim_amount || 0), 0),
      })),
    }));
  }, [purchases]);

  return (
    <div className="page">
      <div className="summary">
        <div className="summary-title">本月小計</div>
        <div className="summary-grid-4">
          <div className="summary-cell"><div className="summary-cell-label">本月採購</div><div className="summary-cell-value">{fmt(monthStats.claim)}</div></div>
          <div className="summary-cell"><div className="summary-cell-label">給司機運費</div><div className="summary-cell-value driver">{fmt(monthStats.driver)}</div></div>
          <div className="summary-cell"><div className="summary-cell-label">未請款</div><div className="summary-cell-value pending">{fmt(monthStats.pending)}</div></div>
          <div className="summary-cell"><div className="summary-cell-label">已請款</div><div className="summary-cell-value done">{fmt(monthStats.done)}</div></div>
        </div>
      </div>

      {grouped.length === 0 && <div className="empty-hint">還沒有任何採購記錄<br/>點下方「➕ 新增採購」開始記錄</div>}

      {grouped.map(day => (
        <div className="day-section" key={day.date}>
          <div className="day-header">{fmtDate(day.date)}</div>
          {day.vendors.map(v => (
            <div className="vendor-card" key={v.name}>
              <div className="vendor-head">
                <div className="vendor-name">{v.name}</div>
                <div className="vendor-subtotal">請款 {fmt(v.subtotal)}</div>
              </div>
              {v.items.map(item => (
                <div className="item-row" key={item.id}>
                  <div className="item-row-main">
                    <div className="item-row-left">
                      <div className="item-name-line">
                        <span className="item-name">{item.item}{item.is_organic && item.grade ? ` ${item.grade}` : ''}</span>
                        <span className={`badge ${item.claim_status === 'pending' ? 'pending' : 'done'}`}>
                          {item.claim_status === 'pending' ? '未請款' : '已請款'}
                        </span>
                      </div>
                      <div className="item-calc">
                        {item.quantity} {item.unit} × {fmt(item.unit_price)} = {fmt(item.item_subtotal)}
                      </div>
                      {Number(item.vendor_shipping) > 0 && (
                        <div className="item-calc">＋ 運費 {fmt(item.vendor_shipping)}（給菜商）</div>
                      )}
                      {Number(item.driver_shipping) > 0 && (
                        <div className="item-shipping-note">＋ 司機運費 {fmt(item.driver_shipping)}（當天現金，不請款）</div>
                      )}
                      {item.claim_date && (
                        <div className="item-claim-date">於 {fmtShort(item.claim_date)} 標記已請款</div>
                      )}
                    </div>
                    <div className="item-amount-right">
                      <div className="item-claim-amount">{fmt(item.claim_amount)}</div>
                      <div className="item-claim-label">請款金額</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 新增採購頁
// ════════════════════════════════════════════════════════════════
function AddPage({ vendors, onSave, setPage }) {
  const [date, setDate] = useState(today());
  const [vendorName, setVendorName] = useState('');
  const [item, setItem] = useState('高麗菜');
  const [generalQty, setGeneralQty] = useState('');
  const [generalPrice, setGeneralPrice] = useState('');
  const [grades, setGrades] = useState({
    A: { kg: '', price: '' },
    B: { kg: '', price: '' },
    C: { kg: '', price: '' },
  });
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const isOrganic = item === '有機高麗菜';

  // 計算
  const calc = useMemo(() => {
    if (isOrganic) {
      const rows = ['A','B','C'].map(g => {
        const kg = parseFloat(grades[g].kg) || 0;
        const price = parseFloat(grades[g].price) || 0;
        return { grade: g, kg, price, subtotal: kg * price };
      }).filter(r => r.kg > 0 && r.price > 0);
      const itemSubtotal = rows.reduce((s, r) => s + r.subtotal, 0);
      const totalKg = rows.reduce((s, r) => s + r.kg, 0);
      const vendorShipping = totalKg * ORGANIC_SHIPPING;
      return {
        rows,
        itemSubtotal,
        vendorShipping,
        driverShipping: 0,
        claimAmount: itemSubtotal + vendorShipping,
        totalCost: itemSubtotal + vendorShipping,
      };
    } else {
      const qty = parseFloat(generalQty) || 0;
      const price = parseFloat(generalPrice) || 0;
      const itemSubtotal = qty * price;
      const driverShipping = qty * DRIVER_SHIPPING;
      return {
        rows: [{ grade: null, qty, price, subtotal: itemSubtotal }],
        itemSubtotal,
        vendorShipping: 0,
        driverShipping,
        claimAmount: itemSubtotal,
        totalCost: itemSubtotal + driverShipping,
      };
    }
  }, [isOrganic, generalQty, generalPrice, grades]);

  async function handleSave() {
    if (!vendorName.trim()) return alert('請輸入菜商名稱');
    if (calc.rows.length === 0) return alert('請填寫至少一個品項數量');

    setSaving(true);
    
    // 找菜商 ID（如果不存在會先建立）
    let vendorId = vendors.find(v => v.name === vendorName.trim())?.id;
    if (!vendorId) {
      const { data, error } = await supabase.from('veg_vendors').insert({ name: vendorName.trim() }).select().single();
      if (error) { alert('菜商建立失敗：' + error.message); setSaving(false); return; }
      vendorId = data.id;
    }

    // 寫入採購記錄
    const records = isOrganic
      ? calc.rows.map(r => {
          const subtotal = r.subtotal;
          const vendorShip = r.kg * ORGANIC_SHIPPING;
          return {
            purchase_date: date,
            vendor_id: vendorId,
            vendor_name: vendorName.trim(),
            item: '有機高麗菜',
            is_organic: true,
            grade: r.grade,
            unit: 'kg',
            quantity: r.kg,
            unit_price: r.price,
            item_subtotal: subtotal,
            vendor_shipping: vendorShip,
            driver_shipping: 0,
            claim_amount: subtotal + vendorShip,
            total_cost: subtotal + vendorShip,
            note: note || null,
          };
        })
      : [{
          purchase_date: date,
          vendor_id: vendorId,
          vendor_name: vendorName.trim(),
          item,
          is_organic: false,
          grade: null,
          unit: '件',
          quantity: calc.rows[0].qty,
          unit_price: calc.rows[0].price,
          item_subtotal: calc.itemSubtotal,
          vendor_shipping: 0,
          driver_shipping: calc.driverShipping,
          claim_amount: calc.claimAmount,
          total_cost: calc.totalCost,
          note: note || null,
        }];

    const { error } = await supabase.from('veg_purchases').insert(records);
    setSaving(false);
    if (error) return alert('儲存失敗：' + error.message);

    // 重置
    setVendorName('');
    setGeneralQty('');
    setGeneralPrice('');
    setGrades({ A: { kg: '', price: '' }, B: { kg: '', price: '' }, C: { kg: '', price: '' } });
    setNote('');
    onSave();
    setPage('list');
  }

  return (
    <div className="page">
      <div className="form-section">
        <div className="form-group">
          <label className="form-label">日期</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">菜商</label>
          <input className="form-input" type="text" value={vendorName} onChange={e => setVendorName(e.target.value)} list="vendor-list" placeholder="輸入菜商名稱" />
          <datalist id="vendor-list">{vendors.map(v => <option key={v.id} value={v.name} />)}</datalist>
        </div>

        <div className="form-group">
          <label className="form-label">品項</label>
          <div className="pill-group">
            {ITEMS.map(it => (
              <div key={it} className={`pill ${item === it ? 'active' : ''}`} onClick={() => setItem(it)}>{it}</div>
            ))}
          </div>
        </div>

        {!isOrganic && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">件數</label>
                <input className="form-input" type="number" inputMode="decimal" value={generalQty} onChange={e => setGeneralQty(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">單價 / 件</label>
                <input className="form-input" type="number" inputMode="decimal" value={generalPrice} onChange={e => setGeneralPrice(e.target.value)} />
              </div>
            </div>
            <div className="hint-purple">💵 司機運費自動算：件數 × $30（當天現金給司機，不進請款單）</div>
          </>
        )}

        {isOrganic && (
          <>
            <label className="form-label">各等級的重量和單價（空白的等級會跳過）</label>
            {['A','B','C'].map(g => {
              const hasValue = parseFloat(grades[g].kg) > 0 && parseFloat(grades[g].price) > 0;
              return (
                <div key={g} className={`grade-row ${hasValue ? 'has-value' : 'empty-row'}`}>
                  <div className="grade-label">{g} 級</div>
                  <input className="grade-input" type="number" step="0.1" inputMode="decimal" placeholder="kg"
                    value={grades[g].kg}
                    onChange={e => setGrades({...grades, [g]: {...grades[g], kg: e.target.value}})} />
                  <input className="grade-input" type="number" inputMode="decimal" placeholder="單價/kg"
                    value={grades[g].price}
                    onChange={e => setGrades({...grades, [g]: {...grades[g], price: e.target.value}})} />
                </div>
              );
            })}
            <div className="hint-green">🌿 運費自動算：總公斤 × $3（給菜商，含在請款裡）</div>
          </>
        )}

        <div className="form-group" style={{marginTop: 14}}>
          <label className="form-label">備註（可空）</label>
          <input className="form-input" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="" />
        </div>

        <div className="calc-display">
          {isOrganic ? (
            <>
              {calc.rows.map(r => (
                <div key={r.grade} className="calc-line">
                  <span>{r.grade} 級 {r.kg}kg × {fmt(r.price)}</span>
                  <span>{fmt(r.subtotal)}</span>
                </div>
              ))}
              {calc.vendorShipping > 0 && (
                <div className="calc-line">
                  <span>運費（給菜商）</span>
                  <span>{fmt(calc.vendorShipping)}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="calc-line">
                <span>{calc.rows[0].qty || 0} 件 × {fmt(calc.rows[0].price || 0)}</span>
                <span>{fmt(calc.itemSubtotal)}</span>
              </div>
              {calc.driverShipping > 0 && (
                <div className="calc-line driver-line">
                  <span>司機運費（當天現金）</span>
                  <span>{fmt(calc.driverShipping)}</span>
                </div>
              )}
            </>
          )}
          <div className="calc-divider" />
          <div className="calc-claim-line">
            <span className="calc-claim-label">請款金額</span>
            <span className="calc-claim-value">{fmt(calc.claimAmount)}</span>
          </div>
          {calc.driverShipping > 0 && (
            <div className="calc-total-line">採購總成本 {fmt(calc.totalCost)}</div>
          )}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSave} disabled={saving}>
        {saving ? '儲存中...' : '儲存採購'}
      </button>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 請款管理頁
// ════════════════════════════════════════════════════════════════
function ClaimPage({ purchases, vendors, onSubmit }) {
  const [checked, setChecked] = useState(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [urgency, setUrgency] = useState('一般');
  const [lFolder, setLFolder] = useState('');
  const [format, setFormat] = useState('JSON');
  const [syncShared, setSyncShared] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 未請款，按菜商分組
  const grouped = useMemo(() => {
    const pending = purchases.filter(p => p.claim_status === 'pending');
    const byVendor = {};
    pending.forEach(p => {
      if (!byVendor[p.vendor_name]) byVendor[p.vendor_name] = [];
      byVendor[p.vendor_name].push(p);
    });
    return Object.keys(byVendor).map(name => ({
      name,
      items: byVendor[name],
      subtotal: byVendor[name].reduce((s, p) => s + Number(p.claim_amount || 0), 0),
    }));
  }, [purchases]);

  function toggleItem(id) {
    const next = new Set(checked);
    if (next.has(id)) next.delete(id); else next.add(id);
    setChecked(next);
  }
  function toggleVendor(vendor) {
    const next = new Set(checked);
    const allOn = vendor.items.every(i => next.has(i.id));
    if (allOn) vendor.items.forEach(i => next.delete(i.id));
    else vendor.items.forEach(i => next.add(i.id));
    setChecked(next);
  }

  const selectedItems = useMemo(() => purchases.filter(p => checked.has(p.id)), [purchases, checked]);
  const totalAmount = selectedItems.reduce((s, p) => s + Number(p.claim_amount || 0), 0);

  // 把選中的依菜商分組產生請款單
  const claimSheets = useMemo(() => {
    const byVendor = {};
    selectedItems.forEach(p => {
      if (!byVendor[p.vendor_name]) byVendor[p.vendor_name] = [];
      byVendor[p.vendor_name].push(p);
    });
    return Object.keys(byVendor).map((name, idx) => {
      const items = byVendor[name];
      const vendor = vendors.find(v => v.name === name) || {};
      const description = items.map(it => {
        const grade = it.grade ? ` ${it.grade}級` : '';
        return `${fmtShort(it.purchase_date)} ${it.item}${grade} ${it.quantity}${it.unit} × ${fmt(it.unit_price)}`;
      }).join('；');
      return {
        claim_no: genClaimNo(idx),
        vendor,
        items,
        amount: items.reduce((s, p) => s + Number(p.claim_amount || 0), 0),
        description,
      };
    });
  }, [selectedItems, vendors]);

  async function handleConfirm() {
    if (!lFolder.trim()) {
      if (!confirm('還沒填 L 夾編號，確定要繼續嗎？')) return;
    }
    
    // 檢查所有菜商的銀行資料是否完整
    const incomplete = claimSheets.filter(s => !s.vendor.bank_account || !s.vendor.bank_code);
    if (incomplete.length > 0) {
      alert('以下菜商的銀行資料還沒填齊，請先到「菜商管理」補完：\n\n' + incomplete.map(s => '・' + (s.vendor.name || s.items[0].vendor_name)).join('\n'));
      return;
    }

    setSubmitting(true);
    const claimDate = today();

    try {
      // 1. 匯出檔案
      exportFile(claimSheets, format, claimDate);

      // 2. 更新採購記錄為已請款
      for (const sheet of claimSheets) {
        const ids = sheet.items.map(i => i.id);
        await supabase.from('veg_purchases').update({
          claim_status: 'claimed',
          claim_no: sheet.claim_no,
          claim_date: claimDate,
          urgency,
          l_folder_no: lFolder || null,
        }).in('id', ids);
      }

      // 3. 如果勾選了，同步寫入共享請款表
      if (syncShared) {
        const rows = claimSheets.map(sheet => ({
          source_system: 'veg',
          claim_no: sheet.claim_no,
          urgency,
          vendor_code: sheet.vendor.vendor_code || null,
          payee_name: sheet.vendor.name || sheet.items[0].vendor_name,
          bank_code: sheet.vendor.bank_code || null,
          bank_account: sheet.vendor.bank_account || null,
          bank_account_name: sheet.vendor.bank_account_name || null,
          branch_code: sheet.vendor.branch_code || null,
          branch_name: sheet.vendor.branch_name || null,
          description: sheet.description,
          amount: sheet.amount,
          l_folder_no: lFolder || null,
          applicant: '雅怡',
          claim_date: claimDate,
          source_ids: sheet.items.map(i => i.id),
        }));
        await supabase.from('shared_claim_requests').insert(rows);
      }

      setChecked(new Set());
      setModalOpen(false);
      setLFolder('');
      onSubmit();
      alert(`✅ 已產生 ${claimSheets.length} 張請款單，並標記為已請款`);
    } catch (err) {
      alert('處理失敗：' + err.message);
    }
    setSubmitting(false);
  }

  if (grouped.length === 0) {
    return (
      <div className="page">
        <div className="empty-hint">目前沒有未請款的採購記錄 🎉</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="info-note">
        📦 顯示金額皆為<b>請款金額</b>（不含給司機的運費）。<br/>
        勾選後按下方按鈕 → 跳彈窗 → <b>下載匯出檔</b> + 標記已請款。
      </div>

      {grouped.map(v => {
        const allOn = v.items.every(i => checked.has(i.id));
        return (
          <div className="claim-vendor-card" key={v.name}>
            <div className="claim-vendor-head">
              <div>
                <div className="claim-vendor-name">🏪 {v.name}</div>
                <div className="claim-vendor-meta">{v.items.length} 筆未請款</div>
              </div>
              <div className={`select-all-btn ${allOn ? 'active' : ''}`} onClick={() => toggleVendor(v)}>
                {allOn ? '✓ 全選' : '全選'}
              </div>
            </div>
            {v.items.map(it => (
              <div className="claim-row" key={it.id}>
                <div className={`checkbox ${checked.has(it.id) ? 'checked' : ''}`} onClick={() => toggleItem(it.id)}>
                  {checked.has(it.id) ? '✓' : ''}
                </div>
                <div className="claim-info">
                  <div className="claim-title">{it.item}{it.grade ? ` ${it.grade} 級` : ''}</div>
                  <div className="claim-meta">{fmtShort(it.purchase_date)} · {it.quantity}{it.unit} × {fmt(it.unit_price)}{Number(it.vendor_shipping)>0 ? ' + 運費' : ''}</div>
                </div>
                <div className="claim-amount">{fmt(it.claim_amount)}</div>
              </div>
            ))}
            <div className="claim-vendor-foot">
              <span className="claim-vendor-foot-label">此菜商合計</span>
              <span className="claim-vendor-foot-val">{fmt(v.subtotal)}</span>
            </div>
          </div>
        );
      })}

      {selectedItems.length > 0 && (
        <>
          <div className="claim-summary">
            <div className="claim-summary-label">已勾選 {selectedItems.length} 筆 · 將產生 {claimSheets.length} 張請款單</div>
            <div className="claim-summary-value">{fmt(totalAmount)}</div>
            <small>同一菜商 = 同一張請款單</small>
          </div>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>📤 匯出請款單 + 標記已請款</button>
        </>
      )}

      {modalOpen && (
        <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal">
            <div className="modal-title">📤 匯出請款單</div>
            <div className="modal-sub">下載檔案給同事 + 把這些項目標記為「已請款」</div>

            <div className="modal-section-label">需求急迫性</div>
            <div className="pill-group">
              {['一般','急件'].map(u => (
                <div key={u} className={`pill ${urgency===u?'active':''}`} onClick={() => setUrgency(u)}>{u}</div>
              ))}
            </div>

            <div className="modal-section-label">實體 L 夾編號</div>
            <input className="form-input" type="text" value={lFolder} onChange={e => setLFolder(e.target.value)} placeholder="例：L-2026-051" />

            <div className="modal-section-label">匯出格式</div>
            <div className="pill-group">
              {['JSON','CSV','列印/PDF'].map(f => (
                <div key={f} className={`pill ${format===f?'active':''}`} onClick={() => setFormat(f)}>{f}</div>
              ))}
            </div>

            <div className="modal-section-label">請款單預覽（{claimSheets.length} 張）</div>
            {claimSheets.map((s, i) => (
              <div className="modal-preview-card" key={i}>
                <div className="modal-preview-title">
                  <span>📋 {s.vendor.name || s.items[0].vendor_name}</span>
                  <span className="amt">{fmt(s.amount)}</span>
                </div>
                {s.items.map(it => (
                  <div className="item-line" key={it.id}>
                    {fmtShort(it.purchase_date)} {it.item}{it.grade ? ` ${it.grade}` : ''} {it.quantity}{it.unit} ({fmt(it.claim_amount)})
                  </div>
                ))}
                {s.vendor.bank_code && (
                  <div style={{marginTop:6, fontSize:11, color:'#6b7c6d'}}>
                    → {s.vendor.bank_code}-{s.vendor.branch_code} {s.vendor.bank_account_name} / {s.vendor.bank_account}
                  </div>
                )}
              </div>
            ))}

            <div className="modal-grand-total">
              <div className="lbl">總請款金額</div>
              <div className="val">{fmt(totalAmount)}</div>
            </div>

            <div className="modal-future-toggle">
              <input type="checkbox" id="sync-toggle" checked={syncShared} onChange={e => setSyncShared(e.target.checked)} />
              <label htmlFor="sync-toggle">同時寫入共享請款表（同事系統好了再勾）</label>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setModalOpen(false)} disabled={submitting}>取消</button>
              <button className="btn-confirm" onClick={handleConfirm} disabled={submitting}>
                {submitting ? '處理中...' : '下載並標記已請款'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 菜商管理頁
// ════════════════════════════════════════════════════════════════
function VendorsPage({ vendors, onSave }) {
  const [editing, setEditing] = useState(null);  // null / { id?, ...fields }

  function isComplete(v) {
    return v.bank_code && v.branch_code && v.bank_account && v.bank_account_name;
  }

  return (
    <div className="page">
      <div className="info-note">
        🏪 一次設定銀行資料，匯出請款單時自動帶出 13 個欄位。<br/>
        銀行資料不全 → 匯出時系統會擋下來提醒。
      </div>

      {vendors.length === 0 && <div className="empty-hint">還沒新增菜商<br/>點下面「＋ 新增菜商」</div>}

      {vendors.map(v => (
        <div className="vendor-mgmt-card" key={v.id}>
          <div className="vendor-mgmt-head">
            <div className="vendor-mgmt-name">
              {v.name}
              {isComplete(v)
                ? <span className="vendor-mgmt-status-ok">✓ 完整</span>
                : <span className="vendor-mgmt-status-warn">⚠ 待補</span>}
            </div>
            <button className="vendor-mgmt-edit" onClick={() => setEditing({ ...v })}>
              {isComplete(v) ? '編輯' : '補資料'}
            </button>
          </div>
          {isComplete(v) ? (
            <div className="vendor-mgmt-info">
              {v.vendor_code && <div className="row"><span className="label">供應商編號</span><span className="val">{v.vendor_code}</span></div>}
              <div className="row"><span className="label">銀行</span><span className="val">{v.bank_code}</span></div>
              <div className="row"><span className="label">分行代碼</span><span className="val">{v.branch_code}{v.branch_name ? ` ${v.branch_name}` : ''}</span></div>
              <div className="row"><span className="label">帳號</span><span className="val">{v.bank_account}</span></div>
              <div className="row"><span className="label">戶名</span><span className="val">{v.bank_account_name}</span></div>
            </div>
          ) : (
            <div className="vendor-mgmt-incomplete">此菜商還沒填銀行資料，匯出請款單時會擋下來</div>
          )}
        </div>
      ))}

      <button className="add-vendor-btn" onClick={() => setEditing({ name: '', vendor_code: '', bank_code: '', branch_code: '', branch_name: '', bank_account: '', bank_account_name: '', note: '' })}>
        ＋ 新增菜商
      </button>

      {editing && <VendorEditModal vendor={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onSave(); }} />}
    </div>
  );
}

function VendorEditModal({ vendor, onClose, onSaved }) {
  const [data, setData] = useState(vendor);
  const [saving, setSaving] = useState(false);
  const isNew = !vendor.id;

  function set(k, v) { setData({ ...data, [k]: v }); }

  async function handleSave() {
    if (!data.name?.trim()) return alert('請輸入菜商名稱');
    setSaving(true);
    const { id, created_at, updated_at, ...payload } = data;
    payload.updated_at = new Date().toISOString();
    const { error } = isNew
      ? await supabase.from('veg_vendors').insert(payload)
      : await supabase.from('veg_vendors').update(payload).eq('id', id);
    setSaving(false);
    if (error) return alert('儲存失敗：' + error.message);
    onSaved();
  }

  async function handleDelete() {
    if (!confirm(`確定刪除「${data.name}」？`)) return;
    setSaving(true);
    const { error } = await supabase.from('veg_vendors').delete().eq('id', data.id);
    setSaving(false);
    if (error) return alert('刪除失敗：' + error.message);
    onSaved();
  }

  return (
    <div className="modal-overlay show" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-title">{isNew ? '新增菜商' : '編輯菜商'}</div>
        <div className="modal-sub">填越完整，請款時越省力</div>

        <div className="form-group">
          <label className="form-label">菜商名稱 *</label>
          <input className="form-input" value={data.name || ''} onChange={e => set('name', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">供應商編號（同事系統用）</label>
          <input className="form-input" value={data.vendor_code || ''} onChange={e => set('vendor_code', e.target.value)} placeholder="例：V001" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">銀行代碼（3 碼）</label>
            <input className="form-input" inputMode="numeric" value={data.bank_code || ''} onChange={e => set('bank_code', e.target.value)} placeholder="例：004" />
          </div>
          <div className="form-group">
            <label className="form-label">分行代碼（4 碼）</label>
            <input className="form-input" inputMode="numeric" value={data.branch_code || ''} onChange={e => set('branch_code', e.target.value)} placeholder="例：0123" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">分行名稱</label>
          <input className="form-input" value={data.branch_name || ''} onChange={e => set('branch_name', e.target.value)} placeholder="例：高雄分行" />
        </div>
        <div className="form-group">
          <label className="form-label">銀行帳號</label>
          <input className="form-input" value={data.bank_account || ''} onChange={e => set('bank_account', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">銀行戶名</label>
          <input className="form-input" value={data.bank_account_name || ''} onChange={e => set('bank_account_name', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">備註</label>
          <input className="form-input" value={data.note || ''} onChange={e => set('note', e.target.value)} />
        </div>

        <div className="modal-actions">
          {!isNew && <button className="btn-cancel" style={{color: '#c2410c', borderColor: '#fecaca'}} onClick={handleDelete} disabled={saving}>刪除</button>}
          <button className="btn-cancel" onClick={onClose} disabled={saving}>取消</button>
          <button className="btn-confirm" onClick={handleSave} disabled={saving}>{saving ? '儲存中...' : '儲存'}</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
// 匯出檔案
// ════════════════════════════════════════════════════════════════
function exportFile(sheets, format, claimDate) {
  const ts = claimDate.replace(/-/g, '');
  if (format === 'JSON') {
    const blob = new Blob([JSON.stringify(sheets.map(s => ({
      請款單號: s.claim_no,
      請款類別: '採購',
      付款方式: '匯款',
      需求急迫性: '一般',
      供應商編號: s.vendor.vendor_code || '',
      收款人: s.vendor.name || s.items[0].vendor_name,
      銀行代碼: s.vendor.bank_code || '',
      銀行帳號: s.vendor.bank_account || '',
      銀行戶名: s.vendor.bank_account_name || '',
      分行代碼: s.vendor.branch_code || '',
      分行名稱: s.vendor.branch_name || '',
      付款內容說明: s.description,
      總金額: s.amount,
      實體L夾編號: '',
    })), null, 2)], { type: 'application/json' });
    download(blob, `請款單-${ts}.json`);
  } else if (format === 'CSV') {
    const header = ['請款單號','請款類別','付款方式','需求急迫性','供應商編號','收款人','銀行代碼','銀行帳號','銀行戶名','分行代碼','分行名稱','付款內容說明','總金額','實體L夾編號'];
    const rows = sheets.map(s => [
      s.claim_no, '採購', '匯款', '一般',
      s.vendor.vendor_code || '',
      s.vendor.name || s.items[0].vendor_name,
      s.vendor.bank_code || '', s.vendor.bank_account || '',
      s.vendor.bank_account_name || '', s.vendor.branch_code || '',
      s.vendor.branch_name || '', s.description, s.amount, '',
    ]);
    const csv = '\ufeff' + [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    download(blob, `請款單-${ts}.csv`);
  } else {
    // 列印 / PDF
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>請款單</title>
<style>body{font-family:"Microsoft JhengHei",sans-serif;padding:20px;font-size:13px}h2{margin:0 0 8px}table{border-collapse:collapse;width:100%;margin-bottom:24px}td,th{border:1px solid #ccc;padding:6px 10px;text-align:left}th{background:#f0ede3}.amt{text-align:right;font-weight:700}.sheet{page-break-after:always}</style>
</head><body>
${sheets.map(s => `<div class="sheet"><h2>請款單 ${s.claim_no}</h2>
<table>
<tr><th>請款類別</th><td>採購</td><th>付款方式</th><td>匯款</td></tr>
<tr><th>急迫性</th><td>一般</td><th>L夾編號</th><td></td></tr>
<tr><th>供應商編號</th><td>${s.vendor.vendor_code||''}</td><th>收款人</th><td>${s.vendor.name || s.items[0].vendor_name}</td></tr>
<tr><th>銀行代碼</th><td>${s.vendor.bank_code||''}</td><th>分行代碼</th><td>${s.vendor.branch_code||''}</td></tr>
<tr><th>分行名稱</th><td>${s.vendor.branch_name||''}</td><th>戶名</th><td>${s.vendor.bank_account_name||''}</td></tr>
<tr><th>銀行帳號</th><td colspan="3">${s.vendor.bank_account||''}</td></tr>
<tr><th>付款內容</th><td colspan="3">${s.description}</td></tr>
<tr><th>總金額</th><td colspan="3" class="amt">$${s.amount.toLocaleString()}</td></tr>
</table></div>`).join('')}
<script>window.print()</script>
</body></html>`;
    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
  }
}
function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
