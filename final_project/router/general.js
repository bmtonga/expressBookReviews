/**
 * Public router.
 *
 * Includes:
 * - Register endpoint for creating in-memory users.
 * - Book discovery endpoints which forward to internal routes using axios + async/await.
 * - Book review listing endpoint (reads directly from booksdb.js in-memory store).
 */
const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");

// Shared in-memory auth store (exported from auth_users.js)
let users = require("./auth_users.js").users;

const public_users = express.Router();

// Local base URL used when forwarding requests to other routes.
const BASE_URL = 'http://localhost:6000';

/**
 * Forward a GET request to an internal endpoint.
 *
 * @param {string} path - Endpoint path (e.g., '/customer/isbn/1')
 * @returns {Promise<any>} - JSON response payload
 */
async function fetchViaAxios(path) {
  const axiosRes = await axios.get(`${BASE_URL}${path}`);
  return axiosRes.data;
}

/**
 * Register a new in-memory user.
 *
 * Request body:
 *   { "username": string, "password": string }
 */
public_users.post("/register", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  // Store users in-memory using the shared array exported from auth_users.js
  const existingUser = users.find((u) => u.username === username);
  if (existingUser) {
    if (existingUser.password === password) {
      return res.status(409).json({ message: 'Username already registered' });
    }
    return res.status(409).json({ message: 'Username already exists with a different password' });
  }

  users.push({ username, password });

  return res.status(201).json({ message: 'User registered successfully' });
});

/**
 * List all available books.
 *
 * Uses axios + async/await to retrieve from the internal endpoint.
 */
public_users.get('/', async function (req, res) {
  try {
    const data = await fetchViaAxios('/customer/');
    return res.status(200).json(data);
  } catch (err) {
    const msg = err?.response?.data?.message || err.message;
    return res.status(500).json({ message: 'Failed to get books', error: String(msg) });
  }
});

/**
 * Fetch a book by ISBN.
 */
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

/**
 * Fetch books by author.
 */
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

/**
 * Fetch books by title.
 */
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

/**
 * Get all reviews for a specific book (in-memory).
 */
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

  // Reviews are stored directly under the book object in booksdb.js
  return res.status(200).json({ isbn, reviews: book.reviews || {} });
});

module.exports.general = public_users;


