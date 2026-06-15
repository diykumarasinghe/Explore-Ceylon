# Explore Ceylon - NestJS Backend

This is the production-ready NestJS backend for the **Explore Ceylon** Sri Lankan travel management platform.

---

## Technical Stack
- **Framework**: [NestJS](https://nestjs.com/) (v10)
- **Language**: TypeScript
- **Database**: MongoDB Atlas / Mongoose ODM
- **Authentication**: JWT & Passport Strategy
- **Security**: Password hashing with `bcrypt`
- **Validation**: `class-validator` & `class-transformer`

---

## Directory Structure
```
explore-ceylon-backend/
├── src/
│   ├── auth/            # Sign-up, Sign-in, Profile routing & JWT strategy
│   ├── users/           # User schema and database layer
│   ├── destinations/    # Destination registration & details CRUD
│   ├── packages/        # Travel itinerary packages (duration, price, etc.)
│   ├── bookings/        # Customer package bookings & status management
│   ├── wishlist/        # Customer personal destination list
│   ├── reviews/         # Destination reviews & rating aggregation
│   ├── analytics/       # Administrator metrics & revenue aggregates
│   │
│   ├── common/          # Shared decorators, route guards, filters, etc.
│   │   ├── decorators/  # Custom decorators (@Roles, @CurrentUser)
│   │   ├── guards/      # Auth & RBAC validation guards
│   │   ├── enums/       # Role and BookingStatus constants
│   │   ├── filters/     # Centralized HttpExceptionFilter
│   │   └── interfaces/  # Type assertions (JwtPayload)
│   │
│   ├── config/          # Configurations for db & jwt properties
│   │
│   ├── app.module.ts    # Main app module assembling connections
│   └── main.ts          # Server boots, CORS, validation filters
│
├── .env                 # Environment variables config
├── .env.example         # Template for environment configurations
├── .gitignore           # Ignored workspace metadata
├── package.json         # Package dependencies & scripts
├── tsconfig.json        # TypeScript configuration settings
└── nest-cli.json        # NestJS CLI assembly build settings
```

---

## Quick Start Guide

### Prerequisites
1. Install [Node.js](https://nodejs.org/) (v18 or higher recommended).
2. Install and run [MongoDB](https://www.mongodb.com/try/download/community) locally, or set up a MongoDB Atlas cloud database.

### 1. Installation
Clone the repository and run:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory and copy the format from `.env.example`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/explore-ceylon
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Run the Server
For development (with hot-reload):
```bash
npm run start:dev
```
For production build and execution:
```bash
npm run build
npm run start:prod
```

---

## API Endpoints Reference

### Authentication (`/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Public | Create a new user account (Customer, Tour Guide, Admin) |
| **POST** | `/auth/login` | Public | Authenticate credentials & retrieve access token |
| **GET** | `/auth/profile` | Authenticated | Retrieve profile details of the current logged-in user |

### Destinations (`/destinations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/destinations` | Public | Fetch all destinations |
| **GET** | `/destinations/:id` | Public | Fetch single destination by ID |
| **POST** | `/destinations` | Admin | Create a new destination |
| **PATCH** | `/destinations/:id` | Admin | Update an existing destination |
| **DELETE** | `/destinations/:id` | Admin | Remove a destination |

### Travel Packages (`/packages`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/packages` | Public | Fetch all packages |
| **GET** | `/packages/:id` | Public | Fetch single package |
| **POST** | `/packages` | Admin | Create a new package |
| **PATCH** | `/packages/:id` | Admin | Update package details |
| **DELETE** | `/packages/:id` | Admin | Remove a package |

### Bookings (`/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/bookings` | Authenticated | Create a booking for a package |
| **GET** | `/bookings` | Authenticated | Fetch bookings (Admin/Guide sees all, Customer sees own) |
| **GET** | `/bookings/:id` | Authenticated | Get booking details (Admin/Guide or Owner) |
| **PATCH** | `/bookings/:id` | Authenticated | Cancel booking (Customer owner) or update status (Admin) |

### Wishlist (`/wishlist`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/wishlist` | Customer | Add a destination to wishlist |
| **GET** | `/wishlist` | Customer | Get customer's current wishlist |
| **DELETE** | `/wishlist/:id` | Customer | Remove a destination from wishlist |

### Reviews (`/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/reviews` | Customer | Review a destination (recalculates destination average rating) |
| **GET** | `/reviews` | Public | Fetch reviews (can filter by query `?destination=<id>`) |

### Analytics (`/analytics`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/analytics/dashboard` | Admin | Aggregate totals, revenue, ratings, and role distributions |
