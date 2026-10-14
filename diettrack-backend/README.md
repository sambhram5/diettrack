# DietTrack Backend API

Production-ready Node.js + Express + TypeScript + PostgreSQL + Prisma backend for the DietTrack diet tracking application.

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: JWT (Access + Refresh tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your values
```

### 3. Set up database
```bash
# Push schema to database
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed database with food library
npm run prisma:seed
```

### 4. Start development server
```bash
npm run dev
```

## Project Structure

```
src/
├── config/          # App config and Prisma client
├── controllers/     # Route handlers
├── middlewares/     # Auth, validation, error handling
├── routes/          # Express routers
├── services/        # Business logic
├── utils/           # JWT, nutrition calculations, response helpers
└── prisma/          # Seed data
prisma/
└── schema.prisma    # Database schema
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout user |

### Foods
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/foods?search=` | Get all foods (with optional search) |
| POST | `/api/foods` | Create custom food |
| PUT | `/api/foods/:id` | Update custom food |
| DELETE | `/api/foods/:id` | Delete custom food |

### Meals
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/meals?date=YYYY-MM-DD` | Get meals (optionally by date) |
| POST | `/api/meals` | Log a meal |
| PUT | `/api/meals/:id` | Update meal |
| DELETE | `/api/meals/:id` | Delete meal |

### Weight
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/weights?days=30` | Get weight logs |
| POST | `/api/weights` | Log weight |
| PUT | `/api/weights/:id` | Update weight log |
| DELETE | `/api/weights/:id` | Delete weight log |

### Water
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/water?date=YYYY-MM-DD` | Get water logs |
| POST | `/api/water` | Log water intake |
| PUT | `/api/water/:id` | Update water log |
| DELETE | `/api/water/:id` | Delete water log |

### Dashboard & Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard?date=YYYY-MM-DD` | Get daily dashboard data |
| GET | `/api/analytics?period=30d` | Get analytics (7d/30d/90d) |

### Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile` | Get user profile |
| PUT | `/api/profile` | Update profile |

## Request/Response Format

### Register
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "age": 28,
  "gender": "MALE",
  "height": 180,
  "weight": 80,
  "activityLevel": "MODERATELY_ACTIVE",
  "goal": "WEIGHT_LOSS"
}
```

### Log Meal
```json
POST /api/meals
Authorization: Bearer <access_token>
{
  "mealType": "BREAKFAST",
  "date": "2024-01-15",
  "items": [
    { "foodId": "uuid-here", "quantity": 1.5 },
    { "foodId": "another-uuid", "quantity": 2 }
  ],
  "notes": "Morning meal"
}
```

## Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm install && npx prisma generate && npm run build`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`
6. Deploy

## Database (Neon PostgreSQL)

1. Create a new project on [neon.tech](https://neon.tech)
2. Copy the connection string
3. Set `DATABASE_URL` in your environment variables
4. Run migrations: `npx prisma migrate deploy`
5. Seed data: `npm run prisma:seed`

## Nutrition Calculation

Uses the **Mifflin-St Jeor** equation for BMR:
- **Male**: BMR = 10W + 6.25H - 5A + 5
- **Female**: BMR = 10W + 6.25H - 5A - 161

TDEE = BMR × Activity Multiplier

Calorie targets by goal:
- Weight Loss: TDEE - 500 kcal
- Maintenance: TDEE
- Weight Gain: TDEE + 300 kcal
- Muscle Gain: TDEE + 200 kcal

## Security Features

- JWT access tokens (15min expiry) + refresh tokens (7 days)
- bcrypt password hashing (12 rounds)
- Rate limiting (200 req/15min general, 20 req/15min auth)
- Helmet security headers
- CORS protection
- Input validation on all endpoints
- Prisma ORM (SQL injection protection)
- Environment-based error messages
