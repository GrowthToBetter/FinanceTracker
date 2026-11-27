# REPORT EXPORT API SPEC

## Request Async Export Report API
Endpoint: POST /api/reports/export
Headers:
Authorization - token
Request Body:
```json
{
  "format": "CSV",
  "type": "EXPENSE",
  "status": "POSTED",
  "startDate": "2026-11-01",
  "endDate": "2026-11-30"
}
```
Response Body Success:
```json
{
  "status": 202,
  "data": {
    "jobId": "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    "format": "CSV",
    "status": "PENDING",
    "createdAt": "2026-11-27T10:00:00.000Z"
  },
  "message": "Export report job queued"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Invalid export format"
}
```

## Get Async Export Report Status & Result API
Endpoint: GET /api/reports/export/:jobId
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "jobId": "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    "format": "CSV",
    "status": "COMPLETED",
    "totalRecords": 2,
    "content": "id,date,type,status,amount,fromWallet,toWallet,category,note\n1,2026-11-23T12:00:00.000Z,EXPENSE,POSTED,250000,BCA Main Account,,Groceries,Supermarket groceries",
    "createdAt": "2026-11-27T10:00:00.000Z",
    "completedAt": "2026-11-27T10:00:01.000Z"
  },
  "message": "Get export report success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Export job not found"
}
```
