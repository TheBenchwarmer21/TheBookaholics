insert into users (username, password) values ('BookLover', 'love');
insert into users (username, password) values ('LunaExplorer', 'KeyX-165');
insert into users (username, password) values ('QuantumCoder', 'CodeZ-789');
insert into users (username, password) values ('SkyPioneer', 'AlphaID-234');
insert into users (username, password) values ('EmberSeeker', 'Cipher-421');

insert into books (book_url, book_name, author) values ('https://www.google.com/books/edition/Harry_Potter_and_the_Half_Blood_Prince/R7YsowJI9-IC?hl=en&gbpv=1&dq=Harry+Potter&printsec=frontcover', 'Harry Potter and the Half Blood Prince', 'J.K. Rowling');
insert into books (book_url, book_name, author) values ('https://www.google.com/books/edition/Harry_Potter_and_the_Sorcerer_s_Stone/mvmGPgAACAAJ?hl=en', 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling');
insert into books (book_url, book_name, author) values ('https://www.google.com/books/edition/Adventures_of_Huckleberry_Finn/mWHcDAAAQBAJ?hl=en&gbpv=1&dq=huckleberry+finn&printsec=frontcover', 'Adventures of Huckleberry Finn', 'Mark Twain');
insert into books (book_url, book_name, author) values ('https://www.google.com/books/edition/Romeo_and_Juliet/PyJaEAAAQBAJ?hl=en&gbpv=1&dq=romeo+and+juliette&printsec=frontcover', 'Romeo and Juliet', 'William Shakespeare');
insert into books (book_url, book_name, author) values ('https://www.google.com/books/edition/Dracula/39lCAQAAMAAJ?hl=en&gbpv=1&dq=dracula&printsec=frontcover', 'Dracula', 'Bram Stoker');

insert into reviews (review_title, username, review, rating) values ('Review of Harry Potter and the Half Blood Prince', 'BookLover', 'Harry Potter and the Half-Blood Prince is a spellbinding journey into the wizarding world. J.K. Rowling''s masterful storytelling and intricate plot twists make it a captivating addition to the series.', 8.7);
insert into reviews (review_title, username, review, rating) values ('Review of Harry Potter and the Sorcerer''s Stone', 'BookLover', 'Harry Potter and the Sorcerer''s Stone captivates with its magical world, compelling characters, and enchanting narrative. J.K. Rowling''s debut introduces readers to an unforgettable journey of wizardry and friendship.', 8.9);
insert into reviews (review_title, username, review, rating) values ('Review of Huckleberry Finn', 'BookLover', 'Huckleberry Finn is a timeless classic, navigating the Mississippi River with Huck and Jim. Mark Twain''s vivid storytelling and social commentary make it an enduring masterpiece of American literature.', 8.8);
insert into reviews (review_title, username, review, rating) values ('Review of Romeo and Juliet', 'BookLover', 'Romeo and Juliet, a timeless classic by William Shakespeare, beautifully captures the essence of tragic love, poignant sacrifice, and feuding families, creating an enduring masterpiece of literature.', 9.9);
insert into reviews (review_title, username, review, rating) values ('Review of Dracula', 'BookLover', 'Dracula by Bram Stoker is a timeless masterpiece, weaving suspense and horror into a captivating narrative. Stoker''s gothic masterpiece introduces the iconic Count Dracula, leaving readers spellbound with its chilling atmosphere.', 7.8);

insert into books_to_users(book_id, user_id) values (1,1);
insert into books_to_users(book_id, user_id) values (2,1);
insert into books_to_users(book_id, user_id) values (3,1);
insert into books_to_users(book_id, user_id) values (4,1);
insert into books_to_users(book_id, user_id) values (5,1);

insert into books_to_reviews(book_id, review_id) values (1,1);
insert into books_to_reviews(book_id, review_id) values (2,2);
insert into books_to_reviews(book_id, review_id) values (3,3);
insert into books_to_reviews(book_id, review_id) values (4,4);
insert into books_to_reviews(book_id, review_id) values (5,5);

insert into reviews_to_users(user_id, review_id) values (1,1);
insert into reviews_to_users(user_id, review_id) values (1,2);
insert into reviews_to_users(user_id, review_id) values (1,3);
insert into reviews_to_users(user_id, review_id) values (1,4);
insert into reviews_to_users(user_id, review_id) values (1,5);