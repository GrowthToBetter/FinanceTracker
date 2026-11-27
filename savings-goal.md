# SAVINGS GOAL API SPEC

## Create Savings Goal API
Endpoint: POST /api/savings-goals
Headers:
Authorization - token
Request Body:
```json
{
  "name": "Emergency Fund",
  "targetAmount": 10000000,
  "currentAmount": 2500000,
  "walletId": 1,
  "deadline": "2026-12-31T23:59:59.000Z"
}
```
Response Body Success:
```json
{
  "status": 201,
  "data": {
    "id": 1,
    "userId": 1,
    "walletId": 1,
    "name": "Emergency Fund",
    "targetAmount": 10000000,
    "currentAmount": 2500000,
    "remainingAmount": 7500000,
    "percentageAchieved": 25,
    "isAchieved": false,
    "deadline": "2026-12-31T23:59:59.000Z",
    "createdAt": "2026-11-27T10:00:00.000Z",
    "updatedAt": "2026-11-27T10:00:00.000Z"
  },
  "message": "Create savings goal success"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Target amount must be greater than zero"
}
```

## List Savings Goals API
Endpoint: GET /api/savings-goals
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "walletId": 1,
      "name": "Emergency Fund",
      "targetAmount": 10000000,
      "currentAmount": 2500000,
      "remainingAmount": 7500000,
      "percentageAchieved": 25,
      "isAchieved": false,
      "deadline": "2026-12-31T23:59:59.000Z",
      "createdAt": "2026-11-27T10:00:00.000Z"
    }
  ],
  "message": "Get savings goals success"
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

## Get Savings Goal Detail API
Endpoint: GET /api/savings-goals/:id
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "userId": 1,
    "walletId": 1,
    "name": "Emergency Fund",
    "targetAmount": 10000000,
    "currentAmount": 2500000,
    "remainingAmount": 7500000,
    "percentageAchieved": 25,
    "isAchieved": false,
    "deadline": "2026-12-31T23:59:59.000Z",
    "createdAt": "2026-11-27T10:00:00.000Z",
    "updatedAt": "2026-11-27T10:00:00.000Z"
  },
  "message": "Get savings goal detail success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Savings goal not found"
}
```

## Update Savings Goal API
Endpoint: PATCH /api/savings-goals/:id
Headers:
Authorization - token
Request Body:
```json
{
  "currentAmount": 5000000
}
```
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "userId": 1,
    "walletId": 1,
    "name": "Emergency Fund",
    "targetAmount": 10000000,
    "currentAmount": 5000000,
    "remainingAmount": 5000000,
    "percentageAchieved": 50,
    "isAchieved": false,
    "deadline": "2026-12-31T23:59:59.000Z",
    "createdAt": "2026-11-27T10:00:00.000Z",
    "updatedAt": "2026-11-27T10:30:00.000Z"
  },
  "message": "Update savings goal success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Savings goal not found"
}
```

## Delete Savings Goal API
Endpoint: DELETE /api/savings-goals/:id
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1
  },
  "message": "Delete savings goal success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Savings goal not found"
}
```
