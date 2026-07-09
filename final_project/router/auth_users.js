/**
 * Authenticated user routes.
 *
 * Features:
 * - User login with JWT
 * - Internal book retrieval endpoints for Axios requests
 * - Add/update reviews
 * - Delete reviews
 */


const express = require("express");
const jwt = require("jsonwebtoken");

let books = require("./booksdb.js");

const regd_users = express.Router();


// Shared in-memory users array
let users = [];




// Validate username
const isValid = (username) => {

    if (typeof username !== "string") {
        return false;
    }


    const name = username.trim();


    if (name.length < 3) {
        return false;
    }


    return /^[a-zA-Z0-9_.-]+$/.test(name);

};





// Authenticate user
const authenticatedUser = (username, password) => {

    const user = users.find(
        u => u.username === username
    );


    if (!user) {
        return false;
    }


    return user.password === password;

};





// Create JWT payload
const tokenPayloadFor = (username)=>{

    return {
        username
    };

};







// ===============================
// Axios internal GET routes
// ===============================



// Get all books
regd_users.get("/books",(req,res)=>{

    return res.status(200).json(books);

});





// Get book by ISBN
regd_users.get("/isbn/:isbn",(req,res)=>{


    const isbn = req.params.isbn;


    const book = books[isbn];


    if(!book){

        return res.status(404).json({

            message:"Book not found"

        });

    }


    return res.status(200).json({

        isbn,
        ...book

    });


});







// Get books by author
regd_users.get("/author/:author",(req,res)=>{


    const author = req.params.author.toLowerCase();



    const result = Object.keys(books)

        .map(isbn=>({

            isbn,
            ...books[isbn]

        }))


        .filter(book=>

            book.author.toLowerCase() === author

        );



    if(result.length === 0){

        return res.status(404).json({

            message:"Author not found"

        });

    }



    return res.status(200).json(result);


});







// Get books by title
regd_users.get("/title/:title",(req,res)=>{


    const title = req.params.title.toLowerCase();



    const result = Object.keys(books)

        .map(isbn=>({

            isbn,
            ...books[isbn]

        }))


        .filter(book=>

            book.title.toLowerCase() === title

        );




    if(result.length === 0){


        return res.status(404).json({

            message:"Title not found"

        });

    }



    return res.status(200).json(result);


});









// Get book reviews
regd_users.get("/review/:isbn",(req,res)=>{


    const isbn = req.params.isbn;


    const book = books[isbn];


    if(!book){

        return res.status(404).json({

            message:"Book not found"

        });

    }



    return res.status(200).json({

        isbn,

        reviews: book.reviews || {}

    });


});









// ===============================
// Authentication
// ===============================



// Login user
regd_users.post("/login",(req,res)=>{


    const {
        username,
        password

    } = req.body || {};



    if(!username || !password){


        return res.status(400).json({

            message:"Username and password are required"

        });

    }




    if(!authenticatedUser(username,password)){


        return res.status(403).json({

            message:"Invalid username or password"

        });

    }





    const token = jwt.sign(

        tokenPayloadFor(username),

        "access"

    );




    return res.status(200).json({

        token,

        message:"Login successful"

    });


});









// ===============================
// Reviews
// ===============================



// Add or update review
regd_users.put("/auth/review/:isbn",(req,res)=>{


    const isbn = req.params.isbn;


    const review =
        req.query.review ||
        req.body.review;



    const book = books[isbn];



    if(!book){

        return res.status(404).json({

            message:"Book not found"

        });

    }




    const username =
        req.user && req.user.username;



    if(!username){


        return res.status(403).json({

            message:"Unauthorized"

        });

    }




    if(!review){


        return res.status(400).json({

            message:"Review required"

        });

    }




    if(!book.reviews){

        book.reviews = {};

    }





    book.reviews[username] = review;




    return res.status(200).json({

        isbn,

        author:book.author,

        title:book.title,

        reviews:book.reviews

    });



});









// Delete review
regd_users.delete("/auth/review/:isbn",(req,res)=>{


    const isbn = req.params.isbn;


    const book = books[isbn];



    if(!book){


        return res.status(404).json({

            message:"Book not found"

        });

    }




    const username =
        req.user && req.user.username;



    if(!username){


        return res.status(403).json({

            message:"Unauthorized"

        });

    }




    if(!book.reviews ||
       !book.reviews[username]){


        return res.status(404).json({

            message:"Review not found"

        });


    }




    delete book.reviews[username];




    return res.status(200).json({

        isbn,

        author:book.author,

        title:book.title,

        reviews:book.reviews

    });



});







module.exports.authenticated = regd_users;

module.exports.isValid = isValid;

module.exports.users = users;