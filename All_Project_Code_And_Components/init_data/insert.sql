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

insert into reviews (review_title, username, review, rating) values ('Review of Harry Potter and the Half Blood Prince', 'BookLover', 'Harry Potter and the Half-Blood Prince is a spellbinding journey into the wizarding world. J.K. Rowling''s masterful storytelling and intricate plot twists make it a captivating addition to the series.', 8.6);
insert into reviews (review_title, username, review, rating) values ('Review of Harry Potter and the Sorcerer''s Stone', 'BookLover', 'Harry Potter and the Sorcerer''s Stone captivates with its magical world, compelling characters, and enchanting narrative. J.K. Rowling''s debut introduces readers to an unforgettable journey of wizardry and friendship.', 8.3);
insert into reviews (review_title, username, review, rating) values ('Review of Huckleberry Finn', 'BookLover', 'Huckleberry Finn is a timeless classic, navigating the Mississippi River with Huck and Jim. Mark Twain''s vivid storytelling and social commentary make it an enduring masterpiece of American literature.', 8.4);
insert into reviews (review_title, username, review, rating) values ('Review of Romeo and Juliet', 'BookLover', 'Romeo and Juliet, a timeless classic by William Shakespeare, beautifully captures the essence of tragic love, poignant sacrifice, and feuding families, creating an enduring masterpiece of literature.', 9.9);
insert into reviews (review_title, username, review, rating) values ('Review of Dracula', 'BookLover', 'Dracula by Bram Stoker is a timeless masterpiece, weaving suspense and horror into a captivating narrative. Stoker''s gothic masterpiece introduces the iconic Count Dracula, leaving readers spellbound with its chilling atmosphere.', 7.8);
insert into reviews (review_title, username, review, rating) values ('My thoughts on Huckleberry Finn', 'LunaExplorer', 'I thought ''Huckleberry Finn'' offered a nuanced exploration of societal norms and racial dynamics in 19th-century America. The timeless themes and complexities of the central characters resonated with me, showcasing Mark Twain''s insightful commentary on the era.', 8.7);
insert into reviews (review_title, username, review, rating) values ('What I thought about Romeo and Juliet', 'SkyPioneer', 'I thought ''Romeo and Juliet'' provided a poignant portrayal of love and tragedy. The timeless themes and the tragic fate of the titular characters resonated with me, showcasing Shakespeare''s enduring exploration of the complexities of human emotion.', 8.2);
insert into reviews (review_title, username, review, rating) values ('My favorite book of all time', 'EmberSeeker', 'I LOVED this book and it means SO much to me. The story is always so unexpected every single time and I can''t imagine where I would be without reading it', 10);
insert into reviews (review_title, username, review, rating) values ('My least favorite book', 'QuantumCoder', 'This book was HORRIBLE. I don''t understand how SO many people love this book. I think it is extremely overrated and doesn''t deserve the hype.', 1);

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
insert into books_to_reviews(book_id, review_id) values (3,6);
insert into books_to_reviews(book_id, review_id) values (4,7);
insert into books_to_reviews(book_id, review_id) values (4,8);
insert into books_to_reviews(book_id, review_id) values (4,9);

insert into reviews_to_users(user_id, review_id) values (1,1);
insert into reviews_to_users(user_id, review_id) values (1,2);
insert into reviews_to_users(user_id, review_id) values (1,3);
insert into reviews_to_users(user_id, review_id) values (1,4);
insert into reviews_to_users(user_id, review_id) values (1,5);
insert into reviews_to_users(user_id, review_id) values (2,6);
insert into reviews_to_users(user_id, review_id) values (4,7);
insert into reviews_to_users(user_id, review_id) values (5,8);
insert into reviews_to_users(user_id, review_id) values (3,9);
