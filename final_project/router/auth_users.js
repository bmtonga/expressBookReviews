/**
 * Auth + protected book review routes.
 *
 * Features:
 * - User login using JWT.
 * - Get books for internal requests.
 * - Add/update book reviews.
 * - Delete user reviews.
 */

const express = require('express');
const jwt = require('jsonwebtoken');

let books = require("./booksdb.js");

const regd_users = express.Router();


// Shared in-memory user store
let users = [];


// Validate username
const isValid = (username) => {

  if (typeof username !== "string") {
    return false;
  }

  const trimmed = username.trim();

  if (trimmed.length < 3) {
    return false;
  }

  return /^[a-zA-Z0-9_.-]+$/.test(trimmed);
};


// Check login credentials
const authenticatedUser = (username, password) => {

  const user = users.find(
    (u) => u.username === username
  );

  if (!user) {
    return false;
  }

  return user.password === password;
};


// JWT payload
const tokenPayloadFor = (username) => ({
  username
});


// Get all books
// Used internally by general.js if axios forwarding is used
regd_users.get("/", (req, res) => {

  return res.status(200).json(books);

});


// Login registered user
regd_users.post("/login", (req, res) => {

  const {
    username,
    password
  } = req.body || {};


  if (!username || !password) {

    return res.status(400).json({
      message: "Username and password are required"
    });

  }


  if (!authenticatedUser(username, password)) {

    return res.status(403).json({
      message: "Invalid username or password"
    });

  }


  const token = jwt.sign(
    tokenPayloadFor(username),
    "access"
  );


  return res.status(200).json({

    token,

    message: "Login successful"

  });

});



// Add or update review
// Endpoint:
// PUT /customer/auth/review/:isbn

regd_users.put("/auth/review/:isbn", (req, res) => {


  const isbn = Number(req.params.isbn);


  const review =
    req.query.review ||
    req.body.review;



  if (!Number.isInteger(isbn)) {

    return res.status(400).json({
      message: "Invalid ISBN"
    });

  }



  if (!review) {

    return res.status(400).json({
      message: "Review is required"
    });

  }



  const book = books[isbn];


  if (!book) {

    return res.status(404).json({
      message: "Book not found"
    });

  }



  const username =
    req.user && req.user.username;



  if (!username) {

    return res.status(403).json({
      message: "Unauthorized"
    });

  }



  if (!book.reviews) {

    book.reviews = {};

  }



  book.reviews[username] = review;



  return res.status(200).json({

    isbn,

    author: book.author,

    title: book.title,

    reviews: book.reviews

  });


});




// Delete review
// Endpoint:
// DELETE /customer/auth/review/:isbn


regd_users.delete("/auth/review/:isbn", (req, res) => {


  const isbn = Number(req.params.isbn);



  if (!Number.isInteger(isbn)) {

    return res.status(400).json({
      message: "Invalid ISBN"
    });

  }



  const book = books[isbn];



  if (!book) {

    return res.status(404).json({
      message: "Book not found"
    });

  }



  const username =
    req.user && req.user.username;



  if (!username) {

    return res.status(403).json({
      message: "Unauthorized"
    });

  }



  if (!book.reviews ||
      !book.reviews[username]) {


    return res.status(404).json({
      message: "Review not found"
    });


  }



  delete book.reviews[username];



  return res.status(200).json({

    isbn,

    author: book.author,

    title: book.title,

    reviews: book.reviews

  });


});



// Export router and shared data
module.exports.authenticated = regd_users;

module.exports.isValid = isValid;

module.exports.users = users;