// Tes unit: logika deteksi dengan hasil OCR tiruan (tanpa OCR sungguhan, jadi cepat).
// Setiap kasus mengunci satu perilaku yang pernah salah selama kalibrasi.
// Semua nama, nomor, dan email di sini fiktif.
(function(){
  const { test, expect } = T, { row, screen, words } = OCR;
  const app = () => window.APP();
  const only = (...cats) => Object.fromEntries(cats.map(c => [c, true]));
  const boxes = (item, ...cats) => app().detect(item, only(...cats));
  const values = (list, cat) => list.filter(b => b.cat === cat).map(b => String(b.val).trim());

  /* ---------- pola ---------- */
  test('unit', 'NIK dengan struktur sah dikenali', () => {
    expect(app().nikLike('3174014509900002')).toBeTrue();
  });
  test('unit', 'ID transaksi 16 digit bukan NIK', () => {
    expect(app().nikLike('1234567890123456')).toBeFalse();
  });
  test('unit', 'Tanggal lahir dikenali, termasuk format 28-Jul-2003', () => {
    expect(app().dobLike('05/09/1990')).toBeTrue();
    expect(app().dobLike('28-Jul-2003')).toBeTrue();
  });
  test('unit', 'Tanggal pengajuan (tahun sekarang) bukan tanggal lahir', () => {
    expect(app().dobLike('12/09/' + new Date().getFullYear())).toBeFalse();
  });
  test('unit', 'Nomor HP seluler dikenali', () => {
    expect(values(boxes(screen(row(100, 34, 60, '0812-3456-7890')), 'phone'), 'phone').length).toBe(1);
  });
  test('unit', 'Kode dokumen berisi angka bukan nomor HP', () => {
    expect(boxes(screen(row(100, 30, 60, 'Nomor : ABC260800000015')), 'phone').length).toBe(0);
  });
  test('unit', 'Nominal "2.000.000.000" bukan nomor rekening, nomor kartu iya', () => {
    expect(boxes(screen(row(100, 30, 60, 'Rp 2.000.000.000')), 'account').length).toBe(0);
    expect(boxes(screen(row(100, 30, 60, '5576-1234-5678-9012')), 'account').length).toBe(1);
  });

  /* ---------- label → nilai ---------- */
  test('unit', 'Floating label: nilai di bawah label', () => {
    const s = screen(row(100, 25, 60, 'Nama Ibu Kandung'), row(150, 34, 60, 'Siti Aminah'));
    expect(values(boxes(s, 'mother'), 'mother').join('|')).toBe('Siti Aminah');
  });
  test('unit', 'Dua kolom: nilai di kanan label (baris OCR terpisah)', () => {
    const s = screen(row(300, 30, 60, 'Nama'), row(300, 30, 700, 'BUDI SANTOSO'));
    expect(values(boxes(s, 'name'), 'name').join('|')).toBe('BUDI SANTOSO');
  });
  test('unit', 'Teks bantu "16 Char maks" di samping label diabaikan', () => {
    const s = screen(row(500, 25, 60, 'NPWP'), row(500, 25, 800, '16 Char maks'), row(550, 34, 60, '3174014509900002'));
    const v = values(boxes(s, 'npwp'), 'npwp');
    expect(v.join('|')).toBe('3174014509900002');
  });
  test('unit', 'Judul dialog + kalimat petunjuk bukan pasangan label-nilai', () => {
    const s = screen(row(100, 30, 60, 'Nama Ibu Kandung'),
                     row(160, 28, 60, 'Pastikan nama ibu kandung yang diinput:'),
                     row(210, 28, 60, '1. Sesuai data di Kartu Keluarga'));
    expect(boxes(s, 'mother').length).toBe(0);
  });
  test('unit', 'Keterangan label "(sesuai KTP)" tidak dianggap nilai', () => {
    const s = screen(row(100, 25, 60, 'Nama Lengkap (sesuai KTP)'), row(150, 34, 60, 'Budi Santoso'));
    expect(values(boxes(s, 'name'), 'name').join('|')).toBe('Budi Santoso');
  });
  test('unit', 'Opsi daftar "E-mail" bukan label', () => {
    const s = screen(row(100, 30, 60, 'Telepon'), row(170, 30, 60, 'SMS'),
                     row(240, 30, 60, 'E-mail'), row(310, 30, 60, 'Aplikasi Lainnya'));
    expect(boxes(s, 'email').length).toBe(0);
  });
  test('unit', 'Alamat email tidak terbaca sebagai label "Email"', () => {
    const s = screen(row(100, 34, 60, 'budi.santoso@mail.com'), row(160, 30, 60, 'Tanggal pengajuan: 12/09/2026'));
    const found = boxes(s, 'email');
    expect(found.length).toBe(1);
    expect(found[0].val).toContain('@');
  });
  test('unit', 'Label gabungan Tempat/Tgl Lahir dipecah ke dua kategori', () => {
    const s = screen(row(100, 30, 60, 'Tempat/Tgl Lahir : JAKARTA, 05-09-1990'));
    const found = app().computeAutoBoxes([s], only('pob', 'dob')).get(s);   // label dan pola sama-sama menemukan tanggal; hasil akhirnya satu kotak
    expect(values(found, 'pob').join('|')).toBe('JAKARTA,');
    expect(values(found, 'dob').join('|')).toBe('05-09-1990');
  });
  test('unit', 'Label "NIK / No. E-KTP" dengan nilai dua kolom', () => {
    const s = screen(row(300, 30, 60, 'NIK / No. E-KTP'), row(300, 30, 650, '3174014509900002'));
    expect(values(boxes(s, 'nik'), 'nik')[0]).toBe('3174014509900002');
  });

  /* ---------- validasi nilai ---------- */
  test('unit', 'Validasi: kata biasa bukan nilai NPWP', () => {
    expect(app().valueOk('npwp', words('Merchant'))).toBeFalse();
  });
  test('unit', 'Validasi: butir daftar bukan nama ibu', () => {
    expect(app().valueOk('mother', words('1. Sesuai data di Kartu Keluarga'))).toBeFalse();
    expect(app().valueOk('name', words('Budi Santoso'))).toBeTrue();
  });

  /* ---------- penyebaran nilai ---------- */
  test('unit', 'Toleransi salah baca: hanya untuk kata panjang atau nilai multi-kata', () => {
    expect(app().wordEq('anda', 'aida', false)).toBeFalse();
    expect(app().wordEq('dianz', 'diana', true)).toBeTrue();
    expect(app().wordEq('dianz', 'diana', false)).toBeFalse();
  });
  test('unit', 'Nilai yang ditemukan ikut menutup kemunculan tanpa label di screenshot lain', () => {
    const a = screen(row(100, 25, 60, 'Nama Ibu Kandung'), row(150, 34, 60, 'Siti Aminah'));
    const b = screen(row(900, 30, 60, 'Konfirmasi'), row(960, 30, 60, 'Siti Aminah'));
    const result = app().computeAutoBoxes([a, b], only('mother'));
    expect(result.get(b).filter(x => x.cat === 'mother').length).toBe(1);
  });
  test('unit', 'Nama pendek "SITI" tidak menutup kata "Situ"', () => {
    const a = screen(row(100, 25, 60, 'Nama Depan'), row(150, 34, 60, 'SITI'));
    const b = screen(row(400, 30, 60, 'Situ telah memilih produk'), row(460, 30, 60, 'SITI'));
    const found = app().computeAutoBoxes([a, b], only('name')).get(b);
    expect(found.length).toBe(1);
    expect(Math.round(found[0].y * 2400)).toBeAtLeast(440);
  });

  /* ---------- pesan ---------- */
  test('unit', 'Pesan tambah screenshot menghitung yang benar-benar masuk', () => {
    const msg = app().addedMessage(4, ['foto.heic']);
    expect(msg).toContain('4 screenshot ditambahkan');
    expect(msg).toContain('1 tidak bisa dibuka: foto.heic');
  });
})();
