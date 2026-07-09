/**
 * Express app entry point.
 *
 * Responsibilities:
 * - Configure JSON body parsing.
 * - Configure session middleware for /customer.
 * - Apply JWT authentication middleware to /customer/auth/* routes.
 * - Mount route modules:
 *   - Auth/review routes: ./router/auth_users.js
 *   - Public book routes: ./router/general.js
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

// Parse application/json request bodies.
app.use(express.json());

// Session middleware used for /customer paths.
app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
  })
);

/**
 * JWT auth middleware for protected auth endpoints.
 *
 * Expected header format:
 *   Authorization: Bearer <token>
 *
 * On success:
 * - attaches decoded JWT payload to req.user
 */
app.use("/customer/auth/*", function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const parts = String(authHeader).split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }

  const token = parts[1];

  jwt.verify(token, 'access', (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // req.user is consumed by protected routes to identify the username.
    req.user = user;
    next();
  });
});

const PORT = 6000;

// Protected auth/review routes (JWT required by middleware above).
app.use("/customer", customer_routes);

// Public routes.
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));

