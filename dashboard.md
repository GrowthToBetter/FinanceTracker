# DASHBOARD API SPEC

## Get Dashboard Summary API
Endpoint: GET /api/dashboard/summary
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "totalBalance": 11100000,
    "monthlyIncome": 15000000,
    "monthlyExpense": 4250000,
    "walletsCount": 3,
    "activeBudgetsCount": 2,
    "wallets": [
      {
        "id": 1,
        "name": "BCA Payroll Account",
        "type": "BANK",
        "balance": 10000000
      },
      {
        "id": 2,
        "name": "Cash Wallet",
        "type": "CASH",
        "balance": 750000
      },
      {
        "id": 3,
        "name": "GoPay",
        "type": "EWALLET",
        "balance": 350000
      }
    ]
  },
  "message": "Get dashboard summary success"
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

## Get Dashboard Cashflow API
Endpoint: GET /api/dashboard/cashflow
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": [
    {
      "date": "2026-11-21",
      "income": 0,
      "expense": 150000,
      "net": -150000
    },
    {
      "date": "2026-11-22",
      "income": 15000000,
      "expense": 600000,
      "net": 14400000
    },
    {
      "date": "2026-11-23",
      "income": 0,
      "expense": 750000,
      "net": -750000
    }
  ],
  "message": "Get cashflow trends success"
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
