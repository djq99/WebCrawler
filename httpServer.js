const express = require('express')
const exphbs = require('express-handlebars')

var path = require('path');
var bodyParser = require('body-parser')
var request = require('request');
var cheerio = require('cheerio');
var URL = require('url-parse');

var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/webcrawler');
var db = mongoose.connection;
var reference = require('./models/reference')


var MAX_PAGES_TO_VISIT = 100;

var pagesVisited = {};
var numPagesVisited = 0;
var pagesToVisit = [];
var baseUrl;

var SEARCH_SITE = "https://en.wikipedia.org/wiki/Philosophy";

const app = express()

const port = 3000

app.engine('.hbs', exphbs({
	extname: '.hbs',
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.use(bodyParser.urlencoded({
	extended: true
}));

//Get method for the home page
app.get('/', function(req, res){
	res.render('index.hbs')
})




//POST method for the form
app.post('/',function (req,res) {
	var start_link = req.body.start_link;
	if(start_link == null || start_link.length == 0){
		res.send("Error : this link can not be null");
	}
	else{
		reference.getLinks(start_link,function (err,references) {
			if(err) throw err;
			if(references != null){
				res.render('results.hbs',{path:references.links,hops:references.links.length});
			}
			else{
				var page = new Object();
				page.link = start_link;
				page.parent = null;
				pagesToVisit.push(page);
				var url = new URL(start_link);
				baseUrl = url.protocol + "//" + url.hostname;
				crawl(start_link,function(path){
					console.log(path);
					res.render('results.hbs',{path:path,hops:path.length});
				});

			}
		})

	}
})


function crawl(start_link,callback){
	if(numPagesVisited >= MAX_PAGES_TO_VISIT) {
		console.log("Reached max limit of number of pages to visit.");
		return;
	}
	// we are using BFS to collect related links
	// var curPage = pagesToVisit.pop();
	//if we do pop() method will be DFS.
	var curPage = pagesToVisit.shift();
	if(curPage.link in pagesVisited){
		crawl(start_link,callback);
	}else{
		pagesVisited[curPage.link] = true;
		numPagesVisited++;

		console.log("Visiting page " + curPage.link);
		request(curPage.link, function(error, response, body) {
			// Check status code (200 is HTTP OK)
			console.log("Status code: " + response.statusCode);
			if(response.statusCode !== 200) {
				crawl(start_link,callback);
				return;
			}
			// Parse the document body
			var $ = cheerio.load(body);
			if(SEARCH_SITE == curPage.link) {
				console.log('Philosophy site' + 'has been found at page ' + curPage.link);
				var path = []
				while(curPage!= null){
					path.push(curPage.link);
					curPage = curPage.parent;
				}
				var record = {
					URL : start_link,
					links : path
				}
				reference.saveLinks(record,function (cb) {

				})
				return callback(path);


			} else {
				collectInternalLinks($, curPage);
				crawl(start_link,callback);
			}
		});
	}
}


function collectInternalLinks($, curPage) {
	var relativeLinks = $("a[href^='/']");
	// console.log("Found " + relativeLinks.length + " relative links on page");
	relativeLinks.each(function() {
		var link = $(this).attr('href');
		if(link.includes(":") || link.includes(".")  || link.includes("?")  || link.includes("=")) {

		}
		else{
			var page = new Object();
			page.link = baseUrl + $(this).attr('href');
			page.parent = curPage;
			pagesToVisit.push(page);
		}
	});
}

app.listen(port, function(err) {
	if (err) {
		return console.log('something bad happened', err)
	}

	console.log(`server is listening on ${port}`)
})