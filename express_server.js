const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const { getUserByEmail } = require('./helpers');
const bcrypt = require("bcryptjs");


app.use(express.urlencoded({extended:false}));
// add this line
app.use(express.json());


let cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['asjkldfhjkasdhfjkahs'],

}));


app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },

};

let generateRandomString = function() {
  //generates a random 6 character string
  let result = "";
  let characters = Math.random() * 10;
  result = characters.toString(36);
  result = result.slice(2, 8);
  return result;
};

let urlsForUser = function(id) {
  let result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};



app.use(express.urlencoded({ extended: true }));

//req = request, res = response
app.get("/", (req, res) => {
  if (users[req.session.user_id] && req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.status(302).redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  
  if (!users[req.session.user_id]) {

    res.redirect("/login");
  }
  
  
  const user = users[id];
  let result = {};
  //filter the database and put the result
  for (let urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      result[urlId] = urlDatabase[urlId];
    }
  }
  
  res.render("urls_index", {user, database: result});
  
});

app.get("/urls/new", (req, res) => {
  const database = urlDatabase[req.params.id]; //gets the URL from the database
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  }
  const user = users[req.session.user_id];
  const templateVars = { user, database};
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const database = urlDatabase[req.params.id];
  const user = users[req.session.user_id];
  if (!users[req.session.user_id]) {
    res.status(403).send("Please login or register to shorten an URL");
  }
  //Ensure the GET /urls/:id page returns a relevant error message to the user if they do not own the URL.

  if (!urlsForUser(req.session.user_id)) {
    res.status(403).send("You do not own this URL");
  }
  const templateVars = { user, id: req.params.id,  database};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  
  if (!users[req.session.user_id]) {
    res.status(403).send("Please login or register to shorten an URL");
  } else {
    const shortURL = generateRandomString(); //generates a random 6 character string
    //updating the database object with the new URL
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    
    res.redirect(`/urls/${shortURL}`); //redirects to the new URL
  }
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  
  const userId = req.params.id;
  if (!urlDatabase[userId]) {
    res.status(403).send("URL not found");
  }
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//params is a property of the request object
app.post("/urls/:id/delete", (req, res) => {
  if (urlsForUser(req.session.user_id)) {
    const tempId = req.params.id;
    delete urlDatabase[tempId]; //deletes the URL from the database
    res.redirect("/urls"); //redirects to the URLs page
  }
});

//Add a POST route that updates a URL resource; POST /urls/:id and have it update the value of your stored long URL based on the new value in req.body. Finally, redirect the client back to /urls.
app.post("/urls/:id/edit", (req, res) => {
  if (urlsForUser(req.session.user_id)) {
    const tempId = req.params.id;
    const longURL = req.body.longURL;
    
    if (urlDatabase[tempId]) {
      urlDatabase[tempId].longURL = longURL;
      res.redirect("/urls");
    }
    res.status(403).send("URL not found");
  }
  res.status(403).send("You do not own this URL");
  
});

//body is a property of the request object
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  
  let isUserFound = false;
  if (!email || !password || !getUserByEmail(email, users)) {
    res.status(403).send("Incorrect email or password");
  }
  for (let user in users) {
    let hashed = users[user]["password"];
    
    let compare = bcrypt.compareSync(password, hashed);
    if (users[user].email === email && compare) {
      isUserFound = true;
      
      req.session.user_id = users[user].id;
      res.redirect("/urls");
      break;
    }
  }

  if (!isUserFound) {
    res.status(403).send("Incorrect email or password");
  }
});

app.post("/logout", (req, res) => {
  
  req.session = null;
  res.redirect("/login"); //redirects to the login page
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  const user = users[req.session.user_id];
  const templateVars = { user };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  let userId = generateRandomString(); //To generate a random user ID, use the same function you use to generate random IDs for URLs.
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = { id: userId, email, password: hashedPassword };
  if (!email || !password) {
    res.status(403).send("Email and password cannot be empty");
  }
  
  if (getUserByEmail(email, users)) {
    res.status(403).send("Email already exists");
    
  }
  users[userId] = user; //Add the new user object to the users object.
  req.session.user_id = userId;
  
  res.redirect("/urls"); //redirects to the URLs page
});

app.get("/login", (req, res) => {
  if (users[req.session.user_id]) {
    res.redirect("/urls");
  }
  const user = users[req.session.user_id];
  const templateVars = { user };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});