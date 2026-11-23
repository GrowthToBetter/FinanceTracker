# NOTIFICATION API SPEC

## List Notifications API
Endpoint: GET /api/notifications
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "message": "Warning: Food, Drinks & Dining budget reached 81.67% of monthly limit",
      "isRead": false,
      "createdAt": "2026-11-23T12:00:00.000Z"
    },
    {
      "id": 2,
      "message": "Transfer of 500000 from BCA to GoPay posted successfully",
      "isRead": true,
      "createdAt": "2026-11-23T12:15:00.000Z"
    }
  ],
  "message": "Get notifications success"
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

## Mark Notification Read API
Endpoint: PATCH /api/notifications/:id/read
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "isRead": true
  },
  "message": "Notification marked as read"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Notification not found"
}
```
