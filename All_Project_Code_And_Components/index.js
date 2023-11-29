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
const { error } = require('console');

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
    return res.render('pages/welcome', { 
      error: true,
      message: "Session Timed Out"
    });
  }
  next();
};


app.use((req, res, next) => {
  const openPaths = ['/', '/login', '/register','/welcome'];
  if (openPaths.includes(req.path)) return next();
  return auth(req, res, next);
});


app.get("/", (req, res) => {
  res.redirect('/welcome'); // Only keep this redirect
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
      res.render('pages/login', { error: true, message: "Incorrect username or password." }); // Render login with a message
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
          res.render("pages/login", { message: "Registration successful" });
          
          res.render("pages/login", { message: "Registration successful" });
          
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


// added


app.get('/welcome', auth, (req, res) => {
    res.render('pages/Welcome', { username: req.session.user.username });
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
      myreviews: [],
      page: 1
    });

  } else {

    const reviewQuery = 'SELECT reviews.*, books.* FROM reviews INNER JOIN books_to_reviews ON reviews.review_id = books_to_reviews.review_id INNER JOIN books ON books_to_reviews.book_id = books.book_id WHERE reviews.username = $1;';
    if(req.query.page_num === undefined) {
      db.any(reviewQuery, [req.session.user.username])
      .then((myreviews) => {
        res.render('pages/myreviews', {
          myreviews,
          page: 1,
          message: req.query.message,
        });
      })
      .catch((err) => {
        res.render('pages/myreviews', {
          myreviews: [],
          page: 1,
          error: true
        });
      });
    } else {
      db.any(reviewQuery, [req.session.user.username])
      .then((myreviews) => {
        res.render('pages/myreviews', {
          myreviews,
          page: req.query.page_num,
          message: req.query.message,
        });
      })
      .catch((err) => {
        res.render('pages/myreviews', {
          myreviews: [],
          page: req.query.page_num,
          error: true
        });
      });
    }
    
  }
});


app.get('/otherreviews/:review_id', auth, (req, res) => {
  console.log('Rendering otherreviews page');

  if (req.session.user === undefined) {
    res.render('pages/otherreviewsd', {
      otherreviews: [],
      page: 1
    });

  } else {
    const review_id = req.params.review_id;
    console.log(review_id);
    const reviewQuery = `SELECT r.* FROM reviews r JOIN books_to_reviews btr ON r.review_id = btr.review_id WHERE btr.book_id = (SELECT book_id FROM books_to_reviews WHERE review_id ='${review_id}');`;

    if (req.query.page_num === undefined) {
      db.any(reviewQuery, [req.session.user.username])
        .then((otherreviews) => {
          res.render('pages/otherreviews', {
            otherreviews,
            page: 1
          });
        })
        .catch((err) => {
          res.render('pages/otherreviews', {
            otherreviews: [],
            page: 1,
            error: true
          });
        });
    } else {
      db.any(reviewQuery, [req.session.user.username])
        .then((myreviews) => {
          res.render('pages/otherreviews', {
            otherreviews,
            page: req.query.page_num
          });
        })
        .catch((err) => {
          res.render('pages/otherreviews', {
            otherreviews: [],
            page: req.query.page_num,
            error: true
          });
        });
    }
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
        res.render('pages/Mybooks', { message: req.query.message ,Mybooks: Mybooks });
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        res.render('pages/Mybooks', { Mybooks: [], error: 'Unable to fetch books at this time.' });
      });
  }
});
app.get('/reviews', auth, async (req, res) => {
  // Message turns red if there is a book already in collection / Passes error
  if (req.query.error) { 
    errorMessage = true;
  }
  else {
    errorMessage = false;
  }

  try {
    const reviews = await db.any(`
      SELECT reviews.*, books.book_name, books.author, books.book_url 
      FROM reviews 
      JOIN books_to_reviews ON reviews.review_id = books_to_reviews.review_id
      JOIN books ON books_to_reviews.book_id = books.book_id;
    `);

    let groupedReviews = {};

    reviews.forEach(review => {
      if (!groupedReviews[review.book_name]) {
        groupedReviews[review.book_name] = {
          reviews: [],
          averageRating: 0,
          author: review.author, // Correctly set here
          book_url: review.book_url // Correctly set here
        };
      }
      groupedReviews[review.book_name].reviews.push(review);
    });

    // Calculate average rating for each title
    for (let bookName in groupedReviews) {
      let totalRating = groupedReviews[bookName].reviews.reduce((acc, review) => acc + Number(review.rating), 0);
      let averageRating = totalRating / groupedReviews[bookName].reviews.length;
      groupedReviews[bookName].averageRating = averageRating.toFixed(1); // Keeping one decimal
    }

    res.render('pages/reviews', { message: req.query.message, error: errorMessage, groupedReviews });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    res.render('pages/error', { message: "Error fetching reviews." });
  }
});





function groupReviewsByTitle(reviews) {
  return reviews.reduce((acc, review) => {
    // If the title doesn't exist in the accumulator, add it
    if (!acc[review.review_title]) {
      acc[review.review_title] = [];
    }
    // Add the review to the appropriate title group
    acc[review.review_title].push(review);
    return acc;
  }, {});
}

app.get('/add_reviews', auth, (req, res) => {
  const successMessage = req.query.message;
  res.render('pages/add_reviews', { successMessage });
});

// Route to add a new book review
app.post('/add_reviews', auth, async (req, res) => {
  const values = {
    review_title: fixApostrophe(req.body.review_title),
    review: fixApostrophe(req.body.review),
    rating: req.body.rating,
    username: fixApostrophe(req.session.user.username),
    book_name: fixApostrophe(req.body.book_name),
    author: fixApostrophe(req.body.author),
    book_url: req.body.book_url
  };

    const getBookID = `SELECT * FROM books WHERE book_name = '${values.book_name}' AND author = '${values.author}';`;

    db.any(getBookID)

    .then((data0) => { 
      let bookID = data0[0].book_id;

      const addReview = `INSERT INTO reviews (review_title, username, review, rating) VALUES 
      ('${values.review_title}', '${values.username}', '${values.review}', ${values.rating}) RETURNING review_id;`;

      db.any(addReview) 

      .then((data1) => { 
        let reviewID = data1[0].review_id; 
        const connection = `INSERT INTO books_to_reviews (book_id, review_id) VALUES ($1 , $2)`;
  
        db.any(connection, [
          bookID, 
          reviewID,
        ])
    
        res.redirect('/myreviews?message=Review added successfully');
      })

      

    })
    .catch((err) => { 
      console.log(err);
      const addReview = `INSERT INTO reviews (review_title, username, review, rating) VALUES 
      ('${values.review_title}', '${values.username}', '${values.review}', ${values.rating}) RETURNING *;`;
      const addBook = `INSERT INTO books (book_url, book_name, author) VALUES ('${values.book_url}', '${values.book_name}', '${values.author}') RETURNING *;`;

      db.task('get-everything', task => { 
        return task.batch([ 
          task.any(addReview), 
          task.any(addBook),
        ]);
      })

      .then((data) => { 
        let reviewID = data[0][0].review_id; 
        let bookID = data[1][0].book_id;

        const connection = `INSERT INTO books_to_reviews (book_id, review_id) VALUES ($1 , $2)`;
  
        db.any(connection, [
          bookID, 
          reviewID,
        ])
    
        res.redirect('/myreviews?message=Review added successfully');

      })
    });
});

app.post('/add-to-collection', auth, async (req, res) => {
  const { book_name, author, book_url } = req.body;
  const userID = req.session.user.user_id; // Assuming the user's ID is stored in the session

  try {
      // Check if the book already exists in the database
      let book = await db.oneOrNone(`SELECT book_id FROM books WHERE book_name = $1 AND author = $2`, [book_name, author]);

      if (!book) {
          // Add the book to the database if it doesn't exist
          book = await db.one(`INSERT INTO books (book_name, author, book_url) VALUES ($1, $2, $3) RETURNING book_id`, [book_name, author, book_url]);
      }

      // Check if the user already has this book in their collection
      const userBook = await db.oneOrNone(`SELECT * FROM books_to_users WHERE user_id = $1 AND book_id = $2`, [userID, book.book_id]);

      if (!userBook) {
          // Add the book to the user's collection
          await db.none(`INSERT INTO books_to_users (user_id, book_id) VALUES ($1, $2)`, [userID, book.book_id]);
          res.redirect("/reviews?message=" + book_name + " added to collection");
      } else {
          // Handle the case where the book is already in the user's collection
          res.redirect("/reviews?error='true'&message=" + book_name + " already in collection");
      }
  } catch (error) {
      console.error('Error adding book to collection:', error);
      res.redirect("/reviews?error='true'&message=" + book_name + " already in collection");
  }
});


app.post('/edit_review', auth, async (req, res) => {
  try {
    const editQuery = 'UPDATE reviews SET review_title = $1, review = $2, rating = $3 WHERE review_id = $4;';
    // Not sure what the below variable exactly does, so rename variable if you wish - Oscar
    const pageNum = req.body.page_num;
    db.none(editQuery, [req.body.review_title, req.body.review, req.body.rating, req.body.review_id]);
    res.redirect('/myreviews?message=Review Edited Successfully&page_num=' + pageNum);
  } catch (error) {
    console.log("Error editing review. Please try again.");
    res.redirect('/myreviews');
  }
});

app.post('/delete_review', auth, async (req, res) => {
  try {
    const deleteQuery = 'DELETE FROM books_to_reviews WHERE review_id = $1; DELETE FROM reviews WHERE review_id = $1;';
    db.none(deleteQuery, [req.body.review_id]);
    res.redirect("/myreviews?message=Review Deleted Successfully");
  } catch (error) {
    console.log(error)
    res.redirect('/myreviews');
  }
});

// my book colection, remove book routing
app.post('/remove_book', (req, res) => {
  const bookTitle = req.body.book_name;
  const book_id = req.body.bookId;
  const user_id = req.session.user.user_id;
  if (!book_id || isNaN(book_id)) {
    return res.status(400).send('Invalid book ID');
}
  const deleteQuery = 'DELETE FROM books_to_users WHERE book_id = $1 AND user_id = $2';
  db.none(deleteQuery, [book_id, user_id])
    .then(() => {
      res.redirect('/Mybooks?message=' + bookTitle + ' has been removed!');
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
let errorMessage = false; 

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
  errorMessage = false; 
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

  // Activate message if user is trying to add duplicate book to books database
  if (req.query.error) { 
    errorMessage = true;
  }
  else {
    errorMessage = false;
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

    if (searchOption == "intitle:") { 
      searchType = "Showing Books Titled: "; 
    }
    else if (searchOption == "inauthor:") { 
      searchType = "Showing Books by Author: "; 
    }

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
        searchType: searchType,
        error: errorMessage,
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
      console.log(book_title);
      res.redirect("/searchbarresult?error='true'&message=" + book_title + " is already in your collection!");
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
            console.log(book_title);
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
            console.log(book_title);
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
