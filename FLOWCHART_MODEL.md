# Flowchart Alur Utama Masing-Masing Role LMS

## 1. Admin

```mermaid
flowchart TD
    A1[Login] --> A2[Dashboard Admin]
    A2 --> A3[Manajemen User]
    A2 --> A4[Manajemen Platform Branding]
    A2 --> A5[Manajemen Kelas & Course]
    A2 --> A6[Monitoring Aktivitas User]
    A3 --> A3a[Tambah/Edit/Hapus User]
    A3 --> A3b[Ubah Role Pengguna]
    A4 --> A4a[Ubah Logo, Nama, Warna Platform]
    A5 --> A5a[Tambah/Edit/Hapus Course]
    A6 --> A7[Logout]
```

## 2. Mentor

```mermaid
flowchart TD
    M1[Login] --> M2[Dashboard Mentor]
    M2 --> M3[Lihat Daftar Course]
    M3 --> M4[Kelola Materi & Tugas]
    M4 --> M5[Review & Nilai Tugas Siswa]
    M3 --> M6[Lihat Daftar Enroll Siswa]
    M2 --> M7[Update Profil]
    M2 --> M8[Logout]
```

## 3. Student

```mermaid
flowchart TD
    S1[Login] --> S2[Dashboard Siswa]
    S2 --> S3[Lihat dan Enroll Course]
    S3 --> S4[Akses Materi]
    S4 --> S5[Kumpulkan Tugas/Kuis]
    S5 --> S6[Lihat Nilai & Progress]
    S2 --> S7[Update Profil]
    S2 --> S8[Logout]
```

---

**Penjelasan Singkat:**
- **Admin:** Memiliki akses penuh untuk mengatur user, role, branding platform, dan monitoring seluruh aktivitas.
- **Mentor:** Berperan dalam membuat, mengelola materi/tugas, dan menilai tugas siswa pada course yang diampu.
- **Student:** Mengakses materi, mengerjakan tugas, melihat hasil penilaian, dan dapat enroll ke course yang tersedia.