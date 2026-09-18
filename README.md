# QA Shot Doc

Tool untuk menyusun screenshot hasil testing mobile menjadi dokumentasi rapi,
lalu mengekspornya ke **PDF** atau **DOCX**.

Dibuat karena menempel screenshot portrait satu per satu ke Word itu lambat dan
satu gambar bisa memakan satu halaman penuh.

## Cara pakai

1. **Upload** — pilih banyak gambar sekaligus, drag & drop ke area kerja, atau
   tempel langsung dari clipboard dengan `⌘V` / `Ctrl+V`.
2. **Atur** — jumlah gambar per baris, jarak antar gambar, margin, ukuran dan
   orientasi halaman. Ukuran gambar menyesuaikan otomatis.
   - seret gambar untuk mengubah urutan, atau pakai tombol ◀ ▶
   - klik area caption untuk mengetik keterangan tiap langkah
   - header dokumen, penomoran step, caption, dan bingkai bisa dimatikan
3. **Sensor data sensitif** — tombol *Sensor data* pada tiap gambar membuka
   editor layar penuh. Seret pada gambar untuk menutup area yang memuat NIK,
   tanggal/tempat lahir, nama ibu kandung, foto KTP, atau data lain. Tersedia
   tiga gaya: blok merah, blur, dan pixel. Kotak yang sudah dibuat bisa
   **digeser** dan **diubah ukurannya** lewat pegangan di sudut kanan bawah.
4. **Export** — tombol *Export PDF* atau *Export DOCX*.

Preview di layar adalah WYSIWYG: pembagian halaman yang terlihat sama persis
dengan hasil PDF.

### Mengubah urutan

Seret pegangan ⠿ di sisi kiri kartu untuk menyusun ulang (jalan di mouse maupun
sentuh; daftar ikut menggulir saat ditarik ke tepi). Di tampilan kertas, gambar
bisa diseret langsung. Tombol ↑ ↓ tetap tersedia.

### Di HP

Pada layar di bawah 820px tampilan otomatis berpindah ke **mode daftar**:
tiap gambar jadi satu kartu berisi thumbnail, kolom keterangan berukuran
normal, dan tombol urutan/sensor/hapus. Tombol *Pratinjau halaman* menampilkan
hasil susunan kertasnya. Tombol export menempel di bawah agar terjangkau jempol.
Pilihan mode yang kamu tekan sendiri tidak akan ditimpa saat ukuran layar berubah.

## Privasi

Semua proses berjalan di browser. Gambar tidak pernah dikirim ke server mana
pun — tidak ada backend, tidak ada penyimpanan, tidak ada analytics. Menutup
atau me-refresh tab akan menghapus semuanya.

### Cara kerja sensor

Sensor **dibakar ke piksel** sebelum gambar dimasukkan ke PDF/DOCX, bukan
ditumpuk sebagai kotak di atasnya. Ini penting: tool yang sekadar menggambar
kotak hitam di atas gambar meninggalkan gambar asli utuh di dalam file, dan
data aslinya bisa diambil kembali dengan mudah. Di sini piksel aslinya benar
benar hilang dari file hasil — sudah diverifikasi dengan membongkar kembali
gambar yang tertanam di PDF maupun DOCX.

Berlaku untuk semua tingkat kualitas, termasuk *Asli — tanpa kompresi*.

Efek samping yang menguntungkan: karena setiap gambar diproses ulang lewat
canvas, metadata EXIF (lokasi GPS, model perangkat) ikut hilang dari file hasil.

Catatan: **blok hitam paling aman**. Blur dan pixel menyisakan pola samar yang
secara teori masih bisa diserang untuk teks pendek berformat tetap seperti NIK.

## Sensor otomatis

Toggle **Sensor otomatis** di panel pengaturan menyalakan deteksi, dan checklist
menentukan apa saja yang ditutup. Checklist dibagi dua:

**Foto** — ditutup penuh sesuai batas fotonya:

- *Foto KTP* — dikenali dari kata khas KTP yang terbaca di dalam foto (PROVINSI,
  NIK, Tempat/Tgl Lahir, dst.), judul di dekatnya yang menyebut KTP, atau proporsi
  kartu identitas (≈1,586) disertai pas foto kecil — sehingga foto KTP kecil yang
  buram dan tanpa judul tetap tertangkap.
- *Foto selfie / wajah* — judul di dekatnya menyebut selfie/wajah, atau porsi
  warna kulitnya besar.
- *Semua foto lain* — foto yang bukan KTP/selfie (banner, produk). Mati secara
  bawaan.

Foto dideteksi lewat analisis piksel, bukan OCR: tampilan aplikasi terdiri dari
warna rata dan teks, sedangkan foto bertekstur. Wilayah bertekstur digabung, lalu
tepinya dirapatkan ke batas foto sebenarnya. Satu foto bisa masuk dua kelas
(misalnya selfie sambil memegang KTP) dan tertutup bila salah satunya dicentang.

**Data teks** — NIK, tempat lahir, tanggal lahir, nama ibu kandung, nama lengkap,
NPWP, no. HP, email, password, no. rekening/kartu, alamat. Label dikenali dalam
bahasa Indonesia maupun Inggris (`Identity Card Number`, `Mother's Name as per
Kartu Keluarga`, `Place of Birth`, `Name on Card`, `Mobile Banking Password`, …).
Tiga lapis:

- **Label** — label seperti `NIK`, `Tempat Lahir`, `Tempat/Tgl Lahir`,
  `Nama Ibu Kandung` dikenali (toleran terhadap salah baca OCR seperti `NlK`),
  lalu **nilainya** yang ditutup berdasarkan posisi: di kanan pada baris yang sama
  (halaman review dua kolom) atau tepat di bawahnya (floating label di form HP).
  Label gabungan `Tempat/Tgl Lahir` dipecah: kota ke *tempat lahir*, tanggal ke
  *tanggal lahir*, jadi masing-masing bisa dicentang sendiri.
  Sebuah teks dianggap label hanya bila berdiri sendiri, sehingga kalimat seperti
  "Masukkan NIK sesuai KTP" atau "Nama Produk" tidak ikut memicu sensor.
- **Pencarian ulang** — nilai yang sudah ditemukan dan lolos validasi dicari lagi di
  **semua** screenshot, karena data yang sama sering muncul ulang tanpa label: nama
  tercetak di gambar kartu debit, di dialog konfirmasi, di dokumen perjanjian. Toleran
  terhadap salah baca satu huruf pada kata ≥ 6 huruf (atau ≥ 4 huruf di dalam nilai
  multi-kata); nama pendek satu kata dan angka harus persis. Tempat dan tanggal lahir
  hanya dicocokkan bila seisi baris sama dengan nilainya, supaya nama kota di alamat
  tidak ikut tertutup.
- **Pola** — dengan penyaring agar tidak menyensor data yang bukan milik pribadi:
  - NIK harus lolos struktur NIK (kode provinsi 11–94 dan tanggal lahir yang sah
    di digit 7–12), jadi ID transaksi 16 digit tidak ikut tertutup.
  - Tanggal hanya dianggap tanggal lahir bila tahunnya masuk akal untuk
    kelahiran, jadi tanggal transaksi/pengajuan tidak ikut tertutup.

Sebelum OCR, gambar dinormalisasi **kontras lokal**: setiap piksel dibandingkan
dengan sekitarnya, bukan dengan satu ambang untuk seluruh layar. Tanpa ini, label
abu-abu muda hilang bila di layar yang sama ada teks hitam, dan area yang
diredupkan overlay (bottom sheet, dialog) tidak terbaca sama sekali. Polaritas
ditentukan per blok, sehingga teks putih di header merah, tombol, dan dark mode
ikut terbaca.

Foto diklasifikasikan dari keterangan di sekitarnya — di atas, di bawah, **atau di
samping** (thumbnail unggahan dengan keterangan di kanan), dan dari kata-kata khas
KTP termasuk sisi belakangnya ("Kartu Tanda Penduduk Republik Indonesia"). Bila
keterangannya menyebut dokumen lain (NPWP, kartu contoh tanda tangan, foto produk),
keterangan itulah yang menentukan; warna kulit tidak dipakai karena meja kayu di
foto dokumen pun berwarna mirip kulit.

Foto dibedakan dari **ilustrasi dan render**: pada screenshot JPEG, maskot dan
gambar kartu debit juga tampak bertekstur. Foto asli punya porsi gradasi besar dan
palet warna yang tersebar; ilustrasi tersusun dari sedikit warna rata. Foto yang
buram (misalnya wajah di layar verifikasi) dideteksi lewat jalur terpisah.

Hasil analisis disimpan per gambar, jadi mengubah checklist berlaku seketika
tanpa memindai ulang. Mematikan toggle hanya menghapus kotak otomatis — kotak
manual tetap. Kotak otomatis yang kamu geser atau ubah ukurannya berubah status
jadi manual, supaya tidak ikut terhapus saat toggle dimatikan.

Semuanya berjalan lokal: Tesseract di-host sendiri di `vendor/tesseract/`,
tidak ada gambar yang dikirim ke layanan mana pun. Unduhan pertama sekitar
6 MB lalu tersimpan di cache browser.

### Hasil pengujian

**Screenshot nyata.** Aturan deteksi dikalibrasi dan diuji pada 115 screenshot dari
tiga alur aplikasi perbankan (pembukaan rekening, aplikasi internal sales, dan
pendaftaran merchant — bahasa Indonesia dan Inggris, JPEG 1080×2400). Isinya
beragam: foto e-KTP dari kamera (sisi depan dan belakang), thumbnail KTP/selfie
dengan keterangan di samping, verifikasi wajah, overlay dan dialog redup, halaman
ringkasan dua kolom, dokumen perjanjian, serta foto dokumen pendukung. Lokasi
setiap data sensitif ditandai manual sebagai ground truth — 92 area di 37 layar —
lalu dibandingkan dengan hasil deteksi:

| Konfigurasi checklist | Area tertutup | Layar dengan area yang salah tersensor |
|---|---|---|
| Bawaan | **75/75** | **0/115** |
| Hanya foto KTP, selfie, NIK, tempat & tanggal lahir, nama ibu | **37/37** | **0/115** |
| Semua, termasuk no. rekening/kartu dan foto lain | **92/92** | **0/115** |
| Hanya foto / hanya teks | 13/13 · 62/62 | 0/115 |

Kategori yang tidak dicentang tidak ikut tersensor, dengan satu pengecualian yang
disengaja: bila nomor NPWP sama persis dengan NIK (aturan NPWP 16 digit), nomor itu
tertutup selama NIK dicentang.

Versi sebelumnya pada set yang sama: 66/75 tertutup, dengan area yang salah
tersensor di 21/115 layar — sebagian besar akibat satu nilai keliru ("Merchant"
yang dikira nilai NPWP) yang ikut disebarkan ke semua layar. Karena itu setiap nilai
kini divalidasi sesuai kategorinya sebelum dipakai atau disebarkan: NIK/NPWP/rekening
harus berisi cukup digit, nama tidak boleh berupa kalimat petunjuk atau butir daftar,
email harus mengandung `@`, dan teks bantu seperti "16 Char maks" diabaikan.

Data screenshot tersebut tidak disertakan di repo ini.

**Layar sintetis.** Untuk memastikan tidak ada regresi di luar kasus di atas
(label bahasa Indonesia, dark mode, KTP digital yang bersih), juga diuji pada 7
layar buatan (form terang, form gelap, review dua kolom, unggah KTP + selfie +
banner, foto kamera KTP, scan KTP, KTP kecil tanpa judul):

| Konfigurasi | Target tertutup | Tersensor padahal tidak boleh |
|---|---|---|
| Default (foto + teks) | 27/27 | 0/31 |
| Hanya teks (NIK, tempat/tgl lahir, ibu) | 15/15 | 0/44 |
| Hanya foto (KTP + selfie) | 5/5 | 0/50 |

Waktu pindai sekitar 1–5 detik per screenshot tergantung perangkat.

"Tidak boleh" mencakup label, tanggal pengajuan, ID transaksi 16 digit, banner
promo, dan semua kategori yang tidak dicentang.

**Batasannya, dan ini penting.** Kalibrasi di atas memakai satu aplikasi; app lain
punya font, layout, dan istilah label sendiri. Deteksi otomatis adalah **kandidat, bukan jaminan** — OCR
bisa meleset pada teks kecil, kontras rendah, atau font tidak biasa, dan satu NIK
yang lolos lebih berbahaya daripada tidak ada deteksi sama sekali, karena membuat
orang berhenti memeriksa. Sensor manual selalu tersedia sebagai jaring pengaman.

Fitur ini perlu halaman yang dibuka lewat **http/https**. Saat `index.html`
dibuka langsung dari disk (`file://`), browser memblokir worker OCR sehingga
toggle-nya dimatikan; sensor manual tetap berfungsi.

## Teknis

Satu file `index.html` tanpa build step dan tanpa dependensi eksternal saat
runtime. Dua library disatukan ke dalam file supaya tetap berfungsi meski CDN
diblokir jaringan kantor:

| Library | Versi | Sumber |
|---|---|---|
| jsPDF | 2.5.1 | `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` |
| docx  | 9.7.1 | `https://cdn.jsdelivr.net/npm/docx@9.7.1/dist/index.iife.min.js` |

Untuk memperbarui library: unduh file di atas, lalu ganti isi tag `<script>`
yang bersangkutan di bagian atas `index.html`.

Tesseract dipakai untuk sensor otomatis dan dimuat hanya saat toggle-nya
dinyalakan, dari `vendor/tesseract/` (tesseract.js 5.1.1, core LSTM varian SIMD
dan non-SIMD, serta `eng.traineddata` dari tessdata_fast).

### Catatan format

- **PDF** memakai font standar (Helvetica/WinAnsi). Emoji dan simbol seperti
  `→` atau `✓` otomatis diganti padanan ASCII agar tidak menjadi glyph acak.
  DOCX tetap Unicode penuh.
- **DOCX** mengikuti alur halaman Word, jadi posisi page break bisa sedikit
  berbeda dari PDF. Jumlah kolom, ukuran gambar, dan isi tetap sama.
- Kualitas export bisa dipilih: 150 DPI, 220 DPI, atau gambar asli tanpa
  kompresi.
