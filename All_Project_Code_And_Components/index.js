// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
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

app.get("/", (req,res) => {
  res.render('pages/login');
});


// Redirect from root to /login
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('pages/login');
  });

app.post('/login', async (req, res) => {
    try {
      const user = await db.oneOrNone('SELECT * FROM users WHERE username = $1', req.body.username);
      if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.user = user;
        res.redirect('/welcome');
      } else {
        throw new Error("Incorrect username or password.");
      }
    } catch (error) {
      console.error("Login Error:", error);
      res.render('pages/welcome', { message: "Incorrect username or password." });
    }
  });

  

app.get('/register', (req, res) => {
    res.render('pages/register');
  });
// Register
app.post('/register', async (req, res) => {
  try {
      console.log('Attempting to register user:', req.body.username); 
      const hash = await bcrypt.hash(req.body.password, 10);
      await db.none('INSERT INTO users (username, password) VALUES ($1, $2)', [req.body.username, hash]);
      console.log('User registered successfully:', req.body.username); 
      res.redirect('/login');
  } catch (error) {
      console.error("Registration Error:", error);
      res.render('pages/login', { message: "Registration failed. Please try again." });
  }
});
app.get('/welcome', (req, res) => {
  res.render('pages/welcome');
});
app.get('/home', (req, res) => {
  res.render('pages/welcome');
});

const auth = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/login');
  }
  next();
};
app.use(auth);
  
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




