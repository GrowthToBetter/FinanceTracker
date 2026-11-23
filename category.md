# CATEGORY API SPEC

## Create Category API
Endpoint: POST /api/categories
Headers:
Authorization - token
Request Body:
```json
{
  "name": "Food & Beverage"
}
```
Response Body Success:
```json
{
  "status": 201,
  "data": {
    "id": 1,
    "name": "Food & Beverage",
    "createdAt": "2026-11-23T10:00:00.000Z"
  },
  "message": "Create category success"
}
```
Response Body Error:
```json
{
  "status": 400,
  "data": null,
  "message": "Category name cannot be empty"
}
```

## List Categories API
Endpoint: GET /api/categories
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": [
    {
      "id": 1,
      "name": "Food & Beverage",
      "createdAt": "2026-11-23T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Utilities & Bills",
      "createdAt": "2026-11-23T10:05:00.000Z"
    },
    {
      "id": 3,
      "name": "Salary",
      "createdAt": "2026-11-23T10:10:00.000Z"
    }
  ],
  "message": "Get categories success"
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

## Update Category API
Endpoint: PATCH /api/categories/:id
Headers:
Authorization - token
Request Body:
```json
{
  "name": "Food, Drinks & Dining"
}
```
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "name": "Food, Drinks & Dining"
  },
  "message": "Update category success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Category not found"
}
```

## Delete Category API
Endpoint: DELETE /api/categories/:id
Headers:
Authorization - token
Response Body Success:
```json
{
  "status": 200,
  "data": {
    "id": 1
  },
  "message": "Delete category success"
}
```
Response Body Error:
```json
{
  "status": 404,
  "data": null,
  "message": "Category not found"
}
```
