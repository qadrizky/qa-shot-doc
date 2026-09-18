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
NPWP, no. HP, email, no. rekening/kartu, alamat. Dua lapis:

- **Label** — label seperti `NIK`, `Tempat Lahir`, `Tempat/Tgl Lahir`,
  `Nama Ibu Kandung` dikenali (toleran terhadap salah baca OCR seperti `NlK`),
  lalu **nilainya** yang ditutup berdasarkan posisi: di kanan pada baris yang sama
  (halaman review dua kolom) atau tepat di bawahnya (floating label di form HP).
  Label gabungan `Tempat/Tgl Lahir` dipecah: kota ke *tempat lahir*, tanggal ke
  *tanggal lahir*, jadi masing-masing bisa dicentang sendiri.
  Sebuah teks dianggap label hanya bila berdiri sendiri, sehingga kalimat seperti
  "Masukkan NIK sesuai KTP" atau "Nama Produk" tidak ikut memicu sensor.
- **Pola** — dengan penyaring agar tidak menyensor data yang bukan milik pribadi:
  - NIK harus lolos struktur NIK (kode provinsi 11–94 dan tanggal lahir yang sah
    di digit 7–12), jadi ID transaksi 16 digit tidak ikut tertutup.
  - Tanggal hanya dianggap tanggal lahir bila tahunnya masuk akal untuk
    kelahiran, jadi tanggal transaksi/pengajuan tidak ikut tertutup.

Sebelum OCR, gambar diubah ke abu-abu, dibalik bila dark mode, dan kontrasnya
direntangkan agar label abu-abu muda terbaca.

Hasil analisis disimpan per gambar, jadi mengubah checklist berlaku seketika
tanpa memindai ulang. Mematikan toggle hanya menghapus kotak otomatis — kotak
manual tetap. Kotak otomatis yang kamu geser atau ubah ukurannya berubah status
jadi manual, supaya tidak ikut terhapus saat toggle dimatikan.

Semuanya berjalan lokal: Tesseract di-host sendiri di `vendor/tesseract/`,
tidak ada gambar yang dikirim ke layanan mana pun. Unduhan pertama sekitar
6 MB lalu tersimpan di cache browser.

### Hasil pengujian

Diukur pada 7 layar uji sintetis (form terang, form gelap, review dua kolom,
unggah KTP + selfie + banner, foto kamera KTP, scan KTP, KTP kecil tanpa judul):

| Konfigurasi | Target tertutup | Tersensor padahal tidak boleh |
|---|---|---|
| Versi sebelumnya | 20/26 | 6/31 |
| Default (foto + teks) | 27/27 | 0/31 |
| Hanya teks (NIK, tempat/tgl lahir, ibu) | 15/15 | 0/42 |
| Hanya foto (KTP + selfie) | 4/4 | 0/49 |

"Tidak boleh" mencakup label, tanggal pengajuan, ID transaksi 16 digit, banner
promo, dan semua kategori yang tidak dicentang.

**Batasannya, dan ini penting.** Layar uji di atas buatan sendiri; screenshot
nyata lebih beragam. Deteksi otomatis adalah **kandidat, bukan jaminan** — OCR
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
