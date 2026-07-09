/**
 * Public routes.
 *
 * Requirements:
 * - Uses Axios for HTTP requests.
 * - Uses async/await.
 * - Handles errors for missing books/authors/titles.
 */

const express = require("express");
const axios = require("axios");

const public_users = express.Router();


// Shared users array
const users = require("./auth_users.js").users;


// Internal API URL
const BASE_URL = "http://localhost:6000";


// Axios helper function
async function getData(endpoint) {

    const response = await axios.get(
        `${BASE_URL}${endpoint}`
    );

    return response.data;
}



// Register new user
public_users.post("/register", (req, res) => {

    const {
        username,
        password
    } = req.body || {};


    if (!username || !password) {

        return res.status(400).json({
            message: "Username and password are required"
        });

    }


    const userExists = users.find(
        user => user.username === username
    );


    if (userExists) {

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
public_users.get("/", async (req, res) => {

    try {

        const books = await getData("/customer/books");

        return res.status(200).json(books);


    } catch(error) {


        return res.status(500).json({

            message: "Failed to get books",

            error: error.message

        });

    }

});





// Get book by ISBN
public_users.get("/isbn/:isbn", async (req,res)=>{

    try {

        const book = await getData(
            `/customer/isbn/${req.params.isbn}`
        );


        return res.status(200).json(book);



    } catch(error){


        if(error.response &&
           error.response.status === 404){


            return res.status(404).json({

                message:"Book not found"

            });

        }



        return res.status(500).json({

            message:"Failed to get book",

            error:error.message

        });


    }

});






// Get books by author
public_users.get("/author/:author", async(req,res)=>{


    try {


        const books = await getData(

            `/customer/author/${encodeURIComponent(req.params.author)}`

        );


        return res.status(200).json(books);



    } catch(error){


        if(error.response &&
           error.response.status === 404){


            return res.status(404).json({

                message:"Author not found"

            });

        }



        return res.status(500).json({

            message:"Failed to get books by author",

            error:error.message

        });


    }


});








// Get books by title
public_users.get("/title/:title", async(req,res)=>{


    try {


        const books = await getData(

            `/customer/title/${encodeURIComponent(req.params.title)}`

        );


        return res.status(200).json(books);



    } catch(error){


        if(error.response &&
           error.response.status === 404){


            return res.status(404).json({

                message:"Title not found"

            });

        }



        return res.status(500).json({

            message:"Failed to get books by title",

            error:error.message

        });


    }


});








// Get reviews for a book
public_users.get("/review/:isbn", async(req,res)=>{


    try {


        const reviews = await getData(

            `/customer/review/${req.params.isbn}`

        );


        return res.status(200).json(reviews);



    } catch(error){


        if(error.response &&
           error.response.status === 404){


            return res.status(404).json({

                message:"Book not found"

            });


        }



        return res.status(500).json({

            message:"Failed to get reviews",

            error:error.message

        });


    }


});





module.exports.general = public_users;