const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json()); // for parsing application/json

// ------ WRITE YOUR SOLUTION HERE BELOW ------//

let users = []
let authorizedTokens = []
let highScores = []

app.post("/signup", (req, res) => {
  const username = req.body.userHandle;
  const password = req.body.password;
  if (!username || !password || username.length < 6 || password.length < 6 || typeof username !== "string" || typeof password !== "string") {
    res.status(400).send("Invalide request body");
    return;
  }
  users.push({ username, password });
  console.log(users);
  res.status(201).send("User registered successfully");
});

app.post("/login", (req, res) => {
  const username = req.body.userHandle;
  const password = req.body.password;
  if (!username || !password || username.length < 6 || password.length < 6 || typeof username !== "string" || typeof password !== "string") {
    res.status(400).send("Bad Request");
    return;
  }

  if (Object.keys(req.body).length !== 2) {
    res.status(400).send("Bad Request");
    return;
  }
  const user = users.find((user) => user.username === username && user.password === password);
  if (!user) {
    res.status(401).send("Unauthorized, incorrect username or password");
    return;
  }

  const token = username + Date.now();
  authorizedTokens.push(token);
  res.status(200).json({ "jsonWebToken": token });
});

app.post("/high-scores", (req, res) => {
  const authorizationField = req.headers.authorization;
  if (!authorizationField) {
    res.status(401).send("Unauthorized, JWT token is missing or invalid");
    return;
  }
  const token = authorizationField.split(" ")[1];
  if (!authorizedTokens.includes(token)) {
    res.status(401).send("Unauthorized, JWT token is missing or invalid");
    return;
  }
  console.log(req.body);
  const level = req.body.level;
  const username = req.body.userHandle;
  const score = req.body.score;
  const timestamp = req.body.timestamp;
  if (!level || !username || !score || !timestamp) {
    res.status(400).send("Invalid request body");
    return;
  }
  highScores.push({ level, username, score, timestamp });
  res.status(201).send("High score posted successfully");
});

app.get("/high-scores", (req, res) => {
  const level = req.query.level;
  let page = req.query.page;
  if (!page) {
    page = 1;
  }
  const highScoresFiltered = highScores.filter((highScore) => highScore.level === level);
  const highScoresPage = highScoresFiltered.slice((page - 1) * 20, page * 20);
  highScoresPage.sort((a, b) => b.score - a.score);
  res.status(200).json(highScoresPage);
});

//------ WRITE YOUR SOLUTION ABOVE THIS LINE ------//

let serverInstance = null;
module.exports = {
  start: function () {
    serverInstance = app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  },
  close: function () {
    serverInstance.close();
  },
};