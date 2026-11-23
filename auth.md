# AUTH API SPEC

## Register User API
Endpoint: POST /api/auth/register
Request Body:
```json
{
  "name": "Jean R",
  "email": "jean@example.com",
  "password": "password123"
}
```
Response Body Success:
```json
{
  "status": 201,
  "data": {
    "id": 1,
    "name": "Jean R",
    "email": "jean@example.com",
    "createdAt": "2026-11-23T10:00:00.000Z"
  },
  "message": "User registered successfully"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "User with this email already exists"
}
```

## Login User API
Endpoint: POST /api/auth/login
Request Body:
```json
{
  "email": "jean@example.com",
  "password": "password123"
}
```
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "token": "e8b23f82-a7d5-4a8a-9e5b-38dcfb940e71"
  },
  "message": "Login successful"
}
```
Response Body Error:
```json
{
  "status": 401,
  "data": null,
  "message": "Email or password wrong"
}
```

## Logout User API
Endpoint: DELETE /api/auth/logout
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "email": "jean@example.com"
  },
  "message": "Logout successful"
}
```
Response Body Error:
```json
{
  "status": 401,
  "data": null,
  "message": "Unauthorized"
}
```

## Get Current User API
Endpoint: GET /api/auth/me
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "name": "Jean R",
    "email": "jean@example.com",
    "createdAt": "2026-11-23T10:00:00.000Z"
  },
  "message": "Get current user success"
}
```
Response Body Error:
```json
{
  "status": 401,
  "data": null,
  "message": "Unauthorized"
}
```
