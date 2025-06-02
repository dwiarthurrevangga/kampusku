# Kampusku - Social Media Platform

## Deskripsi Aplikasi Web

Kampusku adalah platform media sosial berbasis web yang dirancang khusus untuk komunitas kampus. Aplikasi ini memungkinkan pengguna untuk berbagi postingan, berinteraksi melalui komentar dan balasan, serta mengelola profil mereka. Dibangun dengan arsitektur modern menggunakan React untuk frontend dan Pyramid Python untuk backend, Kampusku menyediakan pengalaman pengguna yang responsif dan interaktif.

### Teknologi Yang Digunakan
- **Frontend**: React 19.1.0 dengan React Router untuk navigasi
- **Backend**: Pyramid Framework (Python) dengan SQLAlchemy ORM
- **Database**: PostgreSQL
- **Styling**: Bootstrap 5.3.6 dan Tailwind CSS 4.1.5
- **Testing**: Jest dan React Testing Library dengan coverage > 60%

## Dependensi Paket (Library)

### Frontend Dependencies
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.6.0",
  "react-bootstrap": "^2.10.10",
  "bootstrap": "^5.3.6",
  "tailwindcss": "^4.1.5",
  "axios": "^1.9.0",
  "react-infinite-scroll-component": "^6.1.0",
  "web-vitals": "^2.1.4"
}
```

### Development Dependencies
```json
{
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.6.3",
  "@testing-library/user-event": "^14.6.1",
  "@testing-library/dom": "^10.4.0",
  "axios-mock-adapter": "^2.1.0"
}
```

### Backend Dependencies
```python
install_requires=[
  "pyramid",
  "pyramid_jinja2", 
  "pyramid_debugtoolbar",
  "sqlalchemy",
  "psycopg2-binary",
  "bcrypt",
  "waitress",
]
```

## Fitur Pada Aplikasi

### 🔐 Sistem Autentikasi
- **Registrasi Pengguna**: Pendaftaran akun baru dengan validasi email dan username
- **Login/Logout**: Sistem masuk dan keluar yang aman
- **Manajemen Sesi**: Persistent login dengan token authentication

### 📝 Manajemen Postingan
- **Buat Postingan**: Membuat postingan baru dengan teks
- **Edit Postingan**: Mengedit postingan yang sudah ada (hanya pemilik)
- **Hapus Postingan**: Menghapus postingan dengan konfirmasi (hanya pemilik)
- **Lihat Feed**: Timeline postingan dengan infinite scroll
- **Voting System**: Upvote dan downvote untuk postingan

### 💬 Sistem Komentar
- **Komentar Postingan**: Menambahkan komentar pada postingan
- **Balasan Komentar**: Sistem reply bertingkat untuk diskusi
- **Hapus Komentar**: Menghapus komentar (hanya pemilik)
- **Tampilan Hierarkis**: Struktur komentar dan balasan yang terorganisir

### 👤 Manajemen Profil
- **Lihat Profil**: Halaman profil pengguna dengan postingan mereka
- **Edit Profil**: Mengubah informasi username dan email
- **Validasi Form**: Validasi input dengan feedback real-time

### 🎨 User Interface
- **Responsive Design**: Antarmuka yang responsif untuk desktop dan mobile
- **Navigation Bar**: Menu navigasi yang konsisten di seluruh aplikasi
- **Loading States**: Indikator loading untuk operasi asynchronous
- **Error Handling**: Penanganan error yang user-friendly
- **Modal Confirmations**: Dialog konfirmasi untuk aksi penting

### 🔧 Fitur Teknis
- **Infinite Scrolling**: Loading postingan secara bertahap
- **Real-time Updates**: Update data tanpa refresh halaman
- **Form Validation**: Validasi input di frontend dan backend
- **Security**: Password hashing dan CORS protection
- **Testing**: Unit testing dengan coverage minimal 60%

## Instalasi dan Menjalankan Aplikasi

### Prerequisites
- Node.js (v16 atau lebih baru)
- Python 3.8+
- PostgreSQL
- npm atau yarn

### Frontend Setup
```bash
# Clone repository
git clone [repository-url]
cd kampusku

# Install dependencies
npm install

# Start development server
npm start
```

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -e .

# Setup database
alembic upgrade head

# Start server
pserve development.ini --reload
```

### Running Tests
```bash
# Frontend tests
npm test

# Backend tests (if available)
python -m pytest
```

## Available Scripts

### `npm start`
Menjalankan aplikasi dalam mode development di [http://localhost:3000](http://localhost:3000)

### `npm test`
Menjalankan test suite dengan Jest dan React Testing Library

### `npm run build`
Membangun aplikasi untuk production ke folder `build`

### `npm run eject`
**Catatan: Operasi ini tidak dapat dibatalkan!** Mengeluarkan konfigurasi build tools.

## Struktur Proyek

```
kampusku/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── pages/           # Page components
│   ├── api.js          # API client configuration
│   └── App.js          # Main application component
├── backend/
│   ├── pyramid_kampusku/  # Backend application
│   ├── alembic/          # Database migrations
│   └── setup.py          # Backend dependencies
└── tests/               # Test files
```

## Referensi

### Documentation
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [React Router](https://reactrouter.com/en/main)
- [React Bootstrap](https://react-bootstrap.netlify.app/)
- [Pyramid Framework](https://docs.pylonsproject.org/projects/pyramid/en/latest/)
- [SQLAlchemy](https://docs.sqlalchemy.org/en/20/)

### UI/UX Libraries
- [Bootstrap 5](https://getbootstrap.com/docs/5.3/getting-started/introduction/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

### Backend Technologies
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Alembic Migration Tool](https://alembic.sqlalchemy.org/en/latest/)
- [Waitress WSGI Server](https://docs.pylonsproject.org/projects/waitress/en/stable/)

### Development Tools
- [Create React App](https://create-react-app.dev/docs/getting-started/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Axios HTTP Client](https://axios-http.com/docs/intro)

---

**Kampusku** - Connecting Campus Communities Through Social Media  
Dikembangkan sebagai Tugas Besar Pemrograman Web  
© 2025

