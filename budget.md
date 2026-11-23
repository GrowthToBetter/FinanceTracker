# BUDGET API SPEC

## Create Budget API
Endpoint: POST /api/budgets
Headers:
Authorization - token
Request Body:
```json
{
  "categoryId": 1,
  "amount": 3000000,
  "month": 11,
  "year": 2026
}
```
Response Body Success:
```json
{
  "status": 201,
  "data": {
    "id": 1,
    "userId": 1,
    "categoryId": 1,
    "amount": 3000000,
    "month": 11,
    "year": 2026,
    "createdAt": "2026-11-23T10:00:00.000Z",
    "updatedAt": "2026-11-23T10:00:00.000Z"
  },
  "message": "Create budget success"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Budget for this category in the specified month and year already exists"
}
```

## List Budgets API
Endpoint: GET /api/budgets
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "categoryId": 1,
      "categoryName": "Food, Drinks & Dining",
      "amount": 3000000,
      "usedAmount": 2450000,
      "percentageUsed": 81.67,
      "month": 11,
      "year": 2026
    }
  ],
  "message": "Get budgets success"
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

## Get Budget Detail API
Endpoint: GET /api/budgets/:id
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "userId": 1,
    "categoryId": 1,
    "amount": 3000000,
    "usedAmount": 2450000,
    "remainingAmount": 550000,
    "percentageUsed": 81.67,
    "month": 11,
    "year": 2026,
    "createdAt": "2026-11-23T10:00:00.000Z",
    "updatedAt": "2026-11-23T10:00:00.000Z"
  },
  "message": "Get budget detail success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Budget not found"
}
```

## Update Budget API
Endpoint: PATCH /api/budgets/:id
Headers:
Authorization - token
Request Body:
```json
{
  "amount": 3500000
}
```
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "userId": 1,
    "categoryId": 1,
    "amount": 3500000,
    "month": 11,
    "year": 2026,
    "updatedAt": "2026-11-23T11:00:00.000Z"
  },
  "message": "Update budget success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Budget not found"
}
```

## Delete Budget API
Endpoint: DELETE /api/budgets/:id
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1
  },
  "message": "Delete budget success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Budget not found"
}
```
