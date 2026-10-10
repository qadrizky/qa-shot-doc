// Kerangka tes minimal: test(), expect(), dan pencatat hasil. Tanpa dependensi.
window.T = (function(){
  const cases = [];
  function test(group, name, fn){ cases.push({ group, name, fn }); }
  function fail(msg){ throw new Error(msg); }
  function show(v){ return typeof v === 'string' ? JSON.stringify(v) : String(v); }
  function expect(actual){
    return {
      toBe(expected){ if(actual !== expected) fail('diharapkan ' + show(expected) + ', didapat ' + show(actual)); },
      toBeTrue(){ if(actual !== true) fail('diharapkan true, didapat ' + show(actual)); },
      toBeFalse(){ if(actual !== false) fail('diharapkan false, didapat ' + show(actual)); },
      toContain(part){ if(!String(actual).includes(part)) fail(show(actual) + ' tidak memuat ' + show(part)); },
      toBeAtLeast(min){ if(!(actual >= min)) fail('diharapkan >= ' + min + ', didapat ' + show(actual)); }
    };
  }
  async function run(groups, onResult){
    const results = [];
    for(const c of cases.filter(c => groups.includes(c.group))){
      const started = performance.now();
      let error = null;
      try{ await c.fn(); }catch(e){ error = e.message || String(e); }
      const r = { group:c.group, name:c.name, ok:!error, error, ms:Math.round(performance.now() - started) };
      results.push(r); onResult(r);
    }
    return results;
  }
  return { test, expect, run };
})();

// Pegangan ke aplikasi yang dites di dalam iframe: dipakai tes e2e dan tes UI.
window.UI = (function(){
  const frame = () => document.getElementById('app').contentWindow;
  const $ = sel => frame().document.querySelector(sel);
  const all = sel => [...frame().document.querySelectorAll(sel)];
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function waitUntil(done, timeoutMs){
    const until = Date.now() + timeoutMs;
    while(!done()){ if(Date.now() > until) throw new Error('waktu habis'); await wait(250); }
  }
  const busy = () => $('#veil').classList.contains('on');
  // Menambahkan screenshot lewat input file, persis seperti pengguna memilih file.
  async function addScreens(list){
    const w = frame(), dt = new w.DataTransfer();
    for(const f of list){
      const blob = await new Promise(r => f.canvas.toBlob(r, 'image/png'));
      dt.items.add(new w.File([blob], f.name + '.png', { type:'image/png' }));
    }
    const input = $('#file');
    input.files = dt.files;
    input.dispatchEvent(new w.Event('change', { bubbles:true }));
    await waitUntil(() => !busy(), 30000);
  }
  // Kanvas polos dengan satu tulisan, cukup untuk tes antarmuka (bukan tes deteksi).
  function plainScreen(name, w = 420, h = 860){
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = '#9ec5ab'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#10231a'; g.font = Math.round(w/8) + 'px sans-serif'; g.fillText(name, w*.1, h*.14);
    return { name, canvas:c };
  }
  const button = (within, label) => all(within + ' button').find(b => b.textContent.trim() === label);
  // Seret pointer di dalam aplikasi (menggambar/menggeser kotak sensor).
  function drag(from, to, target){
    const w = frame(), stage = $('#rdStage');
    const send = (type, pt, el) => el.dispatchEvent(new w.PointerEvent(type,
      { bubbles:true, clientX:pt.x, clientY:pt.y, pointerId:1, pointerType:'touch', isPrimary:true }));
    send('pointerdown', from, target || stage);
    send('pointermove', to, stage);
    send('pointerup', to, stage);
  }
  return { frame, $, all, wait, waitUntil, busy, addScreens, plainScreen, button, drag,
           app: () => frame().__qaShotDoc };
})();

// Pembuat hasil OCR tiruan untuk tes unit. Koordinat dalam piksel layar 1080×2400.
// row(y, h, x, teks): satu baris OCR; kata-kata diberi lebar ±16 px per huruf.
window.OCR = (function(){
  const CHAR_W = 16, SPACE = 10;
  function row(y, h, x, text){
    const words = [];
    for(const t of text.split(' ')){
      const w = t.length * CHAR_W;
      words.push({ t, b:{ x0:x, y0:y, x1:x + w, y1:y + h } });
      x += w + SPACE;
    }
    return words;
  }
  function screen(...rows){
    const lines = rows.map((ws, li) => ws.map(w => ({ ...w, li })));
    return { name:'tiruan.png', _ocr:{ w:1080, h:2400, lines }, _photos:[] };
  }
  const words = text => text.split(' ').map(t => ({ t }));
  return { row, screen, words };
})();
