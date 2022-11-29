import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import dns from 'dns';
import bodyParser from 'body-parser';
import morgan from 'morgan';
const app = express();

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// File path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');

// Configure lowdb to write to JSONFile
const adapter = new JSONFile(file);
const db = new Low(adapter);

// Read data from JSON file, this will set db.data content
await db.read();

// If db.json doesn't exist, db.data will be null
// Use the code below to set default data
// db.data = db.data || { posts: [] } // For Node < v15.x
db.data ||= { urls: [] }	           // For Node >= 15.x

// Create and query items using native JS API
// db.data.posts.push('hello world')
// const firstPost = db.data.posts[0]

// Alternatively, you can also use this syntax if you prefer
const { urls } = db.data
// urls.push({original_url: 'google.es', short_url: urls.length + 1 });
// posts.push('hello world')

// Finally write db.data content to file
await db.write()


// Basic Configuration
const port = process.env.PORT || 3000;

function isValidUrl(url) {
  return /^(http|https):\/\/[^ "]+$/.test(url);
}

async function addUrlToDb(str) {
	db.data
	.urls
	.push({ original_url: str, short_url: urls.length + 1 });
	await db.write();
}

app.use(morgan('dev'));
app.use(cors());
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const jsonParser = bodyParser.json();

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', urlencodedParser, async (req, res, next) => {
  // console.log(req.body.url);
  const getURL = req.body.url;
  console.log(getURL);
  const checkURL = isValidUrl(getURL);
  console.log(checkURL);
  if (checkURL) {		
		// addUrlToDb(getURL);
			// console.log(urls[urls.length + 1]['short_url']);
			// console.log(urls['short_url']);
			// console.log(urls.original_url);
			// console.log(urls.short_url);
			// console.log(urls['original_url']);
			// console.log(urls['short_url']);
    try {
			// dns.lookup(url, (err, address, family) => {
			// console.log(url);
			// err == null ? res.json({ error: 'invalid URL' }) : res.json({ original_url : 'https://freeCodeCamp.org', short_url : 1});         
			res.json({ original_url : getURL, short_url : 1});         
			// };
    } catch (error) {
      res.json({ error: 'invalid url' });
    }
  } else {
    res.json({ error: 'invalid url' });
  }  
});  

app.get('/api/shorturl/:id', (req, res) => {
	let id = req.params.id;
	// console.log(id);
	// function findShortUrl(id) {
	// 	return urls.short_url === id;
	// }
	// console.log(urls);
	// console.log(urls.find(findShortUrl));
	const result = urls.find(({ short_url }) => short_url == id);
	// console.log(result.original_url);
	
	// console.log(id);
	// console.log(urls);
	// console.log(urls[id + 1]);
	// let getURL = JSON.parse(db.data);
	// console.log(urls);
	
	// let findURLById = db.data.find(url => url['short_url'] === id);
	// console.log(findURLById);
	// res.redirect(findURLById.original_url);
	res.redirect(result.original_url); 
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
