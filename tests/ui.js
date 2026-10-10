// Tes antarmuka: alur yang dipakai sehari-hari di luar pemindaian — mengurutkan,
// menulis keterangan, menghapus, dan editor sensor manual. Tidak memakai OCR, jadi cepat.
(function(){
  const { test, expect } = T;
  const { $, all, wait, addScreens, plainScreen, button, drag, app } = UI;
  const items = () => app().state.items;

  // Tiap tes mulai dari tiga screenshot polos dalam mode Susun (tampilan kartu).
  // Nama diberi nomor karena screenshot diurutkan berdasarkan nama saat ditambahkan.
  async function freshScreens(){
    app().state.items.length = 0;
    await addScreens(['1-satu','2-dua','3-tiga'].map(n => plainScreen(n)));
    $('#viewSeg button[data-v=list]').click();
    await wait(200);
  }
  const names = () => items().map(it => it.name).join(',');
  const cards = () => all('#cards .card');
  const cardButton = (i, label) => [...cards()[i].querySelectorAll('button')]
    .find(b => b.textContent.trim() === label);

  test('ui', 'Urutan bisa diubah lewat tombol Naikkan dan Turunkan', async () => {
    await freshScreens();
    expect(names()).toBe('1-satu.png,2-dua.png,3-tiga.png');
    cardButton(0, '↓ Turunkan').click(); await wait(150);
    expect(names()).toBe('2-dua.png,1-satu.png,3-tiga.png');
    cardButton(2, '↑ Naikkan').click(); await wait(150);
    expect(names()).toBe('2-dua.png,3-tiga.png,1-satu.png');
    expect(cardButton(0, '↑ Naikkan').disabled).toBeTrue();     // yang pertama tidak bisa naik lagi
  });

  test('ui', 'Keterangan yang diketik tersimpan di screenshot yang benar', async () => {
    await freshScreens();
    const box = cards()[1].querySelector('textarea');
    box.value = 'Langkah 2: klik Masuk';
    box.dispatchEvent(new (UI.frame().Event)('input', { bubbles:true }));
    await wait(100);
    expect(items()[1].caption).toBe('Langkah 2: klik Masuk');
    expect(items()[0].caption).toBe('');
  });

  test('ui', 'Hapus bisa diurungkan, lengkap dengan keterangan dan kotak sensornya', async () => {
    await freshScreens();
    items()[1].caption = 'keterangan penting';
    items()[1].red = [{ x:.1, y:.1, w:.3, h:.1, s:'red' }];
    cardButton(1, 'Hapus').click(); await wait(150);
    expect(names()).toBe('1-satu.png,3-tiga.png');
    const undo = [...$('#toast').querySelectorAll('button')].find(b => b.textContent === 'Urungkan');
    expect(!!undo).toBeTrue();
    undo.click(); await wait(200);
    expect(names()).toBe('1-satu.png,2-dua.png,3-tiga.png');            // kembali ke posisi semula
    expect(items()[1].caption).toBe('keterangan penting');
    expect(items()[1].red.length).toBe(1);
  });

  test('ui', 'Hapus semua minta konfirmasi dulu', async () => {
    await freshScreens();
    const w = UI.frame(), real = w.confirm;
    try{
      w.confirm = () => false;
      $('#bClear').click(); await wait(150);
      expect(items().length).toBe(3);                              // batal: tidak ada yang hilang
      w.confirm = () => true;
      $('#bClear').click(); await wait(150);
      expect(items().length).toBe(0);
    }finally{ w.confirm = real; }
  });

  /* ---------- editor sensor manual ---------- */
  async function openEditor(i){
    cardButton(i, 'Sensor').click();
    await UI.waitUntil(() => !$('#rd').hidden, 5000);
    const img = $('#rdImg');
    if(!img.complete) await new Promise(r => { img.onload = r; });
    await wait(150);
    return img.getBoundingClientRect();
  }
  const boxCount = () => all('.rdbox').length;
  const at = (r, fx, fy) => ({ x:r.left + r.width*fx, y:r.top + r.height*fy });

  test('ui', 'Kotak yang digambar tersimpan setelah Simpan', async () => {
    await freshScreens();
    const r = await openEditor(0);
    expect(boxCount()).toBe(0);
    drag(at(r, .1, .1), at(r, .6, .25));
    await wait(150);
    expect(boxCount()).toBe(1);
    $('#rdSave').click(); await wait(300);
    expect($('#rd').hidden).toBeTrue();
    expect(items()[0].red.length).toBe(1);
    expect(items()[0].red[0].auto).toBe(undefined);                // kotak manual, bukan hasil pindai
    expect(cards()[0].querySelector('.tag').textContent).toContain('1 disensor');
  });

  test('ui', 'Kotak bisa digeser dan diubah ukurannya', async () => {
    await freshScreens();
    const r = await openEditor(0);
    drag(at(r, .1, .1), at(r, .5, .2));
    await wait(150);
    const before = all('.rdbox')[0].getBoundingClientRect();
    const mid = { x:before.left + before.width/2, y:before.top + before.height/2 };
    drag(mid, { x:mid.x, y:mid.y + r.height*.3 }, all('.rdbox')[0]);
    await wait(150);
    const moved = all('.rdbox')[0].getBoundingClientRect();
    expect(Math.round(moved.top - before.top) > 20).toBeTrue();
    const grip = all('.rdbox .rz')[0], g = grip.getBoundingClientRect();
    drag({ x:g.left + g.width/2, y:g.top + g.height/2 },
         { x:g.left + g.width/2 + 40, y:g.top + g.height/2 + 30 }, grip);
    await wait(150);
    const bigger = all('.rdbox')[0].getBoundingClientRect();
    expect(Math.round(bigger.width - moved.width) > 20).toBeTrue();
    expect(Math.round(bigger.height - moved.height) > 10).toBeTrue();
  });

  test('ui', 'Urungkan membuang kotak terakhir, Batal membuang semua perubahan', async () => {
    await freshScreens();
    const r = await openEditor(0);
    drag(at(r, .1, .1), at(r, .5, .2)); await wait(120);
    $('#rdStyle button[data-v=blur]').click();
    drag(at(r, .55, .6), at(r, .9, .75)); await wait(120);
    expect(boxCount()).toBe(2);
    expect(all('.rdbox').length && app().state.items[0].red.length).toBe(0);   // belum disimpan
    $('#rdUndo').click(); await wait(120);
    expect(boxCount()).toBe(1);
    $('#rdCancel').click(); await wait(200);
    expect($('#rd').hidden).toBeTrue();
    expect(items()[0].red.length).toBe(0);                          // batal: tidak ada yang tersimpan
  });

  test('ui', 'Kotak sensor otomatis tidak hilang saat kotak manual disimpan', async () => {
    await freshScreens();
    const it = items()[0];
    it.red = [{ x:.1, y:.5, w:.4, h:.1, s:'red', auto:true, cat:'nik' }];
    it._rev = (it._rev || 0) + 1;
    const r = await openEditor(0);
    expect(boxCount()).toBe(1);
    drag(at(r, .1, .1), at(r, .5, .2)); await wait(150);
    $('#rdSave').click(); await wait(300);
    expect(items()[0].red.filter(b => b.auto).length).toBe(1);
    expect(items()[0].red.filter(b => !b.auto).length).toBe(1);
  });

  test('ui', 'Kolom Info tes punya nama yang terbaca screen reader', () => {
    const fields = all('#metaBox input');
    expect(fields.length).toBeAtLeast(5);
    const unnamed = fields.filter(f => !f.getAttribute('aria-label') && !(f.labels && f.labels.length));
    expect(unnamed.map(f => f.id).join(',')).toBe('');
  });
})();
