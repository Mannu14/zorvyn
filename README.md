# Finance Dashboard Backend

A REST API backend for a multi-role finance dashboard. Users interact with financial records differently depending on their role — **VIEWER**, **ANALYST**, or **ADMIN**.

---

## Tech Stack

| Technology | Why I used it |
|---|---|
| **Node.js + Express** | Comfortable with it, fast to set up, good for REST APIs |
| **MongoDB + Mongoose** | Aggregation pipeline makes dashboard queries straightforward; flexible schema for financial records |
| **JWT** | Stateless auth, easy to work with across different clients |
| **bcryptjs** | Standard way to hash passwords, simple API |
| **express-validator** | Keeps validation close to the route definitions, easy to read |
| **helmet** | One-liner for setting basic security headers |
| **cors** | Needed for frontend to be able to call the API |
| **express-rate-limit** | Brute force protection on the login endpoint |

---

## Assumptions I Made

1. **Registration role** — Anyone who registers gets the VIEWER role by default. An admin has to manually upgrade them.
2. **Soft delete** — I never hard-delete transactions. Setting `isDeleted: true` keeps the data intact while hiding it from all API responses.
3. **Admin self-actions** — An admin can't change their own role, deactivate themselves, or delete their own account. Felt like an obvious safeguard to add.
4. **Category is free-form** — I didn't lock it to a fixed list so new categories can be added without touching the schema.
5. **Dates are UTC** — Timezone conversion is a frontend concern.
6. **No email verification** — Kept it simple; out of scope here.

---

## Setup

### 1. Clone the repo
```bash
git clone https://github.com/Mannu14/zorvyn
cd finance-backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
```bash
cp .env.example .env
```
Fill in `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/finance_db
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 4. Start MongoDB
Make sure MongoDB is running locally on port 27017, or point `MONGO_URI` to a remote instance.

### 5. Seed the database
```bash
npm run seed
```
Creates 3 users and 25 sample transactions. Note: this clears existing users and transactions first.

### 6. Start the server
```bash
npm run dev
```
Runs at `http://localhost:5000`

---

## Seed Credentials

| Role | Email | Password |
|---|---|---|
| ADMIN | admin@finance.com | Admin@123 |
| ANALYST | analyst@finance.com | Analyst@123 |
| VIEWER | viewer@finance.com | Viewer@123 |

---

## API Documentation

All routes are under `/api`. Protected routes need this header:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | — | Register (defaults to VIEWER) |
| POST | `/api/auth/login` | No | — | Login, get JWT |
| GET | `/api/auth/me` | Yes | Any | Get your profile |

**Register body:**
```json
{ "name": "John Doe", "email": "john@example.com", "password": "secret123" }
```

**Login body:**
```json
{ "email": "admin@finance.com", "password": "Admin@123" }
```

---

### Users (ADMIN only)

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| GET | `/api/users` | Yes | ADMIN | List all users |
| GET | `/api/users/:id` | Yes | ADMIN | Get one user |
| PATCH | `/api/users/:id/role` | Yes | ADMIN | Change user role |
| PATCH | `/api/users/:id/status` | Yes | ADMIN | Activate / deactivate user |
| DELETE | `/api/users/:id` | Yes | ADMIN | Delete user |

**Query params:** `?page=1&limit=10`

**Role update body:**
```json
{ "role": "ANALYST" }
```

---

### Transactions

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/transactions` | Yes | ADMIN | Create a transaction |
| GET | `/api/transactions` | Yes | Any | List transactions |
| GET | `/api/transactions/:id` | Yes | Any | Get one transaction |
| PUT | `/api/transactions/:id` | Yes | ADMIN | Update a transaction |
| DELETE | `/api/transactions/:id` | Yes | ADMIN | Soft delete |

**Filters for GET list:**
```
?type=INCOME
?category=Rent
?from=2024-01-01&to=2024-12-31
?page=1&limit=10
```

**Create / update body:**
```json
{
  "title": "Monthly Salary",
  "amount": 75000,
  "type": "INCOME",
  "category": "Salary",
  "date": "2024-03-01",
  "description": "March salary credit"
}
```

---

### Dashboard (ANALYST + ADMIN)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Total income, expense, net balance |
| GET | `/api/dashboard/by-category` | Breakdown by category and type |
| GET | `/api/dashboard/trends` | Monthly income vs expense (last 6 months) |
| GET | `/api/dashboard/recent` | Last 10 transactions |

---

## Response Format

```json
{
  "success": true,
  "message": "Transactions fetched successfully.",
  "data": [ ... ],
  "pagination": { "total": 50, "page": 1, "limit": 10, "totalPages": 5 }
}
```

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Amount must be a positive number greater than 0."
}
```

---

## Access Control

| Action | VIEWER | ANALYST | ADMIN |
|---|:---:|:---:|:---:|
| View transactions | Y | Y | Y |
| Create / Update / Delete transaction | N | N | Y |
| Dashboard analytics | N | Y | Y |
| User management | N | N | Y |

---

## Why I built it this way

**MongoDB for this project** — The dashboard needs grouped aggregations (by category, by month). MongoDB's aggregation pipeline handles that well. I also didn't want to deal with migrations every time a new transaction field gets added.

**Service layer** — I kept controllers thin. They only handle the request/response part. All the actual logic — queries, calculations, business rules — lives in the service files. Makes it easier to change one without touching the other.

**Soft delete** — Deleting financial records permanently felt wrong. If an admin makes a mistake, the data is gone. With soft delete it's just hidden — `isDeleted: true` — and filters keep it out of every query.

**`select: false` on password** — The hash never shows up in query results by default. Only the login function explicitly selects it when it needs to verify credentials.

**`lean()` on reads** — Returns plain JS objects instead of full Mongoose documents. Slightly faster and uses less memory on list endpoints where I don't need any document methods.

**Rate limiting only on login** — Putting it on every route would slow down normal API usage unnecessarily. The login endpoint is the only one where brute-forcing is actually a concern.

---

## Project Structure

```
finance-backend/
├── src/
│   ├── config/         → DB connection
│   ├── models/         → User, Transaction schemas
│   ├── middlewares/    → Auth, role guard, error handler
│   ├── controllers/    → Request/response handling
│   ├── routes/         → Route definitions + validators
│   ├── services/       → Business logic and queries
│   └── utils/          → Response helpers, asyncHandler, token utils
├── seed/               → Seed script
├── app.js              → Express setup
└── server.js           → Entry point
```
