require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const bodyParser = require('body-parser');
const app = express();


// Basic Configuration
const port = process.env.PORT || 3000;

function isValidUrl(url) {
  return /^(http|https):\/\/[^ "]+$/.test(url);
}

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

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
