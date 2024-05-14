const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

let cookieParser = require('cookie-parser');
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

let generateRandomString = function() {
  //generates a random 6 character string
  let result = "";
  let characters = Math.random() * 10;
  result = characters.toString(36);
  result = result.slice(2, 8);
  return result;
};

app.use(express.urlencoded({ extended: true }));

//req = request, res = response
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  /*
  console.log(req.body); // Log the POST request body to the console
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
  */
  const shortURL = generateRandomString(); //generates a random 6 character string
  urlDatabase[shortURL] = req.body.longURL; //adds the new URL to the database
  res.redirect(`/urls/${shortURL}`); //redirects to the new URL

});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//params is a property of the request object
app.post("/urls/:id/delete", (req, res) => {
  const tempId = req.params.id;
  delete urlDatabase[tempId]; //deletes the URL from the database
  res.redirect("/urls"); //redirects to the URLs page
});

//Add a POST route that updates a URL resource; POST /urls/:id and have it update the value of your stored long URL based on the new value in req.body. Finally, redirect the client back to /urls.
app.post("/urls/:id/edit", (req, res) => {
  const tempId = req.params.id;
  urlDatabase[tempId] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const username = req.body.username; //gets the username from the form the user inputs the username
  res.cookie("username", username); //sets the cookie with the username
  res.redirect("/urls"); //redirects to the URLs page
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});