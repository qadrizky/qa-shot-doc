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
3. **Export** — tombol *Export PDF* atau *Export DOCX*.

Preview di layar adalah WYSIWYG: pembagian halaman yang terlihat sama persis
dengan hasil PDF.

## Privasi

Semua proses berjalan di browser. Gambar tidak pernah dikirim ke server mana
pun — tidak ada backend, tidak ada penyimpanan, tidak ada analytics. Menutup
atau me-refresh tab akan menghapus semuanya.

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
