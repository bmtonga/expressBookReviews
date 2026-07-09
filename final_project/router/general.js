const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // store users in-memory using auth_users.js shared array
  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    if (existingUser.password === password) {
      return res.status(409).json({ message: 'Username already registered' });
    }
    return res.status(409).json({ message: 'Username already exists with a different password' });
  }

  const newUser = { username, password };
  users.push(newUser);

  return res.status(201).json({ message: 'User registered successfully' });
});


// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // In this project we have an in-memory DB; axios/promise patterns still apply
    // by resolving the local books object.
    const data = await Promise.resolve(books);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to get books', error: String(err) });
  }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbnParam = req.params.isbn;
  const isbn = Number(isbnParam);

  if (!Number.isInteger(isbn)) {
    return res.status(400).json({ message: 'Invalid ISBN' });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json({ isbn, ...book });
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorQuery = req.params.author;

  if (!authorQuery) {
    return res.status(400).json({ message: 'Invalid author' });
  }

  const results = Object.keys(books)
    .map((k) => Number(k))
    .filter((isbn) => {
      const book = books[isbn];
      return book && String(book.author).toLowerCase() === String(authorQuery).toLowerCase();
    })
    .map((isbn) => ({ isbn, ...books[isbn] }));

  if (results.length === 0) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(results);
});


// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleQuery = req.params.title;

  if (!titleQuery) {
    return res.status(400).json({ message: 'Invalid title' });
  }

  const results = Object.keys(books)
    .map((k) => Number(k))
    .filter((isbn) => {
      const book = books[isbn];
      return book && String(book.title).toLowerCase() === String(titleQuery).toLowerCase();
    })
    .map((isbn) => ({ isbn, ...books[isbn] }));

  if (results.length === 0) {
    return res.status(404).json({ message: 'Book not found' });
  }

  return res.status(200).json(results);
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbnParam = req.params.isbn;
  const isbn = Number(isbnParam);

  if (!Number.isInteger(isbn)) {
    return res.status(400).json({ message: 'Invalid ISBN' });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }

  // reviews are stored directly under the book object in booksdb.js
  return res.status(200).json({ isbn, reviews: book.reviews || {} });
});


module.exports.general = public_users;
