# Technical Specification: Aplikasi Bank Sampah

## 1. Project Overview
Aplikasi Bank Sampah berbasis Client-Server (REST API). Terdiri dari Frontend (React.js) untuk antarmuka pengguna dan Backend (Express.js) untuk logika bisnis dan manajemen database.

- **Frontend:** React.js, Vite, Tailwind CSS, Axios, React Router DOM.
- **Backend:** Node.js, Express.js, MySQL2, JWT (JSON Web Token), Bcrypt, Zod/Joi (Validation).
- **Database:** MySQL.

## 2. Architecture & Data Flow
User -> React (Tailwind) -> Axios -> Express.js REST API -> Controller -> Service / Model -> MySQL -> JSON Response -> React.

## 3. Directory Structure

### Frontend (required-men/)
├── src/
│   ├── components/  # Reusable UI components (Buttons, Cards, Inputs)
│   ├── pages/       # Page components (Login, Dashboard, Transactions)
│   ├── layouts/     # Page layouts (Sidebar, Navbar)
│   ├── services/    # Axios configuration and API calls (api.js)
│   ├── hooks/       # Custom React hooks
│   ├── context/     # Global state management (AuthContext)
│   └── App.jsx      # Main router configuration
└── package.json

### Backend (required-men-api/)
├── src/
│   ├── controllers/ # Request handling and response formatting
│   ├── routes/      # Express route definitions
│   ├── models/      # Database queries (MySQL2)
│   ├── middleware/  # JWT Auth & Request validation
│   ├── services/    # Business logic
│   ├── config/      # Database & Environment variables setup
│   └── server.js    # Entry point Express app
└── package.json

## 4. Database Schema (MySQL)

### Table: `users` (Pengguna & Nasabah)
| Column      | Type         | Notes                               |
|-------------|--------------|-------------------------------------|
| id          | INT (PK)     | Auto Increment                      |
| name        | VARCHAR(100) | Nama lengkap                        |
| email       | VARCHAR(100) | Unique                              |
| password    | VARCHAR(255) | Hashed by Bcrypt                    |
| role        | ENUM         | 'admin', 'nasabah'                  |
| balance     | DECIMAL      | Saldo tabungan nasabah (Default: 0) |
| created_at  | TIMESTAMP    | Default CURRENT_TIMESTAMP           |

### Table: `trash_categories` (Kategori Sampah)
| Column        | Type         | Notes                           |
|---------------|--------------|---------------------------------|
| id            | INT (PK)     | Auto Increment                  |
| name          | VARCHAR(100) | ex: Plastik, Kertas, Logam      |
| price_per_kg  | DECIMAL      | Harga beli per kilogram         |
| created_at    | TIMESTAMP    | Default CURRENT_TIMESTAMP       |

### Table: `transactions` (Transaksi Setor Sampah)
| Column        | Type         | Notes                                    |
|---------------|--------------|------------------------------------------|
| id            | INT (PK)     | Auto Increment                           |
| nasabah_id    | INT (FK)     | Refers to users(id)                      |
| admin_id      | INT (FK)     | Refers to users(id)                      |
| total_weight  | DECIMAL      | Total berat keseluruhan (kg)             |
| total_amount  | DECIMAL      | Total uang yang didapat                  |
| status        | ENUM         | 'pending', 'completed'                   |
| created_at    | TIMESTAMP    | Default CURRENT_TIMESTAMP                |

### Table: `transaction_details` (Detail Item Transaksi)
| Column          | Type         | Notes                               |
|-----------------|--------------|-------------------------------------|
| id              | INT (PK)     | Auto Increment                      |
| transaction_id  | INT (FK)     | Refers to transactions(id)          |
| category_id     | INT (FK)     | Refers to trash_categories(id)      |
| weight          | DECIMAL      | Berat per item (kg)                 |
| subtotal        | DECIMAL      | weight * price_per_kg dari kategori |

## 5. AI Assistant Rules (Strict Instructions)
1. **Modularity:** Always separate business logic (services) from request handling (controllers).
2. **Security:** Never hardcode credentials. Always use `process.env`. Passwords must be hashed using `bcrypt` before saving.
3. **Authentication:** Use JWT for protected routes. Send tokens via Authorization header (`Bearer <token>`).
4. **Consistency:** Return API responses in a consistent JSON format: `{ "success": boolean, "message": string, "data": object/array }`.
5. **Efficiency:** Only generate the specific code requested by the user. Do not generate unrelated files or rewrite existing code unless explicitly asked.