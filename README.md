# Trade Points System

A NestJS application providing a trading platform with points system, referrals, and leaderboards.

## Features

- Trading API
- Points system based on trade volume
- Referral system with points rewards
- Leaderboards for points and trade volume
- User authentication and authorization

## Tech Stack

- NestJS
- TypeScript
- PostgreSQL
- TypeORM
- JWT Authentication
- Swagger API Documentation

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- PostgreSQL

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/trade-points-system.git
cd trade-points-system
```
2. Copy `.env.example` to `.env` and update the values

3. Start the PostgreSQL database with Docker Compose:
```bash
docker-compose up -d
```
Start only the database:
```bash
docker-compose up -d postgres
```

4. Install dependencies:

```bash
npm install
```

5. Run database migrations:

```bash
npm run typeorm:migration:run
```

6. Start the application:

```bash
npm run start:dev
```

7. Access Swagger documentation at http://localhost:3000/api

## API Endpoints

The following API endpoints are available:

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Log in and get an access token

### Users

- `GET /users/profile` - Get current user profile
- `PATCH /users/profile` - Update current user profile

### Trades

- `POST /trades` - Create a new trade
- `GET /trades` - Get all trades for the current user
- `GET /trades/summary` - Get trade summary for the current user
- `GET /trades/:id` - Get a specific trade

### Points

- `GET /points` - Get current user points and history
- `GET /points/ledger` - Get current user points ledger
- `POST /points/rules` - Create a new points rule (admin only)
- `GET /points/rules` - Get all points rules (admin only)
- `GET /points/rules/:id` - Get a specific points rule (admin only)
- `PATCH /points/rules/:id` - Update a points rule (admin only)
- `DELETE /points/rules/:id` - Delete a points rule (admin only)

### Referrals

- `POST /referrals` - Use a referral code
- `GET /referrals/given` - Get referrals given by the current user
- `GET /referrals/received` - Get referrals received by the current user
- `GET /referrals/stats` - Get referral statistics for the current user

### Leaderboards

- `GET /leaderboards` - Get a specific leaderboard
- `GET /leaderboards/rank` - Get current user rank in a specific leaderboard
- `POST /leaderboards/types` - Create a new leaderboard type (admin only)
- `GET /leaderboards/types` - Get all leaderboard types
- `GET /leaderboards/types/:id` - Get a specific leaderboard type
- `PATCH /leaderboards/types/:id` - Update a leaderboard type (admin only)
- `DELETE /leaderboards/types/:id` - Delete a leaderboard type (admin only)
