// Fixture uji: layar aplikasi mobile sintetis dengan ground truth per area.
// targets   = area yang HARUS tertutup (dengan kategori)
// negatives = area yang TIDAK BOLEH tertutup
window.FX = (function(){
  const W = 1080, H = 2340, F = 'Helvetica, Arial, sans-serif';
  const cl = v => v < 0 ? 0 : v > 255 ? 255 : v;
  function mk(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function rnd(seed){ let s = seed % 2147483647 || 1; return () => (s = s*16807 % 2147483647) / 2147483647; }
  function rr(ctx, x, y, w, h, r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
  // Tekstur "foto": warna dasar + variasi cahaya frekuensi rendah + noise sensor.
  function photo(ctx, X, Y, w, h, base, amp, seed){
    const im = ctx.getImageData(X, Y, w, h), d = im.data, R = rnd(seed);
    for(let y=0;y<h;y++) for(let x=0;x<w;x++){
      const i = (y*w+x)*4, low = 22*Math.sin(x/41+seed) + 16*Math.cos(y/57+seed*2) + 9*Math.sin((x+y)/29);
      d[i]   = cl(base[0] + low + (R()-.5)*amp);
      d[i+1] = cl(base[1] + low*.9 + (R()-.5)*amp);
      d[i+2] = cl(base[2] + low*.8 + (R()-.5)*amp);
      d[i+3] = 255;
    }
    ctx.putImageData(im, X, Y);
  }
  // Noise kamera di atas gambar yang sudah ada.
  function grain(ctx, X, Y, w, h, amp, seed){
    const im = ctx.getImageData(X, Y, w, h), d = im.data, R = rnd(seed);
    for(let i=0;i<d.length;i+=4){ const n = (R()-.5)*amp;
      d[i] = cl(d[i]+n); d[i+1] = cl(d[i+1]+n); d[i+2] = cl(d[i+2]+n); }
    ctx.putImageData(im, X, Y);
  }
  function face(ctx, X, Y, w, h, bg, seed){
    photo(ctx, X, Y, w, h, bg, 34, seed);
    const cx = X+w/2, cy = Y+h*.45;
    ctx.fillStyle = '#3b2a20'; ctx.beginPath(); ctx.ellipse(cx, cy-h*.08, w*.30, h*.30, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#d9a07c'; ctx.beginPath(); ctx.ellipse(cx, cy, w*.24, h*.28, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#c98c68'; ctx.beginPath(); ctx.ellipse(cx, cy+h*.12, w*.16, h*.08, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath(); ctx.ellipse(cx-w*.09, cy-h*.04, w*.025, h*.015, 0, 0, 7); ctx.fill();
    ctx.beginPath(); ctx.ellipse(cx+w*.09, cy-h*.04, w*.025, h*.015, 0, 0, 7); ctx.fill();
    ctx.fillStyle = '#d9a07c'; ctx.fillRect(cx-w*.08, cy+h*.25, w*.16, h*.12);
    ctx.fillStyle = '#2f4f7f'; ctx.beginPath(); ctx.ellipse(cx, Y+h*1.02, w*.45, h*.28, 0, 0, 7); ctx.fill();
    grain(ctx, X, Y, w, h, 26, seed+7);
  }
  // Kartu KTP. Mengembalikan posisi teks nilai (px) untuk ground truth.
  function ktp(ctx, X, Y, w, h, seed){
    const s = w/900, out = {};
    ctx.save(); rr(ctx, X, Y, w, h, 28*s); ctx.clip();
    photo(ctx, X, Y, w, h, [178, 214, 236], 18, seed);
    ctx.fillStyle = '#111'; ctx.textAlign = 'center';
    ctx.font = 'bold '+(30*s)+'px '+F; ctx.fillText('PROVINSI DKI JAKARTA', X+w/2, Y+50*s);
    ctx.fillText('JAKARTA SELATAN', X+w/2, Y+88*s);
    ctx.textAlign = 'left';
    const rows = [['NIK','3174014509900002',true],['Nama','BUDI SANTOSO'],['Tempat/Tgl Lahir','JAKARTA, 05-09-1990'],
      ['Jenis Kelamin','LAKI-LAKI'],['Alamat','JL. MELATI NO. 10'],['Agama','ISLAM'],
      ['Status Perkawinan','BELUM KAWIN'],['Pekerjaan','KARYAWAN SWASTA'],['Kewarganegaraan','WNI'],['Berlaku Hingga','SEUMUR HIDUP']];
    let y = Y+150*s;
    rows.forEach(([l,v,big])=>{
      const fs = (big ? 34 : 24)*s;
      ctx.font = (big?'bold ':'')+fs+'px '+F; ctx.fillText(l, X+34*s, y);
      ctx.fillText(':', X+250*s, y);
      ctx.fillText(v, X+270*s, y);
      out[l] = { x:X+270*s, y:y-fs*.78, w:ctx.measureText(v).width, h:fs*.95 };
      y += (big ? 50 : 36)*s;
    });
    face(ctx, X+w*.72, Y+h*.30, w*.22, h*.52, [52, 96, 186], seed+3);
    ctx.restore();
    return out;
  }
  const R = (x,y,w,h) => ({ x:x/W, y:y/H, w:w/W, h:h/H });
  function textRect(ctx, t, x, y, fs){ return R(x, y-fs*.78, ctx.measureText(t).width, fs*.95); }

  /* ---------- F1: form terang dengan floating label ---------- */
  function form(dark){
    const c = mk(W,H), x = c.getContext('2d'), T = [], N = [];
    const bg = dark ? '#0f1115' : '#ffffff', fg = dark ? '#e6e8eb' : '#1f2328',
          mu = dark ? '#8b93a1' : '#6b7280', bd = dark ? '#343a46' : '#d0d5dd', box = dark ? '#171a21' : '#ffffff';
    x.fillStyle = bg; x.fillRect(0,0,W,H);
    x.fillStyle = fg; x.font = 'bold 56px '+F; x.fillText('Data Diri', 150, 150);
    x.font = '60px '+F; x.fillText('‹', 50, 152);
    x.fillStyle = mu; x.font = '36px '+F; x.fillText('Langkah 2 dari 4 · Lengkapi sesuai KTP', 60, 280);
    const fields = [['NIK','3174014509900002','nik'],['Nama Lengkap (sesuai KTP)','Budi Santoso','name'],
      ['Tempat Lahir','Jakarta','pob'],['Tanggal Lahir','05/09/1990','dob'],['Nama Ibu Kandung','Siti Aminah','mother'],
      ['No. HP','0812-3456-7890','phone'],['Email','budi.santoso@mail.com','email']];
    let y = 360;
    fields.forEach(([lab,val,cat])=>{
      x.strokeStyle = bd; x.lineWidth = 3; rr(x, 60, y, 960, 150, 22); x.fillStyle = box; x.fill(); x.stroke();
      x.font = '32px '+F; const lw = x.measureText(lab).width;
      x.fillStyle = bg; x.fillRect(90, y-20, lw+24, 40);
      x.fillStyle = mu; x.fillText(lab, 102, y+11);
      N.push({ label:'label '+lab, r:textRect(x, lab, 102, y+11, 32) });
      x.fillStyle = fg; x.font = '44px '+F; x.fillText(val, 100, y+95);
      T.push({ cat, label:lab, r:textRect(x, val, 100, y+95, 44) });
      if(cat === 'dob'){ x.strokeStyle = mu; rr(x, 940, y+45, 50, 50, 8); x.stroke(); }
      y += 200;
    });
    x.fillStyle = mu; x.font = '34px '+F;
    x.fillText('Tanggal pengajuan: 12/09/2026', 60, y+40);
    N.push({ label:'tanggal pengajuan', r:textRect(x, '12/09/2026', 60+x.measureText('Tanggal pengajuan: ').width, y+40, 34) });
    x.fillText('ID Pengajuan: 1234567890123456', 60, y+100);
    N.push({ label:'ID pengajuan 16 digit', r:textRect(x, '1234567890123456', 60+x.measureText('ID Pengajuan: ').width, y+100, 34) });
    x.fillStyle = '#2563eb'; rr(x, 60, H-240, 960, 140, 70); x.fill();
    x.fillStyle = '#fff'; x.font = 'bold 44px '+F; x.textAlign = 'center'; x.fillText('Lanjutkan', W/2, H-155); x.textAlign = 'left';
    return { name: dark ? '3-form-gelap' : '1-form-terang', c, T, N };
  }

  /* ---------- F2: halaman review dua kolom ---------- */
  function review(){
    const c = mk(W,H), x = c.getContext('2d'), T = [], N = [];
    x.fillStyle = '#f5f6f8'; x.fillRect(0,0,W,H);
    x.fillStyle = '#fff'; x.fillRect(0,0,W,220);
    x.fillStyle = '#1f2328'; x.font = 'bold 54px '+F; x.fillText('Konfirmasi Data', 60, 150);
    x.fillStyle = '#fff'; rr(x, 40, 280, 1000, 1300, 28); x.fill();
    const rows = [['NIK','3174014509900002','nik'],['Nama','BUDI SANTOSO','name'],
      ['Tempat/Tgl Lahir','JAKARTA, 05-09-1990','pobdob'],['Nama Ibu Kandung','SITI AMINAH','mother'],
      ['Jenis Kelamin','Laki-laki',null],['Pekerjaan','Karyawan Swasta',null],['No. Transaksi','INV/2026/09/000123',null]];
    let y = 400;
    rows.forEach(([lab,val,cat])=>{
      x.fillStyle = '#6b7280'; x.font = '38px '+F; x.fillText(lab, 90, y);
      N.push({ label:'label '+lab, r:textRect(x, lab, 90, y, 38) });
      x.fillStyle = '#1f2328'; x.font = 'bold 40px '+F; const vw = x.measureText(val).width;
      x.fillText(val, 990-vw, y);
      const r = textRect(x, val, 990-vw, y, 40);
      if(cat === 'pobdob'){
        const pw = x.measureText('JAKARTA,').width, dw = x.measureText('05-09-1990').width;
        T.push({ cat:'pob', label:'tempat lahir', r:R(990-vw, y-40*.78, pw, 38) });
        T.push({ cat:'dob', label:'tanggal lahir', r:R(990-dw, y-40*.78, dw, 38) });
      }else if(cat) T.push({ cat, label:lab, r });
      else N.push({ label:'nilai '+lab, r });
      x.fillStyle = '#eceef2'; x.fillRect(90, y+50, 900, 3);
      y += 170;
    });
    return { name:'2-review-2kolom', c, T, N };
  }

  /* ---------- F4: unggah foto KTP + selfie + banner promo ---------- */
  function upload(){
    const c = mk(W,H), x = c.getContext('2d'), T = [], N = [];
    x.fillStyle = '#fff'; x.fillRect(0,0,W,H);
    x.fillStyle = '#1f2328'; x.font = 'bold 54px '+F; x.fillText('Unggah Dokumen', 60, 150);
    x.font = 'bold 40px '+F; x.fillText('Foto KTP', 60, 290);
    ktp(x, 90, 330, 900, 568, 11);
    T.push({ cat:'ktpPhoto', label:'foto KTP', r:R(90, 330, 900, 568) });
    x.fillStyle = '#1f2328'; x.font = 'bold 40px '+F; x.fillText('Foto Selfie', 60, 1010);
    face(x, 240, 1050, 600, 760, [120, 136, 150], 21);
    T.push({ cat:'selfie', label:'foto selfie', r:R(240, 1050, 600, 760) });
    x.fillStyle = '#6b7280'; x.font = '34px '+F; x.fillText('Promo untukmu', 60, 1900);
    photo(x, 90, 1940, 900, 300, [60, 140, 90], 60, 31);
    N.push({ label:'banner promo (bukan KTP/selfie)', r:R(90, 1940, 900, 300) });
    N.push({ label:'judul Foto KTP', r:textRect(x, 'Foto KTP', 60, 290, 40) });
    return { name:'4-unggah-foto', c, T, N };
  }

  /* ---------- F5: foto kamera KTP satu layar penuh ---------- */
  function camera(){
    const c = mk(W,H), x = c.getContext('2d'), T = [], N = [];
    photo(x, 0, 0, W, H, [120, 98, 76], 40, 41);
    ktp(x, 60, 820, 960, 606, 43);
    grain(x, 0, 0, W, H, 18, 47);
    T.push({ cat:'ktpPhoto', label:'seluruh foto kamera', r:R(0, 0, W, H) });
    return { name:'5-kamera-ktp', c, T, N };
  }

  /* ---------- F6: scan KTP bersih (uji deteksi teks di kartu) ---------- */
  function ktpScan(){
    const c = mk(1800, 1136), x = c.getContext('2d'), T = [], N = [];
    const p = ktp(x, 0, 0, 1800, 1136, 51);
    const rel = r => ({ x:r.x/1800, y:r.y/1136, w:r.w/1800, h:r.h/1136 });
    T.push({ cat:'ktpPhoto', label:'kartu KTP', r:{x:0,y:0,w:1,h:1} });
    T.push({ cat:'nik', label:'NIK di kartu', r:rel(p['NIK']), text:true });
    const t = p['Tempat/Tgl Lahir'];
    x.font = '48px '+F;
    const pw = x.measureText('JAKARTA,').width, dw = x.measureText('05-09-1990').width;
    T.push({ cat:'pob', label:'tempat lahir di kartu', r:rel({x:t.x, y:t.y, w:pw, h:t.h}), text:true });
    T.push({ cat:'dob', label:'tanggal lahir di kartu', r:rel({x:t.x+t.w-dw, y:t.y, w:dw, h:t.h}), text:true });
    N.push({ label:'agama (bukan target)', r:rel(p['Agama']), text:true });
    return { name:'6-scan-ktp', c, T, N };
  }


  /* ---------- F7: foto KTP kecil, buram, tanpa judul ---------- */
  function smallKtp(){
    const c = mk(W,H), x = c.getContext('2d'), T = [], N = [];
    x.fillStyle = '#fff'; x.fillRect(0,0,W,H);
    x.fillStyle = '#1f2328'; x.font = 'bold 54px '+F; x.fillText('Ringkasan Pengajuan', 60, 150);
    x.fillStyle = '#6b7280'; x.font = '34px '+F; x.fillText('Dokumen yang sudah diunggah', 60, 260);
    const k = mk(900, 568); ktp(k.getContext('2d'), 0, 0, 900, 568, 61);
    x.filter = 'blur(2.2px)'; x.drawImage(k, 60, 320, 380, 240); x.filter = 'none';
    grain(x, 60, 320, 380, 240, 16, 63);
    T.push({ cat:'ktpPhoto', label:'KTP kecil tanpa judul', r:R(60, 320, 380, 240) });
    x.fillStyle = '#1f2328'; x.font = '38px '+F; x.fillText('Status: Menunggu verifikasi', 60, 680);
    N.push({ label:'teks status', r:textRect(x, 'Menunggu verifikasi', 60+x.measureText('Status: ').width, 680, 38) });
    return { name:'7-ktp-kecil', c, T, N };
  }

  return { all: () => [form(false), review(), form(true), upload(), camera(), ktpScan(), smallKtp()] };
})();
