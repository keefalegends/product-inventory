# Inventory App — AWS Elastic Beanstalk + RDS

Aplikasi inventory management berbasis Node.js + Express + PostgreSQL (RDS).

---

## 🚀 Deploy ke Elastic Beanstalk

### 1. Persiapan

```bash
npm install
```

### 2. ZIP project untuk upload ke EB

```bash
zip -r inventory-app.zip . -x "node_modules/*" ".env" ".git/*"
```

### 3. Buat Elastic Beanstalk Environment

- Platform: **Node.js 18**
- Upload file `inventory-app.zip`

### 4. Set Environment Variables di EB

Masuk ke: **Configuration → Software → Environment Properties**, tambahkan:

| Key            | Value                          |
|----------------|-------------------------------|
| NODE_ENV       | production                    |
| RDS_HOSTNAME   | (endpoint RDS)                |
| RDS_PORT       | 5432                          |
| RDS_DB_NAME    | inventory                     |
| RDS_USERNAME   | (username RDS)                |
| RDS_PASSWORD   | (password RDS)                |

> **Tip:** Kalau RDS di-attach langsung ke EB environment, variabel `RDS_*` otomatis ter-inject.

### 5. RDS Setup (dilakukan sendiri)

- Engine: **PostgreSQL 15+**
- Database name: `inventory`
- Pastikan Security Group RDS allow inbound dari Security Group EB di port 5432
- Tabel akan otomatis dibuat saat app pertama kali jalan

---

## 💻 Local Development

```bash
cp .env.example .env
# Edit .env dengan koneksi RDS atau PostgreSQL lokal

npm install
npm run dev   # http://localhost:8080
```

---

## 📁 Struktur Project

```
inventory-app/
├── app.js              # Entry point
├── config/
│   ├── db.js           # PostgreSQL connection pool
│   └── init.js         # Auto-create tables
├── routes/
│   └── products.js     # CRUD routes
├── views/
│   ├── index.ejs       # Product list
│   ├── form.ejs        # Add/Edit form
│   └── error.ejs
├── public/
│   └── css/style.css
├── Procfile            # For EB
└── .env.example
```

---

## 🔗 Endpoints

| Method | Path               | Deskripsi         |
|--------|--------------------|-------------------|
| GET    | /products          | List semua produk |
| GET    | /products/new      | Form tambah produk|
| POST   | /products          | Simpan produk baru|
| GET    | /products/:id/edit | Form edit         |
| PUT    | /products/:id      | Update produk     |
| DELETE | /products/:id      | Hapus produk      |
| GET    | /health            | Health check EB   |
