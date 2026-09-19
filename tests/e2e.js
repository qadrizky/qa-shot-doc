// Tes end-to-end: 7 layar sintetis (fixtures.js) dipindai dengan OCR sungguhan lewat alur
// yang sama dengan pengguna (centang dulu, lalu klik Pindai), lalu cakupan sensornya diukur
// terhadap ground truth tiap layar.
(function(){
  const { test, expect } = T;
  const frame = () => document.getElementById('app').contentWindow;
  const $ = sel => frame().document.querySelector(sel);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const fixtures = FX.all();

  async function addScreens(list){
    const w = frame(), dt = new w.DataTransfer();
    for(const f of list){
      const blob = await new Promise(r => f.c.toBlob(r, 'image/png'));
      dt.items.add(new w.File([blob], f.name + '.png', { type:'image/png' }));
    }
    const input = $('#file');
    input.files = dt.files;
    input.dispatchEvent(new w.Event('change', { bubbles:true }));
    await waitUntil(() => !$('#veil').classList.contains('on'), 30000);
  }
  async function waitUntil(done, timeoutMs){
    const until = Date.now() + timeoutMs;
    while(!done()){ if(Date.now() > until) throw new Error('waktu habis'); await wait(250); }
  }
  async function clickScan(){
    $('#bAutoRun').click();
    await wait(300);
    await waitUntil(() => !$('#veil').classList.contains('on'), 240000);
  }
  function setChecklist(cats){
    for(const box of frame().document.querySelectorAll('.cats input')){
      box.checked = cats.includes(box.dataset.cat);
      box.dispatchEvent(new (frame().Event)('change', { bubbles:true }));
    }
  }
  const button = () => $('#bAutoRun').textContent;
  const autoBoxCount = () => frame().__qaShotDoc.state.items.reduce((n, it) => n + it.red.filter(b => b.auto).length, 0);

  // Cakupan kotak sensor terhadap ground truth, untuk satu pilihan checklist.
  function coverage(cats){
    const api = frame().__qaShotDoc, state = api.state;
    state.auto.cats = Object.fromEntries(Object.keys(state.auto.cats).map(k => [k, cats.includes(k)]));
    state.auto.applied = { ...state.auto.cats }; state.auto.on = true;
    api.applyAuto();
    const photoOn = cats.some(c => c === 'ktpPhoto' || c === 'selfie');
    let hit = 0, total = 0; const missed = [], wrong = [];
    state.items.forEach((it, n) => {
      const fx = fixtures[n];
      const inBox = (x, y) => it.red.some(b => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h);
      const cov = r => { let h = 0, t = 0;
        for(let a = 0; a < 9; a++) for(let b = 0; b < 3; b++){ t++; if(inBox(r.x + r.w*(.1 + .8*a/8), r.y + r.h*(.2 + .6*b/2))) h++; }
        return h/t; };
      for(const t of fx.T){
        const coveredByPhoto = t.text && cats.includes('ktpPhoto');
        if(cats.includes(t.cat)){ total++; if(cov(t.r) >= .9) hit++; else missed.push(fx.name + ': ' + t.label); }
        else if(!coveredByPhoto && cov(t.r) > .2) wrong.push(fx.name + ': ' + t.label + ' (tidak dicentang)');
      }
      for(const t of fx.N.filter(t => !t.text || !photoOn)) if(cov(t.r) > .2) wrong.push(fx.name + ': ' + t.label);
    });
    return { hit, total, missed, wrong };
  }
  function expectPerfect(r){
    if(r.missed.length) throw new Error('lolos: ' + r.missed.join('; '));
    if(r.wrong.length) throw new Error('salah tersensor: ' + r.wrong.join('; '));
    expect(r.hit).toBe(r.total);
  }

  test('e2e', 'Alur: belum ada yang disensor sebelum tombol Pindai diklik', async () => {
    setChecklist(['ktpPhoto','selfie','nik','pob','dob','mother','name','phone','email']);
    await addScreens([fixtures[0]]);
    expect(button()).toBe('Pindai screenshot');
    expect(autoBoxCount()).toBe(0);
  });
  test('e2e', 'Alur: klik Pindai menyensor sesuai centangan', async () => {
    await clickScan();
    expect(button()).toBe('Sudah diterapkan');
    expect(autoBoxCount()).toBeAtLeast(7);
  });
  test('e2e', 'Alur: mengubah centang belum berlaku sampai Terapkan', async () => {
    const before = autoBoxCount();
    setChecklist(['ktpPhoto','selfie','pob','dob','mother','name','phone','email']);   // NIK dilepas
    expect(button()).toBe('Terapkan');
    expect(autoBoxCount()).toBe(before);
    await clickScan();
    expect(autoBoxCount()).toBe(before - 1);
  });
  test('e2e', 'Alur: screenshot baru tidak dipindai sebelum diminta', async () => {
    await addScreens(fixtures.slice(1));
    expect(button()).toBe('Pindai ' + (fixtures.length - 1) + ' screenshot baru');
    const scanned = frame().__qaShotDoc.state.items.filter(it => it._ocr).length;
    expect(scanned).toBe(1);
    await clickScan();
    expect(frame().__qaShotDoc.state.items.filter(it => it._ocr).length).toBe(fixtures.length);
  });
  test('e2e', 'Deteksi: konfigurasi bawaan (foto + data)', () => {
    expectPerfect(coverage(['ktpPhoto','selfie','nik','pob','dob','mother','name','phone','email']));
  });
  test('e2e', 'Deteksi: hanya NIK, tempat & tanggal lahir, nama ibu', () => {
    expectPerfect(coverage(['nik','pob','dob','mother']));
  });
  test('e2e', 'Deteksi: hanya foto KTP dan selfie', () => {
    expectPerfect(coverage(['ktpPhoto','selfie']));
  });

  // Unduhan dicegat: file dibuat seperti biasa, tetapi tidak disimpan ke disk.
  async function exportWith(buttonId, doneText){
    const w = frame(), A = w.HTMLAnchorElement.prototype, files = [];
    const saved = { click:A.click, dispatch:A.dispatchEvent, url:w.URL.createObjectURL };
    A.click = function(){}; A.dispatchEvent = function(){ return true; };
    w.URL.createObjectURL = blob => { files.push(blob); return saved.url.call(w.URL, blob); };
    try{
      $(buttonId).click();
      await waitUntil(() => $('#toast').textContent === doneText, 60000);
    }finally{ A.click = saved.click; A.dispatchEvent = saved.dispatch; w.URL.createObjectURL = saved.url; }
    return files;
  }
  test('e2e', 'Ekspor PDF berhasil dengan screenshot tersensor', async () => {
    const files = await exportWith('#bPdf', 'PDF sudah diunduh');
    expect(files.length).toBe(1);
    expect(files[0].type).toBe('application/pdf');
    expect(files[0].size).toBeAtLeast(20000);
  });
  test('e2e', 'Ekspor DOCX berhasil dengan screenshot tersensor', async () => {
    const files = await exportWith('#bDocx', 'DOCX sudah diunduh');
    expect(files.length).toBe(1);
    expect(files[0].type).toContain('wordprocessingml');
    expect(files[0].size).toBeAtLeast(20000);
  });
})();
