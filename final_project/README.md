# Bookshop API (Express + JWT)

## Run
```bash
cd "c:/Users/MR Mtongo/Desktop/Final Project 6/expressBookReviews/final_project"
npm install
npm start
```
Server starts on **port 5000**.

## Base URLs
- Public endpoints: `http://localhost:5000/` and `http://localhost:5000/customer`
- Auth endpoints: `http://localhost:5000/customer/auth/*`

## Public
### Register
`POST /customer/register`
```json
{ "username": "alice", "password": "secret" }
```

### List all books
`GET /customer/`

### Get by ISBN
`GET /customer/isbn/:isbn`

### Get by Author
`GET /customer/author/:author`

### Get by Title
`GET /customer/title/:title`

### Get reviews for a book
`GET /customer/review/:isbn`

## Auth
### Login
`POST /customer/auth/login`
```json
{ "username": "alice", "password": "secret" }
```
Response:
```json
{ "token": "<jwt>" }
```

Use JWT on protected routes:
`Authorization: Bearer <token>`

### Add/Update review (protected)
`PUT /customer/auth/review/:isbn`

Works with **either**:
- Query string: `?review=Great+book`
- JSON body: `{ "review": "Great book" }`

Example (JSON body):
```json
{ "review": "Great book" }
```

Example (query):
`PUT /customer/auth/review/1?review=Great%20book`

### Delete review (protected)
`DELETE /customer/auth/review/:isbn`

## Notes
- Users and reviews are stored **in-memory**, so restarting the server resets them.

