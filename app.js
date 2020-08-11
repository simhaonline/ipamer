const express = require('express');
require('dotenv').config();
const exphbs = require('express-handlebars');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const host = `${process.env.HOST}`

// link to static public files
app.use(express.static(path.join(__dirname, 'public')));

// Handlebars Middleware
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// BodyParser Middleware
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());

// Express-Session Middleware
app.use(session({
  secret: 'endeavor',
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  },
  resave: true,
  saveUninitialized: true
}));

// Cookie-Parser Middleware
app.use(cookieParser());

// Flash Middleware
app.use(flash());

// global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.get('/', (req, res) => {
  res.render('index.handlebars');
});

app.get('/search', (req, res) => {
  (async () => {
    let url
    const limit = req.query.limit ? req.query.limit : false
    const offset = req.query.offset ? req.query.offset : false
    const name = req.query.name__ic ? req.query.name__ic : false
    if (limit && offset && name) {
      url = `${host}/api/tenancy/tenants/?limit=${limit}&name__ic=${name}&offset=${offset}`
    } else if (limit && offset) {
      url = `${host}/api/tenancy/tenants/?limit=${limit}&offset=${offset}`
    } else if (name) {
      url = `${host}/api/tenancy/tenants/?name__ic=${name}`
    } else {
      url = '${host}/api/tenancy/tenants/'
    }
    const response = await fetch(url, {
      headers: {'Authorization': `Token ${process.env.NETBOX_API_KEY}`}
    })
    
    const sites = await response.json()
    res.render('search', {
      sites
    })
  })();
});

// load routes
const addresses = require('./routes/addresses');
const customers = require('./routes/customers');

// use routers
app.use('/addresses', addresses);
app.use('/customers', customers);

server.listen(8080, () => {
  console.log('Server Listening on Port 8080...');
});