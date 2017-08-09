# WebCrawler
A simple web crawler with nodejs, express and mongodb

# How to run the code
install node:
https://nodejs.org/en/

install mongo:
https://www.mongodb.org/downloads

mongo configuration:
The last part of this page
http://docs.mongodb.org/manual/tutorial/install-mongodb-on-os-x/
The key part is that a folder \data\db needs to be created.

Run below commmand in terminal:

npm install 


To run the app:
at the project directory, run:

node ./httpServer.js

# About the project:
There are 2 pages in the frontend(simple hbs files):
1) input URL from user
2) the results page

Backend(express framework,nodejs and mongodb):

1) When user submit a URL then the Server will first check the database. If this URL already has a path lead to Philosophy page. Then it just print the path from database. Otherwise, it will do the crawl function.


2) the crawl function is basically using BSF method. We maintain a queue for visiting links. To avoid stucking in a loop:

First, I define a pagesVisited variable which will store the page I have visted and each time when a new link I try to visit, I will check if this page has already been visited or not.

Second I define MAX_PAGES_TO_VISIT to 100 which will terminate the program when there are too many links and we still can not find the results.

3) I also write a regular expression to ignore citations/sound/extraneous links.
