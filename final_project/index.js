const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

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
        req.user = user;
        next();
    });
});


 
const PORT =6000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
