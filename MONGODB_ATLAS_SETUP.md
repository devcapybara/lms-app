# Panduan Setup MongoDB Atlas untuk LMS App

## Langkah 1: Konfigurasi MongoDB Atlas

### 1.1 Dapatkan Connection String
1. Login ke [MongoDB Atlas](https://cloud.mongodb.com)
2. Pilih cluster Anda
3. Klik tombol "Connect"
4. Pilih "Connect your application"
5. Copy connection string yang diberikan

### 1.2 Format Connection String
Connection string akan terlihat seperti ini:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lms-app?retryWrites=true&w=majority
```

## Langkah 2: Setup Environment Variables

### 2.1 Buat file .env
Di folder `backend/`, buat file `.env` dengan konten berikut:

```env
# Database Configuration untuk MongoDB Atlas
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<dbname>?retryWrites=true&w=majority

> Catatan: Simpan URI ini hanya di file `.env` dan jangan pernah commit file `.env` ke repository.

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRE=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

### 2.2 Ganti kredensial
- Ganti `username` dengan username MongoDB Atlas Anda
- Ganti `password` dengan password MongoDB Atlas Anda
- Ganti `cluster0.xxxxx.mongodb.net` dengan URL cluster Anda
- Ganti `JWT_SECRET` dengan secret key yang aman

## Langkah 3: Konfigurasi Network Access

### 3.1 Tambahkan IP Address
1. Di MongoDB Atlas, pilih "Network Access"
2. Klik "Add IP Address"
3. Untuk development, Anda bisa pilih "Allow Access from Anywhere" (0.0.0.0/0)
4. Untuk production, tambahkan IP server Anda

## Langkah 4: Test Koneksi

### 4.1 Jalankan Server
```bash
cd backend
npm install
npm start
```

### 4.2 Cek Log
Jika berhasil, Anda akan melihat:
```
Connected to MongoDB
Server is running on port 5000
```

## Langkah 5: Migrasi Data (Opsional)

Jika Anda sudah punya data di database lokal, Anda bisa:

### 5.1 Export dari MongoDB Local
```bash
mongodump --db lms-app --out ./backup
```

### 5.2 Import ke MongoDB Atlas
```bash
mongorestore --uri "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/lms-app" ./backup/lms-app
```

## Keuntungan MongoDB Atlas

1. **Cloud Database**: Tidak perlu setup database lokal
2. **Scalability**: Mudah di-scale sesuai kebutuhan
3. **Backup Otomatis**: Backup data secara otomatis
4. **Monitoring**: Dashboard monitoring yang lengkap
5. **Security**: Keamanan tingkat enterprise
6. **Global Distribution**: Bisa deploy di berbagai region

## Troubleshooting

### Error: Authentication Failed
- Pastikan username dan password benar
- Pastikan user memiliki akses ke database

### Error: Network Access Denied
- Tambahkan IP address Anda di Network Access
- Gunakan "Allow Access from Anywhere" untuk testing

### Error: Connection Timeout
- Cek koneksi internet
- Pastikan connection string benar
- Cek apakah cluster sedang maintenance

## Catatan Penting

1. **Jangan commit file .env** ke repository
2. **Ganti JWT_SECRET** dengan secret key yang aman
3. **Backup data** sebelum migrasi
4. **Monitor usage** MongoDB Atlas untuk menghindari biaya berlebih 