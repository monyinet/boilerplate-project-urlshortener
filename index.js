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
await db.read();

db.data ||= { urls: [] };
const { urls } = db.data;
await db.write();

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

app.post('/api/shorturl', urlencodedParser, async (req, res, next) => {
  const getURL = req.body.url;
  const checkURL = isValidUrl(getURL);
  if (checkURL) {
	addUrlToDb(getURL);
    try {
			res.json({ original_url : getURL, short_url : urls.length});
    } catch (error) {
      res.json({ error: 'invalid url' });
    }
  	} else {
    	res.json({ error: 'invalid url' });
  	}  
	});

app.get('/api/shorturl/:id', (req, res) => {
	let id = req.params.id;
	const findUrl = urls.find(({ short_url }) => short_url == id);
	res.redirect(findUrl.original_url);
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});