DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(100),
  username VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS books CASCADE;
CREATE TABLE IF NOT EXISTS books (
  book_id SERIAL PRIMARY KEY NOT NULL,
  book_name VARCHAR(100) NOT NULL,
  author VARCHAR(100),
  genre VARCHAR(100) CONSTRAINT limited_values CHECK (genre in ('fiction', 'non-fiction', 'sci-fi', 'novel', 'mystery', 'thriller'))
);

DROP TABLE IF EXISTS reviews CASCADE;
CREATE TABLE IF NOT EXISTS reviews (
  review_id SERIAL PRIMARY KEY NOT NULL,
  book_id SERIAL NOT NULL,
  username VARCHAR(100),
  review VARCHAR(200),
  rating DECIMAL NOT NULL,
  FOREIGN KEY (book_id) REFERENCES books (book_id)
);

DROP TABLE IF EXISTS my_books CASCADE;
CREATE TABLE IF NOT EXISTS my_books (
  book_id SERIAL NOT NUll,
  user_id SERIAL NOT NUll,
  FOREIGN KEY (book_id) REFERENCES books (book_id),
  FOREIGN KEY (user_id) REFERENCES users (user_id)
);

