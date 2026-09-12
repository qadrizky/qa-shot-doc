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
   tiga gaya: blok hitam, blur, dan pixel.
4. **Export** — tombol *Export PDF* atau *Export DOCX*.

Preview di layar adalah WYSIWYG: pembagian halaman yang terlihat sama persis
dengan hasil PDF.

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

Deteksi otomatis (OCR) belum ada — semua sensor dilakukan manual. Ini disengaja:
deteksi otomatis yang meleset satu angka lebih berbahaya daripada tidak ada
sama sekali, karena membuat orang berhenti memeriksa.

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

### Catatan format

- **PDF** memakai font standar (Helvetica/WinAnsi). Emoji dan simbol seperti
  `→` atau `✓` otomatis diganti padanan ASCII agar tidak menjadi glyph acak.
  DOCX tetap Unicode penuh.
- **DOCX** mengikuti alur halaman Word, jadi posisi page break bisa sedikit
  berbeda dari PDF. Jumlah kolom, ukuran gambar, dan isi tetap sama.
- Kualitas export bisa dipilih: 150 DPI, 220 DPI, atau gambar asli tanpa
  kompresi.
