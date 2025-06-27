# FX Converter API Documentation

## Overview

The FX Converter API is a comprehensive foreign exchange conversion service with JWT authentication, OAuth integration, refresh tokens, and audit trail capabilities.

**Base URL:** `http://localhost:5700/api/v1`  
**Version:** 1.0.0  
**Authentication:** JWT Bearer Token / OAuth (Google)

## Table of Contents

- [Authentication](#authentication)
- [OAuth Integration](#oauth-integration)
- [API Endpoints](#api-endpoints)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Pagination](#pagination)
- [Event Logging](#event-logging)
- [Status Codes](#status-codes)
- [Examples](#examples)

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication with support for refresh tokens and OAuth.

### Token Types

| Token Type | Expiration | Usage |
|------------|------------|-------|
| Access Token | 15 minutes | API requests |
| Refresh Token | 7 days | Token renewal |

### Headers

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## OAuth Integration

### Google OAuth Flow

1. **Initiate OAuth**: `GET /auth/google`
2. **User authenticates with Google**
3. **Callback**: `GET /auth/google/callback` (handled automatically)
4. **Redirect to frontend** with tokens

---

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "abc123def456...",
      "expiresIn": 900
    }
  }
}
```

#### Login User
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** Same as register response

#### Refresh Token
```http
POST /auth/refresh-token
```

**Request Body:**
```json
{
  "refreshToken": "abc123def456..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "new_refresh_token...",
      "expiresIn": 900
    }
  }
}
```

#### Get User Profile
```http
GET /auth/profile
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "provider": "local",
      "isEmailVerified": true,
      "createdAt": "2025-01-15T10:30:00Z"
    },
    "authMethod": "local",
    "isEmailVerified": true
  }
}
```

#### Update Profile
```http
PUT /auth/profile
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "name": "John Smith",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Change Password
```http
POST /auth/change-password
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456"
}
```

**Note:** Not available for OAuth users.

#### Logout
```http
POST /auth/logout
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "refreshToken": "abc123def456..."
}
```

#### Logout All Devices
```http
POST /auth/logout-all
```

**Headers:** `Authorization: Bearer <access_token>`

---

### OAuth Endpoints

#### Google OAuth Initiation
```http
GET /auth/google
```

Redirects to Google OAuth consent screen.

#### Google OAuth Callback
```http
GET /auth/google/callback
```

Handles Google OAuth callback and redirects to frontend with tokens.

---

### Conversion Endpoints

#### Get Supported Currencies
```http
GET /conversions/currencies
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "currencies": [
      "USD", "EUR", "GBP", "NGN", "JPY", "CAD", "AUD", "CHF", "CNY", "INR"
    ]
  }
}
```

#### Create Conversion
```http
POST /conversions
```

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "fromCurrency": "USD",
  "toCurrency": "NGN",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "message": "Conversion created successfully",
  "data": {
    "conversion": {
      "_id": "conversion_id",
      "userId": "user_id",
      "fromCurrency": "USD",
      "toCurrency": "NGN",
      "amount": 100,
      "exchangeRate": 1580.50,
      "convertedAmount": 158050,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  }
}
```

#### Get User Conversions
```http
GET /conversions?page=1&limit=10&sortBy=createdAt&sortOrder=desc
```

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `sortBy` (optional): Sort field (default: createdAt)
- `sortOrder` (optional): asc/desc (default: desc)

**Response:**
```json
{
  "success": true,
  "data": {
    "conversions": [
      {
        "_id": "conversion_id",
        "fromCurrency": "USD",
        "toCurrency": "NGN",
        "amount": 100,
        "exchangeRate": 1580.50,
        "convertedAmount": 158050,
        "createdAt": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "itemsPerPage": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Conversion Summary
```http
GET /conversions/summary
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalConversions": 25,
      "totalAmountConverted": 5000,
      "favoriteFromCurrency": "USD",
      "favoriteToCurrency": "NGN",
      "averageConversionAmount": 200,
      "conversionsByMonth": [
        {
          "month": "2025-01",
          "count": 10,
          "totalAmount": 2000
        }
      ]
    }
  }
}
```

#### Get Single Conversion
```http
GET /conversions/:id
```

**Headers:** `Authorization: Bearer <access_token>`

#### Delete Conversion
```http
DELETE /conversions/:id
```

**Headers:** `Authorization: Bearer <access_token>`

---

### Exchange Rate Endpoints

#### Get Exchange Rate
```http
GET /rates/:from/:to
```

**Headers:** `Authorization: Bearer <access_token>`

**Example:** `GET /rates/USD/NGN`

**Response:**
```json
{
  "success": true,
  "data": {
    "from": "USD",
    "to": "NGN",
    "rate": 1580.50,
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

### Event Endpoints

#### Get User Events
```http
GET /events?page=1&limit=10&eventType=USER_LOGIN
```

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `eventType` (optional): Filter by event type
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by end date

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "event_id",
        "userId": "user_id",
        "eventType": "USER_LOGIN",
        "metadata": {
          "email": "user@example.com",
          "loginMethod": "local",
          "ipAddress": "192.168.1.1",
          "userAgent": "Mozilla/5.0..."
        },
        "timestamp": "2025-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50
    }
  }
}
```

#### Get Event Statistics
```http
GET /events/stats
```

**Headers:** `Authorization: Bearer <access_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": [
      {
        "_id": "USER_LOGIN",
        "count": 25,
        "lastOccurrence": "2025-01-15T10:30:00Z"
      },
      {
        "_id": "CONVERSION_CREATED",
        "count": 15,
        "lastOccurrence": "2025-01-15T09:15:00Z"
      }
    ]
  }
}
```

---

### Health Endpoints

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-15T10:30:00Z",
  "uptime": 3600.5,
  "environment": "development",
  "version": "1.0.0",
  "services": {
    "database": "Connected",
    "memory": {
      "used": 245.67,
      "total": 512.00
    }
  }
}
```

#### API Information
```http
GET /
```

**Response:**
```json
{
  "success": true,
  "message": "FX Converter api/v1",
  "version": "1.0.0",
  "timestamp": "2025-01-15T10:30:00Z",
  "environment": "development",
  "documentation": {
    "endpoints": {
      "auth": "/api/v1/auth",
      "conversions": "/api/v1/conversions",
      "rates": "/api/v1/rates",
      "events": "/api/v1/events",
      "health": "/api/v1/health"
    }
  }
}
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "stack": "Error stack trace (development only)"
}
```

### Common Errors

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 422 | Validation Error | Request validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Rate Limiting

- **Window:** 15 minutes
- **Limit:** 100 requests per IP per window
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Rate Limit Response

```json
{
  "success": false,
  "error": "Too many requests from this IP",
  "retryAfter": 900
}
```

---

## Pagination

### Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc/desc (default: desc)

### Pagination Response

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## Event Logging

### Supported Event Types

- `USER_REGISTERED` - User registration
- `USER_LOGIN` - User login
- `USER_LOGOUT` - User logout
- `USER_LOGOUT_ALL` - Logout from all devices
- `PROFILE_UPDATED` - Profile update
- `PASSWORD_CHANGED` - Password change
- `TOKEN_REFRESHED` - Token refresh
- `FAILED_LOGIN` - Failed login attempt
- `CONVERSION_CREATED` - Conversion created
- `CONVERSION_DELETED` - Conversion deleted
- `RATE_FETCHED` - Exchange rate fetched
- `DASHBOARD_VIEWED` - Dashboard accessed

---

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 204 | No Content | Request successful, no content |
| 400 | Bad Request | Invalid request |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Access denied |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Service temporarily unavailable |

---

## Examples

### Complete Authentication Flow

```javascript
// 1. Register User
const registerResponse = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    name: 'John Doe'
  })
});

const { data } = await registerResponse.json();
const { accessToken, refreshToken } = data.tokens;

// 2. Make Authenticated Request
const profileResponse = await fetch('/api/v1/auth/profile', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// 3. Refresh Token When Expired
const refreshResponse = await fetch('/api/v1/auth/refresh-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken })
});
```

### Currency Conversion Flow

```javascript
// 1. Get Supported Currencies
const currenciesResponse = await fetch('/api/v1/conversions/currencies', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// 2. Get Exchange Rate
const rateResponse = await fetch('/api/v1/rates/USD/NGN', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

// 3. Create Conversion
const conversionResponse = await fetch('/api/v1/conversions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    fromCurrency: 'USD',
    toCurrency: 'NGN',
    amount: 100
  })
});

// 4. Get Conversion History
const historyResponse = await fetch('/api/v1/conversions?page=1&limit=10', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### OAuth Integration

```javascript
// Frontend: Initiate Google OAuth
window.location.href = 'http://localhost:5700/api/v1/auth/google';

// Frontend: Handle OAuth Success (redirect callback)
const urlParams = new URLSearchParams(window.location.search);
const accessToken = urlParams.get('access_token');
const refreshToken = urlParams.get('refresh_token');
const user = JSON.parse(urlParams.get('user'));

// Store tokens and user data
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
localStorage.setItem('user', JSON.stringify(user));
```

---

## Environment Variables

```env
# Required
NODE_ENV=development
PORT=5700
MONGODB_URI=mongodb://localhost:27017/fx-converter
JWT_SECRET=your-super-secure-jwt-secret

# Optional
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_DAYS=7
EXCHANGE_RATE_API_KEY=your-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Testing

Use the provided test script to validate all API endpoints:

```bash
./scripts/test-api.sh
```

This will run comprehensive tests covering:
- Authentication flow
- OAuth endpoints
- Conversion operations
- Event logging
- Error handling
- Rate limiting
- Data validation

---

## Support

For issues or questions:
- Check the error response format
- Verify authentication headers
- Ensure rate limits aren't exceeded
- Review the event logs for audit trail

**API Version:** 1.0.0  
**Last Updated:** January 2025