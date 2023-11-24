// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const path = require('path'); // Add images
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
const { use } = require('chai');

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.
app.use(express.static(path.join(__dirname, 'resources'))); // Use to add Images

// initialize session variables
app.use(session({
  secret: process.env.SESSION_SECRET || 'super duper secret!', 
  saveUninitialized: false,
  resave: false,
}));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************
// TODO - Include your API routes here

// suman's code for login
// app.get("/", (req,res) => {
//   res.render('pages/login');
// });


// // Redirect from root to /login
// app.get('/', (req, res) => {
//   res.redirect('/login');
// });

// app.get('/login', (req, res) => {
//     res.render('pages/login');
//   });

// app.post('/login', async (req, res) => {
//     try {
//       const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', req.body.username);
//       if (user && await bcrypt.compare(req.body.password, user.password)) {
//         req.session.user = user;
//         res.redirect('/home');
//       } else {
//         throw new Error("Incorrect username or password.");
//       }
//     } catch (error) {
//       console.error("Login Error:", error);
//       res.render('pages/home', { message: "Incorrect username or password." });
//     }
//   });
  
// const auth = (req, res, next) => {
//   if (!req.session.user) {
//     return res.redirect('/login');
//   }
//   next();
// };
// app.use(auth);




app.post('/delete_user', (req, res) => {
  db.any('DELETE FROM users WHERE username = $1', [req.body.username])
  .then(data => {
    res.status(200);
    console.log("User has been deleted");
    res.json({message: "User has been deleted"});
  })
});

// yusef's new login code (closes #48)
const auth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
};


app.use((req, res, next) => {
  const openPaths = ['/', '/login', '/register'];
  if (openPaths.includes(req.path)) return next();
  return auth(req, res, next);
});


app.get("/", (req, res) => {
  res.redirect('/login'); // Only keep this redirect
});


app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/home'); // If already logged in, go to home
  res.render('pages/login');
});

app.post('/login', async (req, res) => {
  try {
    const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', req.body.username);
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      req.session.user = user;
      req.session.save(err => { // Save session before redirecting
        if (err) {
          throw err;
        }
        res.redirect('/home');
      });
    } else {
      res.status(401);
      res.render('pages/login', { message: "Incorrect username or password." }); // Render login with a message
    }
  } catch (error) {
    console.error("Login Error:", error);
    res.render('pages/login', { message: "Login failed, please try again." }); // Render login with a message
  }
});

// done (for register)
app.get("/register", (req, res) => { 
  res.render("pages/register");
});



// done (hash the password, and insert username and hashed password into the users table from create.sql)
app.post("/register", async (req, res) => 
{ 
  const isTest = req.get('Test-Header') === 'unit-test' // The var isTest will be true if the test header = unit-test. There will be no test header if the register route is being called from anything other than mocha/chai tests. 
  try {

    const existingUser = await db.one('SELECT FROM users WHERE username = $1', [req.body.username]); // If this fails, i.e. there are no rows that contain the username that is being registered, the code will jump to the catch block, nothing else in the try block will run. 
    res.status(400);
    // This will run if a user with the entered username already exists. 
    if(isTest) { // If this route is being called by a test, return a json
      res.json({message: 'Username already exists, please try again.'});
    } 
    else // If this route is being called by anything other than a test, render page with error message. 
    { 
      res.render("pages/register", { error: "Username already exists, please try again." });
    }
    
  } catch (error) {

    const hash = await bcrypt.hash(req.body.password, 10);                                     // the hash
    const newuser = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;`;     // newuser containing username and password
  
    db.any(newuser, [
        req.body.username,
        hash,
    ])
    .then((data) => { 
        // Display successful registration to the user. 
        if(isTest) {
          res.json({message: "Registration successful"});
        } else {
          res.render("pages/register", { message: "Registration successful" });
        }
    })
    .catch((err) => { 
        // Assuming the error is due to a pre-existing user. In a real-world scenario, you'd want to be more specific about catching this error type.
        res.status(400);
        if(isTest) {
          res.json({message: 'Username already exists, please try again.'});
        } else {
          res.render("pages/register", { error: "Username already exists, please try again." });
        }
    });
  }
});





app.get('/welcome', auth, (req, res) => {
    res.render('welcome', { username: req.session.user.username });
  });
  
  app.get('/home', auth, (req, res) => {
    resetGlobalVariables();
    const username = req.session.user.username; // Adjust according to how you store user information
  
      // Render the EJS template and pass the username in the response object
      res.render('pages/home', { username: username });
  });
  


app.get('/myreviews', auth, (req, res) => {
  console.log('Rendering myreviews page');

  if(req.session.user === undefined)
  {
    res.render('pages/myreviews', {
      myreviews: []
    });

  } else {

    const reviewQuery = 'SELECT * FROM reviews WHERE username = $1;';

    db.any(reviewQuery, [req.session.user.username])
      .then((myreviews) => {
        res.render('pages/myreviews', {
          myreviews
        });
      })
      .catch((err) => {
        res.render('pages/myreviews', {
          myreviews: [],
          error: true
        });
      });
  }
});


app.get('/Mybooks', (req, res) => {
  if (req.session.user === undefined) {
    res.render('pages/Mybooks', { Mybooks: [] });
  } else {
    
    const userId = req.session.user.user_id;
    
   
    const bookQuery = 'SELECT b.* FROM books b INNER JOIN books_to_users btu ON b.book_id = btu.book_id WHERE btu.user_id = $1;';

    db.any(bookQuery, [userId])
      .then((Mybooks) => {
        res.render('pages/Mybooks', { Mybooks: Mybooks });
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        res.render('pages/Mybooks', { Mybooks: [], error: 'Unable to fetch books at this time.' });
      });
  }
});




  
// Route to display book reviews
app.get('/reviews', auth, async (req, res) => {
  try {
    const reviews = await db.any('SELECT * FROM reviews'); // Assuming 'reviews' is your table name
    res.render('pages/reviews', { reviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.render('pages/error', { message: "Error fetching reviews." });
  }
});
app.get('/add_reviews', auth, (req, res) => {
  const successMessage = req.query.message;
  res.render('pages/add_reviews', { successMessage });
});

// Route to add a new book review
app.post('/add_reviews', auth, async (req, res) => {
  try {
    const { review_title, review, rating } = req.body;
    const username = req.session.user.username; 
    const insertQuery = 'INSERT INTO reviews (review_title, username, review, rating) VALUES ($1, $2, $3, $4)';
    await db.none(insertQuery, [review_title, username, review, rating]);

    
    res.redirect('/myreviews?message=Review added successfully');
  } catch (error) {
    console.error("Error adding review:", error);
    res.render('pages/add_reviews', { message: "Error adding review. Please try again." });
  }
});
// my collection read_book and remove book routing
app.get('/read_book', (req, res) => {
  const bookId = req.params.bookId;
  //anybody have an idea how to ger the assosiated book id 
  // Logic to fetch the book's content
  res.send(`anybody have an idea how to get the assosiated book id or should we use api url which should have been collected when we add the book to the collection right${bookId}`);
});
//currently not working: could not retrieve bookId
app.post('/remove_book', (req, res) => {
  const bookId = req.body.bookId; // Retrieve bookId from the request body is not working
  const userId = req.session.user.user_id;

  const deleteQuery = 'DELETE FROM books_to_users WHERE book_id = $1 AND user_id = $2';

  db.none(deleteQuery, [bookId, userId])
    .then(() => {
      res.redirect('/Mybooks');
    })
    .catch(err => {
      console.error('Error removing book:', err);
      res.status(500).send('Error removing book');
    });
});



// Please don't touch the global variables or else some functionalities 
// in the search books won't work 
let numOfBooksShown = 25 // How many results are shown per "page", can be a potential feature for the user?
let index = 0; 
let maxResults = numOfBooksShown; 
let totalItems = 99999; // An absurdly high number so that the real totalItems can be correctly calculated
let lowEstimate = 0; 
let highEstimate = 0; 

let value = 0; // When 0, store value else never change value
let userSearch = ""; 
let searchOption = ""; 
let title = ""; 
let message = ""; 

  // The "totalItems" from Google Books API is an inaccurate piece of garbage that also
  // increments value every time the page renders, to combat this, I return the smallest value of totalItems 
  // for every search as well as estimating the value. 
function returnEstimatedTotalItems(n) { 
  if (n < totalItems) { 
    totalItems = n;
  }

  lowEstimate = Math.floor(totalItems / 30)  * 30; 
  highEstimate = Math.ceil(totalItems / 5) * 5; 
}

// This function is made to store userSearch the first time, but never the second time. 
function returnFixedString(newInput) { 
  if (value == 0) { 
    userSearch = newInput; 
  }

  else { 
    if (userSearch.length == newInput) { 
      userSearch = newInput; 
    }
  }

}

// This function is made to store title the first time, but never the second time. 
function returnFixedTitle(newInput) { 
  if (value == 0) { 
    title = newInput; 
  }

  else { 
    if (title.length == newInput) { 
      title = newInput; 
    }
  }

}

function resetGlobalVariables() { 
  index = 0; 
  totalItems = 99999; 
  lowEstimate = 0; 
  highEstimate = 0; 

  value = 0; 
  userSearch = ""; 
  searchOption = ""; 
  title = ""; 
  message = ""; 
}

// Some titles or author's have an apostrophe, which throws off SQL apostrophe. 
// To combat this just add an apostrophe before an apostrophe. Example: 
// name = 'Author's name O'neill' 
// (after function call): 
// name = 'Author''s name O''neill'
// will be interpreted as: 
// name = 'Author' + 's name O' + 'neill' 
function fixApostrophe(n) { 
  var currentIndex = 0; 
  for (var x = 0; x < n.length; x++) { 
    if (n[x] === "\'") {
      n = n.slice(currentIndex, x) + "\'" + n.slice(x, n.length); 
      currentIndex = x + 1; 
      x = currentIndex; 
    }
  }
  return(n); 
}

app.get("/searchbarresult", auth, (req,res) => { 
  // Immediately check if variables need to be reset
  if (req.query.resetVariables) { 
    resetGlobalVariables();  
  }

  if (req.query.message) { 
    message = req.query.message;
  }
  else { 
    message = ""; 
  }

  let holdUserInput; // "New" input that I don't want to actually pass to Google Books API

  // Below is to keep the first input but never the second one
  if (req.query.searchOption) { 
    searchOption = req.query.searchOption;
    holdUserInput = searchOption + req.query.userSearch;
    value = 0;
  }
  else { 
    holdUserInput = req.query.userSearch; 
    value = 1;
  }

  // Functions will return strings without "intitle:" or "inauthor:"
  returnFixedString(holdUserInput); 
  returnFixedTitle(req.query.userSearch); 

  // Below is to transverse pages and display appropiate results
  if (req.query.backpage) { 
    index = index - numOfBooksShown; 
  } 
  if (req.query.nextpage) { 
    index = index + numOfBooksShown; 
  }

  // Last Page, dont render out of scope books
  if (req.query.fillRemaining) { 
    maxResults = req.query.leftOver - index; 
  }
  
  axios({
    url: `https://www.googleapis.com/books/v1/volumes`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
      q: userSearch,
      startIndex: index,
      maxResults: maxResults,
      apikey: process.env.API_KEY, 
    },
  })

    .then(results => { 
      returnEstimatedTotalItems(results.data.totalItems); 
      res.render('pages/searchbarresult', { 
        results: totalItems,
        books: results.data.items,
        title: title,
        searched: userSearch,
        searchOption: searchOption,
        currentIndex: index,
        counter: 0,
        lowEstimate: lowEstimate, 
        highEstimate: highEstimate,
        numOfBooksShown: numOfBooksShown,
        message: message,
      }); 
    })
    .catch(err => {
      res.render("pages/searchbarresult", { 
        results: [],
        message: "API call failed",
      });
    });
});

app.post('/searchbarresult', async (req, res) => { 
  // Modified Cooper's code for adding books - Oscar
  const values = {book_name: fixApostrophe(req.body.book_name), 
    author: req.body.author, userID: req.session.user.user_id,
    book_url: req.body.book_url}; 

  const book_title = req.body.book_name; 
  const isTest = req.get('Test-Header') === 'unit-test' // The var isTest will be true if the test header = unit-test. There will be no test header if the register route is being called from anything other than mocha/chai tests. 
  try {
   // existingBook Query not only checks if a book already exists in the books database
   // (which we decided should be unique) It also checks if the current user has a relation 
   // to said book in the books_to_users table. Query fails when user already has a book in their collection. 
   const existingBook = await db.one ( 
    `WITH TEMP AS ( 
      SELECT book_id 
      FROM books 
      WHERE book_name = '${values.book_name}' AND 
      author = '${values.author}'
      )

    SELECT *
    FROM books_to_users 
    INNER JOIN TEMP 
    ON books_to_users.book_id = TEMP.book_id 
    WHERE books_to_users.user_id = ${values.userID};
    `);

    res.status(400);
    
    // Below if statement is to test API later? 
    if(isTest) { 
      res.json({message: 'Book already exists in the users collection! '});
    } 
    else 
    { 
      // Tell user that book is already in their collection. 
      res.redirect("/searchbarresult?message=" + book_title + " is already in your collection!");
    }
    
  // Below 'catch' body is what to do if user doesn't have book in collection and makes sure
  // the books database is unique simultaneously. 
  } catch (error) {

    // Check if current book already exists in database, if not create a book in books database in CATCH but if it already does, 
    // THEN just add user_id into the books_to_users database. 
    const checkIfBookExists = `SELECT * FROM books WHERE 
    book_name = '${values.book_name}' 
    AND author = '${values.author}';`;  
  
    db.any(checkIfBookExists)

    .then((data) => { 

        // Below if statement is to test API later?
        if(isTest) {
          res.json({message: "Added book to collection"});
        } else {

          const addConnection = `INSERT INTO books_to_users(book_id, user_id) VALUES ($1, $2);`;

          db.any(addConnection, [ 
            data[0].book_id, 
            values.userID,
          ])

          .then((data1) => { 
            res.redirect("/searchbarresult?message=" + book_title + " has been added to the collection!");
          })
          
        }
    })
    .catch((err) => { 
        // May have to add test in this area as well for the future. 
        const addBook = `INSERT INTO BOOKS (book_url, book_name, author) VALUES 
        ('${values.book_url}', '${values.book_name}', '${values.author}') RETURNING *;`  

        db.any(addBook)

        .then((data) => { 
          const addConnection = `INSERT INTO books_to_users(book_id, user_id) VALUES ($1, $2);`;

          db.any(addConnection, [ 
            data[0].book_id, // Recently added book's ID
            values.userID,
          ])

          .then((data1) => { 
            res.redirect("/searchbarresult?message=" + book_title + " has been added to the collection!");
          })
        })
    });
  }
});



  app.get('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error in session destruction:", err);
      }
      res.render('pages/login', { message: "Logged out Successfully" });
    });
  });
  module.exports = app;
// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
module.exports = app.listen(3000);
console.log('Server is listening on port 3000');



// yusef first branch commit here (previous work was done on main)
