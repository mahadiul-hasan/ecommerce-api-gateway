# API Gateway Service

**API Gateway Service** is a microservice responsible for routing requests to multiple backend microservices (Auth, Customer, Vendor, Admin) in a **multivendor e-commerce application**. It is built with **Node.js**, **TypeScript**, **Express**, and **Axios**. The service supports:

-   Request proxying to internal services

-   OAuth redirect handling

-   Header and cookie forwarding

-   Centralized error handling

-   Logging via MongoDB or other logging service

-   Integration with microservices for authentication and other business logic

---

## Table of Contents

1. [Architecture Diagram](#architecture-diagram)
2. [Features](#features)
3. [Folder Structure](#folder-structure)
4. [Installation](#installation)
5. [Environment Variables](#environment-variables)
6. [Scripts](#scripts)
7. [Usage](#usage)
8. [API Endpoints](#api-endpoints)
9. [Publishing Messages](#publishing-messages)
10. [Contributing](#contributing)
11. [License](#license)

---

## Architecture Diagram

```
        +------------------+
        |  Frontend App    |
        +--------+---------+
                 |
                 | HTTP Requests (REST/API)
                 v
        +------------------+
        |   API Gateway    |
        |  (Proxy Server)  |
        +--------+---------+
                 |
      +----------+-----------+------------------+
      |          |           |                  |
      v          v           v                  v
+---------+ +-----------+ +--------+       +----------+
| Auth    | | Customer  | | Vendor |  ...  | Admin    |
| Service | | Service   | | Service|       | Service  |
+---------+ +-----------+ +--------+       +----------+
```

## Features

1. **Proxy Requests**

    All requests to `/api/:service/*` are proxied to the corresponding backend service.

2. **OAuth Handling**

    Redirects and callback URLs for social login (Google OAuth) are handled transparently.

3. **Header & Cookie Forwarding**
   Authorization headers, cookies, and user-agent are forwarded to backend services.

4. **Centralized Error Handling**
   Standardized error responses with status codes and messages.

5. **Logging**
   Logs request and response details, as well as errors.

## Folder Structure

```
api-gateway/
│
├─ src/
│   ├─ config/
│   │   └─ index.ts               # Configuration variables (.env)
│   │
│   ├─ controllers/
│   │   └─ authController.ts      # Example controller for auth routes
│   │
│   ├─ middlewares/
│   │   └─ globalErrorHandler.ts  # Centralized error handler
│   │
│   ├─ routes/
│   │   ├─ index.ts               # Main router combining all module routes
│   │   ├─ auth.routes.ts         # Auth service routes
│   │   └─ oauth.routes.ts        # OAuth routes
│   │
│   ├─ services/
│   │   └─ proxy.ts               # Axios proxy for routing requests to services
│   │
│   ├─ utils/
│   │   └─ logger.ts              # Logging helper
│   │
│   └─ app.ts                     # Express app initialization
│
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ README.md
```

## Installation

```
# Clone repository
git clone <repo-url>
cd api-gateway

# Install dependencies
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
NODE_ENV = development
PORT = 5001
JWT_SECRET = your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET = your-super-secret-refresh-key-change-in-production

# Database
MONGO_URI = mongodb://localhost:27017/e-commerce-logs

# Service URLs
AUTH_SERVICE_URL = http://localhost:5002
CUSTOMER_SERVICE_URL = http://localhost:5003
VENDOR_SERVICE_URL = http://localhost:5004
ADMIN_SERVICE_URL = http://localhost:5005

# Rate limiting
RATE_LIMIT_WINDOW_MS = 900000
RATE_LIMIT_MAX_REQUESTS = 100

# Auth service endpoints for permission checks
AUTH_SERVICE_PERMISSION_CHECK = /auth/user-permissions
AUTH_SERVICE_RESOURCE_CHECK = /auth/can-manage-resource

# Timeouts
SERVICE_TIMEOUT = 10000
PERMISSION_CHECK_TIMEOUT = 5000

# Retry configuration
AXIOS_RETRY_ATTEMPTS = 3
AXIOS_RETRY_DELAY = 1000
```

## Scripts

```
# Development
npm run dev           # Run API Gateway in dev mode

# Build
npm run build         # Compile TypeScript

# Production
npm run start         # Run compiled JS files
```

## Usage

1. **Start Backend Services**
   Ensure Auth, Customer, Vendor, Admin services are running.

2. **Start API Gateway**

```npm run dev

```

3. **Access Services via Gateway**

    For Example:

    ```
    Frontend -> API Gateway -> Auth Service
    GET http://localhost:5001/api/auth/login
    ```

4. **OAuth Redirect Handling**

    Example Google OAuth callback:

    ```
    http://localhost:5001/api/auth/oauth/google/callback
    ```

    Cookies, headers, and redirects are handled automatically by the gateway.

5. Use Swagger UI:
    ```
    http://localhost:5001/api/docs
    ```

## API Endpoints

# API Gateway Endpoints

| Method | Endpoint                                         | Auth Required | Roles/Permissions      | Description                      |
| ------ | ------------------------------------------------ | ------------- | ---------------------- | -------------------------------- |
| POST   | `/auth/login`                                    | ❌            | -                      | User login                       |
| POST   | `/auth/refresh-token`                            | ❌            | -                      | Refresh access token             |
| POST   | `/auth/forgot-password`                          | ❌            | -                      | Request password reset           |
| POST   | `/auth/reset-password`                           | ❌            | -                      | Reset password                   |
| POST   | `/auth/change-password`                          | ✅            | Any authenticated user | Change password                  |
| POST   | `/auth/logout`                                   | ✅            | Any authenticated user | Logout                           |
| GET    | `/oauth/google`                                  | ❌            | -                      | Initiate Google OAuth            |
| GET    | `/oauth/google/callback`                         | ❌            | -                      | Google OAuth callback            |
| GET    | `/oauth/success`                                 | ❌            | -                      | OAuth success handler            |
| GET    | `/oauth/failure`                                 | ❌            | -                      | OAuth failure handler            |
| POST   | `/customer/register`                             | ❌            | -                      | Register a new customer          |
| GET    | `/customer/profile`                              | ✅            | Customer               | Get customer profile             |
| PUT    | `/customer/profile`                              | ✅            | Customer               | Update customer profile          |
| DELETE | `/customer/profile`                              | ✅            | Customer               | Delete customer profile          |
| GET    | `/customer/addresses`                            | ✅            | Customer               | Get customer addresses           |
| POST   | `/customer/addresses`                            | ✅            | Customer               | Add new address                  |
| PUT    | `/customer/addresses/:id`                        | ✅            | Customer               | Update address by ID             |
| DELETE | `/customer/addresses/:id`                        | ✅            | Customer               | Delete address by ID             |
| GET    | `/customer/payment-methods`                      | ✅            | Customer               | Get payment methods              |
| POST   | `/customer/payment-methods`                      | ✅            | Customer               | Add payment method               |
| PUT    | `/customer/payment-methods/:id`                  | ✅            | Customer               | Update payment method            |
| DELETE | `/customer/payment-methods/:id`                  | ✅            | Customer               | Delete payment method            |
| POST   | `/vendor/register`                               | ❌            | -                      | Register a new vendor            |
| GET    | `/vendor/profile`                                | ✅            | Vendor                 | Get vendor profile               |
| PUT    | `/vendor/profile`                                | ✅            | Vendor                 | Update vendor profile            |
| DELETE | `/vendor/profile`                                | ✅            | Vendor                 | Delete vendor profile            |
| GET    | `/vendor/shops`                                  | ✅            | Vendor                 | List vendor shops                |
| POST   | `/vendor/shops`                                  | ✅            | Vendor                 | Create new shop                  |
| GET    | `/vendor/shops/:id`                              | ✅            | Vendor                 | Get shop details                 |
| PUT    | `/vendor/shops/:id`                              | ✅            | Vendor                 | Update shop                      |
| DELETE | `/vendor/shops/:id`                              | ✅            | Vendor                 | Delete shop                      |
| POST   | `/vendor/management-register`                    | ✅            | Vendor                 | Vendor management registration   |
| GET    | `/admin/users`                                   | ✅            | Admin, Super Admin     | List all users                   |
| GET    | `/admin/users/:id`                               | ✅            | Admin, Super Admin     | Get user by ID                   |
| PUT    | `/admin/users/:id/status`                        | ✅            | Admin, Super Admin     | Update user status               |
| DELETE | `/admin/users/:id`                               | ✅            | Admin, Super Admin     | Delete user                      |
| POST   | `/admin/users/:userId/roles`                     | ✅            | Admin, Super Admin     | Assign roles to user             |
| DELETE | `/admin/users/:userId/roles/:roleId`             | ✅            | Admin, Super Admin     | Remove role from user            |
| GET    | `/admin/customers`                               | ✅            | Admin, Super Admin     | List all customers               |
| GET    | `/admin/customers/:id`                           | ✅            | Admin, Super Admin     | Get customer by ID               |
| PUT    | `/admin/customers/:id/status`                    | ✅            | Admin, Super Admin     | Update customer status           |
| GET    | `/admin/vendors`                                 | ✅            | Admin, Super Admin     | List all vendors                 |
| GET    | `/admin/vendors/:id`                             | ✅            | Admin, Super Admin     | Get vendor by ID                 |
| PUT    | `/admin/vendors/:id/status`                      | ✅            | Admin, Super Admin     | Update vendor status             |
| PUT    | `/admin/vendors/:id/approve`                     | ✅            | Admin, Super Admin     | Approve vendor                   |
| PUT    | `/admin/vendors/:id/reject`                      | ✅            | Admin, Super Admin     | Reject vendor                    |
| GET    | `/admin/shops`                                   | ✅            | Admin, Super Admin     | List all shops                   |
| GET    | `/admin/shops/:id`                               | ✅            | Admin, Super Admin     | Get shop by ID                   |
| PUT    | `/admin/shops/:id/status`                        | ✅            | Admin, Super Admin     | Update shop status               |
| GET    | `/admin/roles`                                   | ✅            | Admin, Super Admin     | List roles                       |
| POST   | `/admin/roles`                                   | ✅            | Admin, Super Admin     | Create role                      |
| GET    | `/admin/roles/:id`                               | ✅            | Admin, Super Admin     | Get role by ID                   |
| PUT    | `/admin/roles/:id`                               | ✅            | Admin, Super Admin     | Update role                      |
| DELETE | `/admin/roles/:id`                               | ✅            | Admin, Super Admin     | Delete role                      |
| POST   | `/admin/roles/:roleId/permissions`               | ✅            | Admin, Super Admin     | Assign permissions to role       |
| DELETE | `/admin/roles/:roleId/permissions/:permissionId` | ✅            | Admin, Super Admin     | Remove permission from role      |
| GET    | `/admin/permissions`                             | ✅            | Admin, Super Admin     | List all permissions             |
| POST   | `/admin/permissions`                             | ✅            | Admin, Super Admin     | Create permission                |
| GET    | `/admin/permissions/:id`                         | ✅            | Admin, Super Admin     | Get permission by ID             |
| PUT    | `/admin/permissions/:id`                         | ✅            | Admin, Super Admin     | Update permission                |
| DELETE | `/admin/permissions/:id`                         | ✅            | Admin, Super Admin     | Delete permission                |
| POST   | `/admin/register`                                | ✅            | Super Admin            | Register new admin user          |
| POST   | `/admin/management-register`                     | ✅            | Super Admin            | Admin management registration    |
| GET    | `/admin/admins`                                  | ✅            | Super Admin            | List all admin users             |
| GET    | `/admin/admins/:id`                              | ✅            | Super Admin            | Get admin user by ID             |
| PUT    | `/admin/admins/:id`                              | ✅            | Super Admin            | Update admin user                |
| DELETE | `/admin/admins/:id`                              | ✅            | Super Admin            | Delete admin user                |
| GET    | `/admin/system/stats`                            | ✅            | Super Admin            | System stats                     |
| GET    | `/admin/system/health`                           | ✅            | Super Admin            | System health                    |
| GET    | `/logs/stats`                                    | ✅            | Admin, Super Admin     | Get database statistics          |
| POST   | `/logs/cleanup`                                  | ✅            | Admin, Super Admin     | Cleanup logs manually            |
| GET    | `/logs/retention`                                | ✅            | Admin, Super Admin     | Get current log retention policy |
| PUT    | `/logs/retention`                                | ✅            | Admin, Super Admin     | Update log retention policy      |

## Contributing

-   Use TypeScript and maintain strict typing.

-   Test proxy requests locally before committing.

-   Maintain folder structure.

-   Follow commit message conventions.

## License

MIT License © 2025

```
---

This README.md is styled similarly to your Notification Service README and includes:

- Architecture diagram
- Folder structure
- API endpoints
- RabbitMQ integration details
- Scripts, environment variables, and usage examples

---

If you want, I can also **create a visual flow diagram for Auth Service with OAuth, local login, and RabbitMQ integration**, so your README looks professional and easy to understand.

Do you want me to do that?
```
