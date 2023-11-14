DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY NOT NULL,
  username VARCHAR(100) NOT NULL,
  password char(60) NOT NULL
);

DROP TABLE IF EXISTS books CASCADE;
CREATE TABLE IF NOT EXISTS books (
  book_url VARCHAR(300),
  book_id SERIAL PRIMARY KEY NOT NULL,
  book_name VARCHAR(100) NOT NULL,
  author VARCHAR(100)
);

DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY NOT NULL,
  review_title VARCHAR(200),
  username VARCHAR(100),
  review VARCHAR(5000),
  rating DECIMAL NOT NULL
);

DROP TABLE IF EXISTS books_to_users CASCADE;
CREATE TABLE IF NOT EXISTS books_to_users (
  book_id SERIAL NOT NUll,
  user_id SERIAL NOT NUll,
  FOREIGN KEY (book_id) REFERENCES books (book_id),
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

DROP TABLE IF EXISTS books_to_reviews CASCADE;
CREATE TABLE IF NOT EXISTS books_to_reviews (
  book_id SERIAL NOT NULL,
  review_id SERIAL NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books (book_id),
  FOREIGN KEY (review_id) REFERENCES reviews (review_id)
);

DROP TABLE IF EXISTS reviews_to_users CASCADE;
CREATE TABLE IF NOT EXISTS reviews_to_users (
    user_id SERIAL NOT NUll,
    review_id SERIAL NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id),
    FOREIGN KEY (review_id) REFERENCES reviews (review_id)
);