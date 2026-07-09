const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");

let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();
const BASE_URL = 'http://localhost:6000';

// Helper: use axios against our own already-implemented endpoints.
// NOTE: these endpoints are mounted on the same Express app and run in-memory.
async function fetchViaAxios(path) {
  const axiosRes = await axios.get(`${BASE_URL}${path}`);
  return axiosRes.data;
}




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


// Get the book list available in the shop (axios + async/await)
public_users.get('/', async function (req, res) {
  try {
    const data = await fetchViaAxios('/customer/');
    return res.status(200).json(data);

  } catch (err) {
    const msg = err?.response?.data?.message || err.message;
    return res.status(500).json({ message: 'Failed to get books', error: String(msg) });
  }
});


// Get book details based on ISBN (axios + async/await)
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbnParam = req.params.isbn;
  const isbn = Number(isbnParam);

  if (!Number.isInteger(isbn)) {
    return res.status(400).json({ message: 'Invalid ISBN' });
  }

  try {
    const data = await fetchViaAxios(`/customer/isbn/${isbn}`);
    return res.status(200).json(data);

  } catch (err) {
    if (err?.response?.status === 404) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const msg = err?.response?.data?.message || err.message;
    return res.status(500).json({ message: 'Failed to get book', error: String(msg) });
  }
});


// Get book details based on author (axios + async/await)
public_users.get('/author/:author', async function (req, res) {
  const authorQuery = req.params.author;

  if (!authorQuery) {
    return res.status(400).json({ message: 'Invalid author' });
  }

  try {
    const data = await fetchViaAxios(`/customer/author/${encodeURIComponent(authorQuery)}`);
    return res.status(200).json(data);

  } catch (err) {
    if (err?.response?.status === 404) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const msg = err?.response?.data?.message || err.message;
    return res.status(500).json({ message: 'Failed to get books by author', error: String(msg) });
  }
});


// Get all books based on title (axios + async/await)
public_users.get('/title/:title', async function (req, res) {
  const titleQuery = req.params.title;

  if (!titleQuery) {
    return res.status(400).json({ message: 'Invalid title' });
  }

  try {
    const data = await fetchViaAxios(`/customer/title/${encodeURIComponent(titleQuery)}`);
    return res.status(200).json(data);

  } catch (err) {
    if (err?.response?.status === 404) {
      return res.status(404).json({ message: 'Book not found' });
    }
    const msg = err?.response?.data?.message || err.message;
    return res.status(500).json({ message: 'Failed to get books by title', error: String(msg) });
  }
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

