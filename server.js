// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);
const shortid = require("shortid");

// Set some defaults (required if your JSON file is empty)
db.defaults({ books: [] })
  .write()

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.get("/", function(req, res) {
  res.render('index');
});


//default books view and search
app.get("/books", (req, res) => {
  var q = req.query.q;
  if (!q) {
    res.render("books", {
      books: db.get('books').value()
    });
  } else {
    var matchedLists = db.get('books').value().filter(function(book) {
      return book['title'].toLowerCase().indexOf(q.toLowerCase()) !== -1;
    });
    res.render("books", {
      books: matchedLists
    });
  }
});

//delete book
app.get('/books/delete/:id', function(req, res) {
  var id = req.params.id;
  db.get('books').remove({id: id}).write();
  res.redirect('/books');
});
//update book
app.get('/books/update/:id', function(req, res) {
  var id = req.params.id;
  var book = db.get('books').find({ id: id }).value()
  res.render('update', {
    book: book
  });
});
app.post('/books/update/:id', function(req, res) {
  var id = req.params.id;
  var title = req.body.title;
  var description = req.body.description;
  db.get('books')
    .find({ id: id })
    .assign({ title: title, description: description})
    .write()
  res.redirect('/books');
});
//create new book
app.post('/create', function(req, res) {
  req.body.id = shortid.generate();
  db.get('books').push(req.body).write();
  res.redirect('/books');
});


// // our default array of dreams
// const dreams = [
//   "Find and count some sheep",
//   "Climb a really tall mountain",
//   "Wash the dishes"
// ];

// // make all the files in 'public' available
// // https://expressjs.com/en/starter/static-files.html
// app.use(express.static("public"));

// // https://expressjs.com/en/starter/basic-routing.html
// app.get("/", (request, response) => {
//   response.sendFile(__dirname + "/views/index.html");
// });

// // send the default array of dreams to the webpage
// app.get("/dreams", (request, response) => {
//   // express helps us take JS objects and send them as JSON
//   response.json(dreams);
// });

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
