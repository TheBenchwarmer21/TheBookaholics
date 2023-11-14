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
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

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



// yusef's login 
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
  const hash = await bcrypt.hash(req.body.password, 10);                                     // the hash
  const newuser = `INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *;`;     // newuser containing username and password

  db.any(newuser, [
      req.body.username,
      hash,
  ])
  .then((data) => { 
      // Display successful registration to the user. 
      res.render("pages/register", { message: "Registration successful" });
  })
  .catch((err) => { 
      // Assuming the error is due to a pre-existing user. In a real-world scenario, you'd want to be more specific about catching this error type.
      res.render("pages/register", { error: "Another user has the same information.  Please Try Again. " });
  });
});














app.get('/welcome', auth, (req, res) => {
  res.render('pages/welcome');
});

app.get('/home', auth, (req, res) => {
  resetGlobalVariables();
  res.render('pages/home');
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





app.get('/Mybooks', (req, res) => 
{
  console.log('Rendering Mybooks page');

  if (req.session.user === undefined) {

    res.render('pages/Mybooks', { 
      Mybooks: []
    });

  } else {

    const bookQuery = 'SELECT * FROM books WHERE username = $1;';

    db.any(bookQuery, [req.session.user.username])
      .then((Mybooks) => {

        res.render('pages/Mybooks', { 
          Mybooks: Mybooks
        });
      })
      .catch((err) => {
        console.error('Error fetching books:', err);
        res.render('pages/Mybooks', { 
          Mybooks: [],
          error: 'Unable to fetch books at this time.'
        });
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
  console.log('Rendering add_review page');
  res.render('pages/add_reviews');
});

// Route to add a new book review
app.post('/add_reviews', auth, async (req, res) => {
  try {
    const { title, author, review } = req.body;
    await db.none('INSERT INTO reviews (title, author, review) VALUES ($1, $2, $3)', [title, author, review]);
    res.redirect('/pages/add_reviews');
  } catch (error) {
    console.error("Error adding review:", error);
    res.render('pages/error', { message: "Error adding review." });
  }
});

// Please don't touch the global variables or else some functionalities 
// in the search books won't work 
let numOfBooksShown = 25 // How many results are shown per "page", can be a potential feature for the user?
let index = 0; 
let maxResults = numOfBooksShown; 
let totalItems = 99999; // An absurdly high number so that the real totalItems can be correctly calculated
let lowEstimate = 0; 
let highEstimate = 0; 

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

function resetGlobalVariables() { 
  index = 0; 
  totalItems = 99999; 
  lowEstimate = 0; 
  highEstimate = 0; 
}

app.get("/searchbarresult", auth, (req,res) => { 
  // "Intitle" returns results where the user's search matches the book's title 
  // rather than the book's author, description, publisher, etc. 
  const userSearch = "intitle:" + req.query.userSearch;

  if (req.query.backpage) { 
    console.log("Back Page activated");
    index = index - numOfBooksShown; 
  } 
  else if (req.query.nextpage) { 
    console.log("Next Page activated");
    index = index + numOfBooksShown; 
  }

  else if (req.query.fillRemaining) { 
    maxResults = req.query.leftOver - index; 
  }

  else if (req.query.resetVariables) { 
    resetGlobalVariables();  
  }

  console.log("The Current Index: " + index); 
  
  axios({
    url: `https://www.googleapis.com/books/v1/volumes`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
      q: userSearch,
      // Address "maxResults" below when dealing with "back" and "next" button functionality
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
        // Substringed user input to get rid of "intitle:"
        searched: userSearch.substr(8,userSearch.length),
        currentIndex: index,
        counter: 0,
        lowEstimate: lowEstimate, 
        highEstimate: highEstimate,
        numOfBooksShown: numOfBooksShown,
      }); 
    })
    .catch(err => {
      res.render("pages/searchbarresult", { 
        results: [],
        message: "API call failed",
      });
    });
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
  
// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');




