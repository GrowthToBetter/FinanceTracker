# TRANSACTION API SPEC

## Create Transaction API
Endpoint: POST /api/transactions
Headers:
Authorization - token
Idempotency-Key - 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
Request Body:
```json
{
  "fromWalletId": 1,
  "categoryId": 2,
  "type": "EXPENSE",
  "amount": 250000,
  "note": "Supermarket groceries",
  "date": "2026-11-23T12:00:00.000Z"
}
```
Response Body Success:
```json
{
  "status": 201,
  "data": {
    "id": 1,
    "userId": 1,
    "fromWalletId": 1,
    "toWalletId": null,
    "categoryId": 2,
    "type": "EXPENSE",
    "status": "POSTED",
    "amount": 250000,
    "note": "Supermarket groceries",
    "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "date": "2026-11-23T12:00:00.000Z",
    "createdAt": "2026-11-23T12:00:00.000Z"
  },
  "message": "Create transaction success"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Insufficient wallet balance"
}
```

## Create Transfer API
Endpoint: POST /api/transactions/transfer
Headers:
Authorization - token
Idempotency-Key - c7d38391-766a-4d64-8fa7-85474a896d81
Request Body:
```json
{
  "fromWalletId": 1,
  "toWalletId": 3,
  "amount": 500000,
  "note": "Top up GoPay from BCA",
  "date": "2026-11-23T12:15:00.000Z"
}
```
Response Body Success:
```json
{
  "status": 201,
  "data": {
    "id": 2,
    "userId": 1,
    "fromWalletId": 1,
    "toWalletId": 3,
    "categoryId": null,
    "type": "TRANSFER",
    "status": "POSTED",
    "amount": 500000,
    "note": "Top up GoPay from BCA",
    "idempotencyKey": "c7d38391-766a-4d64-8fa7-85474a896d81",
    "date": "2026-11-23T12:15:00.000Z",
    "createdAt": "2026-11-23T12:15:00.000Z"
  },
  "message": "Transfer transaction success"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Source and destination wallet cannot be the same"
}
```

## List Transactions API
Endpoint: GET /api/transactions
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": [
    {
      "id": 2,
      "fromWalletId": 1,
      "toWalletId": 3,
      "categoryId": null,
      "type": "TRANSFER",
      "status": "POSTED",
      "amount": 500000,
      "note": "Top up GoPay from BCA",
      "date": "2026-11-23T12:15:00.000Z"
    },
    {
      "id": 1,
      "fromWalletId": 1,
      "toWalletId": null,
      "categoryId": 2,
      "type": "EXPENSE",
      "status": "POSTED",
      "amount": 250000,
      "note": "Supermarket groceries",
      "date": "2026-11-23T12:00:00.000Z"
    }
  ],
  "paging": {
    "page": 1,
    "size": 10,
    "total_page": 1,
    "total_items": 2
  },
  "message": "Get transactions success"
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

## Get Transaction Detail API
Endpoint: GET /api/transactions/:id
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "userId": 1,
    "fromWalletId": 1,
    "toWalletId": null,
    "categoryId": 2,
    "type": "EXPENSE",
    "status": "POSTED",
    "amount": 250000,
    "note": "Supermarket groceries",
    "idempotencyKey": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "date": "2026-11-23T12:00:00.000Z",
    "createdAt": "2026-11-23T12:00:00.000Z",
    "updatedAt": "2026-11-23T12:00:00.000Z"
  },
  "message": "Get transaction detail success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Transaction not found"
}
```

## Void Transaction API
Endpoint: POST /api/transactions/:id/void
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "status": "VOIDED",
    "updatedAt": "2026-11-23T12:30:00.000Z"
  },
  "message": "Transaction voided successfully"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Transaction is already voided"
}
```
