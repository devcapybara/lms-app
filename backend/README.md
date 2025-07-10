# Backend LMS App

## Catatan Update

### 11 Juli 2024
- **Security:**
  - Path traversal vulnerability pada file serving (upload.js) sudah diperbaiki dengan validasi path yang aman.
  - Stored XSS pada konten pelajaran sudah dicegah dengan sanitasi di frontend (dompurify) dan backend (dompurify + jsdom).
- **Dependencies:**
  - Ditambahkan: `dompurify`, `jsdom` (backend) 