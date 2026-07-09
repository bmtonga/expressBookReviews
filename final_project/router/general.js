/**
 * Public router.
 *
 * Includes:
 * - Register endpoint for creating in-memory users.
 * - Get all books.
 * - Get books by ISBN.
 * - Get books by author.
 * - Get books by title.
 * - Get book reviews.
 */

const express = require('express');
let books = require("./booksdb.js");

// Shared in-memory auth store
let users = require("./auth_users.js").users;

const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({
      message: "Username and password are required"
    });
  }

  const existingUser = users.find(
    (u) => u.username === username
  );

  if (existingUser) {
    return res.status(409).json({
      message: "Username already exists"
    });
  }

  users.push({
    username,
    password
  });

  return res.status(201).json({
    message: "User registered successfully"
  });
});


// Get all books
public_users.get("/", (req, res) => {
  return res.status(200).json(books);
});


// Get book by ISBN
public_users.get("/isbn/:isbn", (req, res) => {

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

  return res.status(200).json({
    isbn,
    ...book
  });
});


// Get books by author
public_users.get("/author/:author", (req, res) => {

  const authorQuery = req.params.author.toLowerCase();

  const results = Object.keys(books)
    .map((isbn) => ({
      isbn,
      ...books[isbn]
    }))
    .filter((book) =>
      book.author.toLowerCase() === authorQuery
    );


  if (results.length === 0) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(results);
});


// Get books by title
public_users.get("/title/:title", (req, res) => {

  const titleQuery = req.params.title.toLowerCase();

  const results = Object.keys(books)
    .map((isbn) => ({
      isbn,
      ...books[isbn]
    }))
    .filter((book) =>
      book.title.toLowerCase() === titleQuery
    );


  if (results.length === 0) {
    return res.status(404).json({
      message: "Book not found"
    });
  }

  return res.status(200).json(results);
});


// Get all books sorted by title
public_users.get("/title", (req, res) => {

  const booksByTitle = Object.keys(books)
    .map((isbn) => ({
      isbn,
      ...books[isbn]
    }))
    .sort((a, b) =>
      a.title.localeCompare(b.title)
    );

  return res.status(200).json(booksByTitle);
});


// Get book reviews
public_users.get("/review/:isbn", (req, res) => {

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


  return res.status(200).json({
    isbn,
    reviews: book.reviews || {}
  });
});


module.exports.general = public_users;