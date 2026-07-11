# E-Governance AgriHub Backend

Agricultural Market Governance Information System for Nakasero Market, Kampala. A digital platform for KCCA, MAAIF, and UBOS to manage market operations, farmer registrations, produce verification, commodity pricing, and market transactions.

## Features

- **Authentication & Authorization** - JWT-based login, role-based access control (Administrator, Market Officer, Produce Inspector, Government Officer)
- **Farmer Management** - Register, list, update, and delete farmers with auto-generated farmer IDs
- **Produce Registration** - Track produce arrivals with commodity, quantity, source district, and quality grading
- **Commodity Pricing** - Record and track daily commodity prices with trend analysis
- **Produce Verification** - Inspection workflow with approve/reject, quality checks, moisture content, and grading
- **Transaction Recording** - Log market transactions with buyer/seller info, payment methods, and receipt generation
- **Dashboard** - Real-time statistics on farmers, produce, prices, verifications, and transactions
- **Analytics** - Commodity trends, monthly transactions, revenue, market turnover, produce volume, price fluctuations, top commodities/districts, recent registrations
- **Report Generation** - Generate PDF, Excel, and CSV reports (daily, weekly, monthly, annual)
- **Notification System** - Role-based and user-specific notifications with read tracking
- **User Administration** - Full CRUD for system users with role and agency assignment
- **Security** - Helmet, CORS, rate limiting, password hashing, and input validation

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) + bcryptjs
- **Validation:** express-validator
- **File Upload:** Multer
- **Reporting:** ExcelJS, PDFKit, json2csv
- **Documentation:** swagger-jsdoc, swagger-ui-express
- **Security:** Helmet, CORS, express-rate-limit

## Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) — local or Atlas connection string

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd e-governace/backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Configure environment variables (edit .env)
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/agrihub
# JWT_SECRET=your_jwt_secret_key_here
# JWT_EXPIRES_IN=7d
# NODE_ENV=development
```

## Seed Data

```bash
# Ensure MONGODB_URI is set in .env, then run:
npm run seed
```

This populates the database with sample users, farmers, produce records, prices, verifications, transactions, and notifications.

## Running the Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server starts on `http://localhost:5000`.

## API Documentation

Swagger UI is available at:

```
http://localhost:5000/api-docs
```

## Default Login Credentials

| Role               | Name              | Email                        | Password        | Agency |
| ------------------ | ----------------- | ---------------------------- | --------------- | ------ |
| Administrator      | Wandera Jonah     | admin@agrihub.com            | admin123        | KCCA   |
| Market Officer     | Sarah Tendo       | officer@agrihub.com          | officer123      | KCCA   |
| Government Officer | David Okello      | gov@agrihub.com              | gov123          | MAAIF  |
| Produce Inspector  | Grace Akinyi      | inspector@agrihub.com        | inspector123    | KCCA   |
| Farmer             | John Ssekandi     | farmer@agrihub.com           | farmer123       | Farmer |

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── index.js           # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── farmer.controller.js
│   │   ├── produce.controller.js
│   │   ├── price.controller.js
│   │   ├── verification.controller.js
│   │   ├── transaction.controller.js
│   │   ├── dashboard.controller.js
│   │   ├── analytics.controller.js
│   │   ├── report.controller.js
│   │   ├── notification.controller.js
│   │   └── user.controller.js
│   ├── docs/
│   │   └── swagger.js         # Swagger/OpenAPI configuration
│   ├── middleware/
│   │   ├── auth.js            # JWT protect & role authorization
│   │   ├── errorHandler.js    # Global error handler
│   │   └── upload.js          # File upload middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Farmer.js
│   │   ├── Produce.js
│   │   ├── CommodityPrice.js
│   │   ├── ProduceVerification.js
│   │   ├── Transaction.js
│   │   ├── Notification.js
│   │   ├── Report.js
│   │   ├── AuditLog.js
│   │   └── SystemSetting.js
│   ├── routes/
│   │   ├── index.js           # Route aggregator
│   │   ├── auth.routes.js
│   │   ├── farmer.routes.js
│   │   ├── produce.routes.js
│   │   ├── price.routes.js
│   │   ├── verification.routes.js
│   │   ├── transaction.routes.js
│   │   ├── dashboard.routes.js
│   │   ├── analytics.routes.js
│   │   ├── report.routes.js
│   │   ├── notification.routes.js
│   │   └── user.routes.js
│   ├── seed/
│   │   └── seed.js            # Database seeder
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── farmer.service.js
│   │   ├── produce.service.js
│   │   ├── price.service.js
│   │   ├── verification.service.js
│   │   ├── transaction.service.js
│   │   ├── dashboard.service.js
│   │   ├── analytics.service.js
│   │   ├── report.service.js
│   │   ├── notification.service.js
│   │   └── user.service.js
│   ├── utils/
│   │   ├── apiResponse.js     # Standard response helpers
│   │   └── helpers.js         # Utility functions
│   ├── validators/
│   │   ├── index.js
│   │   ├── auth.validator.js
│   │   ├── farmer.validator.js
│   │   ├── produce.validator.js
│   │   ├── price.validator.js
│   │   ├── verification.validator.js
│   │   ├── transaction.validator.js
│   │   └── user.validator.js
│   ├── app.js                 # Express app setup
│   └── server.js              # Server entry point
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

| Variable       | Description                  | Default                              |
| -------------- | ---------------------------- | ------------------------------------ |
| `PORT`         | Server port                  | `5000`                               |
| `MONGODB_URI`  | MongoDB connection string    | `mongodb://localhost:27017/agrihub`  |
| `JWT_SECRET`   | JWT signing secret           | `your_jwt_secret_key_here`           |
| `JWT_EXPIRES_IN` | JWT token expiry duration | `7d`                                 |
| `NODE_ENV`     | Environment mode             | `development`                        |

## License

MIT
