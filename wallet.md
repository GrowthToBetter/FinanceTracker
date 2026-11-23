# WALLET API SPEC

## Create Wallet API
Endpoint: POST /api/wallets
Headers:
Authorization - token
Request Body:
```json
{
  "name": "BCA Main Account",
  "type": "BANK",
  "balance": 10000000
}
```
Response Body Success:
```json
{
  "status": 201,
  "data": {
    "id": 1,
    "userId": 1,
    "name": "BCA Main Account",
    "type": "BANK",
    "balance": 10000000,
    "createdAt": "2026-11-23T10:15:00.000Z",
    "updatedAt": "2026-11-23T10:15:00.000Z"
  },
  "message": "Create wallet success"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Invalid wallet type"
}
```

## List Wallets API
Endpoint: GET /api/wallets
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "name": "BCA Main Account",
      "type": "BANK",
      "balance": 10000000,
      "createdAt": "2026-11-23T10:15:00.000Z"
    },
    {
      "id": 2,
      "name": "Cash Wallet",
      "type": "CASH",
      "balance": 750000,
      "createdAt": "2026-11-23T10:20:00.000Z"
    },
    {
      "id": 3,
      "name": "GoPay",
      "type": "EWALLET",
      "balance": 350000,
      "createdAt": "2026-11-23T10:25:00.000Z"
    }
  ],
  "message": "Get wallets success"
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

## Get Wallet Detail API
Endpoint: GET /api/wallets/:id
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "userId": 1,
    "name": "BCA Main Account",
    "type": "BANK",
    "balance": 10000000,
    "createdAt": "2026-11-23T10:15:00.000Z",
    "updatedAt": "2026-11-23T10:15:00.000Z"
  },
  "message": "Get wallet detail success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Wallet not found"
}
```

## Update Wallet API
Endpoint: PATCH /api/wallets/:id
Headers:
Authorization - token
Request Body:
```json
{
  "name": "BCA Payroll Account",
  "type": "BANK"
}
```
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "userId": 1,
    "name": "BCA Payroll Account",
    "type": "BANK",
    "balance": 10000000,
    "updatedAt": "2026-11-23T10:30:00.000Z"
  },
  "message": "Update wallet success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Wallet not found"
}
```

## Delete Wallet API
Endpoint: DELETE /api/wallets/:id
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1
  },
  "message": "Delete wallet success"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Cannot delete wallet with non-zero balance"
}
```
