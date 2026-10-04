# FinanceV2
personal finance dashboard
<img width="1917" height="907" alt="image" src="https://github.com/user-attachments/assets/d7f65b37-7bb9-4d9e-8876-3ede8b60af26" />

## Project Structure

- `web/` — Next.js frontend (port 3000)
- `backend/` — Express API (port 3300)
- `ml/` — Flask transaction-classification service (port 5001)

## Prerequisites

- Node.js
- Python 3
- PostgreSQL

## Setup

### 1. Clone the repo

```
git clone <repo-url>
cd FinanceV2
```

### 2. Database (PostgreSQL)

Create a database named `finance`, then create the tables:

```
psql -U postgres -c "CREATE DATABASE finance;"
psql -U postgres -d finance -f backend/db/schema.sql
```

### 3. Backend (`backend/`)

```
cd backend
npm install
```

Create `backend/.env` (not committed — see `.gitignore`):

```
DB_HOST=localhost
DB_USER=postgres
DB_PORT=5432
DB_NAME=finance
DB_PASSWORD=<your-postgres-password>
ACCESS_TOKEN_SECRET=<generate-a-random-secret>
```

Run the API:

```
npm run devStart
```

### 4. Frontend (`web/`)

```
cd web
npm install
npm run dev
```

### 5. ML service (`ml/`)

```
cd ml
pip install flask pandas scikit-learn
python inference_script.py
```

### 6. Run everything at once

From the project root:

```
npm install
npm run dev
```

This uses `concurrently` to start all three services together:

- Web → http://localhost:3000
- API → http://localhost:3300
- ML → http://localhost:5001

## Notes

- `backend/.env` holds real secrets (DB password, token secret) and must never be committed — it's already excluded via `.gitignore`.
- The ML model (`ml/models/categorizer.pkl`) requires scikit-learn/numpy versions close to what it was trained with; if you see unpickling errors, upgrade `scikit-learn`/`numpy` to the latest available version.
