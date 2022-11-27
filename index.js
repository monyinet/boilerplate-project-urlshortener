import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import dns from 'dns';
import bodyParser from 'body-parser';
import morgan from 'morgan';
const app = express();

import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'

// File path
const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json')

// Configure lowdb to write to JSONFile
const adapter = new JSONFile(file)
const db = new Low(adapter)

// Read data from JSON file, this will set db.data content
await db.read()

// If db.json doesn't exist, db.data will be null
// Use the code below to set default data
// db.data = db.data || { posts: [] } // For Node < v15.x
db.data ||= { posts: [] }             // For Node >= 15.x

// Create and query items using native JS API
db.data.posts.push('hello world')
const firstPost = db.data.posts[0]

// Alternatively, you can also use this syntax if you prefer
const { posts } = db.data
posts.push('hello world')

// Finally write db.data content to file
await db.write()


// Basic Configuration
const port = process.env.PORT || 3000;

function isValidUrl(url) {
  return /^(http|https):\/\/[^ "]+$/.test(url);
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

app.post('/api/shorturl', urlencodedParser, (req, res, next) => {
  // console.log(req.body);
  const url = req.body.url;
  const checkUrl = isValidUrl(url);
  console.log(checkUrl);
  if (checkUrl) {		
    try {
      dns.lookup(url, (err, address, family) => {				
        err == null ? res.json({ error: 'invalid URL' }) : res.json({ original_url: url, short_url: 1 });         
      });
    } catch (error) {
      res.json({ error: 'invalid url' });
    }
  } else {
    res.json({ error: 'invalid url' });
  }  
});  

app.get('/api/shorturl/:id', (req, res) => {
	let id = req.params.id;
	if (id == 1) {
		res.redirect('freecodecamp.org')
	}
	console.log(id);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
