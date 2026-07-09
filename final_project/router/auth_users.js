const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3) return false;
  // allow letters/numbers and a few common username chars
  return /^[a-zA-Z0-9_\.\-]+$/.test(trimmed);
};


const authenticatedUser = (username, password) => {
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  return user.password === password;
};

const tokenPayloadFor = (username) => ({ username });

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(403).json({ message: 'Invalid username or password' });
  }

  // Save JWT token for session auth
  const token = jwt.sign(tokenPayloadFor(username), 'access');

  return res.status(200).json({ token, message: 'Login successful' });
});


// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = Number(req.params.isbn);
  const { review: reviewFromQuery } = req.query || {};
  const { review: reviewFromBody } = req.body || {};
  const review = reviewFromQuery ?? reviewFromBody;

  if (!Number.isInteger(isbn)) {
    return res.status(400).json({ message: 'Invalid ISBN' });
  }

  if (!review) {
    return res.status(400).json({ message: 'Review is required' });
  }


  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // JWT middleware sets req.user
  const username = req.user && req.user.username;
  if (!username) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!book.reviews) book.reviews = {};

  // Store by username; re-posting overwrites the existing review from same user
  book.reviews[username] = review;

  return res.status(200).json({ isbn, author: book.author, title: book.title, reviews: book.reviews });
});

// Delete a book review (only by the same logged-in user)
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = Number(req.params.isbn);

  if (!Number.isInteger(isbn)) {
    return res.status(400).json({ message: 'Invalid ISBN' });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  const username = req.user && req.user.username;
  if (!username) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: 'Review not found' });
  }

  delete book.reviews[username];

  return res.status(200).json({ isbn, author: book.author, title: book.title, reviews: book.reviews || {} });
});


module.exports.authenticated = regd_users;

module.exports.isValid = isValid;
module.exports.users = users;

